import type { Episode, Settings } from '../../data/types'
import { D } from '../../brand/categories'
import { CalendarPage } from '../../brand/CalendarPage'
import type { BannerTheme } from '../../brand/FlowLines'
import { BannerShell, GCMark, bannerInk, bannerSec, bannerOverline } from './BannerShell'

interface MainBannerProps {
  theme: BannerTheme
  /** Calendar device shows the next upcoming episode's Thursday. */
  episode: Episode
  settings: Settings
}

/**
 * Series identity banner. Reworked from the prototype after feedback:
 * the calendar page — the brand's hero device — now anchors the right side
 * instead of leaving the wordmark alone with abstract lines.
 */
export function MainBanner({ theme, episode, settings }: MainBannerProps) {
  const ink = bannerInk(theme)
  const sec = bannerSec(theme)
  const over = bannerOverline(theme)
  const cats = [
    { name: 'Microsoft Stack', c: D.acc },
    { name: 'AI · Copilot', c: theme === 'dark' ? D.fg : D.amber },
    { name: 'General tips', c: D.mid },
  ]
  return (
    <BannerShell theme={theme}>
      <GCMark theme={theme} />

      {/* Text block — pushed right of the SP title safe-zone. */}
      <div style={{ marginLeft: '42%', width: '40%', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: over, marginBottom: '3cqh',
        }}>A fortnightly tech tip · Ground Control</div>
        <div style={{
          fontWeight: 900, fontSize: '20cqh', lineHeight: 0.95, letterSpacing: '-0.02em', color: ink,
        }}>Tech Thursday<span style={{ color: D.acc }}>.</span></div>
        <div style={{ fontSize: '5.8cqh', lineHeight: 1.15, color: sec, marginTop: '3.5cqh', fontWeight: 500 }}>
          {settings.tagline}
        </div>
        <div style={{ display: 'flex', gap: '4.5cqh', marginTop: '5cqh', flexWrap: 'wrap' }}>
          {cats.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '1.6cqh' }}>
              <span style={{ width: '2.8cqh', height: '2.8cqh', borderRadius: '50%', background: c.c, flex: '0 0 auto' }} />
              <span style={{ fontSize: '4cqh', fontWeight: 600, color: ink }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The calendar device — a real desk object, gently tilted. */}
      <div
        style={{
          position: 'absolute', right: '7%', top: '50%', zIndex: 2,
          height: '64cqh', aspectRatio: '0.78',
          transform: 'translateY(-50%) rotate(-3.5deg)',
        }}
      >
        <CalendarPage episode={episode} withStamp={true} />
      </div>
    </BannerShell>
  )
}
