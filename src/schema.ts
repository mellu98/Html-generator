import type {
  AIGenerationForm,
  ExportOptions,
  FieldDefinition,
  ListFieldDefinition,
  ProjectData,
  ProjectListKey,
  TemplateSchema,
} from './types'

export const defaultProjectData: ProjectData = {
  projectName: 'Domelio Master Clone',
  metaTitle: 'Tazza Auto-Mescolante Veloce Professionale - Domelio',
  metaDescription:
    'Mescola istantaneamente senza grumi, ideale per caffe, proteine e vita frenetica',
  brandName: 'Domelio',
  logoSrc: '/masters/domelio/assets/ChatGPT_6.webp',
  logoAlt: 'Domelio',
  productTitle: 'Tazza Auto-Mescolante Veloce Professionale',
  productSubtitle:
    'che miscela caffe, proteine e bevande solubili in 3 secondi senza cucchiaino',
  salePrice: 'EUR 24,95',
  comparePrice: 'EUR 49,99',
  saveBadgeText: '- 50%',
  primaryCtaLabel: 'Lo voglio',
  ctaUrl: 'https://example.com/offerta',
  topBarRatingText: '4.8 su 5',
  topBarAvatars: [
    {
      src: '/masters/domelio/assets/ChatGPT-1_100x.webp',
      alt: 'Avatar recensione 1',
    },
    {
      src: '/masters/domelio/assets/ChatGPT-1_335a7d18-fdd6-4db7-ab78-7b8bda1d7544_100x.webp',
      alt: 'Avatar recensione 2',
    },
    {
      src: '/masters/domelio/assets/ChatGPT-1_4e82bc50-08a6-46b7-b2f9-2b895bbcd308_100x.webp',
      alt: 'Avatar recensione 3',
    },
    {
      src: '/masters/domelio/assets/ChatGPT-1_2f97a1c7-1b2a-4b56-bd5c-25ce5b8ce221_100x.webp',
      alt: 'Avatar recensione 4',
    },
  ],
  gallery: [
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_38_47.webp',
      alt: 'Immagine principale 1',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_39_39.webp',
      alt: 'Immagine principale 2',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_38_41.webp',
      alt: 'Immagine principale 3',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_47_24.webp',
      alt: 'Immagine principale 4',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_47_15.webp',
      alt: 'Immagine principale 5',
    },
  ],
  sectionImages: [
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_38_47(3).webp',
      alt: 'Immagine sezione 1',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_39_34.webp',
      alt: 'Immagine sezione 2',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_39_39(2).webp',
      alt: 'Immagine sezione 3',
    },
    {
      src: '/masters/domelio/assets/ChatGPT_Image_1_mar_2026_14_38_41(2).webp',
      alt: 'Immagine sezione 4',
    },
  ],
  demoMedia: [
    {
      src: '/masters/domelio/assets/gif1.gif',
      alt: 'Demo prodotto 1',
    },
    {
      src: '/masters/domelio/assets/gif2.gif',
      alt: 'Demo prodotto 2',
    },
    {
      src: '/masters/domelio/assets/gif3.gif',
      alt: 'Demo prodotto 3',
    },
  ],
  reviewerAvatarSrc: '/masters/domelio/assets/630cd7d7-c8e8-4cfd-93a2-2a119f1cefc4.webp',
  reviewerAvatarAlt: 'Cliente soddisfatto',
  bulletPoints: [
    { text: 'Mescola caffe e zucchero in 3 secondi' },
    { text: 'Scioglie cappuccino e cioccolata senza residui' },
    { text: 'Elimina i grumi delle proteine' },
    { text: 'Tiene la scrivania pulita' },
  ],
  offerHighlights: [
    { text: 'Perfetta per provare' },
    { text: "Una per casa, una per l'ufficio" },
    { text: 'Regalo perfetto + Prezzo migliore' },
  ],
  shippingAccordionTitle: 'Informazioni sulla spedizione',
  shippingAccordionText:
    "Offriamo spedizione tracciata e assicurata per tutti i nostri ordini. L'elaborazione dell'ordine richiede 1-3 giorni lavorativi prima della spedizione.",
  returnsAccordionTitle: 'Politica di reso',
  returnsAccordionText:
    'Amiamo i nostri prodotti e siamo sicuri che li amerai anche tu. Per questo offriamo una prova di 30 giorni senza rischi. Se non sei soddisfatto dei risultati, ti rimborseremo.',
  mixingSectionHeading:
    'Mai piu bevande grumose: mescola uniforme in pochi secondi',
  mixingSectionBody:
    'Basta scuotere o usare cucchiai. La tazza elettrica ad alto RPM crea una consistenza liscia in pochi secondi, cosi caffe proteico o cioccolata diventano pronti e gradevoli, senza grumi che rovinano il gusto.',
  mixingSectionCtaLabel: 'La voglio',
  routineSectionHeading: 'Trasforma la routine: bevande pronte e senza stress',
  routineSectionBody:
    'La tecnologia di miscelazione ad alta velocita elimina i grumi e riduce i tempi, offrendo bevande calde o fredde perfette senza fatica quotidiana.',
  comparisonSectionHeading: 'Cosa rende speciale la Tazza auto-mescolante ?',
  comparisonSectionBody:
    'Rispetto ad altri, questa tazza unisce miscelazione ad alto RPM, vetro resistente e portabilita a batteria. Offre bevande piu lisce, pulizia semplice e uso ovunque, senza compromessi.',
  resultsSectionHeading: 'Risultati visibili in pochi utilizzi',
  resultsItems: [
    {
      percent: '98%',
      text: 'Segnalato che il caffe proteico risulta privo di grumi in pochi secondi.',
    },
    {
      percent: '96%',
      text: 'Notato che la pulizia esterna riduce il tempo di manutenzione quotidiana.',
    },
    {
      percent: '97%',
      text: 'Esperienza che la tazza rimane integra dopo usi ripetuti con bevande calde.',
    },
  ],
  portabilitySectionHeading:
    'Portala ovunque: ufficio, palestra, auto o campeggio',
  portabilitySectionBody:
    'Leggera e alimentata a batterie AAA, la tazza e pratica da usare fuori casa. In macchina o in palestra prepari bevande omogenee senza attrezzi, risparmi tempo nelle pause e bevi subito una miscela perfetta.',
  portabilitySectionCtaLabel: 'Aggiungi al carrello',
  faqHeading: 'Domande frequenti per comprare con fiducia',
  faqIntro: 'Risposte chiare su uso, batterie, pulizia e sicurezza del prodotto',
  faqItems: [
    {
      question: 'Di quante batterie ho bisogno e sono incluse?',
      answer:
        'La tazza usa 2-3 batterie AAA (verificare il modello). Le batterie non sono incluse per facilitare il trasporto; puoi usarne di ricaricabili per risparmiare a lungo termine.',
    },
    {
      question: 'Posso mettere la tazza in lavastoviglie?',
      answer:
        "La parte esterna e resistente all'acqua IP e lavabile manualmente. Si sconsiglia l'immersione completa o la lavastoviglie per non bagnare il vano batterie.",
    },
    {
      question: 'Quali bevande posso mescolare senza problemi?',
      answer:
        'Caffe, latte, proteine, cioccolata, frullati leggeri e bevande istantanee. Evita miscele troppo dense o pezzi grandi per mantenere efficienza.',
    },
    {
      question: 'Il vetro e resistente agli sbalzi di temperatura?',
      answer:
        'Si, il vetro in borosilicato e progettato per resistere a variazioni termiche quotidiane, rendendo sicuro il passaggio da caldo a freddo.',
    },
    {
      question: "E silenziosa durante l'uso?",
      answer:
        'Il motore ad alto RPM e progettato per potenza e rumorosita contenuta: mescola rapidamente con disturbo minimo, ideale per ufficio o casa.',
    },
  ],
  guaranteeTitle:
    'Prova senza rischi: 30 giorni soddisfatti o rimborsati Tazza Auto-Mescolante',
  guaranteeText:
    "Prova la tazza per 30 giorni e verifica come semplifica le tue giornate: bevande senza grumi, pronta al volo e facile da pulire. Se non migliora la tua routine ti rimborsiamo, senza domande, per darti fiducia nell'acquisto.",
  reviewHeading: 'Ecco cosa dicono gli altri',
  reviewSubheading: 'Feedback reale da clienti soddisfatti',
  reviewVerifiedLabel: 'Acquirente Verificato',
  reviewItems: [
    {
      imageSrc: '/masters/domelio/assets/9cb135a9-ef56-42b4-8c8d-8e79f5a9e457.webp',
      author: 'Michele K.',
      quote:
        'Usato in campeggio e in ufficio, e davvero versatile: mischia proteine, caffe istantaneo e cacao. Leggero, robusto, rapido, ma ricordatevi le batterie AAA.',
    },
    {
      imageSrc: '/masters/domelio/assets/9ebebe83-c212-410e-9af3-95c3146a4383.webp',
      author: 'Francesco T.',
      quote:
        'Mischia caffe e latte senza schiuma e senza sporcare la cucina, comodo da portare.',
    },
    {
      imageSrc: '/masters/domelio/assets/327216c2-64cc-445c-a022-a840af0fca48.webp',
      author: 'Davide S.',
      quote: 'Vale i soldi spesi.',
    },
    {
      imageSrc: '/masters/domelio/assets/c6ef4cc9-22d8-4d9a-8202-44ed51fc65d3.webp',
      author: 'Emanuele Q.',
      quote:
        'Mi ha salvato le mattine frenetiche: un tasto e la bevanda e pronta, trasportabile e solida. Peccato batterie non incluse.',
    },
    {
      imageSrc: '/masters/domelio/assets/8eb77fa9-ecab-4521-a79a-91d674bfafa0.webp',
      author: 'Gabriele C.',
      quote:
        'Perfetto in macchina durante viaggi: compatto, usa batterie AAA quindi nessun cavo ingombrante.',
    },
    {
      imageSrc: '/masters/domelio/assets/31c880f6-2816-4ff8-952a-55eafddc5f70.webp',
      author: 'Simone L.',
      quote: 'Perfetto per proteine post-allenamento, portatile e robusto.',
    },
    {
      imageSrc: '/masters/domelio/assets/d6ec321e-5da1-44a1-ad9f-c5f211aa61eb.webp',
      author: 'Nicola Z.',
      quote:
        'Alleno al mattino e la uso per shakerare proteine, niente grumi e tenuta termica discreta, molto pratica per il mio ritmo.',
    },
    {
      imageSrc: '/masters/domelio/assets/2dcbf603-c500-422c-b04b-b74d01505644.webp',
      author: 'Matteo G.',
      quote: 'Design semplice, vetro spesso, si vede il livello e miscela omogenea.',
    },
    {
      imageSrc: '/masters/domelio/assets/b8e5dbf3-0b78-44ac-8bdf-3af49541d888.webp',
      author: 'Paolo F.',
      quote: 'Mixa velocemente, niente grumi, facile da pulire.',
    },
    {
      imageSrc: '/masters/domelio/assets/ee07bc26-c290-4fdc-ac9f-1f1c998d66e8.webp',
      author: 'Stefano N.',
      quote:
        "Ho provato con proteine e cacao: consistenza liscia, vetro resistente al caldo, la pulizia e rapida e l'interruttore e intuitivo.",
    },
    {
      imageSrc: '/masters/domelio/assets/380ce5f9-433a-458f-94ea-24dbe63b3caf.webp',
      author: 'Giorgio H.',
      quote:
        "Sono un tipo pignolo: testato con bevande fredde e calde, il vetro non ha subito crepe, l'elica a tre punte miscela uniforme senza spruzzi.",
    },
    {
      imageSrc: '/masters/domelio/assets/dd57fdb8-a453-4de7-a8e2-f10f8f16dbe3.webp',
      author: 'Enrico D.',
      quote:
        'Prima giravo con cucchiaio e polvere ovunque; ora miscela perfettamente, risparmio tempo e la pulizia e veloce. Consigliato a chi ama la praticita.',
    },
  ],
}

