import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import styles from './Interactives.module.css'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'

type Band = 'g' | 'd' | 'both'

const CAPTIONS: Record<Band, string> = {
  g: 'G band · ~1580 cm⁻¹ — in-plane C═C stretch in aromatic rings',
  d: 'D band · ~1350 cm⁻¹ — ring breathing, only when the lattice is disordered',
  both: 'Strong D over G → disordered, thermally immature organic carbon',
}

function hexVerts(R: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (30 + i * 60)
    return new THREE.Vector3(R * Math.cos(a), R * Math.sin(a), 0)
  })
}

const Y_UP = new THREE.Vector3(0, 1, 0)

function AromaticRing3D({ mode, active }: { mode: Band; active: boolean }) {
  const reduced = usePrefersReducedMotion()
  const atoms = useRef<THREE.Group>(null)
  const bonds = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const base = useMemo(() => hexVerts(0.95), [])
  const scratch = useMemo(() => base.map((v) => v.clone()), [base])
  const mid = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const restLen = useMemo(() => {
    const a = base[0]
    const b = base[1]
    return a.distanceTo(b)
  }, [base])

  useFrame(({ clock }) => {
    if (!atoms.current || !active) return
    const t = reduced ? 0 : clock.elapsedTime
    const gAmt = mode === 'g' || mode === 'both' ? Math.sin(t * 9) * 0.1 : 0
    const dAmt = mode === 'd' || mode === 'both' ? Math.sin(t * 7) * 0.13 : 0
    atoms.current.children.forEach((child, i) => {
      const b = base[i]
      const sign = i % 2 === 0 ? 1 : -1
      scratch[i].set(
        b.x + sign * gAmt + (b.x / 0.95) * dAmt,
        b.y + sign * gAmt * 0.25 + (b.y / 0.95) * dAmt,
        b.z,
      )
      child.position.copy(scratch[i])
    })

    if (bonds.current) {
      bonds.current.children.forEach((child, i) => {
        const a = scratch[i]
        const b = scratch[(i + 1) % 6]
        mid.copy(a).add(b).multiplyScalar(0.5)
        dir.copy(b).sub(a)
        const len = dir.length()
        quat.setFromUnitVectors(Y_UP, dir.normalize())
        child.position.copy(mid)
        child.quaternion.copy(quat)
        child.scale.set(1, len / restLen, 1)
      })
    }

    if (root.current) {
      root.current.rotation.y = reduced ? 0.15 : 0.2 + Math.sin(t * 0.35) * 0.28
      root.current.rotation.x = reduced ? 0.12 : 0.18
    }
  })

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.05} />
      <directionalLight position={[-2, -1, 3]} intensity={0.35} />
      <group ref={root}>
        <group ref={bonds}>
          {base.map((v, i) => {
            const n = base[(i + 1) % 6]
            const m = v.clone().add(n).multiplyScalar(0.5)
            const d = n.clone().sub(v)
            const q = new THREE.Quaternion().setFromUnitVectors(Y_UP, d.clone().normalize())
            return (
              <mesh key={i} position={m.toArray()} quaternion={q}>
                <cylinderGeometry args={[0.055, 0.055, restLen, 10]} />
                <meshStandardMaterial color="#5a5553" roughness={0.55} />
              </mesh>
            )
          })}
        </group>
        <group ref={atoms}>
          {base.map((v, i) => (
            <mesh key={i} position={v.toArray()}>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial
                color="#2d2b2b"
                roughness={0.35}
                metalness={0.2}
                emissive="#ec3013"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  )
}

function spectrumPath(highlight: Band | 'off') {
  const pts: [number, number][] = []
  for (let x = 36; x <= 520; x += 2) {
    const cm = 1000 + ((x - 36) / 484) * 800
    const d = 92 * Math.exp(-0.5 * ((cm - 1350) / 48) ** 2)
    const g = 56 * Math.exp(-0.5 * ((cm - 1580) / 42) ** 2)
    const muteD = highlight === 'g' ? 0.22 : 1
    const muteG = highlight === 'd' ? 0.22 : 1
    const y = 168 - (d * muteD + g * muteG)
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
  const dX = 36 + ((1350 - 1000) / 800) * 484
  const gX = 36 + ((1580 - 1000) / 800) * 484

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

      <div className={styles.ramanStack}>
        <div className={styles.ramanMole}>
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.15, 4.6], fov: 36 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <AromaticRing3D mode={band} active={active} />
            </Suspense>
          </Canvas>
        </div>

        <svg
          className={styles.ramanSpecSvg}
          viewBox="0 0 560 200"
          role="img"
          aria-label={CAPTIONS[band]}
        >
          <text x="36" y="22" className={styles.label} fontSize="12" opacity="0.65">
            Raman intensity
          </text>
          <line x1="36" y1="168" x2="520" y2="168" className={styles.axis} />
          <line x1="36" y1="36" x2="36" y2="168" className={styles.axis} />
          <path
            d={spectrumPath(highlight === 'off' ? 'both' : highlight)}
            className={styles.ramanSpectrum}
            fill="none"
          />
          <g opacity={highlight === 'd' || highlight === 'both' || highlight === 'off' ? 1 : 0.35}>
            <line
              x1={dX}
              y1="52"
              x2={dX}
              y2="168"
              stroke="var(--color-accent)"
              strokeWidth="1.75"
              strokeDasharray="3 4"
              opacity="0.55"
            />
            <text x={dX} y="188" textAnchor="middle" className={styles.labelHi} fontSize="15">
              D
            </text>
            <text
              x={dX}
              y="28"
              textAnchor="middle"
              className={styles.label}
              fontSize="11"
              opacity="0.55"
            >
              ~1350
            </text>
          </g>
          <g opacity={highlight === 'g' || highlight === 'both' || highlight === 'off' ? 1 : 0.35}>
            <line
              x1={gX}
              y1="78"
              x2={gX}
              y2="168"
              stroke="var(--color-accent)"
              strokeWidth="1.75"
              strokeDasharray="3 4"
              opacity="0.55"
            />
            <text x={gX} y="188" textAnchor="middle" className={styles.labelHi} fontSize="15">
              G
            </text>
            <text
              x={gX}
              y="28"
              textAnchor="middle"
              className={styles.label}
              fontSize="11"
              opacity="0.55"
            >
              ~1580
            </text>
          </g>
          <text
            x="520"
            y="188"
            textAnchor="end"
            className={styles.label}
            fontSize="12"
            opacity="0.5"
          >
            cm⁻¹
          </text>
        </svg>
      </div>

      <p className={styles.ramanCaption}>{CAPTIONS[band]}</p>
    </div>
  )
}
