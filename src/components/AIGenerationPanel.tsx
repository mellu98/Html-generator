import type { AIGenerationForm } from '../types'

interface AIGenerationPanelProps {
  form: AIGenerationForm
  configured: boolean
  model: string
  projectCopyProfileConfigured: boolean
  readyToGenerate: boolean
  missingInputs: string[]
  status: 'idle' | 'loading' | 'done' | 'error'
  message: string
  onChange: (key: keyof AIGenerationForm, value: string) => void
  onGenerate: () => void
  onToggleAdvancedEditor: () => void
  showAdvancedEditor: boolean
}

const textFields: Array<{
  key: keyof AIGenerationForm
  label: string
  kind: 'input' | 'textarea'
  placeholder: string
}> = [
  {
    key: 'productName',
    label: 'Nome prodotto',
    kind: 'input',
    placeholder: 'Es. Shaker magnetico premium',
  },
  {
    key: 'brandName',
    label: 'Brand',
    kind: 'input',
    placeholder: 'Es. Nome brand',
  },
  {
    key: 'productCategory',
    label: 'Categoria',
    kind: 'input',
    placeholder: 'Es. Beauty device, accessorio cucina, fitness tool',
  },
  {
    key: 'productDescription',
    label: 'Descrizione prodotto',
    kind: 'textarea',
    placeholder: 'Descrivi cosa fa il prodotto in modo concreto.',
  },
  {
    key: 'targetAudience',
    label: 'Target',
    kind: 'textarea',
    placeholder: 'Per chi e pensato il prodotto?',
  },
  {
    key: 'painPoints',
    label: 'Problemi risolti',
    kind: 'textarea',
    placeholder: 'Quali frizioni, fastidi o perdite di tempo elimina?',
  },
  {
    key: 'keyBenefits',
    label: 'Benefici chiave',
    kind: 'textarea',
    placeholder: 'I 3-5 benefici principali che vuoi spingere.',
  },
  {
    key: 'differentiators',
    label: 'Differenze rispetto agli altri',
    kind: 'textarea',
    placeholder: 'Materiali, design, velocita, comodita, bundle, ecc.',
  },
  {
    key: 'offerDetails',
    label: 'Offerta e CTA',
    kind: 'textarea',
    placeholder: 'Prezzo, sconto, bundle, urgenza, destinazione CTA.',
  },
  {
    key: 'proofPoints',
    label: 'Proof e note verificabili',
    kind: 'textarea',
    placeholder: 'Garanzia, materiali, uso, tempi, dati reali, limitazioni.',
  },
  {
    key: 'faqsContext',
    label: 'FAQ / obiezioni',
    kind: 'textarea',
    placeholder: 'Le domande che GPT deve coprire nelle FAQ.',
  },
  {
    key: 'copyMasterPrompt',
    label: 'Prompt master GPT',
    kind: 'textarea',
    placeholder:
      'Incolla qui le istruzioni complete del tuo vecchio GPT personalizzato.',
  },
  {
    key: 'copyStyleExamples',
    label: 'Esempi stile GPT',
    kind: 'textarea',
    placeholder:
      'Incolla headline, CTA o sezioni gia generate dal tuo GPT che vuoi far imitare.',
  },
  {
    key: 'copyInstructions',
    label: 'Istruzioni extra prodotto',
    kind: 'textarea',
    placeholder: 'Qui aggiungi angoli, focus o richieste specifiche solo per questo prodotto.',
  },
]

export function AIGenerationPanel({
  form,
  configured,
  model,
  projectCopyProfileConfigured,
  readyToGenerate,
  missingInputs,
  status,
  message,
  onChange,
  onGenerate,
  onToggleAdvancedEditor,
  showAdvancedEditor,
}: AIGenerationPanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Generazione automatica AI</h2>
          <p>
            Compila il brief prodotto, poi GPT riempie in automatico il copy della
            landing. Logo e immagini restano manuali.
          </p>
          <p>
            {projectCopyProfileConfigured
              ? 'Profilo copy del progetto attivo da file prompts/custom-copywriter.md.'
              : 'Puoi usare un prompt master fisso del progetto oppure incollare il tuo GPT personalizzato qui sotto.'}
          </p>
        </div>
        <span className="preview-meta">
          {configured ? `OpenAI pronto - ${model}` : 'OpenAI non configurato'}
        </span>
      </div>

      <div className="ai-grid">
        {textFields.map((field) => (
          <label className="field" key={field.key}>
            <span className="field__label">{field.label}</span>
            {field.kind === 'input' ? (
              <input
                className="control"
                placeholder={field.placeholder}
                type="text"
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <textarea
                className="control"
                placeholder={field.placeholder}
                rows={
                  field.key === 'copyMasterPrompt'
                    ? 8
                    : field.key === 'copyStyleExamples' || field.key === 'copyInstructions'
                      ? 6
                      : 4
                }
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div className="ai-actions">
        <button
          className="button button--primary"
          disabled={!configured || status === 'loading' || !readyToGenerate}
          type="button"
          onClick={onGenerate}
        >
          {status === 'loading'
            ? 'Genero il copy...'
            : readyToGenerate
              ? 'Genera copy automatico'
              : 'Completa prima l intervista'}
        </button>
        <button className="button button--ghost" type="button" onClick={onToggleAdvancedEditor}>
          {showAdvancedEditor ? 'Nascondi editor avanzato' : 'Mostra editor avanzato'}
        </button>
      </div>

      {missingInputs.length > 0 ? (
        <div className="message-card message-card--neutral">
          <strong>
            Prima della generazione mancano ancora: {missingInputs.join(', ')}.
          </strong>
        </div>
      ) : null}

      <div
        className={`message-card message-card--${
          status === 'error' ? 'error' : status === 'done' ? 'success' : 'neutral'
        }`}
      >
        <strong>{message}</strong>
      </div>
    </section>
  )
}
