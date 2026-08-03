export type LayoutKind =
  | 'cover'
  | 'divider'
  | 'content'
  | 'split'
  | 'bleed'
  | 'hero'
  | 'cols'

export type InteractiveKind =
  | 'locality-map'
  | 'xrf-chart'
  | 'libs-peel'
  | 'cn-ratio'
  | 'crystal-viewer'

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
  table?: { headers: string[]; rows: string[][] }
  image?: { src: string; alt: string }
  meta?: string
  ghostNum?: string
  heroNum?: string
  interactive?: InteractiveKind
  notes?: string
}

export const CHAPTERS: { id: ChapterId; num: string; title: string }[] = [
  { id: 'discovery', num: '01', title: 'The Discovery' },
  { id: 'chemistry', num: '02', title: 'Reading the Chemistry' },
  { id: 'receipt', num: '03', title: 'The Receipt' },
  { id: 'next', num: '04', title: "What's Next" },
]

const SUBSTACK = {
  talus:
    'https://substackcdn.com/image/fetch/$s_!yrWP!,w_1200,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc3edff55-74b8-44e0-ab7d-32cc18df4497_2048x1535.jpeg',
  expected:
    'https://substackcdn.com/image/fetch/$s_!H6YP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3a076bd6-a8b8-4c22-8bcd-2a7ebc27d012_2048x1460.jpeg',
  green:
    'https://substackcdn.com/image/fetch/$s_!yn_S!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feffbff5e-bd14-4496-8ed5-96da18beb938_2048x1907.jpeg',
  worn:
    'https://substackcdn.com/image/fetch/$s_!WfZj!,w_1200,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf8c1b56-6c88-4dd2-bf7e-5e8b878bb378_1139x1080.jpeg',
  sem: 'https://substackcdn.com/image/fetch/$s_!Q7BW!,w_1200,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0b62bb7d-ae38-479e-8523-e852ffc1c9a5_1280x1024.png',
}

