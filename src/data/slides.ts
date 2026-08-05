import { asset } from '../lib/asset'

export type LayoutKind =
  | 'cover'
  | 'divider'
  | 'content'
  | 'split'
  | 'bleed'
  | 'stage'
  | 'hero'
  | 'cols'

export type InteractiveKind =
  | 'locality-map'
  | 'xrf-chart'
  | 'libs-blast'
  | 'libs-peel'
  | 'libs-stack-3d'
  | 'cn-ratio'
  | 'crystal-viewer'
  | 'raman-bands'
  | 'raman-maturity'
  | 'raman-zoom'
  | 'eddy-field'
  | 'eddy-photo'

export type ChapterId = 'intro' | 'discovery' | 'chemistry' | 'receipt' | 'next'

export interface Slide {
  id: string
  label: string
  chapter: ChapterId
  chapterLabel?: string
  layout: LayoutKind
  kicker?: string
  title?: string
  displayTitle?: string
  subtitle?: string
  body?: string
  bullets?: string[]
  cols?: { heading: string; body: string }[]
  timeline?: { year: string; text: string }[]
  tree?: { year: string; text: string }[][]
  table?: { headers: string[]; rows: string[][] }
  image?: { src: string; alt: string; fit?: 'cover' | 'contain' }
  figures?: { src: string; alt: string; caption?: string }[]
  slideshow?: { src: string; alt: string }[]
  formula?: { expression: string; sites: { label: string; name: string }[] }
  meta?: string
  ghostNum?: string
  heroNum?: string
  interactive?: InteractiveKind
  /** Split layout: put the figure/interactive in the wider left column. */
  splitFlip?: boolean
  /** Bleed copy tone — photo = editorial caption under a contain image. */
  bleedTone?: 'photo'
  notes?: string
}

export const CHAPTERS: { id: ChapterId; num: string; title: string }[] = [
  { id: 'discovery', num: '01', title: 'The Discovery' },
  { id: 'chemistry', num: '02', title: 'Reading the Chemistry' },
  { id: 'receipt', num: '03', title: 'The Receipt' },
  { id: 'next', num: '04', title: "What's Next" },
]

