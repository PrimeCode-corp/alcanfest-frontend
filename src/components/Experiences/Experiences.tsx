import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject
} from 'react';
import { experiences } from '../../config/event';
import { cn } from '../../lib/cn';
import { Img } from '../Img/Img';

/*
 * Slider de experiencias, inspirado en los "pilares" de Lolla:
 * - El escenario queda fijo (sticky) mientras se hace scroll; cada slide ocupa una pantalla de recorrido.
 * - Entrada (ligada al scroll): la sección sube sobre el video fijo de Spot, que se apaga. La foto de fondo
 *   pasa de 80% de ancho, un poco abajo y casi transparente, a pantalla completa; el collage crece de 0 a 1.
 *   El progreso sigue al scroll con retardo (como el `scrub` de Lolla), para que el relevo se sienta lento.
 * - El titular sube palabra por palabra desde una máscara al entrar la sección.
 * - Cambio de slide: el fondo actual sale hacia arriba y el siguiente entra desde abajo,
 *   el collage se encoge/crece, el texto sale hacia arriba y el recuadro cambia de color.
 */

type SlideState = 'prev' | 'current' | 'next';

const DESKTOP_QUERY = '(min-width: 62rem)'; // 992px, mismo corte que Lolla
// Scroll necesario para pasar de un slide al siguiente, en pantallas (antes 1 = una pantalla entera)
const SLIDE_STEP = 0.45;
const MOBILE_QUERY = '(max-width: 39.99rem)'; // por debajo de sm (640px)
// Scroll con el video fijo antes de que suba la sección, en pantallas: a mayor valor, menos sensible.
// La entrada ya avanza en ese tramo, apagando el video. Igual a --spot-hold en index.css
const SPOT_HOLD = 0.4;
// La entrada termina a esta distancia del escenario fijo, en pantallas: el retardo la completa antes de que llegue
const ENTRY_LEAD = 0.15;
// Scroll con la foto ya completa antes del primer cambio de slide, en pantallas
const FIRST_SLIDE_HOLD = 0.35;
// Constante de tiempo del retardo: a mayor valor, más tarda la entrada en alcanzar al scroll
const ENTRY_SMOOTHING_MS = 200;

function useExperienceScroll(
  wrapperRef: RefObject<HTMLElement | null>,
  count: number
) {
  const [current, setCurrent] = useState(0);
  const [headingShown, setHeadingShown] = useState(false);

  useEffect(() => {
    const raf = { id: 0, smooth: 0 };
    const entry = { target: 0, shown: -1, last: 0 };
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Se escribe en el padre común (<main>): también la lee Spot para apagar el video
    const writeEntry = () =>
      wrapperRef.current?.parentElement?.style.setProperty('--experiences-entry', String(entry.shown));

    const smooth = (now: number) => {
      raf.smooth = 0;
      entry.shown += (entry.target - entry.shown) * (1 - Math.exp((entry.last - now) / ENTRY_SMOOTHING_MS));
      entry.last = now;
      if (Math.abs(entry.target - entry.shown) < 0.001) entry.shown = entry.target;
      writeEntry();
      if (entry.shown !== entry.target) raf.smooth = requestAnimationFrame(smooth);
    };

    const update = () => {
      raf.id = 0;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const vh = window.innerHeight;
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-h'
          )
        ) || 0;
      const top = wrapper.getBoundingClientRect().top;
      const clamp = (n: number, min = 0, max = 1) =>
        Math.min(Math.max(n, min), max);

      const headingAt = mobileQuery.matches ? 0.45 : 0.35;

      // Entrada: arranca con el video recién fijado y termina justo antes de fijarse el escenario.
      // Al cargar a mitad de página se aplica de una vez; después, con retardo
      const entryFrom = vh * (1 + SPOT_HOLD);
      const entryTo = headerH + vh * ENTRY_LEAD;
      entry.target = clamp((entryFrom - top) / (entryFrom - entryTo));
      if (entry.shown < 0 || reducedMotion) {
        entry.shown = entry.target;
        writeEntry();
      } else if (!raf.smooth && entry.shown !== entry.target) {
        entry.last = performance.now();
        raf.smooth = requestAnimationFrame(smooth);
      }

      // El titular aparece cuando la sección llega a ese punto (y se queda, como en Lolla)
      if (top <= vh * headingAt) setHeadingShown(true);

      // Slide activo: el primer cambio llega al terminar la entrada; luego, cada SLIDE_STEP pantallas de scroll
      const pinned = headerH - top - vh * FIRST_SLIDE_HOLD;
      setCurrent(clamp(Math.floor(pinned / (vh * SLIDE_STEP)) + 1, 0, count - 1));
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
      cancelAnimationFrame(raf.smooth);
    };
  }, [wrapperRef, count]);

  return { current, headingShown };
}

