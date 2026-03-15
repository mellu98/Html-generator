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

  it('assigns generated images to explicit gallery and section slots', () => {
    const image = createGeneratedImage('data:image/png;base64,AAAA', 'Lifestyle')
    const heroAssigned = assignGeneratedImageToProject(
      defaultProjectData,
      'hero-2',
      image,
    )

    expect(heroAssigned.gallery[1].src).toBe(image.src)
    expect(heroAssigned.gallery[1].alt).toContain('hero 2')

    const detailAssigned = assignGeneratedImageToProject(
      heroAssigned,
      'detail-2',
      image,
    )

    expect(detailAssigned.gallery[3].src).toBe(image.src)
    expect(detailAssigned.gallery[3].alt).toContain('detail 2')

    const proofAssigned = assignGeneratedImageToProject(
      detailAssigned,
      'proof-2',
      image,
    )

    expect(proofAssigned.sectionImages[3].src).toBe(image.src)
    expect(proofAssigned.sectionImages[3].alt).toContain('proof 2')
  })
})
