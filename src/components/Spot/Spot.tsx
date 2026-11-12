import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react';
import { event, spot } from '../../config/event';

// Desde sm (640px) se usa el video horizontal; debajo, el reel vertical
const WIDE_QUERY = '(min-width: 40rem)';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type SpotHandle = { mute: () => void };

/**
 * Video spot: se reproduce en bucle y mantiene el audio al salir de pantalla.
 * Solo se pausa al salir si está silenciado. Si el usuario lo pausa, no se reanuda solo.
 * Con "reducir movimiento" activado no hay autoplay: se espera al botón.
 */
export function Spot({ ref, onSoundChange }: {
  ref?: Ref<SpotHandle>;
  onSoundChange: (active: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mirrorRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const userPausedRef = useRef(false);
  const userMutedRef = useRef(false);
  const activationCleanupRef = useRef<(() => void) | null>(null);
  const visibleRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Proporción real del video horizontal (se corrige al cargar sus metadatos)
  const [ratio, setRatio] = useState(16 / 9);
  const wide = useMediaQuery(WIDE_QUERY);

  // Relleno en reflejo: si la pantalla es más ancha que el video, a cada lado se dibuja el mismo cuadro
  // espejado en un canvas de fondo, pegado al borde del video. Un solo <video> decodifica; el canvas solo copia.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = mirrorRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wide || !video || !canvas || !ctx) return;

    const draw = () => {
      const { width: w, height: h } = canvas;
      if (!video.videoWidth || !w || !h) return;
      const vw = (h * video.videoWidth) / video.videoHeight;
      const left = (w - vw) / 2;
      if (left < 1) return;
      ctx.clearRect(0, 0, w, h);
      // Izquierda: espejo que termina en el borde izquierdo del video (escala -1 desde ese borde)
      ctx.setTransform(-1, 0, 0, 1, left, 0);
      ctx.drawImage(video, 0, 0, vw, h);
      // Derecha: espejo que empieza en el borde derecho del video
      ctx.setTransform(-1, 0, 0, 1, left + 2 * vw, 0);
      ctx.drawImage(video, 0, 0, vw, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const resize = () => {
      // Resolución 1:1 con los píxeles CSS: es relleno, no hace falta más y así cuesta poco por cuadro
      canvas.width = Math.round(canvas.clientWidth);
      canvas.height = Math.round(canvas.clientHeight);
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Un dibujo por cuadro nuevo del video; sin requestVideoFrameCallback, rAF mientras se reproduce
    const run = { stopped: false, handle: 0 };
    const hasRvfc = typeof video.requestVideoFrameCallback === 'function';
    const loop = () => {
      if (run.stopped) return;
      draw();
      if (hasRvfc) run.handle = video.requestVideoFrameCallback(loop);
      else if (!video.paused) run.handle = requestAnimationFrame(loop);
    };
    const restartRaf = () => {
      if (hasRvfc || run.stopped) return;
      cancelAnimationFrame(run.handle);
      run.handle = requestAnimationFrame(loop);
    };
    loop();
    video.addEventListener('loadeddata', draw);
    video.addEventListener('seeked', draw);
    video.addEventListener('play', restartRaf);

    return () => {
      run.stopped = true;
      if (hasRvfc) video.cancelVideoFrameCallback(run.handle);
      else cancelAnimationFrame(run.handle);
      resizeObserver.disconnect();
      video.removeEventListener('loadeddata', draw);
      video.removeEventListener('seeked', draw);
      video.removeEventListener('play', restartRaf);
    };
  }, [wide]);

  // Los navegadores solo dejan sonar un video sin clic si el usuario ya interactuó con la página (un toque, clic o
  // tecla; la rueda del mouse o deslizar no cuentan). Si se bloquea, sigue en silencio y el sonido se activa con la
  // primera interacción mientras el spot está en pantalla.
  const waitForActivation = () => {
    if (activationCleanupRef.current) return;
    const events = ['mousedown', 'touchend', 'keydown'] as const;
    const onActivate = (e: Event) => {
      // Los clics dentro del video ya los manejan sus propios botones (pausa, sonido)
      if (e.target instanceof Node && stageRef.current?.contains(e.target)) return;
      cleanup();
      const video = videoRef.current;
      if (!video || !visibleRef.current || userMutedRef.current || !video.muted) return;
      video.muted = false;
      if (!userPausedRef.current) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };
    const cleanup = () => {
      events.forEach((type) => window.removeEventListener(type, onActivate, true));
      activationCleanupRef.current = null;
    };
    events.forEach((type) => window.addEventListener(type, onActivate, true));
    activationCleanupRef.current = cleanup;
  };

  // Arranca al entrar o al cambiar de fuente con sonido activo, respetando las pausas manuales.
  const startPlayback = () => {
    const video = videoRef.current;
    if (
      !video ||
      (!visibleRef.current && video.muted) ||
      prefersReducedMotion() ||
      userPausedRef.current ||
      (!video.muted && !video.paused)
    ) return;
    if (userMutedRef.current) {
      video.muted = true;
      video.play().catch(() => {});
      return;
    }
    video.muted = false;
    video.play().catch(() => {
      // Sonido bloqueado por el navegador: reproducir en silencio y esperar una interacción
      video.muted = true;
      video.play().catch(() => {});
      waitForActivation();
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startPlayback();
        } else {
          if (video.muted) video.pause();
          activationCleanupRef.current?.();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      activationCleanupRef.current?.();
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  const setUserMuted = (nextMuted: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = nextMuted;
    // Silenciar a mano se respeta en las siguientes entradas a la sección
    userMutedRef.current = video.muted;
    activationCleanupRef.current?.();
    // Al silenciar fuera de pantalla ya no hace falta mantener la reproducción.
    if (video.muted && !visibleRef.current) video.pause();
    // Activar el sonido es intención de ver el video: si estaba pausado, reproducir
    if (!video.muted && video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) setUserMuted(!video.muted);
  };

  useImperativeHandle(ref, () => ({ mute: () => setUserMuted(true) }));

  return (
    <section id='spot' aria-labelledby='spot-title' className='@container bg-ink text-paper'>
      {/* Video a todo el ancho de la pantalla. Queda fijo y se apaga mientras Experiences sube encima, así la foto
          parece reemplazarlo. Celular: reel vertical a pantalla completa. Desde sm: el video horizontal entero, sin
          recortes; el escenario mide lo que el video a todo el ancho pero nunca más que la pantalla, y si sobra
          espacio a los lados se rellena con su reflejo (canvas de fondo). */}
      <div
        ref={stageRef}
        style={{
          opacity: 'calc(1 - 0.9 * var(--experiences-entry, 0))',
          ['--spot-ratio' as string]: ratio,
        }}
        className='sticky top-(--header-h) w-full overflow-hidden bg-ink sm:h-[min(100svh-var(--header-h),100cqw/var(--spot-ratio))]'
      >
          {wide && (
            <canvas
              ref={mirrorRef}
              aria-hidden='true'
              onClick={togglePlay}
              className='absolute inset-0 size-full cursor-pointer'
            />
          )}
          <video
            ref={videoRef}
            src={wide ? spot.src : spot.reelSrc}
            muted
            loop
            playsInline
            preload='metadata'
            aria-label={spot.description}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onVolumeChange={(e) => {
              const muted = e.currentTarget.muted;
              setMuted(muted);
              onSoundChange(!muted);
            }}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (wide && v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
            }}
            onLoadedData={startPlayback}
            onClick={togglePlay}
            // Celular: formato reel (alto de pantalla menos el header), cubriendo la pantalla.
            // Desde sm: alto del escenario y ancho según su proporción, centrado y sin recortar
            className='relative block h-[calc(100svh-var(--header-h))] w-full cursor-pointer bg-ink object-cover sm:mx-auto sm:aspect-(--spot-ratio) sm:h-full sm:w-auto sm:max-w-full sm:object-contain'
          />

          {/* Sombra superior para que los textos se lean sobre el video */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-ink/70 to-transparent'
          />

          {/* Textos en las esquinas superiores (no bloquean el clic sobre el video) */}
          <div className='pointer-events-none absolute inset-x-(--gutter) top-4 flex items-start justify-between gap-4 sm:top-6'>
            <p className='bg-magenta px-2.5 pt-1.5 pb-1 font-display text-sm font-extrabold tracking-[0.06em] whitespace-nowrap uppercase sm:px-3 sm:text-lg'>
              {spot.title} {event.edition}
            </p>
            <h2
              id='spot-title'
              className='text-right font-display text-[clamp(1.5rem,4.5vw,4rem)] leading-[0.9] font-black uppercase [text-shadow:0.05em_0.05em_0_var(--color-ink)]'
            >
              Vive el {event.name}
            </h2>
          </div>

          {/* Controles */}
          <div className='absolute bottom-4 left-(--gutter) flex gap-2 sm:bottom-6'>
            <ControlButton label={playing ? 'Pausar video' : 'Reproducir video'} onClick={togglePlay}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>
            <ControlButton label={muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute}>
              {muted ? <MutedIcon /> : <SoundIcon />}
            </ControlButton>
          </div>

          {/* Aviso de sonido mientras está en silencio */}
          {muted && (
            <button
              type='button'
              onClick={toggleMute}
              className='absolute right-(--gutter) bottom-4 hidden cursor-pointer border-2 border-ink bg-lime px-3 py-2 text-sm font-bold text-ink uppercase shadow-[3px_3px_0_var(--color-ink)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] sm:bottom-6 sm:block'
            >
              Ver con sonido
            </button>
          )}
      </div>
      {/* Recorrido del video fijo: va dentro de la sección porque sticky no cuenta el padding del padre */}
      <div aria-hidden='true' className='h-[calc(var(--experiences-overlap)+var(--spot-hold))]' />
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className='grid size-11 cursor-pointer place-items-center border-2 border-ink bg-paper text-ink shadow-[3px_3px_0_var(--color-magenta)] transition-[translate,box-shadow,background-color] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[5px_5px_0_var(--color-magenta)]'
    >
      {children}
    </button>
  );
}

const iconProps = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true } as const;

function PlayIcon() {
  return (
    <svg {...iconProps} fill='currentColor'>
      <path d='M7 4v16l13-8z' />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg {...iconProps} fill='currentColor'>
      <path d='M6 4h4v16H6zM14 4h4v16h-4z' />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg {...iconProps} fill='none' stroke='currentColor' strokeWidth={2.5} strokeLinecap='square'>
      <path d='M4 9h4l5-4v14l-5-4H4z' fill='currentColor' stroke='none' />
      <path d='M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12' />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg {...iconProps} fill='none' stroke='currentColor' strokeWidth={2.5} strokeLinecap='square'>
      <path d='M4 9h4l5-4v14l-5-4H4z' fill='currentColor' stroke='none' />
      <path d='M16 9l6 6M22 9l-6 6' />
    </svg>
  );
}
