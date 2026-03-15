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

export interface BenefitFeatureItem extends Record<string, string> {
  emoji: string
  title: string
  body: string
}

export interface BundleOfferItem extends Record<string, string> {
  title: string
  ribbonLabel: string
  badgeText: string
  subtitle: string
  salePrice: string
  comparePrice: string
  benefit1: string
  benefit2: string
  benefit3: string
}

export interface ComparisonFeatureItem extends Record<string, string> {
  label: string
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
  bundleSectionHeading: string
  bundleOffers: BundleOfferItem[]
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
  routineBenefitItems: BenefitFeatureItem[]
  comparisonSectionHeading: string
  comparisonSectionBody: string
  comparisonColumnOwnLabel: string
  comparisonColumnOtherLabel: string
  comparisonFeatureItems: ComparisonFeatureItem[]
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
  copyMasterPrompt: string
  copyStyleExamples: string
  copyInstructions: string
}

export type DiscoveryChatRole = 'assistant' | 'user'

export type ImageGenerationCategory =
  | 'How To/Process'
  | 'Infographic'
  | 'Ingredients'
  | 'Lifestyle'
  | 'Product Photo'
  | 'Social Proof'

export type ImageChatRole = 'assistant' | 'user'

export type ImageGenerationStatus =
  | 'idle'
  | 'loading'
  | 'generated'
  | 'needs_category'
  | 'needs_reference_image'
  | 'error'

export type ImageAssignmentTarget =
  | 'hero-1'
  | 'hero-2'
  | 'detail-1'
  | 'detail-2'
  | 'detail-3'
  | 'benefit-1'
  | 'benefit-2'
  | 'proof-1'
  | 'proof-2'

export type DiscoveryMissingInput =
  | 'offerta'
  | 'buyer_personas'
  | 'obiezioni'

export type DiscoveryChatStatus =
  | 'idle'
  | 'needs_input'
  | 'ready_to_generate'
  | 'loading'
  | 'error'

export interface DiscoveryMessage {
  id: string
  role: DiscoveryChatRole
  content: string
}

export interface ImageReferenceAsset {
  src: string
  fileName: string
  mimeType: string
}

export interface ImageChatMessage {
  id: string
  role: ImageChatRole
  content: string
}

export interface GeneratedImageItem {
  id: string
  src: string
  category: ImageGenerationCategory
  assignedTo: '' | ImageAssignmentTarget
  createdAt: string
}

export interface AIHealthResponse {
  configured: boolean
  model: string
  imageModel: string
  projectCopyProfileConfigured: boolean
  projectImageProfileConfigured: boolean
}

export interface GenerateCopyRequest {
  brief: AIGenerationForm
  currentProjectData: ProjectData
}

export interface GenerateCopyResponse {
  projectData: ProjectData
  model: string
}

export interface DiscoveryChatRequest {
  messages: DiscoveryMessage[]
  brief: AIGenerationForm
}

export interface DiscoveryChatResponse {
  assistantMessage: string
  status: Exclude<DiscoveryChatStatus, 'idle' | 'loading' | 'error'>
  missingInputs: DiscoveryMissingInput[]
  briefPatch: Partial<AIGenerationForm>
  model: string
}

export interface ImageChatRequest {
  messages: ImageChatMessage[]
  category: string
  referenceImage: ImageReferenceAsset | null
  brief: Pick<
    AIGenerationForm,
    'productName' | 'brandName' | 'productCategory' | 'productDescription'
  >
}

export interface ImageChatResponse {
  assistantMessage: string
  status: Exclude<ImageGenerationStatus, 'idle' | 'loading' | 'error'>
  resolvedCategory: ImageGenerationCategory | ''
  images: Array<{
    id: string
    src: string
  }>
  model: string
}

export interface PersistedDraft {
  version: number
  projectData: ProjectData
  exportOptions: ExportOptions
  aiForm?: AIGenerationForm
  discoveryMessages?: DiscoveryMessage[]
  discoveryStatus?: Exclude<DiscoveryChatStatus, 'loading' | 'error'>
  discoveryMissingInputs?: DiscoveryMissingInput[]
  imageMessages?: ImageChatMessage[]
  imageCategory?: ImageGenerationCategory | ''
  imageReference?: ImageReferenceAsset | null
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
