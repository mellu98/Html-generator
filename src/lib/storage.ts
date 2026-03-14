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
} from './discovery'
import type {
  AIGenerationForm,
  DiscoveryChatStatus,
  DiscoveryMessage,
  DiscoveryMissingInput,
  ExportOptions,
  PersistedDraft,
  ProjectData,
} from '../types'

const STORAGE_KEY = 'landing-generator/draft-v2'
const STORAGE_VERSION = 2

function fallbackDraft() {
  return {
    projectData: structuredClone(defaultProjectData),
    exportOptions: { ...defaultExportOptions },
    aiForm: { ...defaultAIGenerationForm },
    discoveryMessages: createInitialDiscoveryMessages(),
    discoveryStatus: 'needs_input' as Exclude<DiscoveryChatStatus, 'loading' | 'error'>,
    discoveryMissingInputs: getDiscoveryMissingInputs(defaultAIGenerationForm),
  }
}

export function loadStoredDraft(): {
  aiForm: AIGenerationForm
  projectData: ProjectData
  exportOptions: ExportOptions
  discoveryMessages: DiscoveryMessage[]
  discoveryStatus: Exclude<DiscoveryChatStatus, 'loading' | 'error'>
  discoveryMissingInputs: DiscoveryMissingInput[]
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
          ? parsed.discoveryMessages
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
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredDraft() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
