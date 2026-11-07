import { Flex } from '@/components/Flex'
import { Game } from '@/components/Game'
import { LiquidWords } from '@/components/LiquidWords'
import { Nav } from '@/components/Nav'
import { ProjectChapter } from '@/components/ProjectChapter'
import { CaseStudy } from '@/components/CaseStudy'
import { StackPit } from '@/components/StackPit'
import { Stage } from '@/components/Stage'
import { CHAPTERS, LINKS, MORE, PROJECTS, WINS } from '@/lib/data'

const vars = (id: string) => {
  const c = CHAPTERS.find((x) => x.id === id)!
  return { '--bg': c.bg, '--fg': c.fg } as React.CSSProperties
}

export default function Home() {
  return (
    <>
      <Stage />
      <Nav />

      {/* Shared by every liquid word swap */}
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <filter id="liquid">
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
        </filter>
      </svg>

      <main>
        <section id="hero" className="chapter hero" style={vars('hero')}>
          <div className="hero-type">
            <h1 aria-label="Jagrat Varshney">
              <Flex text="JAGRAT" className="hero-l1" />
              <Flex text="VARSHNEY" className="hero-l2" />
            </h1>
            <div className="hero-foot">
              <LiquidWords words={['Full-stack developer', 'Product builder', 'AI tinkerer', 'Competitive programmer']} />
              <p className="mono hero-meta">
                CSE (AI) at NSUT, Delhi<br />
                Scroll, or press on the shape
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="chapter about" style={vars('about')}>
          <div data-vis className="wrap">
            <p className="mono eyebrow" data-reveal>About</p>
            <p className="about-lead" data-reveal>
              I’m Jagrat. I build products from the database schema up to the last easing curve, and I care about both
              equally. I’m studying CSE (AI) at NSUT with a 9.41 CGPA, ranked second in my department and ninth in the university.
            </p>
            <p className="about-lead about-soft" data-reveal>
              When I’m not shipping, I{' '}
              <span className="morph-word" tabIndex={0} data-morph="play" data-morph-img="/work/video.webp">edit video</span>, follow{' '}
              <span className="morph-word" tabIndex={0} data-morph="circle" data-morph-img="/work/geo.webp">geopolitics</span> too closely, and lose hours to{' '}
              <span className="morph-word" tabIndex={0} data-morph="plus" data-morph-img="/work/gaming.webp">online games</span>.
            </p>
            <dl className="facts" data-reveal>
              <div><dt className="mono">Studying</dt><dd>B.Tech CSE (AI), NSUT, 2024–28</dd></div>
              <div><dt className="mono">Running</dt><dd>Event Manager at Venatus. Organized InterSoc across 15 societies</dd></div>
              <div><dt className="mono">Giving</dt><dd>100+ hours of community service with NSS</dd></div>
            </dl>
          </div>
        </section>

        {PROJECTS.map((p) => (
          <ProjectChapter key={p.id} project={p} style={vars(p.id)} />
        ))}

        <section id="more" className="chapter list-ch" style={vars('more')}>
          <div data-vis className="wrap">
            <p className="mono eyebrow" data-reveal>Also built</p>
            <h2 className="h-big" data-reveal>Smaller orbits.</h2>
            <ul className="rows">
              {MORE.map((m) => {
                const body = (
                  <>
                    <h3>{m.name}{m.href && <span aria-hidden> ↗</span>}</h3>
                    <p>{m.what}</p>
                    <span className="mono">{m.tech}</span>
                  </>
                )
                return (
                  <li key={m.name} data-reveal data-morph={m.shape}>
                    {m.href ? <a className="row" href={m.href} target="_blank" rel="noreferrer">{body}</a> : <div className="row" tabIndex={0}>{body}</div>}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section id="wins" className="chapter list-ch" style={vars('wins')}>
          <div data-vis className="wrap">
            <p className="mono eyebrow" data-reveal>Wins</p>
            <h2 className="h-big" data-reveal>Keeping score.</h2>
            <ul className="rows wins">
              {WINS.map((w) => (
                <li key={w.title} data-reveal data-morph={w.shape}>
                  <div className="row win" tabIndex={0}>
                    <strong>{w.big}</strong>
                    <div>
                      <h3>{w.title}</h3>
                      <p>{w.detail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stack" className="chapter stack" style={vars('stack')}>
          <div data-vis className="wrap stack-wrap">
            <p className="mono eyebrow">Stack</p>
            <h2 className="h-big">Throw my tools around.</h2>
            <StackPit />
          </div>
        </section>

        <section id="contact" className="chapter contact" style={vars('contact')}>
          <div data-vis className="wrap contact-wrap">
            <p className="mono eyebrow">Contact</p>
            <h2 className="contact-big" aria-label="Let’s build">
              <Flex text="LET’S" />
              <Flex text="BUILD" />
            </h2>
            <a className="contact-mail" href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
            <ul className="contact-links mono">
              <li><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
              <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={LINKS.leetcode} target="_blank" rel="noreferrer">LeetCode ↗</a></li>
            </ul>
            <footer className="mono foot">
              <span>© 2026 Jagrat Varshney</span>
              <span>Everything you watched move was one loop of 280 points. Press it five times.</span>
            </footer>
          </div>
        </section>
      </main>

      <CaseStudy />
      <Game />
    </>
  )
}
