# Tech Thursday Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Tech Thursday Studio" — a Vite + React + TypeScript + Supabase web app that generates all Tech Thursday episode material (banners, episode-aware intro video, coming-next outro video, title cards, thumbnails, Teams banner, season poster) in the locked Direction D "Desk Calendar" brand, with PNG and MP4 export.

**Architecture:** A static SPA whose deliverables are pure React components `(episode, episodes) => JSX` rendered at native pixel size in a scaled preview stage. Brand primitives (calendar page, glyphs, tokens) live in `src/brand/` and are the single source of truth. Episode data lives in Supabase (`tt_episodes`, `tt_settings`) with a localStorage last-good cache. PNG export captures the offscreen native-size node via `html-to-image`; video export scrubs CSS animations frame-by-frame via the Web Animations API onto a canvas and encodes H.264 MP4 with WebCodecs + mp4-muxer (MediaRecorder WebM fallback).

**Tech Stack:** Vite 6, React 18, TypeScript, @supabase/supabase-js, html-to-image, jszip, mp4-muxer, Vitest. No Tailwind — GC design tokens as CSS variables.

**Reference:** The locked design prototypes are vendored at `tech-thursday-studio/design-reference/` (read-only reference, not imported by the app). Key files: `tt-shared.jsx` (categories, glyphs), `tt-direction-d.jsx` (CalendarPage, FillerDayPage, intro/outro, keyframes), `tt-bumper-episode.jsx` (episode-aware intro), `tt-sharepoint.jsx` (banners — to be visually reworked, not copied), `tt-kit-extras.jsx` (Wordmark, Poster, Spec card), `colors_and_type.css` (tokens). Spec: `docs/superpowers/specs/2026-06-11-tech-thursday-studio-design.md`.

---

### Task 1: Scaffold app + tokens + fonts + assets

**Files:**
- Create: `tech-thursday-studio/` via `npm create vite@latest . -- --template react-ts`
- Create: `tech-thursday-studio/src/brand/tokens.css` (port of `design-reference/colors_and_type.css` with font paths under `/fonts/`)
- Copy: `design-reference/fonts/*.woff2` → `tech-thursday-studio/public/fonts/`
- Copy: `design-reference/assets/*.png` → `tech-thursday-studio/public/assets/`
- Modify: `src/main.tsx` (import tokens.css), `index.html` (title "Tech Thursday Studio", dark-green theme color)
- Delete: Vite boilerplate (`App.css`, logo svgs, default App content)

**Steps:**
- [ ] Scaffold, install deps: `npm i @supabase/supabase-js html-to-image jszip mp4-muxer` and `npm i -D vitest`
- [ ] Port tokens.css — keep every `--gc-*`/semantic variable and type class verbatim; rewrite `@font-face` to the five available woff2 cuts (300/400/500/700/900) at `/fonts/CeraPro-*.woff2`; drop FOT-TsukuARdGothic from `--font-display` (not available — Cera Pro is the brand face in all prototypes)
- [ ] Add `"test": "vitest run"` script; `npm run build` passes; commit

### Task 2: Domain types + pure logic (TDD)

**Files:**
- Create: `tech-thursday-studio/src/data/types.ts`
- Create: `tech-thursday-studio/src/data/episodes.ts` (pure helpers)
- Test: `tech-thursday-studio/src/data/episodes.test.ts`

**Types (locked contract):**

```ts
export type CategoryKey = 'ms' | 'ai' | 'gen';
export type EpisodeStatus = 'planned' | 'published';
export interface Episode {
  id: string;
  epNumber: number;
  title: string;
  hook: string;          // one-line sub, e.g. "Win + V. Never lose a snippet."
  category: CategoryKey;
  airDate: string;       // ISO date 'YYYY-MM-DD', always a Thursday by convention
  status: EpisodeStatus;
}
export interface Settings { tagline: string; cadenceText: string; }
```

**Pure helpers + tests (write failing tests first, then implement):**

