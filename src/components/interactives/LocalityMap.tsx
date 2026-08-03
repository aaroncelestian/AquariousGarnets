import styles from './Interactives.module.css'

export function LocalityMap({ active }: { active: boolean }) {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox="0 0 900 420"
        role="img"
        aria-label="Schematic map of Arizona showing the Aquarius Mountains on the Colorado Plateau / Basin and Range boundary"
      >
        <rect
          x="20"
          y="20"
          width="620"
          height="220"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
        />
        <line
          x1="20"
          y1="120"
          x2="640"
          y2="120"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeDasharray="8 8"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`p-${i}`}
            x1="40"
            x2={600 - (i % 3) * 30}
            y1={40 + i * 14}
            y2={42 + i * 14}
            stroke="currentColor"
            strokeOpacity="0.2"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`b-${i}`}
            x1={50 + i * 80}
            x2={70 + i * 80}
            y1={170 + (i % 2) * 16}
            y2={155 + (i % 2) * 16}
            stroke="currentColor"
            strokeOpacity="0.25"
          />
        ))}
        <text x="660" y="70" className={styles.label}>
          Colorado Plateau
        </text>
        <text x="660" y="190" className={styles.label}>
          Basin and Range
        </text>
        <circle
          cx="230"
          cy="116"
          r="14"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          className={active ? styles.pulse : undefined}
        />
        <rect x="222" y="108" width="16" height="16" fill="var(--color-accent)" />
        <text x="250" y="98" className={styles.labelHi}>
          Aquarius Mountains
        </text>
        <text x="250" y="148" fontSize="12" fill="currentColor" opacity="0.55">
          Mohave County, Arizona
        </text>

        <text x="20" y="280" className={styles.label} fontSize="12">
          Elevation across the transition (schematic)
        </text>
        <line
          x1="20"
          y1="380"
          x2="640"
          y2="380"
          stroke="currentColor"
          strokeOpacity="0.3"
        />
        <path
          d="M 20 320 C 120 320, 180 328, 230 340 C 290 354, 320 368, 370 374 C 450 382, 520 380, 640 380"
          fill="none"
          stroke="var(--color-neutral-800)"
          strokeWidth="2.5"
          className={active ? styles.drawPath : undefined}
          pathLength={1}
        />
        <circle
          cx="238"
          cy="342"
          r="5"
          fill="var(--color-accent)"
          className={active ? styles.pinIn : undefined}
        />
        <text x="40" y="310" fontSize="11" fill="currentColor" opacity="0.55">
          ~2,200 m · plateau rim
        </text>
        <text x="500" y="368" fontSize="11" fill="currentColor" opacity="0.55">
          ~800 m · basin floor
        </text>
        <text x="252" y="348" className={styles.labelHi} fontSize="11">
          garnets found here
        </text>
      </svg>
    </figure>
  )
}
