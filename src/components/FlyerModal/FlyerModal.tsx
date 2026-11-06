import type { ReactNode } from 'react';
import type { Flyer } from '../../config/event';
import { useModalDialog } from './useModalDialog';

type FlyerModalProps = {
  flyer: Flyer;
  open: boolean;
  onClose: () => void;
};

/**
 * Modal con un flyer y su enlace. Usa <dialog> nativo: atrapa el foco, cierra con Esc,
 * devuelve el foco al abridor y queda por encima del header sin pelear con z-index.
 */
export function FlyerModal({ flyer, open, onClose }: FlyerModalProps) {
  const dialogRef = useModalDialog(open);

  return (
    <dialog
      ref={dialogRef}
      aria-label={flyer.title}
      onClose={onClose}
      // Clic en el fondo: el destino es el propio <dialog>, no su contenido
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // --flyer-w depende también del alto de pantalla: el flyer y los botones entran siempre sin scroll.
      // Vertical: pegado abajo, para dejar arriba el espacio del personaje. Horizontal: centrado, personaje a un lado.
      // El borde y el fondo van en el hijo: los de <dialog> quedarían debajo del personaje (-z-10).
      className='mx-auto mt-auto mb-3 w-(--flyer-w) max-w-none overflow-visible bg-transparent text-ink transition-[opacity,translate] duration-200 ease-snap [--flyer-w:min(34rem,100vw-2rem,(100dvh-8rem)*0.88)] backdrop:bg-ink/80 starting:open:translate-y-4 starting:open:opacity-0 landscape:my-auto'
    >
      <div className='border-3 border-paper bg-ink shadow-[6px_6px_0_var(--color-magenta)]'>
        <img
          src={flyer.image}
          alt={flyer.alt}
          width={flyer.width}
          height={flyer.height}
          loading='lazy'
          className='block h-auto w-full'
        />
        <div className='flex gap-3 border-t-3 border-paper bg-paper p-3'>
          <SignupLink href={flyer.href}>{flyer.cta}</SignupLink>
          <IconButton label='Cerrar' onClick={onClose}>
            <path d='M5 5l14 14M19 5L5 19' />
          </IconButton>
        </div>
      </div>

      {/* Personaje detrás del flyer. El origen y el translate van en la punta del dedo (85.7% 50.4% de la imagen):
          left/top ubican esa punta justo en el borde del flyer, y al girar sobre ella el dedo no se mueve.
          Vertical: sale por arriba apuntando hacia abajo. Horizontal: sale por la izquierda apuntando hacia la derecha.
          El ancho se limita al espacio libre de cada caso. La máscara desvanece el corte inferior de la foto,
          que en horizontal queda fuera del flyer, sobre el fondo oscuro. */}
      {flyer.character && (
        <img
          src={flyer.character}
          alt=''
          width={797}
          height={1240}
          loading='lazy'
          className='pointer-events-none absolute -top-1 left-[72%] -z-10 h-auto w-[min(70%,(100dvh-var(--flyer-w)*1.136-6.3rem)*1.12)] max-w-none origin-[85.7%_53%] translate-x-[-85.7%] translate-y-[-50.4%] rotate-40 drop-shadow-[4px_4px_0_var(--color-lime)] select-none mask-[linear-gradient(to_bottom,black_80%,transparent)] landscape:top-[35%] landscape:left-[-0.4rem] landscape:w-[min(80%,(100vw-var(--flyer-w))*0.5)] landscape:-rotate-28'
        />
      )}
    </dialog>
  );
}

export function SignupLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='grid min-h-11 flex-1 place-items-center border-2 border-ink bg-magenta px-3 py-2 text-center font-bold text-paper uppercase no-underline shadow-[3px_3px_0_var(--signup-shadow,var(--color-ink))] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--signup-shadow,var(--color-ink))]'
    >
      {children}
    </a>
  );
}

/** Botón cuadrado con un ícono: `children` son los trazos del SVG. */
export function IconButton({
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
      className='grid size-11 shrink-0 cursor-pointer place-items-center border-2 border-ink bg-paper text-ink shadow-[3px_3px_0_var(--color-magenta)] transition-[translate,box-shadow,background-color] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[5px_5px_0_var(--color-magenta)]'
    >
      <svg
        width={20}
        height={20}
        viewBox='0 0 24 24'
        aria-hidden='true'
        fill='none'
        stroke='currentColor'
        strokeWidth={3}
        strokeLinecap='square'
      >
        {children}
      </svg>
    </button>
  );
}