```ts
// episodes.ts
export interface FillerDay { name: string; num: string; month: string }
export function fillerDaysFor(airDate: string): FillerDay[]
// real date arithmetic: Mon/Tue/Wed before airDate, month from each actual day
// (fixes prototype bug where "Thu 2 Jul" would produce day "-1")

export function nextEpisode(episodes: Episode[], current: Episode): Episode | null
// smallest airDate strictly after current.airDate; null if none

export function sortByAirDate(episodes: Episode[]): Episode[]
export function slug(s: string): string  // 'Clipboard history' -> 'clipboard-history'
export function formatDay(airDate: string): { day: string; month: string; year: string }
// '2026-06-04' -> { day: '4', month: 'Jun', year: '2026' }
```

Test cases: month-boundary filler days (`2026-07-02` → Mon `29 Jun`, Tue `30 Jun`, Wed `1 Jul`); same-month case; nextEpisode ordering, tie/none cases; slug punctuation; formatDay.

- [ ] Write tests → run (fail) → implement → run (pass) → commit

### Task 3: Supabase schema + seed + client + repository

**Files:**
- Migrations via Supabase MCP `apply_migration` on project `mxmhagjmtgoibyqvwlio`
- Create: `tech-thursday-studio/.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` from MCP `get_project_url` / `get_publishable_keys`) + `.env.example`
- Create: `tech-thursday-studio/src/data/supabase.ts` (client)
- Create: `tech-thursday-studio/src/data/repository.ts`

**Migration `create_tt_tables`:**

```sql
create table if not exists tt_episodes (
  id uuid primary key default gen_random_uuid(),
  ep_number int not null,
  title text not null,
  hook text not null default '',
  category text not null check (category in ('ms','ai','gen')),
  air_date date not null,
  status text not null default 'planned' check (status in ('planned','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists tt_settings (
  id int primary key default 1 check (id = 1),
  tagline text not null default 'Two minutes. One tip. Every other Thursday.',
  cadence_text text not null default 'Every other Thursday'
);
alter table tt_episodes enable row level security;
alter table tt_settings enable row level security;
create policy "tt_episodes anon all" on tt_episodes for all using (true) with check (true);
create policy "tt_settings anon all" on tt_settings for all using (true) with check (true);
insert into tt_settings (id) values (1) on conflict do nothing;
```

**Seed (from design bundle; Clipboard history is Ep 01 / 2026-06-04 per chat2):**
Ep 01 Clipboard history (gen, 2026-06-04, published) · Ep 02 Summarise a webpage (ai, 2026-06-18) · Ep 03 Teams meeting recap (ms, 2026-07-02) · Ep 04 Image for slides (ai, 2026-07-16) · Ep 05 Snap Layouts (gen, 2026-07-30) · Ep 06 Schedule send (ms, 2026-08-13). Hooks from `tt-shared.jsx` TT_EP.

**Repository contract:**

```ts
export interface RepoResult { episodes: Episode[]; settings: Settings; offline: boolean }
export async function loadAll(): Promise<RepoResult>          // supabase → fallback localStorage cache ('tt-studio-cache-v1') → fallback bundled seed
export async function upsertEpisode(e: Episode): Promise<void>
export async function deleteEpisode(id: string): Promise<void>
export async function saveSettings(s: Settings): Promise<void>
```

- [ ] Apply migrations, seed, verify with `execute_sql select`, write client/repo, build passes, commit

### Task 4: Brand layer components

**Files:**
- Create: `src/brand/categories.ts` (port TT_CAT from `design-reference/tt-shared.jsx`)
- Create: `src/brand/glyphs.tsx` (port GlyphMS/GlyphAI/GlyphGen verbatim)
- Create: `src/brand/CalendarPage.tsx` + `src/brand/FillerDayPage.tsx` (port from `design-reference/tt-direction-d.jsx:96-209,364-432`; props change from `ep.date` string parsing to `formatDay(episode.airDate)`; `Ep` label uses `epNumber`)
- Create: `src/brand/FlowLines.tsx` (port from `tt-sharepoint.jsx:23-48`)
- Create: `src/brand/motion.css` (all `d-tear-*`, `d-land`, `d-stamp-in`, `d-text-in`, `ep-rise` keyframes as a real stylesheet — **modified to hold at end** (no 92%→100% fade-out); looping handled by remount in preview)
- Create: `src/brand/GCFooter.tsx` (logo icon + "Ground Control", explicit `#294238` on light / white on dark)

