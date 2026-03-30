import './Board.css'
import { useRef } from 'react'
import dir1 from '../assets/dir1.png'
import dir2 from '../assets/dir2.png'

const directors = [
  {
    initials: 'EC',
    name: 'CHILAKAMARTHI VEERRAJU',
    role: 'Managing Director',
    bio: 'Visionary leader with deep expertise in logistics, infrastructure, and multi-domain project management across Andhra Pradesh and beyond.',
    tags: ['Logistics', 'Infrastructure', 'Project Management', 'Strategy'],
    num: '01',
    photo: dir1,
    socials: [
      { type: 'twitter', text: '@Eliphas' },
      { type: 'linkedin', text: 'eliphas-linkedin' },
      { type: 'instagram', text: '@EliphasInfra' },
      { type: 'facebook', text: 'Eliphas Infra' },
    ],
  },
  {
    initials: 'SP',
    name: 'DESINEEDI HARIPRASAD',
    role: 'Director - Operations',
    bio: 'Operations specialist with extensive experience in civil works execution, supply chain coordination, and safety compliance frameworks.',
    tags: ['Civil Works', 'Supply Chain', 'Safety & Compliance', 'Operations'],
    num: '02',
    photo: dir2,
    socials: [
      { type: 'twitter', text: '@Eliphas' },
      { type: 'linkedin', text: 'eliphas-linkedin' },
      { type: 'instagram', text: '@EliphasInfra' },
      { type: 'facebook', text: 'Eliphas Infra' },
    ],
  },
]

const boardValues = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z"/></svg>,
    title: 'Safety First',
    text: 'Every operation prioritises the safety of our workforce and stakeholders.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    title: 'Accountability',
    text: 'We own every outcome and stand by the commitments we make to clients.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Execution Excellence',
    text: 'Timely delivery and cost-efficient solutions without compromise on quality.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    title: 'Client Partnership',
    text: 'Long-term relationships built on transparency, trust, and integrity.',
  },
]

function SocialIcon({ type }) {
  if (type === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M24 4.557a9.8 9.8 0 01-2.828.775A4.94 4.94 0 0023.337 2.6a9.86 9.86 0 01-3.127 1.195 4.924 4.924 0 00-8.39 4.49A13.977 13.977 0 011.671 3.149a4.923 4.923 0 001.523 6.574 4.9 4.9 0 01-2.229-.616v.062a4.926 4.926 0 003.95 4.827 4.96 4.96 0 01-1.298.171c-.314 0-.615-.028-.926-.084a4.93 4.93 0 004.6 3.419A9.896 9.896 0 010 19.54a13.95 13.95 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.034 10.034 0 0024 4.557z"
        />
      </svg>
    )
  }

  if (type === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM5 8H0v16h5V8zm7.982 0H8.014v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0V24H24V13.869c0-7.88-8.922-7.593-11.018-3.714V8z"
        />
      </svg>
    )
  }

  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm8.2 1.8h-7.9a4.25 4.25 0 00-4.25 4.25v7.9a4.25 4.25 0 004.25 4.25h7.9a4.25 4.25 0 004.25-4.25v-7.9a4.25 4.25 0 00-4.25-4.25zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.8A3.2 3.2 0 1015.2 12 3.2 3.2 0 0012 8.8zm5.35-2.03a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2z"
        />
      </svg>
    )
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.5 8.5V6.9c0-.55.45-1 1-1h1.7V3h-2.4a3.5 3.5 0 00-3.5 3.5v2H8v3h2.3V21h3.2v-9.5H16l.5-3h-3z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v6" />
      <path d="M8 8h.01" />
      <path d="M12 17v-3.2a2.2 2.2 0 014.4 0V17" />
      <path d="M12 11v6" />
    </svg>
  )
}

function DirCard({ dir }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card || window.matchMedia('(hover:none)').matches) return
    const r = card.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(800px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg) translateY(-8px)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <div className="dir-card rv" ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="dir-num">{dir.num}</div>

      <div className="dir-avatar-wrap">
        <div className="dir-avatar">
          <div className="dir-avatar-ring"></div>
          {dir.photo ? (
            <img
              src={dir.photo}
              alt={dir.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                borderRadius: '50%',
                display: 'block',
                position: 'absolute',
                inset: 0,
              }}
            />
          ) : (
            <div className="dir-initials">{dir.initials}</div>
          )}
        </div>
      </div>

      <div className="dir-body">
        <div className="dir-name">{dir.name}</div>
        <div className="dir-role">{dir.role}</div>
        <div className="dir-bio">{dir.bio}</div>
        <div className="dir-tags">
          {dir.tags.map((t) => <span key={t} className="dir-tag">{t}</span>)}
        </div>
        <div className="dir-socials social-links">
          {dir.socials.map((social) => (
            <div
              key={social.type}
              className={`social-btn flex-center ${social.type}`}
              aria-label={`${dir.name} ${social.type}`}
            >
              <SocialIcon type={social.type} />
              <span>{social.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="dir-bar"></div>
    </div>
  )
}

export default function PowerLeadership() {
  return (
    <section id="board" className="board-section power-leadership">
      <div className="board-grid-title rv">
        <p className="section-tag light" style={{ justifyContent: 'center', marginBottom: '.6rem' }}>Power Leadership</p>
        <h2 className="section-title light">Board of <em>Directors</em></h2>
        <div className="sbar light" style={{ margin: '1rem auto 0' }}></div>
        <p className="board-grid-sub">
          The visionary leaders behind Eliphas Projects — driving excellence, integrity, and growth across every domain we operate in.
        </p>
      </div>

      <div className="board-grid">
        {directors.map((dir) => <DirCard key={dir.num} dir={dir} />)}
      </div>

      <div className="board-values">
        {boardValues.map((v) => (
          <div key={v.title} className="bv-item">
            <div className="bv-icon">{v.icon}</div>
            <div className="bv-title">{v.title}</div>
            <div className="bv-text">{v.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
