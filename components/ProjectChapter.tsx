import type { Project } from '@/lib/data'

export function ProjectChapter({ project: p, style }: { project: Project; style: React.CSSProperties }) {
  return (
    <section id={p.id} className="chapter project" data-images={Math.max(1, p.shots.length)} style={style}>
      <div className="project-pin" data-vis>
        <div className="project-text">
          <p className="mono eyebrow">{p.index} · {p.kind}</p>
          <h2 className="project-name">
            {p.name.map((n) => <span key={n}>{n}</span>)}
          </h2>
          <p className="project-line">{p.line}</p>
          <ul className="project-stats">
            {p.stats.map((s) => (
              <li key={s.l}><strong>{s.n}</strong><span className="mono">{s.l}</span></li>
            ))}
          </ul>
          <div className="project-cta">
            <button className="pill solid" data-case={p.id}>Open the case study</button>
            {p.live && <a className="pill" href={p.live} target="_blank" rel="noreferrer">Live ↗</a>}
            {p.code && <a className="pill" href={p.code} target="_blank" rel="noreferrer">Code ↗</a>}
          </div>
          <p className="mono project-when">{p.when}</p>
        </div>
      </div>
    </section>
  )
}
