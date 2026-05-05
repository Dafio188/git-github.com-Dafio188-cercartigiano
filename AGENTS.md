# CercArtigiano - Brand Guidelines

## Logo Ufficiale
- Il logo ufficiale dell'applicazione deve essere memorizzato in `/public/logo.png`.
- Il design è composto da un'icona (3D tools in esagono blu) e un logotype bicolore.
- **Logotype:** "Cerc" (Nero/Dark Blue `#1D1D1F`) e "Artigiano" (Blu Brand `oklch(0.45 0.18 255)`).
- **Slogan:** "Tutto nel palmo della Tua mano".

## Stile e Palette
- **Primario (Blu Brand):** `oklch(0.45 0.18 255)`
- **Accento (Arancione Brand):** `oklch(0.75 0.19 45)`
- **Testo Dark:** `#1D1D1F` (Apple Dark)
- **Tipografia:** Inter / Geist Variable (Stile Apple/Premium).

## Utilizzo
- Il logo deve essere utilizzato in tutte le testate, nella barra laterale e nelle comunicazioni ufficiali.
- Se il file grafico non è presente, il sistema utilizzerà un fallback grafico (sfondo blu brand con lettera 'C' bianca).

## Gestione Immagini e Asset
- **Cartella Pubblica:** Le immagini come `logo.png` e `Foto_homepage.png` devono essere salvate fisicamente nella directory `/public`.
- **Riferimenti nel Codice:** Non importare le immagini da cartelle assets con import (es. evitare `import logoUrl from`). Usa rigorosamente riferimenti root assoluti (es. `src="/logo.png"` e `src="/Foto_homepage.png"`) all'interno dei tag `<img>` nei componenti React. Ciò garantisce che le immagini nella cartella public siano risolte correttamente durante l'hosting su Firebase (permettendo uniformità tra preview e produzione).

## Deployment (Distribuzione Online tramite GitHub Actions)
- Il progetto web finale è ospitato su **Firebase Hosting** e risponde al dominio cercartigiano.com.
- **Flusso Universale di Aggiornamento (CI/CD):**
  1. Le modifiche al codice vengono fatte nell'ambiente di sviluppo (come Google AI Studio locale).
  2. L'utente esporta/sincronizza queste modifiche (codice sorgente) nel repository **GitHub** del progetto.
  3. Su GitHub è attiva una **GitHub Action** (automazione) che viene "risvegliata" ad ogni nuovo push di codice.
  4. La Action di GitHub si occupa automaticamente di effettuare i seguenti passaggi sui server remoti:
     - Installare le dipendenze (`npm install`).
     - Eseguire la build frontend (`npm run build`), generando i file statici in `dist`.
     - Effettuare il deploy su Firebase Hosting per aggiornare il sito live su cercartigiano.com.
- **Regola:** Non caricare mai le build o eseguire `firebase deploy` a mano. Usa sempre l'esportazione verso GitHub in modo che la pipeline automatica gestisca l'aggiornamento online, garantendo allineamento e stabilità.
