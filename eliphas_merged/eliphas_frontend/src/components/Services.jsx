import './Services.css'
import { useRef } from 'react'
import svc1 from '../assets/Materials supply.png'
import svc2 from '../assets/Mining services.png'
import svc3 from '../assets/Road and highways.png'
import svc4 from '../assets/Shipping and transportation.png'
import svc5 from '../assets/Heavy engineering.png'
import svc6 from '../assets/Civil Works.png'
import svc7 from '../assets/Pipe Lines.png'
import svc8 from '../assets/Commercial & Residential.png'
import svc9 from '../assets/Logistics & Shipping.png'

const services = [
  {
    num: '01', title: 'Logistics & Shipping',
    desc: 'Smooth movement of goods with a focus on efficiency, safety, and end-to-end coordination from origin to destination.',
    img: svc9, alt: 'Logistics and shipping operations',
    tags: ['Cargo Transportation', 'Material Handling', 'Loading & Unloading', 'Shipment Support', 'Safety Compliance'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    num: '02', title: 'Mining Services',
    desc: 'Essential support services to mining operations — reliability, safety, and productivity at the forefront of every deployment.',
    img: svc2, alt: 'Mining operations',
    tags: ['Operational Support', 'Material Movement', 'Site Assistance', 'Logistics Coordination'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/></svg>,
  },
  {
    num: '03', title: 'Civil Works',
    desc: 'Durable, well-executed infrastructure solutions across roads, buildings, and critical civil works — on time, every time.',
    img: svc6, alt: 'Civil construction works',
    tags: ['Road Construction', 'Building Works', 'Site Preparation', 'Renovation'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    num: '04', title: 'Heavy Engineering',
    desc: 'Manufacturing and supply of IBR-certified Steam Distributors and 30 & 15 KL SS tanks with full automation provisions to store and handle pulp slurry — delivered on time.',
    img: svc5, alt: 'Heavy engineering facility',
    tags: ['Steam Distributors', 'IBR Certification', 'SS Tanks — 30 & 15 KL', 'Pulp Slurry Handling', 'Full Automation'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  },
  {
    num: '05', title: 'Pipe Lines',
    desc: 'Fast-tracked pipeline projects undertaken on a war footing basis. Completed within tight 4-month timelines from order acceptance, with works progressing in advanced stages.',
    img: svc7, alt: 'Pipeline construction',
    tags: ['Industrial Pipelines', 'Fast-Track Execution', '4-Month Delivery', 'On-Site Coordination'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>,
  },
  {
    num: '06', title: 'Roads & Highways',
    desc: 'Roads make a crucial contribution to economic development and growth. We deliver durable, well-constructed road infrastructure that lasts.',
    img: svc3, alt: 'Roads and highways construction',
    tags: ['Road Construction', 'Highway Development', 'Maintenance & Repair', 'Site Preparation'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/></svg>,
  },
  {
    num: '07', title: 'Commercial & Residential',
    desc: 'Mixed-use projects capturing all three real estate segments — residential, commercial, and retail — advantageous for both developers and buyers alike.',
    img: svc8, alt: 'Commercial and residential construction',
    tags: ['Mixed-Use Developments', 'Residential Construction', 'Commercial Build-Outs', 'Retail Spaces'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><path d="M21 21H3"/></svg>,
  },
  {
    num: '08', title: 'Shipping & Transportation',
    desc: 'Wide-range vessel agency services with real-time information, ground-level expertise and local knowledge to make every port call as smooth and efficient as possible.',
    img: svc4, alt: 'Shipping and port operations',
    tags: ['Vessel Agency Services', 'Port Call Management', 'Cargo Handling', 'Real-Time Coordination'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  },
  {
    num: '01', title: 'Materials Supply',
    desc: 'Comprehensive supply of industrial raw materials and construction aggregates for mining, steel, and infrastructure projects across the region.',
    img: svc1, alt: 'Materials and aggregates supply',
    tags: ['LD & BF Slag', 'Coal & Iron Ore', 'Lime Stone Powder', 'Gravel & Sand', 'Redstone & Blackstone', '20–80MM Aggregates'],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  },
]

function ServiceCard({ svc, delay }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card || window.matchMedia('(hover:none)').matches) return
    const r = card.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / (r.width / 2)
    const dy = (e.clientY - cy) / (r.height / 2)
    card.style.transform = `perspective(900px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) translateZ(8px) scale(1.02)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <div className={`svc-card glare-hover rv ${delay}`} ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="svc-bg">
        <img src={svc.img} alt={svc.alt} loading="lazy" />
      </div>
      <div className="svc-num">{svc.num}</div>
      <div className="svc-body">
        <div className="svc-icon-box">{svc.icon}</div>
        <h3 className="svc-title">{svc.title}</h3>
        <p className="svc-desc">{svc.desc}</p>
        <div className="svc-tags">
          {svc.tags.map(tag => <span key={tag} className="svc-tag">{tag}</span>)}
        </div>
      </div>
      <div className="svc-bar"></div>
    </div>
  )
}

export default function Services() {
  const delays = ['d1', 'd2', 'd3', 'd1', 'd2', 'd3', 'd1', 'd2', 'd3']
  return (
    <section id="services">
      <div className="rv">
        <p className="section-tag">What We Do</p>
        <h2 className="section-title">Our <em>Core</em> Services</h2>
        <div className="sbar"></div>
      </div>
      <p className="svc-lead rv d2">
        Comprehensive solutions spanning logistics, heavy engineering, infrastructure, shipping, and materials supply — executed with professionalism, safety, and accountability at every step.
      </p>
      <div className="svc-grid">
        {services.map((svc, i) => (
          <ServiceCard key={svc.num} svc={svc} delay={delays[i]} />
        ))}
      </div>
      <div className="materials-strip rv">
        <div className="ms-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          Materials Supply
        </div>
        <div className="ms-items">
          <span className="ms-item">LD Slag</span><span className="ms-sep">·</span>
          <span className="ms-item">BF Slag</span><span className="ms-sep">·</span>
          <span className="ms-item">Coal &amp; Iron Ore</span><span className="ms-sep">·</span>
          <span className="ms-item">Lime Stone Powder</span><span className="ms-sep">·</span>
          <span className="ms-item">Gravel</span><span className="ms-sep">·</span>
          <span className="ms-item">Sand</span><span className="ms-sep">·</span>
          <span className="ms-item">Redstone</span><span className="ms-sep">·</span>
          <span className="ms-item">Blackstone</span><span className="ms-sep">·</span>
          <span className="ms-item">20MM · 40MM · 60MM · 80MM Aggregates</span>
        </div>
      </div>
    </section>
  )
}
