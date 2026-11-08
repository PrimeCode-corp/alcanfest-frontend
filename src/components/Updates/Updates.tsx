import { updates } from '../../config/event';
import { CtaButton } from '../CtaButton/CtaButton';

/**
 * Sede y novedades: dos llamadas a la acción centradas, lado a lado desde sm y apiladas en celular
 * (como "2026 tickets" / "Be the first to know" de lollapalooza.com). Los textos están en `updates` (config).
 */
export function Updates() {
  return (
    <section id='sede' aria-label='Sede y novedades' className='bg-ink px-(--gutter) py-20 text-paper sm:py-28'>
      <div className='mx-auto flex max-w-4xl flex-col items-center gap-14 sm:flex-row sm:items-start sm:justify-center sm:gap-12 lg:gap-16'>
        {updates.map((item) => (
          <div key={item.title} className='flex flex-col items-center text-center'>
            <h2 className='font-display text-[clamp(2.25rem,4.5vw,3rem)] leading-[0.95] font-black uppercase'>
              {item.title}
            </h2>
            <p className='mt-3 text-base text-paper/85 sm:text-lg'>{item.text}</p>
            <div className='mt-6'>
              <CtaButton
                label={item.cta}
                available={item.available}
                href={item.href || undefined}
                external={item.external}
                className='bg-lime px-5 pt-2.5 pb-2 font-display text-xl font-extrabold tracking-[0.02em] text-ink uppercase shadow-[4px_4px_0_var(--color-magenta)] sm:px-6 sm:text-2xl'
                interactiveClassName='hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]'
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
