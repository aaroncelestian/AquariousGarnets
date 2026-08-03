# Aquarius Mountains Garnets — Story Site

Scroll-snap storytelling presentation for *Pocketful of Xtals*: an open investigation of the Aquarius Mountains garnets.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Present

- **Scroll** — each section snaps to a full viewport “slide”
- **Keyboard** — `→` / `↓` / `Space` next · `←` / `↑` previous · `Home` / `End`
- **Chapters** — bottom-left TOC jumps to chapter dividers
- **Dots** — right-edge progress jumps to any beat

## Interactives

- Locality map with animated pin + elevation profile
- 3D dodecahedron habit + ball-and-stick garnet structure (from `assests/Andradite__0000246.cif`)
- XRF coated / uncoated toggle chart
- LIBS coating peel stepper
- C:N ratio number line

Regenerate structure JSON after CIF changes:

```bash
npm run parse-cif
```

## Build

```bash
npm run build
npm run preview
```
