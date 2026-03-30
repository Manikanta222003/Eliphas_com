import './DirectorsModal.css'
import { useEffect, useRef } from 'react'
import dir1 from '../assets/dir1.png'
import dir2 from '../assets/dir2.png'

const directors = [
  {
    id: 'dCard1',
    initials: 'EC',
    name: 'CHILAKAMARTHI VEERRAJU',
    badge: 'Managing Director',
    role: 'Managing Director',
    bio: 'Visionary leader and founder with extensive expertise in logistics, multi-domain infrastructure delivery, and large-scale project management across Andhra Pradesh and beyond.',
    tags: ['Logistics Strategy', 'Infrastructure', 'Business Development', 'Leadership'],
    photo: dir1,  // ✅ imported variable — NOT a string
  },
  {
    id: 'dCard2',
    initials: 'SP',
    name: 'DESINEEDI HARIPRASAD',
    badge: 'Director',
    role: 'Director — Operations',
    bio: 'Operations and compliance specialist with deep experience in civil works execution, supply chain coordination, and building safety-first organisational culture.',
    tags: ['Civil Works', 'Supply Chain', 'Safety & Compliance', 'Operations Management'],
    photo: dir2,  // ✅ imported variable — NOT a string
  },
]

export default function DirectorsModal({ isOpen, onClose }) {
  const boxRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`dir-modal${isOpen ? ' open' : ''}`}
      id="dirModal"
      aria-hidden={!isOpen}
    >
      <div className="dir-modal-bg" onClick={onClose}></div>
      <div className="dir-modal-box" ref={boxRef}>
        <button className="dir-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="dir-modal-hdr">
          <p className="dir-modal-tag">
            <span className="dir-tag-line"></span>Leadership
          </p>
          <h2 className="dir-modal-title">Our <em>Directors</em></h2>
          <p className="dir-modal-sub">
            The visionary leaders behind Eliphas Projects — driving excellence, integrity, and growth across every domain we operate in.
          </p>
        </div>

        <div className="dir-cards">
          {directors.map(dir => (
            <div className="dir-card" key={dir.id} id={dir.id}>
              <div className="dir-card-inner">
                <div className="dir-card-front">
                  <div className="dir-photo-ring">
                    <div className="dir-photo-ring-anim"></div>
                    <div className="dir-photo-wrap">

                      {/* ✅ FIXED: show image if photo exists, fallback to icon */}
                      {dir.photo ? (
                        <img
                          src={dir.photo}
                          alt={dir.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            display: 'block',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div className="dir-photo-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M3 21c0-4.97 4.03-9 9-9s9 4.03 9 9" />
                          </svg>
                          <span className="dir-photo-hint">Photo</span>
                        </div>
                      )}

                    </div>
                  </div>
                  <div className="dir-card-info">
                    <div className="dir-name-badge">{dir.badge}</div>
                    <div className="dir-name">{dir.name}</div>
                    <div className="dir-role">{dir.role}</div>
                    <div className="dir-divider"></div>
                    <div className="dir-bio">{dir.bio}</div>
                    <div className="dir-tags">
                      {dir.tags.map(t => <span key={t} className="dir-tag">{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="dir-card-shine"></div>
                <div className="dir-card-shadow"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="dir-modal-footer">
          <div className="dir-footer-text">
            Eliphas Shipping Services Pvt Ltd · Visakhapatnam, Andhra Pradesh
          </div>
        </div>
      </div>
    </div>
  )
}