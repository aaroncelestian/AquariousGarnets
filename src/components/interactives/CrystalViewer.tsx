import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import structure from '../../data/garnetAtoms.json'
import { DodecahedronWire } from '../three/Dodecahedron'
import { useTalkBeats } from '../../hooks/useTalkBeats'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

const X_COLORS = {
  framework: '#ec3013', // Ca in andradite prototype → pyralspite X
  pyrope: '#7eb8c9', // Mg-ish cool
  almandine: '#ec3013', // Fe-rich warm accent
  spessartine: '#c45c9a', // Mn-ish
} as const

/** Octahedral Y-site in pyralspite is Al (andradite prototype stores it as Fe). */
const Y_COLOR = '#a8b4c0'

const BEATS = [
  {
    label: 'Framework',
    caption: 'Shared Ia‑3d architecture — habit outside, atoms inside.',
    key: 'framework' as const,
    xGlow: 0.15,
  },
  {
    label: 'X-site',
    caption: 'Dodecahedral X-site — where the pyralspite series diverges.',
    key: 'framework' as const,
    xGlow: 1,
  },
  {
    label: 'Pyrope',
    caption: 'Mg on X — high-pressure mantle and deep crust.',
    key: 'pyrope' as const,
    xGlow: 0.85,
  },
  {
    label: 'Almandine',
    caption: 'Fe on X — Aquarius Mountains sits here.',
    key: 'almandine' as const,
    xGlow: 1,
  },
  {
    label: 'Spessartine',
    caption: 'Mn on X — pegmatites and Mn-rich rocks.',
    key: 'spessartine' as const,
    xGlow: 0.85,
  },
] as const

function Bond({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const mid = useMemo(() => {
    const A = new THREE.Vector3(...a)
    const B = new THREE.Vector3(...b)
    const dir = new THREE.Vector3().subVectors(B, A)
    const len = dir.length()
    const quat = new THREE.Quaternion()
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return { len, quat, pos: A.clone().add(B).multiplyScalar(0.5) }
  }, [a, b])
  return (
    <mesh position={mid.pos.toArray()} quaternion={mid.quat}>
      <cylinderGeometry args={[0.032, 0.032, mid.len, 6]} />
      <meshStandardMaterial color="#8a8686" roughness={0.7} metalness={0.1} />
    </mesh>
  )
}

function Scene({
  active,
  backdrop,
  xColor,
  xGlow,
}: {
  active: boolean
  backdrop: boolean
  xColor: string
  xGlow: number
}) {
  const group = useRef<THREE.Group>(null)
  const reduced = usePrefersReducedMotion()
  const scale = backdrop ? 0.52 : 0.42

  useFrame((_, dt) => {
    if (!group.current || reduced || !active) return
    group.current.rotation.y += dt * 0.12
  })

  const atoms = structure.atoms
  const bonds = structure.bonds as [number, number][]

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} />
      <directionalLight position={[-4, -2, -6]} intensity={0.35} />
      <pointLight
        position={[0, 0.5, 2]}
        intensity={0.3 + xGlow * 1.2}
        color={xColor}
        distance={12}
      />
      <group ref={group} position={backdrop ? [0, 0.15, -0.4] : [0, 0, 0]}>
        <DodecahedronWire
          scale={backdrop ? 3.5 : 4.2}
          opacity={0.35 + xGlow * 0.2}
          lineWidth={backdrop ? 1.15 : 1.2}
        />
        <group>
          {bonds.map(([i, j]) => {
            const A = atoms[i]
            const B = atoms[j]
            if (!A || !B) return null
            return (
              <Bond
                key={`${i}-${j}`}
                a={[A.x * scale, A.y * scale, A.z * scale]}
                b={[B.x * scale, B.y * scale, B.z * scale]}
              />
            )
          })}
          {atoms.map((atom) => {
            const isX = atom.element === 'Ca'
            const isY = atom.element === 'Fe'
            const color = isX ? xColor : isY ? Y_COLOR : atom.color
            const r = atom.radius * 0.85 * (isX ? 1 + xGlow * 0.25 : 1)
            return (
              <mesh
                key={atom.id}
                position={[atom.x * scale, atom.y * scale, atom.z * scale]}
              >
                <sphereGeometry args={[r, 16, 16]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.35}
                  metalness={isX ? 0.55 : isY ? 0.4 : 0.15}
                  emissive={isX ? xColor : '#000000'}
                  emissiveIntensity={isX ? xGlow * 0.55 : 0}
                />
              </mesh>
            )
          })}
        </group>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        makeDefault
        target={backdrop ? [0, 0.15, -0.4] : [0, 0, 0]}
      />
    </>
  )
}

export function CrystalViewer({
  active,
  backdrop = false,
}: {
  active: boolean
  backdrop?: boolean
}) {
  const talk = useTalkBeats(BEATS, active)
  const xColor = X_COLORS[talk.beat.key]

  return (
    <div className={styles.crystal} data-backdrop={backdrop || undefined}>
      <div className={styles.legend}>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#3b6fa0' }} /> Si
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: Y_COLOR }} /> Al
          <span className={styles.legendNote}>Y</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: xColor }} /> X
          <span className={styles.legendNote}>{talk.beat.label}</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#d7d3d3' }} /> O
        </div>
      </div>
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: backdrop ? [0, 1.1, 11.2] : [0, 1.2, 9.5],
          fov: backdrop ? 36 : 40,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene
            active={active}
            backdrop={backdrop}
            xColor={xColor}
            xGlow={talk.beat.xGlow}
          />
        </Suspense>
      </Canvas>
      {backdrop && (
        <div className={styles.crystalBeatChrome}>
          <div className={styles.crystalBeatStep}>{talk.beat.label}</div>
          <p className={styles.crystalBeatCaption}>{talk.beat.caption}</p>
          <div className={styles.eddyNav}>
            <button type="button" className="btn" disabled={talk.index === 0} onClick={talk.prev}>
              ←
            </button>
            <span className={styles.stepLabel}>
              {talk.index + 1} / {talk.total}
            </span>
            <button type="button" className="btn btn-primary" onClick={talk.next}>
              {talk.index >= talk.total - 1 ? 'Replay ↻' : 'Next →'}
            </button>
          </div>
        </div>
      )}
      <div className={styles.crystalCaption}>
        {structure.mineral} · drag to orbit
      </div>
    </div>
  )
}
