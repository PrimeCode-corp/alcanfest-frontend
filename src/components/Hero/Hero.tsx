import { event } from '../../config/event';

export function Hero() {
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
            <a
              href={event.ticketsUrl}
              className='inline-block border-2 border-ink bg-magenta px-4 py-2.5 text-sm font-bold sm:px-6 sm:py-3.5 sm:text-base text-paper no-underline shadow-[4px_4px_0_var(--color-ink)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)]'
            >
              Comprar entradas
            </a>
            <a
              href='#lineup'
              className='inline-block border-2 border-paper px-4 py-2.5 text-sm font-bold sm:px-6 sm:py-3.5 sm:text-base text-paper no-underline transition-colors duration-150 hover:bg-paper hover:text-ink'
            >
              Ver line-up
            </a>
          </div>
        </div>

        {/* Flyer oficial cuadrado, como afiche pegado: en desktop el ancho se limita para que quepa en el alto de pantalla */}
        <div className='mx-auto w-full max-w-60 sm:max-w-90 lg:max-w-[min(540px,calc(100svh-var(--header-h)-6rem))]'>
          <img
            src='/img/flyer4-1254.webp'
            srcSet='/img/flyer4-800.webp 800w, /img/flyer4-1254.webp 1254w'
            sizes='(min-width: 1024px) 540px, (min-width: 640px) 360px, 240px'
            width={1254}
            height={1254}
            alt={`Flyer oficial de ${event.name} ${event.editionNumber}, festival de arte y cultura, del 01 al 13 de diciembre. Música y arte urbano, feria de arte y emprendimientos, talleres, conversatorios, batallas de rap, break dance, graffiti y barberos, concurso a la mejor banda de rock, artistas invitados.`}
            className='block w-full animate-flyer-in border-3 border-ink shadow-[10px_10px_0_var(--color-magenta)]'
          />
        </div>
      </div>
    </section>
  );
}
