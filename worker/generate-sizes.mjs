// Genera worker/sizes.json con el tamaño de cada MP4. Wrangler lo ejecuta antes
// de cada deploy (`build.command` en wrangler.jsonc), así no queda desactualizado.
import { readdirSync, statSync, writeFileSync } from 'node:fs';

const dir = new URL('../public/img/', import.meta.url);
const sizes = Object.fromEntries(
  readdirSync(dir)
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => [`/img/${name}`, statSync(new URL(name, dir)).size]),
);

writeFileSync(new URL('./sizes.json', import.meta.url), `${JSON.stringify(sizes, null, 2)}\n`);
