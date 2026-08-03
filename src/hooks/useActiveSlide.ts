import { useEffect, useRef, useState, useCallback } from 'react'

export function useActiveSlide(count: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const sections = root.querySelectorAll<HTMLElement>('[data-slide-index]')
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number(entry.target.getAttribute('data-slide-index'))
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio }
          }
        }
        if (best) setActiveIndex(best.index)
      },
      { root, threshold: [0.35, 0.55, 0.75] },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [count])

  const goTo = useCallback((index: number) => {
    const root = containerRef.current
    if (!root) return
    const el = root.querySelector<HTMLElement>(`[data-slide-index="${index}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const editable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        tag === 'BUTTON' ||
        (e.target as HTMLElement)?.isContentEditable
      if (editable) return

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        goTo(Math.min(count - 1, activeIndex + 1))
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        goTo(Math.max(0, activeIndex - 1))
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(count - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, count, goTo])

  return { containerRef, activeIndex, goTo }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = () => setReduced(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
