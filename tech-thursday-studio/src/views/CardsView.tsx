import { useStudio } from '../app/StudioContext'
import { Stage } from '../app/Stage'
import { TitleCard } from '../deliverables/TitleCard'
import { Thumbnail } from '../deliverables/Thumbnail'
import { TeamsBanner } from '../deliverables/TeamsBanner'
import { SeasonPoster } from '../deliverables/SeasonPoster'
import { SIZES } from '../deliverables/sizes'
import { ExportPngButton } from '../app/ExportPngButton'
import { slug } from '../data/episodes'

export function CardsView() {
  const { episodes, selected, settings } = useStudio()
  if (!selected) return <div className="skeleton">Add an episode first.</div>

  return (
    <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div>
        <h2 className="view-title">Cards & thumbnails</h2>
        <p className="view-sub">
          Title card, episode tiles, the Teams channel banner and the season poster — all driven by the schedule.
        </p>
      </div>

      <Stage
        title={`Title card · Ep ${String(selected.epNumber).padStart(2, '0')} · ${selected.title}`}
        width={SIZES.title.w} height={SIZES.title.h} maxHeight={440}
        actions={<ExportPngButton
          render={() => <TitleCard episode={selected} />}
          width={SIZES.title.w} height={SIZES.title.h}
          filename={`tech-thursday-title-card-ep${String(selected.epNumber).padStart(2, '0')}-${slug(selected.title)}.png`}
        />}
      >
        <TitleCard episode={selected} />
      </Stage>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--space-xl)' }}>
        <Stage
          title="Thumbnail · 16:9" width={SIZES.thumb169.w} height={SIZES.thumb169.h} maxHeight={360}
          actions={<ExportPngButton
            render={() => <Thumbnail episode={selected} variant="wide" />}
            width={SIZES.thumb169.w} height={SIZES.thumb169.h}
            filename={`tech-thursday-thumbnail-16x9-ep${String(selected.epNumber).padStart(2, '0')}-${slug(selected.title)}.png`}
          />}
        >
          <Thumbnail episode={selected} variant="wide" />
        </Stage>
        <Stage
          title="Thumbnail · square" width={SIZES.thumbSq.w} height={SIZES.thumbSq.h} maxHeight={360}
          actions={<ExportPngButton
            render={() => <Thumbnail episode={selected} variant="square" />}
            width={SIZES.thumbSq.w} height={SIZES.thumbSq.h}
            filename={`tech-thursday-thumbnail-square-ep${String(selected.epNumber).padStart(2, '0')}-${slug(selected.title)}.png`}
          />}
        >
          <Thumbnail episode={selected} variant="square" />
        </Stage>
      </div>

      <Stage
        title="Teams channel banner" width={SIZES.teams.w} height={SIZES.teams.h} maxHeight={300}
        actions={<ExportPngButton
          render={() => <TeamsBanner episodes={episodes} settings={settings} />}
          width={SIZES.teams.w} height={SIZES.teams.h}
          filename="tech-thursday-teams-banner.png"
        />}
      >
        <TeamsBanner episodes={episodes} settings={settings} />
      </Stage>

      <Stage
        title="Season poster" width={SIZES.poster.w} height={SIZES.poster.h} maxHeight={460}
        actions={<ExportPngButton
          render={() => <SeasonPoster episodes={episodes} settings={settings} />}
          width={SIZES.poster.w} height={SIZES.poster.h}
          filename="tech-thursday-season-poster.png"
        />}
      >
        <SeasonPoster episodes={episodes} settings={settings} />
      </Stage>
    </div>
  )
}
