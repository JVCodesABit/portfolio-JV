import type { Metadata } from 'next'
import { Bebas_Neue, Space_Mono, Syne } from 'next/font/google'
import './globals.css'
import './hero.css'
import SmoothScroll from '@/components/SmoothScroll'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
})

export const metadata: Metadata = {
  title: 'Jagrat Varshney — NSUT',
  icons: '/favicon.png',
  description:
    'Full-Stack Developer & CS (AI) student at NSUT. A product obsessed coder with a knack for building sleek, performant web apps. Passionate about turning complex problems into elegant solutions and crafting seamless user experiences.',
  keywords: ['Jagrat Varshney', 'Full Stack Developer', 'NSUT', 'Portfolio', 'Next.js', 'React', 'AI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${bebasNeue.variable} ${spaceMono.variable} ${syne.variable} font-body bg-bg text-[#e8f0fe] overflow-x-hidden`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
