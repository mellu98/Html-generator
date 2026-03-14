import domelioMasterHtml from '../masters/domelio/source.html?raw'
import { mergeProjectData } from '../schema'
import type {
  AssetMode,
  ExportOptions,
  ExportResult,
  FaqItem,
  ImageItem,
  ProjectData,
} from '../types'

const MASTER_ASSET_PREFIX = '/masters/domelio/assets/'

function extractMasterLocalAssetName(value: string) {
  const normalized = value.trim().replaceAll('\\', '/')
  const lower = normalized.toLowerCase()
  const marker = 'domelio_files/'
  const markerIndex = lower.indexOf(marker)

  if (markerIndex === -1) {
    return ''
  }

  return normalized.slice(markerIndex + marker.length).split('?')[0].trim()
}

const MASTER_SECTION_IMAGES = [
  `${MASTER_ASSET_PREFIX}ChatGPT_Image_1_mar_2026_14_38_47(3).webp`,
  `${MASTER_ASSET_PREFIX}ChatGPT_Image_1_mar_2026_14_39_34.webp`,
  `${MASTER_ASSET_PREFIX}ChatGPT_Image_1_mar_2026_14_39_39(2).webp`,
  `${MASTER_ASSET_PREFIX}ChatGPT_Image_1_mar_2026_14_38_41(2).webp`,
]

const MASTER_DEMO_MEDIA = [
  `${MASTER_ASSET_PREFIX}gif1.gif`,
  `${MASTER_ASSET_PREFIX}gif2.gif`,
  `${MASTER_ASSET_PREFIX}gif3.gif`,
]

function getBaseOrigin() {
  if (typeof window !== 'undefined' && window.location.origin !== 'null') {
    return window.location.origin
  }

  return 'http://localhost'
}

function normalizeMasterAssetUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith(MASTER_ASSET_PREFIX)) {
    return trimmed
  }

  const localAssetName = extractMasterLocalAssetName(trimmed)

  if (localAssetName) {
    return `${MASTER_ASSET_PREFIX}${localAssetName}`
  }

  try {
    const parsed = new URL(
      trimmed.startsWith('//') ? `https:${trimmed}` : trimmed,
      `${getBaseOrigin()}/`,
    )

    const parsedLocalAssetName = extractMasterLocalAssetName(parsed.pathname)

    if (parsedLocalAssetName) {
      return `${MASTER_ASSET_PREFIX}${parsedLocalAssetName}`
    }

    if (parsed.pathname.includes('/cdn/shop/files/')) {
      return `${MASTER_ASSET_PREFIX}${parsed.pathname.split('/').at(-1) ?? ''}`
    }

    if (parsed.pathname.includes('/Tazza Auto-Mescolante Veloce Professionale')) {
      return `${MASTER_ASSET_PREFIX}${parsed.pathname.split('/').at(-1) ?? ''}`
    }
  } catch {
    return trimmed
  }

  return trimmed
}

function sanitizeLink(value: string) {
  const trimmed = value.trim()

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  ) {
    return trimmed
  }

  return '#'
}

function normalizePrice(value: string) {
  return value.replace(/^EUR\s*/i, '\u20AC').trim()
}

function createDocument(html: string) {
  return new DOMParser().parseFromString(html, 'text/html')
}

function setTextContent(element: Element | null | undefined, value: string) {
  if (!element) {
    return
  }

  element.textContent = value
}

function setImageSource(element: Element | null, item: ImageItem) {
  if (!(element instanceof HTMLImageElement)) {
    return
  }

  const src = normalizeMasterAssetUrl(item.src)

  element.src = src
  element.alt = item.alt
  element.removeAttribute('srcset')
  element.removeAttribute('data-srcset')
  element.removeAttribute('data-widths')
  element.setAttribute('data-src', src)
}

function replaceButtonsWithLinks(document: Document, selector: string, href: string) {
  for (const button of Array.from(document.querySelectorAll(selector))) {
    const link = document.createElement('a')

    link.className = button.className
    link.href = href
    link.textContent = button.textContent?.trim() ?? ''
    link.setAttribute('role', 'button')

    button.replaceWith(link)
  }
}

