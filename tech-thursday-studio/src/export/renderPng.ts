import * as htmlToImage from 'html-to-image'

/**
 * Rasterise a native-size node to a PNG blob at exact pixel dimensions.
 * Uses toSvg + manual draw (html-to-image's toPng resolves inside
 * requestAnimationFrame, which stalls in background tabs).
 */
export async function renderPng(node: HTMLElement, width: number, height: number): Promise<Blob> {
  await document.fonts.ready
  const svgUrl = await htmlToImage.toSvg(node, { width, height, cacheBust: false })
  const img = new Image()
  img.decoding = 'async'
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('PNG render failed'))
    img.src = svgUrl
  })
  try { await img.decode() } catch { /* already decoded */ }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('canvas.toBlob failed'))), 'image/png'),
  )
}
