import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Episode, Settings } from '../data/types'
import { sortByAirDate } from '../data/episodes'
import * as repo from '../data/repository'

interface StudioState {
  episodes: Episode[]
  settings: Settings
  selected: Episode | null
  offline: boolean
  loading: boolean
  selectEpisode: (id: string) => void
  saveEpisode: (e: Episode) => Promise<void>
  removeEpisode: (id: string) => Promise<void>
}

const StudioContext = createContext<StudioState | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [settings, setSettings] = useState<Settings>({ tagline: '', cadenceText: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    repo.loadAll().then(result => {
      if (cancelled) return
      const sorted = sortByAirDate(result.episodes)
      setEpisodes(sorted)
      setSettings(result.settings)
      setOffline(result.offline)
      setLoading(false)
      // Default selection: the next episode from today, else the latest.
      const today = new Date().toISOString().slice(0, 10)
      const upcoming = sorted.find(e => e.airDate >= today)
      setSelectedId((upcoming ?? sorted[sorted.length - 1])?.id ?? null)
    })
    return () => { cancelled = true }
  }, [])

  const selectEpisode = useCallback((id: string) => setSelectedId(id), [])

  const saveEpisode = useCallback(async (e: Episode) => {
    const saved = await repo.upsertEpisode(e)
    setEpisodes(prev => {
      const without = prev.filter(p => p.id !== e.id && p.id !== saved.id)
      return sortByAirDate([...without, saved])
    })
    setSelectedId(prev => (prev === e.id ? saved.id : prev))
  }, [])

  const removeEpisode = useCallback(async (id: string) => {
    await repo.deleteEpisode(id)
    setEpisodes(prev => prev.filter(p => p.id !== id))
    setSelectedId(prev => (prev === id ? null : prev))
  }, [])

  const value = useMemo<StudioState>(() => ({
    episodes,
    settings,
    selected: episodes.find(e => e.id === selectedId) ?? episodes[0] ?? null,
    offline,
    loading,
    selectEpisode,
    saveEpisode,
    removeEpisode,
  }), [episodes, settings, selectedId, offline, loading, selectEpisode, saveEpisode, removeEpisode])

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio(): StudioState {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider')
  return ctx
}
