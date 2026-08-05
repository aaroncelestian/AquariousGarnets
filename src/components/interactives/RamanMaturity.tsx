import { useEffect, useId, useMemo, useState } from 'react'
import styles from './Interactives.module.css'

/** Visual-aid only — not a real Raman calculation. */
const X_MIN = 1000
const X_MAX = 1800
const D_POS = 1350
const G_POS = 1580
const N = 120

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function gaussian(x: number, mu: number, sigma: number, amp: number) {
  if (amp <= 0 || sigma <= 0) return 0
  const z = (x - mu) / sigma
  return amp * Math.exp(-0.5 * z * z)
}

/** Stylized organic-carbon Raman intensity vs wavenumber at maturation t ∈ [0,1]. */
function intensityAt(x: number, t: number) {
  // Fresh: huge autofluorescence glow. Fades as carbon orders.
  const fluo =
    Math.pow(1 - t, 1.35) *
    (0.35 + 1.15 * Math.pow((x - X_MIN) / (X_MAX - X_MIN), 0.85))

  // D rises mid-path then shrinks toward graphite; G sharpens and stays.
  const dAmp = 0.15 + 1.05 * Math.sin(Math.PI * clamp01(t / 0.72)) * (1 - 0.75 * smoothstep(0.7, 1, t))
  const gAmp = lerp(0.05, 1.35, smoothstep(0.12, 0.95, t))
  const dSig = lerp(95, 14, Math.pow(t, 1.1))
  const gSig = lerp(80, 8, Math.pow(t, 1.15))

  const d = gaussian(x, D_POS, dSig, dAmp * smoothstep(0.08, 0.45, t))
  const g = gaussian(x, G_POS, gSig, gAmp * smoothstep(0.1, 0.5, t))

  // Tiny baseline wiggle so fresh spectrum isn't a dead line under the glow
  const noise = (1 - t) * 0.03 * Math.sin(x * 0.11)

  return fluo + d + g + noise
}

function stageFor(t: number) {
  if (t < 0.22) {
    return {
      name: 'Fresh organic',
      blurb: 'A flood of autofluorescence — the lattice isn’t ordered yet.',
    }
  }
  if (t < 0.48) {
    return {
      name: 'Early maturation',
      blurb: 'Fluorescence fades. Broad D and G humps begin to appear.',
    }
  }
  if (t < 0.72) {
    return {
      name: 'Disordered carbon',
      blurb: 'Clear but broad D (~1350) and G (~1580) — thermally immature.',
    }
  }
  if (t < 0.9) {
    return {
      name: 'Higher maturity',
      blurb: 'Bands sharpen. Heat has started to organize the carbon.',
    }
  }
  return {
    name: 'Graphite',
    blurb: 'A sharp G peak. High maturity — cooked hard.',
  }
}

const STAGES = [
  { at: 0, label: 'Fresh' },
  { at: 0.35, label: 'Broad D·G' },
  { at: 0.65, label: 'Sharper' },
  { at: 1, label: 'Graphite' },
]

