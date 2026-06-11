import type { Episode } from '../data/types'
import { formatDay } from '../data/episodes'
import { CATEGORIES, D } from './categories'
import { GLYPHS } from './glyphs'

interface CalendarPageProps {
  episode: Episode
  withStamp?: boolean
  withTopic?: boolean
  /** Thumbnail-grid layout: bigger date, no stamp. */
  mini?: boolean
}

/**
 * The torn-off desk calendar page — the hero brand device of Direction D.
 * Used as logo mark, in bumpers, title cards, banners and thumbnails.
 * Sizes use cqh, so an ancestor must be a size container (every deliverable
 * root is).
 */
export function CalendarPage({ episode, withStamp = true, withTopic = false, mini = false }: CalendarPageProps) {
  const cat = CATEGORIES[episode.category]
  const Glyph = GLYPHS[episode.category]
  const { day, month, year } = formatDay(episode.airDate)

  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.page,
        borderRadius: '2.2cqh',
        boxShadow: D.shadow,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: D.font, color: D.ink,
        border: '1px solid rgba(41,66,56,0.08)',
      }}
    >
      {/* Top bar — DAY NAME makes the calendar metaphor obvious immediately. */}
      <div
        style={{
          background: cat.color, color: cat.ink, padding: '2.2cqh 3cqh',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flex: '0 0 auto',
        }}
      >
        <span style={{
          fontWeight: 800, fontSize: mini ? '5cqh' : '4cqh',
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Thursday</span>
        <span style={{
          fontSize: mini ? '3.6cqh' : '2.6cqh', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85,
        }}>Ep {String(episode.epNumber).padStart(2, '0')}</span>
      </div>

      {/* Binder hole strip */}
      <div
        style={{
          background: 'rgba(41,66,56,0.04)', padding: '0.6cqh 3cqh',
          display: 'flex', gap: '1.6cqh', justifyContent: 'flex-start',
          borderBottom: '1px dashed rgba(41,66,56,0.18)',
          flex: '0 0 auto',
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            width: '1.2cqh', height: '1.2cqh', borderRadius: '50%',
            background: '#fff', boxShadow: 'inset 0 1px 2px rgba(41,66,56,0.25)',
          }} />
        ))}
      </div>

      {/* Main body — day number paired tight with month so it reads as a date. */}
      <div
        style={{
          flex: 1, padding: '2.4cqh 3cqh 2.4cqh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', position: 'relative', textAlign: 'center',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'baseline',
          gap: mini ? '2cqh' : '1.4cqh', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: mini ? '46cqh' : '32cqh', fontWeight: 900, lineHeight: 0.85,
            letterSpacing: '-0.06em', color: D.ink,
          }}>{day}</div>
          <div style={{
            fontSize: mini ? '12cqh' : '8cqh', fontWeight: 800, lineHeight: 0.9,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: cat.color,
          }}>{month}</div>
        </div>
        <div style={{
          marginTop: mini ? '1cqh' : '0.4cqh',
          fontSize: mini ? '3cqh' : '2.2cqh', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5,
        }}>{year}</div>

        {withStamp && !mini && (
          <div style={{
            marginTop: '1.6cqh',
            padding: '0.8cqh 1.6cqh',
            border: `0.3cqh solid ${D.ink}`,
            borderRadius: '0.6cqh',
            transform: 'rotate(-3deg)',
            fontSize: '2.2cqh', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: D.ink,
            background: 'rgba(255,255,255,0.4)',
          }}>Tech Thursday</div>
        )}

        {/* Category glyph in corner */}
        <div style={{
          position: 'absolute', bottom: '2cqh', right: '2.4cqh',
          width: mini ? '11cqh' : '6cqh', height: mini ? '11cqh' : '6cqh',
          color: cat.color, display: 'flex', opacity: 0.85,
        }}>
          <Glyph size="100%" />
        </div>
      </div>

      {withTopic && (
        <div style={{
          flex: '0 0 auto', padding: '2cqh 3cqh',
          borderTop: '1px dashed rgba(41,66,56,0.2)',
          background: 'rgba(178,210,53,0.10)',
          fontSize: '2.2cqh',
        }}>
          <span style={{
            fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', opacity: 0.6, marginRight: '0.8cqh',
          }}>This week:</span>
          {episode.title}
        </div>
      )}
    </div>
  )
}
