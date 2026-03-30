import './Why.css'
import { useRef } from 'react'

const features = [
  { num: '01', title: 'Professional & Experienced Operations Team', desc: 'Seasoned professionals who understand the complexity of logistics, mining, and civil works — delivering measurable outcomes every time.' },
  { num: '02', title: 'End-to-End Project Execution', desc: 'From initial planning to final handover, we manage the complete project lifecycle so you can focus on what matters most.' },
  { num: '03', title: 'Strong Focus on Safety & Compliance', desc: 'Safety is non-negotiable. Every operation follows rigorous compliance standards to protect people, assets, and the environment.' },
  { num: '04', title: 'Timely Delivery & Cost-Effective Solutions', desc: 'We respect timelines and budgets — delivering quality results without compromise on efficiency or value.' },
  { num: '05', title: 'Transparency & Long-Term Partnerships', desc: 'Relationships grounded in integrity and honest communication, earning client trust that extends well beyond individual projects.' },
]

export default function Why() {
  const wrapRef = useRef(null)

  const handleMouseMove = (e) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const r = wrap.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    const img = wrap.querySelector('.why-img-m')
    const badge = wrap.querySelector('.why-badge')
    if (img) img.style.transform = `perspective(800px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg) scale(1.02)`
    if (badge) badge.style.transform = `perspective(600px) translateZ(${28 + dx * 8}px) translateY(${-dy * 6}px)`
  }
  const handleMouseLeave = () => {
    const wrap = wrapRef.current
    if (!wrap) return
    const img = wrap.querySelector('.why-img-m')
    const badge = wrap.querySelector('.why-badge')
    if (img) img.style.transform = ''
    if (badge) badge.style.transform = ''
  }

  return (
    <section id="why">
      <div className="rv">
        <p className="section-tag">Why Eliphas</p>
        <h2 className="section-title">Built for <em>Performance.</em></h2>
        <div className="sbar"></div>
      </div>
      <div className="why-grid">
        <div className="rvl">
          <div
            className="why-img-w"
            ref={wrapRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="why-badge">
              <div className="wb-n">100%</div>
              <div className="wb-t">Safety Focused</div>
            </div>
            <img
              className="why-img-m"
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=85"
              alt="Professional logistics operations"
              loading="lazy"
            />
            <img
              className="why-img-s"
              src="https://images.unsplash.com/photo-1560472355-536de3962603?w=500&q=85"
              alt="Business partnership"
              loading="lazy"
            />
          </div>
        </div>

        <div className="why-feats rvr">
          {features.map(f => (
            <div className="why-feat" key={f.num}>
              <div className="fn2">{f.num}</div>
              <div className="ft">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
