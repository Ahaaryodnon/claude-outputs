import type { Episode } from '../data/types'
import { fillerDaysFor, formatDay } from '../data/episodes'
import { CATEGORIES, categoryTextColor, D } from '../brand/categories'
import { GLYPHS } from '../brand/glyphs'
import { CalendarPage } from '../brand/CalendarPage'
import { FillerDayPage } from '../brand/FillerDayPage'
import { GCFooter } from '../brand/GCFooter'

const T = '5.2s'

interface IntroBumperProps {
  episode: Episode
  /** Aaron pops up bottom-right and waves (from the brand bumper). */
  withHost?: boolean
}

/**
 * Episode-aware intro bumper (Direction D · Desk Calendar).
 * The calendar pad tears Mon → Tue → Wed and lands on the episode's actual
 * Thursday; the Tech Thursday stamp slams in; the episode title is the hero.
 * Plays once and holds — looping is done by remounting.
 */
export function IntroBumper({ episode, withHost = false }: IntroBumperProps) {
  const cat = CATEGORIES[episode.category]
  const Glyph = GLYPHS[episode.category]
  const fillerDays = fillerDaysFor(episode.airDate)
  const { year } = formatDay(episode.airDate)
  const catText = categoryTextColor(cat)

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
      {/* The calendar pad — tears down to the episode's Thursday. */}
      <div
        style={{
          position: 'relative', width: '30%', aspectRatio: '0.78',
          animation: `d-land ${T} cubic-bezier(0.2,0.7,0.3,1) 1 both`,
        }}
      >
        {fillerDays.map((d, i) => (
          <div
            key={d.num + d.month}
            style={{
              position: 'absolute', inset: 0,
              zIndex: 4 - i,
              transformOrigin: 'top center',
              animation: `d-tear-${i + 1} ${T} cubic-bezier(0.5, 0, 0.7, 1) 1 both`,
            }}
          >
            <FillerDayPage dayName={d.name} dayNumber={d.num} month={d.month} year={year} />
          </div>
        ))}
        {/* The episode's Thursday — bottom of the stack, never tears. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CalendarPage episode={episode} withStamp={false} />
        </div>

        {/* Tech Thursday stamp slams in once Thursday is revealed. */}
        <div
          style={{
            position: 'absolute', bottom: '-6%', right: '-10%', zIndex: 10,
            padding: '1.8cqh 3cqh',
            border: `0.7cqh solid ${D.ink}`,
            borderRadius: '1.2cqh',
            background: D.acc, color: D.ink,
            fontSize: '3.6cqh', fontWeight: 800,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            animation: `d-stamp-in ${T} ease-out 1 both`,
            boxShadow: '0 0.9cqh 2cqh rgba(41,66,56,0.22)',
          }}
        >Tech Thursday</div>
      </div>

      {/* Right column — episode is the hero, brand is the kicker. */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '1.4cqh',
            marginBottom: '2.6cqh',
            animation: `ep-rise ${T} ease-out 0.05s 1 both`,
          }}
        >
          <span style={{
            fontSize: '2.4cqh', fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: D.mid,
          }}>Tech Thursday</span>
          <span style={{ width: '0.8cqh', height: '0.8cqh', borderRadius: '50%', background: 'rgba(41,66,56,0.3)' }} />
          <span style={{
            fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(41,66,56,0.55)',
          }}>Ep {String(episode.epNumber).padStart(2, '0')}</span>
        </div>

        <div
          style={{
            fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: catText,
            marginBottom: '2cqh', display: 'inline-flex', alignItems: 'center', gap: '1cqh',
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
            fontFamily: D.font, fontWeight: 900, fontSize: '11.5cqh', lineHeight: 0.92,
            letterSpacing: '-0.025em', color: D.ink, textWrap: 'balance',
            animation: `ep-rise ${T} ease-out 0.25s 1 both`,
          }}
        >{episode.title}<span style={{ color: D.acc }}>.</span></div>

        <div
          style={{
            marginTop: '3cqh', fontSize: '3.2cqh', lineHeight: 1.4,
            color: 'rgba(41,66,56,0.72)', maxWidth: '92%',
            animation: `ep-rise ${T} ease-out 0.35s 1 both`,
          }}
        >{episode.hook}</div>

        <div
          style={{
            marginTop: '6cqh', paddingTop: '3cqh',
            borderTop: '1px solid rgba(41,66,56,0.15)',
            animation: `ep-rise ${T} ease-out 0.45s 1 both`,
          }}
        >
          <GCFooter />
        </div>
      </div>

      {/* Aaron — our host — pops up from the bottom-right and waves hello. */}
      {withHost && (
        <div
          style={{
            position: 'absolute', right: '4%', bottom: 0, zIndex: 30,
            width: '38cqh',
            animation: `d-aaron-in ${T} cubic-bezier(0.22,0.9,0.3,1.1) 1 both`,
            willChange: 'transform',
            filter: 'drop-shadow(0 1.6cqh 2.4cqh rgba(41,66,56,0.28))',
          }}
        >
          <div style={{
            transformOrigin: 'bottom center',
            animation: `d-aaron-wave ${T} ease-in-out 1 both`,
          }}>
            <div
              style={{
                position: 'absolute', top: '4%', left: '-12%',
                transformOrigin: 'bottom right',
                animation: `d-aaron-hi ${T} ease-out 1 both`,
                background: D.fg, color: D.ink,
                padding: '1.2cqh 2.4cqh', borderRadius: '999px',
                fontFamily: D.font, fontWeight: 800, fontSize: '3.2cqh',
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                boxShadow: '0 1cqh 2cqh rgba(41,66,56,0.22)',
              }}
            >
              Hi<span style={{ color: D.mid }}> — I'm Aaron</span>
            </div>
            <img src="/assets/aaron-memoji.png" alt="" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}
