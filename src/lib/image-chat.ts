import type {
  GeneratedImageItem,
  ImageAssignmentTarget,
  ImageChatMessage,
  ImageGenerationCategory,
  ImageReferenceAsset,
  ProjectData,
} from '../types'

export const imageGenerationCategories: ImageGenerationCategory[] = [
  'How To/Process',
  'Infographic',
  'Ingredients',
  'Lifestyle',
  'Product Photo',
  'Social Proof',
]

export const imageCategoryListPrompt = [
  'Categorie disponibili:',
  '',
  'How To/Process',
  '',
  'Infographic',
  '',
  'Ingredients',
  '',
  'Lifestyle',
  '',
  'Product Photo',
  '',
  'Social Proof',
].join('\n')

function normalizeCategoryToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeImageCategory(value: string): ImageGenerationCategory | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const numericIndex = Number(trimmed)

  if (Number.isInteger(numericIndex) && numericIndex >= 1 && numericIndex <= 6) {
    return imageGenerationCategories[numericIndex - 1]
  }

  const normalized = normalizeCategoryToken(trimmed)

  return (
    imageGenerationCategories.find(
      (category) => normalizeCategoryToken(category) === normalized,
    ) ?? null
  )
}

export function createInitialImageMessages(): ImageChatMessage[] {
  return [
    {
      id: 'image-assistant-initial',
      role: 'assistant',
      content: imageCategoryListPrompt,
    },
  ]
}

function loadDataUrlImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossibile leggere l immagine.'))
    image.src = dataUrl
  })
}

async function resizeDataUrlImage(
  dataUrl: string,
  options: {
    width: number
    height: number
    mimeType: string
    quality?: number
    fit?: 'stretch' | 'contain'
  },
) {
  const image = await loadDataUrlImage(dataUrl)
  const canvas = document.createElement('canvas')

  canvas.width = options.width
  canvas.height = options.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas non disponibile per preparare l immagine.')
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (options.fit === 'contain') {
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale
    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2

    context.drawImage(image, x, y, drawWidth, drawHeight)
  } else {
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
  }

  return canvas.toDataURL(options.mimeType, options.quality ?? 0.92)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('File immagine non leggibile.'))
    }

    reader.onerror = () => reject(reader.error ?? new Error('File immagine non leggibile.'))
    reader.readAsDataURL(file)
  })
}

export async function prepareReferenceImage(file: File): Promise<ImageReferenceAsset> {
  const rawDataUrl = await readFileAsDataUrl(file)
  const prepared = await resizeDataUrlImage(rawDataUrl, {
    width: 1400,
    height: 1400,
    mimeType: file.type.startsWith('image/') ? file.type : 'image/png',
    fit: 'contain',
  })

  return {
    src: prepared,
    fileName: file.name,
    mimeType: file.type || 'image/png',
  }
}

export async function normalizeGeneratedImage(dataUrl: string) {
  return await resizeDataUrlImage(dataUrl, {
    width: 2000,
    height: 2000,
    mimeType: 'image/png',
  })
}

export function createGeneratedImage(
  src: string,
  category: ImageGenerationCategory,
): GeneratedImageItem {
  return {
    id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    src,
    category,
    assignedTo: '',
    createdAt: new Date().toISOString(),
  }
}

export function assignGeneratedImageToProject(
  projectData: ProjectData,
  target: ImageAssignmentTarget,
  image: GeneratedImageItem,
  slotCursor: {
    benefit: number
    proof: number
  },
) {
  const nextProjectData = structuredClone(projectData)
  const nextCursor = { ...slotCursor }
  const altBase = nextProjectData.productTitle.trim() || nextProjectData.projectName || 'Prodotto'

  if (target === 'hero') {
    nextProjectData.gallery[0] = {
      src: image.src,
      alt: `${altBase} hero`,
    }
  }

  if (target === 'benefit') {
    const slotIndex = nextCursor.benefit % 2
    nextProjectData.sectionImages[slotIndex] = {
      src: image.src,
      alt: `${altBase} benefit detail ${slotIndex + 1}`,
    }
    nextCursor.benefit += 1
  }

  if (target === 'proof') {
    const slotIndex = 2 + (nextCursor.proof % 2)
    nextProjectData.sectionImages[slotIndex] = {
      src: image.src,
      alt: `${altBase} proof ${slotIndex - 1}`,
    }
    nextCursor.proof += 1
  }

  return {
    projectData: nextProjectData,
    slotCursor: nextCursor,
  }
}
