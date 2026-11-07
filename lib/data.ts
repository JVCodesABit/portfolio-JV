import type { ShapeName } from './shapes'

export const INK = '#15130F'
export const BONE = '#EFEBE1'

export const LINKS = {
  email: 'me@jvcodes.tech',
  github: 'https://github.com/JVCodesABit',
  linkedin: 'https://www.linkedin.com/in/jagrat-varshney-218110324/',
  leetcode: 'https://leetcode.com/u/JVCodesABit/',
}

interface Place { x: number; y: number; s: number }

export interface Chapter {
  id: string
  label: string
  bg: string
  fg: string
  /** colour of the shape when no image covers it */
  fill: string
  shape: ShapeName
  images?: string[]
  /** focal point inside the image, 0..1 */
  focal?: [number, number]
  /** plays inside the shape; images remain the fallback when video can't play */
  video?: string
  videoFocal?: [number, number]
  /** s is a fraction of min(viewport width, viewport height) */
  place: Place
  placeM: Place
  spin?: number
  /** the shape keeps morphing through these, showing each label inside; the last one holds longest */
  cycle?: { shape: ShapeName; label: string; dx?: number; dy?: number; fit?: number }[]
  orbit?: boolean
  kinetic?: boolean
}

/** Order matches the DOM. The engine floods from each bg into the next. */
export const CHAPTERS: Chapter[] = [
  { id: 'hero', label: 'Hello', bg: BONE, fg: INK, fill: INK, shape: 'blob', images: ['/work/portrait.webp'], focal: [0.54, 0.3],
    place: { x: 0.69, y: 0.47, s: 0.72 }, placeM: { x: 0.5, y: 0.46, s: 0.86 } },
  { id: 'about', label: 'About', bg: INK, fg: BONE, fill: '#FF5B26', shape: 'flower', spin: 0.12,
    place: { x: 0.8, y: 0.5, s: 0.56 }, placeM: { x: 0.8, y: 0.15, s: 0.4 } },
  { id: 'work', label: 'Projects', bg: BONE, fg: INK, fill: '#FF5B26', shape: 'down',
    place: { x: 0.87, y: 0.3, s: 0.34 }, placeM: { x: 0.84, y: 0.17, s: 0.26 } },
  { id: 'orbis', label: 'Orbis', bg: '#FF5B26', fg: INK, fill: INK, shape: 'circle', orbit: true,
    images: ['/work/orbis-0.webp', '/work/orbis-1.webp', '/work/orbis-2.webp'], focal: [0.5, 0.42],
    video: '/work/video/orbis.webm', videoFocal: [0.5, 0.38],
    place: { x: 0.71, y: 0.5, s: 0.68 }, placeM: { x: 0.5, y: 0.26, s: 0.62 } },
  { id: 'takemeforward', label: 'TakeMeForward', bg: '#5B3DF5', fg: BONE, fill: '#0B0914', shape: 'arrow',
    images: ['/work/tmf-0-crop.webp', '/work/tmf-1-crop.webp', '/work/tmf-2-crop.webp'], focal: [0.5, 0.5],
    video: '/work/video/tmf.webm', videoFocal: [0.78, 0.5],
    place: { x: 0.71, y: 0.5, s: 0.78 }, placeM: { x: 0.5, y: 0.25, s: 0.7 } },
  { id: 'gotogethr', label: 'GoTogethr', bg: '#14D8C4', fg: INK, fill: '#050B1A', shape: 'pin',
    images: ['/work/goto-0.webp', '/work/goto-1.webp', '/work/goto-2.webp'], focal: [0.5, 0.42],
    video: '/work/video/goto.webm', videoFocal: [0.5, 0.45],
    place: { x: 0.71, y: 0.5, s: 0.8 }, placeM: { x: 0.5, y: 0.25, s: 0.7 } },
  { id: 'mbaedge', label: 'MBAEdge', bg: '#EDF03C', fg: INK, fill: INK, shape: 'stairs',
    images: ['/work/mba-0-crop.webp', '/work/mba-1-crop.webp'], focal: [0.5, 0.5],
    video: '/work/video/mba.webm', videoFocal: [0.38, 0.5],
    place: { x: 0.71, y: 0.5, s: 0.78 }, placeM: { x: 0.5, y: 0.25, s: 0.68 } },
  { id: 'sahay', label: 'Sahay', bg: '#0E4D3A', fg: BONE, fill: '#FFB627', shape: 'twin', kinetic: true,
    place: { x: 0.71, y: 0.5, s: 0.86 }, placeM: { x: 0.5, y: 0.23, s: 0.82 } },
  { id: 'more', label: 'Also built', bg: INK, fg: BONE, fill: '#FF5B26', shape: 'hex', spin: 0.1,
    place: { x: 0.84, y: 0.5, s: 0.36 }, placeM: { x: 0.84, y: 0.12, s: 0.26 } },
  { id: 'wins', label: 'Wins', bg: BONE, fg: INK, fill: '#FF5B26', shape: 'scallop', spin: 0.15,
    place: { x: 0.84, y: 0.5, s: 0.36 }, placeM: { x: 0.84, y: 0.12, s: 0.26 } },
  { id: 'stack', label: 'Stack', bg: '#FFB8D9', fg: INK, fill: '#FFD3E7', shape: 'hex', spin: 0.04,
    place: { x: 0.5, y: 0.58, s: 0.92 }, placeM: { x: 0.5, y: 0.6, s: 1 } },
  { id: 'contact', label: 'Contact', bg: '#1E3BFF', fg: BONE, fill: BONE, shape: 'blob',
    cycle: [
      { shape: 'circle', label: 'Orbis' },
      { shape: 'arrow', label: 'TakeMeForward', dx: -0.05, fit: 0.64 },
      { shape: 'pin', label: 'GoTogethr', dy: -0.1, fit: 0.56 },
      { shape: 'stairs', label: 'MBAEdge', dy: 0.29, fit: 0.56 },
      { shape: 'twin', label: 'Sahay' },
      { shape: 'blob', label: 'Yours?' },
    ],
    place: { x: 0.79, y: 0.42, s: 0.62 }, placeM: { x: 0.6, y: 0.6, s: 0.54 } },
]

