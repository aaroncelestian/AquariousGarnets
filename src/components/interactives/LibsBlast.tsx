import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

const ELEMENTS = ['C', 'Fe', 'Mn', 'Si', 'Al', 'Ca', 'O', 'Mg', 'Cr', 'Zn']

export function LibsBlast({ active }: { active: boolean }) {
  const [fired, setFired] = useState(false)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (!active) {
      setFired(false)
      setPulse(0)
      return
    }
    // Soft idle pulse on the beam so the slide feels alive before firing
    const id = window.setInterval(() => setPulse((p) => p + 1), 2200)
    return () => window.clearInterval(id)
  }, [active])

  const fire = () => {
    setFired(false)
    // retrigger CSS animations
    requestAnimationFrame(() => setFired(true))
  }

  useEffect(() => {
    if (active) {
      const t = window.setTimeout(fire, 700)
      return () => window.clearTimeout(t)
    }
  }, [active])

  return (
    <div className={styles.libsScene}>
      <svg
        className={styles.chart}
        viewBox="0 0 560 360"
        role="img"
        aria-label="Laser-induced breakdown spectroscopy: a pulsed laser ablates the surface and reads a near-complete elemental suite from the plasma"
      >
        {/* Stage / crystal block */}
        <defs>
          <linearGradient id="libsCrystal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3533" />
            <stop offset="55%" stopColor="#1f1c1b" />
            <stop offset="100%" stopColor="#121010" />
          </linearGradient>
          <linearGradient id="libsCoat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a6b4a" />
            <stop offset="100%" stopColor="#2f3a28" />
          </linearGradient>
          <radialGradient id="libsPlasma" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6e8" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffb347" stopOpacity="0.95" />
            <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="libsGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Workbench shadow */}
        <ellipse cx="280" cy="318" rx="160" ry="14" fill="currentColor" opacity="0.08" />

        {/* Crystal body */}
        <g transform="translate(140 150)">
          <path
            d="M40 20 L220 20 L250 55 L220 140 L40 140 L10 55 Z"
            fill="url(#libsCrystal)"
          />
          {/* Specular facet */}
          <path
            d="M40 20 L120 20 L100 55 L10 55 Z"
            fill="#fff"
            opacity="0.08"
          />
          {/* Coating film — exaggerated for visibility */}
          <path
            d="M40 20 L220 20 L250 55 L220 68 L40 68 L10 55 Z"
            fill="url(#libsCoat)"
            opacity="0.92"
          />
          <text
            x="130"
            y="110"
            textAnchor="middle"
            fontSize="13"
            fill="#f3f2f2"
            opacity="0.7"
          >
            coated garnet
          </text>
        </g>

        {/* Scale callout — µm, not nm: LIBS ablates a microscopic pit */}
        <g transform="translate(28 248)">
          <rect
            width="132"
            height="64"
            fill="color-mix(in srgb, var(--color-bg) 88%, transparent)"
            stroke="var(--color-divider)"
            strokeWidth="1"
          />
          <text x="12" y="22" fontSize="11" className={styles.label} fill="currentColor">
            Sampling depth
          </text>
          <line
            x1="12"
            y1="36"
            x2="100"
            y2="36"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
          />
          <line x1="12" y1="30" x2="12" y2="42" stroke="var(--color-accent)" strokeWidth="2" />
          <line x1="100" y1="30" x2="100" y2="42" stroke="var(--color-accent)" strokeWidth="2" />
          <text x="12" y="56" fontSize="12" fill="var(--color-accent)" fontWeight="700">
            ~few μm / pulse
          </text>
        </g>

        {/* Element suite callout */}
        <g transform="translate(400 248)">
          <rect
            width="140"
            height="64"
            fill="color-mix(in srgb, var(--color-bg) 88%, transparent)"
            stroke="var(--color-divider)"
            strokeWidth="1"
          />
          <text x="12" y="22" fontSize="11" className={styles.label} fill="currentColor">
            Near-full suite
          </text>
          <text x="12" y="44" fontSize="12" fill="currentColor" opacity="0.65">
            light → heavy
          </text>
          <text x="12" y="58" fontSize="11" fill="var(--color-accent)">
            in one plasma flash
          </text>
        </g>

        {/* Laser housing */}
        <g transform="translate(390 36)">
          <rect
            x="0"
            y="0"
            width="72"
            height="28"
            fill="var(--color-neutral-700)"
          />
          <rect x="8" y="6" width="16" height="16" fill="var(--color-accent)" opacity="0.85" />
          <text x="36" y="18" fontSize="10" fill="#f3f2f2" opacity="0.8">
            LIBS
          </text>
        </g>

        {/* Beam */}
        <g
          className={styles.libsBeam}
          data-idle={active && !fired ? String(pulse % 2) : undefined}
          data-fired={fired ? 'true' : undefined}
        >
          <line
            x1="420"
            y1="64"
            x2="268"
            y2="178"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />
          <line
            x1="420"
            y1="64"
            x2="268"
            y2="178"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>

        {/* Impact / plasma */}
        <g
          className={styles.libsPlasma}
          data-fired={fired ? 'true' : undefined}
          transform="translate(268 178)"
          filter="url(#libsGlow)"
        >
          <circle r="28" fill="url(#libsPlasma)" />
          <circle r="6" fill="#fff" opacity="0.95" />
          {/* Ejecta streaks */}
          {[
            [-28, -22],
            [-12, -34],
            [8, -32],
            [24, -18],
            [-22, 6],
            [26, 4],
          ].map(([x, y], i) => (
            <line
              key={i}
              className={styles.libsEjecta}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#ffd39a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Flying element chips */}
        <g className={styles.libsElements} data-fired={fired ? 'true' : undefined}>
          {ELEMENTS.map((el, i) => {
            const angle = -110 + i * 18
            const rad = (angle * Math.PI) / 180
            const dist = 70 + (i % 3) * 18
            const x = 268 + Math.cos(rad) * dist
            const y = 178 + Math.sin(rad) * dist * 0.75
            return (
              <g key={el} transform={`translate(${x} ${y})`}>
                <g
                  className={styles.libsElement}
                  style={{ ['--i' as string]: String(i) }}
                >
                  <circle
                    r="11"
                    fill="var(--color-bg)"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    fontSize="10"
                    fontWeight="700"
                    fill="var(--color-accent)"
                  >
                    {el}
                  </text>
                </g>
              </g>
            )
          })}
        </g>
      </svg>

      <div className={styles.libsControls}>
        <button type="button" className="btn btn-primary" onClick={fire}>
          Fire laser pulse
        </button>
      </div>
    </div>
  )
}