function findFirstByText(
  document: Document,
  selector: string,
  fragment: string,
) {
  const normalizedFragment = fragment.trim().toLowerCase()

  return Array.from(document.querySelectorAll(selector)).find((element) =>
    element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase().includes(normalizedFragment),
  )
}

function findElementsUntilNextHeading(
  document: Document,
  start: Element,
  selector: string,
) {
  const results: Element[] = []
  let seenStart = false

  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    if (element === start) {
      seenStart = true
      continue
    }

    if (!seenStart) {
      continue
    }

    if (element.matches('h1, h2, h3')) {
      break
    }

    if (element.matches(selector)) {
      results.push(element)
    }
  }

  return results
}

function findFirstAfter(document: Document, start: Element, selector: string) {
  return findElementsUntilNextHeading(document, start, selector)[0] ?? null
}

function replaceImagesBySource(
  document: Document,
  originalSource: string,
  item: ImageItem,
) {
  const normalizedOriginal = normalizeMasterAssetUrl(originalSource)

  document.querySelectorAll('img').forEach((image) => {
    const src = normalizeMasterAssetUrl(image.getAttribute('src') ?? '')

    if (src === normalizedOriginal) {
      setImageSource(image, item)
    }
  })
}

function applyImageSeries(elements: Element[], items: ImageItem[]) {
  elements.forEach((element, index) => {
    const current = items[index] ?? items.at(-1)

    if (current) {
      setImageSource(element, current)
    }
  })
}

function applyGallery(document: Document, items: ImageItem[]) {
  const gallerySlides = Array.from(
    document.querySelectorAll(
      '#Slider-Gallery-template--27802531168596__main li.product__media-item',
    ),
  )

  gallerySlides.forEach((slide, index) => {
    const current = items[index] ?? items.at(-1)

    if (!current) {
      return
    }

    slide.querySelectorAll('img').forEach((image) => setImageSource(image, current))
  })

  applyImageSeries(Array.from(document.querySelectorAll('.thumbnail img')), items)
  applyImageSeries(
    Array.from(document.querySelectorAll('.product-media-modal__content img')),
    items,
  )

  const stickyImages = Array.from(document.querySelectorAll('.sticky-atc-image img'))
  const firstImage = items[0]

  if (firstImage) {
    stickyImages.forEach((image) => setImageSource(image, firstImage))
  }
}

function rebuildFaqItems(document: Document, items: FaqItem[]) {
  const detailsList = document.querySelector('.pagepilot-faqs .pp-flex.pp-flex-col.pp-gap-6')
  const templateDetail = detailsList?.querySelector('details')

  if (!detailsList || !templateDetail) {
    return
  }

  detailsList.innerHTML = ''

  for (const item of items) {
    const detail = templateDetail.cloneNode(true) as HTMLDetailsElement
    const question = detail.querySelector('summary .pp-font-semibold')
    const answer = detail.querySelector('article p')

    setTextContent(question, item.question)
    setTextContent(answer, item.answer)

    detail.setAttribute('open', '')
    detailsList.append(detail)
  }
}

function rebuildResults(document: Document, heading: Element, data: ProjectData) {
  const listItems = findElementsUntilNextHeading(
    document,
    heading,
    '.pp-flex.pp-gap-\\[20px\\].pp-items-center',
  )
  const templateItem = listItems[0]

  if (!templateItem) {
    return
  }

  const listParent = templateItem.parentElement

  if (!listParent) {
    return
  }

  listParent.innerHTML = ''

  for (const item of data.resultsItems) {
    const nextItem = templateItem.cloneNode(true) as HTMLDivElement
    const percent = nextItem.querySelector('.pp-text-base.pp-font-semibold')
    const text = nextItem.querySelector('.pp-text-lg.pp-text-left')

    setTextContent(percent, item.percent)
    setTextContent(text, item.text)
    listParent.append(nextItem)
  }
}