export interface Project {
  id: string
  index: string
  name: [string, string?]
  kind: string
  when: string
  line: string
  stats: { n: string; l: string }[]
  stack: string[]
  live?: string
  code?: string
  /** colours for the full-screen case study (the shape's own fill) */
  caseFg: string
  caseAccent: string
  problem: string
  built: { h: string; p: string }[]
  shots: string[]
  video?: string
}

export const PROJECTS: Project[] = [
  {
    video: '/work/video/orbis.webm',
    id: 'orbis', index: '01', name: ['Orbis'], kind: 'Personal operating system', when: '2026 — now',
    line: 'Everything you keep, in one orbit. It files your documents and answers questions with the source attached.',
    stats: [{ n: '8', l: 'file formats read' }, { n: '600k', l: 'vault key iterations' }, { n: '0', l: 'vault bytes shown to AI' }],
    stack: ['Next.js 16', 'Supabase', 'pgvector', 'Gemini', 'Groq', 'BullMQ', 'Capacitor'],
    live: 'https://orbis.jvcodes.tech',
    caseFg: BONE, caseAccent: '#FF5B26',
    problem: 'Passports, offer letters, marksheets and passwords end up across Drive, Gmail and a Downloads folder. You remember you have the file. You never remember where.',
    built: [
      { h: 'It reads the pile', p: 'PDFs, Word and PowerPoint files, text and images, including scanned pages. Each upload gets a title, type, issuer, key dates and a short summary, then lands in Identity, Education, Career, Finance or Personal.' },
      { h: 'Answers with receipts', p: 'Ask in plain language and retrieval over pgvector finds the passage. Every answer links back to the document it came from.' },
      { h: 'A vault the AI can’t see', p: 'Passwords are encrypted in the browser with AES-256-GCM and a key derived through 600,000 PBKDF2 iterations. The passphrase never reaches the server, and vault contents are excluded from AI, embeddings and search.' },
      { h: 'Works without signal', p: 'Files marked for offline stay readable on a plane. Changes queue up and sync when the connection returns. It installs as a PWA and has an Android shell through Capacitor.' },
    ],
    shots: ['/work/orbis-0.webp', '/work/orbis-1.webp', '/work/orbis-2.webp'],
  },
  {
    video: '/work/video/tmf.webm',
    id: 'takemeforward', index: '02', name: ['TakeMe', 'Forward'], kind: 'Placement prep tracker', when: '2026 — now',
    line: 'Placement prep that moves you one step at a time. Log what you solve, and it tells you what to do today.',
    stats: [{ n: '5', l: 'revisions picked daily' }, { n: '3', l: 'judges synced' }, { n: '26wk', l: 'activity heatmap' }],
    stack: ['Next.js 15', 'Prisma', 'Supabase Postgres', 'NextAuth', 'Groq', 'Playwright', 'Vitest'],
    live: 'https://takemeforward.jvcodes.tech',
    caseFg: BONE, caseAccent: '#8F7BFF',
    problem: 'Placement prep leaks. You solve a problem, forget it in a month, skip core subjects and only find out in the interview. I wanted a tracker that tells me what to do next instead of just counting.',
    built: [
      { h: 'Paste a URL, get a log', p: 'Paste a problem link and its topic, pattern and difficulty fill in. LeetCode, Codeforces and CodeChef profiles sync nightly through their public endpoints.' },
      { h: 'A queue that remembers', p: 'Each day it picks up to five problems across different topics, from low confidence, stars, failed attempts and slow solves. Unfinished ones roll into a backlog.' },
      { h: 'One honest number', p: 'Readiness is DSA 40%, revision pass rate 20%, core subjects 20% and recent contests 20%. A daily snapshot feeds the monthly report.' },
      { h: 'Coach and Arena', p: 'An AI coach writes a daily brief from your own logs, capped and cached to stay inside free-tier limits, with built-in fallbacks when no key is set. Arena generates mock rounds.' },
    ],
    shots: ['/work/tmf-0.webp', '/work/tmf-1.webp', '/work/tmf-2.webp'],
  },
  {
    video: '/work/video/goto.webm',
    id: 'gotogethr', index: '03', name: ['GoTogethr'], kind: 'Group travel platform', when: 'Jan — Feb 2026',
    line: 'Group travel is messy. GoTogethr takes a trip from the first vote to the last settled rupee, in one place.',
    stats: [{ n: '25+', l: 'REST APIs' }, { n: '14+', l: 'pages' }, { n: '5', l: 'trip lifecycle stages' }],
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Gemini API', 'NextAuth'],
    live: 'https://gotogethr.jvcodes.tech',
    code: 'https://github.com/JVCodesABit/gotogethr',
    caseFg: BONE, caseAccent: '#14D8C4',
    problem: 'Every group trip dies in a WhatsApp thread, and the ones that survive end in an argument over who owes whom.',
    built: [
      { h: 'A trip has a lifecycle', p: 'Planning, Finalized, Ongoing, Settling, Completed. Each stage changes what members can do, so a locked plan stays locked and expenses only open when the trip does.' },
      { h: 'Decide by voting', p: 'Members propose destinations, dates and budgets, and the group votes. Admins finalize once the group has spoken.' },
      { h: 'Itineraries from Gemini', p: 'Give it a vibe and a budget and it returns a day-by-day plan across multiple destinations, built on real local spots and travel times.' },
      { h: 'A settlement engine', p: 'Editable expenses for groups of 2 to 15. Balances and reimbursements recalculate automatically, and the debt graph is simplified into the fewest payments.' },
    ],
    shots: ['/work/goto-0.webp', '/work/goto-1.webp', '/work/goto-2.webp'],
  },
  {
    video: '/work/video/mba.webm',
    id: 'mbaedge', index: '04', name: ['MBAEdge'], kind: 'MBA college predictor', when: 'Apr — May 2026',
    line: 'Rankings tell you which college is best. MBAEdge tells you which one is best for you, in probabilities and rupees.',
    stats: [{ n: '50+', l: 'colleges modelled' }, { n: '8+', l: 'matching criteria' }, { n: '10yr', l: 'ROI projection' }],
    stack: ['Next.js', 'Supabase', 'Clerk', 'Gemini API'],
    live: 'https://mbaedge.jvcodes.tech',
    caseFg: BONE, caseAccent: '#EDF03C',
    problem: 'Applicants choose a college worth lakhs of rupees using rankings and salary claims nobody audits.',
    built: [
      { h: 'A real matching engine', p: 'CAT percentile, academics, work experience and background run through each college’s own selection weightages to produce a call probability.' },
      { h: 'Colleges rated like bonds', p: 'Placement-backed credit scoring grades each college from AAA to B, and salary claims are discounted by that rating before they count.' },
      { h: 'Ten years of ROI', p: 'Each college gets a projection that accounts for loan EMI, salary growth and inflation, so the answer is a net gain rather than a package number.' },
      { h: 'An AI advisor', p: 'Four REST services and a Gemini advisor give personalised recommendations from the same data the predictor uses.' },
    ],
    shots: ['/work/mba-0.webp', '/work/mba-1.webp'],
  },
  {
    id: 'sahay', index: '05', name: ['Sahay'], kind: 'AI co-founder for Indian MSMEs · Team project', when: 'Mar — Apr 2026',
    line: 'A CFO and a business lawyer for small businesses, in Hindi or English. Built at Vihan Hackathon.',
    stats: [{ n: '7+', l: 'modules shipped' }, { n: '63M', l: 'MSMEs in India' }, { n: '2', l: 'languages' }],
    stack: ['Next.js', 'TypeScript', 'Prisma', 'OpenAI APIs'],
    code: 'https://github.com/zyph-parth/sahay',
    caseFg: INK, caseAccent: '#0E4D3A',
    problem: 'India has 63 million micro, small and medium businesses, and most can’t afford a CFO or a lawyer. They find out about a cash crunch or a missed filing after it has happened.',
    built: [
      { h: 'The Business Twin', p: 'A live mirror of the business: P&L, cash runway, overdue receivables and a health score.' },
      { h: 'Alerts before crises', p: 'Compliance deadlines and financial risks surface ahead of time, with a what-if simulator for testing decisions before making them.' },
      { h: 'Contracts and schemes', p: 'AI contract analysis flags what matters in a document, and a matcher finds the government schemes the business qualifies for.' },
      { h: 'Ask in Hindi or English', p: 'A chat advisor that answers from the business’s actual numbers instead of generic advice.' },
    ],
    shots: [],
  },
]

