export function isPresentMode() {
  return new URLSearchParams(window.location.search).has('present')
}

export function exitPresentHref() {
  const url = new URL(window.location.href)
  url.searchParams.delete('present')
  url.searchParams.delete('slide')
  return url.toString()
}

export function fillScreen(win: Window) {
  const s = window.screen
  const left = s.availLeft ?? 0
  const top = s.availTop ?? 0
  try {
    win.moveTo(left, top)
    win.resizeTo(s.availWidth, s.availHeight)
  } catch {
    // Tabs ignore move/resize; popups may still accept it.
  }
}
