import { useEffect, useRef, useState, type RefObject } from 'react'
import { event } from '../../config/event'
import { cn } from '../../lib/cn'

type HeaderProps = {
  menuOpen: boolean
  onToggleMenu: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

const bar =
  'absolute left-0 h-[3px] rounded-xs bg-current transition-[translate,rotate,opacity,width] duration-300 ease-snap'

export function Header({ menuOpen, onToggleMenu, menuButtonRef }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raf = { id: 0 }

    // Progreso de lectura: se escribe directo en el estilo (sin re-render en cada scroll)
    const updateProgress = () => {
      raf.id = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      progressRef.current?.style.setProperty('scale', `${progress} 1`)
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      if (!raf.id) raf.id = requestAnimationFrame(updateProgress)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf.id)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-(--header-h) bg-lime text-ink transition-shadow duration-250 ease-snap',
        (scrolled || menuOpen) && 'shadow-[0_5px_0_var(--color-ink)]',
      )}
    >
      <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-4 px-(--gutter) sm:grid-cols-[1fr_auto_1fr]">
        {/* Botón de menú */}
        <button
          ref={menuButtonRef}
          type="button"
          className="group inline-flex cursor-pointer items-center gap-3 justify-self-start px-1 py-2.5 font-bold"
          aria-expanded={menuOpen}
          aria-controls="side-menu"
          onClick={onToggleMenu}
        >
          <span className="relative h-[18px] w-7" aria-hidden="true">
            <span
              className={cn(
                bar,
                'top-0 w-full group-aria-expanded:translate-y-[7.5px] group-aria-expanded:rotate-45',
              )}
            />
            <span className={cn(bar, 'top-[7.5px] w-[70%] group-hover:w-full group-aria-expanded:opacity-0')} />
            <span
              className={cn(
                bar,
                'top-[15px] w-[85%] group-hover:w-full group-aria-expanded:w-full group-aria-expanded:-translate-y-[7.5px] group-aria-expanded:-rotate-45',
              )}
            />
          </span>
          <span className="max-sm:hidden">{menuOpen ? 'Cerrar' : 'Menú'}</span>
        </button>

        {/* Logo + línea + fecha y lugar */}
        <div className="flex items-center gap-[18px] justify-self-center">
          <a href="#inicio" className="block leading-none">
            <img
              src={event.logo}
              alt={`${event.name} ${event.edition}, ${event.tagline.toLowerCase()}. Ir al inicio`}
              width={720}
              height={355}
              className="block h-[calc(var(--header-h)-14px)] w-auto"
            />
          </a>
          <p className="my-3.5 hidden flex-col items-start justify-center self-stretch border-l-3 border-ink pl-[18px] font-display text-[1.1rem] leading-none font-extrabold whitespace-nowrap text-paper lg:flex">
            <span className="bg-magenta px-2 pt-1 pb-[3px]">{event.dates}</span>
            <span className="bg-ink px-2 pt-1 pb-[3px]">
              {event.venue}, {event.city}
            </span>
          </p>
        </div>

        {/* Entradas */}
        <div className="justify-self-end">
          <a
            href={event.ticketsUrl}
            className="inline-block border-2 border-ink bg-magenta px-3.5 py-2 text-sm font-bold whitespace-nowrap text-paper no-underline shadow-[3px_3px_0_var(--color-ink)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)] sm:px-5 sm:py-3 sm:text-base"
          >
            <span className="max-xs:sr-only">Comprar entradas</span>
            <span className="xs:hidden" aria-hidden="true">
              Entradas
            </span>
          </a>
        </div>
      </div>

      {/* Barra de progreso del scroll: va sobre la línea negra inferior del header */}
      <div
        ref={progressRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-[5px] origin-left bg-magenta"
        style={{ scale: '0 1' }}
      />
    </header>
  )
}
