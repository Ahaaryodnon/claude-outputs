import type { Episode } from '../data/types'
import { CATEGORIES, categoryTextColor, D } from '../brand/categories'
import { GLYPHS } from '../brand/glyphs'
import { CalendarPage } from '../brand/CalendarPage'
import { GCFooter } from '../brand/GCFooter'

/** Episode title card (static, 16:9). */
export function TitleCard({ episode }: { episode: Episode }) {
  const cat = CATEGORIES[episode.category]
  const Glyph = GLYPHS[episode.category]
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.bg,
        padding: '4% 5%', boxSizing: 'border-box', containerType: 'size',
        display: 'flex', alignItems: 'center', gap: '5%',
        position: 'relative', overflow: 'hidden', fontFamily: D.font,
      }}
    >
      <div style={{ width: '28%', aspectRatio: '0.78' }}>
        <CalendarPage episode={episode} withStamp={true} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '2.2cqh', fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: categoryTextColor(cat),
            marginBottom: '0.8cqh', display: 'inline-flex', alignItems: 'center', gap: '0.8cqh',
          }}
        >
          <span style={{ width: '2cqh', height: '2cqh', color: cat.color, display: 'flex' }}>
            <Glyph size="100%" />
          </span>
          {cat.name}
        </div>
        <div
          style={{
            fontFamily: D.font, fontWeight: 900, fontSize: '8.5cqh', lineHeight: 0.95,
            letterSpacing: '-0.02em', color: D.ink, textWrap: 'balance',
          }}
        >{episode.title}</div>
        <div style={{ marginTop: '1.6cqh', fontSize: '2.8cqh', opacity: 0.72, maxWidth: '92%', color: D.ink }}>
          {episode.hook}
        </div>

        <div
          style={{
            marginTop: '3cqh', paddingTop: '2cqh',
            borderTop: '1px solid rgba(41,66,56,0.15)',
          }}
        >
          <GCFooter size={4} label={`Tech Thursday · Ground Control`} />
        </div>
      </div>
    </div>
  )
}
