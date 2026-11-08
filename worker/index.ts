// Worker solo para QA en Cloudflare: los Static Assets responden 200 con el
// archivo completo aunque pidan un rango, y Safari exige 206 para reproducir
// video. wrangler.jsonc enruta aquí únicamente los MP4 (`run_worker_first`).

import sizes from './sizes.json';

declare class FixedLengthStream extends TransformStream<Uint8Array, Uint8Array> {
  constructor(length: number);
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

// Devuelve [inicio, fin] inclusive, 'invalid' si no se puede satisfacer o null
// si no hay que aplicar rango (sin cabecera o varios rangos: va el archivo entero).
function parseRange(header: string | null, size: number): [number, number] | 'invalid' | null {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, first, last] = match;
  if (!first && !last) return 'invalid';

  if (!first) {
    const suffix = Number(last);
    return suffix > 0 && size > 0 ? [Math.max(size - suffix, 0), size - 1] : 'invalid';
  }
  const start = Number(first);
  if (start >= size) return 'invalid';
  const end = last ? Math.min(Number(last), size - 1) : size - 1;
  return start <= end ? [start, end] : 'invalid';
}

// Copia solo los bytes [start, end] y corta la descarga del asset al terminar.
async function copyRange(
  body: ReadableStream<Uint8Array>,
  writable: WritableStream<Uint8Array>,
  start: number,
  end: number,
) {
  const reader = body.getReader();
  const writer = writable.getWriter();
  let position = 0;
  try {
    while (position <= end) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkStart = position;
      position += value.length;
      if (position <= start) continue;
      await writer.write(
        value.subarray(Math.max(start - chunkStart, 0), Math.min(end + 1 - chunkStart, value.length)),
      );
    }
    await writer.close();
  } catch (error) {
    await writer.abort(error);
  } finally {
    await reader.cancel();
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');

    // env.ASSETS no expone Content-Length: el tamaño viene de sizes.json.
    const size = (sizes as Record<string, number>)[new URL(request.url).pathname] ?? 0;
    const ifRange = request.headers.get('If-Range');
    const rangeHeader = ifRange && ifRange !== asset.headers.get('ETag') ? null : request.headers.get('Range');
    const range = asset.status === 200 && size > 0 ? parseRange(rangeHeader, size) : null;

    if (!range) return new Response(asset.body, { status: asset.status, headers });

    if (range === 'invalid') {
      await asset.body?.cancel();
      headers.delete('Content-Length');
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const [start, end] = range;
    const length = end - start + 1;
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(length));

    if (request.method === 'HEAD' || !asset.body) {
      return new Response(null, { status: 206, headers });
    }

    const { readable, writable } = new FixedLengthStream(length);
    ctx.waitUntil(copyRange(asset.body, writable, start, end));
    return new Response(readable, { status: 206, headers });
  },
};
