import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import { AIGenerationPanel } from './components/AIGenerationPanel'
import { DiscoveryChatPanel } from './components/DiscoveryChatPanel'
import { ProjectForm } from './components/ProjectForm'
import { continueDiscoveryChat, generateLandingCopy, getAIHealth } from './lib/ai'
import {
  createInitialDiscoveryMessages,
  getDiscoveryMissingInputs,
  isDiscoveryReady,
} from './lib/discovery'
import { createPreviewHtml, downloadTextFile, exportLandingHtml } from './lib/exporter'
import { clearStoredDraft, loadStoredDraft, saveStoredDraft } from './lib/storage'
import {
  assetSchema,
  defaultAIGenerationForm,
  defaultExportOptions,
  defaultProjectData,
  mergeExportOptions,
  mergeProjectData,
  templateSchema,
} from './schema'
import type {
  AIGenerationForm,
  DiscoveryChatStatus,
  DiscoveryMessage,
  ProjectListKey,
  ProjectScalarKey,
} from './types'

const materialsChecklist = [
  'Flusso principale: brief prodotto + AI copy generation.',
  'Logo e immagini restano manuali e li carichi tu dal browser.',
  'L editor completo resta disponibile solo come correzione avanzata.',
  'La landing finale viene esportata in un solo HTML per WordPress.',
  'Per una nuova master mi mandi di nuovo ZIP o SingleFile + screenshot + URL.',
]

const PREVIEW_VIEWPORT_WIDTH = 1440
const PREVIEW_VIEWPORT_HEIGHT = 960

