import { merch, type MerchItem } from '../../config/event';
import { cn } from '../../lib/cn';

const toneClasses: Record<MerchItem['tone'], string> = {
  lime: 'bg-lime text-ink',
  magenta: 'bg-magenta text-paper',
  ink: 'bg-ink text-lime',
};

// Fondo de la card: se ve detrás de las fotos de merch recortadas (PNG/WebP con transparencia)
const toneBg: Record<MerchItem['tone'], string> = {
  lime: 'bg-lime',
  magenta: 'bg-magenta',
  ink: 'bg-ink',
};

export function Merch() {
  return (
    <section
      id='merch'
      aria-label='Merch oficial'
      // Mismo margen lateral (--gutter) que el header, así las cards alinean con el botón de menú
      className='bg-ink px-(--gutter) py-16 sm:py-20'
    >
      <ul className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {merch.map((item) => (
          <li key={item.label}>
            <MerchCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MerchCard({ item }: { item: MerchItem }) {
  return (
    <a
      href={item.href}
      className={cn(
        'group relative isolate flex aspect-[1200/711] flex-col justify-end overflow-hidden border-3 border-paper text-paper no-underline shadow-[6px_6px_0_var(--color-lime)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--color-magenta)]',
        toneBg[item.tone],
      )}
    >
      {/* Fondo: foto del merch o panel de color como placeholder */}
      {item.image ? (
        <img
          src={item.image}
          alt=''
          loading='lazy'
          className='absolute inset-0 -z-20 size-full object-contain p-4 transition-transform duration-300 ease-snap group-hover:scale-105'
        />
      ) : (
        <div
          aria-hidden='true'
          className={cn(
            'absolute inset-0 -z-20 grid place-items-start justify-items-end p-5 transition-transform duration-300 ease-snap group-hover:scale-105',
            toneClasses[item.tone],
          )}
        >
          <span className='-rotate-6 font-display text-[clamp(2.25rem,5vw,4rem)] leading-none font-black uppercase'>
            {item.label}
          </span>
        </div>
      )}

      {/* Degradado para que el texto se lea sobre cualquier foto */}
      <div aria-hidden='true' className='absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/45 via-40% to-transparent to-75%' />

      {/* Info dentro de la card */}
      <div className='flex flex-col items-start gap-0.5 p-4 sm:p-5'>
        <h3 className='font-display text-3xl leading-none font-black uppercase'>{item.label}</h3>
        <p className='text-sm text-paper/90 sm:text-base'>{item.tagline}</p>
        <span className='mt-3 inline-block border-2 border-ink bg-paper px-3.5 py-1.5 text-xs sm:text-sm font-bold text-ink uppercase shadow-[4px_4px_0_var(--color-magenta)] transition-colors duration-150 group-hover:bg-lime'>
          Comprar merch
        </span>
      </div>
    </a>
  );
}
