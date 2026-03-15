import type {
  AIGenerationForm,
  ExportOptions,
  FieldDefinition,
  ListFieldDefinition,
  ProjectData,
  ProjectListKey,
  TemplateSchema,
} from './types'

function createSvgDataUri(markup: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`
}

function createLogoPlaceholder(label: string) {
  return createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 96">
      <rect width="320" height="96" rx="24" fill="#f7efe8"/>
      <rect x="16" y="16" width="64" height="64" rx="18" fill="#d8a47f"/>
      <text x="48" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#fff">B</text>
      <text x="104" y="58" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#51382a">${label}</text>
    </svg>
  `)
}

function createMediaPlaceholder(label: string, accent: string) {
  return createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbf5ef"/>
          <stop offset="100%" stop-color="#f3e3d3"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" rx="72" fill="url(#bg)"/>
      <rect x="110" y="110" width="980" height="980" rx="56" fill="#fffaf6" stroke="${accent}" stroke-width="18" stroke-dasharray="30 18"/>
      <circle cx="600" cy="470" r="170" fill="${accent}" opacity="0.18"/>
      <rect x="350" y="650" width="500" height="34" rx="17" fill="${accent}" opacity="0.24"/>
      <rect x="420" y="720" width="360" height="26" rx="13" fill="${accent}" opacity="0.16"/>
      <text x="600" y="550" text-anchor="middle" font-family="Arial, sans-serif" font-size="68" font-weight="700" fill="#5f4638">${label}</text>
    </svg>
  `)
}

function createAvatarPlaceholder(label: string, accent: string) {
  return createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="60" fill="${accent}"/>
      <circle cx="60" cy="48" r="22" fill="#fff" opacity="0.92"/>
      <path d="M26 100c8-18 21-28 34-28s26 10 34 28" fill="#fff" opacity="0.92"/>
      <text x="60" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">${label}</text>
    </svg>
  `)
}

const mediaAccents = ['#d8a47f', '#c97b63', '#7c8b6b', '#4f6d7a', '#9c6644']

const topBarAvatarPlaceholders = ['A', 'B', 'C', 'D'].map((label, index) => ({
  src: createAvatarPlaceholder(label, mediaAccents[index % mediaAccents.length]),
  alt: `Avatar placeholder ${index + 1}`,
}))

const galleryPlaceholders = ['HERO 1', 'HERO 2', 'DETAIL 1', 'DETAIL 2', 'DETAIL 3'].map(
  (label, index) => ({
    src: createMediaPlaceholder(label, mediaAccents[index % mediaAccents.length]),
    alt: `Immagine placeholder ${index + 1}`,
  }),
)

const sectionImagePlaceholders = ['BENEFIT 1', 'BENEFIT 2', 'PROOF 1', 'PROOF 2'].map(
  (label, index) => ({
    src: createMediaPlaceholder(label, mediaAccents[(index + 1) % mediaAccents.length]),
    alt: `Immagine sezione placeholder ${index + 1}`,
  }),
)

const demoMediaPlaceholders = ['DEMO 1', 'DEMO 2', 'DEMO 3'].map((label, index) => ({
  src: createMediaPlaceholder(label, mediaAccents[(index + 2) % mediaAccents.length]),
  alt: `Demo placeholder ${index + 1}`,
}))

