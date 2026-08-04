import { useEffect, useState } from 'react'
import styles from './Interactives.module.css'

const STEPS = [
  {
    label: 'Crystal',
    caption: 'A coated garnet — film too thin to see at this distance.',
    cta: 'Zoom to the surface →',
  },
  {
    label: 'Surface',
    caption: 'Cross-section: carbon film over hematite over garnet.',
    cta: 'Fire the laser →',
  },
  {
    label: 'Blast',
    caption: 'The pulse doesn’t just vaporize — it pries the stack apart.',
    cta: 'Watch it delaminate →',
  },
  {
    label: 'Peel',
    caption: 'Organic carbon lifts. Then hematite. Garnet stays.',
    cta: 'Replay ↻',
  },
] as const

export function LibsPeel({ active }: { active: boolean }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const next = () => setStep((s) => (s >= STEPS.length - 1 ? 0 : s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  // Peel offsets after blast
  const peel = step >= 3
  const carbonDy = peel ? -52 : 0
  const hematiteDy = peel ? -26 : 0
  const carbonRot = peel ? -6 : 0
  const hematiteRot = peel ? -3 : 0

  return (
    <div className={styles.libsScene}>
      <div className={styles.libsViewport} data-step={step}>
        <svg
          className={styles.libsZoomSvg}
          viewBox="0 0 560 340"
          role="img"
          aria-label={STEPS[step].caption}
        >
          <defs>
            <linearGradient id="lzGarnet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a4543" />
              <stop offset="100%" stopColor="#1a1716" />
            </linearGradient>
            <linearGradient id="lzCoat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6a7a55" />
              <stop offset="100%" stopColor="#3d4a32" />
            </linearGradient>
            <radialGradient id="lzFlash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="40%" stopColor="#ffb347" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="lzClip">
              <rect x="0" y="0" width="560" height="340" />
            </clipPath>
          </defs>

          <g clipPath="url(#lzClip)">
            {/* Camera: scale/translate driven by data-step on parent via CSS… 
                Also apply inline for reliable SVG transforms */}
            <g
              className={styles.libsCamera}
              style={{
                transformOrigin: '280px 200px',
                transform:
                  step === 0
                    ? 'translate(0px, 10px) scale(0.72)'
                    : step === 1
                      ? 'translate(0px, -36px) scale(1.55)'
                      : 'translate(0px, -48px) scale(1.85)',
              }}
            >
              {/* Far crystal silhouette (visible mainly at step 0) */}
              <g className={styles.libsFarCrystal} opacity={step === 0 ? 1 : 0.15}>
                <path
                  d="M180 90 L380 90 L420 150 L380 260 L180 260 L140 150 Z"
                  fill="url(#lzGarnet)"
                />
                <path
                  d="M180 90 L380 90 L420 150 L380 168 L180 168 L140 150 Z"
                  fill="url(#lzCoat)"
                />
                <text
                  x="280"
                  y="220"
                  textAnchor="middle"
                  fontSize="16"
                  fill="#f3f2f2"
                  opacity="0.75"
                >
                  coated garnet
                </text>
              </g>

              {/* Cross-section stack — becomes the hero after zoom */}
              <g
                className={styles.libsStack}
                style={{ opacity: step === 0 ? 0 : 1 }}
                transform="translate(110 120)"
              >
                {/* Scale bar for layers */}
                <g opacity={step >= 1 ? 1 : 0} transform="translate(-70 40)">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="120"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                  />
                  <text
                    x="-10"
                    y="60"
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--color-accent)"
                    transform="rotate(-90 -10 60)"
                  >
                    nm–μm film
                  </text>
                </g>

                {/* Garnet substrate */}
                <rect
                  x="0"
                  y="100"
                  width="340"
                  height="110"
                  fill="url(#lzGarnet)"
                />
                <text
                  x="170"
                  y="138"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="15"
                  fill="#f3f2f2"
                  opacity="0.85"
                >
                  almandine garnet
                </text>

                {/* Hematite */}
                <g
                  className={styles.libsLayer}
                  style={{
                    transform: `translate(0px, ${hematiteDy}px) rotate(${hematiteRot}deg)`,
                    transformOrigin: '170px 88px',
                  }}
                >
                  <rect x="0" y="64" width="340" height="36" fill="var(--color-accent-2)" />
                  <text
                    x="170"
                    y="88"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#f3f2f2"
                    fontWeight="600"
                  >
                    hematite
                  </text>
                </g>

                {/* Organic carbon */}
                <g
                  className={styles.libsLayer}
                  style={{
                    transform: `translate(0px, ${carbonDy}px) rotate(${carbonRot}deg)`,
                    transformOrigin: '170px 46px',
                  }}
                >
                  <rect x="0" y="28" width="340" height="36" fill="var(--color-neutral-800)" />
                  <text
                    x="170"
                    y="52"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#f3f2f2"
                    fontWeight="600"
                  >
                    organic carbon
                  </text>
                </g>

                {/* Top edge highlight */}
                <rect
                  x="0"
                  y="28"
                  width="340"
                  height="3"
                  fill="#9aaf7a"
                  opacity={peel ? 0 : 0.5}
                />
              </g>

              {/* Laser + blast — only on the blast step, not during peel */}
              <g opacity={step === 2 ? 1 : 0} style={{ pointerEvents: 'none' }}>
                <line
                  x1="420"
                  y1="40"
                  x2="290"
                  y2="150"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <line
                  x1="420"
                  y1="40"
                  x2="290"
                  y2="150"
                  stroke="#fff"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <g transform="translate(290 150)">
                  <g
                    className={styles.libsPlasma}
                    data-fired={step === 2 ? 'true' : undefined}
                  >
                    <circle r={36} fill="url(#lzFlash)" />
                  </g>
                </g>
              </g>
            </g>
          </g>

        </svg>
      </div>

      <p className={styles.libsCaption}>{STEPS[step].caption}</p>

      <div className={styles.libsControls}>
        <button
          type="button"
          className="btn"
          aria-label="Previous step"
          disabled={step === 0}
          onClick={back}
        >
          ←
        </button>
        <span className={styles.stepLabel}>
          {STEPS[step].label} · {step + 1}/{STEPS.length}
        </span>
        <button type="button" className="btn btn-primary" onClick={next}>
          {STEPS[step].cta}
        </button>
      </div>
    </div>
  )
}
