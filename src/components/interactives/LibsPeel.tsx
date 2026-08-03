import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

const CAPTIONS = [
  'click "peel next layer" to begin',
  'layer 1 lifts: organic carbon',
  'layer 2 lifts: hematite',
  'bottom to top: garnet → hematite → carbon',
]

export function LibsPeel({ active }: { active: boolean }) {
  const [step, setStep] = useState(0)
  const max = 3

  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const carbonDy = step >= 1 ? -(28 + step * 22) : 0
  const hematiteDy = step >= 2 ? -(14 + (step - 1) * 18) : 0

  return (
    <div className={styles.libs}>
      <svg
        className={styles.chart}
        viewBox="0 0 420 340"
        role="img"
        aria-label="Diagram of three layers — garnet, hematite, organic carbon — that separate like delaminating plywood"
      >
        <g
          className={styles.layer}
          style={{ transform: `translateY(${carbonDy}px)` }}
        >
          <rect x="60" y="70" width="300" height="48" fill="var(--color-neutral-800)" />
          <text x="210" y="100" textAnchor="middle" className={styles.labelHi} fill="#f3f2f2">
            organic carbon
          </text>
        </g>
        <g
          className={styles.layer}
          style={{ transform: `translateY(${hematiteDy}px)` }}
        >
          <rect x="60" y="128" width="300" height="48" fill="var(--color-accent-2)" />
          <text x="210" y="158" textAnchor="middle" className={styles.labelHi} fill="#f3f2f2">
            hematite
          </text>
        </g>
        <g>
          <rect
            x="60"
            y="186"
            width="300"
            height="90"
            fill="color-mix(in srgb, var(--color-text) 85%, transparent)"
          />
          <text x="210" y="238" textAnchor="middle" className={styles.labelHi} fill="#f3f2f2">
            almandine garnet
          </text>
        </g>
        <text
          x="210"
          y="310"
          textAnchor="middle"
          className={styles.label}
          fontSize="13"
        >
          {CAPTIONS[step]}
        </text>
      </svg>
      <div className={styles.libsControls}>
        <button
          type="button"
          className="btn"
          aria-label="Previous step"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          ←
        </button>
        <span className={styles.stepLabel}>
          step {step} / {max}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStep((s) => (s >= max ? 0 : s + 1))}
        >
          {step >= max ? 'reset ↻' : 'peel next layer →'}
        </button>
      </div>
    </div>
  )
}
