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
      // Todo queda debajo del header: el modal empieza en --header-h y --flyer-w se calcula con el alto restante,
      // así el flyer y los botones entran siempre sin scroll.
      // Vertical: pegado abajo, reservando arriba lugar para el personaje. Horizontal: centrado, personaje a un lado.
      // El borde y el fondo van en el hijo: los de <dialog> quedarían debajo del personaje (-z-10).
      className='top-(--header-h) mx-auto mt-auto mb-3 w-(--flyer-w) max-w-none overflow-visible bg-transparent text-ink transition-[opacity,translate] duration-200 ease-snap [--flyer-w:min(34rem,100vw-2rem,(100dvh-var(--header-h)-15rem)*0.88)] backdrop:bg-ink/80 lg:backdrop:bg-ink/95 starting:open:translate-y-4 starting:open:opacity-0 landscape:my-auto landscape:[--flyer-w:min(34rem,100vw-2rem,(100dvh-var(--header-h)-6rem)*0.88)]'
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

      {/* Horizontal: personaje detrás del flyer, por la izquierda, apuntando hacia él. El origen y el translate van
          en la punta del dedo (85.7% 50.4% de la imagen): left/top ubican esa punta justo en el borde del flyer,
          y al girar sobre ella el dedo no se mueve. El ancho se limita al espacio libre. La máscara desvanece
          el corte inferior de la foto, que queda fuera del flyer, sobre el fondo oscuro. */}
      {flyer.character && (
        <img
          src={flyer.character}
          alt=''
          width={797}
          height={1240}
          loading='lazy'
          className='pointer-events-none absolute top-[35%] left-[-0.4rem] -z-10 hidden h-auto w-[min(80%,(100vw-var(--flyer-w))*0.5)] max-w-none origin-[85.7%_53%] translate-x-[-85.7%] translate-y-[-50.4%] -rotate-28 drop-shadow-[4px_4px_0_var(--color-lime)] select-none mask-[linear-gradient(to_bottom,black_80%,transparent)] landscape:block'
        />
      )}

      {/* Vertical: personaje centrado sobre el flyer. El recuadro muestra de la cabeza a los brazos y su borde
          inferior coincide con el del flyer, así parece asomar por detrás. Se recorta con clip-path y no con
          overflow para no cortar la sombra a los lados. El ancho se limita al espacio libre arriba del flyer. */}
      {flyer.characterMobile && (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute bottom-full left-1/2 aspect-[940/1110] min-h-0 w-[min(80%,(100dvh-var(--header-h)-var(--flyer-w)*1.136-6rem)*0.84)] -translate-x-1/2 [clip-path:inset(-1rem_-1rem_0_-1rem)] landscape:hidden'
        >
          <img
            src={flyer.characterMobile}
            alt=''
            width={940}
            height={1390}
            loading='lazy'
            className='block h-auto w-full drop-shadow-[4px_4px_0_var(--color-lime)] select-none'
          />
        </div>
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
