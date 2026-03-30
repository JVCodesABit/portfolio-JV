import dynamic from 'next/dynamic'
import CustomCursor from '@/components/CustomCursor'
import Loader from '@/components/Loader'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import MarqueeTicker from '@/components/MarqueeTicker'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Achievements from '@/components/Achievements'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

// Three.js must be client-only (no SSR)
const ParticleField = dynamic(() => import('@/components/ParticleField'), {
  ssr: false,
})

export default function Home() {
  return (
    <>
      <Loader />
      <CustomCursor />

      {/* Fixed 3D background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField />
      </div>

      <Nav />

      <main className="relative z-10">
        <Hero />
        <MarqueeTicker />
        <About />
        <Skills />
        <Projects />
        <Achievements />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
