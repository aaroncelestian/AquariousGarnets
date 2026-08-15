import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'
import { asset } from '../../lib/asset'

/**
 * Click-through crop of the full Raman spectrum (top panel only).
 * Overlay paths are in a 1000×1000 viewBox mapped to the image.
 */

const GARNET_PATH =
  'M49.7 823.7 L53.8 821.3 L58.8 818.7 L63.7 816.2 L68.6 815.6 L81.8 803.4 L86.7 804.9 L91.7 814.6 L102.3 817.8 L107.3 803.3 L112.2 796.9 L117.1 806.7 L122.1 818.1 L134.4 821.6 L139.3 820.9 L144.3 819.9 L149.2 818.7 L165.6 799.9 L170.6 786.9 L175.5 747.1 L180.4 704.0 L185.4 714.2 L190.3 759.8 L195.2 783.6 L200.2 798.7 L205.1 814.8 L218.2 824.8 L223.2 825.2 L228.1 825.6 L233.0 826.0 L238.0 826.1 L261.0 800.6 L265.9 793.8 L270.9 796.7 L287.3 798.2 L292.2 788.3 L297.2 793.7 L302.1 811.0 L314.4 825.6 L327.6 820.2 L332.5 811.0 L337.4 804.3 L342.4 807.2 L347.3 815.4 L364.6 833.0 L369.5 833.4 L374.4 832.1 L379.4 831.5'

const HEMATITE_PATH =
  'M50.6 719.2 L62.9 686.6 L67.8 682.9 L71.9 680.3 L84.3 711.2 L89.2 714.4 L93.3 720.4 L104.8 703.5 L108.9 646.3 L113.9 579.9 L118.8 564.6 L122.9 595.1 L127.8 623.1 L132.8 670.8 L136.9 701.9 L145.1 681.8 L149.2 650.1 L154.1 633.7 L159.1 652.9 L163.2 684.4 L172.2 691.6 L176.3 665.6 L181.3 642.8 L186.2 651.7 L190.3 674.4 L205.1 667.5 L210.0 593.4 L214.1 514.3 L219.1 512.8 L223.2 591.0 L228.1 675.9 L233.0 703.3 L242.9 707.4 L256.1 687.1 L261.0 662.6 L265.1 650.0 L270.0 653.4 L274.1 671.5 L285.7 687.1 L290.6 684.8 L294.7 685.5 L299.6 689.6 L303.7 693.6 L314.4 688.4 L319.4 667.8 L323.5 642.5 L328.4 626.3 L333.3 638.5 L337.4 654.0 L344.8 649.1 L349.0 635.5 L353.9 628.8 L358.8 647.1 L362.9 665.3 L367.9 687.5 L379.4 702.8'

/** Sharp ~1320 cm⁻¹ second-order Fe (hematite) hitch on spot 1. */
const FE_HITCH_PATH =
  'M701.2 431.9 L702.0 423.5 L702.8 415.5 L703.7 406.1 L704.9 393.1 L705.7 382.4 L706.5 369.3 L707.8 351.7 L708.6 338.0 L709.4 327.1 L710.2 322.1 L711.5 315.9 L712.3 314.0 L713.1 311.2 L714.3 309.5 L716.0 308.2 L716.8 309.8 L718.0 317.7 L718.9 321.8 L719.7 329.0 L720.5 337.7 L721.7 352.4 L722.6 364.6 L723.4 377.2 L724.6 391.3 L725.4 402.1 L726.3 415.5 L727.5 432.3'

