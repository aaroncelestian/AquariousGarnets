import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

/** Regular dodecahedron edges (golden-ratio construction). */
export function useDodecahedronEdges(scale: number) {
  return useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2
    const verts: THREE.Vector3[] = []
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        for (const z of [-1, 1]) verts.push(new THREE.Vector3(x, y, z))
    for (const x of [-1, 1])
      for (const y of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(0, x * phi, y))
    for (const y of [-1, 1])
      for (const z of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(z, 0, y * phi))
    for (const z of [-1, 1])
      for (const x of [-1 / phi, 1 / phi]) verts.push(new THREE.Vector3(z * phi, x, 0))

    const scaled = verts.map((v) => v.normalize().multiplyScalar(scale))
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

export function DodecahedronWire({
  scale = 2,
  color = '#ec3013',
  opacity = 0.5,
  lineWidth = 1.2,
}: {
  scale?: number
  color?: string
  opacity?: number
  lineWidth?: number
}) {
  const edges = useDodecahedronEdges(scale)
  return (
    <group>
      {edges.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  )
}
