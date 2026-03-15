import {
  imageAssignmentTargetLabels,
  imageAssignmentTargets,
  imageCategoryListPrompt,
  imageGenerationCategories,
} from '../lib/image-chat'
import type {
  GeneratedImageItem,
  ImageAssignmentTarget,
  ImageChatMessage,
  ImageGenerationStatus,
  ImageReferenceAsset,
} from '../types'

interface ImageGenerationPanelProps {
  configured: boolean
  model: string
  category: string
  referenceImage: ImageReferenceAsset | null
  messages: ImageChatMessage[]
  composerValue: string
  generatedImages: GeneratedImageItem[]
  status: ImageGenerationStatus
  feedbackMessage: string
  onComposerChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onGenerate: () => void
  onPickReferenceImage: (file: File | null) => void
  onClearReferenceImage: () => void
  onAssignImage: (imageId: string, target: ImageAssignmentTarget) => void
}

function assignmentLabel(value: GeneratedImageItem['assignedTo']) {
  return value ? `Assegnata a ${imageAssignmentTargetLabels[value]}` : ''
}

export function ImageGenerationPanel({
  configured,
  model,
  category,
  referenceImage,
  messages,
  composerValue,
  generatedImages,
  status,
  feedbackMessage,
  onComposerChange,
  onCategoryChange,
  onGenerate,
  onPickReferenceImage,
  onClearReferenceImage,
  onAssignImage,
}: ImageGenerationPanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>AI Immagini</h2>
          <p>
            Questo chatbot usa il tuo profilo Ecommerce Visual Art Director:
            prima immagine prodotto + categoria obbligatoria, poi genera visual
            1:1 pronti per landing e Shopify.
          </p>
          <p>
            Puoi assegnare ogni immagine generata allo slot preciso che vuoi:
            Hero 1, Hero 2, Detail, Benefit o Proof.
          </p>
        </div>
        <span className="preview-meta">
          {configured ? `Visual AI - ${model}` : 'OpenAI non configurato'}
        </span>
      </div>

      <div className="discovery-status">
        {!referenceImage ? (
          <span className="status-chip">Immagine prodotto obbligatoria</span>
        ) : (
          <span className="status-chip">{referenceImage.fileName}</span>
        )}

        {!category ? (
          <span className="status-chip">Categoria obbligatoria</span>
        ) : (
          <span className="status-chip">{category}</span>
        )}

        <span className="status-chip">Formato finale 1:1</span>
      </div>

      <div className="settings-grid image-chat__settings">
        <label className="field">
          <span className="field__label">Categoria</span>
          <select
            className="control"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Seleziona una categoria</option>
            {imageGenerationCategories.map((item, index) => (
              <option key={item} value={item}>
                {index + 1}. {item}
              </option>
            ))}
          </select>
          <span className="field__help image-chat__category-list">
            {imageCategoryListPrompt}
          </span>
        </label>

        <div className="field">
          <span className="field__label">Immagine prodotto di riferimento</span>
          <input
            className="control"
            accept="image/*"
            type="file"
            onChange={(event) => onPickReferenceImage(event.target.files?.[0] ?? null)}
          />
          <span className="field__help">
            Deve restare fedele a forma, etichetta, logo, colori e materiali del
            prodotto originale.
          </span>

          {referenceImage ? (
            <div className="image-chat__reference">
              <div className="image-preview image-chat__reference-preview">
                <img alt={referenceImage.fileName} src={referenceImage.src} />
              </div>
              <div className="image-control__actions">
                <button
                  className="mini-button mini-button--ghost"
                  type="button"
                  onClick={onClearReferenceImage}
                >
                  Rimuovi immagine
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="chat-thread" role="log" aria-live="polite">
        {messages.map((message) => (
          <article
            className={`chat-bubble chat-bubble--${message.role}`}
            key={message.id}
          >
            <span className="chat-bubble__role">
              {message.role === 'assistant' ? 'Visual Art Director' : 'Tu'}
            </span>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <div className="chat-composer">
        <label className="sr-only" htmlFor="image-chat-composer">
          Scrivi la direzione visiva per generare l immagine
        </label>
        <textarea
          className="control"
          id="image-chat-composer"
          placeholder="Direzione opzionale: ambiente, mood, props minimi, tipo di scena, livello premium, focus visuale, ecc."
          rows={4}
          value={composerValue}
          onChange={(event) => onComposerChange(event.target.value)}
        />
        <div className="chat-actions">
          <button
            className="button button--primary"
            disabled={!configured || status === 'loading'}
            type="button"
            onClick={onGenerate}
          >
            {status === 'loading' ? 'Genero immagine...' : 'Genera immagine'}
          </button>
        </div>

        {feedbackMessage ? (
          <div
            className={`message-card message-card--${
              status === 'error' ? 'error' : status === 'generated' ? 'success' : 'neutral'
            }`}
          >
            <strong>{feedbackMessage}</strong>
          </div>
        ) : null}
      </div>

      {generatedImages.length > 0 ? (
        <div className="image-generation-grid">
          {generatedImages.map((image) => {
            const assignedLabel = assignmentLabel(image.assignedTo)

            return (
              <article className="generated-image-card" key={image.id}>
                <div className="generated-image-card__media">
                  <img alt={`${image.category} generated`} src={image.src} />
                </div>
                <div className="generated-image-card__meta">
                  <span className="status-chip">{image.category}</span>
                  {assignedLabel ? <span className="status-chip">{assignedLabel}</span> : null}
                </div>
                <div className="generated-image-card__actions">
                  {imageAssignmentTargets.map((target) => (
                    <button
                      key={target.value}
                      className="mini-button mini-button--ghost"
                      type="button"
                      onClick={() => onAssignImage(image.id, target.value)}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
