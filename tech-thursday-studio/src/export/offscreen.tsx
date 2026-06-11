import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * Render JSX into a hidden fixed-size container at native pixel size.
 * Returns the node (for capture) and a cleanup function.
 */
export async function renderOffscreen(
  jsx: ReactNode,
  width: number,
  height: number,
): Promise<{ node: HTMLElement; cleanup: () => void }> {
  const host = document.createElement('div')
  host.style.cssText = `position: fixed; left: -100000px; top: 0; width: ${width}px; height: ${height}px; overflow: hidden;`
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(<div style={{ width, height }}>{jsx}</div>)

  // Wait for React to commit and images inside to load.
  await new Promise(r => setTimeout(r, 30))
  const images = Array.from(host.querySelectorAll('img'))
  await Promise.all(images.map(img =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>(res => {
          img.onload = () => res()
          img.onerror = () => res()
        }),
  ))
  await document.fonts.ready

  return {
    node: host.firstElementChild as HTMLElement,
    cleanup: () => {
      root.unmount()
      host.remove()
    },
  }
}
