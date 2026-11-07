# jvcodes.tech

Portfolio of Jagrat Varshney. One looping path of 280 spring-driven points carries the whole site: it becomes each project's shape, floods the page with the next colour, and grows into the case studies.

## Run it

```bash
npm install
npm run dev
```

## Where things live

| Path | What it holds |
|---|---|
| `lib/data.ts` | All content and each section's colours, shape and images. Start here to edit the site. |
| `lib/shapes.ts` | The shape library. Add an SVG path to `PATHS`, then use its name in `lib/data.ts`. |
| `lib/engine.ts` | The canvas engine: springs, morphing, colour flood, images inside the shape. |
| `components/` | The nav, case studies, liquid words and physics pit. |
| `public/work/` | Screenshots and photos, drawn inside the shape. |

Any element can morph the shape on hover or focus with `data-morph="shapeName"`, plus `data-morph-img="/work/x.webp"` to show an image inside it.

Videos in `public/work/video/` play inside the shapes, with the images as a fallback. Sound (`lib/sound.ts`) is synthesised and off by default. The hidden game (`lib/game.ts`) opens with five quick presses on the shape, or by typing "play".

With `prefers-reduced-motion`, springs, intro, physics, video autoplay and liquid text are off, and colours crossfade instead of flooding.
