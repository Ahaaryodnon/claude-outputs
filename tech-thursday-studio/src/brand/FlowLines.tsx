import { Fragment } from 'react'
import { D } from './categories'

export type BannerTheme = 'dark' | 'light'

interface FlowLinesProps {
  theme: BannerTheme
  /** 0–1 multiplier to quieten the motif (banners use < 1). */
  strength?: number
}

/**
 * The Ground Control flowing-line motif, tucked into two corners
 * (top-left + bottom-right), bleeding off the edges.
 */
export function FlowLines({ theme, strength = 1 }: FlowLinesProps) {
  const whisper = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(41,66,56,0.28)'
  const common: React.CSSProperties = {
    position: 'absolute', width: '22%', height: 'auto',
    pointerEvents: 'none', opacity: strength,
  }
  return (
    <Fragment>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMinYMin meet" aria-hidden="true"
        style={{ ...common, top: 0, left: 0 }}>
        <g fill="none" strokeLinecap="round">
          <path d="M 270 -20 C 232 132, 132 232, -20 282" stroke={whisper} strokeWidth="2.5" />
          <path d="M 462 -20 C 384 196, 240 326, -20 446" stroke={D.mid} strokeWidth="3.5" opacity="0.9" />
          <path d="M 360 -20 C 300 162, 168 282, -20 340" stroke={D.acc} strokeWidth="5" />
        </g>
      </svg>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"
        style={{ ...common, bottom: 0, right: 0 }}>
        <g fill="none" strokeLinecap="round">
          <path d="M 820 320 C 668 368, 568 468, 518 620" stroke={whisper} strokeWidth="2.5" />
          <path d="M 820 158 C 604 246, 460 410, 354 620" stroke={D.mid} strokeWidth="3.5" opacity="0.9" />
          <path d="M 820 262 C 638 322, 518 442, 460 620" stroke={D.acc} strokeWidth="5" />
        </g>
      </svg>
    </Fragment>
  )
}