export const defaultProjectData: ProjectData = {
  projectName: 'Landing Master',
  metaTitle: 'Titolo prodotto | Brand',
  metaDescription:
    'Template landing pronto per essere personalizzato con il tuo prodotto, il tuo copy e i tuoi asset.',
  brandName: 'Brand',
  logoSrc: createLogoPlaceholder('BRAND'),
  logoAlt: 'Logo brand',
  productTitle: 'Titolo prodotto ad alta conversione',
  productSubtitle:
    'Promessa principale, beneficio chiave e motivo per cui conviene agire adesso.',
  salePrice: 'EUR 29,90',
  comparePrice: 'EUR 59,90',
  saveBadgeText: '- 50%',
  primaryCtaLabel: 'Scopri l offerta',
  ctaUrl: '#offerta',
  topBarRatingText: 'Clienti soddisfatti e feedback positivi',
  topBarAvatars: topBarAvatarPlaceholders,
  gallery: galleryPlaceholders,
  sectionImages: sectionImagePlaceholders,
  demoMedia: demoMediaPlaceholders,
  reviewerAvatarSrc: createAvatarPlaceholder('R', '#d8a47f'),
  reviewerAvatarAlt: 'Avatar placeholder',
  bulletPoints: [
    { text: 'Beneficio chiave espresso in modo diretto' },
    { text: 'Riduce una frizione concreta della routine' },
    { text: 'Valore percepito chiaro anche a colpo d occhio' },
    { text: 'Perfetto per un offerta orientata alla conversione' },
  ],
  offerHighlights: [
    { text: 'Offerta entry level pronta da testare' },
    { text: 'Bundle o upsell facile da comunicare' },
    { text: 'Urgenza commerciale da personalizzare' },
  ],
  shippingAccordionTitle: 'Informazioni sulla spedizione',
  shippingAccordionText:
    'Inserisci qui tempi di preparazione, tracking, corriere e note logistiche del prodotto.',
  returnsAccordionTitle: 'Politica di reso',
  returnsAccordionText:
    'Inserisci qui reso, garanzia, condizioni di rimborso e qualsiasi dettaglio legale richiesto.',
  mixingSectionHeading:
    'Aggancia subito il problema principale che il prodotto risolve',
  mixingSectionBody:
    'Qui va il blocco che spiega la trasformazione: cosa cambia prima, cosa succede dopo e perche il risultato si percepisce subito.',
  mixingSectionCtaLabel: 'Voglio provarlo',
  routineSectionHeading: 'Mostra come il prodotto migliora la routine quotidiana',
  routineSectionBody:
    'Spiega il contesto d uso ideale, i momenti della giornata in cui il prodotto aiuta e il motivo per cui risulta pratico.',
  comparisonSectionHeading: 'Perche questa proposta convince piu delle alternative',
  comparisonSectionBody:
    'Confronta in modo concreto materiali, esperienza, comodita e valore percepito senza usare promesse non verificabili.',
  resultsSectionHeading: 'Benefit chiari, veloci da capire e facili da ricordare',
  resultsItems: [
    {
      percent: '1 uso',
      text: 'Il primo beneficio deve essere evidente gia al primo contatto con il prodotto.',
    },
    {
      percent: '24h',
      text: 'Spiega il vantaggio pratico che il cliente percepisce nella routine quotidiana.',
    },
    {
      percent: 'plug&play',
      text: 'Sottolinea la facilita d uso e la velocita con cui si capisce il valore dell acquisto.',
    },
  ],
  portabilitySectionHeading:
    'Adattalo a scenari d uso reali e facilmente immaginabili',
  portabilitySectionBody:
    'Inserisci qui i contesti in cui il prodotto risulta comodo, trasportabile, semplice da usare o immediatamente utile.',
  portabilitySectionCtaLabel: 'Vai all offerta',
  faqHeading: 'Domande frequenti per acquistare con fiducia',
  faqIntro: 'Risposte chiare su utilizzo, spedizione, resi, materiali e obiezioni principali.',
  faqItems: [
    {
      question: 'Quanto tempo serve per iniziare a usarlo?',
      answer:
        'Spiega in modo semplice come si usa, quanto e immediato il setup e se serve qualche preparazione iniziale.',
    },
    {
      question: 'Quali materiali o caratteristiche vale la pena sapere?',
      answer:
        'Inserisci solo dettagli verificabili su materiali, struttura, sicurezza d uso e indicazioni di manutenzione.',
    },
    {
      question: 'Per chi e indicato questo prodotto?',
      answer:
        'Chiarisci il target, i casi d uso principali e chi ne trae piu beneficio nella pratica.',
    },
    {
      question: 'Come funzionano spedizione, tracking o tempi di consegna?',
      answer:
        'Inserisci qui tutte le informazioni logistiche che riducono incertezza prima dell acquisto.',
    },
    {
      question: 'Cosa succede se il prodotto non fa per me?',
      answer:
        'Spiega garanzia, reso o rimborso in modo rassicurante ma preciso, senza claim troppo aggressivi.',
    },
  ],
  guaranteeTitle: 'Garanzia chiara, fiducia alta e acquisto senza stress',
  guaranteeText:
    'Qui posizioni la tua garanzia commerciale, il rimborso o la prova prodotto in modo solido e credibile.',
  reviewHeading: 'Ecco cosa dicono gli altri',
  reviewSubheading: 'Sostituisci con feedback reali e verificabili',
  reviewVerifiedLabel: 'Cliente',
  reviewItems: Array.from({ length: 12 }, (_, index) => ({
    imageSrc: createAvatarPlaceholder(
      String(index + 1),
      mediaAccents[index % mediaAccents.length],
    ),
    author: `Cliente ${index + 1}`,
    quote:
      'Inserisci qui una recensione reale e verificabile prima della pubblicazione della landing.',
  })),
}

