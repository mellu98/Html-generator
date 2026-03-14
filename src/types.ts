export type FieldType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'url'
  | 'color'
  | 'toggle'
  | 'list'

export type AssetMode = 'inline' | 'url'

export interface ImageItem extends Record<string, string> {
  src: string
  alt: string
}

export interface SimpleTextItem extends Record<string, string> {
  text: string
}

export interface FaqItem extends Record<string, string> {
  question: string
  answer: string
}

export interface ReviewItem extends Record<string, string> {
  imageSrc: string
  author: string
  quote: string
}

export interface ResultItem extends Record<string, string> {
  percent: string
  text: string
}

export interface ProjectData {
  projectName: string
  metaTitle: string
  metaDescription: string
  brandName: string
  logoSrc: string
  logoAlt: string
  productTitle: string
  productSubtitle: string
  salePrice: string
  comparePrice: string
  saveBadgeText: string
  primaryCtaLabel: string
  ctaUrl: string
  topBarRatingText: string
  topBarAvatars: ImageItem[]
  gallery: ImageItem[]
  sectionImages: ImageItem[]
  demoMedia: ImageItem[]
  reviewerAvatarSrc: string
  reviewerAvatarAlt: string
  bulletPoints: SimpleTextItem[]
  offerHighlights: SimpleTextItem[]
  shippingAccordionTitle: string
  shippingAccordionText: string
  returnsAccordionTitle: string
  returnsAccordionText: string
  mixingSectionHeading: string
  mixingSectionBody: string
  mixingSectionCtaLabel: string
  routineSectionHeading: string
  routineSectionBody: string
  comparisonSectionHeading: string
  comparisonSectionBody: string
  resultsSectionHeading: string
  resultsItems: ResultItem[]
  portabilitySectionHeading: string
  portabilitySectionBody: string
  portabilitySectionCtaLabel: string
  faqHeading: string
  faqIntro: string
  faqItems: FaqItem[]
  guaranteeTitle: string
  guaranteeText: string
  reviewHeading: string
  reviewSubheading: string
  reviewVerifiedLabel: string
  reviewItems: ReviewItem[]
}

export interface ExportOptions {
  fileName: string
  assetMode: AssetMode
  includeInteractiveScript: boolean
}

export interface AIGenerationForm {
  productName: string
  brandName: string
  productCategory: string
  productDescription: string
  targetAudience: string
  painPoints: string
  keyBenefits: string
  differentiators: string
  offerDetails: string
  proofPoints: string
  faqsContext: string
  copyInstructions: string
}

export interface AIHealthResponse {
  configured: boolean
  model: string
}

export interface GenerateCopyRequest {
  brief: AIGenerationForm
  currentProjectData: ProjectData
}

export interface GenerateCopyResponse {
  projectData: ProjectData
  model: string
}

export interface PersistedDraft {
  version: number
  projectData: ProjectData
  exportOptions: ExportOptions
  aiForm?: AIGenerationForm
}

export type ProjectScalarKey = {
  [K in keyof ProjectData]: ProjectData[K] extends string | boolean ? K : never
}[keyof ProjectData]

export type ProjectListKey = {
  [K in keyof ProjectData]: ProjectData[K] extends Array<Record<string, string>>
    ? K
    : never
}[keyof ProjectData]

export interface ScalarFieldDefinition {
  key: ProjectScalarKey
  label: string
  type: Exclude<FieldType, 'list'>
  helpText?: string
  placeholder?: string
  defaultValue: string | boolean
}

export interface ListItemFieldDefinition {
  key: string
  label: string
  type: 'text' | 'richtext' | 'image' | 'url'
  helpText?: string
  placeholder?: string
  defaultValue: string
}

export interface ListFieldDefinition {
  key: ProjectListKey
  label: string
  type: 'list'
  helpText?: string
  itemLabel: string
  defaultValue: Array<Record<string, string>>
  itemFields: ListItemFieldDefinition[]
  minItems?: number
  maxItems?: number
}

export type FieldDefinition = ScalarFieldDefinition | ListFieldDefinition

export interface TemplateSection {
  id: string
  title: string
  description: string
  fields: FieldDefinition[]
}

export interface TemplateSchema {
  id: string
  name: string
  description: string
  sections: TemplateSection[]
}

export interface ExportResult {
  fileName: string
  html: string
  warnings: string[]
}
