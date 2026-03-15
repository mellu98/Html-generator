import {
  defaultAIGenerationForm,
  defaultExportOptions,
  defaultProjectData,
  mergeExportOptions,
  mergeProjectData,
} from '../schema'
import {
  createInitialDiscoveryMessages,
  getDiscoveryMissingInputs,
  normalizeDiscoveryMessages,
} from './discovery'
import { createInitialImageMessages } from './image-chat'
import type {
  AIGenerationForm,
  DiscoveryChatStatus,
  DiscoveryMessage,
  DiscoveryMissingInput,
  ExportOptions,
  ImageChatMessage,
  ImageGenerationCategory,
  ImageReferenceAsset,
  PersistedDraft,
  ProjectData,
} from '../types'

const STORAGE_KEY = 'landing-generator/draft-v3'
const STORAGE_VERSION = 3

function fallbackDraft() {
  return {
    projectData: structuredClone(defaultProjectData),
    exportOptions: { ...defaultExportOptions },
    aiForm: { ...defaultAIGenerationForm },
    discoveryMessages: createInitialDiscoveryMessages(),
    discoveryStatus: 'needs_input' as Exclude<DiscoveryChatStatus, 'loading' | 'error'>,
    discoveryMissingInputs: getDiscoveryMissingInputs(defaultAIGenerationForm),
    imageMessages: createInitialImageMessages(),
    imageCategory: '' as ImageGenerationCategory | '',
    imageReference: null as ImageReferenceAsset | null,
  }
}

export function loadStoredDraft(): {
  aiForm: AIGenerationForm
  projectData: ProjectData
  exportOptions: ExportOptions
  discoveryMessages: DiscoveryMessage[]
  discoveryStatus: Exclude<DiscoveryChatStatus, 'loading' | 'error'>
  discoveryMissingInputs: DiscoveryMissingInput[]
  imageMessages: ImageChatMessage[]
  imageCategory: ImageGenerationCategory | ''
  imageReference: ImageReferenceAsset | null
} {
  if (typeof window === 'undefined') {
    return fallbackDraft()
  }

  const rawDraft = window.localStorage.getItem(STORAGE_KEY)

  if (!rawDraft) {
    return fallbackDraft()
  }

  try {
    const parsed = JSON.parse(rawDraft) as Partial<PersistedDraft>

    return {
      aiForm: {
        ...defaultAIGenerationForm,
        ...parsed.aiForm,
      },
      projectData: mergeProjectData(parsed.projectData),
      exportOptions: mergeExportOptions(parsed.exportOptions),
      discoveryMessages:
        Array.isArray(parsed.discoveryMessages) && parsed.discoveryMessages.length > 0
          ? normalizeDiscoveryMessages(parsed.discoveryMessages)
          : createInitialDiscoveryMessages(),
      discoveryStatus:
        parsed.discoveryStatus === 'ready_to_generate'
          ? 'ready_to_generate'
          : 'needs_input',
      discoveryMissingInputs: Array.isArray(parsed.discoveryMissingInputs)
        ? parsed.discoveryMissingInputs
        : getDiscoveryMissingInputs({
            ...defaultAIGenerationForm,
            ...parsed.aiForm,
          }),
      imageMessages:
        Array.isArray(parsed.imageMessages) && parsed.imageMessages.length > 0
          ? parsed.imageMessages.filter(
              (message): message is ImageChatMessage =>
                typeof message?.id === 'string' &&
                (message.role === 'assistant' || message.role === 'user') &&
                typeof message.content === 'string',
            )
          : createInitialImageMessages(),
      imageCategory:
        typeof parsed.imageCategory === 'string' ? parsed.imageCategory : '',
      imageReference:
        parsed.imageReference &&
        typeof parsed.imageReference.src === 'string' &&
        typeof parsed.imageReference.fileName === 'string' &&
        typeof parsed.imageReference.mimeType === 'string'
          ? parsed.imageReference
          : null,
    }
  } catch {
    return fallbackDraft()
  }
}

export function saveStoredDraft(draft: {
  aiForm: AIGenerationForm
  projectData: ProjectData
  exportOptions: ExportOptions
  discoveryMessages: DiscoveryMessage[]
  discoveryStatus: Exclude<DiscoveryChatStatus, 'loading' | 'error'>
  discoveryMissingInputs: DiscoveryMissingInput[]
  imageMessages: ImageChatMessage[]
  imageCategory: ImageGenerationCategory | ''
  imageReference: ImageReferenceAsset | null
}) {
  if (typeof window === 'undefined') {
    return
  }

  const payload: PersistedDraft = {
    version: STORAGE_VERSION,
    aiForm: draft.aiForm,
    projectData: draft.projectData,
    exportOptions: draft.exportOptions,
    discoveryMessages: draft.discoveryMessages,
    discoveryStatus: draft.discoveryStatus,
    discoveryMissingInputs: draft.discoveryMissingInputs,
    imageMessages: draft.imageMessages,
    imageCategory: draft.imageCategory,
    imageReference: draft.imageReference,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredDraft() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