export const SAHAY_WORDS = ['Business Twin', 'AI Advisor', 'Compliance', 'Contracts', 'Schemes', 'What-If', 'Forecasts']

export const MORE: { name: string; what: string; tech: string; shape: ShapeName; href?: string }[] = [
  { name: 'DevFlow', what: 'API collections, uptime monitors, alerts, deploy tracking and scheduled jobs, with realtime dashboards.', tech: 'Turborepo · BullMQ · Redis · Docker', shape: 'wave' },
  { name: 'SmritiQ', what: 'A WhatsApp-first external memory. Text it what to remember and it takes care of the rest.', tech: 'Next.js · Hono · Supabase', shape: 'bubble' },
  { name: 'Cache Engine', what: 'An in-memory cache in C++ with O(1) LRU and LFU, TTL expiry, thread safety and metrics.', tech: 'C++ · CMake', shape: 'hex' },
  { name: 'MegaBlog', what: 'A clean full-stack blogging platform that gets out of the writer’s way.', tech: 'React · Redux Toolkit · Appwrite', shape: 'page', href: 'https://megablog.jvcodes.tech' },
  { name: 'CineMatch AI', what: 'A hybrid movie recommender using content similarity and matrix factorization, with a cold-start quiz.', tech: 'Python · FastAPI · React', shape: 'play' },
  { name: 'InboxZen', what: 'A Gmail client built as a PWA, for getting to an empty inbox.', tech: 'Next.js · Gmail API', shape: 'envelope' },
]

