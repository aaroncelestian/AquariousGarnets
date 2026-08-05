import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { DodecahedronWire } from '../three/Dodecahedron'
import { useTalkBeats } from '../../hooks/useTalkBeats'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

const BEATS = [
  {
    label: 'Stack',
    caption: 'Bottom to top: garnet → hematite → organic carbon.',
    carbon: 0,
    hematite: 0,
    plasma: 0,
    craterOrg: 0,
    craterHem: 0,
    pit: 0,
    camZ: 8.2,
  },
  {
    label: 'Pulse',
    caption: 'LIBS fires. The blast opens a crater — larger in carbon, smaller in hematite.',
    carbon: 0.04,
    hematite: 0.02,
    plasma: 1,
    craterOrg: 0.62,
    craterHem: 0.32,
    pit: 0.26,
    camZ: 7.2,
  },
  {
    label: 'Carbon lifts',
    caption: 'The organic film delaminates first — its larger crater lifts away with it.',
    carbon: 1.1,
    hematite: 0.15,
    plasma: 0.2,
    craterOrg: 0.68,
    craterHem: 0.34,
    pit: 0.28,
    camZ: 7.6,
  },
  {
    label: 'Garnet exposed',
    caption: 'Hematite lifts. Through the pit: bare garnet surface.',
    carbon: 1.55,
    hematite: 0.85,
    plasma: 0.08,
    craterOrg: 0.7,
    craterHem: 0.4,
    pit: 0.3,
    camZ: 8.0,
  },
] as const

/** Flat-top dodecahedron: pentagonal face parallel to XZ. */
const PHI = (1 + Math.sqrt(5)) / 2
const FLAT_X = Math.atan(1 / PHI)

const GARNET_R = 2.25
const GARNET_Y = -0.45
const FACE_IN = GARNET_R * 0.794654472
/** Flat-top face is centered on the crystal axis. */
const FACE_Z = 0
const FACE_Y = GARNET_Y + FACE_IN

/**
 * Unit-radius flat-top dodecahedron: top pentagon in XZ, CCW when viewed from +Y.
 * Scale by GARNET_R for world size.
 */
const FACE_PENTAGON: [number, number][] = [
  [-0.57735, -0.187592],
  [0, -0.607062],
  [0.57735, -0.187592],
  [0.356822, 0.491123],
  [-0.356822, 0.491123],
]

const HEM_H = 0.2
const CAR_H = 0.17
const LAYER_GAP = 0.02
const HEMATITE_Y = FACE_Y + LAYER_GAP + HEM_H / 2
const CARBON_Y = HEMATITE_Y + HEM_H / 2 + LAYER_GAP + CAR_H / 2
/** Top of the organic stack — laser impact surface. */
const SURFACE_Y = CARBON_Y + CAR_H / 2

const PLASMA_R = 0.42

const STACK_X = -1.02
const STACK_Y = 0.816
const GARNET = '#c4a84a'
const GARNET_EXPOSED = '#2a2624'

/**
 * Shape lives in XY, then mesh rotates -90° about X onto XZ.
 * rotateX(-π/2): (sx, sy, 0) → (sx, 0, -sy). Pass sy = -faceZ so corners land on the crystal face.
 */
function makePentagonCraterShape(scale: number, craterR: number) {
  const shape = new THREE.Shape()
  const pts = FACE_PENTAGON.map(([x, z]) => [x * scale, -z * scale] as const)
  shape.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1])
  shape.closePath()

  if (craterR > 0.02) {
    const hole = new THREE.Path()
    hole.absarc(0, 0, craterR, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }
  return shape
}

function CraterSlab({
  scale,
  height,
  craterR,
  color,
  roughness,
  metalness,
}: {
  scale: number
  height: number
  craterR: number
  color: string
  roughness: number
  metalness: number
}) {
  const rounded = Math.round(craterR * 40) / 40
  const shape = useMemo(
    () => makePentagonCraterShape(scale, rounded),
    [scale, rounded],
  )

  const matProps = {
    color,
    roughness,
    metalness,
    transparent: false as const,
    opacity: 1,
    side: THREE.DoubleSide,
    depthWrite: true,
  }

  // One orientation only: top lid + extrusion (both use the same -90° X map).
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height / 2, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]}>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: height,
              bevelEnabled: false,
              curveSegments: 28,
              steps: 1,
            },
          ]}
        />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  )
}

function useLerped(target: number, reduced: boolean, ms = 650) {
  const [value, setValue] = useState(target)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }
    let raf = 0
    const from = valueRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / ms)
      const eased = 1 - (1 - u) ** 3
      setValue(from + (target - from) * eased)
      if (u < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced, ms])

  return value
}

