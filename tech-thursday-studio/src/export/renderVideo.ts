import * as htmlToImage from 'html-to-image'
import {
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  QUALITY_HIGH,
  canEncodeVideo,
} from 'mediabunny'

export interface VideoExportOpts {
  /** The deliverable at native size (no ancestor-applied transform on this node). */
  node: HTMLElement
  durationMs: number
  fps: number
  width: number
  height: number
  onProgress?: (phase: 'frames' | 'encode', done: number, total: number) => void
}

export interface VideoExportResult {
  blob: Blob
  ext: 'mp4' | 'webm'
}

/** Pause all CSS animations inside `node`; returns a scrub + restore handle. */
function captureAnimations(node: HTMLElement) {
  const anims = document.getAnimations().filter(a => {
    const target = a.effect && 'target' in a.effect ? (a.effect as KeyframeEffect).target : null
    return target instanceof Element && node.contains(target)
  })
  anims.forEach(a => a.pause())
  return {
    scrub(t: number) {
      anims.forEach(a => {
        try { a.currentTime = t } catch { /* detached */ }
      })
    },
    restore() {
      anims.forEach(a => a.play())
    },
  }
}

/**
 * Wait for styles to settle. rAF is raced with a short timeout because
 * throttled/background tabs may never fire animation frames — computed
 * styles are read synchronously by the rasteriser, so the timeout is safe.
 */
const nextFrame = () =>
  new Promise<void>(resolve => {
    let settled = false
    const done = () => {
      if (!settled) {
        settled = true
        resolve()
      }
    }
    requestAnimationFrame(done)
    setTimeout(done, 50)
  })

/**
 * Render the node's CSS-animation timeline to a video file.
 * Frames are scrubbed via the Web Animations API and rasterised with
 * html-to-image; encoding prefers H.264 MP4 (WebCodecs via Mediabunny),
 * then VP9/VP8 WebM, then a MediaRecorder WebM last resort.
 */
export async function renderVideo(opts: VideoExportOpts): Promise<VideoExportResult> {
  const { node, durationMs, fps, width, height, onProgress } = opts
  await document.fonts.ready

  const frameCount = Math.ceil((fps * durationMs) / 1000)
  const anims = captureAnimations(node)

  // Embed fonts once — recomputing per frame is the prototype's slowness.
  const fontEmbedCSS = await htmlToImage.getFontEmbedCSS(node)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  try {
    // html-to-image's toCanvas resolves inside requestAnimationFrame (a
    // Safari workaround), which never fires in throttled/background tabs and
    // hangs the export. toSvg has no such dependency, so we load + draw the
    // SVG ourselves.
    const renderFrame = async (i: number) => {
      anims.scrub(Math.min((i / fps) * 1000, durationMs))
      await nextFrame()
      const svgUrl = await htmlToImage.toSvg(node, {
        width, height,
        backgroundColor: '#E6EBE3',
        cacheBust: false,
        fontEmbedCSS,
      })
      const img = new Image()
      img.decoding = 'async'
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error(`frame ${i} failed to render`))
        img.src = svgUrl
      })
      try { await img.decode() } catch { /* already loaded */ }
      ctx.fillStyle = '#E6EBE3'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      onProgress?.('frames', i + 1, frameCount)
    }

    // Preferred: WebCodecs via Mediabunny (MP4 first, then WebM).
    if (typeof VideoEncoder !== 'undefined') {
      const useAvc = await canEncodeVideo('avc', { width, height })
      const useVp9 = !useAvc && (await canEncodeVideo('vp9', { width, height }))
      const useVp8 = !useAvc && !useVp9 && (await canEncodeVideo('vp8', { width, height }))

      if (useAvc || useVp9 || useVp8) {
        const ext: 'mp4' | 'webm' = useAvc ? 'mp4' : 'webm'
        const output = new Output({
          format: useAvc ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(),
          target: new BufferTarget(),
        })
        const source = new CanvasSource(canvas, {
          codec: useAvc ? 'avc' : useVp9 ? 'vp9' : 'vp8',
          bitrate: QUALITY_HIGH,
        })
        output.addVideoTrack(source, { frameRate: fps })
        await output.start()

        for (let i = 0; i < frameCount; i++) {
          await renderFrame(i)
          await source.add(i / fps, 1 / fps, { keyFrame: i % 60 === 0 })
          onProgress?.('encode', i + 1, frameCount)
        }
        source.close()
        await output.finalize()
        const buffer = output.target.buffer!
        return { blob: new Blob([buffer], { type: useAvc ? 'video/mp4' : 'video/webm' }), ext }
      }
    }

    // Last resort: realtime MediaRecorder over a canvas stream (always WebM).
    const bitmaps: ImageBitmap[] = []
    for (let i = 0; i < frameCount; i++) {
      await renderFrame(i)
      bitmaps.push(await createImageBitmap(canvas))
    }

    let mime = 'video/webm;codecs=vp9'
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp8'
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm'

    const stream = canvas.captureStream(fps)
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 })
    const chunks: Blob[] = []
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
    const stopped = new Promise<void>(r => { recorder.onstop = () => r() })
    recorder.start()

    const frameMs = 1000 / fps
    for (let i = 0; i < bitmaps.length; i++) {
      ctx.drawImage(bitmaps[i], 0, 0)
      onProgress?.('encode', i + 1, bitmaps.length)
      await new Promise(r => setTimeout(r, frameMs))
    }
    await new Promise(r => setTimeout(r, frameMs * 2))
    recorder.stop()
    await stopped
    bitmaps.forEach(b => b.close())

    return { blob: new Blob(chunks, { type: 'video/webm' }), ext: 'webm' }
  } finally {
    anims.restore()
  }
}