function formatSaveTime(date: Date | null) {
  if (!date) {
    return 'in attesa del primo salvataggio'
  }

  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createDefaultFileName(projectName: string) {
  const normalizedName = projectName
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${normalizedName || 'landing-master'}.html`
}

function App() {
  const previewViewportRef = useRef<HTMLDivElement | null>(null)
  const [initialDraft] = useState(() => loadStoredDraft())
  const [aiForm, setAiForm] = useState(initialDraft.aiForm)
  const [projectData, setProjectData] = useState(initialDraft.projectData)
  const [discoveryMessages, setDiscoveryMessages] = useState(initialDraft.discoveryMessages)
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryChatStatus>(
    initialDraft.discoveryStatus,
  )
  const [discoveryComposer, setDiscoveryComposer] = useState('')
  const [exportOptions, setExportOptions] = useState(
    mergeExportOptions({
      ...defaultExportOptions,
      ...initialDraft.exportOptions,
      fileName:
        initialDraft.exportOptions.fileName ||
        createDefaultFileName(initialDraft.projectData.projectName),
    }),
  )
  const [saveState, setSaveState] = useState<'saving' | 'saved'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [previewReloadToken, setPreviewReloadToken] = useState(0)
  const [previewLoadState, setPreviewLoadState] = useState<'idle' | 'loading' | 'ready'>(
    'idle',
  )
  const [showPreview, setShowPreview] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [aiHealth, setAiHealth] = useState({
    configured: false,
    model: 'gpt-5.4',
    projectCopyProfileConfigured: false,
  })
  const [aiState, setAiState] = useState<{
    kind: 'idle' | 'loading' | 'done' | 'error'
    message: string
  }>({
    kind: 'idle',
    message:
      'Compila il brief, carica logo e immagini, poi lascia a GPT il copy della landing.',
  })
  const [discoveryState, setDiscoveryState] = useState<{
    kind: 'idle' | 'loading' | 'error'
    message: string
  }>({
    kind: 'idle',
    message: '',
  })
  const [exportState, setExportState] = useState<{
    kind: 'idle' | 'working' | 'done' | 'error'
    message: string
    warnings: string[]
  }>({
    kind: 'idle',
    message: 'Genera il copy, controlla la preview ed esporta il tuo HTML.',
    warnings: [],
  })

  const deferredProjectData = useDeferredValue(projectData)
  const deferredInteractive = useDeferredValue(exportOptions.includeInteractiveScript)
  const previewHtml = useMemo(
    () =>
      showPreview
        ? createPreviewHtml(deferredProjectData, deferredInteractive)
        : '',
    [deferredInteractive, deferredProjectData, showPreview],
  )
  const previewDocumentHtml = useMemo(
    () =>
      previewHtml
        ? `${previewHtml}\n<!-- preview-reload:${previewReloadToken} -->`
        : '',
    [previewHtml, previewReloadToken],
  )
  const previewUrl = useMemo(() => {
    if (!showPreview || !previewDocumentHtml) {
      return ''
    }

    const blob = new Blob([previewDocumentHtml], {
      type: 'text/html;charset=utf-8',
    })

    return URL.createObjectURL(blob)
  }, [previewDocumentHtml, showPreview])
  const discoveryMissingInputs = getDiscoveryMissingInputs(aiForm)
  const readyToGenerate = isDiscoveryReady(aiForm)
  const resolvedDiscoveryStatus =
    discoveryStatus === 'loading' || discoveryStatus === 'error'
      ? discoveryStatus
      : readyToGenerate
        ? 'ready_to_generate'
        : 'needs_input'

  function updateExportSettings(
    updater: (current: typeof exportOptions) => typeof exportOptions,
  ) {
    setSaveState('saving')
    setExportOptions(updater)
  }

  const persistDraft = useEffectEvent(
    (
      nextAiForm: AIGenerationForm,
      nextProjectData: typeof projectData,
      nextExportOptions: typeof exportOptions,
      nextDiscoveryMessages: DiscoveryMessage[],
      nextDiscoveryStatus: Extract<DiscoveryChatStatus, 'needs_input' | 'ready_to_generate'>,
      nextDiscoveryMissingInputs: typeof discoveryMissingInputs,
    ) => {
      saveStoredDraft({
        aiForm: nextAiForm,
        projectData: nextProjectData,
        exportOptions: nextExportOptions,
        discoveryMessages: nextDiscoveryMessages,
        discoveryStatus: nextDiscoveryStatus,
        discoveryMissingInputs: nextDiscoveryMissingInputs,
      })
      setLastSavedAt(new Date())
      setSaveState('saved')
    },
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextMissingInputs = getDiscoveryMissingInputs(aiForm)

      persistDraft(
        aiForm,
        projectData,
        exportOptions,
        discoveryMessages,
        readyToGenerate ? 'ready_to_generate' : 'needs_input',
        nextMissingInputs,
      )
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [
    aiForm,
    discoveryMessages,
    exportOptions,
    projectData,
    readyToGenerate,
  ])

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  useEffect(() => {
    if (!previewUrl) {
      return
    }

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    if (!showPreview) {
      return
    }

    const container = previewViewportRef.current

    if (!container) {
      return
    }

    const updateScale = () => {
      const nextWidth = container.clientWidth
      const nextHeight = container.clientHeight

      if (!nextWidth || !nextHeight) {
        return
      }

      setPreviewScale(
        Math.min(
          1,
          nextWidth / PREVIEW_VIEWPORT_WIDTH,
          nextHeight / PREVIEW_VIEWPORT_HEIGHT,
        ),
      )
    }

    updateScale()

    const observer = new ResizeObserver(() => updateScale())
    observer.observe(container)

    return () => observer.disconnect()
  }, [showPreview])

  useEffect(() => {
    if (!showPreview) {
      return
    }

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPreview(false)
        setPreviewLoadState('idle')
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [showPreview])

  useEffect(() => {
    let isMounted = true

    async function loadHealth() {
      try {
        const health = await getAIHealth()

        if (!isMounted) {
          return
        }

        setAiHealth(health)
        if (!health.configured) {
          setAiState({
            kind: 'error',
            message:
              'Configura OPENAI_API_KEY per usare la generazione automatica del copy.',
          })
        }
      } catch {
        if (!isMounted) {
          return
        }

        setAiState({
          kind: 'error',
          message:
            'API AI non raggiungibile. Avvia anche il server locale oppure controlla Render.',
        })
      }
    }

    void loadHealth()

    return () => {
      isMounted = false
    }
  }, [])

  function updateAIField(key: keyof AIGenerationForm, value: string) {
    setSaveState('saving')
    setAiForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function reloadPreview() {
    setPreviewLoadState('loading')
    setPreviewReloadToken((current) => current + 1)
  }

  function closePreview() {
    setShowPreview(false)
    setPreviewLoadState('idle')
  }

  function togglePreview() {
    if (showPreview) {
      closePreview()
      return
    }

    setShowPreview(true)
    reloadPreview()
  }

  function updateScalarField(key: ProjectScalarKey, value: string | boolean) {
    setSaveState('saving')
    setProjectData((current) => ({
      ...current,
      [key]: value,
    }))

    if (key === 'projectName' && !exportOptions.fileName.trim()) {
      setExportOptions((current) => ({
        ...current,
        fileName: createDefaultFileName(String(value)),
      }))
    }
  }

  function updateListField(
    key: ProjectListKey,
    value: Array<Record<string, string>>,
  ) {
    setSaveState('saving')
    setProjectData((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function resetField(key: ProjectScalarKey | ProjectListKey, value: unknown) {
    setSaveState('saving')
    setProjectData((current) => ({
      ...current,
      [key]: Array.isArray(value)
        ? value.map((item) => ({ ...item }))
        : value,
    }))
  }

  async function handleGenerateCopy() {
    if (!readyToGenerate) {
      setAiState({
        kind: 'error',
        message:
          'Prima completa l intervista guidata: servono offerta, buyer personas e obiezioni reali.',
      })
      return
    }

    setAiState({
      kind: 'loading',
      message: 'GPT sta costruendo il copy della landing sulla master attiva...',
    })

    try {
      const result = await generateLandingCopy({
        brief: aiForm,
        currentProjectData: projectData,
      })

      setProjectData(mergeProjectData(result.projectData))
      setExportOptions((current) => ({
        ...current,
        fileName: createDefaultFileName(result.projectData.projectName),
      }))
      if (showPreview) {
        reloadPreview()
      }
      setAiState({
        kind: 'done',
        message: `Copy generato con ${result.model}. Controlla preview, logo e immagini, poi esporta.`,
      })
    } catch (error) {
      setAiState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Generazione AI non riuscita.',
      })
    }
  }

  async function handleDiscoverySend() {
    const trimmedComposer = discoveryComposer.trim()

    if (!trimmedComposer) {
      return
    }

    const userMessage: DiscoveryMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedComposer,
    }
    const nextMessages = [...discoveryMessages, userMessage]

    setSaveState('saving')
    setDiscoveryMessages(nextMessages)
    setDiscoveryComposer('')
    setDiscoveryStatus('loading')
    setDiscoveryState({
      kind: 'loading',
      message: 'Sto leggendo quello che mi hai mandato e preparo la prossima domanda...',
    })

    try {
      const response = await continueDiscoveryChat({
        messages: nextMessages,
        brief: aiForm,
      })

      const mergedForm = {
        ...aiForm,
        ...response.briefPatch,
      }
      const nextMissing = getDiscoveryMissingInputs(mergedForm)

      setAiForm(mergedForm)
      setDiscoveryMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.assistantMessage,
        },
      ])
      setDiscoveryStatus(
        response.status === 'ready_to_generate' || nextMissing.length === 0
          ? 'ready_to_generate'
          : 'needs_input',
      )
      setDiscoveryState({
        kind: 'idle',
        message: '',
      })
      setAiState({
        kind: 'idle',
        message:
          nextMissing.length === 0
            ? 'Intervista completa. Ora puoi generare il copy finale.'
            : 'Intervista aggiornata. Continua a rispondere alle domande chiave.',
      })
    } catch (error) {
      setDiscoveryStatus('error')
      setDiscoveryState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Discovery chat non riuscita.',
      })
      setAiState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Discovery chat non riuscita.',
      })
    }
  }

  async function handleExport() {
    setExportState({
      kind: 'working',
      message: 'Sto preparando il file HTML finale...',
      warnings: [],
    })

    try {
      const result = await exportLandingHtml(projectData, {
        ...exportOptions,
        fileName:
          exportOptions.fileName || createDefaultFileName(projectData.projectName),
      })

      downloadTextFile(result.fileName, result.html)
      setExportState({
        kind: 'done',
        message: `Export completato: ${result.fileName}`,
        warnings: result.warnings,
      })
    } catch (error) {
      setExportState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Si e verificato un problema durante l export.',
        warnings: [],
      })
    }
  }

  function handleResetAll() {
    const shouldReset = window.confirm(
      'Vuoi davvero ripristinare la master attiva e perdere la bozza corrente?',
    )

    if (!shouldReset) {
      return
    }

    clearStoredDraft()

    startTransition(() => {
      setAiForm({ ...defaultAIGenerationForm })
      setProjectData(mergeProjectData(defaultProjectData))
      setDiscoveryMessages(createInitialDiscoveryMessages())
      setDiscoveryStatus('needs_input')
      setDiscoveryState({
        kind: 'idle',
        message: '',
      })
      setDiscoveryComposer('')
      setExportOptions({
        ...mergeExportOptions(defaultExportOptions),
        fileName: createDefaultFileName(defaultProjectData.projectName),
      })
      setAiState({
        kind: 'idle',
        message:
          'Bozza ripristinata. Puoi generare di nuovo il copy automatico dalla master attiva.',
      })
      setExportState({
        kind: 'idle',
        message: 'Bozza ripristinata ai valori neutri della master attiva.',
        warnings: [],
      })
    })
  }

  async function handleInstallApp() {
    if (!installPromptEvent) {
      return
    }

    await installPromptEvent.prompt()
    setInstallPromptEvent(null)
  }

  return (
    <div className="app-shell">
      <header className="panel-card panel-card--hero">
        <div className="hero-card__copy">
          <span className="eyebrow">PWA per landing WordPress</span>
          <h1>Landing Master Generator</h1>
          <p>
            Ora il flusso e AI-first: tu inserisci il brief prodotto, carichi
            logo e immagini, GPT genera il copy della landing e poi esporti un
            HTML unico pronto per WordPress.
          </p>
          <div className="hero-card__chips">
            <span className="status-chip">Auto-save {saveState}</span>
            <span className="status-chip">
              Ultimo salvataggio {formatSaveTime(lastSavedAt)}
            </span>
            <span className="status-chip">Model {aiHealth.model}</span>
            <span className="status-chip">Asset mode {exportOptions.assetMode}</span>
          </div>
        </div>

        <div className="hero-card__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={togglePreview}
          >
            {showPreview ? 'Nascondi preview' : 'Apri preview'}
          </button>
          <button className="button button--ghost" type="button" onClick={handleResetAll}>
            Ripristina master
          </button>
          <button
            className="button button--primary"
            disabled={exportState.kind === 'working'}
            type="button"
            onClick={handleExport}
          >
            {exportState.kind === 'working' ? 'Esporto...' : 'Esporta HTML'}
          </button>
          {installPromptEvent ? (
            <button className="button" type="button" onClick={handleInstallApp}>
              Installa PWA
            </button>
          ) : null}
        </div>
      </header>

      <main className="workspace">
        <aside className="editor-column">
          <DiscoveryChatPanel
            composerValue={discoveryComposer}
            configured={aiHealth.configured}
            feedbackMessage={discoveryState.message}
            messages={discoveryMessages}
            missingInputs={discoveryMissingInputs}
            model={aiHealth.model}
            projectCopyProfileConfigured={aiHealth.projectCopyProfileConfigured}
            status={resolvedDiscoveryStatus}
            onComposerChange={setDiscoveryComposer}
            onGenerate={handleGenerateCopy}
            onSend={handleDiscoverySend}
          />

          <AIGenerationPanel
            configured={aiHealth.configured}
            form={aiForm}
            message={aiState.message}
            missingInputs={discoveryMissingInputs.map((item) =>
              item === 'offerta'
                ? 'offerta'
                : item === 'buyer_personas'
                  ? 'buyer personas'
                  : 'obiezioni',
            )}
            model={aiHealth.model}
            projectCopyProfileConfigured={aiHealth.projectCopyProfileConfigured}
            readyToGenerate={readyToGenerate}
            showAdvancedEditor={showAdvancedEditor}
            status={aiState.kind}
            onChange={updateAIField}
            onGenerate={handleGenerateCopy}
            onToggleAdvancedEditor={() => setShowAdvancedEditor((current) => !current)}
          />

          <section className="panel-card">
            <div className="panel-card__header">
              <div>
                <h2>Logo e immagini</h2>
                <p>
                  Questi restano manuali: caricali qui e il motore li mappa
                  automaticamente negli slot della master.
                </p>
              </div>
            </div>

            <ProjectForm
              onListChange={updateListField}
              onResetField={resetField}
              onScalarChange={updateScalarField}
              projectData={projectData}
              schema={assetSchema}
            />
          </section>

          <section className="panel-card">
            <div className="panel-card__header">
              <div>
                <h2>Materiale seed</h2>
                <p>
                  La master attuale e gia collegata ai file che mi hai mandato.
                  Questa checklist riassume il flusso corretto.
                </p>
              </div>
            </div>
            <ul className="checklist">
              {materialsChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="panel-card">
            <div className="panel-card__header">
              <div>
                <h2>Export settings</h2>
                <p>
                  Configura il file finale che incollerai o importerai in
                  WordPress.
                </p>
              </div>
            </div>

            <div className="settings-grid">
              <label className="field">
                <span className="field__label">Nome file</span>
                <input
                  className="control"
                  type="text"
                  value={exportOptions.fileName}
                  onChange={(event) =>
                    updateExportSettings((current) => ({
                      ...current,
                      fileName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span className="field__label">Strategia asset</span>
                <select
                  className="control"
                  value={exportOptions.assetMode}
                  onChange={(event) =>
                    updateExportSettings((current) => ({
                      ...current,
                      assetMode: event.target.value as 'inline' | 'url',
                    }))
                  }
                >
                  <option value="inline">Inline quando possibile</option>
                  <option value="url">Mantieni URL esterni</option>
                </select>
              </label>

              <label className="field field--toggle" htmlFor="interactive-script">
                <span className="field__meta">
                  <span className="field__label">Micro-interazioni opzionali</span>
                  <span className="field__help">
                    Include script minimi. CTA e contenuti restano comunque leggibili
                    anche senza JavaScript.
                  </span>
                </span>
                <span className="toggle">
                  <input
                    checked={exportOptions.includeInteractiveScript}
                    id="interactive-script"
                    type="checkbox"
                    onChange={(event) =>
                      updateExportSettings((current) => ({
                        ...current,
                        includeInteractiveScript: event.target.checked,
                      }))
                    }
                  />
                  <span className="toggle__track" aria-hidden="true" />
                </span>
              </label>
            </div>

            <div
              className={`message-card message-card--${
                exportState.kind === 'error'
                  ? 'error'
                  : exportState.kind === 'done'
                    ? 'success'
                    : 'neutral'
              }`}
            >
              <strong>{exportState.message}</strong>
              {exportState.warnings.length > 0 ? (
                <ul className="warnings-list">
                  {exportState.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          {showAdvancedEditor ? (
            <section className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h2>Editor avanzato</h2>
                  <p>
                    Qui puoi correggere manualmente i campi generati da GPT se vuoi
                    fare fine-tuning prima dell export.
                  </p>
                </div>
              </div>

              <ProjectForm
                onListChange={updateListField}
                onResetField={resetField}
                onScalarChange={updateScalarField}
                projectData={projectData}
                schema={templateSchema}
              />
            </section>
          ) : null}
        </aside>

      </main>

      {showPreview ? (
        <div
          className="preview-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          onClick={closePreview}
        >
          <div className="preview-modal__backdrop" />
          <section
            className="panel-card preview-modal__dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-card__header">
              <div>
                <h2 id="preview-modal-title">Preview fedele all export</h2>
                <p>
                  Questa iframe usa lo stesso motore dell HTML finale, quindi il
                  clone che vedi qui e quello che esporterai.
                </p>
              </div>
              <div className="preview-card__actions">
                <span className="preview-meta">{projectData.projectName}</span>
                <span className="preview-meta">
                  {previewLoadState === 'loading'
                    ? 'Sto caricando...'
                    : previewLoadState === 'ready'
                      ? 'Preview pronta'
                      : 'Preview idle'}
                </span>
                <button
                  className="mini-button mini-button--ghost"
                  type="button"
                  onClick={reloadPreview}
                >
                  {previewLoadState === 'loading' ? 'Ricarico...' : 'Ricarica preview'}
                </button>
                <button
                  className="mini-button mini-button--ghost"
                  type="button"
                  onClick={closePreview}
                >
                  Chiudi preview
                </button>
              </div>
            </div>

            <div className="preview-frame preview-frame--modal">
              <div
                ref={previewViewportRef}
                className="preview-frame__viewport preview-frame__viewport--modal"
                style={
                  {
                    '--preview-scale': String(previewScale),
                  } as React.CSSProperties
                }
              >
                <iframe
                  key={previewUrl || `preview-${previewReloadToken}`}
                  className="preview-frame__iframe"
                  src={previewUrl || 'about:blank'}
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview landing export"
                  onLoad={() => setPreviewLoadState('ready')}
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default App
