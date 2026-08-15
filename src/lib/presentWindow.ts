export const PRESENT_WINDOW_NAME = 'aquarius-garnets-present'

export function isPresentMode() {
  return new URLSearchParams(window.location.search).has('present')
}

export function presentHref(on: boolean, slideIndex = 0) {
  const url = new URL(window.location.href)
  if (on) {
    url.searchParams.set('present', '1')
    url.searchParams.set('slide', String(slideIndex + 1))
  } else {
    url.searchParams.delete('present')
    url.searchParams.delete('slide')
  }
  return url.toString()
}

type ScreenBox = Screen & { availLeft?: number; availTop?: number }

function screenBox() {
  const s = window.screen as ScreenBox
  return {
    left: s.availLeft ?? 0,
    top: s.availTop ?? 0,
    width: s.availWidth,
    height: s.availHeight,
  }
}

export function fillPopup(win: Window) {
  const { left, top, width, height } = screenBox()
  try {
    win.moveTo(left, top)
    win.resizeTo(width, height)
  } catch {
    // Some browsers ignore move/resize after the opening gesture.
  }
}

/** Chrome-less popup sized to the screen. Must run in a trusted click/keydown. */
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

  const win = window.open(presentHref(true, slideIndex), PRESENT_WINDOW_NAME, features)
  if (!win || win.closed) return null

  fillPopup(win)
  window.setTimeout(() => fillPopup(win), 50)
  win.focus()
  return win
}
