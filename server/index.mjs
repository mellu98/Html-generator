import 'dotenv/config'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const promptsDir = path.join(rootDir, 'prompts')
const customCopywriterPromptPath = path.join(promptsDir, 'custom-copywriter.md')
const isDirectRun =
  typeof process.argv[1] === 'string' && path.resolve(process.argv[1]) === __filename

const app = express()
const port = Number(process.env.PORT || 8787)
const model = process.env.OPENAI_MODEL || 'gpt-5.4'
const hasBuiltFrontend = fs.existsSync(path.join(distDir, 'index.html'))

app.use(express.json({ limit: '4mb' }))

function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY)
}

function getOpenAIClient() {
  if (!hasOpenAIKey()) {
    throw new Error('OPENAI_API_KEY mancante.')
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function toStringValue(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function ensureList(items, fallback, maxItems) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback
  }

  return items
    .slice(0, maxItems)
    .map((item, index) => ({
      ...(fallback[index] ?? {}),
      ...item,
    }))
}

function normalizeForLeakCheck(value) {
  return toStringValue(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstSentence(value, fallback) {
  const normalized = toStringValue(value)

  if (!normalized) {
    return fallback
  }

  const match = normalized.match(/.+?[.!?](?:\s|$)/)

  return match ? match[0].trim() : normalized
}

const masterFaqLeakTerms = [
  'tazza',
  'lavastoviglie',
  'borosilicato',
  'bevande',
  'proteine',
  'frullati',
  'cioccolata',
  'caffe',
  'alto rpm',
]

function hasMasterFaqLeak(brief, faqItems) {
  if (!Array.isArray(faqItems) || faqItems.length === 0) {
    return true
  }

  const faqText = normalizeForLeakCheck(
    faqItems.map((item) => `${item?.question ?? ''} ${item?.answer ?? ''}`).join(' '),
  )
  const contextText = normalizeForLeakCheck(
    [
      brief.productName,
      brief.productCategory,
      brief.productDescription,
      brief.keyBenefits,
      brief.offerDetails,
      brief.faqsContext,
    ].join(' '),
  )

  return masterFaqLeakTerms.some(
    (term) => faqText.includes(term) && !contextText.includes(term),
  )
}

function buildFallbackFaqItems(brief, currentProjectData) {
  const productName = toStringValue(
    brief.productName,
    currentProjectData.productTitle || 'questo prodotto',
  )
  const productCategory = toStringValue(brief.productCategory, 'prodotto')
  const targetAudience = firstSentence(
    brief.targetAudience,
    `E pensato per chi cerca un ${productCategory} pratico, immediato e facile da usare ogni giorno.`,
  )
  const useCaseAnswer = firstSentence(
    brief.productDescription || brief.keyBenefits,
    `${productName} e pensato per semplificare una situazione concreta della routine, con un utilizzo rapido e facile da capire fin dal primo uso.`,
  )
  const differentiationAnswer = firstSentence(
    brief.differentiators || brief.offerDetails,
    `La differenza sta soprattutto nella praticita d uso, nella semplicita del gesto e nel fatto che ti evita soluzioni piu scomode o dispersive.`,
  )
  const objectionsAnswer = firstSentence(
    brief.painPoints || brief.faqsContext || brief.proofPoints,
    `Se il tuo dubbio e capire se lo userai davvero, il punto forte e proprio questo: ti aiuta a risolvere una frizione quotidiana senza complicarti la giornata.`,
  )
  const shippingAnswer = [
    toStringValue(currentProjectData.shippingAccordionText),
    toStringValue(currentProjectData.returnsAccordionText),
  ]
    .filter(Boolean)
    .join(' ')

  return [
    {
      question: `Come si usa ${productName} nella pratica?`,
      answer: useCaseAnswer,
    },
    {
      question: `Per quali situazioni e davvero utile ${productName}?`,
      answer: differentiationAnswer,
    },
    {
      question: `Ci sono cose importanti da sapere prima di acquistarlo?`,
      answer: objectionsAnswer,
    },
    {
      question: `Per chi e indicato ${productName}?`,
      answer: targetAudience,
    },
    {
      question: 'Come funzionano spedizione e resi?',
      answer:
        shippingAnswer ||
        'Controlla tempi di spedizione, tracking e politica di reso nella sezione dedicata prima dell acquisto.',
    },
  ]
}

function loadProjectCopywriterPrompt() {
  if (!fs.existsSync(customCopywriterPromptPath)) {
    return ''
  }

  return fs.readFileSync(customCopywriterPromptPath, 'utf8').trim()
}

const briefFieldProperties = {
  productName: { type: 'string' },
  brandName: { type: 'string' },
  productCategory: { type: 'string' },
  productDescription: { type: 'string' },
  targetAudience: { type: 'string' },
  painPoints: { type: 'string' },
  keyBenefits: { type: 'string' },
  differentiators: { type: 'string' },
  offerDetails: { type: 'string' },
  proofPoints: { type: 'string' },
  faqsContext: { type: 'string' },
  copyMasterPrompt: { type: 'string' },
  copyStyleExamples: { type: 'string' },
  copyInstructions: { type: 'string' },
}

const discoveryPatchKeys = [
  'productName',
  'brandName',
  'productCategory',
  'productDescription',
  'targetAudience',
  'painPoints',
  'keyBenefits',
  'differentiators',
  'offerDetails',
  'proofPoints',
  'faqsContext',
]

const discoveryBriefPatchProperties = Object.fromEntries(
  discoveryPatchKeys.map((key) => [key, briefFieldProperties[key]]),
)

const generationSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'projectName',
    'metaTitle',
    'metaDescription',
    'brandName',
    'productTitle',
    'productSubtitle',
    'salePrice',
    'comparePrice',
    'saveBadgeText',
    'primaryCtaLabel',
    'topBarRatingText',
    'bulletPoints',
    'offerHighlights',
    'shippingAccordionTitle',
    'shippingAccordionText',
    'returnsAccordionTitle',
    'returnsAccordionText',
    'mixingSectionHeading',
    'mixingSectionBody',
    'mixingSectionCtaLabel',
    'routineSectionHeading',
    'routineSectionBody',
    'routineBenefitItems',
    'comparisonSectionHeading',
    'comparisonSectionBody',
    'comparisonColumnOwnLabel',
    'comparisonColumnOtherLabel',
    'comparisonFeatureItems',
    'resultsSectionHeading',
    'resultsItems',
    'portabilitySectionHeading',
    'portabilitySectionBody',
    'portabilitySectionCtaLabel',
    'faqHeading',
    'faqIntro',
    'faqItems',
    'guaranteeTitle',
    'guaranteeText',
    'reviewHeading',
    'reviewSubheading',
  ],
  properties: {
    projectName: { type: 'string' },
    metaTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    brandName: { type: 'string' },
    productTitle: { type: 'string' },
    productSubtitle: { type: 'string' },
    salePrice: { type: 'string' },
    comparePrice: { type: 'string' },
    saveBadgeText: { type: 'string' },
    primaryCtaLabel: { type: 'string' },
    topBarRatingText: { type: 'string' },
    bulletPoints: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: {
          text: { type: 'string' },
        },
      },
    },
    offerHighlights: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: {
          text: { type: 'string' },
        },
      },
    },
    shippingAccordionTitle: { type: 'string' },
    shippingAccordionText: { type: 'string' },
    returnsAccordionTitle: { type: 'string' },
    returnsAccordionText: { type: 'string' },
    mixingSectionHeading: { type: 'string' },
    mixingSectionBody: { type: 'string' },
    mixingSectionCtaLabel: { type: 'string' },
    routineSectionHeading: { type: 'string' },
    routineSectionBody: { type: 'string' },
    routineBenefitItems: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['emoji', 'title', 'body'],
        properties: {
          emoji: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
    comparisonSectionHeading: { type: 'string' },
    comparisonSectionBody: { type: 'string' },
    comparisonColumnOwnLabel: { type: 'string' },
    comparisonColumnOtherLabel: { type: 'string' },
    comparisonFeatureItems: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label'],
        properties: {
          label: { type: 'string' },
        },
      },
    },
    resultsSectionHeading: { type: 'string' },
    resultsItems: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['percent', 'text'],
        properties: {
          percent: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
    portabilitySectionHeading: { type: 'string' },
    portabilitySectionBody: { type: 'string' },
    portabilitySectionCtaLabel: { type: 'string' },
    faqHeading: { type: 'string' },
    faqIntro: { type: 'string' },
    faqItems: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
      },
    },
    guaranteeTitle: { type: 'string' },
    guaranteeText: { type: 'string' },
    reviewHeading: { type: 'string' },
    reviewSubheading: { type: 'string' },
  },
}

const discoverySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['assistantMessage', 'status', 'missingInputs', 'briefPatch'],
  properties: {
    assistantMessage: { type: 'string' },
    status: {
      type: 'string',
      enum: ['needs_input', 'ready_to_generate'],
    },
    missingInputs: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['offerta', 'buyer_personas', 'obiezioni'],
      },
    },
    briefPatch: {
      type: 'object',
      additionalProperties: false,
      required: discoveryPatchKeys,
      properties: discoveryBriefPatchProperties,
    },
  },
}

function buildPrompt(brief, currentProjectData) {
  const projectCopywriterPrompt = loadProjectCopywriterPrompt()
  const developerSections = [
    'Sei un copywriter conversion-focused per landing e-commerce italiane. Devi compilare solo il copy della landing master, non le immagini. Rispondi esclusivamente con JSON valido che rispetta lo schema richiesto. Non inventare prove cliniche, promesse mediche, numeri falsi o testimonianze verificate non fornite. Se il brief non contiene un rating reale, usa un testo trust-safe per topBarRatingText senza numeri inventati. Per resultsItems.percent usa badge brevi tipo "3s", "24h", "1 tap" o altre micro-label realistiche, non percentuali false. Compila anche i 4 benefit card della sezione routine e le etichette della tabella comparativa, cosi la landing non eredita i testi della master. Per routineBenefitItems.emoji scegli tu un emoji semplice, leggibile e coerente con il beneficio. Nei bulletPoints del blocco hero puoi iniziare ogni beneficio con un emoji coerente e leggibile; se non lo fai verra aggiunto automaticamente dal sistema. Le FAQ devono essere completamente riscritte sul prodotto attuale: non devi mai lasciare riferimenti al seed/master come tazza, bevande, lavastoviglie, borosilicato o proteine se non fanno davvero parte del brief. Mantieni il tono concreto, scorrevole, orientato conversione e adatto a un ecommerce WordPress basato su una master PagePilot. Tutto in italiano.',
    'Questa app lavora in one-shot e non puo ricevere domande di follow-up. Se il profilo copy dice di fare domande prima di scrivere, interpreta i campi del brief come le risposte gia fornite dall utente. Se mancano dettagli, non fare domande nel tuo output: usa un copy forte ma prudente, senza inventare prove o claim non supportati.',
  ]

  if (projectCopywriterPrompt) {
    developerSections.push(
      `PROFILO COPYWRITER DI PROGETTO (seguilo come stile primario quando non confligge con sicurezza, veridicita e schema):\n${projectCopywriterPrompt}`,
    )
  }

  if (brief.copyMasterPrompt?.trim()) {
    developerSections.push(
      `PROFILO COPYWRITER SPECIFICO INCOLLATO DALL UTENTE:\n${brief.copyMasterPrompt.trim()}`,
    )
  }

  if (brief.copyStyleExamples?.trim()) {
    developerSections.push(
      `ESEMPI DI STILE DA IMITARE NEL RITMO, NEL LESSICO E NELLA STRUTTURA, SENZA COPIARE ALLA LETTERA:\n${brief.copyStyleExamples.trim()}`,
    )
  }

  return [
    {
      role: 'developer',
      content: [
        {
          type: 'input_text',
          text: developerSections.join('\n\n---\n\n'),
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: JSON.stringify(
            {
              brief: {
                productName: brief.productName,
                brandName: brief.brandName,
                productCategory: brief.productCategory,
                productDescription: brief.productDescription,
                targetAudience: brief.targetAudience,
                painPoints: brief.painPoints,
                keyBenefits: brief.keyBenefits,
                differentiators: brief.differentiators,
                offerDetails: brief.offerDetails,
                proofPoints: brief.proofPoints,
                faqsContext: brief.faqsContext,
                copyInstructions: brief.copyInstructions,
              },
              currentProjectData: {
                brandName: currentProjectData.brandName,
                ctaUrl: currentProjectData.ctaUrl,
                salePrice: currentProjectData.salePrice,
                comparePrice: currentProjectData.comparePrice,
                saveBadgeText: currentProjectData.saveBadgeText,
                faqCount: currentProjectData.faqItems?.length ?? 5,
                resultsCount: currentProjectData.resultsItems?.length ?? 3,
              },
            },
            null,
            2,
          ),
        },
      ],
    },
  ]
}

