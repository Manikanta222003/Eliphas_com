import './Hero.css'
import { useEffect, useRef, useState } from 'react'
import img0 from '../assets/hero0.png'
import img1 from '../assets/hero1.jpeg'
import img2 from '../assets/hero2.jpeg'
import img3 from '../assets/hero3.jpeg'
import img4 from '../assets/hero4.jpeg'
import img5 from '../assets/hero5.jpeg'
import img6 from '../assets/hero6.jpeg'
import img7 from '../assets/hero7.jpeg'
import img8 from '../assets/hero8.png'

const CAROUSEL_IMAGES = [img0, img1, img2, img3, img4, img5, img6, img7, img8]
const SLIDE_DURATION = 4000
const MOBILE_HERO_SUBTEXT = 'Moving Cargo Delivering Trust'

const SLIDE_CONTENT = [
 
  {
    eyebrow: 'Welcome to Eliphas Shipping Services',
  h1: <>Welcome to Eliphas.</>,
    sub: 'Moving Cargo Delivering Trust.',
  },
  
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideTimerRef = useRef(null)

  const goToSlide = (index) => setCurrentSlide((index + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
  const prevSlide = () => goToSlide(currentSlide - 1)

  useEffect(() => {
    slideTimerRef.current = setInterval(nextSlide, SLIDE_DURATION)
    return () => clearInterval(slideTimerRef.current)
  }, [])

  const heroImgRef = useRef(null)
  const heroH1Ref = useRef(null)
  const heroSubRef = useRef(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const sy = window.scrollY
        if (sy < window.innerHeight) {
          if (heroImgRef.current) heroImgRef.current.style.transform = `scale(1.06) translateY(${sy * 0.25}px)`
          if (heroH1Ref.current) heroH1Ref.current.style.transform = `translateY(${sy * 0.08}px) translateZ(0)`
          if (heroSubRef.current) heroSubRef.current.style.transform = `translateY(${sy * 0.05}px)`
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleHsEnter = (e) => {
    const num = e.currentTarget.querySelector('.hs-n')
    if (num) num.style.transform = 'perspective(300px) translateZ(16px) rotateX(-6deg)'
  }

  const handleHsLeave = (e) => {
    const num = e.currentTarget.querySelector('.hs-n')
    if (num) num.style.transform = ''
  }

  const content = SLIDE_CONTENT[currentSlide] || SLIDE_CONTENT[0]

  const renderSlides = (variant) => (
    CAROUSEL_IMAGES.map((src, i) => (
      <div
        key={`${variant}-${i}`}
        className={`hero-slide${i === currentSlide ? ' is-active' : ''}`}
        style={{
          backgroundImage: `url('${src}')`,
          backgroundPosition: 'center center',
        }}
      />
    ))
  )

  return (
    <section id="hero">
      <div className="hero-bg-desktop" ref={heroImgRef}>
        {renderSlides('desktop')}
      </div>

      <div className="hero-mobile-media">
        {renderSlides('mobile')}
      </div>

      <div className="hero-mobile-content">
        <h1 className="hero-mobile-title">WELCOME TO ELIPHAS</h1>
        <p className="hero-mobile-sub">{MOBILE_HERO_SUBTEXT}</p>

        <a href="#about" className="hero-mobile-scroll" aria-label="Scroll to about section">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 7l6 6 6-6" />
            <path d="M6 12l6 6 6-6" />
          </svg>
        </a>

        <div className="hero-mobile-dots">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-mobile-dot${i === currentSlide ? ' is-active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="hero-content" key={currentSlide} style={{ animation: 'heroContentFade .7s ease forwards' }}>
        <div className="hero-copy-shell">
          <p className="hero-eyebrow">
            <span className="hero-eyebrow-line"></span>
            {content.eyebrow}
          </p>
          <h1 className="hero-h1" ref={heroH1Ref}>{content.h1}</h1>
          <p className="hero-sub" ref={heroSubRef}>{content.sub}</p>
          <div className="hero-acts">
            <a href="#services" className="btn-primary">Explore Services &rarr;</a>
          </div>
        </div>
      </div>

      <div className="hero-stats">
        <div className="hs" onMouseEnter={handleHsEnter} onMouseLeave={handleHsLeave}>
          <div className="hs-n">9+</div><div className="hs-l">Core Services</div>
        </div>
        <div className="hs-div"></div>
        <div className="hs" onMouseEnter={handleHsEnter} onMouseLeave={handleHsLeave}>
          <div className="hs-n">100%</div><div className="hs-l">Safety Focused</div>
        </div>
        <div className="hs-div"></div>
        <div className="hs" onMouseEnter={handleHsEnter} onMouseLeave={handleHsLeave}>
          <div className="hs-n">E-2-E</div><div className="hs-l">Execution</div>
        </div>
      </div>

      <div className="scroll-cue"><span>Scroll</span><div className="scroll-line"></div></div>

      <button onClick={prevSlide} style={arrowStyle('left')} className="hero-arrow" aria-label="Previous slide">&#8249;</button>
      <button onClick={nextSlide} style={arrowStyle('right')} className="hero-arrow" aria-label="Next slide">&#8250;</button>

      <div style={dotsWrapStyle} className="hero-dots">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              ...dotStyle,
              background: i === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.35)',
              transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </section>
  )
}

const arrowStyle = (side) => ({
  position: 'absolute', top: '50%', [side]: '2rem',
  transform: 'translateY(-50%)', zIndex: 10,
  background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(13,37,85,0.12)',
  color: '#0d2555', fontSize: '2.2rem', lineHeight: 1,
  width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.3s', backdropFilter: 'blur(4px)',
  boxShadow: '0 14px 30px rgba(13,37,85,0.12)',
})

const dotsWrapStyle = {
  position: 'absolute', bottom: '5.5rem', left: '50%',
  transform: 'translateX(-50%)', zIndex: 10,
  display: 'flex', gap: '0.5rem', alignItems: 'center',
}

const dotStyle = {
  width: '8px', height: '8px', borderRadius: '50%',
  border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease',
}
