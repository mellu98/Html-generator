import {
  defaultAIGenerationForm,
  defaultExportOptions,
  defaultProjectData,
  mergeExportOptions,
  mergeProjectData,
} from '../schema'
import type {
  AIGenerationForm,
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
  }
}

export function loadStoredDraft(): {
  aiForm: AIGenerationForm
  projectData: ProjectData
  exportOptions: ExportOptions
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
    }
  } catch {
    return fallbackDraft()
  }
}

export function saveStoredDraft(draft: {
  aiForm: AIGenerationForm
  projectData: ProjectData
  exportOptions: ExportOptions
}) {
  if (typeof window === 'undefined') {
    return
  }

  const payload: PersistedDraft = {
    version: STORAGE_VERSION,
    aiForm: draft.aiForm,
    projectData: draft.projectData,
    exportOptions: draft.exportOptions,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredDraft() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
