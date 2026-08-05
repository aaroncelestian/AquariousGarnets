import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { DodecahedronWire } from '../three/Dodecahedron'
import { useTalkBeats } from '../../hooks/useTalkBeats'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

const BEATS = [
  {
    label: 'Cavity',
    caption: 'A gas pocket in cooling rhyolite — vapor trapped in the rock.',
    swirl: 0.35,
    growth: 0.05,
    vapor: 0.55,
  },
  {
    label: 'Eddies',
    caption: 'Volcanic gases circulate. Vector field in the pocket — no liquid step.',
    swirl: 1.15,
    growth: 0.2,
    vapor: 1.1,
  },
  {
    label: 'Nucleation',
    caption: 'From steam, a crystal habit begins to take shape.',
    swirl: 0.9,
    growth: 0.55,
    vapor: 0.85,
  },
  {
    label: 'Garnet',
    caption: 'Vapor-phase growth — a dodecahedron precipitated from gas.',
    swirl: 0.55,
    growth: 1,
    vapor: 0.45,
  },
] as const

/** Analytic swirl inside a spherical pocket (toroidal eddy + slow axial drift). */
function flowAt(p: THREE.Vector3, swirl: number, t: number, out: THREE.Vector3) {
  const x = p.x
  const y = p.y
  const z = p.z
  const r = Math.sqrt(x * x + z * z) + 1e-4
  const ang = Math.atan2(z, x)
  // Circumferential swirl in XZ, with a vertical roll
  const speed = swirl * (0.55 + 0.45 * Math.sin(ang * 2 + t * 0.7))
  const tangX = -z / r
  const tangZ = x / r
  out.set(
    tangX * speed * 1.4 + Math.sin(y * 2.2 + t) * 0.12 * swirl,
    Math.cos(r * 2.5 - t * 0.9) * 0.55 * swirl + Math.sin(ang * 3 + t) * 0.1,
    tangZ * speed * 1.4 + Math.cos(y * 1.8 + t * 1.1) * 0.12 * swirl,
  )
  return out
}

function RockShell() {
  return (
    <group>
      {/* Outer rock mass with a carved spherical cavity (CSG-free: just a big shell look) */}
      <mesh position={[0, 0, -1.2]} rotation={[0.15, 0.4, 0]}>
        <boxGeometry args={[7.5, 5.2, 3.2]} />
        <meshStandardMaterial color="#3a342f" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[2.35, 48, 32]} />
        <meshStandardMaterial
          color="#2a2522"
          roughness={0.88}
          metalness={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Lip of the cavity */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.55]}>
        <torusGeometry args={[2.15, 0.18, 12, 48]} />
        <meshStandardMaterial color="#4a423c" roughness={0.85} />
      </mesh>
    </group>
  )
}

