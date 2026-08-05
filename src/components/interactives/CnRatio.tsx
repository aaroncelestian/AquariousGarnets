import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

/** EDS atomic C:N of the coating sits in the ~4–5 microbial / fresh-residue band. */
const COATING = 4.9
const BIO_CENTER = 4.5
const BIO_LO = 4.0
const BIO_HI = 5.0
const MAX_VAL = 10
const VIEW_W = 760
const X0 = 40
const X1 = 620

function xAt(value: number) {
  return X0 + (value / MAX_VAL) * (X1 - X0)
}

export function CnRatio({ active }: { active: boolean }) {
  const [x, setX] = useState(xAt(0))
  const target = xAt(COATING)
  const bioLo = xAt(BIO_LO)
  const bioHi = xAt(BIO_HI)
  const bioMid = xAt(BIO_CENTER)

  useEffect(() => {
    if (!active) {
      setX(xAt(0))
      return
    }
    const t = requestAnimationFrame(() => setX(target))
    return () => cancelAnimationFrame(t)
  }, [active, target])

  // Percent of viewBox so CSS transform tracks scale (px would pin the marker wrong).
  const xPct = (x / VIEW_W) * 100

  return (
    <figure className={styles.figure} style={{ marginTop: 24 }}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${VIEW_W} 150`}
        role="img"
        aria-label={`Number line: coating carbon to nitrogen ratio ${COATING} to 1, inside the microbial and fresh-residue range of about 4 to 5 to 1`}
      >
        <line x1={X0} y1="88" x2={X1} y2="88" className={styles.axis} />

        <rect
          x={bioLo}
          y="70"
          width={bioHi - bioLo}
          height="36"
          fill="color-mix(in srgb, var(--color-accent) 16%, transparent)"
        />
        <line
          x1={bioMid}
          y1="70"
          x2={bioMid}
          y2="106"
          stroke="var(--color-accent)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text
          x={bioMid}
          y="22"
          textAnchor="middle"
          className={styles.label}
          fontSize="12"
        >
          microbes / fresh residue · 4–5 : 1
        </text>

        <g
          style={{
            transformBox: 'view-box',
            transformOrigin: '0px 0px',
            transform: `translate(${xPct}%, 0)`,
            transition: active
              ? 'transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)'
              : 'none',
          }}
        >
          <line
            x1="0"
            y1="62"
            x2="0"
            y2="114"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="62" r="7" fill="var(--color-accent)" />
          <text
            x="0"
            y="40"
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            {COATING} : 1 — the coating
          </text>
        </g>

        <text x={X0} y="132" fontSize="11" fill="currentColor" opacity="0.5">
          0
        </text>
        <text
          x={X1}
          y="132"
          textAnchor="end"
          fontSize="11"
          fill="currentColor"
          opacity="0.5"
        >
          10+
        </text>
        <line
          x1={X1}
          y1="88"
          x2="700"
          y2="88"
          className={styles.axis}
          strokeDasharray="4 6"
        />
        <text x="720" y="94" className={styles.label} fontSize="16">
          ∞
        </text>
        <text
          x="700"
          y="62"
          textAnchor="end"
          fontSize="11"
          fill="currentColor"
          opacity="0.5"
        >
          aged organics → higher C:N
        </text>
      </svg>
    </figure>
  )
}
