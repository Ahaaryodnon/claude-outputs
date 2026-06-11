import { D } from './categories'

interface GCFooterProps {
  dark?: boolean
  /** Icon size in cqh units. */
  size?: number
  label?: string
}

/** Ground Control roundel + wordmark. Explicit Dark Green on light surfaces. */
export function GCFooter({ dark = false, size = 4.5, label = 'Ground Control' }: GCFooterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.4cqh' }}>
      <img
        src={dark ? '/assets/logo-icon-white.png' : '/assets/logo-icon-dark.png'}
        alt=""
        style={{ width: `${size}cqh` }}
      />
      <span style={{
        fontSize: `${size * 0.49}cqh`,
        color: dark ? 'rgba(255,255,255,0.85)' : D.ink,
        opacity: dark ? 1 : 0.7,
        letterSpacing: '0.08em',
        fontFamily: D.font,
      }}>{label}</span>
    </div>
  )
}
