import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialDiscoveryMessages } from './discovery'
import { createInitialImageMessages } from './image-chat'
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
    expect(result.discoveryMessages).toEqual(createInitialDiscoveryMessages())
    expect(result.imageMessages).toEqual(createInitialImageMessages())
    expect(result.imageCategory).toBe('')
    expect(result.imageReference).toBeNull()
    expect(result.discoveryStatus).toBe('needs_input')
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
      discoveryMessages: [
        ...createInitialDiscoveryMessages(),
        {
          id: 'user-1',
          role: 'user',
          content: 'Il prodotto e uno shaker magnetico portatile.',
        },
      ],
      discoveryStatus: 'ready_to_generate',
      discoveryMissingInputs: [],
      imageMessages: createInitialImageMessages(),
      imageCategory: 'Lifestyle',
      imageReference: null,
    })

    const result = loadStoredDraft()

    expect(result.aiForm.productName).toBe('Shaker Premium')
    expect(result.projectData.projectName).toBe('Nuova variante')
    expect(result.exportOptions.assetMode).toBe('url')
    expect(result.discoveryStatus).toBe('ready_to_generate')
    expect(result.discoveryMessages).toHaveLength(2)
    expect(result.imageCategory).toBe('Lifestyle')
  })

  it('clears the saved draft', () => {
    saveStoredDraft({
      aiForm: defaultAIGenerationForm,
      projectData: defaultProjectData,
      exportOptions: defaultExportOptions,
      discoveryMessages: createInitialDiscoveryMessages(),
      discoveryStatus: 'needs_input',
      discoveryMissingInputs: ['offerta', 'buyer_personas', 'obiezioni'],
      imageMessages: createInitialImageMessages(),
      imageCategory: '',
      imageReference: null,
    })

    clearStoredDraft()

    expect(loadStoredDraft().projectData.projectName).toBe(
      defaultProjectData.projectName,
    )
  })
})
