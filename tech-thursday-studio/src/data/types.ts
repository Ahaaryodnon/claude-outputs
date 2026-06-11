export type CategoryKey = 'ms' | 'ai' | 'gen'

export type EpisodeStatus = 'planned' | 'published'

export interface Episode {
  id: string
  epNumber: number
  title: string
  /** One-line hook, e.g. "Win + V. Never lose a snippet." */
  hook: string
  category: CategoryKey
  /** ISO date 'YYYY-MM-DD' — always a Thursday by convention. */
  airDate: string
  status: EpisodeStatus
}

export interface Settings {
  tagline: string
  cadenceText: string
}
