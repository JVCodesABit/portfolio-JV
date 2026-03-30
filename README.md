# Jagrat Varshney — Portfolio (Next.js)

A blazing-fast, animation-heavy portfolio built with **Next.js 14**, **Framer Motion**, **React Three Fiber**, and **Lenis** smooth scroll.

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Animations | Framer Motion 11 |
| 3D / WebGL | React Three Fiber + Drei |
| Smooth Scroll | Lenis |
| Styling | Tailwind CSS |
| Language | TypeScript |

## Features

- 🎯 **Custom spring cursor** — dot + trailing ring with Framer Motion `useSpring`
- 🌌 **3D particle field** — React Three Fiber with mouse-reactive camera
- 🔤 **Letter-by-letter hero animation** — with glitch effect
- 🧲 **Magnetic contact buttons** — pull toward cursor
- 🃏 **3D tilt skill cards** — `useMotionValue` + `useTransform`
- 🔢 **Animated number counters** — triggered on scroll
- ⌨️ **Typewriter code block** — scroll-triggered
- 🎞️ **Curtain loader** — splits open with `AnimatePresence`
- 📜 **Lenis smooth scroll** — butter-smooth inertia
- 🔊 **Framer Motion marquee** — infinite ticker
- 🌗 **Noise texture overlay** — film grain via CSS

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

## Deploy to Vercel (30 seconds)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or drag & drop this folder at [vercel.com/new](https://vercel.com/new).

## Project Structure

```
jagrat-nextjs/
├── app/
│   ├── layout.tsx       # Root layout, fonts, metadata
│   ├── page.tsx         # Page composition
│   └── globals.css      # Tailwind + custom animations
├── components/
│   ├── CustomCursor.tsx  # Spring cursor
│   ├── Loader.tsx        # Curtain loader
│   ├── Nav.tsx           # Fixed nav
│   ├── ParticleField.tsx # R3F 3D scene
│   ├── Hero.tsx          # Hero + glitch name
│   ├── MarqueeTicker.tsx # Infinite marquee
│   ├── About.tsx         # Stats + typewriter
│   ├── Skills.tsx        # 3D tilt cards
│   ├── Projects.tsx      # Spotlight cards
│   ├── Achievements.tsx  # Sweep rows
│   ├── Contact.tsx       # Magnetic links
│   ├── Footer.tsx        # Footer
│   └── SmoothScroll.tsx  # Lenis wrapper
├── lib/
│   └── data.ts           # All your portfolio data
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

## Customisation

All your data lives in **`lib/data.ts`** — edit it to add projects, skills, achievements, and contact links. No other files need to change.
