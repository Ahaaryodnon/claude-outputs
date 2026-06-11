import JSZip from 'jszip'
import type { Episode, Settings } from '../data/types'
import { slug } from '../data/episodes'
import { SIZES } from '../deliverables/sizes'
import { MainBanner } from '../deliverables/banners/MainBanner'
import { EpisodeBanner } from '../deliverables/banners/EpisodeBanner'
import { PreviousBanner } from '../deliverables/banners/PreviousBanner'
import { TitleCard } from '../deliverables/TitleCard'
import { Thumbnail } from '../deliverables/Thumbnail'
import { TeamsBanner } from '../deliverables/TeamsBanner'
import { SeasonPoster } from '../deliverables/SeasonPoster'
import { renderOffscreen } from './offscreen'
import { renderPng } from './renderPng'
import { downloadBlob } from './download'

export interface PackProgress {
  done: number
  total: number
  current: string
}

interface PackItem {
  name: string
  jsx: React.ReactNode
  w: number
  h: number
}

function packItems(episode: Episode, episodes: Episode[], settings: Settings): PackItem[] {
  const ep = `ep${String(episode.epNumber).padStart(2, '0')}-${slug(episode.title)}`
  const items: PackItem[] = []
  for (const theme of ['light', 'dark'] as const) {
    items.push(
      {
        name: `banner-main-${theme}.png`,
        jsx: <MainBanner theme={theme} episode={episode} settings={settings} />,
        w: SIZES.banner.w, h: SIZES.banner.h,
      },
      {
        name: `banner-this-week-${ep}-${theme}.png`,
        jsx: <EpisodeBanner theme={theme} episode={episode} />,
        w: SIZES.banner.w, h: SIZES.banner.h,
      },
      {
        name: `banner-previous-episodes-${theme}.png`,
        jsx: <PreviousBanner theme={theme} episodes={episodes} />,
        w: SIZES.banner.w, h: SIZES.banner.h,
      },
    )
  }
  items.push(
    { name: `title-card-${ep}.png`, jsx: <TitleCard episode={episode} />, w: SIZES.title.w, h: SIZES.title.h },
    { name: `thumbnail-16x9-${ep}.png`, jsx: <Thumbnail episode={episode} variant="wide" />, w: SIZES.thumb169.w, h: SIZES.thumb169.h },
    { name: `thumbnail-square-${ep}.png`, jsx: <Thumbnail episode={episode} variant="square" />, w: SIZES.thumbSq.w, h: SIZES.thumbSq.h },
    { name: 'teams-banner.png', jsx: <TeamsBanner episodes={episodes} settings={settings} />, w: SIZES.teams.w, h: SIZES.teams.h },
    { name: 'season-poster.png', jsx: <SeasonPoster episodes={episodes} settings={settings} />, w: SIZES.poster.w, h: SIZES.poster.h },
  )
  return items
}

/** Render one deliverable offscreen and download it as a PNG. */
export async function exportPng(item: PackItem) {
  const { node, cleanup } = await renderOffscreen(item.jsx, item.w, item.h)
  try {
    const blob = await renderPng(node, item.w, item.h)
    downloadBlob(blob, `tech-thursday-${item.name}`)
    return blob
  } finally {
    cleanup()
  }
}

/** Render every PNG deliverable for the episode and download as one zip. */
export async function exportEpisodePack(
  episode: Episode,
  episodes: Episode[],
  settings: Settings,
  onProgress?: (p: PackProgress) => void,
): Promise<void> {
  const items = packItems(episode, episodes, settings)
  const zip = new JSZip()
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    onProgress?.({ done: i, total: items.length, current: item.name })
    const { node, cleanup } = await renderOffscreen(item.jsx, item.w, item.h)
    try {
      const blob = await renderPng(node, item.w, item.h)
      zip.file(`tech-thursday-${item.name}`, blob)
    } finally {
      cleanup()
    }
  }
  onProgress?.({ done: items.length, total: items.length, current: 'zipping' })
  const blob = await zip.generateAsync({ type: 'blob' })
  const name = `tech-thursday-ep${String(episode.epNumber).padStart(2, '0')}-${slug(episode.title)}-pack.zip`
  downloadBlob(blob, name)
  ;(window as unknown as Record<string, unknown>).__lastPack = { name, size: blob.size, files: items.length }
}

export { packItems }
export type { PackItem }
