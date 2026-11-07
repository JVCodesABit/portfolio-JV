import { PROJECTS, type Project } from '@/lib/data'

export function ProjectChapter({ project: p, style }: { project: Project; style: React.CSSProperties }) {
  return (
    <section id={p.id} className="chapter project" style={style}>
      <div className="project-text" data-vis>
        <p className="mono project-count">Project {p.index}/{String(PROJECTS.length).padStart(2, '0')}</p>
        <h2 className="project-name">
          {p.name.map((n) => <span key={n}>{n}</span>)}
        </h2>
        <p className="mono project-kind">{p.kind} · {p.when}</p>
        <p className="project-line">{p.line}</p>
        <div className="project-cta">
          <button className="pill solid" data-case={p.id}>Open the case study</button>
          {p.live && <a className="pill" href={p.live} target="_blank" rel="noreferrer">Live ↗</a>}
          {p.code && <a className="pill" href={p.code} target="_blank" rel="noreferrer">Code ↗</a>}
        </div>
      </div>
    </section>
  )
}
