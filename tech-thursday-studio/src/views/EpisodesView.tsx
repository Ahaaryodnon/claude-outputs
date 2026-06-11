import { useState } from 'react'
import { useStudio } from '../app/StudioContext'
import type { CategoryKey, Episode, EpisodeStatus } from '../data/types'
import { formatDay, nextEpisode } from '../data/episodes'
import { CATEGORIES, categoryTextColor } from '../brand/categories'
import { GLYPHS } from '../brand/glyphs'

function CategoryChip({ cat }: { cat: CategoryKey }) {
  const c = CATEGORIES[cat]
  const Glyph = GLYPHS[cat]
  const text = categoryTextColor(c)
  return (
    <span className="cat-chip" style={{ background: 'rgba(41,66,56,0.06)', color: text }}>
      <span style={{ width: 13, height: 13, display: 'flex', color: c.color }}>
        <Glyph size="100%" />
      </span>
      {c.short}
    </span>
  )
}

const EMPTY: Omit<Episode, 'id'> = {
  epNumber: 1,
  title: '',
  hook: '',
  category: 'gen',
  airDate: '',
  status: 'planned',
}

interface EditorProps {
  initial: Episode
  isNew: boolean
  onClose: () => void
}

function EpisodeEditor({ initial, isNew, onClose }: EditorProps) {
  const { saveEpisode, removeEpisode, offline } = useStudio()
  const [draft, setDraft] = useState<Episode>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Episode>(key: K, value: Episode[K]) =>
    setDraft(d => ({ ...d, [key]: value }))

  const valid = draft.title.trim() && /^\d{4}-\d{2}-\d{2}$/.test(draft.airDate) && draft.epNumber > 0

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await saveEpisode({ ...draft, title: draft.title.trim(), hook: draft.hook.trim() })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Delete Ep ${String(draft.epNumber).padStart(2, '0')} · ${draft.title}?`)) return
    setBusy(true)
    try {
      await removeEpisode(draft.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface-page)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elev-md)',
        padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <strong style={{ fontSize: 16 }}>{isNew ? 'New episode' : `Edit Ep ${String(initial.epNumber).padStart(2, '0')}`}</strong>
        <span style={{ flex: 1 }} />
        {!isNew && (
          <button className="btn btn-danger" onClick={remove} disabled={busy || offline}>Delete</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="ep-num">Ep #</label>
          <input id="ep-num" type="number" min={1} value={draft.epNumber}
            onChange={e => set('epNumber', Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="ep-title">Title</label>
          <input id="ep-title" value={draft.title} placeholder="Clipboard history"
            onChange={e => set('title', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ep-hook">Hook (one line)</label>
          <input id="ep-hook" value={draft.hook} placeholder="Win + V. Never lose a snippet."
            onChange={e => set('hook', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="ep-cat">Category</label>
          <select id="ep-cat" value={draft.category}
            onChange={e => set('category', e.target.value as CategoryKey)}>
            {Object.values(CATEGORIES).map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ep-date">Air date (a Thursday)</label>
          <input id="ep-date" type="date" value={draft.airDate}
            onChange={e => set('airDate', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ep-status">Status</label>
          <select id="ep-status" value={draft.status}
            onChange={e => set('status', e.target.value as EpisodeStatus)}>
            <option value="planned">Planned</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {error && <div style={{ color: 'var(--feedback-error)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={save} disabled={!valid || busy || offline}>
          {busy ? 'Saving…' : 'Save episode'}
        </button>
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        {offline && <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>Editing disabled while offline</span>}
      </div>
    </div>
  )
}

export function EpisodesView() {
  const { episodes, selected, selectEpisode } = useStudio()
  const [editing, setEditing] = useState<Episode | null>(null)
  const [isNew, setIsNew] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const aired = episodes.filter(e => e.airDate <= today)
  const lastAired = aired[aired.length - 1] ?? null
  const upNext = lastAired ? nextEpisode(episodes, lastAired) : episodes[0] ?? null

  const startNew = () => {
    const maxNum = episodes.reduce((m, e) => Math.max(m, e.epNumber), 0)
    setEditing({ id: `new-${maxNum + 1}`, ...EMPTY, epNumber: maxNum + 1 })
    setIsNew(true)
  }

  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2 className="view-title">Season schedule</h2>
          <p className="view-sub" style={{ margin: 0 }}>
            Every deliverable in the studio follows this list. Edit an episode and the bumpers, banners and cards update with it.
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={startNew}>+ New episode</button>
      </div>

      {editing && (
        <EpisodeEditor
          key={editing.id}
          initial={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
        />
      )}

      <div style={{
        background: 'var(--surface-page)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--elev-sm)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--surface-subtle)' }}>
              {['', 'Ep', 'Title', 'Category', 'Airs', 'Status', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 16px', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {episodes.map(ep => {
              const { day, month } = formatDay(ep.airDate)
              const isSelected = selected?.id === ep.id
              const isNext = upNext?.id === ep.id
              return (
                <tr
                  key={ep.id}
                  onClick={() => selectEpisode(ep.id)}
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(178,210,53,0.10)' : undefined,
                  }}
                >
                  <td style={{ padding: '12px 0 12px 16px', width: 26 }}>
                    <span title={isSelected ? 'Selected for previews & exports' : ''} style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: isSelected ? 'var(--gc-mid-green)' : 'transparent',
                    }} />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {String(ep.epNumber).padStart(2, '0')}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {ep.title}
                    {isNext && (
                      <span style={{
                        marginLeft: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--gc-dark-green)',
                        background: 'var(--gc-light-green)', borderRadius: 999, padding: '2px 8px',
                      }}>Up next</span>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ep.hook}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><CategoryChip cat={ep.category} /></td>
                  <td style={{ padding: '12px 16px', fontVariantNumeric: 'tabular-nums' }}>Thu {day} {month}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: ep.status === 'published' ? 'var(--gc-mid-green)' : 'var(--text-tertiary)',
                    }}>{ep.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost"
                      onClick={e => { e.stopPropagation(); setEditing(ep); setIsNew(false) }}
                    >Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!episodes.length && <div className="skeleton" style={{ padding: 40 }}>No episodes yet — add the first one.</div>}
      </div>
    </div>
  )
}