/** Top gold/brown coating spectrum — organic D and G bands. */
const ORGANIC_PATH =
  'M579.9 462.7 L585.7 464.4 L597.2 475.2 L609.5 434.6 L616.9 437.6 L624.3 427.2 L631.7 407.6 L638.3 407.6 L645.7 395.9 L651.5 375.6 L657.2 365.2 L663.8 347.3 L669.5 335.9 L676.1 331.9 L681.9 329.3 L687.6 324.7 L694.2 303.9 L700.0 271.9 L706.5 251.0 L712.3 229.1 L718.0 219.5 L724.6 219.3 L732.0 217.5 L737.8 244.7 L744.3 261.3 L750.1 277.8 L756.7 295.7 L762.4 292.2 L768.2 302.6 L778.1 342.2 L791.2 331.3 L800.2 347.7 L822.4 310.0 L828.2 298.4 L834.8 283.2 L840.5 260.8 L847.1 228.0 L852.9 225.3 L858.6 212.6 L867.7 225.6 L873.4 233.1 L879.2 279.8 L885.7 344.1 L891.5 392.7 L898.1 433.1 L903.8 465.5 L909.6 505.8 L916.2 522.4 L921.9 514.8 L928.5 523.8 L934.2 537.7 L940.0 557.6 L946.6 578.9 L953.1 596.2 L969.6 611.0'

const LOW_WN = { scale: 2.45, origin: '22% 42%' } as const
const FE_WN = { scale: 2.55, origin: '71% 38%' } as const
const CARBON_WN = { scale: 2.35, origin: '84% 36%' } as const

/** Camera moves must animate origin as well as scale — origin-only jumps feel like a snap. */
const CAMERA_EASE = 'cubic-bezier(0.4, 0.05, 0.15, 1)'
const EASE_ZOOM = `transform 1.55s ${CAMERA_EASE}, transform-origin 1.55s ${CAMERA_EASE}`
const EASE_PAN = `transform 2.7s ${CAMERA_EASE}, transform-origin 2.7s ${CAMERA_EASE}`
const EASE_OUT = `transform 2.2s ${CAMERA_EASE}, transform-origin 2.2s ${CAMERA_EASE}`

const STEPS = [
  {
    id: 'full',
    label: 'Full',
    caption: 'Full spectrum — hematite on the left, organic carbon on the right.',
    cta: 'Tap to zoom → low wavenumber',
    scale: 1,
    origin: '50% 48%',
    transition: EASE_OUT,
    showGarnet: false,
    showHematite: false,
    showFe: false,
    showOrganic: false,
  },
  {
    id: 'zoom',
    label: 'Zoom',
    caption: 'Low wavenumber — first the substrate, then the coating.',
    cta: 'Tap → outline the garnet',
    ...LOW_WN,
    transition: EASE_ZOOM,
    showGarnet: false,
    showHematite: false,
    showFe: false,
    showOrganic: false,
  },
  {
    id: 'garnet',
    label: 'Garnet',
    caption: 'Blue line — uncoated garnet fingerprint peaks.',
    cta: 'Tap → outline the hematite',
    ...LOW_WN,
    transition: EASE_ZOOM,
    showGarnet: true,
    showHematite: false,
    showFe: false,
    showOrganic: false,
  },
  {
    id: 'hematite',
    label: 'Hematite',
    caption: 'Orange line — sharp first-order hematite peaks at the coating margin.',
    cta: 'Tap → pan to the Fe hitch',
    ...LOW_WN,
    transition: EASE_PAN,
    showGarnet: true,
    showHematite: true,
    showFe: false,
    showOrganic: false,
  },
  {
    id: 'fe-hitch',
    label: 'Fe hitch',
    caption:
      'That sharp ~1320 cm⁻¹ spike is hematite’s second-order Fe mode — easy to confuse with the carbon D-band underneath.',
    cta: 'Tap → pan to organic carbon',
    ...FE_WN,
    transition: EASE_PAN,
    showGarnet: false,
    showHematite: false,
    showFe: true,
    showOrganic: false,
  },
  {
    id: 'carbon-pan',
    label: 'Carbon',
    caption: 'High wavenumber — the organic-rich coating. Broad D and G bands.',
    cta: 'Tap → outline the organic spectrum',
    ...CARBON_WN,
    transition: EASE_PAN,
    showGarnet: false,
    showHematite: false,
    showFe: false,
    showOrganic: false,
  },
  {
    id: 'organic',
    label: 'Organic',
    caption:
      'Top gold spectrum — disordered organic carbon. D near 1350, G near 1585. No need for hematite to see both.',
    cta: 'Tap to zoom out',
    ...CARBON_WN,
    transition: EASE_PAN,
    showGarnet: false,
    showHematite: false,
    showFe: false,
    showOrganic: true,
  },
] as const

