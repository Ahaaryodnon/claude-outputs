import { useState } from 'react'
import { StudioProvider, useStudio } from './app/StudioContext'
import { Sidebar, type ViewKey } from './app/Sidebar'
import { EpisodePicker } from './app/EpisodePicker'
import { OfflineBanner } from './app/OfflineBanner'
import { EpisodesView } from './views/EpisodesView'
import { VideosView } from './views/VideosView'
import { BannersView } from './views/BannersView'
import { CardsView } from './views/CardsView'
import { BrandKitView } from './views/BrandKitView'
import { exportEpisodePack, type PackProgress } from './export/episodePack'
import './app/app.css'
import './brand/motion.css'

const VIEW_TITLES: Record<ViewKey, string> = {
  episodes: 'Episodes',
  videos: 'Intro & outro videos',
  banners: 'SharePoint banners',
  cards: 'Cards & thumbnails',
  brand: 'Brand kit',
}

function PackButton() {
  const { episodes, selected, settings } = useStudio()
  const [progress, setProgress] = useState<PackProgress | null>(null)
  if (!selected) return null

  const run = async () => {
    if (progress) return
    setProgress({ done: 0, total: 1, current: 'starting' })
    try {
      await exportEpisodePack(selected, episodes, settings, setProgress)
    } finally {
      setProgress(null)
    }
  }

  return (
    <button className="btn btn-dark" onClick={run} disabled={!!progress} data-testid="export-pack" title="Every PNG deliverable for the selected episode, zipped">
      {progress ? `Packing ${progress.done}/${progress.total}…` : '⤓ Export episode pack'}
    </button>
  )
}

function StudioShell() {
  const [view, setView] = useState<ViewKey>('episodes')
  const { loading } = useStudio()

  return (
    <div className="studio">
      <Sidebar view={view} onNavigate={setView} />
      <div className="studio-main">
        <OfflineBanner />
        <header className="studio-topbar">
          <h1>{VIEW_TITLES[view]}</h1>
          <span className="spacer" />
          <EpisodePicker />
          <PackButton />
        </header>
        <main className="studio-content">
          {loading ? (
            <div className="skeleton">Loading episodes…</div>
          ) : view === 'episodes' ? (
            <EpisodesView />
          ) : view === 'videos' ? (
            <VideosView />
          ) : view === 'banners' ? (
            <BannersView />
          ) : view === 'cards' ? (
            <CardsView />
          ) : (
            <BrandKitView />
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StudioProvider>
      <StudioShell />
    </StudioProvider>
  )
}
