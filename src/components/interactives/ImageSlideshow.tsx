import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

export function ImageSlideshow({
  images,
  active,
  intervalMs = 3200,
}: {
  images: { src: string; alt: string }[]
  active: boolean
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!active || reduced || images.length < 2) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [active, reduced, images.length, intervalMs])

  useEffect(() => {
    if (!active) setIndex(0)
  }, [active])

  if (!images.length) return null

  return (
    <div className={styles.slideshow} aria-live="polite">
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={i === index ? img.alt : ''}
          className={styles.slideshowImg}
          data-active={i === index}
          draggable={false}
        />
      ))}
      <div className={styles.slideshowDots} aria-hidden>
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            className={styles.slideshowDot}
            data-active={i === index}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      <div className={styles.slideshowCount} aria-hidden>
        {index + 1} / {images.length}
      </div>
    </div>
  )
}