export function RamanMaturity({ active }: { active: boolean }) {
  const [t, setT] = useState(0.55)
  const gradId = useId().replace(/:/g, '')

  useEffect(() => {
    if (active) setT(0.55)
  }, [active])

  const { path, maxY } = useMemo(() => {
    const xs = Array.from({ length: N }, (_, i) => X_MIN + (i / (N - 1)) * (X_MAX - X_MIN))
    const ys = xs.map((x) => intensityAt(x, t))
    const maxY = Math.max(0.8, ...ys) * 1.08
    return { path: { xs, ys }, maxY }
  }, [t])

  const plot = { x0: 56, y0: 52, x1: 520, y1: 248 }
  const xToPx = (x: number) =>
    plot.x0 + ((x - X_MIN) / (X_MAX - X_MIN)) * (plot.x1 - plot.x0)
  const yToPx = (y: number) =>
    plot.y1 - (y / maxY) * (plot.y1 - plot.y0)

  const dPath = path.xs
    .map((x, i) => {
      const cmd = i === 0 ? 'M' : 'L'
      return `${cmd}${xToPx(x).toFixed(1)},${yToPx(path.ys[i]).toFixed(1)}`
    })
    .join(' ')

  const areaPath = `${dPath} L${xToPx(X_MAX).toFixed(1)},${plot.y1} L${xToPx(X_MIN).toFixed(1)},${plot.y1} Z`

  const stage = stageFor(t)
  const bandOpacity = smoothstep(0.15, 0.4, t)
  // Show near Broad D·G only — hide at Sharper and beyond
  const showCoatingHint = t >= 0.28 && t < 0.55
  const dgMidX = (xToPx(D_POS) + xToPx(G_POS)) / 2

  return (
    <div className={styles.ramanMaturity}>
      <svg
        className={styles.chart}
        viewBox="0 0 560 320"
        role="img"
        aria-label={`Stylized Raman spectrum of organic carbon at ${stage.name}: ${stage.blurb}`}
      >
        <defs>
          <linearGradient id={`ramanFill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-accent)"
              stopOpacity={lerp(0.35, 0.2, t)}
            />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <text
          x={plot.x0 + 8}
          y={16}
          fontSize="12"
          fill="currentColor"
          opacity="0.55"
        >
          {stage.blurb}
        </text>
        <text
          x={plot.x0 + 8}
          y={34}
          className={styles.label}
          fontSize="14"
        >
          {stage.name}
        </text>

        <line
          x1={plot.x0}
          y1={plot.y0}
          x2={plot.x0}
          y2={plot.y1}
          className={styles.axis}
        />
        <line
          x1={plot.x0}
          y1={plot.y1}
          x2={plot.x1}
          y2={plot.y1}
          className={styles.axis}
        />

        <text
          x={plot.x0 - 8}
          y={plot.y0 + 4}
          textAnchor="end"
          fontSize="11"
          fill="currentColor"
          opacity="0.45"
        >
          I
        </text>
        <text
          x={(plot.x0 + plot.x1) / 2}
          y={plot.y1 + 28}
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          opacity="0.5"
        >
          Raman shift (cm⁻¹)
        </text>
        {[1000, 1200, 1400, 1600, 1800].map((tick) => (
          <text
            key={tick}
            x={xToPx(tick)}
            y={plot.y1 + 14}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            opacity="0.4"
          >
            {tick}
          </text>
        ))}

        <g opacity={bandOpacity}>
          <line
            x1={xToPx(D_POS)}
            y1={plot.y0 + 8}
            x2={xToPx(D_POS)}
            y2={plot.y1}
            stroke="var(--color-accent)"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1={xToPx(G_POS)}
            y1={plot.y0 + 8}
            x2={xToPx(G_POS)}
            y2={plot.y1}
            stroke="var(--color-accent)"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {showCoatingHint && (
            <text
              x={dgMidX}
              y={plot.y0 - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-accent)"
              opacity="0.85"
            >
              coating lives near here
            </text>
          )}
          <text
            x={xToPx(D_POS)}
            y={plot.y0 + 4}
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            D
          </text>
          <text
            x={xToPx(G_POS)}
            y={plot.y0 + 4}
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            G
          </text>
        </g>

        <path d={areaPath} fill={`url(#ramanFill-${gradId})`} />
        <path
          d={dPath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className={styles.ramanSliderWrap}>
        <label className={styles.ramanSliderLabel} htmlFor={`raman-mat-${gradId}`}>
          Thermal maturity
        </label>
        <input
          id={`raman-mat-${gradId}`}
          className={styles.ramanSlider}
          type="range"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-valuetext={stage.name}
        />
        <div className={styles.ramanTicks} aria-hidden>
          {STAGES.map((s) => (
            <button
              key={s.label}
              type="button"
              className={styles.ramanTick}
              data-active={Math.abs(t - s.at) < 0.12 ? 'true' : undefined}
              onClick={() => setT(s.at)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