export const defaultAIGenerationForm: AIGenerationForm = {
  productName: 'Tazza Auto-Mescolante Veloce Professionale',
  brandName: 'Domelio',
  productCategory: 'Tazza auto-mescolante',
  productDescription:
    'Tazza portatile auto-mescolante per caffe, proteine e bevande solubili.',
  targetAudience:
    'Persone impegnate che vogliono preparare bevande senza grumi in pochi secondi.',
  painPoints:
    'Bevande con grumi, cucchiaini da lavare, tempo perso, uso scomodo fuori casa.',
  keyBenefits:
    'Mescola velocemente, riduce i grumi, e portatile, facile da pulire e pratica nella routine.',
  differentiators:
    'Vetro borosilicato, alimentazione a batterie, design premium, uso in ufficio, auto o palestra.',
  offerDetails:
    'Offerta con prezzo scontato e CTA verso checkout o pagina affiliate.',
  proofPoints:
    'Recensioni positive, garanzia 30 giorni, utilizzo per caffe e proteine, praticita quotidiana.',
  faqsContext:
    'Batterie, pulizia, materiali, rumorosita, bevande compatibili, spedizione e resi.',
  copyInstructions:
    'Scrivi in italiano, orientato conversione, tono chiaro e concreto, evita promesse mediche o non verificabili.',
}

