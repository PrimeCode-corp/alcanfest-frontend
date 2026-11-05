import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from 'react';
import { about, event, type AboutFeature } from '../../config/event';
import { cn } from '../../lib/cn';

const DESKTOP_QUERY = '(min-width: 64rem)'; // = breakpoint lg

// Nombre (MÚSICA, CALLE…) encima de cada foto. Oculto por ahora; las posiciones siguen en
// `tagPlacement` (config/event.ts). Sin foto, el nombre se muestra igual para que el panel no quede vacío.
const SHOW_PHOTO_TAGS = false;

/**
 * Índice de la respuesta activa según el scroll.
 * Desktop: la sección queda fija (sticky) y unos "pasos" invisibles, uno por respuesta, marcan el avance.
 * Móvil: se observa cada respuesta directamente.
 * En ambos casos, se activa la que cruza la línea central de la pantalla.
 */
function useActiveStep(
  stepRefs: RefObject<(HTMLElement | null)[]>,
  itemRefs: RefObject<(HTMLElement | null)[]>
) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    let observer: IntersectionObserver | undefined;

    const setup = () => {
      observer?.disconnect();
      const targets = (
        media.matches ? stepRefs.current : itemRefs.current
      ).filter((el): el is HTMLElement => el !== null);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = targets.indexOf(entry.target as HTMLElement);
            if (entry.isIntersecting) {
              setActive(index);
            } else if (index === 0 && entry.boundingClientRect.top > 0) {
              // Volviendo hacia arriba antes de la primera respuesta
              setActive(-1);
            }
          }
        },
        { rootMargin: '-50% 0px -50% 0px' }
      );
      targets.forEach((el) => observer!.observe(el));
    };

    setup();
    media.addEventListener('change', setup);
    return () => {
      media.removeEventListener('change', setup);
      observer?.disconnect();
    };
  }, [stepRefs, itemRefs]);

  return active;
}

/**
 * Entrada del título (solo desktop), ligada al scroll:
 * 1. Entrada: el título aparece arriba, pegado a las cards de merch, y baja más lento que la página
 *    (efecto arrastre) hasta quedar fijo en el centro de la pantalla.
 * 2. Al seguir bajando, se "arrastra" a su lugar (arriba a la izquierda) y aparecen las respuestas.
 * Variables CSS en el escenario: --e (entrada 0 → 1), --t (transición 0 → 1),
 * --dx/--dy (desplazamiento al centro), --k (distancia del centro al borde superior) y --s (escala).
 */
function useIntroTransition(
  wrapperRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  titleRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const raf = { id: 0 };

    const measure = () => {
      const stage = stageRef.current;
      const title = titleRef.current;
      if (!stage || !title) return;
      if (!media.matches) {
        ['--e', '--t', '--dx', '--dy', '--k', '--s'].forEach((v) =>
          stage.style.removeProperty(v)
        );
        return;
      }
      // El contenedor del título no se transforma: su caja es la posición final
      const s = stage.getBoundingClientRect();
      const t = title.getBoundingClientRect();
      const scale = Math.min(
        1.6,
        (s.width * 0.85) / t.width,
        (s.height * 0.8) / t.height
      );
      stage.style.setProperty(
        '--dx',
        String(s.left + s.width / 2 - (t.left + t.width / 2))
      );
      stage.style.setProperty(
        '--dy',
        String(s.top + s.height / 2 - (t.top + t.height / 2))
      );
      stage.style.setProperty('--s', String(scale));
      // Al inicio de la entrada el título queda arriba del escenario (junto al padding superior)
      const padTop = parseFloat(getComputedStyle(stage).paddingTop) || 0;
      stage.style.setProperty(
        '--k',
        String(Math.max(s.height / 2 - (t.height * scale) / 2 - padTop, 0))
      );
    };

    const update = () => {
      raf.id = 0;
      const wrapper = wrapperRef.current;
      const stage = stageRef.current;
      if (!wrapper || !stage || !media.matches) return;
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-h'
          )
        ) || 0;
      const vh = window.innerHeight;
      const top = wrapper.getBoundingClientRect().top;
      const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
      const smooth = (n: number) => n * n * (3 - 2 * n);

      // Entrada: desde que la sección asoma por abajo hasta que el escenario queda fijo
      const entry = clamp(1 - (top - headerH) / (vh - headerH));
      stage.style.setProperty('--e', String(smooth(entry)));

      // Transición: pausa de 20vh con el título centrado, luego 60vh de arrastre a su lugar
      const scrolled = headerH - top; // > 0 cuando el escenario ya está fijo
      stage.style.setProperty(
        '--t',
        String(smooth(clamp((scrolled - vh * 0.2) / (vh * 0.6))))
      );
    };

    const onScroll = () => {
      if (!raf.id) raf.id = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    onResize();
    document.fonts?.ready.then(onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    media.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      media.removeEventListener('change', onResize);
      cancelAnimationFrame(raf.id);
    };
  }, [wrapperRef, stageRef, titleRef]);
}

