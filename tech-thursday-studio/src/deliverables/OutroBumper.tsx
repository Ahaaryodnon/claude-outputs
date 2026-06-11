import type { Episode } from '../data/types'
import { formatDay } from '../data/episodes'
import { CATEGORIES, categoryTextColor, D } from '../brand/categories'
import { GLYPHS } from '../brand/glyphs'
import { CalendarPage } from '../brand/CalendarPage'
import { GCFooter } from '../brand/GCFooter'

const T = '5.2s'

interface OutroBumperProps {
  /** The episode that just played. */
  episode: Episode
  /** What's coming next — derived from the schedule, overridable in the view. */
  nextEp: Episode | null
}

/**
 * Outro / end card: thanks for watching, here's what's coming next.
 * The next episode's calendar page slides in and its title is the hero.
 * Plays once and holds — looping is done by remounting.
 */
export function OutroBumper({ episode, nextEp }: OutroBumperProps) {
  const next = nextEp
  const cat = next ? CATEGORIES[next.category] : null
  const Glyph = next ? GLYPHS[next.category] : null
  const nextDate = next ? formatDay(next.airDate) : null

  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.bg,
        position: 'relative', overflow: 'hidden', containerType: 'size',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6% 4%', boxSizing: 'border-box', gap: '5%',
        fontFamily: D.font,
      }}
    >
      {/* "That was" strip — anchors what just played, quietly. */}
      <div
        style={{
          position: 'absolute', top: '4cqh', left: '4cqh',
          display: 'flex', alignItems: 'center', gap: '1.2cqh',
          fontSize: '2.2cqh', fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(41,66,56,0.5)',
          animation: `tt-fade-in 0.6s ease-out 0.1s 1 both`,
        }}
      >
        That was · Ep {String(episode.epNumber).padStart(2, '0')} · {episode.title}
      </div>

      {next && nextDate && cat && Glyph ? (
        <>
          {/* Next episode's calendar page slides in. */}
          <div
            style={{
              width: '30%', aspectRatio: '0.78',
              animation: `d-land ${T} cubic-bezier(0.2,0.7,0.3,1) 1 both`,
            }}
          >
            <CalendarPage episode={next} withStamp={true} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '2.6cqh', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: D.mid, marginBottom: '1.6cqh',
                animation: `ep-rise ${T} ease-out 0.05s 1 both`,
              }}
            >Coming up next · Thursday {nextDate.day} {nextDate.month}</div>

            <div
              style={{
                fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: categoryTextColor(cat),
                marginBottom: '1.8cqh', display: 'inline-flex', alignItems: 'center', gap: '1cqh',
                animation: `ep-rise ${T} ease-out 0.15s 1 both`,
              }}
            >
              <span style={{ width: '2.4cqh', height: '2.4cqh', color: cat.color, display: 'flex' }}>
                <Glyph size="100%" />
              </span>
              {cat.name}
            </div>

            <div
              style={{
                fontFamily: D.font, fontWeight: 900, fontSize: '10cqh', lineHeight: 0.94,
                letterSpacing: '-0.02em', color: D.ink, textWrap: 'balance',
                animation: `ep-rise ${T} ease-out 0.25s 1 both`,
              }}
            >{next.title}<span style={{ color: D.acc }}>.</span></div>

            <div
              style={{
                marginTop: '2.2cqh', fontSize: '3.2cqh', lineHeight: 1.4,
                color: 'rgba(41,66,56,0.72)', maxWidth: '92%',
                animation: `ep-rise ${T} ease-out 0.35s 1 both`,
              }}
            >{next.hook}</div>

            <div
              style={{
                marginTop: '4.5cqh', display: 'flex', alignItems: 'center', gap: '3cqh',
                animation: `ep-rise ${T} ease-out 0.45s 1 both`,
              }}
            >
              <span
                style={{
                  padding: '1.6cqh 3cqh',
                  background: D.ink, color: D.fg,
                  borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: '1.2cqh',
                  fontSize: '2.6cqh', fontWeight: 700,
                }}
              >
                Try this week's tip
                <span style={{ color: D.acc }}>→</span>
              </span>
              <GCFooter />
            </div>
          </div>
        </>
      ) : (
        /* Season finale — no next episode scheduled. */
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '3cqh', fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: D.mid, marginBottom: '2cqh',
              animation: `ep-rise ${T} ease-out 0.05s 1 both`,
            }}
          >That's the season</div>
          <div
            style={{
              fontWeight: 900, fontSize: '12cqh', lineHeight: 0.92,
              letterSpacing: '-0.025em', color: D.ink,
              animation: `ep-rise ${T} ease-out 0.2s 1 both`,
            }}
          >Thanks for<br />watching<span style={{ color: D.acc }}>.</span></div>
          <div
            style={{
              marginTop: '4cqh', display: 'flex', justifyContent: 'center',
              animation: `ep-rise ${T} ease-out 0.35s 1 both`,
            }}
          >
            <GCFooter />
          </div>
        </div>
      )}
    </div>
  )
}
