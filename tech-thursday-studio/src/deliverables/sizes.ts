/** Native pixel sizes for every deliverable. Exports capture at exactly these. */
export const SIZES = {
  video: { w: 1920, h: 1080 },
  banner: { w: 1920, h: 480 },
  title: { w: 1920, h: 1080 },
  thumb169: { w: 1280, h: 720 },
  thumbSq: { w: 1080, h: 1080 },
  teams: { w: 1600, h: 300 },
  poster: { w: 1920, h: 1080 },
} as const

/** The shared bumper timeline length in ms. */
export const BUMPER_DURATION_MS = 5200