export const WINS: { big: string; title: string; detail: string; shape: ShapeName }[] = [
  { big: '1st', title: 'Delhi AI Grind 2026', detail: 'Winner of Delhi’s government-backed citywide AI challenge, which engaged 500,000+ student innovators.', shape: 'crown' },
  { big: '3rd', title: 'SAU Smart Campus Hackathon', detail: 'Podium finish among 200+ teams at a national-level hackathon, 2026.', shape: 'podium' },
  { big: '#2', title: 'NSUT, department rank', detail: 'University rank 9, with a CGPA of 9.41 in B.Tech CSE (AI), batch of 2028.', shape: 'shield' },
  { big: '3942', title: 'JEE Mains AIR', detail: 'And AIR 4065 in JEE Advanced, among 1.8M+ candidates.', shape: 'star' },
  { big: '550+', title: 'LeetCode problems solved', detail: 'LeetCode 1560 · Codeforces 1329 (Pupil) · CodeChef 1288.', shape: 'hex' },
  { big: '97.6', title: 'School topper, CBSE XII', detail: 'Lancer’s Convent, Delhi, 2024.', shape: 'page' },
]

export const STACK: { group: string; color: string; items: string[] }[] = [
  { group: 'Languages', color: '#15130F', items: ['C++', 'Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { group: 'Product', color: '#FF5B26', items: ['Next.js', 'React', 'HTML', 'CSS', 'PWA'] },
  { group: 'Backend', color: '#1E3BFF', items: ['Node.js', 'REST APIs', 'PostgreSQL', 'Prisma', 'Supabase', 'NextAuth', 'BullMQ'] },
  { group: 'AI', color: '#0E4D3A', items: ['Gemini', 'OpenAI', 'Groq', 'pgvector'] },
  { group: 'Foundations', color: '#5B3DF5', items: ['DSA', 'OOP', 'DBMS', 'OS', 'Git', 'Docker', 'Playwright'] },
]
