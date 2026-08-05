import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DodecahedronWire } from '../three/Dodecahedron'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

function Atmosphere({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion()
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!g.current || !active || reduced) return
    g.current.rotation.y += dt * 0.07
    g.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.08
  })
  return (
    <group ref={g} position={[2.2, 0.1, 0]} scale={1.35}>
      <DodecahedronWire scale={2.4} opacity={0.28} lineWidth={1.05} />
      <mesh>
        <dodecahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color="#1c1917"
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.22}
        />
      </mesh>
      {/* Soft coating sheen */}
      <mesh scale={1.02}>
        <dodecahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color="#3dffb0"
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.07}
        />
      </mesh>
    </group>
  )
}

/** Subtle R3F habit behind cover typography — pointer-events none. */
export function CoverAtmosphere({ active }: { active: boolean }) {
  return (
    <div className={styles.coverAtmosphere} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.6, 8.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 5, 3]} intensity={0.9} />
          <Atmosphere active={active} />
        </Suspense>
      </Canvas>
    </div>
  )
}
