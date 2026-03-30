import './Contact.css'
import { useRef, useState } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)
  const partnerRef = useRef(null)

  const handleMouseMove = (e) => {
    const fw = formRef.current
    if (!fw) return
    const r = fw.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    fw.style.transform = `perspective(1000px) rotateY(${dx * 3}deg) rotateX(${-dy * 2}deg) translateZ(6px)`
  }

  const handleMouseLeave = () => {
    if (formRef.current) formRef.current.style.transform = ''
  }

  const handlePartnerMove = (e) => {
    const pb = partnerRef.current
    if (!pb) return
    const r = pb.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    pb.style.transform = `perspective(700px) rotateY(${dx * 5}deg) rotateX(${-dy * 3}deg) translateZ(10px)`
  }

  const handlePartnerLeave = () => {
    if (partnerRef.current) partnerRef.current.style.transform = ''
  }

  const contactDetails = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
      label: 'Registered Office',
      value: 'Sardar Nest, Senora Block, Flat No. 402, Peddagantyada, Gajuwaka, Visakhapatnam, Andhra Pradesh - 530044',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
      label: 'Corporate Office',
      value: '#27-3-189/2, Official Colony, Srinagar, Gajuwaka, Visakhapatnam, Andhra Pradesh - 530026',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a2 2 0 011.99-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 15a16 16 0 006.09 6.09l1.27-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 22.48v-5.56z" /></svg>,
      label: 'Mobile',
      value: (
        <>
          <a href="tel:+919000688220" className="ci-link">+91 90006 88220</a>
          {' - '}
          <a href="tel:+919059902202" className="ci-link">+91 90599 02202</a>
          {' - '}
          <a href="tel:+919000688221" className="ci-link">+91 90006 88221</a>
        </>
      ),
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>,
      label: 'Email ID',
      value: <a href="mailto:info@eliphas.in" className="ci-link">info@eliphas.in</a>,
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5M16 4v5" /></svg>,
      label: 'GST Number',
      value: '37AAICE3890P1ZU',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 12l2 2 4-4" /></svg>,
      label: 'CIN',
      value: 'U52292AP2024PTC115930',
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      label: 'Working Hours',
      value: 'Monday - Saturday | 9:00 AM - 6:00 PM',
    },
  ]

  return (
    <section id="contact">
      <div className="con-inner">
        <div className="con-head rv">
          <p className="section-tag light">Get in Touch</p>
          <h2 className="section-title light">
            Partner With <em>Eliphas</em>
          </h2>
          <div className="sbar light"></div>
          <p className="con-tl">
            For business inquiries, project discussions, or service requests, connect with Eliphas Shipping Services Pvt Ltd. Our team is available Monday through Saturday to support your needs.
          </p>
        </div>

        <div className="con-main">
          <div className="con-left rvl">
            <div className="con-det">
              {contactDetails.map((item, i) => (
                <div key={i} className="ci">
                  <div className="ci-icon">{item.icon}</div>
                  <div className="ci-b">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="con-map-wrap">
              <div className="con-map-lbl">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Gajuwaka, Visakhapatnam, Andhra Pradesh
              </div>
              <div className="con-map">
                <iframe
                  title="Eliphas Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15208.123456789!2d83.2152!3d17.6868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b60001ca9ab%3A0x7c1b56d5c5e34f6!2sGajuwaka%2C%20Visakhapatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="con-right">
            <div
              className="form-wrap rvr"
              ref={formRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <h3 className="form-title">Send Us a Message</h3>
              <div className="form-row">
                <div className="fg"><label>Your Name</label><input type="text" placeholder="Full name" /></div>
                <div className="fg"><label>Company</label><input type="text" placeholder="Company name" /></div>
              </div>
              <div className="form-row">
                <div className="fg"><label>Email Address</label><input type="email" placeholder="your@email.com" /></div>
                <div className="fg"><label>Phone Number</label><input type="tel" placeholder="+91 00000 00000" /></div>
              </div>
              <div className="fg">
                <label>Service of Interest</label>
                <select defaultValue="">
                  <option value="">Select a service...</option>
                  <option>Logistics &amp; Shipping</option>
                  <option>Mining Services</option>
                  <option>Civil Works</option>
                  <option>Heavy Engineering</option>
                  <option>Pipe Lines</option>
                  <option>Roads &amp; Highways</option>
                  <option>Commercial &amp; Residential Projects</option>
                  <option>Shipping &amp; Transportation</option>
                  <option>Materials Supply</option>
                  <option>Multiple Services</option>
                </select>
              </div>
              <div className="fg">
                <label>Your Message</label>
                <textarea placeholder="Describe your project, requirements, or inquiry in detail..."></textarea>
              </div>
              <button
                className="form-sub"
                disabled={submitted}
                onClick={() => setSubmitted(true)}
                style={submitted ? { background: '#1a5fba' } : {}}
              >
                {submitted ? "Message Sent - We'll Be in Touch!" : 'Send Inquiry'}
              </button>
            </div>

            <div
              className="partner-blk"
              ref={partnerRef}
              onMouseMove={handlePartnerMove}
              onMouseLeave={handlePartnerLeave}
            >
              <p>Reliable Execution.<br />Professional Service.<br />Proven Results.</p>
              <small>- Eliphas Shipping Services Pvt Ltd</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
