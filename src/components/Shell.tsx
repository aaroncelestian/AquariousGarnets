import { useCallback, useEffect, useRef, useState } from 'react'
import { slides, CHAPTERS } from '../data/slides'
import { useActiveSlide } from '../hooks/useActiveSlide'
import { useViewportHeight } from '../hooks/useViewportHeight'
import { NavContext } from '../hooks/useSlideNav'
import { isPresentMode, presentHref } from '../lib/presentWindow'
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
  const [present, setPresent] = useState(() => isPresentMode())
  const presentRef = useRef(present)
  presentRef.current = present

  useViewportHeight()

  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const goToRef = useRef(goTo)
  goToRef.current = goTo

  const chapterStarts = CHAPTERS.map((ch) => ({
    ...ch,
    index: slides.findIndex((s) => s.chapter === ch.id && s.layout === 'divider'),
  }))

  const setPresentMode = useCallback((on: boolean) => {
    presentRef.current = on
    applyPresentAttr(on)
    window.history.replaceState(null, '', presentHref(on, activeIndexRef.current))
    setPresent(on)
    requestAnimationFrame(() => {
      goToRef.current(activeIndexRef.current, 'auto')
    })
  }, [])

  useEffect(() => {
    applyPresentAttr(present)
  }, [present])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (isTypingTarget(e.target)) return

      if (e.key === 'Escape' && presentRef.current) {
        e.preventDefault()
        e.stopPropagation()
        setPresentMode(false)
        return
      }

      if (e.code !== 'KeyP' && e.key !== 'p' && e.key !== 'P') return
      e.preventDefault()
      e.stopPropagation()
      setPresentMode(!presentRef.current)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [setPresentMode])

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
      </div>
    </NavContext.Provider>
  )
}
