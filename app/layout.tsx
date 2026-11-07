import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, DM_Mono } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['wdth', 'opsz'],
  display: 'swap',
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const description =
  'Full-stack developer and CSE (AI) student at NSUT, Delhi. I build products end to end: Orbis, TakeMeForward, GoTogethr, MBAEdge and Sahay.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.jvcodes.tech'),
  title: 'Jagrat Varshney',
  description,
  icons: '/favicon.png',
  keywords: ['Jagrat Varshney', 'Full Stack Developer', 'NSUT', 'Portfolio', 'Next.js', 'React', 'AI'],
  openGraph: {
    title: 'Jagrat Varshney',
    description,
    url: 'https://www.jvcodes.tech',
    type: 'website',
    images: ['/work/portrait.webp'],
  },
}

export const viewport: Viewport = {
  themeColor: '#EFEBE1',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
