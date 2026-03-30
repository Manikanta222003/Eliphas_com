import './Projects.css'

const completedProjects = [
  {
    id: '01',
    title: 'Polavaram Dam Irrigation Projects',
    work: 'Mining and earth works',
  },
  {
    id: '02',
    title: 'Visakhapatnam Steel Plant',
    work: 'Excavation and transport of LD slag',
  },
]

const runningProjects = [
  {
    id: '01',
    title: 'Visakhapatnam Sea Port',
    work: 'Transportation of coal and iron ore',
  },
  {
    id: '02',
    title: 'Coromandel International Limited, Visakhapatnam',
    work: 'Excavation of gypsum and railway siding',
  },
  {
    id: '03',
    title: 'Coromandel International Limited, Kakinada',
    work: 'Transportation of DAP and MOP to Kakinada Port',
  },
]

function ProjectGroup({ title, tone, projects, delay, caption }) {
  const isCompleted = tone === 'Completed'
  const chipLabel = isCompleted ? 'Delivered' : 'In Progress'

  return (
    <div className={`projects-panel ${tone.toLowerCase()} rv ${delay}`}>
      <div className="projects-panel-head">
        <div className="projects-panel-title-wrap">
          <p className={`projects-kicker ${tone}`}>{tone}</p>
          <h3>{title}</h3>
          <p className="projects-caption">{caption}</p>
        </div>
        <div className="projects-count">
          <span>{String(projects.length).padStart(2, '0')}</span>
          <small>Projects</small>
        </div>
      </div>

      <div className="projects-list">
        {projects.map((project) => (
          <article key={`${tone}-${project.id}`} className={`project-item ${tone.toLowerCase()}`}>
            <div className="project-index">{project.id}</div>
            <div className="project-copy">
              <div className="project-meta-row">
                <span className={`project-chip ${tone}`}>{chipLabel}</span>
                <span className="project-id">Project #{project.id}</span>
              </div>
              <h4>{project.title}</h4>
              <p className="project-work">
                <span>Work:</span> {project.work}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function Projects() {
  const completedCount = String(completedProjects.length).padStart(2, '0')
  const runningCount = String(runningProjects.length).padStart(2, '0')

  return (
    <section id="projects">
      <div className="projects-head rv">
        <p className="section-tag">Project Portfolio</p>
        <h2 className="section-title">Our <em>Projects</em></h2>
        <div className="sbar"></div>
        <p className="projects-lead">
          A snapshot of major works delivered and currently in progress across irrigation,
          steel, port logistics, and industrial material movement.
        </p>
      </div>

      <div className="projects-grid">
        <ProjectGroup
          title="Completed Projects"
          tone="Completed"
          projects={completedProjects}
          delay="d1"
          caption="Major assignments completed with quality, safety, and delivery discipline."
        />
        <ProjectGroup
          title="Running Projects"
          tone="Running"
          projects={runningProjects}
          delay="d2"
          caption="Active engagements currently progressing across port and industrial operations."
        />
      </div>

      <div className="projects-summary rv d3">
        <div className="projects-summary-item">
          <strong>{completedCount}</strong>
          <span>Completed assignments</span>
        </div>
        <div className="projects-summary-item">
          <strong>{runningCount}</strong>
          <span>Active project engagements</span>
        </div>
        <div className="projects-summary-item">
          <strong>03 Sectors</strong>
          <span>Ports, steel, and irrigation coverage</span>
        </div>
      </div>
    </section>
  )
}