export function Experiences() {
  const wrapperRef = useRef<HTMLElement>(null);
  const { current, headingShown } = useExperienceScroll(
    wrapperRef,
    experiences.length
  );
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const stateOf = (i: number): SlideState =>
    i < current ? 'prev' : i === current ? 'current' : 'next';
  const boxColor = experiences[current]?.color;

  return (
    <section
      id='experiencias'
      ref={wrapperRef}
      aria-label='Experiencias del festival'
      // Se monta sobre el tramo final de Spot. Esa parte es transparente para que se vea el video; el resto, negro
      className='relative z-10 -mt-(--experiences-overlap) bg-[linear-gradient(to_bottom,transparent_var(--experiences-overlap),var(--color-ink)_var(--experiences-overlap))] text-ink'
      // Recorrido: el escenario (una pantalla) + la pausa antes del primer cambio + SLIDE_STEP por cada slide extra
      style={{ height: `calc(100svh + ${(FIRST_SLIDE_HOLD + (experiences.length - 1) * SLIDE_STEP) * 100}svh)` }}
    >
      <div
        // lvh (alto con la barra del navegador oculta): en celular el escenario siempre cubre la pantalla,
        // aunque la barra se esconda al hacer scroll. Con svh quedaba una franja negra abajo.
        className='sticky top-(--header-h) h-[calc(100lvh-var(--header-h))] overflow-hidden'
      >
        {/* Fotos de fondo */}
        {experiences.map((slide, i) => (
          <div
            key={slide.background}
            aria-hidden='true'
            className='absolute inset-0 flex items-center justify-center overflow-hidden'
          >
            <picture className='contents'>
              {slide.backgroundMobile && (
                <source
                  media='(max-width: 479px)'
                  srcSet={slide.backgroundMobile}
                />
              )}
              <Img
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
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
          {/* El alto lo fija el contenido más grande de todos los slides: así el recuadro no se mueve al cambiar */}
          <div className='flex w-[min(26.5rem,90vw)] -translate-y-[4svh] flex-col items-center lg:w-[min(30rem,55svh)]'>
            {/* Collages apilados en la misma celda y anclados abajo: su parte baja queda detrás del recuadro */}
            <div className='grid w-full grid-cols-[minmax(0,1fr)] items-end justify-items-center'>
              {experiences.map((slide, i) => (
                // Ancho = --cw × ancho del bloque. El margen negativo mete el 30% inferior del collage
                // detrás del recuadro (imageOverlap, 30% por defecto); se calcula con la proporción real de la imagen.
                <div
                  key={slide.image}
                  style={{
                    aspectRatio: slide.imageRatio ?? 1.4,
                    width: `calc(var(--cw) * ${slide.imageScale ?? 1} * 100%)`,
                    marginBottom: `calc(var(--cw) * ${slide.imageScale ?? 1} * -${(slide.imageOverlap ?? 0.3) * 100}% / ${slide.imageRatio ?? 1.4})`,
                    '--prota-shadow': slide.color, // la sombra del collage usa el color del recuadro de su slide
                  } as CSSProperties}
                  className='flex items-center justify-center [grid-area:1/1] [--cw:1.1] sm:[--cw:1.3]'
                >
                  <Img
                    src={slide.image}
                    alt=''
                    loading='lazy'
                    style={centralStyle(i, stateOf(i))}
                    className='w-full drop-shadow-[4px_4px_0_var(--prota-shadow)] transition-[scale,opacity] duration-600 ease-snap'
                  />
                </div>
              ))}
            </div>

            {/* Recuadro único: solo cambian el color y el titular. Los titulares comparten celda,
                así el recuadro siempre mide lo que el más largo. */}
            <div
              style={{ backgroundColor: boxColor }}
              className='relative z-10 grid w-full shrink-0 grid-cols-[minmax(0,1fr)] items-center px-8 pt-8 pb-4 text-center transition-[background-color] duration-400 lg:px-9 lg:pt-9 lg:pb-4'
            >
              {experiences.map((slide, i) => (
                // Desde lg el recuadro mide min(30rem, 55svh): en laptops bajas (768px de alto o menos) se angosta.
                // La letra se achica en la misma proporción (ancho útil × 0.11) para mantener los cortes de línea
                // de las pantallas grandes (3-4 líneas) en vez de partir el titular en 5.
                <h3
                  key={slide.title}
                  className='font-display text-[clamp(1.85rem,3.4vw,2.5rem)] leading-[0.95] font-black uppercase [grid-area:1/1] lg:text-[max(1.75rem,min(clamp(2.25rem,3.2vw,2.85rem),(55svh-4.5rem)*0.11))]'
                  aria-hidden={stateOf(i) !== 'current'}
                >
                  <MaskedWords
                    text={slide.title}
                    state={stateOf(i)}
                    shown={headingShown}
                  />
                </h3>
              ))}
            </div>
            {/* Borde inferior rasgado, del mismo color que el recuadro */}
            <TornEdge color={boxColor} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fondo: el primero usa la entrada ligada al scroll (--experiences-entry); los demás, el estado del slide. */
function backgroundStyle(
  i: number,
  state: SlideState,
  isDesktop: boolean
): CSSProperties {
  if (i === 0 && state === 'current') {
    return {
      width: 'calc(80% + 20% * var(--experiences-entry, 1))',
      translate: '0 calc((1 - var(--experiences-entry, 1)) * 10%)',
      // --img-opacity, no `opacity`: `img-in` la multiplica por la entrada al cargar la foto
      '--img-opacity': 'calc(0.1 + 0.9 * var(--experiences-entry, 1))'
    } as CSSProperties;
  }
  const shrunk = isDesktop ? '80%' : '100%';
  if (state === 'current') return { width: '100%', translate: '0 0' };
  if (state === 'prev') return { width: shrunk, translate: '0 -110%' };
  return { width: shrunk, translate: '0 110%' };
}

function centralStyle(i: number, state: SlideState): CSSProperties {
  // --img-opacity, no `opacity`: ver backgroundStyle
  if (state !== 'current') return { scale: '0', '--img-opacity': 0 } as CSSProperties;
  if (i === 0)
    return {
      scale: 'var(--experiences-entry, 1)',
      '--img-opacity': 'var(--experiences-entry, 1)'
    } as CSSProperties;
  return { scale: '1', '--img-opacity': 1 } as CSSProperties;
}

/**
 * Titular con cada palabra en su propia máscara: todas suben a la vez, así que se ve
 * igual que la máscara por línea de Lolla, sin tener que medir dónde corta cada línea.
 */
function MaskedWords({
  text,
  state,
  shown
}: {
  text: string;
  state: SlideState;
  shown: boolean;
}) {
  const visible = state === 'current' && shown;
  return (
    <>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {/* Máscara con espacio arriba para las tildes de las mayúsculas (Á, É…) */}
          <span className='-mt-[0.25em] inline-block overflow-hidden pt-[0.25em] align-bottom'>
            <span
              className={cn(
                'inline-block transition-[translate,opacity] ease-snap',
                visible
                  ? 'translate-y-0 opacity-100 duration-1000'
                  : 'duration-400',
                !visible && state === 'prev' && '-translate-y-[150%] opacity-0',
                !visible && state !== 'prev' && 'translate-y-[150%]'
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
