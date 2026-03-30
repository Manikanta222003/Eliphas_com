import './Footer.css'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer>
      <div className="ft-top">
        <div className="fb">
          <div className="footer-logo-wrap">
            <img src={logo} alt="Eliphas" className="footer-logo" />
          </div>
          <div className="fs" style={{ marginTop: '.8rem' }}>Eliphas Shipping Services Pvt Ltd</div>
          <p>A reliable, multi-domain service provider delivering excellence across Logistics, Shipping, Mining, and Civil Works. Driven by operational excellence, safety, and trust.</p>
        </div>

        <div className="fc">
          <h5>Navigation</h5>
          <ul>
            {[['#hero','Home'],['#about','About Us'],['#services','Services'],['#locations','Locations'],['#why','Why Eliphas'],['#contact','Contact']].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className="fc">
          <h5>Services</h5>
          <ul>
            {['Logistics & Shipping','Mining Services','Civil Works','Heavy Engineering','Pipe Lines','Roads & Highways','Commercial & Residential','Shipping & Transportation','Materials Supply'].map(s => (
              <li key={s}><a href="#services">{s}</a></li>
            ))}
          </ul>
        </div>

        <div className="fc">
          <h5>Industries</h5>
          <ul>
            {['Logistics','Infrastructure','Mining','Construction'].map(s => (
              <li key={s}><a href="#">{s}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-btm">
        <span>&copy; 2025 <strong>Eliphas Shipping Services Pvt Ltd</strong>. All rights reserved.</span>
        <span>Moving Cargo. Building Infrastructure. <strong>Delivering Trust.</strong></span>
      </div>
    </footer>
  )
}
