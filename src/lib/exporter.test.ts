import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultExportOptions, defaultProjectData } from '../schema'
import { createPreviewHtml, exportLandingHtml } from './exporter'

function successfulFetchStub() {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input)

    if (url.includes('.css')) {
      return new Response('body{background-image:url("/masters/domelio/assets/mock.webp");}', {
        status: 200,
        headers: {
          'Content-Type': 'text/css',
        },
      })
    }

    if (url.includes('.woff2') || url.includes('.woff')) {
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: {
          'Content-Type': 'font/woff2',
        },
      })
    }

    if (
      url.includes('.webp') ||
      url.includes('.gif') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg')
    ) {
      return new Response(new Uint8Array([137, 80, 78, 71]), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      })
    }

    return new Response('ok', { status: 200 })
  })
}

describe('exporter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', successfulFetchStub())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds a preview HTML document from the same portable export pipeline', async () => {
    const html = await createPreviewHtml(defaultProjectData, {
      assetMode: 'inline',
      includeInteractiveScript: true,
    })
    const document = new DOMParser().parseFromString(html, 'text/html')
    const contentClone = document.body.cloneNode(true) as HTMLElement

    contentClone.querySelectorAll('script, style, noscript, template').forEach((element) => {
      element.remove()
    })

    const visibleText = contentClone.textContent?.toLowerCase() ?? ''
    const titleText = document.title.toLowerCase()

    expect(html).toContain(defaultProjectData.productTitle)
    expect(html).toContain(defaultProjectData.primaryCtaLabel)
    expect(html).not.toContain('<iframe')
    expect(html).toContain('data-preview-safety')
    expect(html).toContain("target.closest('a[href]')")
    expect(html).toContain('data:image/png;base64')
    expect(titleText).not.toContain('domelio')
    expect(titleText).not.toContain('tazza auto-mescolante')
    expect(visibleText).not.toContain('domelio')
    expect(visibleText).not.toContain('tazza auto-mescolante')
  })

  it('exports inline assets as a single portable HTML', async () => {
    const result = await exportLandingHtml(defaultProjectData, defaultExportOptions)

    expect(result.fileName).toBe(defaultExportOptions.fileName)
    expect(result.warnings).toHaveLength(0)
    expect(result.html).toContain('data:image/png;base64')
    expect(result.html).toContain(defaultProjectData.reviewHeading)
  })

  it('falls back to remote asset URLs when a specific asset cannot be inlined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input)

        if (url.includes('logo-test.png')) {
          throw new Error('cors blocked')
        }

        return successfulFetchStub()(input)
      }),
    )

    const result = await exportLandingHtml(
      {
        ...defaultProjectData,
        logoSrc: 'https://example.com/logo-test.png',
        logoAlt: 'Logo test',
      },
      defaultExportOptions,
    )

    expect(result.html).toContain('https://example.com/logo-test.png')
    expect(
      result.warnings.some((warning) =>
        warning.includes('Favicon') || warning.includes('Logo test'),
      ),
    ).toBe(true)
  })

  it('replaces routine benefits and comparison labels instead of leaking master copy', async () => {
    const html = await createPreviewHtml(
      {
        ...defaultProjectData,
        routineBenefitItems: [
          {
            title: 'Raccolta veloce',
            body: 'Passa sui tessuti e porta via peli e pelucchi in pochi gesti.',
          },
          {
            title: 'Pulizia semplice',
            body: 'Svuoti il serbatoio senza fogli adesivi da cambiare ogni volta.',
          },
          {
            title: 'Delicato sui tessuti',
            body: 'Usalo su abiti, divani e sedili senza stressare le superfici.',
          },
          {
            title: 'Sempre pronto',
            body: 'Compatto, riutilizzabile e comodo da tenere in casa o in auto.',
          },
        ],
        comparisonColumnOwnLabel: 'Il nostro rullo',
        comparisonColumnOtherLabel: 'Rulli classici',
        comparisonFeatureItems: [
          { label: 'Rimozione peli' },
          { label: 'Riutilizzo' },
          { label: 'Delicatezza' },
          { label: 'Velocita d uso' },
          { label: 'Costo nel tempo' },
        ],
      },
      {
        assetMode: 'inline',
        includeInteractiveScript: true,
      },
    )

    expect(html).toContain('Raccolta veloce')
    expect(html).toContain('Pulizia semplice')
    expect(html).toContain('Delicato sui tessuti')
    expect(html).toContain('Sempre pronto')
    expect(html).toContain('Il nostro rullo')
    expect(html).toContain('Rulli classici')
    expect(html).toContain('Rimozione peli')
    expect(html).toContain('Riutilizzo')
    expect(html).toContain('Delicatezza')
    expect(html).not.toContain('La Nostra Tazza')
    expect(html).not.toContain('Mescola in pochi secondi, risparmi tempo prezioso.')
    expect(html).not.toContain('Vetro borosilicato sopporta caldo e freddo.')
  })
})
