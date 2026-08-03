import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import type { Slide } from '../../data/slides'
import { CHAPTERS, slides } from '../../data/slides'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import { useSlideNav } from '../../hooks/useSlideNav'
import { LocalityMap } from '../interactives/LocalityMap'
import { XrfChart } from '../interactives/XrfChart'
import { LibsPeel } from '../interactives/LibsPeel'
import { CnRatio } from '../interactives/CnRatio'
import styles from './Layouts.module.css'

const CrystalViewer = lazy(() =>
  import('../interactives/CrystalViewer').then((m) => ({ default: m.CrystalViewer })),
)

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

function Rise({
  active,
  children,
  delay = 0,
  className,
}: {
  active: boolean
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={active ? 'show' : 'hidden'}
      variants={rise}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function Kicker({ text }: { text?: string }) {
  if (!text) return null
  return <div className="kicker">{text}</div>
}

function Interactive({
  kind,
  active,
}: {
  kind: NonNullable<Slide['interactive']>
  active: boolean
}) {
  switch (kind) {
    case 'locality-map':
      return <LocalityMap active={active} />
    case 'xrf-chart':
      return <XrfChart active={active} />
    case 'libs-peel':
      return <LibsPeel active={active} />
    case 'cn-ratio':
      return <CnRatio active={active} />
    case 'crystal-viewer':
      return (
        <Suspense fallback={<div style={{ height: '100%', background: 'var(--color-surface)' }} />}>
          <CrystalViewer active={active} />
        </Suspense>
      )
  }
}

export function SlideView({
  slide,
  active,
}: {
  slide: Slide
  active: boolean
}) {
  const goTo = useSlideNav()

  if (slide.layout === 'cover') {
    return (
      <div className={styles.cover}>
        {slide.image && (
          <div className={styles.bg} aria-hidden>
            <img src={slide.image.src} alt="" />
            <div className={styles.scrim} />
          </div>
        )}
        <Rise active={active} className={styles.content}>
          <div className={styles.brand}>{slide.kicker}</div>
          <h1 className={styles.display}>{slide.displayTitle}</h1>
          {slide.subtitle && (
            <p className={`${styles.sub} text-muted`}>{slide.subtitle}</p>
          )}
        </Rise>
        {slide.meta && <div className={styles.meta}>{slide.meta}</div>}
      </div>
    )
  }

  if (slide.layout === 'divider') {
    return (
      <div className={styles.divider}>
        <Rise active={active}>
          <div className={styles.ghost}>{slide.ghostNum}</div>
        </Rise>
        <Rise active={active} delay={0.12}>
          <h2 className={styles.dividerTitle}>{slide.title}</h2>
        </Rise>
      </div>
    )
  }

  if (slide.layout === 'bleed') {
    return (
      <>
        <div className={styles.bleed}>
          {slide.image && <img src={slide.image.src} alt={slide.image.alt} />}
          <div className={styles.bleedScrim} />
        </div>
        {slide.kicker && (
          <div className={`${styles.bleedKicker} kicker`}>{slide.kicker}</div>
        )}
        <Rise active={active} className={styles.bleedCopy}>
          <h2>{slide.title}</h2>
          {slide.body && <p className={styles.body}>{slide.body}</p>}
        </Rise>
      </>
    )
  }

  if (slide.layout === 'split') {
    return (
      <div className={styles.split}>
        <Rise active={active} className={styles.splitCopy}>
          <Kicker text={slide.kicker} />
          <h2>{slide.title}</h2>
          {slide.body && <p className={`${styles.body} text-muted`}>{slide.body}</p>}
          {slide.bullets && (
            <ul className={styles.bullets}>
              {slide.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </Rise>
        {slide.interactive ? (
          <Rise active={active} delay={0.08} className={styles.splitInteractive}>
            <Interactive kind={slide.interactive} active={active} />
          </Rise>
        ) : slide.image ? (
          <Rise active={active} delay={0.08} className={styles.splitFigure}>
            <motion.img
              src={slide.image.src}
              alt={slide.image.alt}
              initial={false}
              animate={
                active
                  ? { scale: 1.03 }
                  : { scale: 1 }
              }
              transition={{ duration: 8, ease: 'linear' }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Rise>
        ) : null}
      </div>
    )
  }

  if (slide.layout === 'cols') {
    return (
      <div className={styles.cols}>
        <Rise active={active}>
          <Kicker text={slide.kicker} />
          <h2>{slide.title}</h2>
          <div className={styles.colGrid}>
            {slide.cols?.map((c) => (
              <div key={c.heading}>
                <h3>{c.heading}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
          {slide.body && (
            <p className={`${styles.body} text-muted`} style={{ marginTop: 32 }}>
              {slide.body}
            </p>
          )}
        </Rise>
      </div>
    )
  }

  if (slide.layout === 'hero') {
    return (
      <div className={styles.hero}>
        <Rise active={active}>
          <Kicker text={slide.kicker} />
          <div className={styles.heroNum}>{slide.heroNum}</div>
          {slide.body && <p className={`${styles.body} text-muted`}>{slide.body}</p>}
        </Rise>
        {slide.interactive && (
          <Rise active={active} delay={0.15}>
            <Interactive kind={slide.interactive} active={active} />
          </Rise>
        )}
      </div>
    )
  }

  // content (default)
  const isContents = slide.id === 'contents'

  return (
    <div className={styles.contentSlide}>
      <Rise active={active}>
        <Kicker text={slide.kicker} />
        <h2>{slide.title}</h2>
        {slide.body && <p className={`${styles.body} text-muted`}>{slide.body}</p>}
        {isContents ? (
          <div className={styles.tocList}>
            {CHAPTERS.map((ch) => {
              const target = slides.findIndex(
                (s) => s.chapter === ch.id && s.layout === 'divider',
              )
              return (
                <button
                  key={ch.id}
                  type="button"
                  className={styles.tocRow}
                  onClick={() => goTo(Math.max(0, target))}
                >
                  <span className={styles.tocNum}>{ch.num}</span>
                  <span>{ch.title}</span>
                </button>
              )
            })}
          </div>
        ) : slide.bullets ? (
          <ul className={styles.bullets}>
            {slide.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
        {slide.table && (
          <div className={styles.tableWrap}>
            <table className="table">
              <thead>
                <tr>
                  {slide.table.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row) => (
                  <tr key={row.join('|')}>
                    {row.map((cell, i) => (
                      <td key={`${i}-${cell}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {slide.interactive && (
          <div style={{ marginTop: 32, minHeight: 280 }}>
            <Interactive kind={slide.interactive} active={active} />
          </div>
        )}
      </Rise>
    </div>
  )
}
