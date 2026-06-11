import type { ReactNode } from 'react'
import { D } from '../../brand/categories'
import { FlowLines, type BannerTheme } from '../../brand/FlowLines'

interface BannerShellProps {
  theme: BannerTheme
  /** Quieter motif than the prototype — feedback was it looked busy. */
  motifStrength?: number
  children: ReactNode
}

/**
 * Shared SharePoint banner chrome (1920×480). The left ~40% stays visually
 * calm — that's SharePoint's title safe-zone where SP overlays its own hero
 * title. Baked content sits to the right.
 */
export function BannerShell({ theme, motifStrength = 0.6, children }: BannerShellProps) {
  const bg = theme === 'dark' ? D.ink : D.bg
  return (
    <div
      style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: bg, containerType: 'size', fontFamily: D.font,
        display: 'flex', alignItems: 'center',
      }}
    >
      <FlowLines theme={theme} strength={motifStrength} />
      {children}
    </div>
  )
}

/** GC roundel parked top-right. */
export function GCMark({ theme }: { theme: BannerTheme }) {
  const src = theme === 'dark' ? '/assets/logo-icon-white.png' : '/assets/logo-icon-dark.png'
  return (
    <img
      src={src}
      alt="Ground Control"
      style={{
        position: 'absolute', top: '8cqh', right: '4cqh', height: '11cqh', width: 'auto',
        zIndex: 3, opacity: 0.95,
      }}
    />
  )
}

export const bannerInk = (theme: BannerTheme) => (theme === 'dark' ? D.fg : D.ink)
export const bannerSec = (theme: BannerTheme) =>
  theme === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(41,66,56,0.70)'
export const bannerOverline = (theme: BannerTheme) => (theme === 'dark' ? D.acc : D.mid)
