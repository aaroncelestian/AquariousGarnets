import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { asset } from '../../lib/asset'
import { usePrefersReducedMotion } from '../../hooks/useActiveSlide'
import styles from './Interactives.module.css'

const IW = 1800
const IH = 1308
const STORAGE_KEY = 'aquarius-eddy-field-v1'

type Pt = [number, number]
type Eddy = { u: number; v: number; r: number; sense: 1 | -1 }
type Sample = {
  u: number
  v: number
  kind: 'channel' | 'eddy'
  eu?: number
  ev?: number
  sense?: 1 | -1
  tu?: number
  tv?: number
}
type Drag =
  | { kind: 'channel'; index: number }
  | { kind: 'eddy'; index: number }
  | { kind: 'radius'; index: number }
type Sel = { kind: 'channel' | 'eddy'; index: number } | null

const DEFAULT_CHANNEL: Pt[] = [
  [0.11, 0.5],
  [0.18, 0.52],
  [0.26, 0.568],
  [0.333, 0.602],
  [0.422, 0.514],
  [0.48, 0.54],
  [0.55, 0.446],
  [0.62, 0.43],
  [0.69, 0.432],
  [0.77, 0.44],
  [0.84, 0.434],
  [0.91, 0.425],
]

const DEFAULT_EDDIES: Eddy[] = [
  { u: 0.673, v: 0.17, r: 0.095, sense: 1 },
  { u: 0.777, v: 0.211, r: 0.038, sense: -1 },
  { u: 0.49, v: 0.242, r: 0.048, sense: -1 },
  { u: 0.167, v: 0.403, r: 0.042, sense: 1 },
  { u: 0.351, v: 0.41, r: 0.05, sense: -1 },
  { u: 0.641, v: 0.624, r: 0.032, sense: 1 },
  { u: 0.71, v: 0.595, r: 0.04, sense: -1 },
  { u: 0.796, v: 0.567, r: 0.042, sense: 1 },
  { u: 0.536, v: 0.79, r: 0.078, sense: -1 },
  { u: 0.389, v: 0.734, r: 0.038, sense: 1 },
  { u: 0.26, v: 0.739, r: 0.038, sense: -1 },
]

function round4(n: number) {
  return Math.round(n * 10000) / 10000
}

function loadLayout(): { channel: Pt[]; eddies: Eddy[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { channel?: Pt[]; eddies?: Eddy[] }
    if (!Array.isArray(data.channel) || data.channel.length < 2) return null
    if (!Array.isArray(data.eddies)) return null
    return { channel: data.channel, eddies: data.eddies }
  } catch {
    return null
  }
}

