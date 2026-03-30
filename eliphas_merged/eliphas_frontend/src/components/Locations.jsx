import './Locations.css'
import PixelCard from './PixelCard'

export default function Locations() {
  const handleMouseMove = (e) => {
    const mp = e.currentTarget
    if (!mp) return
    const r = mp.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    mp.style.transform = `perspective(900px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`
  }
  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = ''
  }

  return (
    <section id="locations">
      <div className="loc-inner">
        <div className="rvl">
          <p className="section-tag light">Operational Presence</p>
          <h2 className="section-title light">Where We <em>Operate</em></h2>
          <div className="sbar light"></div>
          <p className="loc-body">
            Eliphas Shipping Services Pvt Ltd operates across multiple project locations to efficiently support logistics movements, mining activities, and civil works execution.
            <br /><br />
            Our strategic presence enables rapid mobilization of resources and strong on-ground coordination for seamless project delivery.
          </p>
          <div className="cov-list">
            <div className="cov-item">
              <div className="cov-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="cov-t">
                <h4>Logistics &amp; Shipping Operations</h4>
                <p>Multi-location cargo handling, transportation, and coordination facilities.</p>
              </div>
            </div>
            <div className="cov-item">
              <div className="cov-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="cov-t">
                <h4>Mining Project Locations</h4>
                <p>On-site presence at active mining zones for continuous operational support.</p>
              </div>
            </div>
            <div className="cov-item">
              <div className="cov-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="cov-t">
                <h4>Civil &amp; Infrastructure Project Sites</h4>
                <p>Road and building execution across key operational territories.</p>
              </div>
            </div>
          </div>
        </div>

        <PixelCard
          variant="pink"
          className="map-panel rvr"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          noFocus
        >
          <div className="map-lbl">Operational Network</div>
          <svg className="map-svg" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="mg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a4a7a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1a4a7a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="480" height="360" fill="url(#mg)" />
            <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.5">
              <line x1="80" y1="0" x2="80" y2="360" /><line x1="160" y1="0" x2="160" y2="360" />
              <line x1="240" y1="0" x2="240" y2="360" /><line x1="320" y1="0" x2="320" y2="360" />
              <line x1="400" y1="0" x2="400" y2="360" /><line x1="0" y1="90" x2="480" y2="90" />
              <line x1="0" y1="180" x2="480" y2="180" /><line x1="0" y1="270" x2="480" y2="270" />
            </g>
            <path d="M40,60 L130,45 L200,75 L250,55 L310,85 L290,130 L230,150 L170,145 L120,165 L60,130 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <path d="M330,50 L420,40 L460,80 L450,130 L390,145 L340,120 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <path d="M60,220 L180,200 L280,235 L310,295 L240,320 L140,310 L80,280 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <path d="M340,210 L430,195 L470,250 L460,310 L380,320 L340,280 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <path d="M160,100 Q220,165 190,270" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeDasharray="6,4" />
            <path d="M395,88 Q310,155 190,270" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeDasharray="6,4" />
            <path d="M160,100 Q280,75 395,88" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="none" strokeDasharray="6,4" />
            <circle cx="160" cy="100" r="5" fill="rgba(255,255,255,0.9)" />
            <circle className="pr" cx="160" cy="100" r="0" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle className="pr" cx="160" cy="100" r="0" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animationDelay: '.8s' }} />
            <text x="172" y="96" fontFamily="'Outfit',sans-serif" fontSize="8" fill="rgba(255,255,255,0.7)" letterSpacing="1" fontWeight="600">LOGISTICS HUB</text>
            <circle cx="395" cy="88" r="5" fill="rgba(255,255,255,0.9)" />
            <circle className="pr" cx="395" cy="88" r="0" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" style={{ animationDelay: '.5s' }} />
            <text x="310" y="75" fontFamily="'Outfit',sans-serif" fontSize="8" fill="rgba(255,255,255,0.7)" letterSpacing="1" fontWeight="600">MINING ZONE</text>
            <circle cx="190" cy="270" r="5" fill="rgba(255,255,255,0.9)" />
            <circle className="pr" cx="190" cy="270" r="0" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" style={{ animationDelay: '1.2s' }} />
            <text x="205" y="268" fontFamily="'Outfit',sans-serif" fontSize="8" fill="rgba(255,255,255,0.7)" letterSpacing="1" fontWeight="600">CIVIL OPS</text>
            <g transform="translate(430,310)" opacity="0.5">
              <circle cx="0" cy="0" r="22" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />
              <line x1="0" y1="-22" x2="0" y2="22" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="-22" y1="0" x2="22" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <polygon points="0,-20 -2.5,-11 0,-14 2.5,-11" fill="rgba(255,255,255,0.6)" />
              <text x="0" y="-25" textAnchor="middle" fontFamily="'Outfit',sans-serif" fontSize="7" fill="rgba(255,255,255,0.4)" fontWeight="600">N</text>
            </g>
          </svg>
          <div className="map-leg">
            <div className="li"><div className="ld"></div> Operational Hub</div>
            <div className="li"><div className="ll"></div> Route Connection</div>
          </div>
        </PixelCard>
      </div>
    </section>
  )
}
