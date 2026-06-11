import { useEffect, useRef, useState } from 'react'
import { useStudio } from '../app/StudioContext'
import { Stage } from '../app/Stage'
import { IntroBumper } from '../deliverables/IntroBumper'
import { OutroBumper } from '../deliverables/OutroBumper'
import { SIZES, BUMPER_DURATION_MS } from '../deliverables/sizes'
import { nextEpisode, formatDay } from '../data/episodes'

type Tab = 'intro' | 'outro'

export function VideosView() {
  const { episodes, selected } = useStudio()
  const [tab, setTab] = useState<Tab>('intro')
  const [withHost, setWithHost] = useState(false)
  const [loop, setLoop] = useState(true)
  const [take, setTake] = useState(0) // remount key — bumping it replays
  const [nextOverrideId, setNextOverrideId] = useState<string>('auto')
  const stageRef = useRef<HTMLDivElement>(null)

  // Auto-replay: remount the bumper a moment after the timeline finishes.
  useEffect(() => {
    if (!loop) return
    const id = setInterval(() => setTake(t => t + 1), BUMPER_DURATION_MS + 600)
    return () => clearInterval(id)
  }, [loop, tab])

  if (!selected) return <div className="skeleton">Add an episode first.</div>

  const autoNext = nextEpisode(episodes, selected)
  const nextEp = nextOverrideId === 'auto'
    ? autoNext
    : episodes.find(e => e.id === nextOverrideId) ?? autoNext

  const { w, h } = SIZES.video

  return (
    <div style={{ maxWidth: 1100 }}>
      <h2 className="view-title">Intro & outro</h2>
      <p className="view-sub">
        ~5.2 second bumpers at 1920×1080, driven by the selected episode. The outro announces what's coming next.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'intro' ? 'btn-dark' : 'btn-ghost'}`} onClick={() => { setTab('intro'); setTake(t => t + 1) }}>
          Intro bumper
        </button>
        <button className={`btn ${tab === 'outro' ? 'btn-dark' : 'btn-ghost'}`} onClick={() => { setTab('outro'); setTake(t => t + 1) }}>
          Outro · coming next
        </button>
        <span style={{ flex: 1 }} />
        {tab === 'intro' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={withHost} onChange={e => { setWithHost(e.target.checked); setTake(t => t + 1) }} />
            Aaron says hi
          </label>
        )}
        {tab === 'outro' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            Next episode
            <select
              value={nextOverrideId}
              onChange={e => { setNextOverrideId(e.target.value); setTake(t => t + 1) }}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--surface-page)' }}
            >
              <option value="auto">
                Auto{autoNext ? ` · Ep ${String(autoNext.epNumber).padStart(2, '0')} ${autoNext.title}` : ' · none scheduled'}
              </option>
              {episodes.filter(e => e.id !== selected.id).map(e => {
                const { day, month } = formatDay(e.airDate)
                return <option key={e.id} value={e.id}>Ep {String(e.epNumber).padStart(2, '0')} · {e.title} · {day} {month}</option>
              })}
            </select>
          </label>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
          Loop preview
        </label>
        <button className="btn" onClick={() => setTake(t => t + 1)}>↻ Replay</button>
      </div>

      <div ref={stageRef}>
        <Stage
          title={tab === 'intro'
            ? `Intro · Ep ${String(selected.epNumber).padStart(2, '0')} · ${selected.title}`
            : `Outro · after Ep ${String(selected.epNumber).padStart(2, '0')}`}
          width={w}
          height={h}
          maxHeight={560}
        >
          <div key={`${tab}-${take}-${selected.id}-${withHost}-${nextEp?.id ?? 'end'}`} style={{ width: '100%', height: '100%' }}>
            {tab === 'intro'
              ? <IntroBumper episode={selected} withHost={withHost} />
              : <OutroBumper episode={selected} nextEp={nextEp} />}
          </div>
        </Stage>
      </div>
    </div>
  )
}
