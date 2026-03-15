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
            emoji: '🧥',
            title: 'Raccolta veloce',
            body: 'Passa sui tessuti e porta via peli e pelucchi in pochi gesti.',
          },
          {
            emoji: '🧹',
            title: 'Pulizia semplice',
            body: 'Svuoti il serbatoio senza fogli adesivi da cambiare ogni volta.',
          },
          {
            emoji: '🛋️',
            title: 'Delicato sui tessuti',
            body: 'Usalo su abiti, divani e sedili senza stressare le superfici.',
          },
          {
            emoji: '♻️',
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
    expect(html).toContain('🧥')
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

  it('rebuilds leaked master FAQs from current project context', async () => {
    const html = await createPreviewHtml(
      {
        ...defaultProjectData,
        productTitle: 'Pratico Rullo Leva Peli Riutilizzabile',
        productSubtitle:
          'Raccoglie peli e pelucchi in pochi gesti e ti evita i rotoli adesivi usa e getta.',
        routineSectionBody:
          'Ti aiuta a tenere in ordine vestiti, divani e sedili con un gesto rapido quando ne hai bisogno.',
        comparisonSectionBody:
          'La differenza sta nel fatto che lo riusi nel tempo, lo svuoti facilmente e non devi comprare ricambi adesivi ogni settimana.',
        faqItems: [
          {
            question: 'Di quante batterie ho bisogno e sono incluse?',
            answer:
              'La tazza usa 2-3 batterie AAA (verificare il modello). Le batterie non sono incluse per facilitare il trasporto.',
          },
          {
            question: 'Posso mettere la tazza in lavastoviglie?',
            answer:
              "La parte esterna e resistente all'acqua IP e lavabile manualmente. Si sconsiglia l'immersione completa o la lavastoviglie.",
          },
          {
            question: 'Quali bevande posso mescolare senza problemi?',
            answer:
              'Caffe, latte, proteine, cioccolata e frullati leggeri.',
          },
          {
            question: 'Il vetro e resistente agli sbalzi di temperatura?',
            answer: 'Si, il vetro in borosilicato e progettato per resistere.',
          },
          {
            question: "E silenziosa durante l'uso?",
            answer: 'Il motore ad alto RPM e progettato per potenza e rumorosita contenuta.',
          },
        ],
      },
      {
        assetMode: 'inline',
        includeInteractiveScript: true,
      },
    )

    expect(html).toContain('Come si usa Pratico Rullo Leva Peli Riutilizzabile nella pratica?')
    expect(html).toContain('In quali situazioni rende meglio Pratico Rullo Leva Peli Riutilizzabile?')
    expect(html).toContain('Come funzionano spedizione e resi?')
    expect(html).not.toContain('Di quante batterie ho bisogno e sono incluse?')
    expect(html).not.toContain('Posso mettere la tazza in lavastoviglie?')
    expect(html).not.toContain('Quali bevande posso mescolare senza problemi?')
    expect(html).not.toContain('Il vetro e resistente agli sbalzi di temperatura?')
  })

  it('normalizes long results badges into short percentages for the circular UI', async () => {
    const html = await createPreviewHtml(
      {
        ...defaultProjectData,
        resultsItems: [
          { percent: '1 passata', text: 'Per sistemare al volo i peli prima di uscire.' },
          { percent: 'zero adesivi', text: 'Niente fogli da staccare e buttare ogni volta.' },
          { percent: '1 gesto', text: 'Quando si riempie, lo svuoti senza perdere tempo.' },
        ],
      },
      {
        assetMode: 'inline',
        includeInteractiveScript: true,
      },
    )

    expect(html).not.toContain('1 passata')
    expect(html).not.toContain('zero adesivi')
    expect(html).not.toContain('1 gesto')
    expect(html).toMatch(/>9[0-5]%</)
    expect(html).toMatch(/--percentValue:\s*9[0-5]/)
  })

  it('adds contextual emojis to hero benefits when they are missing', async () => {
    const html = await createPreviewHtml(
      {
        ...defaultProjectData,
        bulletPoints: [
          { text: 'Aiuta a rimuovere peli e pelucchi in pochi gesti' },
          { text: 'Utile su abiti, divano e sedili auto' },
          { text: 'Riutilizzabile: niente rotoli adesivi da ricomprare' },
          { text: 'Si pulisce svuotando i peli raccolti nel cestino' },
        ],
      },
      {
        assetMode: 'inline',
        includeInteractiveScript: true,
      },
    )

    expect(html).toContain('🐾 Aiuta a rimuovere peli e pelucchi in pochi gesti')
    expect(html).toContain('🚗 Utile su abiti, divano e sedili auto')
    expect(html).toContain('♻️ Riutilizzabile: niente rotoli adesivi da ricomprare')
    expect(html).toContain('🧼 Si pulisce svuotando i peli raccolti nel cestino')
  })
})