export function RamanZoom({ active }: { active: boolean }) {
  const [step, setStep] = useState(0)
  const reduced = usePrefersReducedMotion()
  const view = STEPS[step]
  const zoomed = view.id !== 'full'

  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const next = () => setStep((s) => (s + 1) % STEPS.length)
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div
      className={styles.ramanZoom}
      data-raman-zoom=""
      data-raman-zoomed={zoomed || undefined}
    >
      <div
        className={styles.ramanZoomViewport}
        role="group"
        aria-label={`${view.label}: ${view.caption}`}
      >
        <button
          type="button"
          className={styles.ramanZoomHit}
          onClick={next}
          aria-label={view.cta}
        />
        <div
          className={styles.ramanZoomStage}
          style={{
            transform: `scale(${view.scale})`,
            transformOrigin: view.origin,
            transition: reduced ? 'none' : view.transition,
          }}
        >
          <div className={styles.ramanZoomFrame}>
            <img
              src={asset('images/raman-comparison.png')}
              alt="Raman spectra comparing uncoated garnet and organic-rich coating"
              className={styles.ramanZoomImg}
              draggable={false}
            />
            <svg
              className={styles.ramanZoomOverlay}
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d={GARNET_PATH}
                className={styles.ramanTraceMono}
                data-draw={view.showGarnet || undefined}
                pathLength={1}
              />
              <path
                d={HEMATITE_PATH}
                className={styles.ramanTraceMono}
                data-draw={view.showHematite || undefined}
                pathLength={1}
              />
              <path
                d={FE_HITCH_PATH}
                className={styles.ramanTraceMono}
                data-draw={view.showFe || undefined}
                pathLength={1}
              />
              <path
                d={ORGANIC_PATH}
                className={styles.ramanTraceMono}
                data-draw={view.showOrganic || undefined}
                pathLength={1}
              />
            </svg>
            {view.showGarnet && (
              <span
                className={`${styles.ramanTraceTag} ${styles.ramanTraceTagBare} ${styles.ramanTraceTagBelow}`}
                style={{ left: '32%', top: '84%' }}
              >
                Garnet
              </span>
            )}
            {view.showHematite && (
              <span
                className={`${styles.ramanTraceTag} ${styles.ramanTraceTagBare}`}
                style={{ left: '20%', top: '48%' }}
              >
                Hematite
              </span>
            )}
            {view.showFe && (
              <span className={styles.ramanTraceTag} style={{ left: '71.5%', top: '28%' }}>
                Fe · ~1320
              </span>
            )}
            {view.showOrganic && (
              <span className={styles.ramanTraceTag} style={{ left: '86%', top: '20%' }}>
                Organic C
              </span>
            )}
          </div>
        </div>
        <div className={styles.ramanZoomChrome}>
          <span className={styles.ramanZoomStep} aria-hidden>
            {view.label} · {step + 1}/{STEPS.length}
          </span>
          <p className={styles.ramanZoomCaption} aria-hidden>
            {view.caption}
          </p>
          <div className={styles.ramanZoomNav}>
            <button
              type="button"
              className={styles.ramanZoomBack}
              onClick={back}
              disabled={step === 0}
              aria-label="Previous frame"
            >
              ← Back
            </button>
            <button
              type="button"
              className={styles.ramanZoomCta}
              onClick={next}
            >
              {view.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
