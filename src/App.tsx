import { useCallback, useRef, useState } from 'react'
import { Header } from './components/Header/Header'
import { About } from './components/About/About'
import { Hero } from './components/Hero/Hero'
import { Merch } from './components/Merch/Merch'
import { Spot } from './components/Spot/Spot'
import { SideMenu } from './components/SideMenu/SideMenu'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open)
  }, [])

  return (
    <>
      <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} menuButtonRef={menuButtonRef} />
      <SideMenu open={menuOpen} onClose={closeMenu} />

      <main>
        <Hero />
        <Merch />
        <About />
        <Spot />
        {/* Placeholder: siguientes secciones */}
        <section className="min-h-[120vh]" />
      </main>
    </>
  )
}

export default App
