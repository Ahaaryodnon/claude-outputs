# Tech Thursday Studio

Generate every asset for a Tech Thursday episode from one place — banners,
episode-aware intro videos, "coming next" outro videos, title cards,
thumbnails, the Teams banner and the season poster — all in the locked
Ground Control **Direction D · Desk Calendar** brand.

Built from the Claude Design handoff bundle vendored at
[`design-reference/`](design-reference/) (read-only reference, not imported
by the app). Spec: [`docs/superpowers/specs/2026-06-11-tech-thursday-studio-design.md`](../docs/superpowers/specs/2026-06-11-tech-thursday-studio-design.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Environment (`.env.local`, see `.env.example`):

```
VITE_SUPABASE_URL=https://mxmhagjmtgoibyqvwlio.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_…
```

Without these the app still runs, read-only, on cached/seed data.

## How it works

- **Episodes** live in Supabase (`tt_episodes`, `tt_settings`) and are edited
  in the *Episodes* view. Every deliverable re-renders from this data — change
  a title, date or category and the bumpers, banners and cards follow.
- **Deliverables** (`src/deliverables/`) are pure React components rendered at
  native pixel size inside a scaled preview stage (`src/app/Stage.tsx`). The
  brand primitives — calendar page, category glyphs, flow lines, GC tokens —
  live in `src/brand/` and are the single source of truth.
- **The outro's "coming next"** is derived automatically (next episode by air
  date after the selected one) with a manual override in the Videos view.

## Exports

| What | How | Output |
|---|---|---|
| Intro / outro video | *Intro & Outro* → Render & download | 1920×1080, ~5.2 s, 30 fps **MP4 (H.264)**; WebM fallback on browsers without WebCodecs |
| Any banner / card / poster | ↓ PNG button on its stage | PNG at exact native pixels (e.g. 1920×480 banners) |
| Everything for an episode | **Export episode pack** (top bar) | Zip of all 11 PNG deliverables |

Video export pauses the CSS animations, scrubs them frame-by-frame via the
Web Animations API, rasterises each frame (html-to-image `toSvg` + manual
canvas draw) and encodes with WebCodecs through
[Mediabunny](https://mediabunny.dev). A full bumper takes a couple of minutes
— keep the tab open.

## Data

Tables in the "Ahaaryodnon's Project" Supabase project (eu-west-2):

- `tt_episodes` — `ep_number, title, hook, category (ms|ai|gen), air_date, status (planned|published)`
- `tt_settings` — singleton: `tagline`, `cadence_text`

RLS allows anon read/write — internal tool, non-sensitive data; add Supabase
Auth before exposing it more widely.

## Development

```bash
npm test           # vitest — date math, next-episode derivation, slugs
npm run build      # tsc + vite build
npx eslint src
```

Notes:

- Bumper keyframes (`src/brand/motion.css`) **hold at their end state**;
  preview looping works by remounting. Exports never contain loop-reset frames.
- `CalendarPage` / `FillerDayPage` are self-contained size containers (`cqh`
  relative to their own height) so the brand device renders correctly at any
  artboard aspect.
- html-to-image's `toCanvas`/`toPng` resolve inside `requestAnimationFrame`,
  which stalls in background tabs — exports use `toSvg` + manual draw instead.
