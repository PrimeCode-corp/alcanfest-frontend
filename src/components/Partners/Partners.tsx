import { event, partners } from '../../config/event';
import { Img } from '../Img/Img';

/**
 * Colaboradores: grilla de logos en cuadrados blancos (como "2026 Partners" de lollapalooza.com).
 * Cada logo abre la web del colaborador en otra pestaña.
 * 5 columnas en celular y tablet, 8 desde lg. La última fila incompleta queda centrada (flex-wrap),
 * por eso el ancho de cada cuadrado se calcula con las columnas y el espacio entre ellas.
 */
export function Partners() {
  return (
    <section
      id='colaboradores'
      aria-labelledby='partners-title'
      className='bg-ink px-(--gutter) pt-8 pb-20 text-paper [--cols:5] [--gap:0.5rem] sm:pb-28 sm:[--gap:1rem] lg:[--cols:8] lg:[--gap:2rem]'
    >
      <h2
        id='partners-title'
        className='text-center font-display text-[clamp(1.75rem,3.5vw,2.25rem)] leading-none font-black uppercase'
      >
        {event.edition} Colaboradores
      </h2>

      <ul className='mx-auto mt-8 flex max-w-280 flex-wrap justify-center gap-(--gap) sm:mt-10'>
        {partners.map((partner, i) => (
          <li key={i} className='aspect-square w-[calc((100%-(var(--cols)-1)*var(--gap))/var(--cols))]'>
            {/* Todo el cuadrado es el enlace; al pasar el mouse se levanta con sombra lima, como los botones */}
            <a
              href={partner.href}
              target='_blank'
              rel='noopener noreferrer'
              title={partner.name}
              className='img-slot block size-full bg-paper transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-lime)] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[6px_6px_0_var(--color-lime)] focus-visible:outline-none active:translate-0 active:shadow-[2px_2px_0_var(--color-lime)]'
            >
              <Img
                src={partner.logo}
                alt={partner.name}
                loading='lazy'
                // Margen interno con inset, no padding: un padding en % se mediría con el ancho de la grilla
                className='absolute inset-[8%] size-[84%] object-contain transition-opacity duration-300 ease-snap'
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