function Scene({
  carbon,
  hematite,
  plasma,
  craterOrg,
  craterHem,
  pit,
  camZ,
  active,
}: {
  carbon: number
  hematite: number
  plasma: number
  craterOrg: number
  craterHem: number
  pit: number
  camZ: number
  active: boolean
}) {
  const reduced = usePrefersReducedMotion()
  const root = useRef<THREE.Group>(null)
  const carbonG = useRef<THREE.Group>(null)
  const hematiteG = useRef<THREE.Group>(null)
  const plasmaRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)

  const orgR = useLerped(craterOrg, reduced)
  const hemR = useLerped(craterHem, reduced)
  const pitR = useLerped(pit, reduced)

  useFrame((state, dt) => {
    if (!active) return
    if (root.current && !reduced) root.current.rotation.y += dt * 0.08
    state.camera.position.z += (camZ - state.camera.position.z) * Math.min(1, dt * 3)

    if (carbonG.current) {
      const target = CARBON_Y + carbon * 0.95
      carbonG.current.position.y += (target - carbonG.current.position.y) * Math.min(1, dt * 3.2)
    }
    if (hematiteG.current) {
      const target = HEMATITE_Y + hematite * 0.75
      hematiteG.current.position.y +=
        (target - hematiteG.current.position.y) * Math.min(1, dt * 3.2)
    }

    if (plasmaRef.current) {
      const mat = plasmaRef.current.material as THREE.MeshBasicMaterial
      const pulse = reduced
        ? plasma
        : plasma * (0.78 + 0.22 * Math.sin(state.clock.elapsedTime * 14))
      mat.opacity = pulse * 0.88
      // Keep scale near 1 so the sphere bottom stays kissing the surface
      const scale = 0.92 + plasma * 0.18
      plasmaRef.current.scale.setScalar(scale)
      const r = PLASMA_R * scale
      plasmaRef.current.position.set(0, SURFACE_Y + r * 0.98, FACE_Z)
      plasmaRef.current.visible = plasma > 0.02
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = plasma > 0.3 ? 0.5 * plasma : 0
      beamRef.current.visible = plasma > 0.3
    }
  })

  return (
    <>
      <Environment preset="studio" environmentIntensity={0.85} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#fff4e4', '#b5a078', 0.85]} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} color="#fff6ea" />
      <directionalLight position={[-4, 3, -2]} intensity={0.55} color="#ffd9a0" />
      <directionalLight position={[1, -2, 5]} intensity={0.35} color="#e8dcc0" />
      <group ref={root} position={[STACK_X, STACK_Y, 0]}>
        <group position={[0, GARNET_Y, 0]} rotation={[FLAT_X, 0, 0]}>
          <DodecahedronWire scale={GARNET_R * 1.52} opacity={0.4} />
          <mesh>
            <dodecahedronGeometry args={[GARNET_R, 0]} />
            <meshStandardMaterial
              color={GARNET}
              roughness={0.2}
              metalness={0.96}
              envMapIntensity={1.25}
              emissive={GARNET}
              emissiveIntensity={0.12}
            />
          </mesh>
        </group>

        {/* Exposed garnet through the ablation pit */}
        <mesh
          position={[0, FACE_Y + 0.012, FACE_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={pitR > 0.02}
        >
          <circleGeometry args={[Math.max(pitR, 0.02), 32]} />
          <meshStandardMaterial
            color={GARNET_EXPOSED}
            roughness={0.4}
            metalness={0.55}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
        <mesh
          position={[0, FACE_Y + 0.018, FACE_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={pitR > 0.02}
        >
          <ringGeometry args={[Math.max(pitR * 0.86, 0.01), Math.max(pitR, 0.02), 32]} />
          <meshStandardMaterial
            color="#1a1715"
            roughness={0.55}
            metalness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        <group ref={hematiteG} position={[0, HEMATITE_Y, FACE_Z]}>
          <CraterSlab
            scale={GARNET_R}
            height={HEM_H}
            craterR={hemR}
            color="#e15b47"
            roughness={0.48}
            metalness={0.08}
          />
        </group>
        <group ref={carbonG} position={[0, CARBON_Y, FACE_Z]}>
          <CraterSlab
            scale={GARNET_R}
            height={CAR_H}
            craterR={orgR}
            color={GARNET}
            roughness={0.4}
            metalness={0.35}
          />
        </group>

        <mesh ref={beamRef} position={[0, SURFACE_Y + 1.6, FACE_Z]} visible={false}>
          <cylinderGeometry args={[0.025, 0.055, 2.8, 8]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0} depthWrite={false} />
        </mesh>

        <mesh ref={plasmaRef} position={[0, SURFACE_Y + PLASMA_R, FACE_Z]} visible={false}>
          <sphereGeometry args={[PLASMA_R, 28, 28]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[STACK_X, FACE_Y + STACK_Y, FACE_Z]}
      />
    </>
  )
}

export function LibsStack3D({ active }: { active: boolean }) {
  const talk = useTalkBeats(BEATS, active)

  return (
    <div className={styles.libs3d}>
      <Canvas
        className={styles.libs3dScene}
        dpr={[1, 1.6]}
        camera={{ position: [2.4, 2.35, talk.beat.camZ], fov: 36 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene
            carbon={talk.beat.carbon}
            hematite={talk.beat.hematite}
            plasma={talk.beat.plasma}
            craterOrg={talk.beat.craterOrg}
            craterHem={talk.beat.craterHem}
            pit={talk.beat.pit}
            camZ={talk.beat.camZ}
            active={active}
          />
        </Suspense>
      </Canvas>
      <div className={styles.eddyChrome}>
        <div className={styles.eddyStep}>{talk.beat.label}</div>
        <p className={styles.eddyCaption}>{talk.beat.caption}</p>
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
    </div>
  )
}
