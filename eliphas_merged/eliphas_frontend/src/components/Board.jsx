import './Board.css'

const stats = [
  { n: '9', accent: '+', label: 'Core Services' },
  { n: '100', accent: '%', label: 'Safety Record' },
  { n: 'E', accent: '-2-E', label: 'Project Execution' },
  { n: 'AP', accent: '', label: 'Andhra Pradesh HQ' },
]

const domains = [
  '01 Logistics & Shipping',
  '02 Mining Services',
  '03 Civil Works',
  '04 Heavy Engineering (IBR)',
  '05 Pipe Lines',
  '06 Roads & Highways',
  '07 Commercial & Residential',
  '08 Shipping & Transportation',
  '09 Materials Supply',
]

const credentials = [
  {
    title: 'GST Registered',
    desc: 'Fully compliant under Indian GST - GSTIN 37AAICE3890P1ZU',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 4v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z" />
      </svg>
    ),
  },
  {
    title: 'IBR Certified',
    desc: 'Certified steam distributors for heavy engineering and boiler works',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Pan-India Operations',
    desc: 'Active project portfolio spanning multiple states across India',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
  },
  {
    title: 'Pvt. Ltd. Registered',
    desc: 'Incorporated under the Indian Companies Act with full statutory compliance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,48,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
]

export default function Board() {
  return (
    <section id="company-profile" className="board-section board-company">
      <div className="board-intro">
        <div className="board-intro-text rvl">
          <p className="section-tag light">About the Company</p>
          <h2 className="section-title light">Built on <em>Vision.</em><br />Driven by <em>Purpose.</em></h2>
          <div className="sbar light"></div>
          <p className="board-intro-body">
            Eliphas Shipping Services Pvt Ltd is a professionally managed, multi-domain service company headquartered in Visakhapatnam, Andhra Pradesh.
            The company delivers integrated infrastructure and logistics solutions across nine core verticals.
            <br /><br />
            Registered under the Companies Act and GST compliant (<strong style={{ color:'rgba(0, 0, 0, 0.8)' }}>GSTIN: 37AAICE3890P1ZU</strong>),
            Eliphas is backed by an experienced leadership team with expertise in project management, civil infrastructure, marine operations,
            and industrial engineering.
          </p>
        </div>

        <div className="board-stats-wrap rvr">
          {stats.map((s) => (
            <div key={s.label} className="board-stat">
              <div className="board-stat-n">{s.n}<span className="board-stat-accent">{s.accent}</span></div>
              <div className="board-stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cp-panel rv">
        <div className="cp-left">
          <p className="section-tag light" style={{ marginBottom: '.8rem' }}>Company Profile</p>
          <h3 className="cp-heading">Eliphas Shipping Services <em>Pvt Ltd</em></h3>
          <p className="cp-sub">A professionally managed, multi-domain infrastructure and logistics company headquartered in Visakhapatnam, Andhra Pradesh, India.</p>
          <div className="cp-facts">
            {[
              ['Type', 'Private Limited Company'],
              ['Industry', 'Infrastructure - Logistics - Engineering'],
              ['CIN', 'U52292AP2024PTC115930'],
              ['Corp. HQ', '#27-3-189/2, Official Colony, Srinagar, Gajuwaka, Vizag - 530026'],
              ['Reg. Office', 'Sardar Nest, Flat 402, Peddagantyada, Gajuwaka, Vizag - 530044'],
              ['GSTIN', '37AAICE3890P1ZU'],
              ['State', '37 - Andhra Pradesh, India'],
              ['Mobile', '+91 90006 88220 - +91 90599 02202 - +91 90006 88221'],
            ].map(([label, val]) => (
              <div key={label} className="cp-fact">
                <span className="cp-fact-label">{label}</span>
                <span className="cp-fact-val" style={label === 'GSTIN' || label === 'CIN' ? { fontFamily: 'monospace', letterSpacing: '.06em' } : {}}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cp-right">
          <div className="cp-domains-title">Core Service Domains</div>
          <div className="cp-domains">
            {domains.map((d) => (
              <div key={d} className="cp-domain">
                <span className="cp-d-num">{d.slice(0, 2)}</span>
                <span className="cp-d-name">{d.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cred-strip rv">
        {credentials.map((c) => (
          <div key={c.title} className="cred-item">
            <div className="cred-icon">{c.icon}</div>
            <div className="cred-body">
              <div className="cred-title">{c.title}</div>
              <div className="cred-desc">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
