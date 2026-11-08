import { useId, useState } from 'react';
import { cn } from '../../lib/cn';

type CtaButtonProps = {
  label: string;
  // false = se ve como un botón normal, pero al hacer clic se bloquea y muestra la etiqueta `comingSoonLabel`
  available: boolean;
  comingSoonLabel?: string;
  // Destino cuando está disponible: un enlace (`href`) o una acción (`onClick`)
  href?: string;
  external?: boolean;
  onClick?: () => void;
  // Aspecto del botón (colores, tamaño, tipografía, sombra) y sus estados hover/active
  className: string;
  interactiveClassName: string;
};

/**
 * Botón de llamada a la acción con estado "Próximamente": mientras el destino no está listo, el botón
 * parece activo; al primer clic se apaga y se le pega encima una etiqueta lima. Queda así hasta recargar.
 */
export function CtaButton({
  label,
  available,
  comingSoonLabel = 'Próximamente',
  href,
  external,
  onClick,
  className,
  interactiveClassName,
}: CtaButtonProps) {
  const [blocked, setBlocked] = useState(false);
  const badgeId = useId();
  const base = 'inline-block border-2 border-ink transition-[translate,box-shadow,opacity,filter] duration-150 ease-snap';

  if (available && href) {
    return (
      <a
        href={href}
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        className={cn(base, 'no-underline', className, interactiveClassName)}
      >
        {label}
      </a>
    );
  }

  return (
    <span className='relative inline-block'>
      <button
        type='button'
        aria-disabled={blocked}
        aria-describedby={blocked ? badgeId : undefined}
        onClick={() => {
          if (available) onClick?.();
          else setBlocked(true);
        }}
        className={cn(
          base,
          className,
          blocked ? 'cursor-not-allowed opacity-60 grayscale-[35%]' : cn('cursor-pointer', interactiveClassName),
        )}
      >
        {label}
      </button>
      {blocked && (
        // role=status: los lectores de pantalla anuncian el aviso al aparecer
        <span id={badgeId} role='status' className='pointer-events-none absolute -top-3 -right-3 rotate-6'>
          <span className='block animate-sticker-in border-2 border-ink bg-lime px-2 pt-1 pb-0.5 font-display text-xs leading-none font-extrabold tracking-[0.06em] whitespace-nowrap text-ink uppercase shadow-[2px_2px_0_var(--color-ink)] sm:text-sm'>
            {comingSoonLabel}
          </span>
        </span>
      )}
    </span>
  );
}