function rebuildReviews(document: Document, data: ProjectData) {
  const heading = document.querySelector('.pp-review-grid h2')
  const subheading = document.querySelector('.pp-review-grid .pp-text-lg')
  const container = document.querySelector('.pp-reviews-container')
  const templateReview = container?.querySelector('.pp-review')

  setTextContent(heading, data.reviewHeading)
  setTextContent(subheading, data.reviewSubheading)

  if (!container || !templateReview) {
    return
  }

  container.classList.add('master-review-grid')
  container.removeAttribute('style')
  container.innerHTML = ''

  for (const item of data.reviewItems) {
    const review = templateReview.cloneNode(true) as HTMLDivElement
    const image = review.querySelector('img')
    const author = review.querySelector('.pp-font-semibold')
    const verified = Array.from(review.querySelectorAll('div')).find((element) =>
      element.textContent?.includes('Acquirente'),
    )
    const quote = Array.from(review.querySelectorAll('div'))
      .reverse()
      .find((element) => element.textContent?.trim())

    review.removeAttribute('style')
    review.classList.add('master-review-card')

    if (image instanceof HTMLImageElement) {
      image.src = normalizeMasterAssetUrl(item.imageSrc)
      image.alt = item.author
      image.removeAttribute('srcset')
      image.removeAttribute('data-srcset')
    }

    setTextContent(author, item.author)
    setTextContent(quote, item.quote)

    if (verified) {
      verified.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          node.textContent = ` ${data.reviewVerifiedLabel}`
        }
      })
    }

    container.append(review)
  }
}

function sanitizeResidualSeedText(document: Document, data: ProjectData) {
  const currentYear = new Date().getFullYear()
  const replacements: Array<[RegExp, string]> = [
    [/domelio/gi, data.brandName],
    [/tazza auto-mescolante veloce professionale/gi, data.productTitle],
    [/tazza auto-mescolante/gi, data.productTitle],
    [/\b1\s+tazza\b/gi, '1 pezzo'],
    [/\b2\s+tazze\b/gi, '2 pezzi'],
    [/\b3\s+tazze\b/gi, '3 pezzi'],
    [/perfetta per provare/gi, data.offerHighlights[0]?.text ?? 'Offerta entry level'],
    [/una per casa,\s*una per l['’]ufficio/gi, data.offerHighlights[1]?.text ?? 'Bundle smart'],
    [/regalo perfetto \+\s*prezzo migliore/gi, data.offerHighlights[2]?.text ?? 'Offerta top'],
    [/pi[uù]\s+scelto/gi, 'Scelta smart'],
    [/miglior offerta/gi, 'Offerta top'],
    [/acquirente verificato/gi, data.reviewVerifiedLabel],
    [
      /offriamo spedizione tracciata e assicurata per tutti i nostri ordini\.[\s\S]*?prima della spedizione\./gi,
      data.shippingAccordionText,
    ],
    [
      /amiamo i nostri prodotti e siamo sicuri che li amerai anche tu!?[\s\S]*?ti rimborseremo\./gi,
      data.returnsAccordionText,
    ],
    [
      /l'ho usato ogni mattina per due settimane:[\s\S]*?la consistenza\./gi,
      data.reviewItems[0]?.quote ?? '',
    ],
    [/gabriele h\./gi, data.reviewItems[0]?.author ?? 'Cliente'],
    [/©\s*2026,\s*domelio/gi, `© ${currentYear}, ${data.brandName}`],
  ]

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    const node = walker.currentNode
    const parent = node.parentElement

    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(parent.tagName)) {
      continue
    }

    const original = node.textContent ?? ''
    let nextValue = original

    for (const [pattern, replacement] of replacements) {
      if (!replacement) {
        continue
      }

      nextValue = nextValue.replace(pattern, replacement)
    }

    if (nextValue !== original) {
      node.textContent = nextValue
    }
  }
}

