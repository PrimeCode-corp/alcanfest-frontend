import { Fragment, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { experiences } from '../../config/event';
import { cn } from '../../lib/cn';

/*
 * Slider de experiencias, inspirado en los "pilares" de Lolla:
 * - El escenario queda fijo (sticky) mientras se hace scroll; cada slide ocupa una pantalla de recorrido.
 * - Entrada (ligada al scroll): la foto de fondo pasa de 80% de ancho, un poco abajo y casi
 *   transparente, a pantalla completa; el collage central crece de 0 a 1.
 * - El titular sube palabra por palabra desde una máscara al entrar la sección.
 * - Cambio de slide: el fondo actual sale hacia arriba y el siguiente entra desde abajo,
 *   el collage se encoge/crece, el texto sale hacia arriba y el recuadro cambia de color.
 */

type SlideState = 'prev' | 'current' | 'next';

const DESKTOP_QUERY = '(min-width: 62rem)'; // 992px, mismo corte que Lolla

function useExperienceScroll(
  wrapperRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  count: number,
) {
  const [current, setCurrent] = useState(0);
  const [headingShown, setHeadingShown] = useState(false);

  useEffect(() => {
    const raf = { id: 0 };

    const update = () => {
      raf.id = 0;
      const wrapper = wrapperRef.current;
      const stage = stageRef.current;
      if (!wrapper || !stage) return;
      const vh = window.innerHeight;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
      const top = wrapper.getBoundingClientRect().top;
      const clamp = (n: number, min = 0, max = 1) => Math.min(Math.max(n, min), max);

      // Entrada: desde que la sección está a mitad de pantalla hasta que llega al 10% superior
      const entry = clamp((vh * 0.5 - top) / (vh * 0.4));
      stage.style.setProperty('--e', String(entry));

      // El titular aparece cuando la sección llega al 20% superior (y se queda, como en Lolla)
      if (top <= vh * 0.2) setHeadingShown(true);

      // Slide activo: uno por cada pantalla de scroll con el escenario fijo
      const pinned = headerH - top;
      setCurrent(clamp(Math.floor(pinned / vh + 0.3), 0, count - 1));
    };

    const onScroll = () => {
      if (!raf.id) raf.id = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf.id);
    };
  }, [wrapperRef, stageRef, count]);

  return { current, headingShown };
}

