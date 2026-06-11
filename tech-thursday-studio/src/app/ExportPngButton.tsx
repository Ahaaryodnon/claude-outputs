import { useState } from 'react'
import type { ReactNode } from 'react'
import { renderOffscreen } from '../export/offscreen'
import { renderPng } from '../export/renderPng'
import { downloadBlob } from '../export/download'

interface ExportPngButtonProps {
  /** Render the deliverable fresh (offscreen, native size) for capture. */
  render: () => ReactNode
  width: number
  height: number
  filename: string
}

/** Stage-header button: renders the deliverable offscreen and downloads a PNG. */
export function ExportPngButton({ render, width, height, filename }: ExportPngButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const doExport = async () => {
    if (busy) return
    setBusy(true)
    setError(false)
    try {
      const { node, cleanup } = await renderOffscreen(render(), width, height)
      try {
        const blob = await renderPng(node, width, height)
        downloadBlob(blob, filename)
        ;(window as unknown as Record<string, unknown>).__lastPng = { filename, size: blob.size }
      } finally {
        cleanup()
      }
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className="btn" onClick={doExport} disabled={busy} data-export-png={filename}>
      {busy ? 'Exporting…' : error ? 'Failed — retry' : '↓ PNG'}
    </button>
  )
}
