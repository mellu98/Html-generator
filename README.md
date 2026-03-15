# Landing Master Generator

App locale `React + Vite + TypeScript + Node` che prende una landing master reale e genera un solo file `HTML` pronto per WordPress.

La build pubblica mostra una UI neutra all'apertura: la master reale resta interna al motore e non viene esposta come copy o media di default.

## Cosa fa adesso

- usa una landing master reale come base strutturale
- ha un flusso `AI-first`: prima fai un intervista guidata in stile `Signora Market Copy`, poi GPT genera il copy della landing
- integra anche un chatbot immagini in stile `Ecommerce Visual Art Director`
- il logo resta manuale, ma le immagini le puoi generare e assegnare agli slot `hero`, `benefit detail` e `proof`
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
OPENAI_IMAGE_MODEL=gpt-5.4
PORT=8787
```

Se manca `OPENAI_API_KEY`, la preview funziona ma i bot AI non generano copy o immagini.

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

## Profilo immagini personalizzato

Il progetto ora supporta anche un cervello visual fisso di progetto:

- file: `prompts/custom-image-director.md`
- uso: viene caricato automaticamente dal server per il chatbot immagini
- flusso: prima carichi un immagine prodotto e scegli una categoria, poi generi il visual finale 1:1

Categorie supportate:

- `How To/Process`
- `Infographic`
- `Ingredients`
- `Lifestyle`
- `Product Photo`
- `Social Proof`

Le immagini generate possono essere assegnate direttamente a:

- hero
- benefit detail
- proof

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
4. Se vuoi, usa `AI Immagini`: carica il prodotto, scegli la categoria e genera i visual.
5. Assegna le immagini a `hero`, `benefit detail` o `proof`.
6. Carica o correggi manualmente logo e slot media se serve.
7. Clicca `Genera copy automatico`.
8. Se vuoi, fai correzioni da `Editor avanzato`.
9. Esporta l'HTML unico.

## Materiale per aggiungere una nuova master

- URL live
- screenshot desktop full page
- screenshot mobile full page
- `Ctrl+S -> Pagina Web, completa` oppure export `SingleFile`
- lista dei blocchi che devono restare editabili

## File chiave

- `server/index.mjs`: endpoint OpenAI e serving produzione
- `prompts/custom-copywriter.md`: profilo copy principale del progetto
- `prompts/custom-image-director.md`: profilo visual principale del progetto
- `src/components/DiscoveryChatPanel.tsx`: intervista guidata prima della generazione
- `src/components/ImageGenerationPanel.tsx`: chatbot immagini e assegnazione agli slot media
- `src/lib/ai.ts`: chiamate frontend verso API locale
- `src/lib/image-chat.ts`: categorie, normalizzazione immagini e assegnazione hero/benefit/proof
- `src/lib/discovery.ts`: logica e regole di readiness della discovery
- `src/schema.ts`: default data, asset schema e schema editor
- `src/lib/exporter.ts`: motore master -> clone -> HTML singolo
- `public/masters/domelio/`: master HTML e asset salvati
- `start-local.bat`: avvio rapido locale
