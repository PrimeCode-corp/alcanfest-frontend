import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { scrollToY } from '../../lib/smoothScroll';

// Cuánto hay que bajar (en altos de pantalla) para que aparezca el botón
const SHOW_AFTER_SCREENS = 0.8;

/**
 * Botón flotante "Volver arriba", abajo a la derecha. Aparece al bajar más allá del hero y sube con el
 * mismo desplazamiento suave que los enlaces internos.
 *
 * Se oculta mientras el video de `Spot` ocupa el pie de la pantalla: ahí están sus controles y el botón
 * "Ver con sonido", en la misma esquina.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

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
    // Quita el #seccion de la URL: al volver arriba ya no apunta a ninguna sección
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollToY(0);
  };

  return (
    <button
      type='button'
      onClick={goTop}
      aria-label='Volver arriba'
      title='Volver arriba'
      // Oculto: fuera del orden de tabulación y de los lectores de pantalla
      inert={!visible}
      className={cn(
        'group fixed right-(--gutter) bottom-[max(var(--gutter),env(safe-area-inset-bottom))] z-30 grid size-12 cursor-pointer place-items-center border-3 border-ink bg-lime text-ink shadow-[4px_4px_0_var(--color-magenta)] transition-[translate,opacity,box-shadow] duration-300 ease-snap sm:size-14',
        visible
          ? 'translate-y-0 opacity-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]'
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
  );
}
