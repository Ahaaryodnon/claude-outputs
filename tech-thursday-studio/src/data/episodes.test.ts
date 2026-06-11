import { describe, it, expect } from 'vitest'
import { fillerDaysFor, nextEpisode, sortByAirDate, slug, formatDay } from './episodes'
import type { Episode } from './types'

const ep = (over: Partial<Episode>): Episode => ({
  id: 'x',
  epNumber: 1,
  title: 'T',
  hook: '',
  category: 'gen',
  airDate: '2026-06-04',
  status: 'planned',
  ...over,
})

describe('fillerDaysFor', () => {
  it('derives Mon/Tue/Wed before a mid-month Thursday', () => {
    expect(fillerDaysFor('2026-06-04')).toEqual([
      { name: 'Monday', num: '1', month: 'Jun' },
      { name: 'Tuesday', num: '2', month: 'Jun' },
      { name: 'Wednesday', num: '3', month: 'Jun' },
    ])
  })

  it('crosses month boundaries with real dates (fixes prototype bug)', () => {
    expect(fillerDaysFor('2026-07-02')).toEqual([
      { name: 'Monday', num: '29', month: 'Jun' },
      { name: 'Tuesday', num: '30', month: 'Jun' },
      { name: 'Wednesday', num: '1', month: 'Jul' },
    ])
  })
})

describe('nextEpisode', () => {
  const a = ep({ id: 'a', airDate: '2026-06-04' })
  const b = ep({ id: 'b', airDate: '2026-06-18' })
  const c = ep({ id: 'c', airDate: '2026-07-02' })

  it('returns the soonest episode strictly after the current one', () => {
    expect(nextEpisode([c, a, b], a)?.id).toBe('b')
    expect(nextEpisode([c, a, b], b)?.id).toBe('c')
  })

  it('returns null when there is no later episode', () => {
    expect(nextEpisode([a, b, c], c)).toBeNull()
  })
})

describe('sortByAirDate', () => {
  it('sorts ascending without mutating input', () => {
    const a = ep({ id: 'a', airDate: '2026-08-13' })
    const b = ep({ id: 'b', airDate: '2026-06-04' })
    const input = [a, b]
    expect(sortByAirDate(input).map(e => e.id)).toEqual(['b', 'a'])
    expect(input.map(e => e.id)).toEqual(['a', 'b'])
  })
})

describe('slug', () => {
  it('lowercases and hyphenates', () => {
    expect(slug('Clipboard history')).toBe('clipboard-history')
  })
  it('strips punctuation and trims hyphens', () => {
    expect(slug('XLOOKUP in 60 seconds!')).toBe('xlookup-in-60-seconds')
    expect(slug('  AI · Copilot  ')).toBe('ai-copilot')
  })
})

describe('formatDay', () => {
  it('splits an ISO date into display parts', () => {
    expect(formatDay('2026-06-04')).toEqual({ day: '4', month: 'Jun', year: '2026' })
    expect(formatDay('2026-10-29')).toEqual({ day: '29', month: 'Oct', year: '2026' })
  })
})
