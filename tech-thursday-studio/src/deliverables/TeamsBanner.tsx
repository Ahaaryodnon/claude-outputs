import type { Episode, Settings } from '../data/types'
import { D } from '../brand/categories'
import { CalendarPage } from '../brand/CalendarPage'
import { GCFooter } from '../brand/GCFooter'

interface TeamsBannerProps {
  episodes: Episode[]
  settings: Settings
}

/** Teams channel banner — a row of upcoming Thursdays. */
export function TeamsBanner({ episodes, settings }: TeamsBannerProps) {
  const row = episodes.slice(0, 6)
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.bg,
        padding: '3% 4%', boxSizing: 'border-box', containerType: 'size',
        display: 'flex', alignItems: 'center', gap: '3%',
        position: 'relative', fontFamily: D.font,
      }}
    >
      <div style={{ flex: '0 0 32%' }}>
        <div
          style={{
            fontSize: '3cqh', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: D.mid, marginBottom: '1cqh',
          }}
        >· {settings.cadenceText} ·</div>
        <div
          style={{
            fontFamily: D.font, fontWeight: 900, fontSize: '24cqh', lineHeight: 0.85,
            letterSpacing: '-0.03em', color: D.ink,
          }}
        >Tech<br />Thursday<span style={{ color: D.acc }}>.</span></div>
        <div style={{ marginTop: '2cqh' }}>
          <GCFooter />
        </div>
      </div>

      <div
        style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(row.length, 1)}, 1fr)`,
          gap: '1.6cqh', alignItems: 'center',
        }}
      >
        {row.map(ep => (
          <div key={ep.id} style={{ aspectRatio: '0.78' }}>
            <CalendarPage episode={ep} withStamp={false} mini={true} />
          </div>
        ))}
      </div>
    </div>
  )
}
