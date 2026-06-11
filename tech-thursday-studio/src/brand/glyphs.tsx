import type { CategoryKey } from '../data/types'

interface GlyphProps {
  size?: number | string
}

/** Microsoft Stack — four rounded squares, two filled. */
export function GlyphMS({ size = '100%' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <rect x="14" y="14" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
      <rect x="54" y="14" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" />
      <rect x="14" y="54" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" />
      <rect x="54" y="54" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
    </svg>
  )
}

/** AI · Copilot — four-point sparkle. */
export function GlyphAI({ size = '100%' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M50 6 C 52 30, 60 38, 94 50 C 60 62, 52 70, 50 94 C 48 70, 40 62, 6 50 C 40 38, 48 30, 50 6 Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** General tip — lightbulb. */
export function GlyphGen({ size = '100%' }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M50 12 C 32 12, 20 26, 22 44 C 23 55, 30 62, 36 68 L 36 76 L 64 76 L 64 68 C 70 62, 77 55, 78 44 C 80 26, 68 12, 50 12 Z"
        fill="currentColor"
      />
      <rect x="38" y="80" width="24" height="6" rx="3" fill="currentColor" />
      <rect x="42" y="89" width="16" height="6" rx="3" fill="currentColor" />
    </svg>
  )
}

export const GLYPHS: Record<CategoryKey, (p: GlyphProps) => React.JSX.Element> = {
  ms: GlyphMS,
  ai: GlyphAI,
  gen: GlyphGen,
}
