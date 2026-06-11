import type { Episode, Settings } from '../data/types'
import { D } from '../brand/categories'
import { CalendarPage } from '../brand/CalendarPage'

interface SeasonPosterProps {
  episodes: Episode[]
  settings: Settings
}

/** Season poster — every episode as a mini calendar page with its topic. */
export function SeasonPoster({ episodes, settings }: SeasonPosterProps) {
  const year = episodes[0]?.airDate.slice(0, 4) ?? '2026'
  const cols = Math.min(Math.max(episodes.length, 3), 6)
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.bg,
        padding: '4%', boxSizing: 'border-box', containerType: 'size',
        display: 'grid', gridTemplateRows: 'auto 1fr',
        gap: '2.4cqh', fontFamily: D.font,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2cqh' }}>
        <div>
          <div
            style={{
              fontSize: '2cqh', fontWeight: 500, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: D.mid, marginBottom: '0.6cqh',
            }}
          >· The {year} season ·</div>
          <div
            style={{
              fontWeight: 900, fontSize: '7cqh', lineHeight: 0.9,
              letterSpacing: '-0.02em', color: D.ink,
            }}
          >Tech Thursday<span style={{ color: D.acc }}>.</span></div>
          <div style={{ marginTop: '0.6cqh', fontSize: '2.2cqh', opacity: 0.65, maxWidth: '60ch', color: D.ink }}>
            {settings.tagline}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2cqh' }}>
          {[
            { c: D.acc, label: 'Microsoft' },
            { c: D.amber, label: 'AI · Copilot' },
            { c: D.mid, label: 'General' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6cqh' }}>
              <span style={{ width: '1.4cqh', height: '1.4cqh', background: l.c, borderRadius: 4 }} />
              <span style={{ fontSize: '1.6cqh', fontWeight: 600, opacity: 0.7, color: D.ink }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of mini calendar pages, topic below each. */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2.4cqh 2.2cqh', alignContent: 'start',
        }}
      >
        {episodes.map(ep => (
          <div key={ep.id} style={{ display: 'flex', flexDirection: 'column', gap: '1cqh' }}>
            <div style={{ aspectRatio: '0.78' }}>
              <CalendarPage episode={ep} withStamp={false} mini={true} />
            </div>
            <div style={{ paddingLeft: '0.3cqh' }}>
              <div
                style={{
                  fontSize: '1.7cqh', fontWeight: 700, lineHeight: 1.15,
                  color: D.ink, textWrap: 'balance',
                }}
              >{ep.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