function rewriteAssetReferences(document: Document) {
  for (const image of Array.from(document.querySelectorAll('img'))) {
    const src = image.getAttribute('src')

    if (src) {
      image.setAttribute('src', normalizeMasterAssetUrl(src))
    }

    if (image.hasAttribute('data-src')) {
      image.setAttribute(
        'data-src',
        normalizeMasterAssetUrl(image.getAttribute('data-src') ?? ''),
      )
    }

    image.removeAttribute('srcset')
    image.removeAttribute('data-srcset')
  }

  for (const source of Array.from(document.querySelectorAll('source'))) {
    const srcset = source.getAttribute('srcset')

    if (srcset) {
      source.setAttribute('srcset', normalizeMasterAssetUrl(srcset.split(',')[0]))
    }
  }

  for (const link of Array.from(document.querySelectorAll('link[href]'))) {
    const href = link.getAttribute('href') ?? ''
    const rel = link.getAttribute('rel') ?? ''

    if (rel.includes('stylesheet') || rel === 'icon') {
      link.setAttribute('href', normalizeMasterAssetUrl(href))
    }
  }
}

function cleanupMasterDocument(document: Document) {
  for (const selector of [
    'script',
    'iframe',
    'noscript',
    'shopify-accelerated-checkout',
    'shopify-paypal-button',
    'more-payment-options-link',
    '#shopify-buyer-consent',
    '.shopify-payment-button',
    '.product__tax',
    'cart-drawer',
    'cart-notification',
    'shop-cart-sync',
    '#web-pixels-manager-sandbox-container',
  ]) {
    document.querySelectorAll(selector).forEach((element) => element.remove())
  }

  for (const link of Array.from(document.querySelectorAll('link'))) {
    const rel = link.getAttribute('rel') ?? ''

    if (
      rel === 'canonical' ||
      rel === 'alternate' ||
      rel.includes('prefetch') ||
      rel.includes('preconnect') ||
      rel.includes('dns-prefetch') ||
      rel.includes('preload')
    ) {
      link.remove()
    }
  }

  for (const meta of Array.from(document.querySelectorAll('meta'))) {
    const property = meta.getAttribute('property') ?? ''
    const name = meta.getAttribute('name') ?? ''

    if (
      property === 'og:url' ||
      property.startsWith('og:price') ||
      name.startsWith('twitter:')
    ) {
      meta.remove()
    }
  }

  rewriteAssetReferences(document)
}

function applyHeroContent(document: Document, data: ProjectData) {
  document.querySelectorAll('.product__title h1, .product__title h2').forEach((element) => {
    element.textContent = data.productTitle
  })

  setTextContent(
    document.querySelector('.lm-tot-bar span p'),
    `${'\u2605'.repeat(5)} ${data.topBarRatingText}`,
  )

  const topAvatars = Array.from(document.querySelectorAll('.lm-img-bar img'))
  topAvatars.forEach((avatar, index) => {
    const current = data.topBarAvatars[index] ?? data.topBarAvatars.at(-1)

    if (current) {
      setImageSource(avatar, current)
    }
  })

  const productParagraphs = Array.from(
    document.querySelectorAll('.product__info-container p.pp-text-base'),
  )

  setTextContent(productParagraphs[0] ?? null, data.productSubtitle)

  data.bulletPoints.forEach((item, index) => {
    setTextContent(productParagraphs[index + 1] ?? null, item.text)
  })

  data.offerHighlights.forEach((item, index) => {
    setTextContent(productParagraphs[index + 5] ?? null, item.text)
  })

  document
    .querySelectorAll('.price__sale s.price-item--regular')
    .forEach((element) => {
      element.textContent = normalizePrice(data.comparePrice)
    })
  document
    .querySelectorAll('.price__sale .price-item--sale, .price__regular .price-item--regular')
    .forEach((element) => {
      element.textContent = normalizePrice(data.salePrice)
    })
  document
    .querySelectorAll('.price__badge-sale')
    .forEach((element) => {
      element.textContent = data.saveBadgeText
    })

  const productAccordions = Array.from(
    document.querySelectorAll('.product__accordion details, details-disclosure details'),
  ).slice(0, 2)

  const shippingDetail = productAccordions[0]
  const returnsDetail = productAccordions[1]

  if (shippingDetail) {
    setTextContent(
      shippingDetail.querySelector('summary .pp-text-base, summary span'),
      data.shippingAccordionTitle,
    )
    setTextContent(shippingDetail.querySelector('article p'), data.shippingAccordionText)
  }

  if (returnsDetail) {
    setTextContent(
      returnsDetail.querySelector('summary .pp-text-base, summary span'),
      data.returnsAccordionTitle,
    )
    setTextContent(returnsDetail.querySelector('article p'), data.returnsAccordionText)
  }
}

