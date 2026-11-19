import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { scrollToY } from '../../lib/smoothScroll';

// Cuánto hay que bajar (en altos de pantalla) para que aparezca el botón
const SHOW_AFTER_SCREENS = 0.8;

/**
 * Botón flotante "Volver arriba", abajo a la derecha. Aparece al bajar más allá del hero y sube con el
 * mismo desplazamiento suave que los enlaces internos.
 *
 * "Volver arriba" se oculta mientras Spot ocupa el pie de la pantalla. El control de sonido
 * se mantiene encima mientras el audio esté activo y ocupa su lugar cuando "Volver arriba" se oculta.
 * Durante el regreso automático al hero se mantiene visible hasta terminar o interrumpir el recorrido.
 */
export function BackToTop({ soundActive, onMute }: { soundActive: boolean; onMute: () => void }) {
  const [visible, setVisible] = useState(false);
  const [returningToTop, setReturningToTop] = useState(false);
  const showBackToTop = visible || returningToTop;

  useEffect(() => {
    const raf = { id: 0 };
    const spot = document.getElementById('spot');

    const update = () => {
      raf.id = 0;
      const vh = window.innerHeight;
      const past = window.scrollY > vh * SHOW_AFTER_SCREENS;
      const rect = spot?.getBoundingClientRect();
      // El tramo final de Spot ya lo tapa Experiences, que empieza justo donde termina la sección
      const overSpot = rect ? rect.top < vh && rect.bottom > vh : false;
      setVisible(past && !overSpot);
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
  }, []);

  const goTop = () => {
    if (returningToTop) return;
    // Quita el #seccion de la URL: al volver arriba ya no apunta a ninguna sección
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    setReturningToTop(true);
    scrollToY(0, () => setReturningToTop(false));
  };

  return (
    <div className='pointer-events-none fixed right-(--gutter) bottom-[max(var(--gutter),env(safe-area-inset-bottom))] z-30 size-12 sm:size-14'>
      {/* La base no cambia de tamaño: solo se anima el desplazamiento del control de sonido. */}
      {soundActive && (
        <div
          className={cn(
            'absolute inset-0 transition-[translate] duration-300 ease-snap',
            showBackToTop ? '-translate-y-[calc(100%+0.75rem)]' : 'translate-y-0',
          )}
        >
          <button
            type='button'
            onClick={onMute}
            aria-label='Silenciar video promocional'
            title='Silenciar video promocional'
            className='pointer-events-auto grid size-12 cursor-pointer place-items-center border-3 border-ink bg-paper text-ink shadow-[4px_4px_0_var(--color-magenta)] transition-[translate,box-shadow,background-color] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)] sm:size-14'
          >
            <svg width={24} height={24} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5} strokeLinecap='square' aria-hidden='true'>
              <path d='M4 9h4l5-4v14l-5-4H4z' fill='currentColor' stroke='none' />
              <path d='M16 9l6 6M22 9l-6 6' />
            </svg>
          </button>
        </div>
      )}
      <button
        type='button'
        onClick={goTop}
        aria-label='Volver arriba'
        title='Volver arriba'
        // Oculto: fuera del orden de tabulación y de los lectores de pantalla
        inert={!showBackToTop}
        className={cn(
          'group absolute inset-0 grid size-12 cursor-pointer place-items-center border-3 border-ink bg-lime text-ink shadow-[4px_4px_0_var(--color-magenta)] transition-[translate,opacity,box-shadow] duration-300 ease-snap sm:size-14',
          showBackToTop
            ? 'pointer-events-auto translate-y-0 opacity-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]'
            : 'pointer-events-none translate-y-[calc(100%+var(--gutter))] opacity-0',
        )}
      >
        <svg
          width={24}
          height={24}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={3}
          strokeLinecap='square'
          aria-hidden='true'
          className='transition-transform duration-200 ease-snap group-hover:-translate-y-0.5 sm:size-7'
        >
          <path d='M12 20V5M5 11l7-7 7 7' />
        </svg>
      </button>
    </div>
  );
}
