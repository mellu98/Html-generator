import { useId } from 'react'
import { createEmptyListItem } from '../schema'
import type {
  ListFieldDefinition,
  ListItemFieldDefinition,
  ScalarFieldDefinition,
} from '../types'

interface ScalarFieldControlProps {
  field: ScalarFieldDefinition | ListItemFieldDefinition
  value: string | boolean
  onChange: (value: string | boolean) => void
  compact?: boolean
}

interface ListFieldControlProps {
  field: ListFieldDefinition
  items: Array<Record<string, string>>
  onChange: (value: Array<Record<string, string>>) => void
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Impossibile leggere il file selezionato.'))
    }

    reader.onerror = () =>
      reject(reader.error ?? new Error('Impossibile leggere il file selezionato.'))
    reader.readAsDataURL(file)
  })
}

function ScalarFieldControl({
  field,
  value,
  onChange,
  compact = false,
}: ScalarFieldControlProps) {
  const inputId = useId()
  const isBoolean = typeof value === 'boolean'
  const safeValue = isBoolean ? value : value ?? ''

  if (field.type === 'toggle') {
    return (
      <label className="field field--toggle" htmlFor={inputId}>
        <span className="field__meta">
          <span className="field__label">{field.label}</span>
          {field.helpText ? (
            <span className="field__help">{field.helpText}</span>
          ) : null}
        </span>
        <span className="toggle">
          <input
            id={inputId}
            checked={Boolean(safeValue)}
            type="checkbox"
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="toggle__track" aria-hidden="true" />
        </span>
      </label>
    )
  }

  const sharedProps = {
    id: inputId,
    className: compact ? 'control control--compact' : 'control',
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {field.label}
      </label>
      {field.helpText ? <p className="field__help">{field.helpText}</p> : null}

      {field.type === 'richtext' ? (
        <textarea
          {...sharedProps}
          placeholder={field.placeholder}
          rows={compact ? 4 : 5}
          value={String(safeValue)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {field.type === 'text' || field.type === 'url' ? (
        <input
          {...sharedProps}
          placeholder={field.placeholder}
          type={field.type === 'url' ? 'url' : 'text'}
          value={String(safeValue)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {field.type === 'color' ? (
        <div className="color-control">
          <input
            id={inputId}
            className="color-control__picker"
            type="color"
            value={String(safeValue) || '#000000'}
            onChange={(event) => onChange(event.target.value)}
          />
          <input
            className={compact ? 'control control--compact' : 'control'}
            type="text"
            value={String(safeValue)}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : null}

      {field.type === 'image' ? (
        <div className="image-control">
          <input
            {...sharedProps}
            placeholder="https://..."
            type="url"
            value={String(safeValue)}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="image-control__actions">
            <label className="mini-button mini-button--ghost" htmlFor={`${inputId}-file`}>
              Carica immagine
            </label>
            <input
              id={`${inputId}-file`}
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={async (event) => {
                const file = event.target.files?.[0]

                if (!file) {
                  return
                }

                const dataUrl = await readFileAsDataUrl(file)
                onChange(dataUrl)
                event.target.value = ''
              }}
            />
            {safeValue ? (
              <button
                className="mini-button"
                type="button"
                onClick={() => onChange('')}
              >
                Pulisci
              </button>
            ) : null}
          </div>
          {safeValue ? (
            <div className="image-preview">
              <img src={String(safeValue)} alt={field.label} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function ListFieldControl({
  field,
  items,
  onChange,
}: ListFieldControlProps) {
  const safeItems = items.length > 0 ? items : field.defaultValue

  return (
    <div className="field">
      <div className="field__row">
        <div>
          <span className="field__label">{field.label}</span>
          {field.helpText ? <p className="field__help">{field.helpText}</p> : null}
        </div>
        <button
          className="mini-button mini-button--primary"
          type="button"
          onClick={() => {
            if (field.maxItems && safeItems.length >= field.maxItems) {
              return
            }

            onChange([...safeItems, createEmptyListItem(field)])
          }}
        >
          Aggiungi {field.itemLabel}
        </button>
      </div>

      <div className="list-editor">
        {safeItems.map((item, index) => (
          <article className="list-item" key={`${field.key}-${index}`}>
            <div className="list-item__header">
              <strong>
                {field.itemLabel} {index + 1}
              </strong>
              <div className="list-item__actions">
                <button
                  className="mini-button"
                  disabled={safeItems.length <= (field.minItems ?? 0)}
                  type="button"
                  onClick={() => {
                    const nextItems = safeItems.filter((_, itemIndex) => itemIndex !== index)
                    onChange(nextItems)
                  }}
                >
                  Rimuovi
                </button>
              </div>
            </div>

            <div className="list-item__grid">
              {field.itemFields.map((itemField) => (
                <ScalarFieldControl
                  compact
                  field={itemField}
                  key={`${field.key}-${itemField.key}-${index}`}
                  value={item[itemField.key] ?? ''}
                  onChange={(nextValue) => {
                    const nextItems = safeItems.map((currentItem, itemIndex) => {
                      if (itemIndex !== index) {
                        return currentItem
                      }

                      return {
                        ...currentItem,
                        [itemField.key]: String(nextValue),
                      }
                    })

                    onChange(nextItems)
                  }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function FieldControl(props: ScalarFieldControlProps) {
  return <ScalarFieldControl {...props} />
}