export const defaultExportOptions: ExportOptions = {
  fileName: 'domelio-master-clone.html',
  assetMode: 'inline',
  includeInteractiveScript: true,
}

export const templateSchema: TemplateSchema = {
  id: 'domelio-master-clone',
  name: 'Domelio Master Clone',
  description:
    'Genera un HTML singolo partendo dalla landing Shopify reale fornita nel pacchetto zip.',
  sections: [
    {
      id: 'brand',
      title: 'Brand e metadata',
      description: 'Sostituisci logo, brand e meta della pagina senza toccare il layout.',
      fields: [
        {
          key: 'projectName',
          label: 'Nome progetto',
          type: 'text',
          defaultValue: defaultProjectData.projectName,
        },
        {
          key: 'brandName',
          label: 'Nome brand',
          type: 'text',
          defaultValue: defaultProjectData.brandName,
        },
        {
          key: 'logoSrc',
          label: 'Logo',
          type: 'image',
          defaultValue: defaultProjectData.logoSrc,
        },
        {
          key: 'logoAlt',
          label: 'Alt logo',
          type: 'text',
          defaultValue: defaultProjectData.logoAlt,
        },
        {
          key: 'metaTitle',
          label: 'Meta title',
          type: 'text',
          defaultValue: defaultProjectData.metaTitle,
        },
        {
          key: 'metaDescription',
          label: 'Meta description',
          type: 'richtext',
          defaultValue: defaultProjectData.metaDescription,
        },
      ],
    },
    {
      id: 'hero',
      title: 'Hero e acquisto',
      description:
        'Qui controlli titolo, prezzi, CTA, proof rapidi e testi che stanno sopra il fold.',
      fields: [
        {
          key: 'productTitle',
          label: 'Titolo prodotto',
          type: 'richtext',
          defaultValue: defaultProjectData.productTitle,
        },
        {
          key: 'productSubtitle',
          label: 'Sottotitolo prodotto',
          type: 'richtext',
          defaultValue: defaultProjectData.productSubtitle,
        },
        {
          key: 'salePrice',
          label: 'Prezzo scontato',
          type: 'text',
          defaultValue: defaultProjectData.salePrice,
        },
        {
          key: 'comparePrice',
          label: 'Prezzo barrato',
          type: 'text',
          defaultValue: defaultProjectData.comparePrice,
        },
        {
          key: 'saveBadgeText',
          label: 'Badge sconto',
          type: 'text',
          defaultValue: defaultProjectData.saveBadgeText,
        },
        {
          key: 'primaryCtaLabel',
          label: 'CTA principale',
          type: 'text',
          defaultValue: defaultProjectData.primaryCtaLabel,
        },
        {
          key: 'ctaUrl',
          label: 'URL CTA',
          type: 'url',
          defaultValue: defaultProjectData.ctaUrl,
        },
        {
          key: 'topBarRatingText',
          label: 'Rating top bar',
          type: 'text',
          defaultValue: defaultProjectData.topBarRatingText,
        },
        {
          key: 'shippingAccordionTitle',
          label: 'Titolo spedizione',
          type: 'text',
          defaultValue: defaultProjectData.shippingAccordionTitle,
        },
        {
          key: 'shippingAccordionText',
          label: 'Testo spedizione',
          type: 'richtext',
          defaultValue: defaultProjectData.shippingAccordionText,
        },
        {
          key: 'returnsAccordionTitle',
          label: 'Titolo reso',
          type: 'text',
          defaultValue: defaultProjectData.returnsAccordionTitle,
        },
        {
          key: 'returnsAccordionText',
          label: 'Testo reso',
          type: 'richtext',
          defaultValue: defaultProjectData.returnsAccordionText,
        },
      ],
    },
    {
      id: 'media',
      title: 'Media e proof',
      description:
        'Carica immagini nuove e il motore le rimappa sugli slot visivi della master Domelio.',
      fields: [
        {
          key: 'topBarAvatars',
          label: 'Avatar top bar',
          type: 'list',
          itemLabel: 'Avatar',
          defaultValue: defaultProjectData.topBarAvatars,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Avatar',
            },
          ],
          minItems: 1,
        },
        {
          key: 'gallery',
          label: 'Gallery principale',
          type: 'list',
          itemLabel: 'Media',
          defaultValue: defaultProjectData.gallery,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Media prodotto',
            },
          ],
          minItems: 1,
        },
        {
          key: 'sectionImages',
          label: 'Immagini sezioni contenuto',
          type: 'list',
          itemLabel: 'Immagine',
          defaultValue: defaultProjectData.sectionImages,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Immagine sezione',
            },
          ],
          minItems: 1,
        },
        {
          key: 'demoMedia',
          label: 'Demo GIF / media',
          type: 'list',
          itemLabel: 'Demo',
          defaultValue: defaultProjectData.demoMedia,
          itemFields: [
            {
              key: 'src',
              label: 'Immagine o GIF',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'alt',
              label: 'Alt',
              type: 'text',
              defaultValue: 'Demo prodotto',
            },
          ],
          minItems: 1,
        },
        {
          key: 'reviewerAvatarSrc',
          label: 'Avatar social proof',
          type: 'image',
          defaultValue: defaultProjectData.reviewerAvatarSrc,
        },
        {
          key: 'reviewerAvatarAlt',
          label: 'Alt avatar social proof',
          type: 'text',
          defaultValue: defaultProjectData.reviewerAvatarAlt,
        },
        {
          key: 'bulletPoints',
          label: 'Bullet hero',
          type: 'list',
          itemLabel: 'Bullet',
          defaultValue: defaultProjectData.bulletPoints,
          itemFields: [
            {
              key: 'text',
              label: 'Testo bullet',
              type: 'text',
              defaultValue: 'Nuovo bullet',
            },
          ],
          minItems: 1,
        },
        {
          key: 'offerHighlights',
          label: 'Highlight bundle',
          type: 'list',
          itemLabel: 'Highlight',
          defaultValue: defaultProjectData.offerHighlights,
          itemFields: [
            {
              key: 'text',
              label: 'Testo highlight',
              type: 'text',
              defaultValue: 'Nuovo highlight',
            },
          ],
          minItems: 1,
        },
        {
          key: 'reviewItems',
          label: 'Review grid',
          type: 'list',
          itemLabel: 'Review',
          defaultValue: defaultProjectData.reviewItems,
          itemFields: [
            {
              key: 'imageSrc',
              label: 'Immagine review',
              type: 'image',
              defaultValue: '',
            },
            {
              key: 'author',
              label: 'Autore',
              type: 'text',
              defaultValue: 'Nome cliente',
            },
            {
              key: 'quote',
              label: 'Testo review',
              type: 'richtext',
              defaultValue: 'Testo recensione',
            },
          ],
          minItems: 1,
        },
      ],
    },
    {
      id: 'content',
      title: 'Sezioni di vendita',
      description:
        'Aggiorna i blocchi di copy principali della landing senza rompere struttura e ordine originale.',
      fields: [
        {
          key: 'mixingSectionHeading',
          label: 'Titolo sezione mix',
          type: 'richtext',
          defaultValue: defaultProjectData.mixingSectionHeading,
        },
        {
          key: 'mixingSectionBody',
          label: 'Testo sezione mix',
          type: 'richtext',
          defaultValue: defaultProjectData.mixingSectionBody,
        },
        {
          key: 'mixingSectionCtaLabel',
          label: 'CTA sezione mix',
          type: 'text',
          defaultValue: defaultProjectData.mixingSectionCtaLabel,
        },
        {
          key: 'routineSectionHeading',
          label: 'Titolo routine',
          type: 'richtext',
          defaultValue: defaultProjectData.routineSectionHeading,
        },
        {
          key: 'routineSectionBody',
          label: 'Testo routine',
          type: 'richtext',
          defaultValue: defaultProjectData.routineSectionBody,
        },
        {
          key: 'comparisonSectionHeading',
          label: 'Titolo confronto',
          type: 'richtext',
          defaultValue: defaultProjectData.comparisonSectionHeading,
        },
        {
          key: 'comparisonSectionBody',
          label: 'Testo confronto',
          type: 'richtext',
          defaultValue: defaultProjectData.comparisonSectionBody,
        },
        {
          key: 'resultsSectionHeading',
          label: 'Titolo risultati',
          type: 'richtext',
          defaultValue: defaultProjectData.resultsSectionHeading,
        },
        {
          key: 'resultsItems',
          label: 'Punti risultati',
          type: 'list',
          itemLabel: 'Risultato',
          defaultValue: defaultProjectData.resultsItems,
          itemFields: [
            {
              key: 'percent',
              label: 'Percentuale',
              type: 'text',
              defaultValue: '95%',
            },
            {
              key: 'text',
              label: 'Testo',
              type: 'richtext',
              defaultValue: 'Nuovo risultato',
            },
          ],
          minItems: 1,
        },
        {
          key: 'portabilitySectionHeading',
          label: 'Titolo portabilita',
          type: 'richtext',
          defaultValue: defaultProjectData.portabilitySectionHeading,
        },
        {
          key: 'portabilitySectionBody',
          label: 'Testo portabilita',
          type: 'richtext',
          defaultValue: defaultProjectData.portabilitySectionBody,
        },
        {
          key: 'portabilitySectionCtaLabel',
          label: 'CTA portabilita',
          type: 'text',
          defaultValue: defaultProjectData.portabilitySectionCtaLabel,
        },
      ],
    },
    {
      id: 'trust',
      title: 'FAQ e fiducia',
      description:
        'Aggiorna FAQ, sezione garanzia e intestazioni review mantenendo la stessa struttura PagePilot.',
      fields: [
        {
          key: 'faqHeading',
          label: 'Titolo FAQ',
          type: 'text',
          defaultValue: defaultProjectData.faqHeading,
        },
        {
          key: 'faqIntro',
          label: 'Intro FAQ',
          type: 'richtext',
          defaultValue: defaultProjectData.faqIntro,
        },
        {
          key: 'faqItems',
          label: 'Domande FAQ',
          type: 'list',
          itemLabel: 'FAQ',
          defaultValue: defaultProjectData.faqItems,
          itemFields: [
            {
              key: 'question',
              label: 'Domanda',
              type: 'text',
              defaultValue: 'Nuova domanda',
            },
            {
              key: 'answer',
              label: 'Risposta',
              type: 'richtext',
              defaultValue: 'Nuova risposta',
            },
          ],
          minItems: 1,
        },
        {
          key: 'guaranteeTitle',
          label: 'Titolo garanzia',
          type: 'richtext',
          defaultValue: defaultProjectData.guaranteeTitle,
        },
        {
          key: 'guaranteeText',
          label: 'Testo garanzia',
          type: 'richtext',
          defaultValue: defaultProjectData.guaranteeText,
        },
        {
          key: 'reviewHeading',
          label: 'Titolo review',
          type: 'text',
          defaultValue: defaultProjectData.reviewHeading,
        },
        {
          key: 'reviewSubheading',
          label: 'Sottotitolo review',
          type: 'text',
          defaultValue: defaultProjectData.reviewSubheading,
        },
        {
          key: 'reviewVerifiedLabel',
          label: 'Label verificato',
          type: 'text',
          defaultValue: defaultProjectData.reviewVerifiedLabel,
        },
      ],
    },
  ],
}

