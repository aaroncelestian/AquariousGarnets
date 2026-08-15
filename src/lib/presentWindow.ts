export const PRESENT_WINDOW_NAME = 'aquarius-garnets-present'

export function isPresentMode() {
  return new URLSearchParams(window.location.search).has('present')
}

export function presentHref(slideIndex: number) {
  const url = new URL(window.location.href)
  url.searchParams.set('present', '1')
  url.searchParams.set('slide', String(slideIndex + 1))
  return url.toString()
}

export function exitPresentHref() {
  const url = new URL(window.location.href)
  url.searchParams.delete('present')
  url.searchParams.delete('slide')
  return url.toString()
}

export function screenBox() {
  const s = window.screen
  return {
    left: s.availLeft ?? 0,
    top: s.availTop ?? 0,
    width: s.availWidth,
    height: s.availHeight,
  }
}

export function fillScreen(win: Window) {
  const { left, top, width, height } = screenBox()
  try {
    win.moveTo(left, top)
    win.resizeTo(width, height)
  } catch {
    // Popup move/resize can be blocked after the opening gesture.
  }
}

export function openPresentWindow(slideIndex: number) {
  const { left, top, width, height } = screenBox()
  const features = [
    'popup=yes',
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no',
    'scrollbars=yes',
    'resizable=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
  ].join(',')

  const win = window.open(presentHref(slideIndex), PRESENT_WINDOW_NAME, features)
  if (!win) return null

  fillScreen(win)
  window.setTimeout(() => fillScreen(win), 50)
  win.focus()
  return win
}
