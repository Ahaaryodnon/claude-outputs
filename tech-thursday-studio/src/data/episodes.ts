import type { Episode } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse 'YYYY-MM-DD' as a local date (avoids UTC off-by-one). */
function parseISO(airDate: string): Date {
  const [y, m, d] = airDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export interface FillerDay {
  name: string
  num: string
  month: string
}

/**
 * The Mon/Tue/Wed pages that tear off before the episode's Thursday.
 * Real date arithmetic, so month boundaries produce real calendar days.
 */
export function fillerDaysFor(airDate: string): FillerDay[] {
  const thursday = parseISO(airDate)
  const names = ['Monday', 'Tuesday', 'Wednesday']
  return names.map((name, i) => {
    const d = new Date(thursday)
    d.setDate(thursday.getDate() - (3 - i))
    return { name, num: String(d.getDate()), month: MONTHS[d.getMonth()] }
  })
}

/** The soonest episode airing strictly after `current`, or null. */
export function nextEpisode(episodes: Episode[], current: Episode): Episode | null {
  const later = episodes
    .filter(e => e.id !== current.id && e.airDate > current.airDate)
    .sort((a, b) => a.airDate.localeCompare(b.airDate))
  return later[0] ?? null
}

export function sortByAirDate(episodes: Episode[]): Episode[] {
  return [...episodes].sort((a, b) => a.airDate.localeCompare(b.airDate))
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** '2026-06-04' → { day: '4', month: 'Jun', year: '2026' } for the calendar page. */
export function formatDay(airDate: string): { day: string; month: string; year: string } {
  const d = parseISO(airDate)
  return { day: String(d.getDate()), month: MONTHS[d.getMonth()], year: String(d.getFullYear()) }
}

/** 'Thursday 4 Jun' style label for banners and pickers. */
export function formatThursday(airDate: string): string {
  const { day, month } = formatDay(airDate)
  return `Thursday ${day} ${month}`
}
