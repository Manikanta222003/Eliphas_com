import './Clients.css'
import bothraLogo from '../assets/clients/bothra.png'
import coromandelLogo from '../assets/clients/coromandel.png'
import vizagSteelLogo from '../assets/clients/vizag_steel.png'
import vsplLogo from '../assets/clients/vspl.png'

const clients = [
  {
    name: 'Bothra',
    logo: bothraLogo,
    alt: 'Bothra client logo',
    sector: 'Logistics Partner',
  },
  {
    name: 'Coromandel International',
    logo: coromandelLogo,
    alt: 'Coromandel International client logo',
    sector: 'Industrial Client',
  },
  {
    name: 'Vizag Steel',
    logo: vizagSteelLogo,
    alt: 'Vizag Steel client logo',
    sector: 'Steel Sector',
  },
  {
    name: 'VSPL',
    logo: vsplLogo,
    alt: 'VSPL client logo',
    sector: 'Port Operations',
  },
]

export default function Clients() {
  return (
    <section id="clients">
      <div className="clients-copy rv">
        <p className="section-tag">Our Clients</p>
        <h2 className="section-title">Trusted By <em>Leading Partners</em></h2>
        <div className="sbar"></div>
        <p className="clients-lead">
          We support established organizations across port logistics, steel, and industrial
          operations with dependable execution and long-term partnership focus.
        </p>
      </div>

      <div className="clients-grid">
        {clients.map((client, index) => (
          <article
            key={client.name}
            className={`client-card rv ${index % 2 === 0 ? 'd1' : 'd2'}`}
          >
            <div className="client-logo-wrap">
              <img src={client.logo} alt={client.alt} className="client-logo" loading="lazy" />
            </div>
            <div className="client-meta">
              <h3>{client.name}</h3>
              <p>{client.sector}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
