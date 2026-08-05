import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import type { Slide } from '../../data/slides'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import { LocalityMap } from '../interactives/LocalityMap'
import { XrfChart } from '../interactives/XrfChart'
import { LibsBlast } from '../interactives/LibsBlast'
import { LibsPeel } from '../interactives/LibsPeel'
import { CnRatio } from '../interactives/CnRatio'
import { RamanMaturity } from '../interactives/RamanMaturity'
import { RamanBands } from '../interactives/RamanBands'
import { RamanZoom } from '../interactives/RamanZoom'
import { ImageSlideshow } from '../interactives/ImageSlideshow'
import styles from './Layouts.module.css'

const CrystalViewer = lazy(() =>
  import('../interactives/CrystalViewer').then((m) => ({ default: m.CrystalViewer })),
)
const EddyField = lazy(() =>
  import('../interactives/EddyField').then((m) => ({ default: m.EddyField })),
)
const LibsStack3D = lazy(() =>
  import('../interactives/LibsStack3D').then((m) => ({ default: m.LibsStack3D })),
)
const CoverAtmosphere = lazy(() =>
  import('../interactives/CoverAtmosphere').then((m) => ({
    default: m.CoverAtmosphere,
  })),
)
const EddyPhotoField = lazy(() =>
  import('../interactives/EddyPhotoField').then((m) => ({
    default: m.EddyPhotoField,
  })),
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
      // Avoid mount flash: don't play hidden→show on first paint; only when `active` changes.
      initial={false}
      animate={active ? 'show' : 'hidden'}
      variants={rise}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

/** Career path tree — levels animate from root (bottom) upward. */
function CareerTree({
  tree,
  active,
}: {
  tree: NonNullable<Slide['tree']>
  active: boolean
}) {
  const reduced = usePrefersReducedMotion()
  const n = tree.length
  const step = 0.16
  const ease = [0.2, 0.8, 0.2, 1] as const

  return (
    <div className={styles.tree} aria-label="Career path" data-active={active || undefined}>
      <motion.div
        className={styles.treeTrunk}
        aria-hidden
        initial={reduced ? false : { scaleY: 0 }}
        animate={active ? { scaleY: 1 } : { scaleY: 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: n * step * 0.85, ease, delay: 0.05 }
        }
        style={{ transformOrigin: 'bottom center' }}
      />
      {tree.map((level, li) => {
        // DOM order is top→bottom; reveal from root (last index) upward.
        const fromRoot = n - 1 - li
        const delay = reduced ? 0 : 0.08 + fromRoot * step
        return (
          <motion.div
            key={li}
            className={styles.treeLevel}
            data-root={li === n - 1 ? 'true' : undefined}
            data-count={level.length}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.42, ease, delay }}
          >
            {level.length > 1 && <div className={styles.treeBranch} aria-hidden />}
            <div className={styles.treeNodes}>
              {level.map((node, ni) => (
                <motion.div
                  key={`${node.year}-${node.text}`}
                  className={styles.treeNode}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.36,
                    ease,
                    delay: reduced ? 0 : delay + ni * 0.05,
                  }}
                >
                  <span className={styles.treeYear}>{node.year}</span>
                  <span className={styles.treeText}>{node.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function Kicker({ text }: { text?: string }) {
  if (!text) return null
  return <div className="kicker">{text}</div>
}

function Interactive({
  kind,
  active,
  backdrop = false,
}: {
  kind: NonNullable<Slide['interactive']>
  active: boolean
  backdrop?: boolean
}) {
  switch (kind) {
    case 'locality-map':
      return <LocalityMap active={active} />
    case 'xrf-chart':
      return <XrfChart active={active} />
    case 'libs-blast':
      return <LibsBlast active={active} />
    case 'libs-peel':
      return <LibsPeel active={active} />
    case 'libs-stack-3d':
      return (
        <Suspense fallback={<div style={{ height: '100%' }} />}>
          <LibsStack3D active={active} />
        </Suspense>
      )
    case 'cn-ratio':
      return <CnRatio active={active} />
    case 'raman-maturity':
      return <RamanMaturity active={active} />
    case 'raman-bands':
      return <RamanBands active={active} />
    case 'raman-zoom':
      return <RamanZoom active={active} />
    case 'eddy-field':
      return (
        <Suspense fallback={<div style={{ height: '100%', background: '#1a1715' }} />}>
          <EddyField active={active} />
        </Suspense>
      )
    case 'eddy-photo':
      return (
        <Suspense fallback={<div style={{ height: '100%', background: '#1a1715' }} />}>
          <EddyPhotoField active={active} />
        </Suspense>
      )
    case 'crystal-viewer':
      return (
        <Suspense
          fallback={
            <div
              style={{
                height: '100%',
                background: backdrop ? 'transparent' : 'var(--color-surface)',
              }}
            />
          }
        >
          <CrystalViewer active={active} backdrop={backdrop} />
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
  if (slide.layout === 'cover') {
    return (
      <div className={styles.cover} data-active={active || undefined}>
        {slide.image && (
          <div className={styles.bg} aria-hidden>
            <img src={slide.image.src} alt="" className={styles.bgBase} />
            <img src={slide.image.src} alt="" className={styles.bgLuster} />
            <div className={styles.bgSheen} />
            <div className={styles.bgGhost} />
            <div className={styles.scrim} />
          </div>
        )}
        <Suspense fallback={null}>
          <CoverAtmosphere active={active} />
        </Suspense>
        <Rise active={active} className={styles.content}>
          {slide.kicker && <div className={styles.brand}>{slide.kicker}</div>}
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
    const fit = slide.image?.fit ?? 'cover'
    const photo = slide.bleedTone === 'photo'
    return (
      <div className={photo ? styles.bleedPhoto : undefined}>
        <div className={styles.bleed} data-fit={fit}>
          {slide.interactive ? (
            <Interactive kind={slide.interactive} active={active} />
          ) : slide.slideshow ? (
            <ImageSlideshow images={slide.slideshow} active={active} />
          ) : (
            slide.image && <img src={slide.image.src} alt={slide.image.alt} />
          )}
          <div className={styles.bleedScrim} />
        </div>
        {slide.kicker && (
          <div className={`${styles.bleedKicker} kicker`}>{slide.kicker}</div>
        )}
        {(slide.title || slide.body) && (
          <Rise
            active={active}
            className={`${styles.bleedCopy}${photo ? ` ${styles.bleedCopyPhoto}` : ''}`}
          >
            {slide.title && (
              <h2>
                {slide.title.split('\n').map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </h2>
            )}
            {slide.body && (
              <p className={`${styles.body}${photo ? '' : ' text-muted'}`}>{slide.body}</p>
            )}
          </Rise>
        )}
      </div>
    )
  }

  if (slide.layout === 'stage') {
    const darkStage =
      slide.interactive === 'eddy-field' || slide.interactive === 'crystal-viewer'
    return (
      <div className={styles.stage} data-theme={darkStage ? 'dark' : undefined}>
        {slide.interactive && (
          <div className={styles.stageBg}>
            <Interactive kind={slide.interactive} active={active} backdrop />
          </div>
        )}
        <div className={styles.stageScrim} aria-hidden />
        <Rise active={active} className={styles.stageCopy}>
          <Kicker text={slide.kicker} />
          {slide.title && <h2>{slide.title}</h2>}
          {slide.body && <p className={`${styles.body} text-muted`}>{slide.body}</p>}
          {slide.cols && (
            <div className={styles.stageCols}>
              {slide.cols.map((c) => (
                <div
                  key={c.heading}
                  className={styles.stageCol}
                  data-accent={c.heading === 'Almandine' || undefined}
                >
                  <h3>{c.heading}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </Rise>
        {slide.formula && (
          <Rise active={active} delay={0.1} className={styles.stageFormulaCenter}>
            <div
              className={styles.stageFormula}
              aria-label={`Formula ${slide.formula.expression}`}
            >
              <div className={styles.stageFormulaExpr}>
                <span className={styles.stageSiteX}>X</span>
                <sub>3</sub>
                <span className={styles.stageSiteY}>Y</span>
                <sub>2</sub>
                (SiO<sub>4</sub>)<sub>3</sub>
              </div>
              <div className={styles.stageFormulaSites}>
                {slide.formula.sites.map((s) => (
                  <span key={s.label}>
                    <span
                      className={
                        s.label === 'Y' ? styles.stageSiteY : styles.stageSiteX
                      }
                    >
                      {s.label}
                    </span>
                    {' — '}
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </Rise>
        )}
      </div>
    )
  }

  if (slide.layout === 'split') {
    const media = slide.interactive ? (
      <Rise active={active} delay={0.08} className={styles.splitInteractive}>
        <Interactive kind={slide.interactive} active={active} />
      </Rise>
    ) : slide.image ? (
      <Rise active={active} delay={0.08} className={styles.splitFigure}>
        <motion.img
          src={slide.image.src}
          alt={slide.image.alt}
          initial={false}
          animate={active ? { scale: 1.03 } : { scale: 1 }}
          transition={{ duration: 8, ease: 'linear' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Rise>
    ) : null

    const copy = (
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
    )

    return (
      <div className={`${styles.split}${slide.splitFlip ? ` ${styles.splitFlip}` : ''}`}>
        {slide.splitFlip ? (
          <>
            {media}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {media}
          </>
        )}
      </div>
    )
  }

  if (slide.layout === 'cols') {
    return (
      <div className={styles.cols}>
        <Rise active={active} className={styles.contentFill}>
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
  return (
    <div className={styles.contentSlide}>
      <Rise active={active} className={styles.contentFill}>
        <Kicker text={slide.kicker} />
        <h2>{slide.title}</h2>
        {slide.body && <p className={`${styles.body} text-muted`}>{slide.body}</p>}
        {slide.figures && (
          <div className={styles.figures}>
            {slide.figures.map((fig) => (
              <figure key={fig.src} className={styles.figureCard}>
                <img src={fig.src} alt={fig.alt} />
                {fig.caption && <figcaption>{fig.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
        {slide.bullets ? (
          <ul className={styles.bullets}>
            {slide.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
        {slide.timeline && (
          <ol className={styles.timeline}>
            {slide.timeline.map((item) => (
              <li key={`${item.year}-${item.text}`}>
                <span className={styles.timelineYear}>{item.year}</span>
                <span className={styles.timelineText}>{item.text}</span>
              </li>
            ))}
          </ol>
        )}
        {slide.tree && (
          <CareerTree tree={slide.tree} active={active} />
        )}
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
