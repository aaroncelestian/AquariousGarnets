import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import structure from '../../data/garnetAtoms.json'
import styles from './Interactives.module.css'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'

/** Regular dodecahedron edge vertices (golden-ratio construction). */
function useDodecahedronEdges(scale: number) {
  return useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2
    const verts: THREE.Vector3[] = []
    // cube corners
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        for (const z of [-1, 1]) verts.push(new THREE.Vector3(x, y, z))
    // rectangles
    for (const x of [-1, 1])
      for (const y of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(0, x * phi, y))
    for (const y of [-1, 1])
      for (const z of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(z, 0, y * phi))
    for (const z of [-1, 1])
      for (const x of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(z * phi, x, 0))

    // normalize & scale
    const scaled = verts.map((v) => v.normalize().multiplyScalar(scale))

    // connect vertices within edge length threshold
    const edges: [THREE.Vector3, THREE.Vector3][] = []
    const seen = new Set<string>()
    for (let i = 0; i < scaled.length; i++) {
      for (let j = i + 1; j < scaled.length; j++) {
        const d = scaled[i].distanceTo(scaled[j])
        if (d > 0.55 * scale && d < 0.85 * scale) {
          const key = `${i}-${j}`
          if (!seen.has(key)) {
            seen.add(key)
            edges.push([scaled[i], scaled[j]])
          }
        }
      }
    }
    return edges
  }, [scale])
}

function Bond({
  a,
  b,
}: {
  a: [number, number, number]
  b: [number, number, number]
}) {
  const mid = useMemo(() => {
    const A = new THREE.Vector3(...a)
    const B = new THREE.Vector3(...b)
    const dir = new THREE.Vector3().subVectors(B, A)
    const len = dir.length()
    const quat = new THREE.Quaternion()
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    const pos = A.clone().add(B).multiplyScalar(0.5)
    return { len, quat, pos }
  }, [a, b])

  return (
    <mesh position={mid.pos.toArray()} quaternion={mid.quat}>
      <cylinderGeometry args={[0.035, 0.035, mid.len, 6]} />
      <meshStandardMaterial color="#8a8686" roughness={0.7} metalness={0.1} />
    </mesh>
  )
}

function Scene({
  active,
  backdrop,
}: {
  active: boolean
  backdrop: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const reduced = usePrefersReducedMotion()
  const edges = useDodecahedronEdges(backdrop ? 4.8 : 4.2)
  const scale = backdrop ? 0.48 : 0.42

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
      {/* Bias right so copy can sit on the left without covering the habit */}
      <group ref={group} position={backdrop ? [2.35, 0.1, 0] : [0, 0, 0]}>
        {/* Habit wireframe */}
        {edges.map((pair, i) => (
          <Line
            key={i}
            points={pair}
            color="#ec3013"
            lineWidth={backdrop ? 1.35 : 1.2}
            transparent
            opacity={backdrop ? 0.62 : 0.55}
          />
        ))}

        {/* Crystal structure */}
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
          {atoms.map((atom) => (
            <mesh
              key={atom.id}
              position={[atom.x * scale, atom.y * scale, atom.z * scale]}
            >
              <sphereGeometry args={[atom.radius * 0.85, 16, 16]} />
              <meshStandardMaterial
                color={atom.color}
                roughness={0.35}
                metalness={atom.element === 'Fe' ? 0.45 : 0.15}
              />
            </mesh>
          ))}
        </group>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        makeDefault
        target={backdrop ? [2.35, 0.1, 0] : [0, 0, 0]}
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
  return (
    <div
      className={styles.crystal}
      data-backdrop={backdrop || undefined}
    >
      <div className={styles.legend}>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#ec3013' }} /> Si
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#3b6fa0' }} /> Fe
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#c4a35a' }} /> Ca
        </div>
        <div className={styles.legendRow}>
          <span className={styles.swatch} style={{ background: '#d7d3d3' }} /> O
        </div>
      </div>
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: backdrop ? [0.4, 1.35, 10.5] : [0, 1.2, 9.5],
          fov: backdrop ? 38 : 40,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene active={active} backdrop={backdrop} />
        </Suspense>
      </Canvas>
      <div className={styles.crystalCaption}>
        {structure.mineral} · {structure.source} · drag to orbit
      </div>
    </div>
  )
}
