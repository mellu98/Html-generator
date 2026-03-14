import {
  discoveryMissingInputLabels,
} from '../lib/discovery'
import type {
  DiscoveryChatStatus,
  DiscoveryMessage,
  DiscoveryMissingInput,
} from '../types'

interface DiscoveryChatPanelProps {
  configured: boolean
  model: string
  status: DiscoveryChatStatus
  messages: DiscoveryMessage[]
  composerValue: string
  missingInputs: DiscoveryMissingInput[]
  projectCopyProfileConfigured: boolean
  onComposerChange: (value: string) => void
  onSend: () => void
  onGenerate: () => void
}

export function DiscoveryChatPanel({
  configured,
  model,
  status,
  messages,
  composerValue,
  missingInputs,
  projectCopyProfileConfigured,
  onComposerChange,
  onSend,
  onGenerate,
}: DiscoveryChatPanelProps) {
  const ready = status === 'ready_to_generate'

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Intervista guidata AI</h2>
          <p>
            Questa chat segue il comportamento di Signora Market Copy: prima
            raccoglie offerta, buyer personas e obiezioni, poi ti lascia generare
            il copy finale.
          </p>
          <p>
            {projectCopyProfileConfigured
              ? 'Profilo copy del progetto attivo e caricato dal server.'
              : 'Se vuoi un tono ancora piu preciso, puoi comunque incollare un prompt master extra nel form sotto.'}
          </p>
        </div>
        <span className="preview-meta">
          {configured ? `Discovery AI - ${model}` : 'OpenAI non configurato'}
        </span>
      </div>

      <div className="discovery-status">
        {missingInputs.length > 0 ? (
          missingInputs.map((item) => (
            <span className="status-chip" key={item}>
              Manca: {discoveryMissingInputLabels[item]}
            </span>
          ))
        ) : (
          <span className="status-chip">Brief pronto per la generazione</span>
        )}
      </div>

      <div className="chat-thread" role="log" aria-live="polite">
        {messages.map((message) => (
          <article
            className={`chat-bubble chat-bubble--${message.role}`}
            key={message.id}
          >
            <span className="chat-bubble__role">
              {message.role === 'assistant' ? 'Signora Market Copy' : 'Tu'}
            </span>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <div className="chat-composer">
        <label className="sr-only" htmlFor="discovery-composer">
          Scrivi la risposta per la discovery chat
        </label>
        <textarea
          className="control"
          id="discovery-composer"
          placeholder="Scrivi qui la tua risposta: prodotto, target, obiezioni, recensioni negative, angle, offer, tutto quello che hai."
          rows={5}
          value={composerValue}
          onChange={(event) => onComposerChange(event.target.value)}
        />
        <div className="chat-actions">
          <button
            className="button button--ghost"
            disabled={!configured || status === 'loading' || !composerValue.trim()}
            type="button"
            onClick={onSend}
          >
            {status === 'loading' ? 'Sto analizzando...' : 'Invia risposta'}
          </button>
          <button
            className="button button--primary"
            disabled={!configured || !ready}
            type="button"
            onClick={onGenerate}
          >
            Genera copy finale
          </button>
        </div>
      </div>
    </section>
  )
}