- [ ] Port, type all props (`episode: Episode`), `npm run build` passes, commit

### Task 5: App shell + preview stage + episode picker

**Files:**
- Create: `src/app/App.tsx` (sidebar + view switch via `useState<ViewKey>`, no router)
- Create: `src/app/Sidebar.tsx` — views: `episodes | videos | banners | cards | brand`
- Create: `src/app/EpisodePicker.tsx` (global select, sorted by airDate, shows "Ep 01 · Clipboard history · Thu 4 Jun")
- Create: `src/app/Stage.tsx` — renders a deliverable at native px inside `transform: scale()` fit-to-container (pattern from `design-reference/`Episode Bumper recorder `fitStage()`), with checkerboard-free calm backdrop, label + size caption
- Create: `src/app/StudioContext.tsx` — React context: `{ episodes, settings, selected, offline, actions }`, loads via repository on mount
- Create: `src/app/app.css` — professional shell styling on GC tokens (dark-green sidebar, warm-grey canvas, Cera Pro)
- Create: `src/app/OfflineBanner.tsx`

- [ ] Build shell with placeholder view bodies, verify in browser (Claude Preview), commit

### Task 6: Episode editor view

**Files:**
- Create: `src/views/EpisodesView.tsx` — table of episodes (number, title, category chip, date, status), inline edit drawer/form: title, hook, category select, air-date picker (date input), ep number, status; add + delete (confirm); writes via repository, optimistic update; "next up" indicator derived via `nextEpisode` from today

- [ ] Implement, manually verify CRUD round-trips against Supabase, commit

### Task 7: Video deliverables (intro + outro components)

**Files:**
- Create: `src/deliverables/IntroBumper.tsx` — port of `design-reference/tt-bumper-episode.jsx` `IntroBumperEpisode`, but: filler days from `fillerDaysFor(episode.airDate)` (real date math), `formatDay` for the landing page, play-once animations (hold at end), no PlayBadge, Aaron memoji greeting from `tt-direction-d.jsx:328-356` included
- Create: `src/deliverables/OutroBumper.tsx` — based on `tt-direction-d.jsx` `OutroD` but episode-aware + animated like the intro's text rises: kicker "Coming up next · Thursday {date}", next episode title hero, hook, category chip, "Try this week's tip →" pill, GC footer; `nextEp` prop with automatic derivation + manual override in the view
- Create: `src/deliverables/sizes.ts` — `export const SIZES = { video: {w:1920,h:1080}, banner: {w:1920,h:480}, thumb169: {w:1280,h:720}, thumbSq: {w:1080,h:1080}, teams: {w:1600,h:300}, poster: {w:1920,h:1080}, title: {w:1920,h:1080} }`
- Create: `src/views/VideosView.tsx` — intro/outro tabs, replay button (remount key), loop toggle, export buttons

- [ ] Implement, visually verify tear-off + stamp + text timing in preview, commit

### Task 8: Video export engine (MP4 + WebM fallback)

**Files:**
- Create: `src/export/renderVideo.ts`

**Contract + approach:**

```ts
export interface VideoExportOpts {
  node: HTMLElement;        // native-size 1920×1080 offscreen stage
  durationMs: number;       // 5200
  fps: number;              // 30
  width: number; height: number;
  onProgress: (phase: 'frames'|'encode', done: number, total: number) => void;
}
export async function renderVideo(opts: VideoExportOpts): Promise<{ blob: Blob; ext: 'mp4'|'webm' }>
```

