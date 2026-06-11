import { useState } from 'react'
import { StudioProvider, useStudio } from './app/StudioContext'
import { Sidebar, type ViewKey } from './app/Sidebar'
import { EpisodePicker } from './app/EpisodePicker'
import { OfflineBanner } from './app/OfflineBanner'
import { EpisodesView } from './views/EpisodesView'
import './app/app.css'
import './brand/motion.css'

const VIEW_TITLES: Record<ViewKey, string> = {
  episodes: 'Episodes',
  videos: 'Intro & outro videos',
  banners: 'SharePoint banners',
  cards: 'Cards & thumbnails',
  brand: 'Brand kit',
}

function Placeholder({ name }: { name: string }) {
  return <div className="skeleton">The {name} view is coming in a later task.</div>
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
        </header>
        <main className="studio-content">
          {loading
            ? <div className="skeleton">Loading episodes…</div>
            : view === 'episodes' ? <EpisodesView />
            : <Placeholder name={VIEW_TITLES[view]} />}
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
