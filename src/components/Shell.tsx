import { useCallback, useEffect, useRef, useState } from 'react'
import { slides, CHAPTERS } from '../data/slides'
import { useActiveSlide } from '../hooks/useActiveSlide'
import { useViewportHeight } from '../hooks/useViewportHeight'
import { NavContext } from '../hooks/useSlideNav'
import { isPresentMode, openPresentWindow } from '../lib/presentWindow'
import { SlideView } from './layouts/SlideView'
import styles from './Shell.module.css'

function applyPresentAttr(active: boolean) {
  document.documentElement.toggleAttribute('data-present', active)
  document.documentElement.toggleAttribute('data-fullscreen', active)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

export function Shell() {
  const { containerRef, activeIndex, goTo } = useActiveSlide(slides.length)
  const activeChapter = slides[activeIndex]?.chapter
  const inPresentWindow = isPresentMode()
  const [present, setPresent] = useState(inPresentWindow)
  const [needClick, setNeedClick] = useState(false)
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
    requestAnimationFrame(() => {
      goToRef.current(activeIndexRef.current, 'auto')
    })
  }, [present])

  const launchPresent = useCallback(() => {
    if (isPresentMode()) {
      if (window.opener && !window.opener.closed) window.close()
      return true
    }

    const existing = presentWinRef.current
    if (existing && !existing.closed) {
      existing.close()
      presentWinRef.current = null
      return true
    }

    const win = openPresentWindow(activeIndexRef.current)
    if (win) {
      presentWinRef.current = win
      setNeedClick(false)
      return true
    }
    return false
  }, [])

  const requestPresent = useCallback(() => {
    if (launchPresent()) return
    setNeedClick(true)
  }, [launchPresent])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (isTypingTarget(e.target)) return

      if (e.key === 'Escape') {
        if (needClick) {
          e.preventDefault()
          setNeedClick(false)
          return
        }
        if (isPresentMode()) {
          e.preventDefault()
          if (window.opener && !window.opener.closed) window.close()
          else setPresent(false)
        }
        return
      }

      if (e.code !== 'KeyP' && e.key !== 'p' && e.key !== 'P') return
      e.preventDefault()
      e.stopPropagation()
      requestPresent()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [needClick, requestPresent])

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

      <nav className={styles.nav} aria-label="Slide progress" hidden={present}>
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

      <nav className={styles.toc} aria-label="Chapters" hidden={present}>
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

      <div className={styles.chrome} hidden={present}>
        <div className={styles.counter} aria-live="polite">
          {activeIndex + 1} / {slides.length}
        </div>
        <button
          type="button"
          className={styles.presentBtn}
          onClick={() => requestPresent()}
        >
          Present
        </button>
      </div>

      {needClick && (
        <button
          type="button"
          className={styles.presentGate}
          onClick={() => requestPresent()}
        >
          <span className={styles.presentGateTitle}>Open present window</span>
          <span className={styles.presentGateBody}>
            Browsers block chrome-less windows from a key press. Click here, then share
            that window in Zoom — not this tab.
          </span>
        </button>
      )}
    </NavContext.Provider>
  )
}