export function Experiences() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { current, headingShown } = useExperienceScroll(wrapperRef, stageRef, experiences.length);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const stateOf = (i: number): SlideState => (i < current ? 'prev' : i === current ? 'current' : 'next');
  const boxColor = experiences[current]?.color;

  return (
    <section
      id='experiencias'
      ref={wrapperRef}
      aria-label='Experiencias del festival'
      className='relative bg-ink text-ink'
      // Recorrido: una pantalla por slide + 30% extra al final (como el último trigger de Lolla)
      style={{ height: `calc(${experiences.length} * 100svh + 30svh)` }}
    >
      <div
        ref={stageRef}
        className='sticky top-(--header-h) h-[calc(100svh-var(--header-h))] overflow-hidden'
      >
        {/* Fotos de fondo */}
        {experiences.map((slide, i) => (
          <div key={slide.background} aria-hidden='true' className='absolute inset-0 flex items-center justify-center overflow-hidden'>
            <picture className='contents'>
              {slide.backgroundMobile && <source media='(max-width: 479px)' srcSet={slide.backgroundMobile} />}
              <img
                src={slide.background}
                alt=''
                loading='lazy'
                style={backgroundStyle(i, stateOf(i), isDesktop)}
                className='h-full object-cover transition-[width,translate,opacity] duration-600 ease-snap'
              />
            </picture>
          </div>
        ))}

        {/* Collage central + titular */}
        {experiences.map((slide, i) => {
          const state = stateOf(i);
          return (
            <div key={slide.title} className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <div className='flex h-72 w-[min(26.5rem,90vw)] flex-col items-center justify-end sm:h-88 lg:h-100 lg:w-[min(30rem,55svh)]'>
                {/* Collage: su parte baja queda detrás del recuadro */}
                <div className='flex aspect-[1.4] w-[110%] shrink-0 translate-y-[30%] items-center justify-center sm:w-[130%]'>
                  <img
                    src={slide.image}
                    alt=''
                    loading='lazy'
                    style={centralStyle(i, state)}
                    className='w-full transition-[scale,opacity] duration-600 ease-snap'
                  />
                </div>

                {/* Recuadro sólido del titular */}
                <div
                  style={{ backgroundColor: boxColor }}
                  className='relative z-10 flex w-full shrink-0 flex-col items-center justify-end px-8 pt-8 pb-4 text-center lg:px-9 lg:pt-9 lg:pb-4 transition-[background-color] duration-400'
                >
                  <h3
                    className='font-display text-[clamp(1.85rem,3.4vw,2.5rem)] lg:text-[clamp(2.25rem,3.2vw,2.85rem)] leading-[0.95] font-black uppercase'
                    aria-hidden={state !== 'current'}
                  >
                    <MaskedWords text={slide.title} state={state} shown={headingShown} />
                  </h3>
                </div>
                {/* Borde inferior rasgado, del mismo color que el recuadro */}
                <TornEdge color={boxColor} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Fondo: el primero usa la entrada ligada al scroll (--e); los demás, el estado del slide. */
function backgroundStyle(i: number, state: SlideState, isDesktop: boolean): CSSProperties {
  if (i === 0 && state === 'current') {
    return {
      width: 'calc(80% + 20% * var(--e, 1))',
      translate: '0 calc((1 - var(--e, 1)) * 10%)',
      opacity: 'calc(0.1 + 0.9 * var(--e, 1))',
    };
  }
  const shrunk = isDesktop ? '80%' : '100%';
  if (state === 'current') return { width: '100%', translate: '0 0' };
  if (state === 'prev') return { width: shrunk, translate: '0 -110%' };
  return { width: shrunk, translate: '0 110%' };
}

function centralStyle(i: number, state: SlideState): CSSProperties {
  if (state !== 'current') return { scale: '0', opacity: 0 };
  if (i === 0) return { scale: 'var(--e, 1)', opacity: 'var(--e, 1)' };
  return { scale: '1', opacity: 1 };
}

/**
 * Titular con cada palabra en su propia máscara: todas suben a la vez, así que se ve
 * igual que la máscara por línea de Lolla, sin tener que medir dónde corta cada línea.
 */
function MaskedWords({ text, state, shown }: { text: string; state: SlideState; shown: boolean }) {
  const visible = state === 'current' && shown;
  return (
    <>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className='inline-block overflow-hidden align-bottom'>
          <span
            className={cn(
              'inline-block transition-[translate,opacity] ease-snap',
              visible ? 'translate-y-0 opacity-100 duration-1000' : 'duration-400',
              !visible && state === 'prev' && '-translate-y-full opacity-0',
              !visible && state !== 'prev' && 'translate-y-full',
            )}
          >
            {word}
          </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

function TornEdge({ color }: { color?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 520 32'
      preserveAspectRatio='none'
      className='relative z-10 -mt-px block h-6 w-full shrink-0 transition-[fill] duration-400 sm:h-8 lg:h-9'
      style={{ fill: color }}
    >
      <path d='M0 0 L13 14 L27 30 L35 12 L56 27 L65 21 L82 11 L104 26 L115 11 L124 23 L138 12 L149 12 L165 23 L173 28 L182 17 L200 30 L217 11 L234 28 L248 11 L259 11 L275 14 L287 23 L297 27 L306 28 L318 27 L339 15 L348 28 L365 30 L376 21 L385 27 L404 12 L421 11 L438 16 L453 27 L467 20 L482 28 L504 24 L517 19 L520 15 L520 0 Z' />
    </svg>
  );
}
