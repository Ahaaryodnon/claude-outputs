import type { Episode } from '../../data/types'
import { formatThursday } from '../../data/episodes'
import { CATEGORIES, D } from '../../brand/categories'
import { GLYPHS } from '../../brand/glyphs'
import { CalendarPage } from '../../brand/CalendarPage'
import type { BannerTheme } from '../../brand/FlowLines'
import { BannerShell, GCMark, bannerInk, bannerSec, bannerOverline } from './BannerShell'

function CatChip({ episode, theme }: { episode: Episode; theme: BannerTheme }) {
  const cat = CATEGORIES[episode.category]
  const Glyph = GLYPHS[episode.category]
  const c = cat.color === D.acc ? D.mid : cat.color
  const chipText = theme === 'dark' ? D.fg : D.ink
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '2cqh',
        padding: '1.6cqh 3.2cqh', borderRadius: '999px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(41,66,56,0.06)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(41,66,56,0.14)'}`,
      }}
    >
      <span style={{ width: '4.4cqh', height: '4.4cqh', color: c, display: 'flex' }}><Glyph size="100%" /></span>
      <span style={{
        fontSize: '3.8cqh', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: chipText,
      }}>{cat.name}</span>
    </div>
  )
}

interface EpisodeBannerProps {
  theme: BannerTheme
  episode: Episode
}

/**
 * "This week's episode" banner. Reworked: the episode's calendar page sits
 * on the right with its real Thursday date, so the date is a brand moment
 * instead of a text row.
 */
export function EpisodeBanner({ theme, episode }: EpisodeBannerProps) {
  const ink = bannerInk(theme)
  const sec = bannerSec(theme)
  const over = bannerOverline(theme)
  const pillBg = theme === 'dark' ? D.acc : D.ink
  const pillInk = theme === 'dark' ? D.ink : D.fg

  return (
    <BannerShell theme={theme}>
      <GCMark theme={theme} />

      <div style={{ marginLeft: '42%', width: '38%', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2.4cqh', marginBottom: '2.6cqh',
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: over,
        }}>
          <span style={{ width: '2.6cqh', height: '2.6cqh', borderRadius: '50%', background: over }} />
          This week · Episode {String(episode.epNumber).padStart(2, '0')}
        </div>
        <div style={{ fontWeight: 900, fontSize: '15cqh', lineHeight: 0.95, letterSpacing: '-0.02em', color: ink }}>
          {episode.title}<span style={{ color: D.acc }}>.</span>
        </div>
        <div style={{ fontSize: '5.4cqh', lineHeight: 1.15, color: sec, marginTop: '3cqh', fontWeight: 500 }}>
          {episode.hook}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5cqh', marginTop: '4.5cqh', flexWrap: 'wrap' }}>
          <CatChip episode={episode} theme={theme} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '1.6cqh',
            padding: '2cqh 4cqh', borderRadius: '999px', background: pillBg, color: pillInk,
            fontSize: '4cqh', fontWeight: 700,
          }}>Watch now <span aria-hidden="true">→</span></span>
        </div>
      </div>

      {/* The episode's actual Thursday, as the calendar device. */}
      <div
        style={{
          position: 'absolute', right: '7%', top: '50%', zIndex: 2,
          height: '64cqh', aspectRatio: '0.78',
          transform: 'translateY(-50%) rotate(-3.5deg)',
        }}
      >
        <CalendarPage episode={episode} withStamp={false} />
      </div>

      {/* Date caption under nothing — anchored bottom-right near the calendar. */}
      <div
        style={{
          position: 'absolute', right: '4cqh', bottom: '6cqh', zIndex: 2,
          fontSize: '3.6cqh', fontWeight: 600, color: sec, letterSpacing: '0.04em',
        }}
      >{formatThursday(episode.airDate)}</div>
    </BannerShell>
  )
}