function buildDiscoveryPrompt(brief, messages) {
  const projectCopywriterPrompt = loadProjectCopywriterPrompt()
  const developerSections = [
    'Sei la fase di intervista guidata del copywriter Signora Market Copy. Non devi scrivere la landing finale: devi solo fare discovery, raccogliere materiale utile e preparare il brief migliore possibile.',
    'Parla sempre in italiano colloquiale, diretto, semplice, concreto, quasi da banco del mercato: niente tono corporate, niente frasi fredde, niente spiegoni. Devi sembrare la stessa personalita del GPT originale.',
    'Prima di poter dichiarare il brief pronto, devi avere abbastanza materiale su 3 blocchi obbligatori: 1) descrizione dettagliata dell offerta; se l utente ha anche un link landing o prodotto bene, ma non e obbligatorio, 2) buyer personas / target reale, 3) review negative, obiezioni o equivalenti per il tipo di offerta.',
    'Se l utente sta creando la landing da zero e non ha nessun link, accetta la descrizione dell offerta come input sufficiente e non insistere sul link.',
    'Se manca uno di questi 3 blocchi, fai domande brevi, mirate e utili. Massimo 2 domande corte per messaggio. Non rifare domande su cose gia dette chiaramente.',
    'Se le informazioni bastano, imposta status = ready_to_generate e scrivi un messaggio breve che conferma che adesso si puo passare alla stesura del copy.',
    'Non scrivere mai la landing in questa fase. Non produrre headline finali, sezioni finali o long-form copy. Qui fai solo discovery.',
    'Nel briefPatch salva tutto quello che puoi estrarre in modo affidabile dal messaggio utente. Mappa cosi: descrizione offerta e link opzionale -> productDescription e se possibile productName, brandName, productCategory, offerDetails; buyer personas -> targetAudience; obiezioni/review negative -> painPoints, faqsContext, proofPoints; differenze e benefici -> keyBenefits e differentiators.',
    'Se il profilo copy originale dice di fare domande prima di scrivere, qui devi rispettarlo pienamente. Il tuo obiettivo e comportarti nel modo piu vicino possibile a quel GPT, ma in forma strutturata.',
    'assistantMessage deve essere solo testo normale. missingInputs deve contenere una lista fra: offerta, buyer_personas, obiezioni.',
  ]

  if (projectCopywriterPrompt) {
    developerSections.push(
      `PROFILO COPYWRITER DI PROGETTO:\n${projectCopywriterPrompt}`,
    )
  }

  if (brief.copyMasterPrompt?.trim()) {
    developerSections.push(
      `PROFILO COPYWRITER EXTRA INCOLLATO DALL UTENTE:\n${brief.copyMasterPrompt.trim()}`,
    )
  }

  if (brief.copyStyleExamples?.trim()) {
    developerSections.push(
      `ESEMPI DI STILE DA TENERE PRESENTI:\n${brief.copyStyleExamples.trim()}`,
    )
  }

  return [
    {
      role: 'developer',
      content: [
        {
          type: 'input_text',
          text: developerSections.join('\n\n---\n\n'),
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: JSON.stringify(
            {
              currentBrief: {
                productName: brief.productName,
                brandName: brief.brandName,
                productCategory: brief.productCategory,
                productDescription: brief.productDescription,
                targetAudience: brief.targetAudience,
                painPoints: brief.painPoints,
                keyBenefits: brief.keyBenefits,
                differentiators: brief.differentiators,
                offerDetails: brief.offerDetails,
                proofPoints: brief.proofPoints,
                faqsContext: brief.faqsContext,
                copyInstructions: brief.copyInstructions,
              },
              conversation: messages,
            },
            null,
            2,
          ),
        },
      ],
    },
  ]
}