function applySalesSections(document: Document, data: ProjectData, href: string) {
  const mixingHeading = findFirstByText(document, 'h2', 'Mai piu bevande')
    ?? findFirstByText(document, 'h2', 'Mai più bevande')

  if (mixingHeading) {
    setTextContent(mixingHeading, data.mixingSectionHeading)
    setTextContent(findFirstAfter(document, mixingHeading, 'p'), data.mixingSectionBody)
    setTextContent(
      findFirstAfter(document, mixingHeading, 'a.pagepilot-button'),
      data.mixingSectionCtaLabel,
    )
  }

  const routineHeading = findFirstByText(document, 'h2', 'Trasforma la routine')

  if (routineHeading) {
    setTextContent(routineHeading, data.routineSectionHeading)
    setTextContent(findFirstAfter(document, routineHeading, 'p'), data.routineSectionBody)
  }

  const comparisonHeading = findFirstByText(document, 'h2', 'Cosa rende speciale')

  if (comparisonHeading) {
    setTextContent(comparisonHeading, data.comparisonSectionHeading)
    setTextContent(findFirstAfter(document, comparisonHeading, 'p'), data.comparisonSectionBody)
  }

  const resultsHeading = findFirstByText(document, 'h2', 'Risultati visibili')

  if (resultsHeading) {
    setTextContent(resultsHeading, data.resultsSectionHeading)
    rebuildResults(document, resultsHeading, data)
  }

  const portabilityHeading = findFirstByText(document, 'h2', 'Portala ovunque')

  if (portabilityHeading) {
    setTextContent(portabilityHeading, data.portabilitySectionHeading)
    setTextContent(
      findFirstAfter(document, portabilityHeading, 'p'),
      data.portabilitySectionBody,
    )
  }

  document
    .querySelectorAll('.product__title a, .header__heading-link')
    .forEach((element) => element.setAttribute('href', href))

  document.querySelectorAll('a[href*="myshopify.com"]').forEach((element) => {
    element.setAttribute('href', href)
  })
}

