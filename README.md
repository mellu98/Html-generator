# Landing Master Generator

App locale `React + Vite + TypeScript + Node` che prende una landing master reale e genera un solo file `HTML` pronto per WordPress.

La build pubblica mostra una UI neutra all'apertura: la master reale resta interna al motore e non viene esposta come copy o media di default.

## Cosa fa adesso

- usa una landing master reale come base strutturale
- ha un flusso `AI-first`: prima fai un intervista guidata in stile `Signora Market Copy`, poi GPT genera il copy della landing
- lascia manuali solo logo e immagini
- salva la bozza nel browser
- mostra una preview che usa lo stesso motore dell'export
- esporta `landing.html` come file unico con asset inline quando possibile
- espone API locali/server-side per OpenAI, quindi la chiave non resta nel browser

## Configurazione OpenAI

1. Duplica `.env.example` in `.env`
2. Inserisci la tua chiave:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4
PORT=8787
```

Se manca `OPENAI_API_KEY`, la preview funziona ma il bottone AI non genera il copy.

## Profilo copy personalizzato

Il progetto ora supporta un cervello copy fisso di progetto:

- file: `prompts/custom-copywriter.md`
- uso: viene caricato automaticamente dal server ad ogni generazione
- deploy: va su GitHub e su Render insieme al resto del progetto

In pratica:

- dentro `prompts/custom-copywriter.md` metti le istruzioni del tuo GPT personalizzato
- nel form puoi anche aggiungere un override per singolo prodotto con `Prompt master GPT`
- nel campo `Esempi stile GPT` puoi incollare headline, CTA o sezioni che vuoi far imitare
- la chat guidata usa lo stesso profilo copy per fare discovery prima della generazione finale

Nota importante:

- ora il progetto ha anche una `mini chat guidata` che replica la fase di discovery del tuo vecchio GPT
- la generazione finale si sblocca solo quando sono stati raccolti i 3 blocchi chiave: offerta, buyer personas, obiezioni

## Avvio locale

Opzione veloce:

- doppio clic su `start-local.bat`

Opzione terminale:

```bash
npm install
npm run dev
```

Il client gira su:

- `http://127.0.0.1:4173`

L'API locale gira su:

- `http://127.0.0.1:8787`

## Build e verifiche

```bash
npm run build
npm run test
npm run lint
```

## Avvio produzione / Render

```bash
npm install
npm run build
npm run start
```

Su Render imposta almeno:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Deploy rapido su Render

Il repo ora include [render.yaml](C:/Users/franc/Desktop/landing%20page%20generator/render.yaml), quindi puoi fare deploy come Blueprint:

1. fai push del progetto su GitHub
2. su Render scegli `New +` -> `Blueprint`
3. collega il repo
4. Render leggerà `render.yaml`
5. imposta solo `OPENAI_API_KEY`
6. avvia il deploy

Health check usato:

- `/healthz`

La Web Service serve sia:

- frontend React buildato
- API server-side OpenAI

## Come usarlo

1. Apri l'app.
2. Compila il brief prodotto nella sezione AI.
3. Rispondi alla chat guidata finche il brief risulta pronto.
4. Carica logo e immagini nelle sezioni manuali.
5. Clicca `Genera copy automatico`.
6. Se vuoi, fai correzioni da `Editor avanzato`.
7. Esporta l'HTML unico.

## Materiale per aggiungere una nuova master

- URL live
- screenshot desktop full page
- screenshot mobile full page
- `Ctrl+S -> Pagina Web, completa` oppure export `SingleFile`
- lista dei blocchi che devono restare editabili

## File chiave

- `server/index.mjs`: endpoint OpenAI e serving produzione
- `prompts/custom-copywriter.md`: profilo copy principale del progetto
- `src/components/DiscoveryChatPanel.tsx`: intervista guidata prima della generazione
- `src/lib/ai.ts`: chiamate frontend verso API locale
- `src/lib/discovery.ts`: logica e regole di readiness della discovery
- `src/schema.ts`: default data, asset schema e schema editor
- `src/lib/exporter.ts`: motore master -> clone -> HTML singolo
- `public/masters/domelio/`: master HTML e asset salvati
- `start-local.bat`: avvio rapido locale