// Estilos que dependen de --t. Fallbacks = estado final, así en móvil no hacen nada.
// Sin will-change: si el título se compone como capa, el navegador lo rasteriza a escala 1 y al
// agrandarlo se ve borroso. Así se vuelve a pintar nítido en cada escala.
// round() lleva el desplazamiento a píxeles enteros para que el texto no quede entre píxeles.
const titleMotion = {
  transform:
    'translate(round(calc(var(--dx, 0) * (1 - var(--t, 1)) * 1px), 1px), round(calc((var(--dy, 0) - var(--k, 0) * (1 - var(--e, 1))) * (1 - var(--t, 1)) * 1px), 1px)) scale(calc(1 + (var(--s, 1) - 1) * (1 - var(--t, 1))))'
} as const;

const revealMotion = {
  opacity: 'var(--t, 1)',
  transform: 'translateY(calc((1 - var(--t, 1)) * 48px))'
} as const;

export function About() {
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const active = useActiveStep(stepRefs, itemRefs);
  const visual = Math.max(active, 0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  useIntroTransition(wrapperRef, stageRef, titleRef);

  return (
    <section
      id='que-es'
      aria-labelledby='about-title'
      className='bg-ink text-paper'
    >
      {/* Contenedor alto: da el recorrido de scroll en desktop (entrada del título + una pantalla por respuesta) */}
      <div
        ref={wrapperRef}
        className='relative'
        style={{ ['--steps' as string]: about.features.length }}
      >
        {/* Pasos invisibles que marcan el avance en desktop */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 hidden flex-col lg:flex'
        >
          {/* Tramo de la entrada del título: aquí todavía no se resalta nada */}
          <div className='h-[130svh] shrink-0' />
          {about.features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className='flex-1'
            />
          ))}
        </div>

        <div className='lg:h-[calc(130svh+var(--steps)*85svh)]'>
          <div
            ref={stageRef}
            className='mx-auto grid max-w-350 items-center gap-12 px-(--gutter) py-16 sm:py-20 lg:sticky lg:top-(--header-h) lg:h-[calc(100svh-var(--header-h))] lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-10'
          >
            <div>
              <header ref={titleRef} className='text-center lg:text-left'>
                <div className='origin-center' style={titleMotion}>
                  <h2
                    id='about-title'
                    className='font-display text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[0.9] font-black uppercase'
                  >
                    ¿Qué es {event.name}?
                  </h2>
                  <p className='mx-auto mt-4 max-w-[38ch] font-display text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.1] font-extrabold lg:mx-0'>
                    {about.subtitle}
                  </p>
                </div>
              </header>

              <ol
                className='mt-10 flex flex-col gap-8 lg:mt-8 lg:gap-4'
                style={revealMotion}
              >
                {about.features.map((feature, i) => (
                  <li
                    key={feature.title}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    className='flex flex-col items-center gap-5 text-center lg:items-start lg:text-left'
                  >
                    <h3 className='font-display text-[clamp(1.6rem,2.4vw,2.25rem)] leading-[1.2] font-extrabold'>
                      <Highlight
                        state={
                          i < active
                            ? 'past'
                            : i === active
                              ? 'current'
                              : 'next'
                        }
                      >
                        {feature.title}
                      </Highlight>
                    </h3>
                    {/* En móvil cada respuesta lleva su imagen debajo */}
                    <div className='w-full max-w-90 lg:hidden'>
                      <FeatureVisual feature={feature} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Desktop: imagen de la respuesta activa, cambia con el scroll */}
            <div
              aria-hidden='true'
              style={revealMotion}
              className='relative mx-auto hidden aspect-square w-full max-w-[min(480px,calc(100svh-var(--header-h)-8rem))] lg:block'
            >
              {about.features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={cn(
                    'absolute inset-0 transition-[opacity,translate,rotate] duration-500 ease-snap',
                    i === visual
                      ? 'translate-y-0 rotate-0 opacity-100'
                      : i < visual
                        ? '-translate-y-8 -rotate-3 opacity-0'
                        : 'translate-y-8 rotate-3 opacity-0'
                  )}
                >
                  <FeatureVisual feature={feature} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Resaltado tipo "marcador" con el estilo del hashtag del hero:
 * la caja de color barre de izquierda a derecha detrás del texto.
 * current = magenta, past = negro, next = atenuado.
 */
function Highlight({
  state,
  children
}: {
  state: 'past' | 'current' | 'next';
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'box-decoration-clone bg-no-repeat px-2 py-0.5 transition-[background-size,color] duration-500 ease-snap',
        state === 'current' &&
          'bg-linear-to-r from-magenta to-magenta bg-size-[100%_100%] text-paper',
        state === 'past' &&
          'bg-linear-to-r from-lime to-lime bg-size-[100%_100%] text-ink',
        state === 'next' &&
          'bg-linear-to-r from-lime to-lime bg-size-[0%_100%] text-paper/30'
      )}
    >
      {children}
    </span>
  );
}

function FeatureVisual({ feature }: { feature: AboutFeature }) {
  return (
    <div className='@container relative isolate aspect-square overflow-hidden border-3 border-paper bg-ink shadow-[8px_8px_0_var(--color-magenta)] lg:size-full'>
      {feature.image && (
        <>
          <img
            src={feature.image}
            alt=''
            loading='lazy'
            className='absolute inset-0 -z-10 size-full object-cover'
          />
          {/* Tinte rosa (magenta de marca) sobre la foto */}
          <div
            aria-hidden='true'
            className='absolute inset-0 -z-10 bg-magenta/30 mix-blend-multiply'
          />
          {/* Oscurecido suave y parejo: el nombre ya no está siempre abajo */}
          <div
            aria-hidden='true'
            className='absolute inset-0 -z-10 bg-ink/20'
          />
        </>
      )}

      {(SHOW_PHOTO_TAGS || !feature.image) && <FeatureTag feature={feature} />}
    </div>
  );
}

/**
 * Nombre sobre la foto. Con `tagPlacement` se ubica donde no tapa a las personas;
 * sin él, va abajo a la izquierda. El tamaño usa cqw (ancho del cuadro) para que
 * la posición relativa sea la misma en móvil y desktop.
 */
function FeatureTag({ feature }: { feature: AboutFeature }) {
  const p = feature.tagPlacement ?? { left: '6%', bottom: '5%', size: 16 };

  const transforms = [
    p.centerX && 'translateX(-50%)',
    p.vertical && 'rotate(180deg)', // con writing-mode vertical, se lee de abajo hacia arriba
    p.rotate && `rotate(${p.rotate}deg)`
  ].filter(Boolean);

  const style: CSSProperties = {
    top: p.top,
    bottom: p.bottom,
    left: p.centerX ? '50%' : p.left,
    right: p.right,
    fontSize: `${p.size ?? 16}cqw`,
    writingMode: p.vertical ? 'vertical-rl' : undefined,
    transform: transforms.length ? transforms.join(' ') : undefined
  };

  return (
    <span
      aria-hidden='true'
      style={style}
      className='absolute font-display leading-[0.85] font-black whitespace-nowrap text-paper uppercase [text-shadow:0.05em_0.05em_0_var(--color-ink)]'
    >
      {feature.tag}
    </span>
  );
}
