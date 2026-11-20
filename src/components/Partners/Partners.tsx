import { event, partners, sponsors, type Partner } from '../../config/event';
import { Img } from '../Img/Img';

/**
 * Colaboradores y, justo debajo, patrocinadores: misma grilla de logos en cuadrados blancos
 * (como "2026 Partners" de lollapalooza.com). Cierran la página antes del footer.
 */
export function Partners() {
  return (
    <div className='bg-ink pb-20 text-paper sm:pb-28'>
      <LogoSection id='colaboradores' title={`${event.edition} Colaboradores`} items={partners} className='pt-8' />
      <LogoSection id='patrocinadores' title={`${event.edition} Patrocinadores`} items={sponsors} className='pt-16 sm:pt-20' />
    </div>
  );
}

/**
 * Cada logo abre la web del colaborador/patrocinador en otra pestaña; los que no tienen `href` se muestran sin enlace.
 * 5 columnas en celular y tablet, 8 desde lg. La última fila incompleta queda centrada (flex-wrap),
 * por eso el ancho de cada cuadrado se calcula con las columnas y el espacio entre ellas.
 */
function LogoSection({ id, title, items, className = '' }: { id: string; title: string; items: Partner[]; className?: string }) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`px-(--gutter) [--cols:5] [--gap:0.5rem] sm:[--gap:1rem] lg:[--cols:8] lg:[--gap:2rem] ${className}`}
    >
      <h2
        id={titleId}
        className='text-center font-display text-[clamp(1.75rem,3.5vw,2.25rem)] leading-none font-black uppercase'
      >
        {title}
      </h2>

      <ul className='mx-auto mt-8 flex max-w-280 flex-wrap justify-center gap-(--gap) sm:mt-10'>
        {items.map((partner) => {
          const logo = (
            <Img
              src={partner.logo}
              alt={partner.name}
              loading='lazy'
              // Margen interno con inset, no padding: un padding en % se mediría con el ancho de la grilla
              className='absolute inset-[8%] size-[84%] object-contain transition-opacity duration-300 ease-snap'
            />
          );
          return (
            <li key={partner.name} className='aspect-square w-[calc((100%-(var(--cols)-1)*var(--gap))/var(--cols))]'>
              {partner.href ? (
                // Todo el cuadrado es el enlace; al pasar el mouse se levanta con sombra lima, como los botones
                <a
                  href={partner.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={partner.name}
                  className='img-slot block size-full bg-paper transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-lime)] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[6px_6px_0_var(--color-lime)] focus-visible:outline-none active:translate-0 active:shadow-[2px_2px_0_var(--color-lime)]'
                >
                  {logo}
                </a>
              ) : (
                // Sin web ni red social: mismo cuadrado, sin enlace ni efecto al pasar el mouse
                <div title={partner.name} className='img-slot size-full bg-paper'>
                  {logo}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
