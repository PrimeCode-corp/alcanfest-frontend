import { useCallback, useEffect, useRef, useState } from 'react'
import { BackToTop } from './components/BackToTop/BackToTop'
import { Experiences } from './components/Experiences/Experiences'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { About } from './components/About/About'
import { Hero } from './components/Hero/Hero'
import { Merch } from './components/Merch/Merch'
import { Spot, type SpotHandle } from './components/Spot/Spot'
import { Partners } from './components/Partners/Partners'
import { SideMenu } from './components/SideMenu/SideMenu'
import { Updates } from './components/Updates/Updates'
import { initSmoothAnchors } from './lib/smoothScroll'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Desplazamiento suave al elegir una opción del menú, del footer o el logo del header
  useEffect(() => initSmoothAnchors(), [])

  return (
    <>
      <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} menuButtonRef={menuButtonRef} />
      <SideMenu open={menuOpen} onClose={closeMenu} />

      <main>
        <Hero />
        <Merch />
        <About />
        <Spot ref={spotRef} onSoundChange={setSpotSoundActive} />
        <Experiences />
        <Updates />
        <Partners />
      </main>
      <Footer />
      <BackToTop soundActive={spotSoundActive} onMute={() => spotRef.current?.mute()} />
    </>
  )
}

export default App
