import type { Settings } from '../data/types'
import { D } from '../brand/categories'
import { GCFooter } from '../brand/GCFooter'

interface WordmarkProps {
  dark?: boolean
  settings: Settings
}

/** Wordmark-only logo — for places where the calendar page is too literal. */
export function Wordmark({ dark = false, settings }: WordmarkProps) {
  const bg = dark ? D.ink : D.bg
  const fg = dark ? D.fg : D.ink
  const accent = dark ? D.acc : D.mid
  return (
    <div
      style={{
        width: '100%', height: '100%', background: bg, color: fg,
        padding: '7% 8%', boxSizing: 'border-box', containerType: 'size',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        fontFamily: D.font,
      }}
    >
      <div
        style={{
          fontSize: '4.4cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: accent, marginBottom: '3cqh',
        }}
      >· {settings.cadenceText} ·</div>
      <div style={{ fontWeight: 900, fontSize: '24cqh', lineHeight: 0.88, letterSpacing: '-0.025em' }}>
        Tech<br />Thursday<span style={{ color: accent }}>.</span>
      </div>
      <div
        style={{
          marginTop: '8cqh', paddingTop: '4cqh',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(41,66,56,0.15)'}`,
        }}
      >
        <GCFooter dark={dark} size={6} />
      </div>
    </div>
  )
}