export const defaultAIGenerationForm: AIGenerationForm = {
  productName: '',
  brandName: '',
  productCategory: '',
  productDescription:
    '',
  targetAudience: '',
  painPoints: '',
  keyBenefits: '',
  differentiators: '',
  offerDetails: '',
  proofPoints: '',
  faqsContext: '',
  copyMasterPrompt: '',
  copyStyleExamples: '',
  copyInstructions:
    'Scrivi in italiano, orientato conversione, tono chiaro e concreto, evita promesse mediche o non verificabili.',
}

export const defaultExportOptions: ExportOptions = {
  fileName: 'landing-master.html',
  assetMode: 'inline',
  includeInteractiveScript: true,
}

export const templateSchema: TemplateSchema = {
  id: 'master-template',
  name: 'Master Template',
  description:
    'Genera un HTML singolo partendo dalla landing master reale collegata al progetto.',
  sections: [
    {
      id: 'brand',
      title: 'Brand e metadata',
      description: 'Sostituisci logo, brand e meta della pagina senza toccare il layout.',
      fields: [
        {
          key: 'projectName',
          label: 'Nome progetto',
          type: 'text',
          defaultValue: defaultProjectData.projectName,
        },
        {
          key: 'brandName',
          label: 'Nome brand',
          type: 'text',
          defaultValue: defaultProjectData.brandName,
        },
        {
          key: 'logoSrc',
          label: 'Logo',
          type: 'image',
          defaultValue: defaultProjectData.logoSrc,
        },
        {
          key: 'logoAlt',
          label: 'Alt logo',
          type: 'text',
          defaultValue: defaultProjectData.logoAlt,
        },
        {
          key: 'metaTitle',
          label: 'Meta title',
          type: 'text',
          defaultValue: defaultProjectData.metaTitle,
        },
        {
          key: 'metaDescription',
          label: 'Meta description',
          type: 'richtext',
          defaultValue: defaultProjectData.metaDescription,
        },
      ],
    },
    {
      id: 'hero',
      title: 'Hero e acquisto',
      description:
        'Qui controlli titolo, prezzi, CTA, proof rapidi e testi che stanno sopra il fold.',
      fields: [
        {
          key: 'productTitle',
          label: 'Titolo prodotto',
          type: 'richtext',
          defaultValue: defaultProjectData.productTitle,
        },
        {
          key: 'productSubtitle',
          label: 'Sottotitolo prodotto',
          type: 'richtext',
          defaultValue: defaultProjectData.productSubtitle,
        },
        {
          key: 'salePrice',
          label: 'Prezzo scontato',
          type: 'text',
          defaultValue: defaultProjectData.salePrice,
        },
        {
          key: 'comparePrice',
          label: 'Prezzo barrato',
          type: 'text',
          defaultValue: defaultProjectData.comparePrice,
        },
        {
          key: 'saveBadgeText',
          label: 'Badge sconto',
          type: 'text',
          defaultValue: defaultProjectData.saveBadgeText,
        },
        {
          key: 'primaryCtaLabel',
          label: 'CTA principale',
          type: 'text',
          defaultValue: defaultProjectData.primaryCtaLabel,
        },
        {
          key: 'ctaUrl',
          label: 'URL CTA',
          type: 'url',
          defaultValue: defaultProjectData.ctaUrl,
        },
        {
          key: 'topBarRatingText',
          label: 'Rating top bar',
          type: 'text',
          defaultValue: defaultProjectData.topBarRatingText,
        },
        {
          key: 'shippingAccordionTitle',
          label: 'Titolo spedizione',
          type: 'text',
          defaultValue: defaultProjectData.shippingAccordionTitle,
        },
        {
          key: 'shippingAccordionText',
          label: 'Testo spedizione',
          type: 'richtext',
          defaultValue: defaultProjectData.shippingAccordionText,
        },
        {
          key: 'returnsAccordionTitle',
          label: 'Titolo reso',
          type: 'text',
          defaultValue: defaultProjectData.returnsAccordionTitle,
        },
        {
          key: 'returnsAccordionText',
          label: 'Testo reso',
          type: 'richtext',
          defaultValue: defaultProjectData.returnsAccordionText,
        },
      ],
    },
    {
      id: 'media',
      title: 'Media e proof',
      description:
        'Carica immagini nuove e il motore le rimappa sugli slot visivi della master attiva, lasciando fissi gli elementi master non parametrizzati.',
      fields: [
        {
          key: 'gallery',
          label: 'Gallery principale',
          type: 'list',
          itemLabel: 'Media',
          defaultValue: defaultProjectData.gallery,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Media prodotto',
            },
          ],
          minItems: 1,
        },
        {
          key: 'sectionImages',
          label: 'Immagini sezioni contenuto',
          type: 'list',
          itemLabel: 'Immagine',
          defaultValue: defaultProjectData.sectionImages,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Immagine sezione',
            },
          ],
          minItems: 1,
        },
        {
          key: 'demoMedia',
          label: 'Demo GIF / media',
          type: 'list',
          itemLabel: 'Demo',
          defaultValue: defaultProjectData.demoMedia,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine o GIF',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Demo prodotto',
            },
          ],
          minItems: 1,
        },
        {
          key: 'reviewerAvatarSrc',
          label: 'Avatar social proof',
          type: 'image',
          defaultValue: defaultProjectData.reviewerAvatarSrc,
        },
        {
          key: 'reviewerAvatarAlt',
          label: 'Alt avatar social proof',
          type: 'text',
          defaultValue: defaultProjectData.reviewerAvatarAlt,
        },
        {
          key: 'bulletPoints',
          label: 'Bullet hero',
          type: 'list',
          itemLabel: 'Bullet',
          defaultValue: defaultProjectData.bulletPoints,
          itemFields: [
            {
              key: 'text',
              label: 'Testo bullet',
              type: 'text',
              defaultValue: 'Nuovo bullet',
            },
          ],
          minItems: 1,
        },
        {
          key: 'offerHighlights',
          label: 'Highlight bundle',
          type: 'list',
          itemLabel: 'Highlight',
          defaultValue: defaultProjectData.offerHighlights,
          itemFields: [
            {
              key: 'text',
              label: 'Testo highlight',
              type: 'text',
              defaultValue: 'Nuovo highlight',
            },
          ],
          minItems: 1,
        },
        {
          key: 'reviewItems',
          label: 'Review grid',
          type: 'list',
          itemLabel: 'Review',
          defaultValue: defaultProjectData.reviewItems,
          itemFields: [
            {
              key: 'imageSrc',
              label: 'Immagine review',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'author',
              label: 'Autore',
              type: 'text',
              defaultValue: 'Nome cliente',
            },
            {
              key: 'quote',
              label: 'Testo review',
              type: 'richtext',
              defaultValue: 'Testo recensione',
            },
          ],
          minItems: 1,
        },
      ],
    },
    {
      id: 'content',
      title: 'Sezioni di vendita',
      description:
        'Aggiorna i blocchi di copy principali della landing senza rompere struttura e ordine originale.',
      fields: [
        {
          key: 'mixingSectionHeading',
          label: 'Titolo sezione mix',
          type: 'richtext',
          defaultValue: defaultProjectData.mixingSectionHeading,
        },
        {
          key: 'mixingSectionBody',
          label: 'Testo sezione mix',
          type: 'richtext',
          defaultValue: defaultProjectData.mixingSectionBody,
        },
        {
          key: 'mixingSectionCtaLabel',
          label: 'CTA sezione mix',
          type: 'text',
          defaultValue: defaultProjectData.mixingSectionCtaLabel,
        },
        {
          key: 'routineSectionHeading',
          label: 'Titolo routine',
          type: 'richtext',
          defaultValue: defaultProjectData.routineSectionHeading,
        },
        {
          key: 'routineSectionBody',
          label: 'Testo routine',
          type: 'richtext',
          defaultValue: defaultProjectData.routineSectionBody,
        },
        {
          key: 'comparisonSectionHeading',
          label: 'Titolo confronto',
          type: 'richtext',
          defaultValue: defaultProjectData.comparisonSectionHeading,
        },
        {
          key: 'comparisonSectionBody',
          label: 'Testo confronto',
          type: 'richtext',
          defaultValue: defaultProjectData.comparisonSectionBody,
        },
        {
          key: 'resultsSectionHeading',
          label: 'Titolo risultati',
          type: 'richtext',
          defaultValue: defaultProjectData.resultsSectionHeading,
        },
        {
          key: 'resultsItems',
          label: 'Punti risultati',
          type: 'list',
          itemLabel: 'Risultato',
          defaultValue: defaultProjectData.resultsItems,
          itemFields: [
            {
              key: 'percent',
              label: 'Percentuale',
              type: 'text',
              defaultValue: '95%',
            },
            {
              key: 'text',
              label: 'Testo',
              type: 'richtext',
              defaultValue: 'Nuovo risultato',
            },
          ],
          minItems: 1,
        },
        {
          key: 'portabilitySectionHeading',
          label: 'Titolo portabilita',
          type: 'richtext',
          defaultValue: defaultProjectData.portabilitySectionHeading,
        },
        {
          key: 'portabilitySectionBody',
          label: 'Testo portabilita',
          type: 'richtext',
          defaultValue: defaultProjectData.portabilitySectionBody,
        },
        {
          key: 'portabilitySectionCtaLabel',
          label: 'CTA portabilita',
          type: 'text',
          defaultValue: defaultProjectData.portabilitySectionCtaLabel,
        },
      ],
    },
    {
      id: 'trust',
      title: 'FAQ e fiducia',
      description:
        'Aggiorna FAQ, sezione garanzia e intestazioni review mantenendo la stessa struttura PagePilot.',
      fields: [
        {
          key: 'faqHeading',
          label: 'Titolo FAQ',
          type: 'text',
          defaultValue: defaultProjectData.faqHeading,
        },
        {
          key: 'faqIntro',
          label: 'Intro FAQ',
          type: 'richtext',
          defaultValue: defaultProjectData.faqIntro,
        },
        {
          key: 'faqItems',
          label: 'Domande FAQ',
          type: 'list',
          itemLabel: 'FAQ',
          defaultValue: defaultProjectData.faqItems,
          itemFields: [
            {
              key: 'question',
              label: 'Domanda',
              type: 'text',
              defaultValue: 'Nuova domanda',
            },
            {
              key: 'answer',
              label: 'Risposta',
              type: 'richtext',
              defaultValue: 'Nuova risposta',
            },
          ],
          minItems: 1,
        },
        {
          key: 'guaranteeTitle',
          label: 'Titolo garanzia',
          type: 'richtext',
          defaultValue: defaultProjectData.guaranteeTitle,
        },
        {
          key: 'guaranteeText',
          label: 'Testo garanzia',
          type: 'richtext',
          defaultValue: defaultProjectData.guaranteeText,
        },
        {
          key: 'reviewHeading',
          label: 'Titolo review',
          type: 'text',
          defaultValue: defaultProjectData.reviewHeading,
        },
        {
          key: 'reviewSubheading',
          label: 'Sottotitolo review',
          type: 'text',
          defaultValue: defaultProjectData.reviewSubheading,
        },
        {
          key: 'reviewVerifiedLabel',
          label: 'Label verificato',
          type: 'text',
          defaultValue: defaultProjectData.reviewVerifiedLabel,
        },
      ],
    },
  ],
}

