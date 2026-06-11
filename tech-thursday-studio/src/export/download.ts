/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the download a moment before revoking.
  setTimeout(() => URL.revokeObjectURL(a.href), 30_000)
}
