import './About.css'
import { useState, useRef } from 'react'
import DirectorsModal from './DirectorsModal'

export default function About() {
  const [modalOpen, setModalOpen] = useState(false)
  const imgColRef = useRef(null)

  const handleMouseMove = (e) => {
    const col = imgColRef.current
    if (!col) return
    const r = col.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    col.style.transform = `perspective(1000px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`
  }
  const handleMouseLeave = () => {
    if (imgColRef.current) imgColRef.current.style.transform = ''
  }

  const features = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0b1f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
      title: 'Skilled Workforce & Project Management',
      desc: 'Experienced teams delivering precise outcomes on every engagement.',
      delay: 'd2',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0b1f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
      title: 'Modern Equipment & Operational Systems',
      desc: 'State-of-the-art tools and frameworks for maximum efficiency.',
      delay: 'd3',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0b1f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z"/></svg>,
      title: 'Compliance-Driven, Safety-Focused Culture',
      desc: 'Rigorous safety standards embedded across all operations.',
      delay: 'd4',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0b1f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
      title: 'Long-Term Client Partnerships',
      desc: 'Relationships built on transparency, integrity, and proven results.',
      delay: 'd5',
    },
  ]

  return (
    <section id="about">
      <div className="about-grid">
        <div
          className="about-img-col rvl"
          ref={imgColRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=85"
            alt="Industrial operations and workforce"
            loading="lazy"
          />
          <div className="about-badge">
            <div className="ab-n">Multi</div>
            <div className="ab-t">Domain Expertise</div>
          </div>
        </div>

        <div className="about-cont">
          <div className="rv">
            <p className="section-tag">Who We Are</p>
            <h2 className="section-title">
              Professionally<br />Managed.<br /><em>Results</em> Driven.
            </h2>
            <div className="sbar"></div>
          </div>

          <p className="about-body rv d2">
            Eliphas Shipping Services Pvt Ltd is a professionally managed organization delivering integrated solutions across logistics, mining, and civil infrastructure works.
            <br /><br />
            Our approach combines technical expertise, operational discipline, and a strong commitment to client satisfaction. With a growing footprint and a versatile service portfolio, we support businesses and projects that demand precision, reliability, and accountability.
          </p>

          <div className="si-list">
            {features.map((f, i) => (
              <div className={`si rv ${f.delay}`} key={i}>
                <div className="si-icon">{f.icon}</div>
                <div className="si-t">
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rv d5" style={{ marginTop: '2.5rem' }}>
            <button className="dir-btn" onClick={() => setModalOpen(true)}>
              <span className="dir-btn-inner">
                <span className="dir-btn-avatars">
                  <span className="dir-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <span className="dir-avatar dir-avatar-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                </span>
                <span className="dir-btn-text">
                  <span className="dir-btn-label">Meet Our Directors</span>
                  <span className="dir-btn-sub">Leadership · Vision · Excellence</span>
                </span>
                <span className="dir-btn-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </span>
              <span className="dir-btn-glow"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="vm-row">
        <div className="vm-card rv d1">
          <h3>Our Vision</h3>
          <p>To be a trusted and respected service provider delivering efficient logistics and sustainable infrastructure solutions that contribute to long-term growth for every client and community we serve.</p>
        </div>
        <div className="vm-card rv d3">
          <h3>Our Mission</h3>
          <ul>
            <li>Provide dependable, high-quality logistics and infrastructure services</li>
            <li>Execute projects safely, efficiently, and within timelines</li>
            <li>Build lasting relationships through transparency and integrity</li>
            <li>Continuously improve capabilities and service standards</li>
          </ul>
        </div>
      </div>

      <DirectorsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  )
}
