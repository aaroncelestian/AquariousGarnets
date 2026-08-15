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
