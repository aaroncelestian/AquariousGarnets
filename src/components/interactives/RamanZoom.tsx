import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

/**
 * Click-through crop of the full Raman spectrum (top panel only).
 * Wavenumber map on raman-comparison.png (~1800×484):
 *   100 cm⁻¹ ≈ 5% · 700 ≈ 38% · 1100 ≈ 60% · 1800 ≈ 98%
 */
const STEPS = [
  {
    label: 'Full',
    caption: 'Full spectrum — hematite on the left, organic carbon on the right.',
    cta: 'Tap to zoom → hematite',
    scale: 1,
    origin: '50% 55%',
  },
  {
    label: 'Hematite',
    caption: 'Low wavenumber — sharp hematite peaks at the coating margin.',
    cta: 'Tap to pan → carbon',
    scale: 2.55,
    origin: '22% 58%',
  },
  {
    label: 'Carbon',
    caption: 'High wavenumber — broad D and G bands of disordered organic carbon.',
    cta: 'Tap to zoom out',
    scale: 2.45,
    origin: '78% 58%',
  },
] as const

export function RamanZoom({ active }: { active: boolean }) {
  const [step, setStep] = useState(0)
  const reduced = usePrefersReducedMotion()
  const view = STEPS[step]

  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const next = () => setStep((s) => (s + 1) % STEPS.length)

  return (
    <div className={styles.ramanZoom}>
      <button
        type="button"
        className={styles.ramanZoomViewport}
        onClick={next}
        aria-label={`${view.label}: ${view.caption} ${view.cta}`}
      >
        <img
          src="/images/raman-comparison.png"
          alt="Raman spectra comparing uncoated garnet and organic-rich coating"
          className={styles.ramanZoomImg}
          style={{
            transform: `scale(${view.scale})`,
            transformOrigin: view.origin,
            transition: reduced
              ? 'none'
              : 'transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          draggable={false}
        />
        <div className={styles.ramanZoomChrome} aria-hidden>
          <span className={styles.ramanZoomStep}>
            {view.label} · {step + 1}/{STEPS.length}
          </span>
          <span className={styles.ramanZoomCta}>{view.cta}</span>
        </div>
      </button>
      <p className={styles.ramanZoomCaption}>{view.caption}</p>
    </div>
  )
}
