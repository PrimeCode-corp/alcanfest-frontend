import { useState, type ReactNode } from 'react';
import { event, venueLocation } from '../../config/event';
import { LocationModal } from '../LocationModal/LocationModal';

export function Hero() {
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <section
      id='inicio'
      aria-labelledby='hero-title'
      className='relative isolate overflow-hidden bg-ink pt-(--header-h) text-paper lg:min-h-svh'
    >
      {/* Fondo: foto de portada */}
      <picture>
        <source
          type='image/webp'
          srcSet='/img/portada-1000.webp 1000w, /img/portada-1974.webp 1974w'
          sizes='100vw'
        />
        <img
          src='/img/portada.png'
          alt=''
          fetchPriority='high'
          className='absolute inset-0 -z-20 size-full object-cover object-[50%_30%]'
        />
      </picture>
      {/* Oscurece el lado del texto para que se lea */}
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10 bg-ink/65 lg:bg-transparent lg:bg-linear-to-r lg:from-ink/90 lg:via-ink/55 lg:to-ink/10'
      />

      <div className='mx-auto grid max-w-350 items-center gap-12 px-(--gutter) py-12 sm:py-16 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
        <div className='flex flex-col items-center text-center lg:block lg:text-left'>
          <p className='max-w-[12ch] font-display text-[clamp(3.25rem,7vw,6.5rem)] leading-[0.88] font-black tracking-tight uppercase'>
            {event.heroHeadline}
          </p>

          <h1
            id='hero-title'
            className='mt-6 max-w-[22ch] max-sm:sr-only font-display text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.05] font-extrabold'
          >
            {event.heroSubtitle}
          </h1>

          <p className='mt-5 inline-block bg-black px-3 pt-1.5 pb-1 font-display text-lg font-extrabold tracking-[0.06em] whitespace-nowrap uppercase sm:text-xl'>
            <span className='text-white'>#Talento</span>
            <span className='text-magenta'>EsLoQueSobra</span>
          </p>

          <div className='mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start'>
            <button
              type='button'
              onClick={() => setLocationOpen(true)}
              className='inline-block cursor-pointer border-2 border-ink bg-magenta px-4 py-2.5 text-sm font-bold sm:px-6 sm:py-3.5 sm:text-base text-paper shadow-[4px_4px_0_var(--color-ink)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)]'
            >
              {venueLocation.cta}
            </button>
            <SocialLink href={event.facebookUrl} label='Facebook de Alcanfest'>
              <path
                fill='currentColor'
                d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
              />
            </SocialLink>
            <SocialLink href={event.instagramUrl} label='Instagram de Alcanfest'>
              <g fill='none' stroke='currentColor' strokeWidth={2.4}>
                <rect x={1.7} y={1.7} width={20.6} height={20.6} rx={5.5} />
                <circle cx={12} cy={12} r={4.9} />
              </g>
              <circle cx={18.1} cy={5.9} r={1.5} fill='currentColor' />
            </SocialLink>
          </div>
        </div>

        {/* Flyer oficial cuadrado, como afiche pegado: en desktop el ancho se limita para que quepa en el alto de pantalla */}
        <div className='mx-auto w-full max-w-65 sm:max-w-90 lg:max-w-[min(540px,calc(100svh-var(--header-h)-6rem))]'>
          <img
            src='/img/flyer4-1254.webp'
            srcSet='/img/flyer4-800.webp 800w, /img/flyer4-1254.webp 1254w'
            sizes='(min-width: 1024px) 540px, (min-width: 640px) 360px, 260px'
            width={1254}
            height={1254}
            alt={`Flyer oficial de ${event.name} ${event.editionNumber}, festival de arte y cultura, del 01 al 13 de diciembre. Música y arte urbano, feria de arte y emprendimientos, talleres, conversatorios, batallas de rap, break dance, graffiti y barberos, concurso a la mejor banda de rock, artistas invitados.`}
            className='block w-full animate-flyer-in border-3 border-ink shadow-[10px_10px_0_var(--color-magenta)]'
          />
        </div>
      </div>

      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </section>
  );
}

/** Enlace cuadrado a una red social, del mismo alto que el botón vecino: `children` es el logo. */
function SocialLink({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={label}
      title={label}
      className='grid size-11 place-items-center border-2 border-paper text-paper transition-colors duration-150 hover:bg-paper hover:text-ink sm:size-14'
    >
      <svg viewBox='0 0 24 24' aria-hidden='true' className='size-5 sm:size-6'>
        {children}
      </svg>
    </a>
  );
}
