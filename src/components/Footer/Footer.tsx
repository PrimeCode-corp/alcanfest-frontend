import { footer, footerColumns, type NavLink } from '../../config/event';
import { CtaButton } from '../CtaButton/CtaButton';

const externalProps = (link: NavLink) => (link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {});

/**
 * Footer (como el de lollapalooza.com): línea divisoria, columnas de enlaces + "Entérate primero" con su botón,
 * otra línea y la fila legal. En celular todo va apilado; desde lg, cuatro columnas con la última más ancha.
 */
export function Footer() {
  const { newsletter } = footer;

  return (
    <footer className='bg-ink px-(--gutter) text-paper'>
      <div className='mx-auto max-w-300 border-t-2 border-paper/80'>
        <div className='grid gap-10 py-12 sm:grid-cols-2 sm:gap-x-8 sm:py-16 lg:grid-cols-[1fr_1fr_1fr_1.45fr]'>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className='font-display text-[1.75rem] leading-none font-black uppercase'>{column.title}</h2>
              <ul className='mt-4 flex flex-col gap-2.5'>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...externalProps(link)}
                      className='text-lg text-paper no-underline decoration-lime decoration-2 underline-offset-4 transition-colors duration-150 hover:text-lime hover:underline'
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className='sm:col-span-2 lg:col-span-1'>
            <h2 className='font-display text-[1.75rem] leading-none font-black uppercase'>{newsletter.title}</h2>
            <div className='mt-5'>
              <CtaButton
                label={newsletter.cta}
                available={newsletter.available}
                href={newsletter.href || undefined}
                external={newsletter.external}
                className='bg-lime px-5 pt-2.5 pb-2 font-display text-xl font-extrabold tracking-[0.02em] text-ink uppercase shadow-[4px_4px_0_var(--color-magenta)] sm:px-6 sm:text-2xl'
                interactiveClassName='hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]'
              />
            </div>
          </div>
        </div>

        {/* Fila legal: a la izquierda el festival, a la derecha el crédito del desarrollo */}
        <div className='flex flex-col gap-2 border-t-2 border-paper/80 py-6 text-sm text-paper/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
          <p>
            {footer.copyright} · {footer.place}
          </p>
          <p>
            {footer.credit.prefix}{' '}
            <a
              href={footer.credit.href}
              target='_blank'
              rel='noopener noreferrer'
              className='font-bold text-paper/80 no-underline decoration-lime decoration-2 underline-offset-4 transition-colors duration-150 hover:text-lime hover:underline'
            >
              {footer.credit.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