function sanitizeDiscoveryBriefPatch(value) {
  if (typeof value !== 'object' || value === null) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, currentValue]) =>
        discoveryPatchKeys.includes(key) &&
        typeof currentValue === 'string' &&
        currentValue.trim().length > 0,
    ),
  )
}

app.get('/api/health', (_req, res) => {
  res.json({
    configured: hasOpenAIKey(),
    model,
    projectCopyProfileConfigured: Boolean(loadProjectCopywriterPrompt()),
  })
})

app.get('/healthz', (_req, res) => {
  res.status(200).send('ok')
})

app.post('/api/discovery-chat', async (req, res) => {
  try {
    if (!hasOpenAIKey()) {
      res.status(400).json({
        error: 'OPENAI_API_KEY non configurata. Crea un file .env o imposta la variabile su Render.',
      })
      return
    }

    const brief = req.body?.brief
    const messages = req.body?.messages

    if (!brief || !Array.isArray(messages)) {
      res.status(400).json({
        error: 'Payload incompleto: servono brief e messages.',
      })
      return
    }

    const client = getOpenAIClient()
    const response = await client.responses.create({
      model,
      reasoning: {
        effort: 'medium',
      },
      input: buildDiscoveryPrompt(brief, messages),
      text: {
        format: {
          type: 'json_schema',
          name: 'landing_discovery_payload',
          schema: discoverySchema,
          strict: true,
        },
      },
    })

    const parsed = JSON.parse(response.output_text)

    res.json({
      assistantMessage: toStringValue(
        parsed.assistantMessage,
        'Dimmi un po di piu sul prodotto, sul cliente ideale e sulle obiezioni vere che vuoi spaccare.',
      ),
      status: parsed.status === 'ready_to_generate' ? 'ready_to_generate' : 'needs_input',
      missingInputs: Array.isArray(parsed.missingInputs)
        ? parsed.missingInputs.filter((item) =>
            ['offerta', 'buyer_personas', 'obiezioni'].includes(item),
          )
        : [],
      briefPatch: sanitizeDiscoveryBriefPatch(parsed.briefPatch),
      model,
    })
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Errore sconosciuto durante la discovery chat.',
    })
  }
})

