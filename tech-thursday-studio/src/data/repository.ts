import { supabase } from './supabase'
import type { Episode, Settings } from './types'

const CACHE_KEY = 'tt-studio-cache-v1'

const DEFAULT_SETTINGS: Settings = {
  tagline: 'Two minutes. One tip. Every other Thursday.',
  cadenceText: 'Every other Thursday',
}

/** Bundled seed — last-resort fallback so the studio always renders something. */
const SEED_EPISODES: Episode[] = [
  { id: 'seed-1', epNumber: 1, title: 'Clipboard history', hook: 'Win + V. Never lose a snippet.', category: 'gen', airDate: '2026-06-04', status: 'published' },
  { id: 'seed-2', epNumber: 2, title: 'Summarise a webpage', hook: 'Five bullets, sixty seconds.', category: 'ai', airDate: '2026-06-18', status: 'planned' },
  { id: 'seed-3', epNumber: 3, title: 'Teams meeting recap', hook: 'Transcribe. The notes write themselves.', category: 'ms', airDate: '2026-07-02', status: 'planned' },
]

export interface RepoResult {
  episodes: Episode[]
  settings: Settings
  offline: boolean
}

interface EpisodeRow {
  id: string
  ep_number: number
  title: string
  hook: string
  category: Episode['category']
  air_date: string
  status: Episode['status']
}

function fromRow(r: EpisodeRow): Episode {
  return {
    id: r.id,
    epNumber: r.ep_number,
    title: r.title,
    hook: r.hook,
    category: r.category,
    airDate: r.air_date,
    status: r.status,
  }
}

function toRow(e: Episode): EpisodeRow {
  return {
    id: e.id,
    ep_number: e.epNumber,
    title: e.title,
    hook: e.hook,
    category: e.category,
    air_date: e.airDate,
    status: e.status,
  }
}

function readCache(): RepoResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { episodes: Episode[]; settings: Settings }
    return { ...parsed, offline: true }
  } catch {
    return null
  }
}

function writeCache(episodes: Episode[], settings: Settings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ episodes, settings }))
  } catch {
    // Cache is best-effort.
  }
}

export async function loadAll(): Promise<RepoResult> {
  if (supabase) {
    try {
      const [eps, set] = await Promise.all([
        supabase.from('tt_episodes').select('*').order('air_date'),
        supabase.from('tt_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      if (!eps.error && eps.data) {
        const episodes = (eps.data as EpisodeRow[]).map(fromRow)
        const settings: Settings = set.data
          ? { tagline: set.data.tagline, cadenceText: set.data.cadence_text }
          : DEFAULT_SETTINGS
        writeCache(episodes, settings)
        return { episodes, settings, offline: false }
      }
    } catch {
      // fall through to cache
    }
  }
  return readCache() ?? { episodes: SEED_EPISODES, settings: DEFAULT_SETTINGS, offline: true }
}

export async function upsertEpisode(e: Episode): Promise<Episode> {
  if (!supabase) throw new Error('Supabase unavailable')
  // Seed/new ids are placeholders — let the database mint real uuids.
  const isNew = !/^[0-9a-f-]{36}$/.test(e.id)
  const row: Partial<EpisodeRow> = toRow(e)
  if (isNew) delete (row as { id?: string }).id
  const { data, error } = await supabase.from('tt_episodes').upsert(row).select().single()
  if (error) throw error
  return fromRow(data as EpisodeRow)
}

export async function deleteEpisode(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase unavailable')
  const { error } = await supabase.from('tt_episodes').delete().eq('id', id)
  if (error) throw error
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!supabase) throw new Error('Supabase unavailable')
  const { error } = await supabase
    .from('tt_settings')
    .upsert({ id: 1, tagline: s.tagline, cadence_text: s.cadenceText })
  if (error) throw error
}