function applyProjectData(document: Document, input: ProjectData) {
  const data = mergeProjectData(input)
  const href = sanitizeLink(data.ctaUrl)

  document.title = data.metaTitle
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    data.metaDescription,
  )
  document
    .querySelector('meta[property="og:title"]')
    ?.setAttribute('content', data.metaTitle)
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute('content', data.metaDescription)
  document
    .querySelector('meta[property="og:site_name"]')
    ?.setAttribute('content', data.brandName)
  document
    .querySelector('meta[property="og:image"]')
    ?.setAttribute('content', normalizeMasterAssetUrl(data.gallery[0]?.src ?? data.logoSrc))
  document
    .querySelector('meta[property="og:image:secure_url"]')
    ?.setAttribute('content', normalizeMasterAssetUrl(data.gallery[0]?.src ?? data.logoSrc))
  document
    .querySelector('link[rel="icon"]')
    ?.setAttribute('href', normalizeMasterAssetUrl(data.logoSrc))

  for (const logo of Array.from(
    document.querySelectorAll('.header__heading-logo-wrapper img'),
  )) {
    setImageSource(logo, {
      src: data.logoSrc,
      alt: data.logoAlt || data.brandName,
    })
  }

  applyHeroContent(document, data)
  applyGallery(document, data.gallery)

  data.sectionImages.forEach((item, index) => {
    const original = MASTER_SECTION_IMAGES[index]

    if (original) {
      replaceImagesBySource(document, original, item)
    }
  })

  data.demoMedia.forEach((item, index) => {
    const original = MASTER_DEMO_MEDIA[index]

    if (original) {
      replaceImagesBySource(document, original, item)
    }
  })

  const reviewerAvatar = document.querySelector('img[alt="Reviewer"]')

  if (reviewerAvatar) {
    setImageSource(reviewerAvatar, {
      src: data.reviewerAvatarSrc,
      alt: data.reviewerAvatarAlt,
    })
  }

  replaceButtonsWithLinks(document, 'button.pagepilot-button', href)
  replaceButtonsWithLinks(document, 'button[name="add"], button.product-form__submit', href)

  document
    .querySelectorAll('a.product-form__submit, a.sticky-atc-button')
    .forEach((element) => {
      element.textContent = data.primaryCtaLabel
      element.setAttribute('href', href)
    })

  const mixingCta = findFirstByText(document, 'a.pagepilot-button', 'La voglio')

  if (mixingCta) {
    mixingCta.textContent = data.mixingSectionCtaLabel
    mixingCta.setAttribute('href', href)
  }

  const resultsCta = findFirstByText(document, 'a.pagepilot-button', 'Ordina Ora')

  if (resultsCta) {
    resultsCta.textContent = data.primaryCtaLabel
    resultsCta.setAttribute('href', href)
  }

  const portabilityCta = findFirstByText(
    document,
    'a.pagepilot-button',
    'Aggiungi al carrello',
  )

  if (portabilityCta) {
    portabilityCta.textContent = data.portabilitySectionCtaLabel
    portabilityCta.setAttribute('href', href)
  }

  const guaranteeCta = findFirstByText(document, 'a.pagepilot-button', 'Lo voglio')

  if (guaranteeCta) {
    guaranteeCta.textContent = data.primaryCtaLabel
    guaranteeCta.setAttribute('href', href)
  }

  applySalesSections(document, data, href)

  setTextContent(document.querySelector('.pagepilot-faqs h2'), data.faqHeading)
  setTextContent(document.querySelector('.pagepilot-faqs p'), data.faqIntro)
  rebuildFaqItems(document, data.faqItems)

  setTextContent(document.querySelector('.pagepilot-cta h2'), data.guaranteeTitle)
  setTextContent(document.querySelector('.pagepilot-cta p'), data.guaranteeText)

  rebuildReviews(document, data)
  sanitizeResidualSeedText(document, data)

  const customStyle = document.createElement('style')
  customStyle.textContent = `
    .master-review-grid {
      display: grid !important;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 16px;
      height: auto !important;
    }

    .master-review-grid .pp-review-sizer {
      display: none !important;
    }

    .master-review-grid .master-review-card {
      position: relative !important;
      inset: auto !important;
      width: auto !important;
      margin: 0 !important;
    }

    a.pagepilot-button,
    a.product-form__submit,
    a.sticky-atc-button,
    a.button {
      text-decoration: none !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media screen and (max-width: 1100px) {
      .master-review-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media screen and (max-width: 749px) {
      .master-review-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }
  `
  document.head.append(customStyle)
}

function createDomelioDocument(data: ProjectData) {
  const document = createDocument(domelioMasterHtml)

  cleanupMasterDocument(document)
  applyProjectData(document, data)

  return document
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Asset conversion failed'))
    }

    reader.onerror = () => reject(reader.error ?? new Error('Asset conversion failed'))
    reader.readAsDataURL(blob)
  })
}

async function fetchAsset(assetUrl: string) {
  const response = await fetch(assetUrl)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response
}

async function inlineAssetUrl(
  assetUrl: string,
  mode: AssetMode,
  warnings: string[],
  label: string,
) {
  if (!assetUrl || assetUrl.startsWith('data:')) {
    return assetUrl
  }

  if (mode === 'url') {
    return assetUrl
  }

  try {
    const response = await fetchAsset(assetUrl)
    const blob = await response.blob()
    return await blobToDataUrl(blob)
  } catch {
    warnings.push(`${label}: asset lasciato come URL perche non inlineabile.`)
    return assetUrl
  }
}