app.post('/api/generate-copy', async (req, res) => {
  try {
    if (!hasOpenAIKey()) {
      res.status(400).json({
        error: 'OPENAI_API_KEY non configurata. Crea un file .env o imposta la variabile su Render.',
      })
      return
    }

    const brief = req.body?.brief
    const currentProjectData = req.body?.currentProjectData

    if (!brief || !currentProjectData) {
      res.status(400).json({
        error: 'Payload incompleto: servono brief e currentProjectData.',
      })
      return
    }

    const client = getOpenAIClient()
    const response = await client.responses.create({
      model,
      reasoning: {
        effort: 'medium',
      },
      input: buildPrompt(brief, currentProjectData),
      text: {
        format: {
          type: 'json_schema',
          name: 'landing_copy_payload',
          schema: generationSchema,
          strict: true,
        },
      },
    })

    const parsed = JSON.parse(response.output_text)

    const mergedProjectData = {
      ...currentProjectData,
      projectName: toStringValue(parsed.projectName, currentProjectData.projectName),
      metaTitle: toStringValue(parsed.metaTitle, currentProjectData.metaTitle),
      metaDescription: toStringValue(parsed.metaDescription, currentProjectData.metaDescription),
      brandName: toStringValue(parsed.brandName, brief.brandName || currentProjectData.brandName),
      productTitle: toStringValue(parsed.productTitle, brief.productName || currentProjectData.productTitle),
      productSubtitle: toStringValue(parsed.productSubtitle, currentProjectData.productSubtitle),
      salePrice: toStringValue(parsed.salePrice, currentProjectData.salePrice),
      comparePrice: toStringValue(parsed.comparePrice, currentProjectData.comparePrice),
      saveBadgeText: toStringValue(parsed.saveBadgeText, currentProjectData.saveBadgeText),
      primaryCtaLabel: toStringValue(parsed.primaryCtaLabel, currentProjectData.primaryCtaLabel),
      ctaUrl: toStringValue(currentProjectData.ctaUrl, '#'),
      topBarRatingText: toStringValue(parsed.topBarRatingText, currentProjectData.topBarRatingText),
      bulletPoints: ensureList(parsed.bulletPoints, currentProjectData.bulletPoints, 4),
      offerHighlights: ensureList(parsed.offerHighlights, currentProjectData.offerHighlights, 3),
      shippingAccordionTitle: toStringValue(parsed.shippingAccordionTitle, currentProjectData.shippingAccordionTitle),
      shippingAccordionText: toStringValue(parsed.shippingAccordionText, currentProjectData.shippingAccordionText),
      returnsAccordionTitle: toStringValue(parsed.returnsAccordionTitle, currentProjectData.returnsAccordionTitle),
      returnsAccordionText: toStringValue(parsed.returnsAccordionText, currentProjectData.returnsAccordionText),
      mixingSectionHeading: toStringValue(parsed.mixingSectionHeading, currentProjectData.mixingSectionHeading),
      mixingSectionBody: toStringValue(parsed.mixingSectionBody, currentProjectData.mixingSectionBody),
      mixingSectionCtaLabel: toStringValue(parsed.mixingSectionCtaLabel, currentProjectData.mixingSectionCtaLabel),
      routineSectionHeading: toStringValue(parsed.routineSectionHeading, currentProjectData.routineSectionHeading),
      routineSectionBody: toStringValue(parsed.routineSectionBody, currentProjectData.routineSectionBody),
      routineBenefitItems: ensureList(parsed.routineBenefitItems, currentProjectData.routineBenefitItems, 4),
      comparisonSectionHeading: toStringValue(parsed.comparisonSectionHeading, currentProjectData.comparisonSectionHeading),
      comparisonSectionBody: toStringValue(parsed.comparisonSectionBody, currentProjectData.comparisonSectionBody),
      comparisonColumnOwnLabel: toStringValue(parsed.comparisonColumnOwnLabel, currentProjectData.comparisonColumnOwnLabel),
      comparisonColumnOtherLabel: toStringValue(parsed.comparisonColumnOtherLabel, currentProjectData.comparisonColumnOtherLabel),
      comparisonFeatureItems: ensureList(parsed.comparisonFeatureItems, currentProjectData.comparisonFeatureItems, 5),
      resultsSectionHeading: toStringValue(parsed.resultsSectionHeading, currentProjectData.resultsSectionHeading),
      resultsItems: ensureList(parsed.resultsItems, currentProjectData.resultsItems, 3),
      portabilitySectionHeading: toStringValue(parsed.portabilitySectionHeading, currentProjectData.portabilitySectionHeading),
      portabilitySectionBody: toStringValue(parsed.portabilitySectionBody, currentProjectData.portabilitySectionBody),
      portabilitySectionCtaLabel: toStringValue(parsed.portabilitySectionCtaLabel, currentProjectData.portabilitySectionCtaLabel),
      faqHeading: toStringValue(parsed.faqHeading, currentProjectData.faqHeading),
      faqIntro: toStringValue(parsed.faqIntro, currentProjectData.faqIntro),
      faqItems: hasMasterFaqLeak(
        brief,
        ensureList(parsed.faqItems, currentProjectData.faqItems, 5),
      )
        ? buildFallbackFaqItems(brief, currentProjectData)
        : ensureList(parsed.faqItems, currentProjectData.faqItems, 5),
      guaranteeTitle: toStringValue(parsed.guaranteeTitle, currentProjectData.guaranteeTitle),
      guaranteeText: toStringValue(parsed.guaranteeText, currentProjectData.guaranteeText),
      reviewHeading: toStringValue(parsed.reviewHeading, currentProjectData.reviewHeading),
      reviewSubheading: toStringValue(parsed.reviewSubheading, currentProjectData.reviewSubheading),
    }

    res.json({
      projectData: mergedProjectData,
      model,
    })
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Errore sconosciuto durante la generazione del copy.',
    })
  }
})

if (hasBuiltFrontend) {
  app.use(express.static(distDir))

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/healthz') {
      next()
      return
    }

    res.sendFile(path.join(distDir, 'index.html'))
  })
}

export { app }

export function startServer() {
  return app.listen(port, () => {
    console.log(`Landing Master Generator API listening on http://127.0.0.1:${port}`)
  })
}

if (isDirectRun) {
  startServer()
}
