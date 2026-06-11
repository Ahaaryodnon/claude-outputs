import { useState } from 'react'
import { useStudio } from '../app/StudioContext'
import { Stage } from '../app/Stage'
import { MainBanner } from '../deliverables/banners/MainBanner'
import { EpisodeBanner } from '../deliverables/banners/EpisodeBanner'
import { PreviousBanner } from '../deliverables/banners/PreviousBanner'
import { SIZES } from '../deliverables/sizes'
import type { BannerTheme } from '../brand/FlowLines'
import { ExportPngButton } from '../app/ExportPngButton'
import { slug } from '../data/episodes'

export function BannersView() {
  const { episodes, selected, settings } = useStudio()
  const [theme, setTheme] = useState<BannerTheme>('light')

  if (!selected) return <div className="skeleton">Add an episode first.</div>
  const { w, h } = SIZES.banner

  return (
    <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div>
        <h2 className="view-title">SharePoint banners</h2>
        <p className="view-sub">
          1920×480, full-bleed. The left 40% stays calm — SharePoint overlays its own page title there.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${theme === 'light' ? 'btn-dark' : 'btn-ghost'}`} onClick={() => setTheme('light')}>Light</button>
          <button className={`btn ${theme === 'dark' ? 'btn-dark' : 'btn-ghost'}`} onClick={() => setTheme('dark')}>Dark</button>
        </div>
      </div>

      <Stage
        title="Main series banner" width={w} height={h} maxHeight={360}
        actions={<ExportPngButton
          render={() => <MainBanner theme={theme} episode={selected} settings={settings} />}
          width={w} height={h}
          filename={`tech-thursday-banner-main-${theme}.png`}
        />}
      >
        <MainBanner theme={theme} episode={selected} settings={settings} />
      </Stage>

      <Stage
        title={`This week's episode · Ep ${String(selected.epNumber).padStart(2, '0')}`}
        width={w} height={h} maxHeight={360}
        actions={<ExportPngButton
          render={() => <EpisodeBanner theme={theme} episode={selected} />}
          width={w} height={h}
          filename={`tech-thursday-banner-this-week-ep${String(selected.epNumber).padStart(2, '0')}-${slug(selected.title)}-${theme}.png`}
        />}
      >
        <EpisodeBanner theme={theme} episode={selected} />
      </Stage>

      <Stage
        title="Previous episodes" width={w} height={h} maxHeight={360}
        actions={<ExportPngButton
          render={() => <PreviousBanner theme={theme} episodes={episodes} />}
          width={w} height={h}
          filename={`tech-thursday-banner-previous-episodes-${theme}.png`}
        />}
      >
        <PreviousBanner theme={theme} episodes={episodes} />
      </Stage>
    </div>
  )
}