function VectorField({
  swirl,
  active,
  reduced,
}: {
  swirl: number
  active: boolean
  reduced: boolean
}) {
  const arrows = useMemo(() => {
    const pts: { pos: THREE.Vector3; id: number }[] = []
    let id = 0
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 5; k++) {
          const x = -1.5 + (i / 8) * 3
          const y = -1.15 + (j / 6) * 2.3
          const z = -1.1 + (k / 4) * 2.0
          if (x * x + y * y + z * z < 2.0 * 2.0) {
            pts.push({ pos: new THREE.Vector3(x, y, z), id: id++ })
          }
        }
      }
    }
    return pts
  }, [])

  const group = useRef<THREE.Group>(null)
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame(({ clock }) => {
    if (!group.current || !active) return
    const t = reduced ? 0 : clock.elapsedTime
    const children = group.current.children
    for (let i = 0; i < arrows.length; i++) {
      const mesh = children[i] as THREE.Mesh
      if (!mesh) continue
      flowAt(arrows[i].pos, swirl, t, scratch)
      const len = scratch.length()
      mesh.position.copy(arrows[i].pos)
      if (len > 1e-4) {
        quat.setFromUnitVectors(yAxis, scratch.clone().normalize())
        mesh.quaternion.copy(quat)
        mesh.scale.set(1, 0.35 + len * 0.55, 1)
      }
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.25 + Math.min(0.65, len * 0.35)
    }
  })

  return (
    <group ref={group}>
      {arrows.map((a) => (
        <mesh key={a.id} position={a.pos}>
          <coneGeometry args={[0.045, 0.22, 5]} />
          <meshBasicMaterial color="#ec3013" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function VaporParticles({
  swirl,
  vapor,
  active,
  reduced,
}: {
  swirl: number
  vapor: number
  active: boolean
  reduced: boolean
}) {
  const count = 280
  const mesh = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const vel = useMemo(() => new THREE.Vector3(), [])
  const state = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const w = Math.random()
      const r = Math.cbrt(u) * 1.9
      const theta = v * Math.PI * 2
      const phi = Math.acos(2 * w - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count])

  useFrame((_, dt) => {
    if (!mesh.current || !active) return
    const t = reduced ? 0 : performance.now() * 0.001
    const step = Math.min(dt, 0.033) * vapor
    for (let i = 0; i < count; i++) {
      const p = vel.set(state[i * 3], state[i * 3 + 1], state[i * 3 + 2])
      flowAt(p, swirl, t, vel)
      state[i * 3] += vel.x * step * 0.55
      state[i * 3 + 1] += vel.y * step * 0.55
      state[i * 3 + 2] += vel.z * step * 0.55
      // Soft confinement back into the pocket
      const x = state[i * 3]
      const y = state[i * 3 + 1]
      const z = state[i * 3 + 2]
      const r2 = x * x + y * y + z * z
      if (r2 > 3.6) {
        const s = 1.7 / Math.sqrt(r2)
        state[i * 3] *= s
        state[i * 3 + 1] *= s
        state[i * 3 + 2] *= s
      }
      tmp.position.set(state[i * 3], state[i * 3 + 1], state[i * 3 + 2])
      tmp.scale.setScalar(0.035 + (i % 5) * 0.006)
      tmp.updateMatrix()
      mesh.current.setMatrixAt(i, tmp.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#e8dcc8"
        transparent
        opacity={0.55}
        roughness={0.4}
        metalness={0.1}
      />
    </instancedMesh>
  )
}

function GrowingGarnet({
  growth,
  active,
  reduced,
}: {
  growth: number
  active: boolean
  reduced: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current || !active || reduced) return
    ref.current.rotation.y += dt * 0.15
  })
  const s = 0.15 + growth * 1.35
  return (
    <group ref={ref} scale={s}>
      <DodecahedronWire scale={1.1} opacity={0.25 + growth * 0.55} lineWidth={1.4} />
      <mesh>
        <dodecahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial
          color="#1a1817"
          roughness={0.25}
          metalness={0.65}
          transparent
          opacity={0.15 + growth * 0.75}
        />
      </mesh>
    </group>
  )
}

function Scene({
  swirl,
  growth,
  vapor,
  active,
}: {
  swirl: number
  growth: number
  vapor: number
  active: boolean
}) {
  const reduced = usePrefersReducedMotion()

  return (
    <>
      <color attach="background" args={['#1a1715']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 6]} intensity={1.15} />
      <directionalLight position={[-3, -2, 2]} intensity={0.35} />
      <pointLight position={[0, 0, 2]} intensity={0.4 * vapor} color="#ffb08a" />
      <RockShell />
      <VectorField swirl={swirl} active={active} reduced={reduced} />
      <VaporParticles swirl={swirl} vapor={vapor} active={active} reduced={reduced} />
      <GrowingGarnet growth={growth} active={active} reduced={reduced} />
      <OrbitControls enablePan={false} enableZoom={false} target={[0, 0, 0.2]} />
    </>
  )
}

export function EddyField({ active }: { active: boolean }) {
  const talk = useTalkBeats(BEATS, active)

  const swirl = talk.beat.swirl
  const growth = talk.beat.growth
  const vapor = talk.beat.vapor

  return (
    <div className={styles.eddy}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0.2, 0.35, 5.8], fov: 42 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene swirl={swirl} growth={growth} vapor={vapor} active={active} />
        </Suspense>
      </Canvas>
      <div className={`${styles.eddyChrome} ${styles.eddyChromeEnd}`}>
        <div className={styles.eddyStep}>{talk.beat.label}</div>
        <p className={styles.eddyCaption}>{talk.beat.caption}</p>
        <div className={styles.eddyNav}>
          <button
            type="button"
            className="btn"
            disabled={talk.index === 0}
            onClick={talk.prev}
          >
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
    </div>
  )
}