export const slides: Slide[] = [
  // ── Intro ──────────────────────────────────────────────
  {
    id: 'title',
    label: 'Title',
    chapter: 'intro',
    layout: 'cover',
    displayTitle: 'A Garnet\nI Can\nFinally\nExplain',
    subtitle:
      'Thirty-five years. One coating nobody had described. Three instruments. An open investigation.',
    meta: 'Aaron Celestian, PhD · Curator of Mineral Sciences, NHMLA',
    image: {
      src: asset('images/best-garnet.jpg'),
      alt: 'Metallic black garnet crystal in light matrix with a bright specular facet',
    },
    notes: 'Open on wonder — not on methodology.',
  },
  {
    id: 'about',
    label: 'About',
    chapter: 'intro',
    layout: 'content',
    kicker: 'Introduction',
    title: 'Why it took 35 years',
    body: 'One sample at the root. Everything after branched out until the instruments — and the question — were ready.',
    tree: [
      [
        { year: '2026–', text: 'National Fellow, Explorers Club' },
        { year: '2025–', text: 'CTO, BrineWorks' },
        { year: '2023', text: 'R&D 100 Invention of the Year' },
      ],
      [
        { year: '2021–', text: 'Adjunct Prof., West LA College' },
        { year: '2020–23', text: 'Principal Scientist, MiST' },
        { year: '2018–25', text: 'NASA Research Scientist' },
      ],
      [
        { year: '2016–', text: 'Curator of Mineral Sciences, NHMLA' },
        { year: '2016–', text: 'Adjunct Professor, USC' },
      ],
      [
        { year: '2014–16', text: 'VP Research, TerraNova LLC' },
        { year: '2011–15', text: 'Director, Advanced Materials Lab' },
        { year: '2008–15', text: 'Professor, Western Kentucky' },
      ],
      [{ year: '2007', text: 'Professor, CUNY Queens College' }],
      [{ year: '2006', text: 'Ph.D., Stony Brook — nuclear waste storage' }],
      [{ year: '2002', text: 'M.S., Stony Brook — zeolites' }],
      [{ year: '1999', text: 'B.S. Geology / Mineralogy, U of Arizona' }],
      [{ year: '≈1991', text: 'High school — collected the garnet, age 15' }],
    ],
  },

  // ── 01 The Discovery ───────────────────────────────────
  {
    id: 'discovery-divider',
    label: 'The Discovery',
    chapter: 'discovery',
    layout: 'divider',
    ghostNum: '01',
    title: 'The Discovery',
  },
  {
    id: 'locality',
    label: 'Locality',
    chapter: 'discovery',
    layout: 'split',
    kicker: '01 · The Discovery',
    title: 'The Aquarius Mountains',
    body: 'Mohave County, Arizona — where the Colorado Plateau gives way to the Basin and Range. Miocene rhyolite, 24 to 20 million years old.',
    interactive: 'locality-map',
    notes: 'Point out park → climb → garnet horizon → cliff (~200 ft past) → sloping plateau.',
  },
  {
    id: 'orange-layer',
    label: 'Orange layer',
    chapter: 'discovery',
    layout: 'content',
    kicker: '01 · The Discovery',
    title: 'The orange layer',
    body: 'The garnets come from a distinct orange horizon — and from cavities where volcanic gases once escaped.',
    figures: [
      {
        src: asset('images/elephant-butte-face.jpg'),
        alt: 'Elephant Butte face with orange garnet-producing layer',
        caption:
          'Elephant Butte. The garnet-producing layer is the orange rock. Walk the talus below it.',
      },
      {
        src: asset('images/elephant-butte-conduit.jpg'),
        alt: 'Gas conduit textures in the rhyolite',
      },
    ],
  },
  {
    id: 'eddies',
    label: 'Gas eddies',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: 'Grown from steam',
    body: 'Vapor-phase crystallization — minerals growing directly from volcanic gas, no liquid step.',
    image: {
      src: asset('images/eddies-garnets.jpg'),
      alt: 'Rhyolite cavities with garnets in eddy pockets',
    },
  },
  {
    id: 'expected',
    label: 'Expected garnet',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: 'Black. Bright. Expected.',
    body: 'Perfect dodecahedra — known to collectors for decades.',
    image: {
      src: asset('images/garnet-in-matrix.jpg'),
      alt: 'Ordinary black mirror-bright garnet in matrix',
    },
  },
  {
    id: 'crystal',
    label: 'Crystal structure',
    chapter: 'discovery',
    layout: 'stage',
    kicker: '01 · The Discovery',
    title: 'One framework. Three chemistries.',
    body: 'The pyralspite series shares the same cubic crystal architecture — only the X-site cation changes.',
    formula: {
      expression: 'X₃Y₂(SiO₄)₃',
      sites: [
        { label: 'X', name: 'dodecahedral site' },
        { label: 'Y', name: 'octahedral site' },
      ],
    },
    cols: [
      {
        heading: 'Pyrope',
        body: 'Mg₃Al₂(SiO₄)₃ — magnesium end-member; high-P mantle and deep crust.',
      },
      {
        heading: 'Almandine',
        body: 'Fe₃Al₂(SiO₄)₃ — iron end-member. Aquarius Mountains sits here.',
      },
      {
        heading: 'Spessartine',
        body: 'Mn₃Al₂(SiO₄)₃ — manganese end-member; pegmatites and Mn-rich rocks.',
      },
    ],
    interactive: 'crystal-viewer',
    notes:
      'Wireframe = habit. Ball-and-stick = shared framework (andradite prototype; same topology). Emphasize solid solution, then land on almandine.',
  },
  {
    id: 'anomaly',
    label: 'The green one',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: 'It shouldn’t reflect green',
    body: 'A cold, metallic green — like a beetle’s wing. I was fifteen. We had no framework for it.',
    image: {
      src: asset('images/garnet-macro-coat.jpg'),
      alt: 'Garnet with metallic iridescent green coating',
    },
  },
  {
    id: 'two-kinds',
    label: 'Two kinds',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: 'Side by side',
    body: 'Same boulder, same habit, one coated, one not.',
    slideshow: [
      {
        src: asset('images/best-garnet.jpg'),
        alt: 'Dark metallic coated garnet in light matrix',
      },
      {
        src: asset('images/slideshow-opal.jpg'),
        alt: 'Garnet crystal seated in pale opaline host rock',
      },
      {
        src: asset('images/slideshow-macro-coat.jpg'),
        alt: 'Close macro of metallic coating on garnet facets',
      },
      {
        src: asset('images/slideshow-garnet-2.jpg'),
        alt: 'Garnet dodecahedron on tan porous matrix',
      },
      {
        src: asset('images/slideshow-garnet-3a.jpg'),
        alt: 'Garnet crystal on light matrix, soft focus background',
      },
    ],
  },
  {
    id: 'coating',
    label: 'A coating',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: 'A coating — not a new mineral',
    body: 'Worn edges peel away. Underneath: ordinary black garnet.',
    image: {
      src: asset('images/coating-worn-edge.jpg'),
      alt: 'Green coating worn away revealing black garnet',
    },
  },

  // ── 02 Reading the Chemistry ──────────────────────────
  {
    id: 'chemistry-divider',
    label: 'Reading the Chemistry',
    chapter: 'chemistry',
    layout: 'divider',
    ghostNum: '02',
    title: 'Reading the Chemistry',
  },
  {
    id: 'something-chose',
    label: 'Something chose',
    chapter: 'chemistry',
    layout: 'bleed',
    kicker: '02 · Reading the Chemistry',
    title: 'Something chose this garnet',
    body: 'The coating finds one population and leaves the other alone.',
    interactive: 'eddy-photo',
    notes:
      'Vector field swims the garnet channel, then spirals into the round pocks — vapor eddies written in the rock.',
  },
  {
    id: 'xrf-chart',
    label: 'XRF',
    chapter: 'chemistry',
    layout: 'split',
    kicker: '02 · Reading the Chemistry',
    title: 'Two populations, one outcrop',
    body: 'XRF reads through the nanometer film — into the crystals themselves. Iron and manganese match. Everything else diverges.',
    interactive: 'xrf-chart',
  },
  {
    id: 'mafic-signal',
    label: 'Mafic signal',
    chapter: 'chemistry',
    layout: 'cols',
    kicker: '02 · Reading the Chemistry',
    title: 'Two vapor pulses',
    cols: [
      {
        heading: 'Uncoated',
        body: 'Lower K/Rb, measurable rubidium — a more evolved rhyolitic vapor.',
      },
      {
        heading: 'Coated',
        body: 'Sc, Cr, Zn present. K without Rb — a mafic fluid signature the coating could read.',
      },
    ],
    body: 'Same mountain range. Different chemistries written into the crystals before the coating ever arrived.',
  },

  // ── 03 The Receipt ─────────────────────────────────────
  {
    id: 'receipt-divider',
    label: 'The Receipt',
    chapter: 'receipt',
    layout: 'divider',
    ghostNum: '03',
    title: 'The Receipt',
  },

  {
    id: 'dendrite-1',
    label: 'Dendrite I',
    chapter: 'chemistry',
    layout: 'bleed',
    kicker: '02 · Reading the Chemistry',
    title: 'Not how minerals grow',
    body: 'A branching front advancing across bare garnet — diffusion-limited. Film, not crust.',
    image: {
      src: asset('images/dendrite-1.jpg'),
      alt: 'Optical micrograph of dendritic coating margin on garnet',
    },
    notes: 'Linger here. These are the hero images.',
  },
  {
    id: 'dendrite-2',
    label: 'Dendrite II',
    chapter: 'chemistry',
    layout: 'bleed',
    kicker: '02 · Reading the Chemistry',
    title: 'The coating spreads',
    body: 'Rainbow shimmer = thin-film interference. Nanometers thick.',
    image: {
      src: asset('images/dendrite-2.jpg'),
      alt: 'Optical micrograph showing iridescent dendritic coating',
    },
  },
  {
    id: 'dendrite-3',
    label: 'Dendrite III',
    chapter: 'chemistry',
    layout: 'bleed',
    kicker: '02 · Reading the Chemistry',
    title: 'It looks alive',
    body: 'The morphology of systems growing under diffusion limitation — or of a biofilm expanding across a surface.',
    image: {
      src: asset('images/dendrite-margin.jpg'),
      alt: 'Optical micrograph of dendritic spreading margin',
    },
  },

  {
    id: 'raman',
    label: 'Raman',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: 'Raman: hematite, then carbon',
    body: 'Iron oxide at the margin. Disordered organic carbon on top — thermally immature. Tap the spectrum to zoom.',
    image: {
      src: asset('images/raman-comparison.png'),
      alt: 'Raman spectra comparing uncoated garnet and organic-rich coating',
      fit: 'contain',
    },
    interactive: 'raman-zoom',
    notes:
      'Tap: full → zoom low cm⁻¹ → garnet outline → hematite outline → easy pan to Fe ~1320 hitch → pan to organics → outline top gold D/G → out.',
  },
  {
    id: 'raman-bands',
    label: 'D & G',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'Where the D and G bands come from',
    body: 'Two vibrations of aromatic carbon. G is the ring’s stretch; D is its breathing — and breathing only shows up when the lattice is disordered.',
    interactive: 'raman-bands',
    notes:
      'Toggle G vs D. Strong D means thermally immature organic carbon — never cooked into graphite.',
  },
  {
    id: 'raman-maturity',
    label: 'Maturity',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'Carbon remembers heat',
    body: 'Fresh organic matter fluoresces. Heat orders the lattice — broad D and G bands appear, then sharpen toward graphite. A visual aid, not a calculation.',
    interactive: 'raman-maturity',
    notes: 'Park the slider near “Broad D·G” — that’s the coating.',
  },
  {
    id: 'libs-intro',
    label: 'LIBS',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'A laser reads the surface',
    body: 'A pulsed laser sparks a plasma cloud on the surface. From that flash: atoms from a near-complete elemental suite — light to heavy — sampled only a few micrometers deep.',
    interactive: 'libs-blast',
    notes:
      'Fire once. Hold on the plasma, then the little atoms (protons red, neutrons grey). Depth is the aside — suite is the point. Peel comes next.',
  },
  {
    id: 'libs',
    label: 'Delamination',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'It peeled like plywood',
    body: 'On this coating the pulse didn’t just vaporize — it delaminated. Carbon lifts, then hematite. Garnet stays.',
    interactive: 'libs-stack-3d',
    splitFlip: true,
  },
  {
    id: 'libs-craters',
    label: 'Craters',
    chapter: 'receipt',
    layout: 'bleed',
    bleedTone: 'photo',
    kicker: '03 · The Receipt',
    title: 'The craters\nkeep the receipt',
    body: 'LIBS pits on one face. Thin coating → interference colors. Gone coating → bare garnet. Thickness, written in light.',
    image: {
      src: asset('images/libs-craters.jpg'),
      alt: 'Macro of LIBS ablation craters on a coated garnet face with interference colors',
      fit: 'contain',
    },
    notes:
      'Point out concentric rings in the large pit, then the iridescent halos as thickness gradients. Ties the 3D peel to a real specimen.',
  },
  {
    id: 'sem-1',
    label: 'SEM I',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: '270×',
    body: 'The architecture of a film — continuous coating, not scattered crystals.',
    image: {
      src: asset('images/sem-1.jpg'),
      alt: 'SEM of globular coating surface',
    },
    notes: 'Wide field. Set up the morphology before zooming in.',
  },
  {
    id: 'sem-2',
    label: 'SEM II',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: '2,500×',
    body: 'Minerals from solution grow angles. This doesn’t.',
    image: {
      src: asset('images/sem-2.jpg'),
      alt: 'SEM close-up of coating globules',
    },
  },
  {
    id: 'sem-3',
    label: 'SEM III',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: '7,500×',
    body: 'Packed, rounded structures — 0.5 to 2 μm. No flat crystal faces.',
    image: {
      src: asset('images/sem-3.jpg'),
      alt: 'SEM of coating surface texture',
    },
    notes: 'Size matches coccoid bacteria. Let the image work.',
  },
  {
    id: 'specimens',
    label: 'The tray',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: 'Thirty-five years in a tray',
    body: 'Family collecting trips. Now part of the NHMLA research collection.',
    image: {
      src: asset('images/specimen-group.jpg'),
      alt: 'Group of Aquarius Mountains garnet specimens',
    },
  },
  {
    id: 'cn-ratio',
    label: 'C:N',
    chapter: 'receipt',
    layout: 'hero',
    kicker: '03 · The Receipt',
    heroNum: '4.9 : 1',
    body: 'Living microbes sit around 4–5 : 1. Fresh microbial leftovers can too. Aged biomass usually climbs higher as nitrogen is lost. The coating hasn’t.',
    interactive: 'cn-ratio',
    notes:
      'EDS atomic C:N. Band is microbial biomass / still-N-rich residue (~4–5). Degraded organics trend toward much higher C:N.',
  },
  {
    id: 'opal-host',
    label: 'In the rock',
    chapter: 'receipt',
    layout: 'bleed',
    kicker: '03 · The Receipt',
    title: 'Still in the host',
    body: 'Garnets seated where the vapor moved through.',
    image: {
      src: asset('images/eddies-coated.jpg'),
      alt: 'Coated garnets seated in a fracture within porous host rock',
    },
  },
  {
    id: 'hypothesis',
    label: 'Hypothesis',
    chapter: 'receipt',
    layout: 'content',
    kicker: '03 · The Receipt',
    title: 'A biological reading',
    bullets: [
      'Iron-oxidizing microbes may have colonized the coated population — leaving hematite as a metabolic byproduct',
      'The organic carbon above it: what remained of that biomass',
      'Crystal chemistry (Cr, Sc, Zn) may have made one population’s iron a better electron donor',
      'Still open: lipid biomarkers, cell-wall chemistry, or preserved DNA would close the case',
    ],
  },

  // ── 04 What's Next ─────────────────────────────────────
  {
    id: 'next-divider',
    label: "What's Next",
    chapter: 'next',
    layout: 'divider',
    ghostNum: '04',
    title: "What's Next",
  },
  {
    id: 'close',
    label: 'Close',
    chapter: 'next',
    layout: 'cover',
    kicker: 'Pocketful of Xtals',
    displayTitle: 'The Question\nIs Still Open',
    subtitle:
      'Field verification of the mafic fluid source. Molecular tests for biomarkers. The full series lives on Substack.',
    meta: 'aaroncelestian.substack.com',
    image: {
      src: asset('images/best-garnet.jpg'),
      alt: 'Metallic black garnet crystal in light matrix with a bright specular facet',
    },
  },
]
