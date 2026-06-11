import { D } from './categories'

interface FillerDayPageProps {
  dayName: string
  dayNumber: string
  month: string
  year?: string
}

/**
 * Neutral calendar page for the intro's pre-Thursday tear-off days.
 * Same shape as CalendarPage so the tear feels like one continuous pad.
 */
export function FillerDayPage({ dayName, dayNumber, month, year = '2026' }: FillerDayPageProps) {
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.page,
        borderRadius: '2.2cqh',
        boxShadow: D.shadow,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: D.font, color: D.ink,
        border: '1px solid rgba(41,66,56,0.08)',
      }}
    >
      {/* Neutral grey-green top bar so it reads as 'just another weekday'. */}
      <div
        style={{
          background: 'rgba(41,66,56,0.10)', color: D.ink, padding: '2.2cqh 3cqh',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flex: '0 0 auto', borderBottom: '1px solid rgba(41,66,56,0.10)',
        }}
      >
        <span style={{
          fontWeight: 800, fontSize: '4cqh',
          letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7,
        }}>{dayName}</span>
        <span style={{
          fontSize: '2.6cqh', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4,
        }}>{year}</span>
      </div>

      {/* Binder hole strip */}
      <div
        style={{
          background: 'rgba(41,66,56,0.04)', padding: '0.6cqh 3cqh',
          display: 'flex', gap: '1.6cqh', justifyContent: 'flex-start',
          borderBottom: '1px dashed rgba(41,66,56,0.18)',
          flex: '0 0 auto',
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            width: '1.2cqh', height: '1.2cqh', borderRadius: '50%',
            background: '#fff', boxShadow: 'inset 0 1px 2px rgba(41,66,56,0.25)',
          }} />
        ))}
      </div>

      <div
        style={{
          flex: 1, padding: '2.4cqh 3cqh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.4cqh' }}>
          <div style={{
            fontSize: '32cqh', fontWeight: 900, lineHeight: 0.85,
            letterSpacing: '-0.06em', color: 'rgba(41,66,56,0.85)',
          }}>{dayNumber}</div>
          <div style={{
            fontSize: '8cqh', fontWeight: 800, lineHeight: 0.9,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'rgba(41,66,56,0.45)',
          }}>{month}</div>
        </div>
        <div style={{
          marginTop: '0.4cqh',
          fontSize: '2.2cqh', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.4,
        }}>{year}</div>
      </div>
    </div>
  )
}
