# Landing Master Generator

App locale `React + Vite + TypeScript + Node` che prende una landing master reale e genera un solo file `HTML` pronto per WordPress.

In questa build la master attiva e:

- landing Shopify Domelio
- URL live: `https://f0un1h-hy.myshopify.com/products/tazza-auto-mescolante-veloce-professionale`
- sorgente importata da ZIP + screenshot desktop/mobile

## Cosa fa adesso

- usa la landing Domelio reale come base
- ha un flusso `AI-first`: tu compili il brief prodotto, GPT genera il copy della landing
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
OPENAI_MODEL=gpt-5.2
PORT=8787
```

Se manca `OPENAI_API_KEY`, la preview funziona ma il bottone AI non genera il copy.

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
3. Carica logo e immagini nelle sezioni manuali.
4. Clicca `Genera copy automatico`.
5. Se vuoi, fai correzioni da `Editor avanzato`.
6. Esporta l'HTML unico.

## Materiale per aggiungere una nuova master

- URL live
- screenshot desktop full page
- screenshot mobile full page
- `Ctrl+S -> Pagina Web, completa` oppure export `SingleFile`
- lista dei blocchi che devono restare editabili

## File chiave

- `server/index.mjs`: endpoint OpenAI e serving produzione
- `src/lib/ai.ts`: chiamate frontend verso API locale
- `src/schema.ts`: default data, asset schema e schema editor
- `src/lib/exporter.ts`: motore master -> clone -> HTML singolo
- `public/masters/domelio/`: master HTML e asset salvati
- `start-local.bat`: avvio rapido locale
