#!/usr/bin/env node
/**
 * Parse Andradite CIF → compact garnetAtoms.json for the crystal viewer.
 * Expands asymmetric unit through symmetry ops, wraps into unit cell,
 * then samples a subset centered in the cell for a readable stick model.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const cifPath = join(root, 'assests', 'Andradite__0000246.cif')
const outPath = join(root, 'src', 'data', 'garnetAtoms.json')

const cif = readFileSync(cifPath, 'utf8')

function parseOps(text) {
  const ops = []
  const block = text.match(
    /loop_\s*\n_space_group_symop_operation_xyz([\s\S]*?)(?=\nloop_|\n_atom)/,
  )
  if (!block) throw new Error('No symmetry ops found')
  for (const line of block[1].split('\n')) {
    const m = line.match(/'([^']+)'/)
    if (m) ops.push(m[1].replace(/\s+/g, ''))
  }
  return ops
}

function parseAtoms(text) {
  const atoms = []
  const block = text.match(
    /loop_\s*\n_atom_site_label\s*\n_atom_site_fract_x\s*\n_atom_site_fract_y\s*\n_atom_site_fract_z([\s\S]*?)(?=\nloop_|\n*$)/,
  )
  if (!block) throw new Error('No atom sites found')
  for (const line of block[1].split('\n')) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 4) continue
    const [label, x, y, z] = parts
    if (Number.isNaN(Number(x))) continue
    atoms.push({
      element: label.replace(/\d+/g, ''),
      x: Number(x),
      y: Number(y),
      z: Number(z),
    })
  }
  return atoms
}

function evalCoord(expr, x, y, z) {
  const e = expr
    .toLowerCase()
    .replace(/(\d)\/(\d)/g, '($1/$2)')
    .replace(/x/g, `(${x})`)
    .replace(/y/g, `(${y})`)
    .replace(/z/g, `(${z})`)
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${e});`)()
}

function applyOp(op, atom) {
  const parts = op.split(',')
  return {
    element: atom.element,
    x: evalCoord(parts[0], atom.x, atom.y, atom.z),
    y: evalCoord(parts[1], atom.x, atom.y, atom.z),
    z: evalCoord(parts[2], atom.x, atom.y, atom.z),
  }
}

function wrap(v) {
  let r = v % 1
  if (r < 0) r += 1
  if (r > 0.9999) r = 0
  return r
}

function key(a) {
  return `${a.element}:${a.x.toFixed(4)},${a.y.toFixed(4)},${a.z.toFixed(4)}`
}

const a = 12.058
const ops = parseOps(cif)
const asym = parseAtoms(cif)

const expanded = new Map()
for (const atom of asym) {
  for (const op of ops) {
    const p = applyOp(op, atom)
    const w = { element: p.element, x: wrap(p.x), y: wrap(p.y), z: wrap(p.z) }
    expanded.set(key(w), w)
  }
}

let all = [...expanded.values()]

// Keep atoms near cell center for a readable cluster, plus enough of each type
const center = { x: 0.5, y: 0.5, z: 0.5 }
function dist(p) {
  const dx = p.x - center.x
  const dy = p.y - center.y
  const dz = p.z - center.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

all.sort((u, v) => dist(u) - dist(v))

const quotas = { Si: 12, Fe: 8, Ca: 12, O: 48 }
const picked = []
const counts = { Si: 0, Fe: 0, Ca: 0, O: 0 }
for (const atom of all) {
  const el = atom.element
  if (!(el in quotas)) continue
  if (counts[el] >= quotas[el]) continue
  picked.push(atom)
  counts[el]++
}

const positions = picked.map((atom, i) => ({
  id: i,
  element: atom.element,
  // Convert fractional → Å, then center at origin
  x: (atom.x - 0.5) * a,
  y: (atom.y - 0.5) * a,
  z: (atom.z - 0.5) * a,
}))

// Bonds: Si–O and Fe–O / Ca–O within typical coordination distances
const radii = { Si: 1.75, Fe: 2.15, Ca: 2.5, O: 0 }
const bonds = []
for (let i = 0; i < positions.length; i++) {
  const A = positions[i]
  if (A.element === 'O') continue
  for (let j = 0; j < positions.length; j++) {
    const B = positions[j]
    if (B.element !== 'O') continue
    const dx = A.x - B.x
    const dy = A.y - B.y
    const dz = A.z - B.z
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const max = radii[A.element] ?? 2
    if (d > 0.5 && d < max) bonds.push([i, j])
  }
}

const colors = {
  Si: '#ec3013',
  Fe: '#3b6fa0',
  Ca: '#c4a35a',
  O: '#d7d3d3',
}

const sizes = { Si: 0.28, Fe: 0.32, Ca: 0.36, O: 0.18 }

const payload = {
  mineral: 'Andradite (garnet structure type Ia-3d)',
  source: 'AMCSD 0000246 · Novak & Gibbs 1971',
  cell: { a, b: a, c: a },
  atoms: positions.map((p) => ({
    ...p,
    color: colors[p.element],
    radius: sizes[p.element],
  })),
  bonds,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(payload))
console.log(
  `Wrote ${payload.atoms.length} atoms, ${bonds.length} bonds → ${outPath}`,
)
