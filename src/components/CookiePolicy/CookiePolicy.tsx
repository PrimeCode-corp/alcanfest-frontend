import { useEffect, type ReactNode } from 'react';
import { cookiePolicy, type CookieLink } from '../../config/cookiePolicy';
import { cn } from '../../lib/cn';
import { CtaButton } from '../CtaButton/CtaButton';

const { technologies, categories, manage, contact } = cookiePolicy;

// Índice: el mismo orden que las secciones de abajo
const sections = [
  { id: 'tecnologias', title: technologies.title },
  { id: 'categorias', title: categories.title },
  { id: 'gestionar', title: manage.title },
  { id: 'contacto', title: contact.title }
];

function Section({ index, children }: { index: number; children: ReactNode }) {
  const { id, title } = sections[index];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className='scroll-mt-8'>
      <h2
        id={`${id}-title`}
        className='flex items-baseline gap-3 font-display text-[clamp(1.9rem,4.5vw,2.75rem)] leading-[0.95] font-black uppercase'
      >
        <span className='font-extrabold text-magenta' aria-hidden='true'>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{title}</span>
      </h2>
      <div className='mt-5 sm:mt-6'>{children}</div>
    </section>
  );
}

// Enlaces externos como etiquetas con borde y sombra dura, igual que los botones del sitio
function ExternalLinks({ links }: { links: CookieLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className='mt-4 flex flex-wrap gap-2.5 sm:gap-3'>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1.5 text-sm font-bold text-ink no-underline shadow-[3px_3px_0_var(--color-ink)] transition-[translate,box-shadow,background-color] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)] sm:text-base'
          >
            {link.label}
            <span aria-hidden='true'>↗</span>
            <span className='sr-only'>(se abre en otra pestaña)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Política de cookies (como lollapalooza.com/cookie-policy): título con la fecha de actualización, introducción y
 * secciones numeradas. En celular todo va en una columna; desde lg, un índice fijo a la izquierda. Los textos están
 * en `src/config/cookiePolicy.ts`.
 */
export function CookiePolicy() {
  // Título de la pestaña y canonical propios de esta página (index.html trae los del inicio)
  useEffect(() => {
    const prevTitle = document.title;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.href;
    document.title = cookiePolicy.pageTitle;
    canonical?.setAttribute('href', `https://www.alcanfest.com${cookiePolicy.path}`);
    return () => {
      document.title = prevTitle;
      if (canonical && prevCanonical) canonical.setAttribute('href', prevCanonical);
    };
  }, []);

  return (
    <article
      aria-labelledby='cookie-policy-title'
      className='bg-paper px-(--gutter) pt-[calc(var(--header-h)+3rem)] pb-20 text-ink sm:pt-[calc(var(--header-h)+4.5rem)] sm:pb-28'
    >
      <div className='mx-auto max-w-300'>
        {/* Encabezado: título sobre recuadro lima y fecha en etiqueta magenta */}
        <header className='max-w-4xl'>
          <p className='inline-block bg-magenta px-2.5 pt-1.5 pb-1 font-display text-base leading-none font-extrabold tracking-[0.02em] text-paper uppercase sm:text-lg'>
            {cookiePolicy.updated}
          </p>
          <h1
            id='cookie-policy-title'
            className='mt-4 font-display text-[clamp(3rem,11vw,6.5rem)] leading-[0.95] font-black uppercase'
          >
            <span className='box-decoration-clone bg-lime px-2 sm:px-3'>{cookiePolicy.title}</span>
          </h1>
        </header>

        <div className='mt-12 grid gap-12 sm:mt-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16'>
          {/* Índice: solo desde lg, fijo bajo el header mientras se lee */}
          <nav aria-label='Contenido de la política' className='hidden lg:block'>
            <div className='sticky top-[calc(var(--header-h)+2rem)] border-2 border-ink p-5 shadow-[6px_6px_0_var(--color-magenta)]'>
              <p className='font-display text-xl leading-none font-black uppercase'>Contenido</p>
              <ol className='mt-4 flex flex-col gap-3'>
                {sections.map((section, i) => (
                  <li key={section.id} className='flex gap-2.5 text-[0.95rem] leading-snug'>
                    <span className='w-5 shrink-0 font-display font-extrabold text-magenta' aria-hidden='true'>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <a
                      href={`#${section.id}`}
                      className='font-medium text-ink no-underline decoration-magenta decoration-2 underline-offset-4 hover:underline'
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className='flex max-w-3xl flex-col gap-14 sm:gap-20'>
            {/* Introducción */}
            <div>
              <h2 className='font-display text-[clamp(1.6rem,3.5vw,2.1rem)] leading-none font-black uppercase'>
                {cookiePolicy.heading}
              </h2>
              <div className='mt-5 flex flex-col gap-4 text-lg leading-relaxed text-ink/85'>
                {cookiePolicy.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <Section index={0}>
              <p className='text-lg leading-relaxed text-ink/85'>{technologies.text}</p>
              <dl className='mt-6 grid gap-4 sm:grid-cols-2'>
                {technologies.items.map((item) => (
                  <div key={item.name} className='border-2 border-ink p-5'>
                    <dt className='font-display text-2xl leading-none font-black uppercase'>{item.name}</dt>
                    <dd className='mt-2.5 leading-relaxed text-ink/80'>{item.text}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section index={1}>
              <p className='text-lg leading-relaxed text-ink/85'>{categories.text}</p>
              <ul className='mt-6 flex flex-col gap-4'>
                {categories.items.map((item) => (
                  <li
                    key={item.name}
                    className={cn(
                      'border-2 border-ink p-5 sm:p-6',
                      item.active ? 'shadow-[6px_6px_0_var(--color-lime)]' : 'shadow-[6px_6px_0_var(--color-ink)]',
                    )}
                  >
                    <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5'>
                      <h3 className='font-display text-2xl leading-none font-black uppercase sm:text-[1.75rem]'>
                        {item.name}
                      </h3>
                      <span
                        className={cn(
                          'border-2 border-ink px-2 pt-1 pb-0.5 font-display text-sm leading-none font-extrabold tracking-[0.03em] uppercase',
                          item.active ? 'bg-lime' : 'bg-paper text-ink/70',
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className='mt-3 leading-relaxed text-ink/80'>{item.text}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section index={2}>
              <div className='flex flex-col gap-10'>
                {manage.sections.map((item) => (
                  <div key={item.name} className='border-l-4 border-magenta pl-4 sm:pl-6'>
                    <h3 className='font-display text-2xl leading-none font-black uppercase sm:text-[1.75rem]'>
                      {item.name}
                    </h3>
                    <p className='mt-3 text-lg leading-relaxed text-ink/85'>{item.text}</p>
                    <ExternalLinks links={item.links} />
                  </div>
                ))}
              </div>
            </Section>

            <Section index={3}>
              <div className='bg-ink p-6 text-paper shadow-[6px_6px_0_var(--color-magenta)] sm:p-8'>
                <p className='text-lg leading-relaxed text-paper/90'>{contact.text}</p>
                <div className='mt-6'>
                  <CtaButton
                    label={contact.cta}
                    available
                    href={contact.href}
                    external
                    className='bg-lime px-5 pt-2.5 pb-2 font-display text-xl font-extrabold tracking-[0.02em] text-ink uppercase shadow-[4px_4px_0_var(--color-magenta)] sm:px-6 sm:text-2xl'
                    interactiveClassName='hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]'
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </article>
  );
}
