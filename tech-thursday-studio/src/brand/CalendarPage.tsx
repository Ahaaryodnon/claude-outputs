import type { Episode } from '../data/types'
import { formatDay } from '../data/episodes'
import { CATEGORIES, D } from './categories'
import { GLYPHS } from './glyphs'

interface CalendarPageProps {
  episode: Episode
  withStamp?: boolean
  withTopic?: boolean
  /** Small-tile layout: bigger date, larger labels, no stamp. */
  mini?: boolean
}

/**
 * The torn-off desk calendar page — the hero brand device of Direction D.
 * Self-contained size container: all cqh values are relative to the page's
 * own height, so it renders identically at any size and aspect context.
 * (Values are the 16:9 prototype's, converted from artboard-relative.)
 */
export function CalendarPage({ episode, withStamp = true, withTopic = false, mini = false }: CalendarPageProps) {
  const cat = CATEGORIES[episode.category]
  const Glyph = GLYPHS[episode.category]
  const { day, month, year } = formatDay(episode.airDate)

  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.page,
        borderRadius: '3.2cqh',
        boxShadow: '0 5.9cqh 11.7cqh rgba(41,66,56,0.18), 0 0.6cqh 1.5cqh rgba(41,66,56,0.10)',
        position: 'relative', overflow: 'hidden', containerType: 'size',
        display: 'flex', flexDirection: 'column',
        fontFamily: D.font, color: D.ink,
        border: '1px solid rgba(41,66,56,0.08)',
      }}
    >
      {/* Top bar — DAY NAME makes the calendar metaphor obvious immediately. */}
      <div
        style={{
          background: cat.color, color: cat.ink, padding: '3.2cqh 4.4cqh',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flex: '0 0 auto',
        }}
      >
        <span style={{
          fontWeight: 800, fontSize: mini ? '7.3cqh' : '5.9cqh',
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Thursday</span>
        <span style={{
          fontSize: mini ? '5.3cqh' : '3.8cqh', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85,
        }}>Ep {String(episode.epNumber).padStart(2, '0')}</span>
      </div>

      {/* Binder hole strip */}
      <div
        style={{
          background: 'rgba(41,66,56,0.04)', padding: '0.9cqh 4.4cqh',
          display: 'flex', gap: '2.3cqh', justifyContent: 'flex-start',
          borderBottom: '1px dashed rgba(41,66,56,0.18)',
          flex: '0 0 auto',
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            width: '1.8cqh', height: '1.8cqh', borderRadius: '50%',
            background: '#fff', boxShadow: 'inset 0 1px 2px rgba(41,66,56,0.25)',
          }} />
        ))}
      </div>

      {/* Main body — day number paired tight with month so it reads as a date. */}
      <div
        style={{
          flex: 1, padding: '3.5cqh 4.4cqh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', position: 'relative', textAlign: 'center',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'baseline',
          gap: mini ? '2.9cqh' : '2cqh', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: mini ? '58cqh' : '46.8cqh', fontWeight: 900, lineHeight: 0.85,
            letterSpacing: '-0.06em', color: D.ink,
          }}>{day}</div>
          <div style={{
            fontSize: mini ? '15cqh' : '11.7cqh', fontWeight: 800, lineHeight: 0.9,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: cat.color,
          }}>{month}</div>
        </div>
        <div style={{
          marginTop: mini ? '1.5cqh' : '0.6cqh',
          fontSize: mini ? '4.4cqh' : '3.2cqh', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5,
        }}>{year}</div>

        {withStamp && !mini && (
          <div style={{
            marginTop: '2.3cqh',
            padding: '1.2cqh 2.3cqh',
            border: `0.45cqh solid ${D.ink}`,
            borderRadius: '0.9cqh',
            transform: 'rotate(-3deg)',
            fontSize: '3.2cqh', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: D.ink,
            background: 'rgba(255,255,255,0.4)',
          }}>Tech Thursday</div>
        )}

        {/* Category glyph in corner */}
        <div style={{
          position: 'absolute', bottom: '2.9cqh', right: '3.5cqh',
          width: mini ? '14cqh' : '8.8cqh', height: mini ? '14cqh' : '8.8cqh',
          color: cat.color, display: 'flex', opacity: 0.85,
        }}>
          <Glyph size="100%" />
        </div>
      </div>

      {withTopic && (
        <div style={{
          flex: '0 0 auto', padding: '2.9cqh 4.4cqh',
          borderTop: '1px dashed rgba(41,66,56,0.2)',
          background: 'rgba(178,210,53,0.10)',
          fontSize: '3.2cqh',
        }}>
          <span style={{
            fontSize: '2.3cqh', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', opacity: 0.6, marginRight: '1.2cqh',
          }}>This week:</span>
          {episode.title}
        </div>
      )}
    </div>
  )
}