export const assetSchema: TemplateSchema = {
  id: 'domelio-master-assets',
  name: 'Domelio Assets',
  description: 'Logo e immagini che restano manuali nel flusso AI-first.',
  sections: [
    {
      id: 'brand-assets',
      title: 'Logo',
      description: 'Qui carichi il logo del prodotto o del brand.',
      fields: [
        {
          key: 'logoSrc',
          label: 'Logo',
          type: 'image',
          defaultValue: defaultProjectData.logoSrc,
        },
        {
          key: 'logoAlt',
          label: 'Alt logo',
          type: 'text',
          defaultValue: defaultProjectData.logoAlt,
        },
      ],
    },
    {
      id: 'media-assets',
      title: 'Immagini',
      description: 'Gallery, immagini sezione, GIF demo e avatar che vuoi sostituire.',
      fields: templateSchema.sections
        .find((section) => section.id === 'media')
        ?.fields.filter((field) => field.key !== 'bulletPoints' && field.key !== 'offerHighlights' && field.key !== 'reviewItems') ?? [],
    },
  ],
}

const listKeys: ProjectListKey[] = [
  'topBarAvatars',
  'gallery',
  'sectionImages',
  'demoMedia',
  'bulletPoints',
  'offerHighlights',
  'resultsItems',
  'faqItems',
  'reviewItems',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFieldDefinition(key: ProjectListKey) {
  for (const section of templateSchema.sections) {
    const match = section.fields.find(
      (field): field is ListFieldDefinition =>
        field.type === 'list' && field.key === key,
    )

    if (match) {
      return match
    }
  }

  return null
}

function mergeList(
  key: ProjectListKey,
  incoming: unknown,
): Array<Record<string, string>> {
  const field = getFieldDefinition(key)

  if (!field || !Array.isArray(incoming) || incoming.length === 0) {
    return field?.defaultValue ?? []
  }

  return incoming
    .filter(isRecord)
    .map((item) => {
      const nextItem: Record<string, string> = {}

      for (const itemField of field.itemFields) {
        const rawValue = item[itemField.key]
        nextItem[itemField.key] =
          typeof rawValue === 'string' ? rawValue : itemField.defaultValue
      }

      return nextItem
    })
}

export function mergeProjectData(
  incoming?: Partial<ProjectData> | null,
): ProjectData {
  if (!incoming) {
    return structuredClone(defaultProjectData)
  }

  const merged: ProjectData = {
    ...defaultProjectData,
    ...incoming,
  }
  const listTarget = merged as unknown as Record<
    ProjectListKey,
    Array<Record<string, string>>
  >

  for (const key of listKeys) {
    const rawList = incoming[key]
    listTarget[key] = mergeList(key, rawList)
  }

  return merged
}

export function mergeExportOptions(
  incoming?: Partial<ExportOptions> | null,
): ExportOptions {
  if (!incoming) {
    return { ...defaultExportOptions }
  }

  return {
    ...defaultExportOptions,
    ...incoming,
  }
}

export function createEmptyListItem(field: ListFieldDefinition) {
  const item: Record<string, string> = {}

  for (const itemField of field.itemFields) {
    item[itemField.key] = itemField.defaultValue
  }

  return item
}

export function getListFieldDefinition(key: ProjectListKey) {
  return getFieldDefinition(key)
}

export function cloneFieldDefault(field: FieldDefinition) {
  if (field.type === 'list') {
    return field.defaultValue.map((item) => ({ ...item }))
  }

  return field.defaultValue
}
