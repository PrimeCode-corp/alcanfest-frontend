import { useEffect, useRef, useState, type ReactNode } from 'react';
import { event, spot } from '../../config/event';

/**
 * Video spot: se reproduce en silencio y en bucle mientras está en pantalla
 * (como en Lolla) y se pausa al salir. Si el usuario lo pausa, no se reanuda solo.
 * Con "reducir movimiento" activado no hay autoplay: se espera al botón.
 */
export function Spot() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reducedMotion && !userPausedRef.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    // Activar el sonido es intención de ver el video: si estaba pausado, reproducir
    if (!video.muted && video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    }
  };

  return (
    <section id='spot' aria-labelledby='spot-title' className='bg-ink text-paper'>
      {/* Video a todo el ancho de la pantalla */}
      <div className='relative w-full bg-ink'>
          <video
            ref={videoRef}
            src={spot.src}
            muted
            loop
            playsInline
            preload='metadata'
            aria-label={spot.description}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
            // Celular: formato reel (alto de pantalla menos el header), recortando los lados. Desde sm: 16:9
            className='block h-[calc(100svh-var(--header-h))] w-full cursor-pointer bg-ink object-cover sm:aspect-video sm:h-auto'
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
