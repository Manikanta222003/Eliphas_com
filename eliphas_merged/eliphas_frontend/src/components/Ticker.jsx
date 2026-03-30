import './Ticker.css'
const items = [
  'Logistics & Shipping', 'Mining Services', 'Civil Works',
  'Heavy Engineering', 'Pipe Lines', 'Roads & Highways',
  'Commercial & Residential', 'Shipping & Transportation', 'Materials Supply',
]

export default function Ticker() {
  const handleEnter = (e) => {
    e.currentTarget.style.transform = 'perspective(400px) translateZ(12px) scale(1.08)'
    e.currentTarget.style.color = 'rgba(13,37,85,.95)'
  }
  const handleLeave = (e) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.color = ''
  }

  const doubled = [...items, ...items]

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-t">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="ti"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
