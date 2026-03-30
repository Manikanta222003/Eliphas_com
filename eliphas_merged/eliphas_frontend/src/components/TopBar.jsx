import './TopBar.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ onClose }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    onClose()
  }

  return (
    <div id="topBar" className={`top-bar${visible ? ' tb-visible' : ''}`}>
      <div className="top-bar-inner">
        <div className="tb-dot"></div>
        <span>Multi-Domain Infrastructure &amp; Logistics Services</span>
        <div className="tb-dot"></div>
        <button
          onClick={() => navigate('/login')}
          className="tb-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Staff Portal Login
        </button>
        <div className="tb-dot"></div>
      </div>
      <button className="top-bar-close" id="tbClose" onClick={handleClose} aria-label="Close">&#x2715;</button>
    </div>
  )
}