export const assetSchema: TemplateSchema = {
  id: 'master-template-assets',
  name: 'Master Assets',
  description: 'Logo e immagini che restano manuali nel flusso AI-first.',
  sections: [
    {
      id: 'brand-assets',
      title: 'Logo',
      description: 'Qui carichi il logo del prodotto o del brand.',
      fields: [
        {
          key: 'logoSrc',
          label: 'Logo',
          type: 'image',
          defaultValue: defaultProjectData.logoSrc,
        },
        {
          key: 'logoAlt',
          label: 'Alt logo',
          type: 'text',
          defaultValue: defaultProjectData.logoAlt,
        },
      ],
    },
    {
      id: 'media-assets',
      title: 'Immagini',
      description: 'Gallery, immagini sezione, GIF demo e media che vuoi sostituire.',
      fields: templateSchema.sections
        .find((section) => section.id === 'media')
        ?.fields.filter((field) => field.key !== 'bulletPoints' && field.key !== 'offerHighlights' && field.key !== 'reviewItems') ?? [],
    },
  ],
}

const listKeys: ProjectListKey[] = [
  'gallery',
  'sectionImages',
  'demoMedia',
  'bulletPoints',
  'offerHighlights',
  'resultsItems',
  'faqItems',
  'reviewItems',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFieldDefinition(key: ProjectListKey) {
  for (const section of templateSchema.sections) {
    const match = section.fields.find(
      (field): field is ListFieldDefinition =>
        field.type === 'list' && field.key === key,
    )

    if (match) {
      return match
    }
  }

  return null
}

function mergeList(
  key: ProjectListKey,
  incoming: unknown,
): Array<Record<string, string>> {
  const field = getFieldDefinition(key)

  if (!field || !Array.isArray(incoming) || incoming.length === 0) {
    return field?.defaultValue ?? []
  }

  return incoming
    .filter(isRecord)
    .map((item) => {
      const nextItem: Record<string, string> = {}

      for (const itemField of field.itemFields) {
        const rawValue = item[itemField.key]
        nextItem[itemField.key] =
          typeof rawValue === 'string' ? rawValue : itemField.defaultValue
      }

      return nextItem
    })
}

export function mergeProjectData(
  incoming?: Partial<ProjectData> | null,
): ProjectData {
  if (!incoming) {
    return structuredClone(defaultProjectData)
  }

  const merged: ProjectData = {
    ...defaultProjectData,
    ...incoming,
  }
  const listTarget = merged as unknown as Record<
    ProjectListKey,
    Array<Record<string, string>>
  >

  for (const key of listKeys) {
    const rawList = incoming[key]
    listTarget[key] = mergeList(key, rawList)
  }

  return merged
}

export function mergeExportOptions(
  incoming?: Partial<ExportOptions> | null,
): ExportOptions {
  if (!incoming) {
    return { ...defaultExportOptions }
  }

  return {
    ...defaultExportOptions,
    ...incoming,
  }
}

export function createEmptyListItem(field: ListFieldDefinition) {
  const item: Record<string, string> = {}

  for (const itemField of field.itemFields) {
    item[itemField.key] = itemField.defaultValue
  }

  return item
}

export function getListFieldDefinition(key: ProjectListKey) {
  return getFieldDefinition(key)
}

export function cloneFieldDefault(field: FieldDefinition) {
  if (field.type === 'list') {
    return field.defaultValue.map((item) => ({ ...item }))
  }

  return field.defaultValue
}
