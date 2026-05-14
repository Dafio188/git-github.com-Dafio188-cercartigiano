# CercArtigiano - Linee Guida Multilingua (i18n)

Questo documento spiega l'architettura, le regole e il piano di azione (TODO list) per l'implementazione del supporto multilingua (Italiano, Inglese, Francese, Spagnolo, Tedesco) in CercArtigiano.

## Obiettivo e Ambito (Scope)
Il sistema multilingua è pensato in maniera asimmetrica:
- **Clienti (es. Turisti, Stranieri in affitto):** L'interfaccia a loro dedicata (Landing Page, flow di registrazione, Client Dashboard, Categorie) sarà completamente tradotta.
- **Artigiani e Amministratori:** Le loro dashboard, i profili degli artigiani e l'onboarding rimarranno prevalentemente in **Italiano**, in quanto l'operatività lato fornitore avviene in Italia per una base operativa italiana. Le descrizioni degli artigiani inserite manualmente non saranno tradotte automaticamente. La chat permetterà comunicazione organica.

## Stack Tecnologico
- `i18next`: Il framework core per l'internazionalizzazione.
- `react-i18next`: I binding React per l'uso semplificato con gli hooks (`useTranslation`).
- `i18next-browser-languagedetector`: Rilevamento automatico della lingua del browser per impostare la lingua iniziale.

## Architettura dei Traduttori
I dizionari sono salvati in formato JSON all'interno di `src/i18n/locales/`. 
Avremo un namespace separato per `common` (bottoni, form) e `landing` (testi della homepage) o un file unico organizzato. 

## TODO List - Piano di Azione

- [x] **Fase 0:** Creazione di questo file di documentazione e linee guida.
- [ ] **Fase 1: Setup e Installazione**
  - Installare i pacchetti `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
  - Creare la struttura cartelle `src/i18n`.
- [ ] **Fase 2: Creazione Dizionari (File JSON)**
  - `it.json` (Italiano - Default)
  - `en.json` (Inglese)
  - `es.json` (Spagnolo)
  - `fr.json` (Francese)
  - `de.json` (Tedesco)
  *Popolare inizialmente i dizionari con le chiavi per l'header, selettore lingua, ed elementi base della landing.*
- [ ] **Fase 3: Configurazione Iniziale e Selettore Lingua**
  - Creare `src/i18n/i18n.ts` per l'inizializzazione.
  - Importare l'i18n in `src/main.tsx`.
  - Creare il Componente UI `LanguageSwitcher` (con menu a tendina o popup) usando shadcn/Tailwind, completo di bandierine (es. IT, EN, ES, FR, DE).
  - Integrare il `LanguageSwitcher` in `App.tsx` (header o sidebar pubblica).
- [ ] **Fase 4: Integrazione nei Componenti (Landing e Auth)**
  - Sostituire i testi hardcoded in stringhe in `LandingPage.tsx` con l'hook `useTranslation()`.
  - Sostituire i testi in `CategoriesPage`.
  - Sostituire i testi nei form di accesso/registrazione (`AuthView.tsx`).
- [ ] **Fase 5: Integrazione Client Dashboard**
  - Sostituire i testi hardcoded nella vista cliente (dashboard e sidebar lato cliente).
  - Assicurarsi che le viste lato Artigiano e Admin e i loro form restino configurati.

## Istruzioni per Aggiungere Nuove Chiavi
1. Aprire tutti i JSON in `src/i18n/locales/`.
2. Aggiungere la nuova chiave di traduzione, es: `"welcome_message": "Benvenuto in CercArtigiano"` nel file `it.json`.
3. Applicare la traduzione equivalente negli altri file JSON.
4. Nel componente usare:
   ```tsx
   import { useTranslation } from 'react-i18next';
   
   export function MioComponente() {
     const { t } = useTranslation();
     return <h1>{t('welcome_message')}</h1>;
   }
   ```
