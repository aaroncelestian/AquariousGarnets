import { useCallback, useEffect, useRef, useState } from 'react'
import { slides, CHAPTERS } from '../data/slides'
import { useActiveSlide } from '../hooks/useActiveSlide'
import { useViewportHeight } from '../hooks/useViewportHeight'
import { NavContext } from '../hooks/useSlideNav'
import {
  exitPresentHref,
  fillScreen,
  isPresentMode,
  openPresentWindow,
} from '../lib/presentWindow'
import { SlideView } from './layouts/SlideView'
import styles from './Shell.module.css'

function applyPresentAttr(active: boolean) {
  document.documentElement.toggleAttribute('data-present', active)
  document.documentElement.toggleAttribute('data-fullscreen', active)
}

export function Shell() {
  const { containerRef, activeIndex, goTo } = useActiveSlide(slides.length)
  const activeChapter = slides[activeIndex]?.chapter
  const [present, setPresent] = useState(() => isPresentMode())
  const presentWinRef = useRef<Window | null>(null)

  useViewportHeight()

  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const goToRef = useRef(goTo)
  goToRef.current = goTo

  const chapterStarts = CHAPTERS.map((ch) => ({
    ...ch,
    index: slides.findIndex((s) => s.chapter === ch.id && s.layout === 'divider'),
  }))

  useEffect(() => {
    applyPresentAttr(present)
    window.dispatchEvent(new Event('resize'))
    requestAnimationFrame(() => {
      goToRef.current(activeIndexRef.current, 'auto')
    })
    return () => {
      if (!isPresentMode()) applyPresentAttr(false)
    }
  }, [present])

  const enterInPlacePresent = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('present', '1')
    url.searchParams.set('slide', String(activeIndexRef.current + 1))
    window.history.replaceState(null, '', url.toString())
    fillScreen(window)
    setPresent(true)
  }, [])

  const exitInPlacePresent = useCallback(() => {
    window.history.replaceState(null, '', exitPresentHref())
    setPresent(false)
  }, [])

  const togglePresent = useCallback(() => {
    if (isPresentMode()) {
      if (window.opener && !window.opener.closed) {
        window.close()
        return
      }
      exitInPlacePresent()
      return
    }

    const existing = presentWinRef.current
    if (existing && !existing.closed) {
      existing.close()
      presentWinRef.current = null
      return
    }

    const win = openPresentWindow(activeIndexRef.current)
    if (win) {
      presentWinRef.current = win
      return
    }

    // Popup blocked — stay in this window so Zoom's share surface does not change.
    enterInPlacePresent()
  }, [enterInPlacePresent, exitInPlacePresent])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      const editable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement)?.isContentEditable
      if (editable) return

      if (e.key === 'Escape' && (isPresentMode() || present)) {
        e.preventDefault()
        togglePresent()
        return
      }

      if (e.key !== 'p' && e.key !== 'P') return
      e.preventDefault()
      togglePresent()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [present, togglePresent])

  useEffect(() => {
    return () => {
      const win = presentWinRef.current
      if (win && !win.closed) win.close()
    }
  }, [])

  // Keep the active slide filling the canvas if the window is resized
  // while already presenting (monitor changes, browser UI, etc.).
  useEffect(() => {
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        goToRef.current(activeIndexRef.current, 'auto')
      }, 80)
    }
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <NavContext.Provider value={goTo}>
      <div ref={containerRef} className={styles.shell} id="deck">
        {slides.map((slide, i) => (
          <section
            key={slide.id}
            className={`${styles.slide} ${slide.layout}`}
            data-slide-index={i}
            data-slide-id={slide.id}
            aria-label={slide.label}
          >
            <div className={styles.slideInner}>
              <SlideView slide={slide} active={i === activeIndex} />
            </div>
          </section>
        ))}
      </div>

      {!present && (
        <>
          <nav className={styles.nav} aria-label="Slide progress">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={styles.dot}
                data-active={i === activeIndex}
                aria-label={`Go to ${s.label}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </nav>

          <nav className={styles.toc} aria-label="Chapters">
            {chapterStarts.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={styles.tocBtn}
                data-active={activeChapter === ch.id}
                onClick={() => goTo(Math.max(0, ch.index))}
              >
                {ch.num} {ch.title}
              </button>
            ))}
          </nav>
        </>
      )}

      {!present && (
        <div className={styles.chrome}>
          <div className={styles.counter} aria-live="polite">
            {activeIndex + 1} / {slides.length}
          </div>
          <button
            type="button"
            className={styles.fullscreenBtn}
            onClick={() => togglePresent()}
            aria-pressed={false}
            aria-label="Present"
            title="Present in a chrome-less window (P) — share that window in Zoom"
          >
            Present
          </button>
        </div>
      )}
    </NavContext.Provider>
  )
}
