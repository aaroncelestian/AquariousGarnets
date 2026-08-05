import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { DodecahedronWire } from '../three/Dodecahedron'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

/** Schematic suite — nucleon counts are visual, not stoichiometric. */
const ELEMENTS = [
  { el: 'C', p: 3, n: 3 },
  { el: 'O', p: 3, n: 4 },
  { el: 'Mg', p: 4, n: 4 },
  { el: 'Al', p: 4, n: 5 },
  { el: 'Si', p: 4, n: 5 },
  { el: 'Ca', p: 5, n: 5 },
  { el: 'Cr', p: 5, n: 6 },
  { el: 'Mn', p: 5, n: 6 },
  { el: 'Fe', p: 6, n: 6 },
  { el: 'Zn', p: 6, n: 7 },
] as const

/** Flat-top dodecahedron: pentagonal face parallel to XZ. */
const FLAT_X = Math.atan(1 / ((1 + Math.sqrt(5)) / 2))

const GARNET_R = 1.85
const GARNET_Y = -0.35
const FACE_IN = GARNET_R * 0.794654472
const FACE_Z = 0
const FACE_Y = GARNET_Y + FACE_IN
const SURFACE_Y = FACE_Y
const PLASMA_R = 0.55

const GARNET = '#c4a84a'
const PROTON = '#ec3013'
const NEUTRON = '#6e6864'

const LASER_ORIGIN = new THREE.Vector3(2.35, 2.85, 1.15)
const IMPACT = new THREE.Vector3(0, SURFACE_Y + 0.02, FACE_Z)

type Phase = 'idle' | 'pulse' | 'settled'

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function nucleonPositions(count: number, radius: number) {
  const pts: THREE.Vector3[] = []
  if (count <= 0) return pts
  if (count === 1) {
    pts.push(new THREE.Vector3(0, 0, 0))
    return pts
  }
  // Fibonacci sphere pack — compact little nucleus
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius))
  }
  return pts
}

