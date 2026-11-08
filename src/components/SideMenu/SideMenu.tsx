import { useEffect, useRef, type CSSProperties } from 'react'
import { footer, helpNav, primaryNav, socialNav, type NavLink } from '../../config/event'
import { cn } from '../../lib/cn'

type SideMenuProps = {
  open: boolean
  onClose: () => void
}

function linkProps(link: NavLink) {
  return link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Esc para cerrar, foco atrapado dentro del panel, scroll del body bloqueado.
  // El foco va al panel (no al primer enlace) para no dejar ningún enlace resaltado al abrir.
  // Para cerrar: el botón del header, Esc o un clic fuera del panel.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : []

    panel?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <div
      className={cn('fixed inset-x-0 top-(--header-h) bottom-0 z-40', open ? 'pointer-events-auto' : 'pointer-events-none')}
      inert={!open}
    >
      <div
        className={cn('absolute inset-0 bg-ink/50 transition-opacity duration-300 ease-snap', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="side-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        tabIndex={-1}
        className={cn(
          'scrollbar-none absolute inset-y-0 left-0 flex w-[min(460px,100vw)] flex-col gap-10 overflow-y-auto overscroll-contain border-r-4 border-magenta bg-ink px-(--gutter) py-8 text-paper outline-none transition-transform duration-[420ms] ease-snap',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav aria-label="Secciones">
          {/* Separación entre opciones: los titulares largos ocupan dos líneas y no deben confundirse con dos opciones */}
          <ul className="grid gap-2.5">
            {primaryNav.map((link, i) => (
              <li
                key={link.href}
                style={{ '--i': i } as CSSProperties}
                className={cn(
                  'transition-[opacity,translate] duration-400 ease-snap',
                  open ? 'translate-x-0 opacity-100 delay-[calc(120ms+var(--i)*40ms)]' : '-translate-x-6 opacity-0',
                )}
              >
                <a
                  href={link.href}
                  onClick={onClose}
                  className="inline-block py-0.5 font-display text-[clamp(2.25rem,8.5vw,3rem)] leading-[0.9] font-black uppercase no-underline transition-[color,translate] duration-200 ease-snap hover:translate-x-2.5 hover:text-lime-bright focus-visible:translate-x-2.5 focus-visible:text-lime-bright"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-2 gap-6 border-t-2 border-paper/25 pt-6">
          <MenuGroup title="Ayuda" links={helpNav} onNavigate={onClose} />
          <MenuGroup title="Síguenos" links={socialNav} />
        </div>

        {/* "Entérate primero": mismo texto y enlace (Instagram) que en la sección de sede y el footer */}
        <a
          href={footer.newsletter.href}
          {...(footer.newsletter.external && { target: '_blank', rel: 'noopener noreferrer' })}
          className="mt-auto grid gap-0.5 border-2 border-ink bg-lime px-5 py-[18px] text-ink no-underline shadow-[4px_4px_0_var(--color-magenta)] transition-[translate,box-shadow] duration-150 ease-snap hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-magenta)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-magenta)]"
        >
          <strong className="font-display text-2xl leading-[1.05] font-black uppercase">{footer.newsletter.title}</strong>
          <span className="text-sm">{footer.newsletter.text}</span>
        </a>
      </div>
    </div>
  )
}

type MenuGroupProps = {
  title: string
  links: NavLink[]
  onNavigate?: () => void
}

function MenuGroup({ title, links, onNavigate }: MenuGroupProps) {
  return (
    <section>
      <h2 className="mb-2.5 font-display text-xl font-extrabold text-magenta">{title}</h2>
      <ul className="grid gap-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={link.external ? undefined : onNavigate}
              {...linkProps(link)}
              className="text-[0.95rem] no-underline underline-offset-3 hover:text-lime-bright hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
