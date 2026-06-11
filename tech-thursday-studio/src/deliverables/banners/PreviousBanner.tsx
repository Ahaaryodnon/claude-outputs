import type { Episode } from '../../data/types'
import { formatDay } from '../../data/episodes'
import { CATEGORIES, D } from '../../brand/categories'
import { GLYPHS } from '../../brand/glyphs'
import type { BannerTheme } from '../../brand/FlowLines'
import { BannerShell, bannerInk, bannerSec, bannerOverline } from './BannerShell'

const EXAMPLES: Pick<Episode, 'title' | 'hook' | 'category' | 'airDate' | 'epNumber'>[] = [
  { epNumber: 0, category: 'ms', title: 'Schedule send', hook: 'Send any email later from Outlook.', airDate: '2026-05-28' },
  { epNumber: 0, category: 'ai', title: 'Summarise a page', hook: 'Ask Copilot for the gist in seconds.', airDate: '2026-06-11' },
  { epNumber: 0, category: 'gen', title: 'Snap layouts', hook: 'Win + Z to arrange your windows.', airDate: '2026-06-25' },
]

interface PrevCardProps {
  theme: BannerTheme
  ep: Pick<Episode, 'title' | 'hook' | 'category' | 'airDate' | 'epNumber'>
}

function PrevCard({ theme, ep }: PrevCardProps) {
  const cat = CATEGORIES[ep.category]
  const Glyph = GLYPHS[ep.category]
  const accent = cat.color === D.acc && theme !== 'dark' ? D.mid : cat.color
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.05)' : D.page
  const border = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(41,66,56,0.10)'
  const ink = bannerInk(theme)
  const sub = theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(41,66,56,0.55)'
  const teaser = theme === 'dark' ? 'rgba(255,255,255,0.66)' : 'rgba(41,66,56,0.62)'
  const { day, month } = formatDay(ep.airDate)
  return (
    <div
      style={{
        flex: 1, minHeight: '66cqh', background: cardBg, border: `1px solid ${border}`,
        borderRadius: '5cqh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: theme === 'dark' ? 'none' : '0 2cqh 5cqh rgba(41,66,56,0.10)',
      }}
    >
      {/* Mini calendar top bar — ties the cards to the brand device. */}
      <div
        style={{
          background: cat.color, color: cat.ink,
          padding: '1.6cqh 4cqh',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '3cqh', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Thu {day} {month}
        </span>
        <span style={{ width: '3.6cqh', height: '3.6cqh', display: 'flex', opacity: 0.9 }}>
          <Glyph size="100%" />
        </span>
      </div>
      <div style={{ padding: '3.4cqh 4cqh', display: 'flex', flexDirection: 'column', gap: '1.8cqh', flex: 1 }}>
        <span style={{ fontSize: '3cqh', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sub }}>
          {ep.epNumber ? `Ep ${String(ep.epNumber).padStart(2, '0')} · ` : ''}{cat.short}
        </span>
        <div style={{ fontSize: '5.6cqh', fontWeight: 800, lineHeight: 1.0, color: ink, letterSpacing: '-0.01em' }}>
          {ep.title}
        </div>
        <div style={{ marginTop: 'auto', fontSize: '3.4cqh', lineHeight: 1.2, color: teaser, fontWeight: 500 }}>
          {ep.hook}
        </div>
      </div>
      <div style={{ height: '1.2cqh', background: accent, opacity: 0.9 }} />
    </div>
  )
}

interface PreviousBannerProps {
  theme: BannerTheme
  /** Real episode list — the three most recent published ones are shown. */
  episodes: Episode[]
}

/** "Previous episodes" banner — example cards drawn from the real schedule. */
export function PreviousBanner({ theme, episodes }: PreviousBannerProps) {
  const ink = bannerInk(theme)
  const sec = bannerSec(theme)
  const over = bannerOverline(theme)

  // Real episodes once three have shipped; illustrative examples until then
  // (per the design brief: "a banner for previous, with examples").
  const published = episodes
    .filter(e => e.status === 'published')
    .sort((a, b) => b.airDate.localeCompare(a.airDate))
    .slice(0, 3)
  const cards = published.length >= 3 ? published : EXAMPLES

  return (
    <BannerShell theme={theme} motifStrength={0.45}>
      <div style={{ width: '31%', paddingLeft: '7cqh', paddingRight: '3cqh', position: 'relative', zIndex: 2, flex: '0 0 auto' }}>
        <div style={{
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: over, marginBottom: '3cqh',
        }}>Catch up</div>
        <div style={{ fontWeight: 900, fontSize: '12.5cqh', lineHeight: 0.92, letterSpacing: '-0.02em', color: ink }}>
          Previous<br />episodes<span style={{ color: D.acc }}>.</span>
        </div>
        <div style={{ fontSize: '4.4cqh', lineHeight: 1.2, color: sec, marginTop: '3.5cqh', fontWeight: 500 }}>
          Every tip, in one place.
        </div>
      </div>
      <div
        style={{
          flex: 1, display: 'flex', gap: '3.5cqh', alignItems: 'stretch',
          paddingRight: '7cqh', paddingLeft: '2cqh', position: 'relative', zIndex: 2,
        }}
      >
        {cards.map((e, i) => (
          <PrevCard key={i} theme={theme} ep={e} />
        ))}
      </div>
    </BannerShell>
  )
}
