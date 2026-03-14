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

function loadProjectCopywriterPrompt() {
  if (!fs.existsSync(customCopywriterPromptPath)) {
    return ''
  }

  return fs.readFileSync(customCopywriterPromptPath, 'utf8').trim()
}

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
    'comparisonSectionHeading',
    'comparisonSectionBody',
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
    comparisonSectionHeading: { type: 'string' },
    comparisonSectionBody: { type: 'string' },
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

function buildPrompt(brief, currentProjectData) {
  const projectCopywriterPrompt = loadProjectCopywriterPrompt()
  const developerSections = [
    'Sei un copywriter conversion-focused per landing e-commerce italiane. Devi compilare solo il copy della landing master, non le immagini. Rispondi esclusivamente con JSON valido che rispetta lo schema richiesto. Non inventare prove cliniche, promesse mediche, numeri falsi o testimonianze verificate non fornite. Se il brief non contiene un rating reale, usa un testo trust-safe per topBarRatingText senza numeri inventati. Per resultsItems.percent usa badge brevi tipo "3s", "24h", "1 tap" o altre micro-label realistiche, non percentuali false. Mantieni il tono concreto, scorrevole, orientato conversione e adatto a un ecommerce WordPress basato su una master PagePilot. Tutto in italiano.',
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
      comparisonSectionHeading: toStringValue(parsed.comparisonSectionHeading, currentProjectData.comparisonSectionHeading),
      comparisonSectionBody: toStringValue(parsed.comparisonSectionBody, currentProjectData.comparisonSectionBody),
      resultsSectionHeading: toStringValue(parsed.resultsSectionHeading, currentProjectData.resultsSectionHeading),
      resultsItems: ensureList(parsed.resultsItems, currentProjectData.resultsItems, 3),
      portabilitySectionHeading: toStringValue(parsed.portabilitySectionHeading, currentProjectData.portabilitySectionHeading),
      portabilitySectionBody: toStringValue(parsed.portabilitySectionBody, currentProjectData.portabilitySectionBody),
      portabilitySectionCtaLabel: toStringValue(parsed.portabilitySectionCtaLabel, currentProjectData.portabilitySectionCtaLabel),
      faqHeading: toStringValue(parsed.faqHeading, currentProjectData.faqHeading),
      faqIntro: toStringValue(parsed.faqIntro, currentProjectData.faqIntro),
      faqItems: ensureList(parsed.faqItems, currentProjectData.faqItems, 5),
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
