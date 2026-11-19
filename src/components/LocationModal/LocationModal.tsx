import { useEffect, useId, useRef, useState } from 'react';
import { venueLocation } from '../../config/event';
import { locationMap } from '../../config/locationMap';
import { cn } from '../../lib/cn';
import { IconButton, SignupLink } from '../FlyerModal/FlyerModal';
import { useModalDialog } from '../FlyerModal/useModalDialog';

type LocationModalProps = {
  open: boolean;
  onClose: () => void;
};

const STEP_MS = 1400;
const START_DELAY_MS = 550; // deja terminar la entrada del mapa
const STEP_COUNT = venueLocation.steps.length;

// Avanza y frena en cada esquina, así el marcador "espera" al cambiar de paso
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Mapa de la ruta en moto hasta el festival: la línea se dibuja mientras la moto recorre cada paso. */
export function LocationModal({ open, onClose }: LocationModalProps) {
  const dialogRef = useModalDialog(open);
  const titleId = useId();
  const routeRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  // Paso en curso; igual a STEP_COUNT al llegar
  const [activeStep, setActiveStep] = useState(0);
  const [run, setRun] = useState(0);
  const arrived = activeStep === STEP_COUNT;

  useEffect(() => {
    const route = routeRef.current;
    const marker = markerRef.current;
    if (!open || !route || !marker) return;

    // El progreso se escribe directo en el SVG, sin re-renderizar en cada frame
    const total = route.getTotalLength();
    const draw = (progress: number) => {
      route.style.strokeDashoffset = String(1 - progress);
      const { x, y } = route.getPointAtLength(progress * total);
      marker.setAttribute('transform', `translate(${x} ${y})`);
    };

    // Con movimiento reducido, el primer frame ya muestra la ruta completa
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    draw(reducedMotion ? 1 : 0);
    const raf = { id: 0 };
    let startTime = 0;

    const tick = (now: number) => {
      startTime ||= now;
      const elapsed = reducedMotion ? Infinity : now - startTime - START_DELAY_MS;
      const step = Math.min(Math.max(Math.floor(elapsed / STEP_MS), 0), STEP_COUNT);

      setActiveStep(step); // React lo ignora si el paso no cambió
      if (step === STEP_COUNT) {
        draw(1);
        return;
      }

      const from = locationMap.stepEnds[step - 1] ?? 0;
      const to = locationMap.stepEnds[step];
      const local = Math.max(elapsed / STEP_MS - step, 0);
      draw(from + (to - from) * easeInOut(local));
      raf.id = requestAnimationFrame(tick);
    };

    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [open, run]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clic en el fondo: el destino es el propio <dialog>, no su contenido
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // Debajo del header, igual que los otros modales. Bajo lg va en una columna: el ancho se limita según el alto
      // de pantalla, para que en una ventana a media pantalla el mapa no quede enorme y empuje los pasos fuera de vista.
      className='top-(--header-h) m-auto max-h-none w-[min(100vw-2rem,max(22rem,42dvh*1.15+2rem))] max-w-none lg:w-[min(62rem,100vw-2rem)] overflow-visible bg-transparent text-paper transition-[opacity,translate] duration-200 ease-snap backdrop:bg-ink/80 starting:open:translate-y-4 starting:open:opacity-0'
    >
      <div className='max-h-[calc(100dvh-var(--header-h)-1.5rem)] overflow-y-auto overscroll-contain border-3 border-paper bg-ink shadow-[6px_6px_0_var(--color-magenta)]'>
        {/* Fijo arriba al hacer scroll: el botón de cerrar siempre queda a la vista */}
        <div className='sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink p-3 sm:px-4'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <h2
              id={titleId}
              className='font-display text-[clamp(2rem,6dvh,3.5rem)] leading-none font-black uppercase'
            >
              {venueLocation.title}
            </h2>
            <p className='bg-magenta px-2 pt-1 pb-0.5 font-display text-base leading-none font-extrabold text-ink uppercase sm:text-xl'>
              {venueLocation.tag}
            </p>
          </div>
          <IconButton label='Cerrar' onClick={onClose}>
            <path d='M5 5l14 14M19 5L5 19' />
          </IconButton>
        </div>

        <div className='grid gap-3 px-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4 lg:grid-cols-[auto_1fr]'>
          {/* Mapa: se destapa de izquierda a derecha al abrir. Bajo lg la proporción es fija: el recorte de `slice`
              es mínimo y la ruta y sus etiquetas siempre entran. Desde lg es cuadrado */}
          <div className='relative aspect-[1.15] w-full overflow-hidden border-3 border-paper bg-paper transition-[clip-path] duration-500 ease-snap [clip-path:inset(0)] starting:[clip-path:inset(0_100%_0_0)] lg:aspect-auto lg:size-[min(34rem,100dvh-var(--header-h)-8rem)]'>
            <svg
              viewBox='0 0 1000 1000'
              preserveAspectRatio='xMidYMid slice'
              role='img'
              aria-label={`Mapa de la ruta en moto desde ${venueLocation.origin} hasta ${venueLocation.place}`}
              className='block size-full font-display font-extrabold'
            >
              {/* Río: cauce con borde y línea punteada al centro, para no confundirlo con una calle */}
              <g fill='none' strokeLinejoin='round' strokeLinecap='round'>
                <path d={locationMap.water} stroke='var(--color-ink)' strokeWidth={34} />
                <path d={locationMap.water} stroke='var(--color-paper)' strokeWidth={20} />
                <path d={locationMap.water} stroke='var(--color-ink)' strokeWidth={4} strokeDasharray='14 14' />
              </g>
              <path d={locationMap.parks} fill='var(--color-lime)' stroke='var(--color-ink)' strokeWidth={6} />
              <g fill='none' stroke='var(--color-ink)' strokeLinejoin='round'>
                <path d={locationMap.minorStreets} strokeWidth={9} />
                <path d={locationMap.majorStreets} strokeWidth={17} />
              </g>

              {/* Ruta: se dibuja con el dash; sin animación queda completa */}
              <path
                ref={routeRef}
                d={locationMap.route}
                pathLength={1}
                strokeDasharray='1'
                fill='none'
                stroke='var(--color-magenta)'
                strokeWidth={22}
                strokeLinejoin='round'
              />

              {/* Origen: casita de La Collpa, con sombra dura como las etiquetas */}
              <g
                transform={`translate(${locationMap.originMarker.x} ${locationMap.originMarker.y})`}
                strokeLinejoin='round'
              >
                <path d='M-30 0V-46H-42L0-84L42-46H30V0Z' fill='var(--color-magenta)' transform='translate(7 7)' />
                <path
                  d='M-30 0V-46H-42L0-84L42-46H30V0Z'
                  fill='var(--color-paper)'
                  stroke='var(--color-ink)'
                  strokeWidth={8}
                />
                <rect x={-9} y={-26} width={18} height={26} fill='var(--color-ink)' />
              </g>

              <MapLabel
                x={locationMap.originLabel.x}
                y={locationMap.originLabel.y}
                width={locationMap.originLabel.width}
                tone='ink'
              >
                {venueLocation.origin}
              </MapLabel>

              {/* Destino: al llegar, el pin se "estampa" */}
              <g transform={`translate(${locationMap.destination.x} ${locationMap.destination.y})`}>
                <g
                  className={cn(
                    'transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-box:fill-box] [transform-origin:50%_100%]',
                    arrived ? 'scale-125' : 'scale-90',
                  )}
                >
                  <path
                    d='M0 0C-12-22-34-38-34-62a34 34 0 0 1 68 0C34-38 12-22 0 0Z'
                    fill={arrived ? 'var(--color-magenta)' : 'var(--color-paper)'}
                    stroke='var(--color-ink)'
                    strokeWidth={8}
                  />
                  <circle cy={-62} r={11} fill='var(--color-ink)' />
                </g>
              </g>
              <MapLabel
                x={locationMap.destinationLabel.x}
                y={locationMap.destinationLabel.y}
                width={locationMap.destinationLabel.width}
                tone='magenta'
              >
                {venueLocation.place}
              </MapLabel>

              {/* Moto que recorre la ruta */}
              <g ref={markerRef} className={cn('transition-opacity duration-200', arrived && 'opacity-0')}>
                <rect x={-43} y={-43} width={86} height={86} fill='var(--color-lime-bright)' stroke='var(--color-ink)' strokeWidth={8} />
                <g fill='none' stroke='var(--color-ink)' strokeWidth={8} strokeLinejoin='round'>
                  <circle cx={-21} cy={17} r={11} />
                  <circle cx={22} cy={17} r={11} />
                  <path d='M22 17L10-20H-1' strokeWidth={6} />
                  {/* Tanque y motor: el bloque sólido la distingue de una bicicleta */}
                  <path d='M-27-7H13L17 8L6 17H-11L-21 17Z' fill='var(--color-ink)' strokeWidth={3} />
                </g>
              </g>
            </svg>

            <a
              href='https://www.openstreetmap.org/copyright'
              target='_blank'
              rel='noopener noreferrer'
              className='absolute right-0 bottom-0 bg-paper px-1.5 py-0.5 text-[0.65rem] leading-tight text-ink'
            >
              © OpenStreetMap
            </a>
          </div>

          <div className='flex min-w-0 flex-col gap-3'>
            <p className='font-display text-xl leading-tight font-extrabold text-lime uppercase sm:text-2xl'>
              {venueLocation.summary}
            </p>

            <ol className='flex flex-col gap-1.5'>
              {venueLocation.steps.map((step, i) => (
                <li
                  key={step.text}
                  aria-current={i === activeStep ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-3 border-2 px-2.5 py-1.5 text-sm leading-snug font-semibold transition-[background-color,color,border-color,translate] duration-200 ease-snap sm:py-2 sm:text-base',
                    i === activeStep
                      ? 'translate-x-1 border-lime bg-lime text-ink'
                      : i < activeStep
                        ? 'border-paper text-paper'
                        : 'border-paper/40 text-paper/70',
                  )}
                >
                  <span className='font-display text-2xl leading-none font-black'>{i + 1}</span>
                  <span className='min-w-0 flex-1'>{step.text}</span>
                  <span className='shrink-0 font-display text-lg leading-none font-extrabold whitespace-nowrap'>
                    {step.distance}
                  </span>
                </li>
              ))}
            </ol>

            <div className='mt-auto flex gap-3 pt-1 [--signup-shadow:var(--color-lime)]'>
              <SignupLink href={venueLocation.mapsUrl}>{venueLocation.mapsCta}</SignupLink>
              <IconButton label='Ver ruta de nuevo' onClick={() => setRun((n) => n + 1)}>
                <path d='M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5' />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function MapLabel({
  x,
  y,
  width,
  tone,
  children
}: {
  x: number;
  y: number;
  width: number;
  tone: 'ink' | 'magenta';
  children: string;
}) {
  const height = 52;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-width / 2 + 7}
        y={-height / 2 + 7}
        width={width}
        height={height}
        fill={tone === 'ink' ? 'var(--color-magenta)' : 'var(--color-ink)'}
      />
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={tone === 'ink' ? 'var(--color-ink)' : 'var(--color-magenta)'}
      />
      <text
        textAnchor='middle'
        dominantBaseline='central'
        fontSize={36}
        fill='var(--color-paper)'
        className='uppercase'
      >
        {children}
      </text>
    </g>
  );
}
