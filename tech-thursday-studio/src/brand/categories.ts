import type { CategoryKey } from '../data/types'

export interface Category {
  key: CategoryKey
  name: string
  short: string
  color: string
  /** Text colour that sits on top of `color`. */
  ink: string
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  ms: { key: 'ms', name: 'Microsoft Stack', short: 'Microsoft', color: '#B2D235', ink: '#294238' },
  ai: { key: 'ai', name: 'AI · Copilot Free', short: 'AI', color: '#F57821', ink: '#FFFFFF' },
  gen: { key: 'gen', name: 'General Tip', short: 'General', color: '#50B748', ink: '#FFFFFF' },
}

/** Direction D palette — the locked brand surface colours. */
export const D = {
  bg: '#E6EBE3', // warm grey page background
  page: '#FBFAF6', // warm paper white
  ink: '#294238', // dark green
  fg: '#FFFFFF',
  acc: '#B2D235', // light green
  mid: '#50B748', // mid green
  amber: '#F57821',
  shadow: '0 4cqh 8cqh rgba(41,66,56,0.18), 0 0.4cqh 1cqh rgba(41,66,56,0.10)',
  font: "'Cera Pro', system-ui, sans-serif",
}

/**
 * Category colour for small text: light green fails as small type on light
 * surfaces, so substitute mid green (mirrors the prototype's TitleCardD).
 */
export function categoryTextColor(cat: Category): string {
  return cat.color === D.acc ? D.mid : cat.color
}