async function inlineCssUrls(
  cssText: string,
  stylesheetHref: string,
  mode: AssetMode,
  warnings: string[],
) {
  const matches = Array.from(cssText.matchAll(/url\(([^)]+)\)/g))
  let output = cssText

  for (const match of matches) {
    const original = match[0]
    const rawValue = match[1].trim().replace(/^['"]|['"]$/g, '')

    if (!rawValue || rawValue.startsWith('data:') || rawValue.startsWith('#')) {
      continue
    }

    const resolved = new URL(rawValue, new URL(stylesheetHref, `${getBaseOrigin()}/`))
    const nextValue = await inlineAssetUrl(
      resolved.toString(),
      mode,
      warnings,
      `CSS asset ${rawValue}`,
    )

    output = output.replace(original, `url("${nextValue}")`)
  }

  return output
}

async function inlineStylesheets(
  document: Document,
  mode: AssetMode,
  warnings: string[],
) {
  const links = Array.from(
    document.querySelectorAll('link[rel="stylesheet"][href]'),
  ) as HTMLLinkElement[]

  for (const link of links) {
    const href = link.getAttribute('href') ?? ''

    try {
      const response = await fetchAsset(href)
      const cssText = await response.text()
      const style = document.createElement('style')

      style.textContent = await inlineCssUrls(cssText, href, mode, warnings)
      link.replaceWith(style)
    } catch {
      warnings.push(`Stylesheet ${href} non inlineato.`)
    }
  }
}

async function inlineDomAssets(
  document: Document,
  mode: AssetMode,
  warnings: string[],
) {
  const icon = document.querySelector('link[rel="icon"]')

  if (icon) {
    const href = icon.getAttribute('href') ?? ''
    icon.setAttribute('href', await inlineAssetUrl(href, mode, warnings, 'Favicon'))
  }

  const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]

  for (const image of images) {
    const src = image.getAttribute('src') ?? ''
    image.setAttribute(
      'src',
      await inlineAssetUrl(src, mode, warnings, image.alt || 'Immagine'),
    )
  }

  const sources = Array.from(document.querySelectorAll('source[srcset]')) as HTMLSourceElement[]

  for (const source of sources) {
    const srcset = source.getAttribute('srcset') ?? ''

    if (!srcset) {
      continue
    }

    source.setAttribute(
      'srcset',
      await inlineAssetUrl(srcset, mode, warnings, 'Media source'),
    )
  }
}

function injectOptionalScript(document: Document) {
  const script = document.createElement('script')

  script.textContent = `
    const randomNumber = document.getElementById('randomNumber');
    if (randomNumber) {
      window.setInterval(() => {
        randomNumber.textContent = String(Math.floor(Math.random() * 5) + 5);
      }, 3000);
    }
  `

  document.body.append(script)
}

function serialize(document: Document) {
  return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
}

function normalizeFileName(value: string, projectName: string) {
  const fallback = `${projectName || 'landing-master'}.html`
  const safeRawValue = Array.from(value.trim() || fallback)
    .map((character) => {
      const code = character.charCodeAt(0)

      if (
        character === '<' ||
        character === '>' ||
        character === ':' ||
        character === '"' ||
        character === '/' ||
        character === '\\' ||
        character === '|' ||
        character === '?' ||
        character === '*' ||
        code < 32
      ) {
        return '-'
      }

      return character
    })
    .join('')

  const base = safeRawValue
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return base.toLowerCase().endsWith('.html') ? base : `${base}.html`
}

export function createPreviewHtml(
  data: ProjectData,
  includeInteractiveScript: boolean,
) {
  const document = createDomelioDocument(data)

  if (includeInteractiveScript) {
    injectOptionalScript(document)
  }

  return serialize(document)
}

export async function exportLandingHtml(
  data: ProjectData,
  options: ExportOptions,
): Promise<ExportResult> {
  const normalizedData = mergeProjectData(data)
  const warnings: string[] = []
  const document = createDomelioDocument(normalizedData)

  if (options.includeInteractiveScript) {
    injectOptionalScript(document)
  }

  await inlineStylesheets(document, options.assetMode, warnings)
  await inlineDomAssets(document, options.assetMode, warnings)

  return {
    fileName: normalizeFileName(options.fileName, normalizedData.projectName),
    html: serialize(document),
    warnings,
  }
}

export function downloadTextFile(fileName: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/html;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
