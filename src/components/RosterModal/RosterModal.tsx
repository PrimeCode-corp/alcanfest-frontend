import { useId, type CSSProperties } from 'react';
import type { Roster, RosterEntry } from '../../config/event';
import { cn } from '../../lib/cn';
import { IconButton } from '../FlyerModal/FlyerModal';
import { Img } from '../Img/Img';
import { useModalDialog } from '../FlyerModal/useModalDialog';

type RosterModalProps = {
  roster: Roster;
  open: boolean;
  onClose: () => void;
};

// Depende del ancho y también del alto, para que la lista entre sin scroll en la mayoría de pantallas
const NAME_SIZE = 'text-[clamp(1.5rem,min(5dvh,7vw),3rem)]';

const tileStyles: Record<RosterEntry['kind'], string> = {
  classified: 'border-lime bg-lime text-ink',
  slot: 'border-dashed border-paper/70 text-paper',
  surprise: 'basis-full border-magenta bg-magenta text-ink',
};

/**
 * Muro de participantes: cada mosaico mide lo que pide su nombre y crece hasta llenar la fila,
 * como carteles pegados en una pared. El estilo indica el tipo: lima es clasificado,
 * punteado con letra hueca es un cupo, magenta es la sorpresa.
 * El orden es el de la config: no hay numeración porque no representa cruces ni posiciones.
 */
export function RosterModal({ roster, open, onClose }: RosterModalProps) {
  const dialogRef = useModalDialog(open);
  const titleId = useId();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clic en el fondo: el destino es el propio <dialog>, no su contenido
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // Debajo del header, igual que los otros modales.
      // --w es el ancho del modal y --ml su margen izquierdo. Desde lg se reservan 15rem a la derecha para el
      // personaje: el modal va centrado si sobra lugar y, si no, se corre a la izquierda.
      // El borde, el fondo y el scroll van en el hijo: en <dialog> el scroll recortaría al personaje y el fondo lo taparía.
      className='top-(--header-h) m-auto max-h-none w-(--w) max-w-none overflow-visible bg-transparent text-paper [--w:min(60rem,100vw-2rem)] backdrop:bg-ink/80 lg:mr-0 lg:ml-(--ml) lg:[--ml:max(1rem,min((100vw-var(--w))/2,100vw-var(--w)-15rem))] lg:[--w:min(60rem,100vw-17rem)] lg:backdrop:bg-ink/80'
    >
      <div className='max-h-[calc(100dvh-var(--header-h)-1.5rem)] overflow-y-auto overscroll-contain border-3 border-paper bg-ink shadow-[6px_6px_0_var(--color-magenta)]'>
        {/* Fijo arriba al hacer scroll: el botón de cerrar siempre queda a la vista */}
        <div className='sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink p-3 sm:px-4'>
          <div className='flex flex-wrap items-center gap-x-3'>
            <h2
              id={titleId}
              className='font-display text-[clamp(2rem,6dvh,3.5rem)] leading-none font-black uppercase'
            >
              {roster.title}
            </h2>
            <p className='bg-magenta px-2 pt-1 pb-0.5 font-display text-base leading-none font-extrabold text-ink uppercase sm:text-xl'>
              {roster.subtitle}
            </p>
          </div>
          <IconButton label='Cerrar' onClick={onClose}>
            <path d='M5 5l14 14M19 5L5 19' />
          </IconButton>
        </div>

        <ul className='flex flex-wrap gap-1.5 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4'>
          {roster.entries.map((entry, i) => (
            <li
              key={`${entry.name}-${i}`}
              style={{ '--i': i } as CSSProperties}
              // Al abrir, los mosaicos se pegan uno tras otro
              className={cn(
                'flex max-w-full grow flex-col justify-center border-2 px-3 py-1.5 transition-[scale,opacity] delay-[calc(var(--i)*25ms)] duration-300 ease-snap motion-reduce:delay-0 starting:scale-95 starting:opacity-0 sm:py-2',
                tileStyles[entry.kind],
                entry.kind === 'surprise' && 'flex-row items-center justify-center gap-3',
              )}
            >
              <span
                className={cn(
                  `${NAME_SIZE} font-display leading-none font-black whitespace-nowrap uppercase`,
                  // Letra hueca: el relleno se pinta sobre el contorno y tapa los cruces internos de los trazos.
                  // Por eso el contorno va al doble y el relleno es del color del fondo
                  entry.kind === 'slot' && 'text-ink [paint-order:stroke_fill] [-webkit-text-stroke:3px_var(--color-paper)]',
                )}
              >
                {entry.name}
              </span>
              {entry.place &&
                (entry.kind === 'surprise' ? (
                  <span className={`${NAME_SIZE} font-display leading-none font-black uppercase`}>
                    {entry.place}
                  </span>
                ) : (
                  // En celular el lugar no define el ancho del mosaico: se ajusta en líneas y caben dos por fila
                  <span className='text-[0.8rem] leading-tight font-semibold text-balance max-sm:w-0 max-sm:min-w-full sm:text-base'>
                    {entry.place}
                  </span>
                ))}
            </li>
          ))}
        </ul>
      </div>

      {/* Personaje a la derecha, solo desde lg: en pantallas menores el modal ocupa todo el ancho.
          Fijo a la pantalla para que el corte de la foto (los jeans) coincida con su borde inferior.
          Un 24% de su ancho queda detrás del modal: el brazo levantado, con el micrófono asomando.
          --cw se limita al espacio libre a la derecha y al alto debajo del header. */}
      {roster.character && (
        <Img
          src={roster.character.image}
          alt=''
          width={roster.character.width}
          height={roster.character.height}
          loading='lazy'
          className='pointer-events-none fixed bottom-0 left-[calc(var(--ml)+var(--w)-var(--cw)*0.24)] -z-10 hidden h-auto w-(--cw) max-w-none drop-shadow-[4px_4px_0_var(--color-lime)] transition-opacity duration-500 ease-snap select-none [--cw:min((100vw-var(--ml)-var(--w))/0.76,(100dvh-var(--header-h)-0.5rem)*0.53)] lg:block'
        />
      )}
    </dialog>
  );
}
