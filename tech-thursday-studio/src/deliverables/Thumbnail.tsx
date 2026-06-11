import type { Episode } from '../data/types'
import { D } from '../brand/categories'
import { CalendarPage } from '../brand/CalendarPage'

interface ThumbnailProps {
  episode: Episode
  /** 'wide' = 16:9 tile, 'square' = 1:1 tile. */
  variant: 'wide' | 'square'
}

/** Episode thumbnail for SharePoint / Viva Engage tiles. */
export function Thumbnail({ episode, variant }: ThumbnailProps) {
  return (
    <div
      style={{
        width: '100%', height: '100%', background: D.bg,
        padding: variant === 'square' ? '6%' : '4%',
        boxSizing: 'border-box', containerType: 'size', fontFamily: D.font,
        display: 'flex', flexDirection: 'column', gap: '3cqh',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ height: variant === 'square' ? '58%' : '60%', aspectRatio: '0.78' }}>
        <CalendarPage episode={episode} withStamp={false} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: D.font, fontWeight: 900, fontSize: '7cqh', lineHeight: 1,
            letterSpacing: '-0.01em', color: D.ink, textWrap: 'balance',
          }}
        >{episode.title}</div>
        <div style={{ marginTop: '1.4cqh', fontSize: '2.6cqh', color: 'rgba(41,66,56,0.6)', fontWeight: 500 }}>
          Tech Thursday · Ep {String(episode.epNumber).padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
