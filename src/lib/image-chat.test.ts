import { describe, expect, it } from 'vitest'
import { defaultProjectData } from '../schema'
import {
  assignGeneratedImageToProject,
  createGeneratedImage,
  imageCategoryListPrompt,
  normalizeImageCategory,
} from './image-chat'

describe('image-chat helpers', () => {
  it('normalizes numeric and textual category selections', () => {
    expect(normalizeImageCategory('1')).toBe('How To/Process')
    expect(normalizeImageCategory('social proof')).toBe('Social Proof')
    expect(normalizeImageCategory('Product Photo')).toBe('Product Photo')
    expect(normalizeImageCategory('categoria sbagliata')).toBeNull()
  })

  it('keeps the exact required category list prompt', () => {
    expect(imageCategoryListPrompt).toBe(
      [
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
      ].join('\n'),
    )
  })

  it('assigns generated images to hero, benefit and proof slots', () => {
    const image = createGeneratedImage('data:image/png;base64,AAAA', 'Lifestyle')
    const heroAssigned = assignGeneratedImageToProject(
      defaultProjectData,
      'hero',
      image,
      {
        benefit: 0,
        proof: 0,
      },
    )

    expect(heroAssigned.projectData.gallery[0].src).toBe(image.src)
    expect(heroAssigned.projectData.gallery[0].alt).toContain('hero')

    const benefitAssigned = assignGeneratedImageToProject(
      heroAssigned.projectData,
      'benefit',
      image,
      heroAssigned.slotCursor,
    )

    expect(benefitAssigned.projectData.sectionImages[0].src).toBe(image.src)
    expect(benefitAssigned.slotCursor.benefit).toBe(1)

    const proofAssigned = assignGeneratedImageToProject(
      benefitAssigned.projectData,
      'proof',
      image,
      benefitAssigned.slotCursor,
    )

    expect(proofAssigned.projectData.sectionImages[2].src).toBe(image.src)
    expect(proofAssigned.slotCursor.proof).toBe(1)
  })
})
