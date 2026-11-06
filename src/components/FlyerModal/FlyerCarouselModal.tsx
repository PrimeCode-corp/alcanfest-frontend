import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { FlyerCarousel } from '../../config/event';
import { cn } from '../../lib/cn';
import { IconButton, SignupLink } from './FlyerModal';
import { useModalDialog } from './useModalDialog';

type FlyerCarouselModalProps = {
  carousel: FlyerCarousel;
  open: boolean;
  onClose: () => void;
};

/**
 * Modal con varios flyers en carrusel: se desliza con el dedo (scroll-snap nativo), flechas (solo computadora),
 * puntos, teclado o clic en el flyer vecino. El botón de inscripción siempre corresponde al flyer centrado.
 */
export function FlyerCarouselModal({ carousel, open, onClose }: FlyerCarouselModalProps) {
  const dialogRef = useModalDialog(open);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { slides, character } = carousel;
  const slide = slides[active];

  // Flyer activo: el más cercano al centro. Mismo patrón que el resto de la web: scroll → rAF → lectura
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !open) return;
    const raf = { id: 0 };

    const update = () => {
      raf.id = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
        if (distance < closestDistance) {
          closest = i;
          closestDistance = distance;
        }
      });
      setActive(closest);
    };
    const onScroll = () => {
      if (!raf.id) raf.id = requestAnimationFrame(update);
    };

    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf.id);
    };
  }, [open]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[(index + slides.length) % slides.length] as HTMLElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({
      left: target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    goTo(active + (e.key === 'ArrowRight' ? 1 : -1));
  };

  // Clic fuera de los flyers y controles: el <dialog> (el contenedor deja pasar el clic) o el carril vacío
  const onDialogClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget || e.target === trackRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={carousel.title}
      onClose={onClose}
      onClick={onDialogClick}
      onKeyDown={onKeyDown}
      // Ocupa toda la pantalla para que los flyers vecinos se vean a los lados.
      // --s es el lado del flyer (cuadrado): limitado por el ancho y por el alto disponible, contando personajes y controles.
      // En pantallas muy bajas (celular acostado) no hay lugar para los personajes: el flyer usa ese espacio.
      className='m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden bg-transparent text-ink transition-opacity duration-200 ease-snap [--s:min(34rem,100vw-4.5rem,(100dvh-9rem)*0.68)] backdrop:bg-ink/80 lg:backdrop:bg-ink/90 starting:open:opacity-0 [@media(max-height:30rem)]:[--s:calc(100dvh-9rem)]'
    >
      <div className='pointer-events-none flex h-full flex-col items-center justify-center'>
        {/* Personajes en el centro, por arriba: su corte coincide con el borde superior de los flyers,
            así parece que asoman por detrás y los flyers pasan por delante al deslizar */}
        <div
          aria-hidden='true'
          className='flex h-[calc(var(--s)*0.46)] w-full shrink-0 justify-center overflow-hidden [@media(max-height:30rem)]:hidden'
        >
          <img
            src={character.image}
            alt=''
            width={character.width}
            height={character.height}
            loading='lazy'
            className='h-auto w-[calc(var(--s)*0.8)] max-w-none self-start drop-shadow-[4px_4px_0_var(--color-lime)] select-none'
          />
        </div>

        <div className='relative w-full shrink-0'>
          <div
            ref={trackRef}
            className='pointer-events-auto relative flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-[calc(50%-var(--s)/2)] [scrollbar-width:none] sm:gap-4'
          >
            {slides.map((item, i) => (
              <div
                key={item.href}
                role='group'
                aria-label={`${i + 1} de ${slides.length}: ${item.title}`}
                aria-hidden={i !== active}
                className='w-(--s) shrink-0 snap-center'
              >
                {/* Vecinos oscurecidos, no transparentes: si no, la página se ve a través de ellos */}
                <img
                  src={item.image}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading='lazy'
                  onClick={i === active ? undefined : () => goTo(i)}
                  className={cn(
                    'block h-auto w-full border-3 border-paper transition-[filter,scale] duration-300 ease-snap',
                    i !== active && 'cursor-pointer brightness-50 sm:scale-90',
                  )}
                />
              </div>
            ))}
          </div>

          {/* Flechas solo en computadora, a los lados y fuera del flyer central para no tapar sus textos.
              En pantallas menores se desliza con el dedo. */}
          <div className='absolute inset-y-0 left-[calc(50%-var(--s)/2-3.5rem)] hidden items-center lg:flex [&>button]:pointer-events-auto'>
            <IconButton label='Convocatoria anterior' onClick={() => goTo(active - 1)}>
              <path d='M15 5l-7 7 7 7' />
            </IconButton>
          </div>
          <div className='absolute inset-y-0 right-[calc(50%-var(--s)/2-3.5rem)] hidden items-center lg:flex [&>button]:pointer-events-auto'>
            <IconButton label='Convocatoria siguiente' onClick={() => goTo(active + 1)}>
              <path d='M9 5l7 7-7 7' />
            </IconButton>
          </div>
        </div>

        <div className='pointer-events-auto flex py-1'>
          {slides.map((item, i) => (
            <button
              key={item.href}
              type='button'
              aria-label={`Ver ${item.title}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
              className='grid size-6 cursor-pointer place-items-center'
            >
              <span
                className={cn(
                  'block size-3 border-2 border-paper transition-colors duration-150',
                  i === active && 'bg-lime',
                )}
              />
            </button>
          ))}
        </div>

        {/* Sobre el fondo oscuro, la sombra negra del botón no se vería */}
        <div className='pointer-events-auto flex w-(--s) gap-3 [--signup-shadow:var(--color-lime)]'>
          <SignupLink href={slide.href}>
            {slide.cta}: {slide.title}
          </SignupLink>
          <IconButton label='Cerrar' onClick={onClose}>
            <path d='M5 5l14 14M19 5L5 19' />
          </IconButton>
        </div>

        <p aria-live='polite' className='sr-only'>
          Convocatoria {active + 1} de {slides.length}: {slide.title}
        </p>
      </div>
    </dialog>
  );
}