function hash01(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function pointAlongChannel(channel: Pt[], dist: number) {
  let remain = Math.max(0, dist)
  for (let i = 0; i < channel.length - 1; i++) {
    const [u0, v0] = channel[i]
    const [u1, v1] = channel[i + 1]
    const seg = Math.hypot(u1 - u0, v1 - v0) || 1e-6
    if (remain <= seg || i === channel.length - 2) {
      const t = Math.min(1, remain / seg)
      const tu = (u1 - u0) / seg
      const tv = (v1 - v0) / seg
      return { u: u0 + (u1 - u0) * t, v: v0 + (v1 - v0) * t, tu, tv }
    }
    remain -= seg
  }
  const last = channel[channel.length - 1]
  return { u: last[0], v: last[1], tu: 1, tv: 0 }
}

function buildSamples(channel: Pt[], eddies: Eddy[]): Sample[] {
  const out: Sample[] = []
  let totalLen = 0
  for (let i = 0; i < channel.length - 1; i++) {
    totalLen += Math.hypot(channel[i + 1][0] - channel[i][0], channel[i + 1][1] - channel[i][1])
  }
  const count = Math.max(155, Math.round((totalLen / 0.062) * 1.25 * 1.25 * 3 * 3 * 0.75))
  for (let i = 0; i < count; i++) {
    const dist = ((i + hash01(i * 13.7 + 0.8)) / count) * totalLen
    const { u, v, tu, tv } = pointAlongChannel(channel, dist)
    const lane = Math.floor(hash01(i * 4.1 + 0.2) * 5) - 2
    const lateral = lane * 0.015 + (hash01(i * 8.8 + 2.1) - 0.5) * 0.016
    out.push({
      u: u - tv * lateral,
      v: v + tu * lateral,
      kind: 'channel',
      tu,
      tv,
    })
  }
  for (const e of eddies) {
    const rings = e.r > 0.06 ? 14 : 10
    for (let k = 0; k < rings; k++) {
      const a = (k / rings) * Math.PI * 2
      const rr = e.r * (0.42 + (k % 3) * 0.2)
      out.push({
        u: e.u + Math.cos(a) * rr,
        v: e.v + Math.sin(a) * rr * (IW / IH),
        kind: 'eddy',
        eu: e.u,
        ev: e.v,
        sense: e.sense,
      })
    }
  }
  return out
}

function coverMap(cw: number, ch: number, u: number, v: number) {
  const scale = Math.max(cw / IW, ch / IH)
  const dw = IW * scale
  const dh = IH * scale
  const ox = (cw - dw) / 2
  const oy = (ch - dh) / 2
  return { x: ox + u * dw, y: oy + v * dh, dw, dh, ox, oy }
}

function coverUnmap(cw: number, ch: number, x: number, y: number) {
  const scale = Math.max(cw / IW, ch / IH)
  const dw = IW * scale
  const dh = IH * scale
  const ox = (cw - dw) / 2
  const oy = (ch - dh) / 2
  return { u: (x - ox) / dw, v: (y - oy) / dh }
}

function formatLayout(channel: Pt[], eddies: Eddy[]) {
  const ch = channel
    .map(([u, v]) => `  [${round4(u)}, ${round4(v)}],`)
    .join('\n')
  const ed = eddies
    .map(
      (e) =>
        `  { u: ${round4(e.u)}, v: ${round4(e.v)}, r: ${round4(e.r)}, sense: ${e.sense} },`,
    )
    .join('\n')
  return `const CHANNEL: [number, number][] = [\n${ch}\n]\n\nconst EDDIES: { u: number; v: number; r: number; sense: 1 | -1 }[] = [\n${ed}\n]\n`
}

function closestOnSegment(
  u: number,
  v: number,
  a: Pt,
  b: Pt,
): { u: number; v: number; t: number; d2: number } {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len2 = dx * dx + dy * dy || 1e-6
  const t = Math.max(0, Math.min(1, ((u - a[0]) * dx + (v - a[1]) * dy) / len2))
  const pu = a[0] + dx * t
  const pv = a[1] + dy * t
  return { u: pu, v: pv, t, d2: (u - pu) ** 2 + (v - pv) ** 2 }
}

export function EddyPhotoField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const imgSrc = asset('images/eddies-coated.jpg')

  const initial = useMemo(() => loadLayout(), [])
  const [channel, setChannel] = useState<Pt[]>(initial?.channel ?? DEFAULT_CHANNEL)
  const [eddies, setEddies] = useState<Eddy[]>(initial?.eddies ?? DEFAULT_EDDIES)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<Sel>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const geomRef = useRef({ channel, eddies, samples: buildSamples(channel, eddies) })
  geomRef.current = { channel, eddies, samples: buildSamples(channel, eddies) }

  const dragRef = useRef<Drag | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ channel, eddies }))
  }, [channel, eddies])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const sync = (width: number, height: number) => {
      setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }))
    }
    const box = wrap.getBoundingClientRect()
    sync(box.width, box.height)
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      sync(cr.width, cr.height)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let lastW = 0
    let lastH = 0
    const phase: number[] = []
    const cycle: number[] = []

    const resize = (width: number, height: number) => {
      if (width === lastW && height === lastH) return
      lastW = width
      lastH = height
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const box = wrap.getBoundingClientRect()
    resize(box.width, box.height)
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      resize(cr.width, cr.height)
    })
    ro.observe(wrap)

    const smoothstep = (x: number) => {
      const t = Math.min(1, Math.max(0, x))
      return t * t * (3 - 2 * t)
    }
    const draw = (now: number) => {
      if (!running) return
      const width = lastW
      const height = lastH
      if (width < 2 || height < 2) {
        raf = requestAnimationFrame(draw)
        return
      }
      ctx.clearRect(0, 0, width, height)
      const t = reduced || !active ? 0 : now * 0.001
      const flowPx = 18
      const { samples } = geomRef.current
      while (phase.length < samples.length) {
        phase.push(Math.random())
        cycle.push(4.8 + Math.random() * 2.8)
      }

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i]
        const origin = coverMap(width, height, s.u, s.v)
        ctx.save()
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (s.kind === 'eddy' && s.eu != null && s.ev != null && s.sense != null) {
          const c = coverMap(width, height, s.eu, s.ev)
          const R = Math.hypot(origin.x - c.x, origin.y - c.y)
          if (R > 4) {
            const sense = s.sense
            const base = Math.atan2(origin.y - c.y, origin.x - c.x)
            const spin = reduced ? 0 : sense * (flowPx / R)
            const aMid = base + t * spin
            // Same angular width ⇒ tighter curve near the centroid, gentler farther out.
            const span = 1.05
            const a0 = aMid - sense * span * 0.58
            const a1 = aMid + sense * span * 0.42
            const shimmer = reduced
              ? 0.85
              : 0.58 + 0.42 * (0.5 + 0.5 * Math.sin(t * 1.25 + phase[i] * 6.3))
            const alpha = shimmer * 0.78
            ctx.strokeStyle = `rgba(236,48,19,${alpha})`
            ctx.lineWidth = 1.05 + Math.min(3.4, R * 0.028)

            ctx.beginPath()
            const steps = Math.max(10, Math.round(R * span * 0.45))
            for (let k = 0; k <= steps; k++) {
              const a = a0 + ((a1 - a0) * k) / steps
              const px = c.x + R * Math.cos(a)
              const py = c.y + R * Math.sin(a)
              if (k === 0) ctx.moveTo(px, py)
              else ctx.lineTo(px, py)
            }
            ctx.stroke()

            const hx = c.x + R * Math.cos(a1)
            const hy = c.y + R * Math.sin(a1)
            const tx = -Math.sin(a1) * sense
            const ty = Math.cos(a1) * sense
            const head = Math.min(11, Math.max(4, 3.2 + R * 0.055))
            const nx = -ty
            const ny = tx
            ctx.beginPath()
            ctx.moveTo(hx - tx * head + nx * head * 0.48, hy - ty * head + ny * head * 0.48)
            ctx.lineTo(hx, hy)
            ctx.lineTo(hx - tx * head - nx * head * 0.48, hy - ty * head - ny * head * 0.48)
            ctx.stroke()
          }
        } else {
          const p = reduced ? 0.42 : (t / cycle[i] + phase[i]) % 1
          const tu = s.tu ?? 1
          const tv = s.tv ?? 0
          const ahead = coverMap(width, height, s.u + tu * 0.02, s.v + tv * 0.02)
          const ang = Math.atan2(ahead.y - origin.y, ahead.x - origin.x)
          const thickScale = 0.45 + ((phase[i] * 37.7) % 1) * 1.35
          const speedPx = flowPx * (0.55 + thickScale * 0.5)
          const drift = reduced ? 0 : p * speedPx * cycle[i]
          const x = origin.x + Math.cos(ang) * drift
          const y = origin.y + Math.sin(ang) * drift
          const lenScale = 0.65 + phase[i] * 0.9
          const lenMax = 22.5 * lenScale
          let tail = 0
          let tip = lenMax
          let alphaEnv = 1
          if (reduced) {
            tail = 0
            tip = lenMax * 0.85
          } else if (p < 0.36) {
            const g = smoothstep(p / 0.36)
            tail = 0
            tip = lenMax * g
            alphaEnv = g
          } else if (p < 0.58) {
            tail = 0
            tip = lenMax
          } else {
            const s = smoothstep((p - 0.58) / 0.42)
            tail = lenMax * s
            tip = lenMax
            alphaEnv = 1 - smoothstep(Math.max(0, (s - 0.62) / 0.38))
          }
          const shaft = tip - tail
          if (shaft >= 3) {
            const headMax = (4.2 + thickScale * 2.4)
            const head = Math.min(shaft * 0.48, headMax)
            const alpha = alphaEnv * (0.48 + thickScale * 0.28)
            ctx.strokeStyle = `rgba(32,30,29,${alpha})`
            ctx.translate(x, y)
            ctx.rotate(ang)
            ctx.lineWidth = (1.35 + 0.7 * alphaEnv) * thickScale
            ctx.beginPath()
            ctx.moveTo(tail, 0)
            ctx.lineTo(tip, 0)
            ctx.lineTo(tip - head * 0.72, -head * 0.55)
            ctx.moveTo(tip, 0)
            ctx.lineTo(tip - head * 0.72, head * 0.55)
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active, reduced])

  const clientToUv = useCallback(
    (clientX: number, clientY: number) => {
      const wrap = wrapRef.current
      if (!wrap) return null
      const rect = wrap.getBoundingClientRect()
      return coverUnmap(rect.width, rect.height, clientX - rect.left, clientY - rect.top)
    },
    [],
  )

  useEffect(() => {
    if (!editing) return
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const uv = clientToUv(e.clientX, e.clientY)
      if (!uv) return
      if (drag.kind === 'channel') {
        setChannel((prev) =>
          prev.map((pt, i) => (i === drag.index ? [round4(uv.u), round4(uv.v)] : pt)),
        )
      } else if (drag.kind === 'eddy') {
        setEddies((prev) =>
          prev.map((ed, i) =>
            i === drag.index ? { ...ed, u: round4(uv.u), v: round4(uv.v) } : ed,
          ),
        )
      } else {
        setEddies((prev) =>
          prev.map((ed, i) => {
            if (i !== drag.index) return ed
            const r = Math.max(
              0.012,
              Math.min(0.18, Math.hypot(uv.u - ed.u, ((uv.v - ed.v) * IH) / IW)),
            )
            return { ...ed, r: round4(r) }
          }),
        )
      }
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [editing, clientToUv])

  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (
        ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(
          e.key,
        )
      ) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setSelected(null)
        return
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selected) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (selected.kind === 'channel' && channel.length > 2) {
          setChannel((prev) => prev.filter((_, i) => i !== selected.index))
          setSelected(null)
        } else if (selected.kind === 'eddy') {
          setEddies((prev) => prev.filter((_, i) => i !== selected.index))
          setSelected(null)
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [editing, selected, channel.length])

  const startDrag = (drag: Drag, e: ReactPointerEvent<SVGCircleElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = drag
    setSelected({ kind: drag.kind === 'radius' ? 'eddy' : drag.kind, index: drag.index })
  }

  const onOverlayDoubleClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const uv = clientToUv(e.clientX, e.clientY)
    if (!uv) return
    let best = { i: -1, d2: 0.0025, u: uv.u, v: uv.v, t: 0.5 }
    for (let i = 0; i < channel.length - 1; i++) {
      const hit = closestOnSegment(uv.u, uv.v, channel[i], channel[i + 1])
      if (hit.d2 < best.d2 && hit.t > 0.08 && hit.t < 0.92) {
        best = { i, d2: hit.d2, u: hit.u, v: hit.v, t: hit.t }
      }
    }
    if (best.i >= 0) {
      const next = [...channel]
      next.splice(best.i + 1, 0, [round4(best.u), round4(best.v)])
      setChannel(next)
      setSelected({ kind: 'channel', index: best.i + 1 })
      return
    }
    const nextEddy: Eddy = { u: round4(uv.u), v: round4(uv.v), r: 0.04, sense: 1 }
    setEddies((prev) => [...prev, nextEddy])
    setSelected({ kind: 'eddy', index: eddies.length })
  }

  const copyCoords = async () => {
    const text = formatLayout(channel, eddies)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy these coordinates:', text)
    }
  }

  const reset = () => {
    setChannel(DEFAULT_CHANNEL)
    setEddies(DEFAULT_EDDIES)
    setSelected(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const flipSense = () => {
    if (!selected || selected.kind !== 'eddy') return
    setEddies((prev) =>
      prev.map((ed, i) =>
        i === selected.index ? { ...ed, sense: ed.sense === 1 ? -1 : 1 } : ed,
      ),
    )
  }

  const { w, h } = size
  const channelPts = channel.map(([u, v]) => coverMap(w, h, u, v))
  const poly = channelPts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div ref={wrapRef} className={styles.eddyPhoto} data-editing={editing || undefined}>
      <img src={imgSrc} alt="Coated garnets in a channel through porous rhyolite" />
      <canvas ref={canvasRef} className={styles.eddyPhotoCanvas} aria-hidden />

      {editing && w > 0 && (
        <svg
          className={styles.eddyEditorSvg}
          viewBox={`0 0 ${w} ${h}`}
          onDoubleClick={onOverlayDoubleClick}
        >
          <polyline
            points={poly}
            fill="none"
            stroke="rgba(236,48,19,0.85)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={poly}
            fill="none"
            stroke="transparent"
            strokeWidth={18}
            pointerEvents="stroke"
          />
          {eddies.map((e, i) => {
            const c = coverMap(w, h, e.u, e.v)
            const rim = coverMap(w, h, e.u + e.r, e.v)
            const on = selected?.kind === 'eddy' && selected.index === i
            return (
              <g key={`e-${i}`}>
                <ellipse
                  cx={c.x}
                  cy={c.y}
                  rx={e.r * c.dw}
                  ry={e.r * c.dw}
                  fill={on ? 'rgba(236,48,19,0.08)' : 'transparent'}
                  stroke={on ? 'rgba(236,48,19,0.95)' : 'rgba(236,48,19,0.55)'}
                  strokeWidth={on ? 2 : 1.25}
                  strokeDasharray={on ? undefined : '4 3'}
                />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={8}
                  className={styles.eddyHandle}
                  data-kind="eddy"
                  data-active={on || undefined}
                  onPointerDown={(ev) => startDrag({ kind: 'eddy', index: i }, ev)}
                />
                <circle
                  cx={rim.x}
                  cy={rim.y}
                  r={6}
                  className={styles.eddyHandleRim}
                  onPointerDown={(ev) => startDrag({ kind: 'radius', index: i }, ev)}
                />
              </g>
            )
          })}
          {channelPts.map((p, i) => {
            const on = selected?.kind === 'channel' && selected.index === i
            return (
              <circle
                key={`c-${i}`}
                cx={p.x}
                cy={p.y}
                r={on ? 8 : 6.5}
                className={styles.eddyHandle}
                data-kind="channel"
                data-active={on || undefined}
                onPointerDown={(ev) => startDrag({ kind: 'channel', index: i }, ev)}
              />
            )
          })}
        </svg>
      )}

      <div className={styles.eddyEditorBar}>
        <button
          type="button"
          className={`btn ${styles.eddyEditToggle}`}
          aria-pressed={editing}
          onClick={() => {
            setEditing((v) => !v)
            setSelected(null)
          }}
        >
          {editing ? 'Done editing' : 'Edit field'}
        </button>
        {editing && (
          <>
            <button type="button" className="btn btn-primary" onClick={copyCoords}>
              {copied ? 'Copied' : 'Copy coords'}
            </button>
            <button type="button" className="btn" onClick={reset}>
              Reset
            </button>
            {selected?.kind === 'eddy' && (
              <button type="button" className="btn" onClick={flipSense}>
                Flip spin {eddies[selected.index]?.sense === 1 ? '↻' : '↺'}
              </button>
            )}
            <span className={styles.eddyEditorHint}>
              Drag points · drag rim to resize · double-click path to add · double-click empty for
              eddy · delete to remove
            </span>
          </>
        )}
      </div>
    </div>
  )
}