function MiniAtom({
  symbol,
  protons,
  neutrons,
  spin,
}: {
  symbol: string
  protons: number
  neutrons: number
  spin: number
}) {
  const group = useRef<THREE.Group>(null)
  const pPos = useMemo(() => nucleonPositions(protons, 0.055), [protons])
  const nPos = useMemo(() => nucleonPositions(neutrons, 0.055), [neutrons])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * spin
  })

  // Offset neutrons slightly so they interleave with protons
  const nOffset = useMemo(() => new THREE.Euler(0.4, 0.7, 0.2), [])

  return (
    <group>
      <group ref={group} scale={1.15}>
        {pPos.map((pos, i) => (
          <mesh key={`p-${i}`} position={pos.toArray()}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshStandardMaterial
              color={PROTON}
              emissive={PROTON}
              emissiveIntensity={0.35}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
        ))}
        <group rotation={nOffset}>
          {nPos.map((pos, i) => (
            <mesh key={`n-${i}`} position={pos.toArray()}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial color={NEUTRON} roughness={0.55} metalness={0.05} />
            </mesh>
          ))}
        </group>
        {/* Thin electron shell cue */}
        <mesh rotation={[Math.PI / 2.6, 0.3, 0]}>
          <torusGeometry args={[0.13, 0.006, 6, 32]} />
          <meshBasicMaterial color="#c4a84a" transparent opacity={0.45} />
        </mesh>
      </group>
      <Html position={[0.18, 0.12, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
        <div className={styles.libsChip}>{symbol}</div>
      </Html>
    </group>
  )
}

function AtomCloud({
  atomRefs,
}: {
  atomRefs: MutableRefObject<(THREE.Group | null)[]>
}) {
  return (
    <group>
      {ELEMENTS.map((e, i) => (
        <group
          key={e.el}
          ref={(node) => {
            atomRefs.current[i] = node
          }}
          position={[IMPACT.x, IMPACT.y, IMPACT.z]}
          visible={false}
        >
          <MiniAtom symbol={e.el} protons={e.p} neutrons={e.n} spin={0.6 + (i % 3) * 0.25} />
        </group>
      ))}
    </group>
  )
}

function Scene({
  phase,
  reduced,
  active,
  fireKey,
}: {
  phase: Phase
  reduced: boolean
  active: boolean
  fireKey: number
}) {
  const root = useRef<THREE.Group>(null)
  const plasmaRef = useRef<THREE.Mesh>(null)
  const plasmaGlowRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const headLight = useRef<THREE.PointLight>(null)
  const pitRef = useRef<THREE.Mesh>(null)
  const atomRefs = useRef<(THREE.Group | null)[]>([])
  const startedAt = useRef<number | null>(null)
  const targets = useMemo(
    () =>
      ELEMENTS.map((_, i) => {
        const angle = -Math.PI * 0.92 + (i / (ELEMENTS.length - 1)) * Math.PI * 1.05
        const radius = 1.35 + (i % 3) * 0.14
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          SURFACE_Y + 0.85 + Math.sin(i * 1.7) * 0.22 + (i % 2) * 0.14,
          Math.sin(angle) * radius * 0.55,
        )
      }),
    [],
  )

  const beamGeom = useMemo(() => {
    const dir = IMPACT.clone().sub(LASER_ORIGIN)
    const len = dir.length()
    const mid = LASER_ORIGIN.clone().add(IMPACT).multiplyScalar(0.5)
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    )
    return { len, mid, quat }
  }, [])

  useEffect(() => {
    if (phase === 'idle') {
      startedAt.current = null
      return
    }
    // Restart the clock only when firing — not when settling (that was a second pulse).
    if (phase === 'pulse') {
      startedAt.current = performance.now()
    }
  }, [phase, fireKey])

  useFrame((state, dt) => {
    if (!active) return
    if (root.current && !reduced) root.current.rotation.y += dt * 0.07

    const pulsing = phase === 'pulse' || phase === 'settled'
    let t = 0
    if (pulsing) {
      if (reduced) t = 1.4
      else if (startedAt.current != null) t = (performance.now() - startedAt.current) / 1000
    }

    if (pitRef.current) pitRef.current.visible = pulsing

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial
      const beamAmt = pulsing && t < 0.55 ? Math.max(0, 1 - t / 0.55) : 0
      mat.opacity = beamAmt * 0.85
      beamRef.current.visible = beamAmt > 0.02
    }

    if (plasmaRef.current && plasmaGlowRef.current) {
      const mat = plasmaRef.current.material as THREE.MeshBasicMaterial
      const glowMat = plasmaGlowRef.current.material as THREE.MeshBasicMaterial
      let intensity = 0
      let scale = 0.2
      if (pulsing) {
        if (t < 0.12) {
          intensity = t / 0.12
          scale = 0.25 + intensity * 0.9
        } else if (t < 1.1 || phase === 'pulse') {
          intensity = t < 1.1 ? 1 : Math.max(0.55, 1 - (t - 1.1) * 0.35)
          scale = 1.05 + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 14) * 0.04)
        }
        if (phase === 'settled') {
          intensity = 0.52 + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 3) * 0.04)
          scale = 0.92
        }
      }
      mat.opacity = intensity * 0.92
      glowMat.opacity = intensity * 0.35
      plasmaRef.current.scale.setScalar(scale)
      plasmaGlowRef.current.scale.setScalar(scale * 1.65)
      plasmaRef.current.visible = intensity > 0.02
      plasmaGlowRef.current.visible = intensity > 0.02
    }

    if (headLight.current) {
      headLight.current.intensity = pulsing ? 2.4 : 0.15
    }

    for (let i = 0; i < ELEMENTS.length; i++) {
      const atom = atomRefs.current[i]
      if (!atom) continue
      const delay = i * 0.045
      const local = pulsing ? Math.max(0, Math.min(1, (t - 0.28 - delay) / 0.4)) : 0
      const u = easeOutCubic(local)
      atom.visible = u > 0.02
      atom.position.set(
        THREE.MathUtils.lerp(IMPACT.x, targets[i].x, u),
        THREE.MathUtils.lerp(IMPACT.y, targets[i].y, u),
        THREE.MathUtils.lerp(IMPACT.z, targets[i].z, u),
      )
      atom.scale.setScalar(0.55 + u * 0.55)
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#fff4e4', '#b5a078', 0.7]} />
      <directionalLight position={[4, 5, 3]} intensity={1.05} color="#fff6ea" />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#ffd9a0" />
      <pointLight
        ref={headLight}
        position={LASER_ORIGIN.toArray()}
        color="#ffb347"
        intensity={0.15}
        distance={8}
      />

      <group ref={root} position={[-0.15, 0.15, 0]}>
        <group position={[0, GARNET_Y, 0]} rotation={[FLAT_X, 0, 0]}>
          <DodecahedronWire scale={GARNET_R * 1.52} opacity={0.32} lineWidth={1.15} />
          <mesh>
            <dodecahedronGeometry args={[GARNET_R, 0]} />
            <meshStandardMaterial
              color={GARNET}
              roughness={0.22}
              metalness={0.94}
              envMapIntensity={1.1}
              emissive={GARNET}
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>

        <mesh
          ref={pitRef}
          position={[0, SURFACE_Y + 0.004, FACE_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <circleGeometry args={[0.14, 24]} />
          <meshStandardMaterial color="#1a1715" roughness={0.6} metalness={0.3} />
        </mesh>

        <group position={LASER_ORIGIN.toArray()}>
          <mesh>
            <boxGeometry args={[0.42, 0.22, 0.28]} />
            <meshStandardMaterial color="#3a3533" roughness={0.55} metalness={0.4} />
          </mesh>
          <mesh position={[-0.12, 0, 0.02]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial
              color="#ec3013"
              emissive="#ec3013"
              emissiveIntensity={phase === 'idle' ? 0.35 : 1.2}
              roughness={0.4}
            />
          </mesh>
          <Html position={[0.38, 0.02, 0]} style={{ pointerEvents: 'none' }}>
            <div className={styles.libsHeadTag}>LIBS</div>
          </Html>
        </group>

        <mesh
          ref={beamRef}
          position={beamGeom.mid.toArray()}
          quaternion={beamGeom.quat}
          visible={false}
        >
          <cylinderGeometry args={[0.018, 0.045, beamGeom.len, 8]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0} depthWrite={false} />
        </mesh>

        <mesh ref={plasmaGlowRef} position={IMPACT.toArray()} visible={false}>
          <sphereGeometry args={[PLASMA_R, 28, 28]} />
          <meshBasicMaterial color="#ff7a3a" transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh ref={plasmaRef} position={IMPACT.toArray()} visible={false}>
          <sphereGeometry args={[PLASMA_R, 28, 28]} />
          <meshBasicMaterial color="#fff0d4" transparent opacity={0} depthWrite={false} />
        </mesh>

        <AtomCloud atomRefs={atomRefs} />

        {phase !== 'idle' && (
          <Html position={[0.95, SURFACE_Y - 0.15, 0.55]} style={{ pointerEvents: 'none' }}>
            <div className={styles.libsDepthTag}>~few µm / pulse</div>
          </Html>
        )}
      </group>

      <OrbitControls enablePan={false} enableZoom={false} target={[-0.15, FACE_Y + 0.2, 0]} />
    </>
  )
}

export function LibsBlast({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [fireKey, setFireKey] = useState(0)
  const settleTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      if (settleTimer.current) window.clearTimeout(settleTimer.current)
    }
  }, [active])

  const fire = () => {
    if (settleTimer.current) window.clearTimeout(settleTimer.current)
    setFireKey((k) => k + 1)
    if (reduced) {
      setPhase('settled')
      return
    }
    setPhase('pulse')
    settleTimer.current = window.setTimeout(() => setPhase('settled'), 1600)
  }

  const caption =
    phase === 'idle'
      ? 'Fire once — watch the plasma, then the atoms emerge.'
      : phase === 'pulse'
        ? 'Plasma flash: atoms from the surface — protons + neutrons.'
        : 'Near-full suite from a few micrometers of surface.'

  return (
    <div className={styles.libsBlast}>
      <div className={styles.libsBlastStage}>
        <Canvas
          className={styles.libsBlastScene}
          dpr={[1, 1.6]}
          camera={{ position: [2.6, 2.1, 6.8], fov: 36 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <Suspense fallback={null}>
            <Scene phase={phase} reduced={reduced} active={active} fireKey={fireKey} />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.libsBlastChrome}>
        <p className={styles.libsBlastCaption} data-live={phase !== 'idle' ? 'true' : undefined}>
          {caption}
        </p>
        <button type="button" className="btn btn-primary" onClick={fire}>
          {phase === 'idle' ? 'Fire laser pulse' : 'Fire again ↻'}
        </button>
      </div>
    </div>
  )
}
