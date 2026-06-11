import { useStudio } from './StudioContext'
import { formatDay } from '../data/episodes'

/** Global episode selector shown in the top bar. */
export function EpisodePicker() {
  const { episodes, selected, selectEpisode } = useStudio()
  if (!episodes.length) return null
  return (
    <div className="episode-picker">
      <label htmlFor="episode-picker-select">Episode</label>
      <select
        id="episode-picker-select"
        value={selected?.id ?? ''}
        onChange={e => selectEpisode(e.target.value)}
      >
        {episodes.map(ep => {
          const { day, month } = formatDay(ep.airDate)
          return (
            <option key={ep.id} value={ep.id}>
              Ep {String(ep.epNumber).padStart(2, '0')} · {ep.title} · Thu {day} {month}
            </option>
          )
        })}
      </select>
    </div>
  )
}
