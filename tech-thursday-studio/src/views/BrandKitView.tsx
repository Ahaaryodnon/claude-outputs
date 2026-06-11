import { useStudio } from '../app/StudioContext'
import { Stage } from '../app/Stage'
import { Wordmark } from '../deliverables/Wordmark'
import { CalendarPage } from '../brand/CalendarPage'
import { D } from '../brand/categories'

const SWATCHES: [string, string, string][] = [
  ['#294238', 'Dark Green', 'Wordmark, body ink'],
  ['#B2D235', 'Light Green', 'Stamps, accents'],
  ['#50B748', 'Mid Green', 'General tips, success'],
  ['#F57821', 'Orange', 'AI tips (used sparingly)'],
  ['#FBFAF6', 'Paper white', 'Calendar surface'],
  ['#E6EBE3', 'Warm grey', 'Page background'],
]

function SpecCard() {
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.page,
        padding: '5%', boxSizing: 'border-box', containerType: 'size',
        fontFamily: D.font, color: D.ink,
        display: 'flex', flexDirection: 'column', gap: '4cqh',
      }}
    >
      <div>
        <div style={{
          fontSize: '2.6cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: D.mid, marginBottom: '0.6cqh',
        }}>Tech Thursday · brand kit</div>
        <div style={{ fontWeight: 900, fontSize: '9cqh', lineHeight: 1, letterSpacing: '-0.02em' }}>
          Colour, type, voice.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5cqh', flex: 1 }}>
        <div>
          <div style={{
            fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', opacity: 0.5, marginBottom: '2cqh',
          }}>Colour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.6cqh 2.4cqh', alignItems: 'center' }}>
            {SWATCHES.map(([hex, name, use]) => (
              <div key={hex} style={{ display: 'contents' }}>
                <div style={{
                  width: '6cqh', height: '6cqh', borderRadius: '1.2cqh',
                  background: hex, border: '1px solid rgba(41,66,56,0.12)',
                }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2cqh', fontSize: '2.6cqh', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>{name}</span>
                  <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{hex}</span>
                  <span style={{ opacity: 0.55 }}>{use}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3cqh' }}>
          <div>
            <div style={{
              fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '1cqh',
            }}>Type</div>
            <div style={{ fontSize: '6cqh', fontWeight: 900, letterSpacing: '-0.02em' }}>Cera Pro Black</div>
            <div style={{ fontSize: '2.4cqh', opacity: 0.55 }}>For dates, titles, stamps</div>
            <div style={{ marginTop: '1cqh', fontSize: '3.4cqh', fontWeight: 400 }}>Cera Pro Regular · 500 · 700</div>
            <div style={{ fontSize: '2.4cqh', opacity: 0.55 }}>Body, captions, overlines</div>
          </div>
          <div>
            <div style={{
              fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '1cqh',
            }}>Voice</div>
            <div style={{ fontSize: '3cqh', lineHeight: 1.35, maxWidth: '44ch' }}>
              One short tip. One thing you can use the same day. Confident, warm, plainspoken — never breathless.
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '1cqh',
            }}>Cadence</div>
            <div style={{ fontSize: '3cqh' }}>Every other Thursday · 9am · 30–60 seconds.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BrandKitView() {
  const { selected, settings } = useStudio()
  if (!selected) return <div className="skeleton">Add an episode first.</div>

  return (
    <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div>
        <h2 className="view-title">Brand kit</h2>
        <p className="view-sub">Direction D · Desk Calendar — the locked identity. Reference and logo exports.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <Stage title="Wordmark · light" width={1200} height={900} maxHeight={340}>
          <Wordmark settings={settings} />
        </Stage>
        <Stage title="Wordmark · dark" width={1200} height={900} maxHeight={340}>
          <Wordmark dark settings={settings} />
        </Stage>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)' }}>
        <Stage title="Mark · calendar page" width={900} height={900} maxHeight={340}>
          <div style={{
            width: '100%', height: '100%', background: D.bg, containerType: 'size',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8%', boxSizing: 'border-box',
          }}>
            <div style={{ height: '84%', aspectRatio: '0.78' }}>
              <CalendarPage episode={selected} withStamp={true} />
            </div>
          </div>
        </Stage>
        <Stage title="Spec · colour, type, voice" width={1600} height={900} maxHeight={340}>
          <SpecCard />
        </Stage>
      </div>
    </div>
  )
}