export const slides: Slide[] = [
  {
    id: 'title',
    label: 'Title',
    chapter: 'intro',
    layout: 'cover',
    kicker: 'Pocketful of Xtals',
    displayTitle: "A Garnet I Still\nCan't Explain",
    subtitle:
      'Thirty-five years with a coating nobody had described — the Aquarius Mountains garnets, and what three instruments found on their surface.',
    meta: 'Aaron Celestian, PhD · Curator of Mineral Sciences, NHMLA',
    image: {
      src: '/images/garnet-macro.jpg',
      alt: 'Dark metallic garnet crystal in white matrix',
    },
    notes:
      'Welcome. This talk follows an open investigation still in progress — three Substack posts, three instruments, one unanswered question at the end.',
  },
  {
    id: 'contents',
    label: 'Contents',
    chapter: 'intro',
    layout: 'content',
    title: 'Contents',
    bullets: [
      '01 — The Discovery',
      '02 — Reading the Chemistry',
      '03 — The Receipt',
      "04 — What's Next",
    ],
  },
  {
    id: 'about',
    label: 'About',
    chapter: 'intro',
    layout: 'content',
    kicker: 'Introduction',
    title: 'About this collection',
    bullets: [
      'Curator of Mineral Sciences, Natural History Museum of Los Angeles County',
      'Former scientist, NASA Jet Propulsion Laboratory; adjunct professor, USC',
      'The specimens in this talk are family collecting trips going back 35 years, now part of the NHMLA research collection',
      'Everything here is written up as an open investigation on Substack — Pocketful of Xtals',
    ],
  },
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
    layout: 'content',
    kicker: '01 · The Discovery',
    title: 'The Aquarius Mountains',
    body: 'The range sits on the transition itself — the high, ancient Colorado Plateau to the northeast giving way to the stretched, faulted Basin and Range to the southwest. The rhyolite here is Miocene, roughly 24 to 20 million years old.',
    interactive: 'locality-map',
  },
  {
    id: 'collecting',
    label: 'Collecting',
    chapter: 'discovery',
    layout: 'split',
    kicker: '01 · The Discovery',
    title: 'Walking the talus',
    body: "You find these garnets by walking the slopes below the rhyolite outcrops, eyes down, until the light catches something that doesn't belong to the dirt. My family has been coming here for decades.",
    image: {
      src: SUBSTACK.talus,
      alt: 'The Aquarius Mountains at Elephant Butte, showing the orange garnet-producing layer in the rhyolite',
    },
  },
  {
    id: 'expected',
    label: 'The expected garnet',
    chapter: 'discovery',
    layout: 'split',
    kicker: '01 · The Discovery',
    title: 'Black. Bright. Expected.',
    body: 'Perfectly formed dodecahedra, sitting loose in their rust-orange weathering pockets or still seated in the rhyolite. Not rare, not valuable — known to collectors for decades. Most of the time, this is exactly what you find.',
    image: {
      src: '/images/garnet-in-matrix.jpg',
      alt: 'An ordinary black, mirror-bright garnet dodecahedron seated in light matrix',
    },
  },
  {
    id: 'crystal',
    label: 'Crystal structure',
    chapter: 'discovery',
    layout: 'split',
    kicker: '01 · The Discovery',
    title: 'A dodecahedron full of atoms',
    body: 'Garnet crystallizes in the cubic space group Ia‑3d. Drag to orbit — the outer wireframe is the crystal habit; inside is the ball-and-stick framework from structure data (andradite prototype; same topology as almandine).',
    interactive: 'crystal-viewer',
  },
  {
    id: 'anomaly',
    label: 'The anomaly',
    chapter: 'discovery',
    layout: 'bleed',
    kicker: '01 · The Discovery',
    title: "The one that shouldn't reflect green",
    body: "A cold, metallic green — the kind you associate with a beetle's wing, not a silicate mineral. I turned it in my hand. The color moved. It was not a reflection of the sky. I was fifteen. We had no framework for it.",
    image: {
      src: SUBSTACK.green,
      alt: 'A garnet with a metallic, iridescent green coating, catching the light',
    },
  },
  {
    id: 'coating',
    label: 'A coating, not a species',
    chapter: 'discovery',
    layout: 'split',
    kicker: '01 · The Discovery',
    title: 'A coating, not a new mineral',
    body: 'Years in, I noticed the worn edges — spots where the metallic surface had peeled away. Underneath: black, ordinary, mirror-bright garnet. The same mineral underneath, with something thin and green on top.',
    image: {
      src: SUBSTACK.worn,
      alt: 'A garnet showing the green coating worn away at the edge, revealing black garnet underneath',
    },
  },
  {
    id: 'vapor',
    label: 'How they formed',
    chapter: 'discovery',
    layout: 'cols',
    kicker: '01 · The Discovery',
    title: 'Garnets that grew from steam',
    cols: [
      {
        heading: 'Not a skarn, not hydrothermal',
        body: 'Most andradite-group garnets form in skarns, where magma meets limestone, or in hydrothermal veins where hot fluids move through fractured rock.',
      },
      {
        heading: 'Vapor-phase crystallization',
        body: 'These grew directly from volcanic gases in cavities within the cooling rhyolite — no liquid step at all. The rhyolite itself is roughly 24 to 20 million years old.',
      },
    ],
  },
  {
    id: 'two-records',
    label: 'Two records',
    chapter: 'discovery',
    layout: 'content',
    kicker: '01 · The Discovery',
    title: 'Two records, one crystal',
    bullets: [
      'The garnet crystallized from vapor when the rhyolite was still cooling',
      'The coating formed later, on crystals that had already solidified',
      'Not every garnet in the same pocket carries it — some coated, some not, no obvious pattern',
      'Nobody had published on this coating before. The rest of this talk is the investigation',
    ],
  },
  {
    id: 'chemistry-divider',
    label: 'Reading the Chemistry',
    chapter: 'chemistry',
    layout: 'divider',
    ghostNum: '02',
    title: 'Reading the Chemistry',
  },
  {
    id: 'xrf-explain',
    label: 'XRF',
    chapter: 'chemistry',
    layout: 'content',
    kicker: '02 · Reading the Chemistry',
    title: 'What XRF measures',
    bullets: [
      'X-ray fluorescence fires X-rays at a sample; each element responds at its own characteristic energy',
      'The beam here is 1.2 millimeters wide and sums everything it hits into one spectrum',
      'The coating is only 100–700 nanometers thick — far too thin for this beam to see. It reads straight through to the garnet',
      'Seven spectra total: three uncoated specimens, four coated',
    ],
  },
  {
    id: 'xrf-chart',
    label: 'Two populations',
    chapter: 'chemistry',
    layout: 'split',
    kicker: '02 · Reading the Chemistry',
    title: 'Two populations, one outcrop',
    body: 'Blue is the uncoated population, averaged across three measurements. Orange is the coated population, averaged across four. Iron and manganese — the garnet signal — are large in both. Everything else diverges.',
    interactive: 'xrf-chart',
  },
  {
    id: 'signature',
    label: 'The signature',
    chapter: 'chemistry',
    layout: 'content',
    kicker: '02 · Reading the Chemistry',
    title: "The coated population's signature",
    table: {
      headers: ['Element', 'Coated', 'Uncoated', 'Reading'],
      rows: [
        [
          'Scandium',
          '~58 cps/mA',
          'Not detected',
          'No site in almandine — points to a mafic fluid source',
        ],
        [
          'Chromium',
          '~200 cps/mA',
          'Not detected',
          'Largest single difference — chromite, a mafic signature',
        ],
        [
          'Zinc',
          '~65 cps/mA',
          'Not detected',
          'Volatile-soluble, concentrates in vapor phases',
        ],
        [
          'Phosphorus + calcium',
          'Elevated together',
          'Near zero',
          'Consistent with apatite micro-inclusions',
        ],
        [
          'Potassium : Rubidium',
          'K high, Rb absent',
          'K lower, Rb present',
          'K/Rb ~1000 = mafic fluid; below 200 = evolved, felsic',
        ],
      ],
    },
  },
  {
    id: 'pyralspite',
    label: 'Pyralspite reference',
    chapter: 'chemistry',
    layout: 'content',
    kicker: '02 · Reading the Chemistry',
    title: 'The pyralspite series',
    table: {
      headers: ['Species', 'Formula', 'Note'],
      rows: [
        [
          'Pyrope',
          'Mg₃Al₂Si₃O₁₂',
          'Magnesium end member — not what this locality produces',
        ],
        [
          'Almandine',
          'Fe₃Al₂Si₃O₁₂',
          'Iron-rich end member — the Aquarius Mountains garnets',
        ],
        [
          'Spessartine',
          'Mn₃Al₂Si₃O₁₂',
          'Manganese-rich end member — the other axis the XRF measured',
        ],
        [
          'Andradite',
          'Ca₃Fe₂Si₃O₁₂',
          'The original field call for this locality, based on habit alone',
        ],
      ],
    },
  },
  {
    id: 'correction',
    label: 'Correction',
    chapter: 'chemistry',
    layout: 'content',
    kicker: '02 · Reading the Chemistry',
    title: 'Correcting the record',
    bullets: [
      'These garnets were called andradite throughout the first two posts — black, dodecahedral, volcanic context',
      'That identification was field observation, not chemistry',
      "The XRF data, and Mindat's listing for this locality, both point to almandine instead",
      'The garnet identity is now itself part of the open investigation',
    ],
  },
  {
    id: 'two-pulses',
    label: 'Mafic vs felsic',
    chapter: 'chemistry',
    layout: 'cols',
    kicker: '02 · Reading the Chemistry',
    title: 'Two vapor pulses, two garnets',
    cols: [
      {
        heading: 'Population A — uncoated',
        body: 'Lower K/Rb, measurable rubidium — a vapor pulse from a more evolved, purely rhyolitic source.',
      },
      {
        heading: 'Population B — coated',
        body: 'K/Rb near 1000, scandium and chromium present — a vapor pulse carrying a mafic signature, from somewhere in the same volcanic field.',
      },
    ],
    body: 'The Aquarius Mountains volcanic field runs from primitive basalt through to rhyolite over roughly 400 km². Tracing the exact fluid pathway is fieldwork still to be done.',
  },
  {
    id: 'receipt-divider',
    label: 'The Receipt',
    chapter: 'receipt',
    layout: 'divider',
    ghostNum: '03',
    title: 'The Receipt',
  },
  {
    id: 'raman-explain',
    label: 'Raman',
    chapter: 'receipt',
    layout: 'content',
    kicker: '03 · The Receipt',
    title: 'What Raman spectroscopy reveals',
    bullets: [
      'A laser fires at the surface; a tiny fraction of the light returns shifted in frequency',
      'The shift is specific to the vibrating chemical bond — a fingerprint, not a rough guess',
      "On a coating this thin, the laser reads mostly what's on the surface, not the garnet beneath",
      'The uncoated garnet came back as clean almandine. The coating came back as something else',
    ],
  },
  {
    id: 'hematite-carbon',
    label: 'Hematite and carbon',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'Hematite, then carbon',
    body: "At the coating margin: hematite, an iron oxide — the garnet's iron converted from its stable ferrous form to oxidized ferric. Elsewhere: disordered organic carbon, thermally immature — never cooked, never buried deep.",
    image: {
      src: '/images/garnet-raman.png',
      alt: 'Raman spectra showing garnet, hematite, and organic carbon peaks',
    },
  },
  {
    id: 'libs',
    label: 'LIBS',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'The plywood discovery',
    bullets: [
      'Laser-induced breakdown spectroscopy (LIBS) vaporizes a tiny amount of surface per pulse, reading it layer by layer',
      "The coating didn't vaporize evenly — it delaminated, the way old plywood separates along its ply boundaries",
      'Two distinct layers, each lifting cleanly, each measured separately with Raman',
      'Stratigraphy, bottom to top: garnet → hematite → organic carbon. A sequence, in order',
    ],
    interactive: 'libs-peel',
  },
  {
    id: 'sem',
    label: 'SEM',
    chapter: 'receipt',
    layout: 'split',
    kicker: '03 · The Receipt',
    title: 'The coating at 7,500×',
    body: "Packed, rounded, sub-spherical structures, 0.5 to 2 micrometers across — no flat faces, no angular boundaries. Minerals crystallizing from solution grow geometric forms. This isn't that. The size matches coccoid bacteria.",
    image: {
      src: SUBSTACK.sem,
      alt: 'SEM image at 7500x magnification showing packed sub-spherical globular structures on the coating surface',
    },
  },
  {
    id: 'eds',
    label: 'EDS',
    chapter: 'receipt',
    layout: 'cols',
    kicker: '03 · The Receipt',
    title: 'What EDS found in the coating',
    cols: [
      {
        heading: 'Carbon — 31.5%',
        body: 'Confirms the organic carbon Raman already identified, and puts a number on it.',
      },
      {
        heading: 'Nitrogen — 7.5%',
        body: 'No mineral phase at this locality explains a nitrogen signal. It is the structural backbone of amino acids and proteins.',
      },
      {
        heading: 'Phosphorus — 2.1%',
        body: 'The backbone of nucleic acids and cell membranes. Sodium, potassium and chlorine here are just a fingerprint.',
      },
    ],
  },
  {
    id: 'cn-ratio',
    label: 'C to N ratio',
    chapter: 'receipt',
    layout: 'hero',
    kicker: '03 · The Receipt',
    heroNum: '4.9 : 1',
    body: 'The carbon-to-nitrogen ratio in the coating — squarely in the range living and dying microorganisms produce (4:1 to 6:1). Plant-derived oxalic acid alone carries no nitrogen at all; its ratio would be infinite.',
    interactive: 'cn-ratio',
  },
  {
    id: 'hypothesis',
    label: 'The hypothesis',
    chapter: 'receipt',
    layout: 'content',
    kicker: '03 · The Receipt',
    title: 'A biological reading',
    bullets: [
      'Iron-oxidizing bacteria colonized the coated garnets, converting surface Fe²⁺ to Fe³⁺ and leaving hematite as the metabolic byproduct',
      'The organic carbon layer above it is what remained of the bacteria themselves — biomass, fossilized in place',
      "The coated population's crystal chemistry — elevated Cr, Sc, Zn substituting into the lattice — made its iron a more available electron donor",
      "The uncoated population, with a cleaner lattice, didn't offer the same opportunity. The coating is the record of that selection",
    ],
  },
  {
    id: 'cactus',
    label: 'The cactus connection',
    chapter: 'receipt',
    layout: 'content',
    kicker: '03 · The Receipt',
    title: 'Where the organic matter might come from',
    bullets: [
      'Dying cacti release oxalic acid and other organics that migrate down into the soil and rock below — a documented Arizona pathway',
      'Anthony Kampf, Curator Emeritus at NHMLA, has described over a dozen new mineral species formed this way at sites like the Rowley Mine',
      'The Aquarius Mountains garnets may record a version of the same process — organic input meeting an iron-bearing surface already in biological territory',
    ],
  },
  {
    id: 'open-questions',
    label: 'Open questions',
    chapter: 'receipt',
    layout: 'content',
    kicker: '03 · The Receipt',
    title: 'What would close the case',
    bullets: [
      'The sub-spherical morphology is consistent with bacteria, but also with other processes that produce rounded structures at this scale',
      'The C:N ratio fits biology, but would also fit accumulated non-living organic material from a biological source',
      "What's still missing: lipid biomarkers, intact cell-wall chemistry, or preserved DNA",
    ],
  },
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
      'Field verification of the mafic fluid source. Molecular tests for lipid biomarkers or preserved DNA. Read the full series — three posts, three instruments — at Pocketful of Xtals on Substack.',
    meta: 'aaroncelestian.substack.com',
    image: {
      src: '/images/pyrite-vein.jpg',
      alt: 'Porous volcanic rock with metallic crystals in a central vein',
    },
  },
]
