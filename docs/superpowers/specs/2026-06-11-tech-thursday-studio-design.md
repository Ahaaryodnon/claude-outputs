# Tech Thursday Studio — Design

**Date:** 2026-06-11
**Status:** Approved by Aaron (2026-06-11)
**Source design:** Claude Design handoff bundle (Direction D · "Desk Calendar"), extracted to `/tmp/tech-thursday-design/tech-thursday/`

## Purpose

A professional internal web app that generates every asset for a Tech Thursday
episode from one place: pick or edit an episode, preview each deliverable live
in the locked Direction D "Desk Calendar" brand, and export print-ready PNGs
and broadcast MP4 videos.

The design medium in the bundle is HTML/CSS/JS prototypes. This app recreates
the locked visual direction faithfully, makes all content dynamic
(episode-driven), and fixes known issues (the "a bit naff" SharePoint banners,
loop badges, glitchy flip frames, stale dropdowns).

## Stack

- **Vite + React + TypeScript** SPA at `tech-thursday-studio/` in the
  `claude-outputs` repo.
- **No Tailwind** — the Ground Control token system (CSS variables ported from
  `colors_and_type.css`) is the styling source of truth. Cera Pro woff2 fonts
  bundled locally.
- **Supabase** for episode data, using the existing active project
  **`mxmhagjmtgoibyqvwlio`** ("Ahaaryodnon's Project", eu-west-2) with
  `tt_`-prefixed tables. No new Supabase project.

## Architecture

### Brand layer — `src/brand/`

One source of truth consumed by every deliverable:

- `tokens.css` — ported GC tokens (colors, type scale, spacing, radius,
  elevation, motion) + `@font-face` for bundled Cera Pro.
- `categories.ts` — category palette and metadata:
  - Microsoft Stack: `#B2D235` (ink `#294238`)
  - AI · Copilot Free: `#F57821` (ink `#FFFFFF`)
  - General Tip: `#50B748` (ink `#FFFFFF`)
- `glyphs.tsx` — the three category glyphs (MS quad, AI sparkle, GEN bulb),
  100×100 viewBox, `currentColor`.
- `CalendarPage.tsx` / `FillerDayPage.tsx` — the hero brand device (torn-off
  desk calendar page), parameterised by episode.
- `FlowLines.tsx` — corner flowing-line motif for banners.
- Assets: `aaron-memoji.png`, `logo-icon-dark.png`, `logo-icon-white.png`.

### Deliverable components — `src/deliverables/`

Each artboard is a pure React component taking `(episode, episodes)` props and
rendering at native resolution inside a scaled preview stage. Fully dynamic.

| Deliverable | Size | Notes |
|---|---|---|
| Intro bumper (episode-aware) | 1920×1080, ~5.2s | Calendar tears Mon→Tue→Wed→Thursday (episode's real date), stamp slams in, episode title is the hero |
| Outro bumper ("coming next") | 1920×1080, ~5.2s | Next episode derived automatically; calendar page + title + hook + CTA |
| SharePoint main banner | 1920×480, dark + light | Reworked composition (see Design fixes) |
| SharePoint this-week banner | 1920×480, dark + light | Episode-driven |
| SharePoint previous-episodes banner | 1920×480, dark + light | Example cards from real past episodes |
| Title card | 1920×1080 | Episode-driven |
| Thumbnails | 1280×720 + square | Episode-driven |
| Teams channel banner | wide | Upcoming Thursdays row |
| Season poster | portrait/16:9 | All episodes grid |

### App shell — `src/app/`

- Left sidebar: Episodes / Videos / Banners / Cards & Thumbs / Brand Kit.
- Global episode picker (persists across views).
- Preview stage with zoom-to-fit at true aspect ratio.
- Export bar per view + "Export episode pack" (zip of everything for the
  selected episode).
- High-polish UI built on GC tokens: calm, warm, confident. Professional
  UI/UX standard is an explicit requirement.

## Data (Supabase)

### Tables

- **`tt_episodes`**: `id` (uuid pk), `ep_number` (int), `title` (text),
  `hook` (text — the one-line sub), `category` (enum: ms/ai/gen),
  `air_date` (date), `status` (enum: planned/published),
  `created_at`/`updated_at`.
- **`tt_settings`**: singleton row — `tagline`, `cadence_text`
  (e.g. "Every other Thursday").

Seeded from the six episodes in the design bundle (Clipboard history is Ep 01,
aired Thu 4 Jun 2026).

### Access

- RLS enabled with anon read/write policies — episode titles are not
  sensitive, this is an internal tool; auth can be added later.

### Editor & derivation

- In-app episode editor: add/edit/delete/reorder episodes.
- "Coming next" for the outro = next episode by `air_date` after the selected
  episode, with a manual override.

### Offline behaviour

- Last-good data cached in localStorage; previews still render if Supabase is
  unreachable. Saves disabled with a clear banner when offline.

## Exports

### PNG

- Render at true pixel size offscreen, capture via `html-to-image`, download
  at exact dimensions. No tile-stitching.
- Zip batches via JSZip ("Export episode pack").
- Filenames: `tech-thursday-<ep>-<slug>-<deliverable>[-dark|-light].png`.

### Video

- 1920×1080, ~5.2s, 30fps.
- CSS animations paused and scrubbed frame-by-frame via the Web Animations
  API (proven in the prototype recorder), drawn to canvas.
- Encode **H.264 MP4 via WebCodecs + mp4-muxer**; fall back to
  **WebM via MediaRecorder** when WebCodecs/H.264 unavailable.
- Loop-driven keyframes rebuilt as play-once timelines so exports don't
  include the loop reset (no blank first frames, no fade-out-for-loop tail
  unless wanted).

## Design fixes carried in (not just a port)

1. **SharePoint banners reworked** (Aaron: "a bit naff"): the calendar motif —
   the brand's hero device — appears on the banners instead of only abstract
   corner lines; tightened type hierarchy; left ~40% kept calm for
   SharePoint's title overlay.
2. "Loops every 5s" badge removed from all rendered output.
3. Glitchy flip frames eliminated (tear-off motion, no edge-on rotateX).
4. Episode dropdown always in sync with rendered episode.
5. "Ground Control" wordmark always explicit Dark Green on light backgrounds.

## Testing

- **Vitest** unit tests for pure logic: date math (filler-day derivation from
  air date), next-episode derivation, episode ordering, export filename slugs.
- Visual verification of every deliverable via local preview before
  completion; video export verified by rendering one and checking duration,
  size, and playability.

## Out of scope (YAGNI)

- Auth / multi-tenant.
- Vertical 9:16 cuts and lower-thirds (mentioned in chats as "when ready to
  film" — can be added later).
- Server-side rendering of videos.
