import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

export function CnRatio({ active }: { active: boolean }) {
  const [x, setX] = useState(80)
  const value = 4.9
  const maxVal = 10
  const x0 = 40
  const x1 = 620
  const target = x0 + (value / maxVal) * (x1 - x0)

  useEffect(() => {
    if (!active) {
      setX(x0)
      return
    }
    const t = requestAnimationFrame(() => setX(target))
    return () => cancelAnimationFrame(t)
  }, [active, target])

  return (
    <figure className={styles.figure} style={{ marginTop: 24 }}>
      <svg
        className={styles.chart}
        viewBox="0 0 760 140"
        role="img"
        aria-label="Number line showing the coating's carbon to nitrogen ratio of 4.9 to 1 within the biological range of 4 to 6"
      >
        <line x1={x0} y1="80" x2={x1} y2="80" className={styles.axis} />
        <rect
          x={x0 + (4 / maxVal) * (x1 - x0)}
          y="62"
          width={(2 / maxVal) * (x1 - x0)}
          height="36"
          fill="color-mix(in srgb, var(--color-accent) 16%, transparent)"
        />
        <text
          x={x0 + (5 / maxVal) * (x1 - x0)}
          y="52"
          textAnchor="middle"
          className={styles.label}
          fontSize="12"
        >
          biological range · 4–6 : 1
        </text>

        <g
          style={{
            transform: `translateX(${x}px)`,
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <line
            x1="0"
            y1="55"
            x2="0"
            y2="105"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="55" r="7" fill="var(--color-accent)" />
          <text
            x="0"
            y="40"
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            4.9 : 1 — the coating
          </text>
        </g>

        <text x={x0} y="118" fontSize="11" fill="currentColor" opacity="0.5">
          0
        </text>
        <text
          x={x1}
          y="118"
          textAnchor="end"
          fontSize="11"
          fill="currentColor"
          opacity="0.5"
        >
          10+
        </text>
        <line
          x1={x1}
          y1="80"
          x2="700"
          y2="80"
          className={styles.axis}
          strokeDasharray="4 6"
        />
        <text x="720" y="86" className={styles.label} fontSize="16">
          ∞
        </text>
        <text
          x="700"
          y="55"
          textAnchor="end"
          fontSize="11"
          fill="currentColor"
          opacity="0.5"
        >
          oxalic acid alone: no N
        </text>
      </svg>
    </figure>
  )
}
