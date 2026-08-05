import styles from './Interactives.module.css'
import { asset } from '../../lib/asset'

/**
 * Approach transect (park → garnets → cliff → plateau), from Google Earth path stats.
 * Elevations converted to feet: park ~3,330 ft, garnets ~4,173 ft, plateau ~4,790 ft.
 * Cliff begins ~200 ft past the garnet horizon.
 */
const ELEV = [
  [0.0, 3330], // park
  [0.12, 3396],
  [0.22, 3510],
  [0.32, 3658],
  [0.42, 3806],
  [0.52, 3953],
  [0.62, 4085],
  [0.72, 4173], // garnets
  [0.78, 4205], // ~200 ft past garnets — cliff toe
  [0.81, 4480], // cliff face (~275 ft rise)
  [0.86, 4585], // sloping plateau begins
  [0.93, 4705],
  [1.0, 4787], // plateau crest
] as const

/** Indices that should stay sharp (no bezier rounding) — cliff face. */
const SHARP_AFTER = new Set([8]) // segment garnet-toe → cliff top

const X0 = 64
const X1 = 530
const Y_TOP = 36
const Y_BOT = 168
const E_MAX = 4850
const E_MIN = 3250
const VIEW_H = 220

function xAt(t: number) {
  return X0 + t * (X1 - X0)
}

function yAt(elev: number) {
  return Y_TOP + ((E_MAX - elev) / (E_MAX - E_MIN)) * (Y_BOT - Y_TOP)
}

function profilePathFrom(points: readonly (readonly [number, number])[]) {
  if (points.length < 2) return ''
  const pts = points.map(([t, e]) => [xAt(t), yAt(e)] as const)
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    if (SHARP_AFTER.has(i - 1)) {
      d += ` L ${x1.toFixed(1)} ${y1.toFixed(1)}`
      continue
    }
    const c1x = x0 + (x1 - x0) * 0.45
    const c2x = x0 + (x1 - x0) * 0.55
    d += ` C ${c1x.toFixed(1)} ${y0.toFixed(1)}, ${c2x.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return d
}

const profilePath = profilePathFrom(ELEV)
const park = ELEV[0]
const garnet = ELEV[7]
const cliffToe = ELEV[8]
const cliffTop = ELEV[9]
const ridge = ELEV[ELEV.length - 1]

export function LocalityMap({ active }: { active: boolean }) {
  const px = xAt(park[0])
  const py = yAt(park[1])
  const gx = xAt(garnet[0])
  const gy = yAt(garnet[1])
  const cx = (xAt(cliffToe[0]) + xAt(cliffTop[0])) / 2
  const cy = (yAt(cliffToe[1]) + yAt(cliffTop[1])) / 2
  const plateauX = xAt(0.93)
  const plateauY = yAt(4705)
  const rx = xAt(ridge[0])

  return (
    <figure className={`${styles.figure} ${styles.locality}`}>
      <div className={styles.mapFrame}>
        <div className={styles.mapStage}>
          <img
            src={asset('images/aquarius-aerial.jpg')}
            alt="Aerial view of Elephant Butte in the Aquarius Mountains, with the orange garnet-producing layer in the rhyolite cliffs"
          />

          <svg
            className={styles.mapAnnot}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className={active ? styles.approachWalk : styles.approachIdle}
              d="M 59 87 C 58 80, 57 74, 50 71 C 44 69, 39 69, 35 71"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeDasharray="2.5 6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="59"
              cy="87"
              r="6"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="35"
              cy="71"
              r="4.5"
              fill="var(--color-accent)"
              className={active ? styles.mapPinPulse : undefined}
            />
          </svg>

          <div className={styles.mapTagPark}>Park</div>
          <div className={styles.mapTagGarnet}>Garnets</div>
          <div className={styles.mapCaption}>
            Elephant Butte · Aquarius Mountains, AZ
          </div>
        </div>
      </div>

      <svg
        className={styles.elevChart}
        viewBox={`0 0 560 ${VIEW_H}`}
        role="img"
        aria-label="Elevation profile from the parking area past the garnet layer to a cliff and sloping plateau, in feet."
      >
        <text x={X1} y="16" textAnchor="end" fontSize="12" fill="currentColor" opacity="0.5">
          Δ ≈ 1,460 ft · cliff ~200 ft past
        </text>

        <path
          d={`${profilePath} L ${rx.toFixed(1)} ${Y_BOT} L ${px.toFixed(1)} ${Y_BOT} Z`}
          fill="var(--color-accent)"
          fillOpacity="0.08"
        />

        <line
          x1={X0}
          y1={Y_BOT}
          x2={X1}
          y2={Y_BOT}
          stroke="currentColor"
          strokeOpacity="0.3"
        />

        <path
          d={profilePath}
          fill="none"
          stroke="var(--color-neutral-800)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={active ? styles.drawPath : undefined}
          pathLength={1}
        />

        <circle cx={px} cy={py} r="4.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
        <text x={px} y={py - 12} textAnchor="middle" className={styles.labelHi} fontSize="13">
          park · 3,330 ft
        </text>

        <circle
          cx={gx}
          cy={gy}
          r="5"
          fill="var(--color-accent)"
          className={active ? styles.pinIn : undefined}
        />
        <text x={gx} y={gy - 12} textAnchor="middle" className={styles.labelHi} fontSize="13">
          garnets · 4,170 ft
        </text>

        <text
          x={cx + 10}
          y={cy}
          textAnchor="start"
          fontSize="11"
          fill="currentColor"
          opacity="0.55"
        >
          cliff
        </text>
        <text
          x={plateauX}
          y={plateauY - 10}
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          opacity="0.55"
        >
          sloping plateau
        </text>

        {/* Station labels below the baseline — keep clear of the slide edge */}
        {(
          [
            [park[0], 'Park'],
            [garnet[0], 'Garnets'],
            [(cliffToe[0] + cliffTop[0]) / 2, 'Cliff'],
            [0.93, 'Plateau'],
          ] as const
        ).map(([t, label]) => (
          <text
            key={label}
            x={xAt(t)}
            y={Y_BOT + 22}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            opacity="0.62"
          >
            {label}
          </text>
        ))}
      </svg>
    </figure>
  )
}