1. `await document.fonts.ready`. Collect `document.getAnimations()` whose effect target is inside `node`; pause all.
2. For each frame i: set `currentTime = i/fps*1000` (clamped to duration), `await raf`, rasterise with `htmlToImage.toCanvas(node, { width, height, pixelRatio: 1, backgroundColor: '#E6EBE3' })`.
3. MP4 path (if `'VideoEncoder' in window`): `mp4-muxer` `Muxer({ target: ArrayBufferTarget, video: { codec: 'avc', width, height }, fastStart: 'in-memory' })`; `VideoEncoder` config `{ codec: 'avc1.640028', width, height, bitrate: 8_000_000, framerate: fps }`; per frame `new VideoFrame(canvas, { timestamp: i * 1e6 / fps, duration: 1e6 / fps })`, keyFrame every 60; flush, finalize → `video/mp4`.
4. Fallback: draw decoded frames onto a capture canvas at fps over a `canvas.captureStream(fps)` + `MediaRecorder` (vp9→vp8→webm), as in the prototype recorder (`design-reference/`… `Episode Bumper.html:156-246`).
5. Resume animations; return blob. Caller downloads as `tech-thursday-{intro|outro}-ep{NN}-{slug}.{ext}`.

- [ ] Implement, wire to VideosView, render a real MP4, verify duration ≈5.2s and playback (open file), commit

### Task 9: Banner deliverables (reworked) + title card + thumbnails + Teams + poster

**Files:**
- Create: `src/deliverables/banners/MainBanner.tsx`, `EpisodeBanner.tsx`, `PreviousBanner.tsx` — start from `design-reference/tt-sharepoint.jsx` but **rework per spec**: a real `CalendarPage` (the hero brand device) anchors the right composition; FlowLines stay but quieter; left ~40% calm for SP title overlay; `theme: 'dark'|'light'` prop; PreviousBanner cards from the actual 3 most recent published episodes (fallback to examples)
- Create: `src/deliverables/TitleCard.tsx` (port `TitleCardD`), `src/deliverables/Thumbnail.tsx` (16:9 + square variants, port `ThumbD`), `src/deliverables/TeamsBanner.tsx` (port `BannerD`, episodes from data), `src/deliverables/SeasonPoster.tsx` (port `PosterD` from `tt-kit-extras.jsx`, grid driven by real episodes, legend from categories)
- Create: `src/views/BannersView.tsx`, `src/views/CardsView.tsx` (deliverable grid w/ theme toggles + export buttons)
- Create: `src/views/BrandKitView.tsx` (Wordmark, logo lockups, Spec card port — reference only, exportable)

- [ ] Implement, visually verify all at fit-to-stage and 100%, commit

### Task 10: PNG export + episode pack zip

**Files:**
- Create: `src/export/renderPng.ts` — render target component into a hidden fixed-size offscreen container (`position:fixed; left:-99999px; width/height native`), `await document.fonts.ready`, `htmlToImage.toPng(node, {width,height,pixelRatio:1})`, trigger download `tech-thursday-ep{NN}-{slug}-{deliverable}[-dark|-light].png`
- Create: `src/export/episodePack.ts` — for selected episode render all PNG deliverables + add to JSZip → `tech-thursday-ep{NN}-{slug}-pack.zip`
- Create: `src/export/offscreen.tsx` — helper `renderOffscreen(jsx, w, h): Promise<{node, cleanup}>` using `createRoot`
- Modify: views to wire export buttons + pack button in shell header

- [ ] Implement, export one banner → verify 1920×480 actual pixels (`sips -g pixelWidth`), export pack zip, commit

### Task 11: Polish + verification + docs

- [ ] UI polish pass: focus states, hover, empty states, keyboard nav on picker, loading skeleton
- [ ] Run `npm run test` (all green), `npm run build` (clean)
- [ ] Full visual verification via Claude Preview: every view, every deliverable, light+dark; screenshot evidence
- [ ] Render + verify final MP4 (intro and outro) and a banner PNG
- [ ] `tech-thursday-studio/README.md`: setup (env vars), scripts, architecture map, export notes
- [ ] Commit; final review pass of diff

---

## Self-review notes

- Spec coverage: all 9 deliverable types have tasks (7, 9); data/RLS/offline (3); MP4+fallback (8); design fixes (4 motion hold-at-end, 9 banner rework); tests (2); episode editor (6). ✓
- Types consistent: `Episode`/`fillerDaysFor`/`nextEpisode`/`slug` signatures defined in Task 2 and consumed in 4, 7, 8, 9, 10. ✓
- Sizes locked in `sizes.ts` (Task 7) consumed by 9 & 10. ✓
