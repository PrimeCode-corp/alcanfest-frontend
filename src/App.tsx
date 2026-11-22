import { useCallback, useEffect, useRef, useState } from 'react'
import { BackToTop } from './components/BackToTop/BackToTop'
import { CookiePolicy } from './components/CookiePolicy/CookiePolicy'
import { Experiences } from './components/Experiences/Experiences'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { About } from './components/About/About'
import { Hero } from './components/Hero/Hero'
import { Merch } from './components/Merch/Merch'
import { Spot, type SpotHandle } from './components/Spot/Spot'
import { Partners } from './components/Partners/Partners'
import { SideMenu } from './components/SideMenu/SideMenu'
import { ScheduleModal } from './components/ScheduleModal/ScheduleModal'
import { Updates } from './components/Updates/Updates'
import { cookiePolicy } from './config/cookiePolicy'
import { initSmoothAnchors, scrollToInitialHash } from './lib/smoothScroll'

// Sin router: la única página aparte es la política de cookies. Los dos hosts (Railway y Cloudflare) devuelven
// index.html para cualquier ruta, así que basta mirar la URL al cargar.
const isCookiePolicy = window.location.pathname.replace(/\/+$/, '') === cookiePolicy.path

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [spotSoundActive, setSpotSoundActive] = useState(false)
  const spotRef = useRef<SpotHandle>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open)
  }, [])

  const openSchedule = useCallback(() => {
    // El menú debe liberar el foco y el scroll antes de abrir el diálogo.
    if (menuOpen) closeMenu()
    setScheduleOpen(true)
  }, [menuOpen, closeMenu])

  const closeSchedule = useCallback(() => setScheduleOpen(false), [])

  // Desplazamiento suave al elegir una opción del menú, del footer o el logo del header
  useEffect(() => initSmoothAnchors(), [])

  // Llegada desde otra página con "/#seccion"
  useEffect(() => {
    if (!isCookiePolicy) scrollToInitialHash()
  }, [])

  return (
    <>
      <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} menuButtonRef={menuButtonRef} onOpenSchedule={openSchedule} />
      <SideMenu open={menuOpen} onClose={closeMenu} onOpenSchedule={openSchedule} />

      {isCookiePolicy ? (
        <main>
          <CookiePolicy />
          {/* Como en Lolla, los colaboradores cierran la página antes del footer */}
          <div className="bg-ink pt-16 sm:pt-20">
            <Partners />
          </div>
        </main>
      ) : (
        <main>
          <Hero />
          <Merch />
          <About />
          <Spot ref={spotRef} onSoundChange={setSpotSoundActive} />
          <Experiences />
          <Updates />
          <Partners />
        </main>
      )}
      <Footer onOpenSchedule={openSchedule} />
      <BackToTop soundActive={spotSoundActive} onMute={() => spotRef.current?.mute()} />
      <ScheduleModal open={scheduleOpen} onClose={closeSchedule} />
    </>
  )
}

export default App
