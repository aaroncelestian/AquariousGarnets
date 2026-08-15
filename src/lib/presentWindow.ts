export function isPresentMode() {
  return new URLSearchParams(window.location.search).has('present')
}

export function exitPresentHref() {
  const url = new URL(window.location.href)
  url.searchParams.delete('present')
  url.searchParams.delete('slide')
  return url.toString()
}

type ScreenBox = Screen & { availLeft?: number; availTop?: number }

export function fillScreen(win: Window) {
  const s = window.screen as ScreenBox
  try {
    win.moveTo(s.availLeft ?? 0, s.availTop ?? 0)
    win.resizeTo(s.availWidth, s.availHeight)
  } catch {
    // Tabs ignore move/resize; popups may still accept it.
  }
}
