import { slides, CHAPTERS } from '../data/slides'
import { useActiveSlide } from '../hooks/useActiveSlide'
import { NavContext } from '../hooks/useSlideNav'
import { SlideView } from './layouts/SlideView'
import styles from './Shell.module.css'

export function Shell() {
  const { containerRef, activeIndex, goTo } = useActiveSlide(slides.length)
  const activeChapter = slides[activeIndex]?.chapter

  const chapterStarts = CHAPTERS.map((ch) => ({
    ...ch,
    index: slides.findIndex((s) => s.chapter === ch.id && s.layout === 'divider'),
  }))

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

      <div className={styles.counter} aria-live="polite">
        {activeIndex + 1} / {slides.length}
      </div>
    </NavContext.Provider>
  )
}

