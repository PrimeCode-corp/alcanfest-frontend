import { useState } from 'react';
import { merch, type MerchItem } from '../../config/event';
import { cn } from '../../lib/cn';
import { FlyerCarouselModal } from '../FlyerModal/FlyerCarouselModal';
import { FlyerModal } from '../FlyerModal/FlyerModal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const { flyer, carousel } = item;
  const hasModal = Boolean(flyer || carousel);

  return (
    <>
      <a
        // Con modal, el clic lo abre; el href a la imagen queda para abrirla en otra pestaña
        href={flyer?.image ?? carousel?.slides[0]?.image ?? item.href}
        aria-haspopup={hasModal ? 'dialog' : undefined}
        onClick={
          hasModal
            ? (e) => {
                e.preventDefault();
                setModalOpen(true);
              }
            : undefined
        }
        className={cn(
          'group relative isolate flex aspect-[4/3] flex-col justify-center gap-3 overflow-hidden py-5 border-3 border-paper text-paper no-underline shadow-[6px_6px_0_var(--color-lime)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--color-magenta)]',
          toneBg[item.tone],
        )}
      >
        {/* Imagen + info forman un bloque centrado verticalmente en la card (mismo espacio arriba y abajo).
            La imagen mide 50% del alto de la card, pero se encoge si la info no entra (cards bajas en celular/tablet). */}
        {item.image && (
          <div className='flex min-h-0 basis-1/2 items-center justify-center px-4'>
            <img
              src={item.image}
              alt=''
              loading='lazy'
              className='block h-full w-auto max-w-full object-contain transition-transform duration-300 ease-snap group-hover:scale-105'
            />
          </div>
        )}

        {/* Degradado para que el texto se lea sobre cualquier foto */}
        <div aria-hidden='true' className='absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/45 via-40% to-transparent to-75%' />

        {/* Info dentro de la card */}
        <div className='flex shrink-0 flex-col items-center gap-0.5 px-4 text-center sm:px-5'>
          <h3 className='font-display text-3xl leading-none font-black uppercase'>{item.label}</h3>
          <p className='text-sm text-paper/90 sm:text-base'>{item.tagline}</p>
          <span className='mt-3 inline-block border-2 border-ink bg-paper px-3.5 py-1.5 text-xs sm:text-sm font-bold text-ink uppercase shadow-[4px_4px_0_var(--color-magenta)] transition-colors duration-150 group-hover:bg-lime'>
            {item.cta ?? 'Comprar merch'}
          </span>
        </div>
      </a>
      {flyer && <FlyerModal flyer={flyer} open={modalOpen} onClose={() => setModalOpen(false)} />}
      {carousel && <FlyerCarouselModal carousel={carousel} open={modalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
}
