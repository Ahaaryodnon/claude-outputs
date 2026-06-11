import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface StageProps {
  title: string
  width: number
  height: number
  /** Toolbar content rendered on the right of the stage header. */
  actions?: ReactNode
  /** Max viewport height in px (the artboard scales to fit). */
  maxHeight?: number
  children: ReactNode
}

/**
 * Renders a deliverable at its native pixel size, scaled to fit the card.
 * The inner node is the real, full-resolution DOM — exports capture it 1:1.
 */
export function Stage({ title, width, height, actions, maxHeight = 520, children }: StageProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.1)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const fit = () => {
      const pad = 48
      const w = el.clientWidth - pad
      const h = el.clientHeight - pad
      setScale(Math.min(w / width, h / height, 1))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height])

  return (
    <div className="stage-card">
      <div className="stage-head">
        <span className="title">{title}</span>
        <span className="meta">{width} × {height}</span>
        <span className="spacer" />
        {actions}
      </div>
      <div
        ref={viewportRef}
        className="stage-viewport"
        style={{ height: Math.min(maxHeight, height * 0.6 + 96) }}
      >
        <div
          className="stage-scaler"
          style={{ width: width * scale, height: height * scale }}
        >
          <div
            style={{
              width, height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
