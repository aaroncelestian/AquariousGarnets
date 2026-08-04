import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'
import { asset } from '../../lib/asset'

/**
 * Click-through crop of the full Raman spectrum (top panel only).
 * Wavenumber map on raman-comparison.png (~2433×800):
 *   100 cm⁻¹ ≈ 5% · 700 ≈ 38% · 1100 ≈ 60% · 1320 ≈ 72% · 1600 ≈ 87% · 1800 ≈ 98%
 */
const STEPS = [
  {
    label: 'Full',
    caption: 'Full spectrum — hematite on the left, organic carbon on the right.',
    cta: 'Tap to zoom → hematite',
    scale: 1,
    origin: '50% 48%',
  },
  {
    label: 'Hematite',
    caption: 'Low wavenumber — sharp first-order hematite peaks at the coating margin.',
    cta: 'Tap → the ~1320 hitch',
    scale: 2.45,
    origin: '22% 42%',
  },
  {
    label: '~1320',
    caption:
      'The sharp hitch near 1320 cm⁻¹ is hematite’s second-order mode — it sits right on the carbon D-band.',
    cta: 'Tap → real carbon',
    scale: 2.6,
    origin: '72% 40%',
  },
  {
    label: 'Carbon',
    caption:
      'Broad D plus G (~1585 cm⁻¹) — and spots without hematite still show both. That’s disordered organic carbon.',
    cta: 'Tap to zoom out',
    scale: 2.35,
    origin: '82% 42%',
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
          src={asset('images/raman-comparison.png')}
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
          <p className={styles.ramanZoomCaption}>{view.caption}</p>
          <span className={styles.ramanZoomCta}>{view.cta}</span>
        </div>
      </button>
    </div>
  )
}
