import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

type Mode = 'both' | 'coated' | 'uncoated'

const DATA = [
  { el: 'Scandium', uncoated: 0, coated: 58, label: '~58' },
  { el: 'Chromium', uncoated: 0, coated: 200, label: '~200' },
  { el: 'Zinc', uncoated: 0, coated: 65, label: '~65' },
]

export function XrfChart({ active }: { active: boolean }) {
  const [mode, setMode] = useState<Mode>('both')
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    if (active) {
      const t = requestAnimationFrame(() => setGrown(true))
      return () => cancelAnimationFrame(t)
    }
    setGrown(false)
  }, [active])

  const max = 210
  const chartH = 220
  const baseline = 250

  return (
    <div className={styles.xrf} data-show={mode}>
      <div className={styles.toggle} role="group" aria-label="Filter chart by population">
        {(
          [
            ['both', 'Both'],
            ['coated', 'Coated only'],
            ['uncoated', 'Uncoated only'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="btn"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <svg
        className={styles.chart}
        viewBox="0 0 520 340"
        role="img"
        aria-label="Bar chart comparing scandium, chromium and zinc XRF signal between coated and uncoated garnet populations"
      >
        <line x1="40" y1="30" x2="40" y2={baseline} className={styles.axis} />
        <line
          x1="40"
          y1={baseline}
          x2="500"
          y2={baseline}
          className={styles.axis}
        />
        <text x="12" y="22" fontSize="13" fill="currentColor" opacity="0.5">
          cps/mA
        </text>

        {DATA.map((d, i) => {
          const x0 = 80 + i * 140
          const hC = grown ? (d.coated / max) * chartH : 0
          const hU = grown ? Math.max((d.uncoated / max) * chartH, 3) : 0
          const coatOp = mode === 'uncoated' ? 0.15 : 1
          const uncOp = mode === 'coated' ? 0.15 : 1
          return (
            <g key={d.el}>
              <rect
                className={styles.barUncoated}
                x={x0}
                width={36}
                y={baseline - hU}
                height={hU}
                opacity={uncOp}
              />
              <rect
                className={styles.barCoated}
                x={x0 + 42}
                width={36}
                y={baseline - hC}
                height={hC}
                opacity={coatOp}
              />
              <text
                x={x0 + 39}
                y={baseline + 24}
                textAnchor="middle"
                className={styles.label}
                fontSize="15"
              >
                {d.el}
              </text>
              <text
                x={x0 + 18}
                y={baseline + 42}
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                opacity={0.45 * uncOp}
              >
                n.d.
              </text>
              <text
                x={x0 + 60}
                y={baseline - hC - 8}
                textAnchor="middle"
                className={styles.labelHi}
                fontSize="14"
                opacity={coatOp}
              >
                {d.label}
              </text>
            </g>
          )
        })}

        <g transform="translate(40, 310)">
          <rect width="14" height="10" className={styles.barCoated} />
          <text x="20" y="10" fontSize="14" fill="currentColor">
            coated
          </text>
          <rect x="90" width="14" height="10" className={styles.barUncoated} />
          <text x="110" y="10" fontSize="14" fill="currentColor">
            uncoated
          </text>
        </g>
      </svg>

      <div className={styles.qual}>
        <div className={styles.qualRow} data-dim-uncoated={mode === 'coated'} data-dim-coated={mode === 'uncoated'}>
          <span className={styles.qualLabel}>Phosphorus + calcium</span>
          <span className={styles.qualVals}>
            <span className="tag tag-accent" data-pop="coated">
              elevated together
            </span>
            <span className="tag tag-neutral" data-pop="uncoated">
              near zero
            </span>
          </span>
        </div>
        <div className={styles.qualRow}>
          <span className={styles.qualLabel}>Potassium : rubidium</span>
          <span className={styles.qualVals}>
            <span
              className="tag tag-accent"
              style={{ opacity: mode === 'uncoated' ? 0.25 : 1 }}
            >
              K high · Rb absent (~1000)
            </span>
            <span
              className="tag tag-neutral"
              style={{ opacity: mode === 'coated' ? 0.25 : 1 }}
            >
              K lower · Rb present (&lt;200)
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
