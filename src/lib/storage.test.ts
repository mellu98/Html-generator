import { beforeEach, describe, expect, it } from 'vitest'
import {
  defaultAIGenerationForm,
  defaultExportOptions,
  defaultProjectData,
} from '../schema'
import { clearStoredDraft, loadStoredDraft, saveStoredDraft } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when no draft is stored', () => {
    const result = loadStoredDraft()

    expect(result.aiForm.productName).toBe(defaultAIGenerationForm.productName)
    expect(result.projectData.projectName).toBe(defaultProjectData.projectName)
    expect(result.exportOptions.fileName).toBe(defaultExportOptions.fileName)
  })

  it('persists and restores draft state', () => {
    saveStoredDraft({
      aiForm: {
        ...defaultAIGenerationForm,
        productName: 'Shaker Premium',
      },
      projectData: {
        ...defaultProjectData,
        projectName: 'Nuova variante',
      },
      exportOptions: {
        ...defaultExportOptions,
        assetMode: 'url',
      },
    })

    const result = loadStoredDraft()

    expect(result.aiForm.productName).toBe('Shaker Premium')
    expect(result.projectData.projectName).toBe('Nuova variante')
    expect(result.exportOptions.assetMode).toBe('url')
  })

  it('clears the saved draft', () => {
    saveStoredDraft({
      aiForm: defaultAIGenerationForm,
      projectData: defaultProjectData,
      exportOptions: defaultExportOptions,
    })

    clearStoredDraft()

    expect(loadStoredDraft().projectData.projectName).toBe(
      defaultProjectData.projectName,
    )
  })
})
