import { useEffect, useState, type CSSProperties } from 'react'
import styles from './Interactives.module.css'

type Band = 'g' | 'd' | 'both'

const CAPTIONS: Record<Band, string> = {
  g: 'G band · ~1580 cm⁻¹ — in-plane C═C stretch in aromatic rings',
  d: 'D band · ~1350 cm⁻¹ — ring breathing, only when the lattice is disordered',
  both: 'Strong D over G → disordered, thermally immature organic carbon',
}

/** Flat-top hexagon vertices, radius R, centered at origin. */
function hexVertices(R: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (30 + i * 60)
    return { x: R * Math.cos(a), y: R * Math.sin(a) }
  })
}

const R = 54
const VERTS = hexVertices(R)

function Ring({
  cx,
  cy,
  mode,
  active,
}: {
  cx: number
  cy: number
  mode: Band
  active: boolean
}) {
  const play = active && mode !== 'both' ? mode : active && mode === 'both' ? 'both' : 'off'
  const path = VERTS.map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`).join(' ') + ' Z'

  return (
    <g transform={`translate(${cx} ${cy})`} data-vib={play}>
      <path d={path} className={styles.ramanBond} />
      {VERTS.map((v, i) => {
        // G (E₂g-like): two sublattices slide against each other → C═C stretch
        const sign = i % 2 === 0 ? 1 : -1
        return (
          <g key={i} transform={`translate(${v.x} ${v.y})`}>
            <g
              className={styles.ramanAtom}
              style={
                {
                  '--ox': `${(v.x / R) * 10}px`,
                  '--oy': `${(v.y / R) * 10}px`,
                  '--gx': `${sign * 8}px`,
                  '--gy': `${sign * 2}px`,
                } as CSSProperties
              }
            >
              <circle r="9" className={styles.ramanCarbon} />
              <text y="3.5" textAnchor="middle" className={styles.ramanCLabel}>
                C
              </text>
            </g>
          </g>
        )
      })}
      {/* Motion cues */}
      {play === 'g' || play === 'both' ? (
        <g className={styles.ramanCue} aria-hidden>
          {VERTS.map((v, i) => {
            const n = VERTS[(i + 1) % 6]
            const mx = (v.x + n.x) / 2
            const my = (v.y + n.y) / 2
            const dx = n.x - v.x
            const dy = n.y - v.y
            const len = Math.hypot(dx, dy)
            const ux = (dx / len) * 11
            const uy = (dy / len) * 11
            return (
              <g key={`g-${i}`} className={styles.ramanStretchCue}>
                <line
                  x1={mx - ux}
                  y1={my - uy}
                  x2={mx + ux}
                  y2={my + uy}
                  className={styles.ramanArrow}
                />
              </g>
            )
          })}
        </g>
      ) : null}
      {play === 'd' || play === 'both' ? (
        <g className={styles.ramanCue} aria-hidden>
          {VERTS.map((v, i) => {
            const ux = (v.x / R) * 18
            const uy = (v.y / R) * 18
            return (
              <line
                key={`d-${i}`}
                x1={v.x * 0.55}
                y1={v.y * 0.55}
                x2={v.x * 0.55 + ux * 0.55}
                y2={v.y * 0.55 + uy * 0.55}
                className={`${styles.ramanArrow} ${styles.ramanBreathCue}`}
              />
            )
          })}
        </g>
      ) : null}
    </g>
  )
}

/** Stylized disordered-carbon Raman envelope: tall D, shorter G. */
function spectrumPath(highlight: Band | 'off') {
  // viewBox region for spectrum: x 40–400, y baseline 268, peak height up
  const pts: [number, number][] = []
  for (let x = 40; x <= 400; x += 2) {
    const cm = 1000 + ((x - 40) / 360) * 800 // 1000–1800 cm⁻¹
    const d = 78 * Math.exp(-0.5 * ((cm - 1350) / 48) ** 2)
    const g = 48 * Math.exp(-0.5 * ((cm - 1580) / 42) ** 2)
    const muteD = highlight === 'g' ? 0.22 : 1
    const muteG = highlight === 'd' ? 0.22 : 1
    const y = 268 - (d * muteD + g * muteG)
    pts.push([x, y])
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
}

export function RamanBands({ active }: { active: boolean }) {
  const [band, setBand] = useState<Band>('g')

  useEffect(() => {
    if (active) setBand('g')
  }, [active])

  const highlight = active ? band : 'off'
  const dX = 40 + ((1350 - 1000) / 800) * 360
  const gX = 40 + ((1580 - 1000) / 800) * 360

  return (
    <div className={styles.raman}>
      <div className={styles.toggle} role="group" aria-label="Select Raman band">
        {(
          [
            ['g', 'G band'],
            ['d', 'D band'],
            ['both', 'D + G'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="btn"
            aria-pressed={band === id}
            onClick={() => setBand(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <svg
        className={styles.chart}
        viewBox="0 0 440 320"
        role="img"
        aria-label={CAPTIONS[band]}
      >
        <text x="220" y="22" textAnchor="middle" className={styles.label} fontSize="13">
          aromatic carbon · molecular motion
        </text>

        <Ring cx={220} cy={108} mode={band} active={active} />

        {/* Spectrum */}
        <text x="40" y="198" className={styles.label} fontSize="12">
          Raman intensity
        </text>
        <line x1="40" y1="268" x2="400" y2="268" className={styles.axis} />
        <line x1="40" y1="210" x2="40" y2="268" className={styles.axis} />

        <path
          d={spectrumPath(highlight === 'off' ? 'both' : highlight)}
          className={styles.ramanSpectrum}
          fill="none"
        />

        <g opacity={highlight === 'd' || highlight === 'both' || highlight === 'off' ? 1 : 0.35}>
          <line
            x1={dX}
            y1="212"
            x2={dX}
            y2="268"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.55"
          />
          <text
            x={dX}
            y="286"
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            D
          </text>
          <text
            x={dX}
            y="302"
            textAnchor="middle"
            className={styles.label}
            fontSize="11"
            opacity="0.65"
          >
            ~1350
          </text>
        </g>

        <g opacity={highlight === 'g' || highlight === 'both' || highlight === 'off' ? 1 : 0.35}>
          <line
            x1={gX}
            y1="228"
            x2={gX}
            y2="268"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.55"
          />
          <text
            x={gX}
            y="286"
            textAnchor="middle"
            className={styles.labelHi}
            fontSize="13"
          >
            G
          </text>
          <text
            x={gX}
            y="302"
            textAnchor="middle"
            className={styles.label}
            fontSize="11"
            opacity="0.65"
          >
            ~1580
          </text>
        </g>

        <text
          x="400"
          y="286"
          textAnchor="end"
          className={styles.label}
          fontSize="11"
          opacity="0.5"
        >
          cm⁻¹
        </text>
      </svg>

      <p className={styles.ramanCaption}>{CAPTIONS[band]}</p>
    </div>
  )
}
