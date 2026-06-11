import { useStudio } from './StudioContext'

export function OfflineBanner() {
  const { offline } = useStudio()
  if (!offline) return null
  return (
    <div className="offline-banner" role="status">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 3.5v8M10 15.5v.5" />
      </svg>
      Supabase is unreachable — showing the last saved episode list. Edits are disabled until the connection returns.
    </div>
  )
}
