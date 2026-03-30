import { useState } from 'react'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Ticker from '../components/Ticker'
import About from '../components/About'
import Clients from '../components/Clients'
import Projects from '../components/Projects'
import Services from '../components/Services'
import Locations from '../components/Locations'
import Why from '../components/Why'
import Board from '../components/Board'
import PowerLeadership from '../components/PowerLeadership'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import useScrollReveal from '../hooks/useScrollReveal'

export default function Home() {
  const [barGone, setBarGone] = useState(false)

  useScrollReveal()

  return (
    <>
      <TopBar onClose={() => setBarGone(true)} />
      <Navbar barGone={barGone} />
      <Hero />
      <Ticker />
      <About />
      <Services />
      <Projects />
      <Clients />
      <Locations />
      <Why />
      <Board />
      <PowerLeadership />
      <Contact />
      <Footer />
    </>
  )
}
