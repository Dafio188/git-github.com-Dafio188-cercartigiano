# CERCARTIGIANO - MOBILE MIGRATION GUIDE

Questa guida contiene l'intera architettura logica e funzionale di CercArtigiano per permettere ad Antigravity (AI) di costruire l'applicazione mobile identica alla versione Web in ambiente Expo Go (React Native).

---

## 1. BRAND IDENTITY & DESIGN SYSTEM (Apple/Premium Style)

- **Nome Progetto:** CercArtigiano
- **Slogan:** "Tutto nel palmo della Tua mano"
- **Colori Brand:**
  - **Primario (Blu Brand):** `oklch(0.45 0.18 255)` (Blue vibrant)
  - **Accento (Arancio):** `oklch(0.75 0.19 45)`
  - **Sfondi:** `#F5F5F7` (Grigio chiaro Apple), `#FFFFFF` (Bianco puro)
  - **Dark Text:** `#1D1D1F` (Nero Apple sfumato)
- **Tipografia:** San Francisco (iOS default) o Inter. Peso font: Black per i titoli, Bold/Medium per il corpo.
- **Raggi:** 24px (Border Radius abbondante), 32px per contenitori principali.

---

## 2. FIREBASE ARCHITECTURE (Unified Backend)

L'app mobile DEVE connettersi allo stesso database Firestore.

### Struttura Collezioni:
1. **`users`**: `{ id, nome, email, role: "client" | "worker" | "admin", status, tokens, onboardingComplete }`
2. **`workerProfiles`**: `{ userId, bio, categories[], skills[], hourlyRate, radiusKm, badges[], verifiedFlags: { id, phone, insurance } }`
3. **`jobs`**: `{ id, clientId, title, category, description, status, location: { lat, lng, address }, photos[], tokenCost, expiresAt, createdAt }`
4. **`proposals`**: `{ id, jobId, workerId, workerName, price, message, status: "pending" | "accepted" | "rejected" }`
5. **`notifications`**: `{ userId, title, message, type, read, createdAt }`

---

## 3. CORE LOGIC: CLIENT FLOW (Richiesta Servizio)

Il cliente inserisce una richiesta tramite un sistema a risposte guidate (Guided Job Modal).

### Logica di Branching (Esempio Elettronica):
1. **Domanda 1 (Scelta):** Elettricista? -> Opzioni: [Rifacimento, Riparazione, Fotovoltaico, ...]
2. **Domanda 2 (Condizionale):** 
   - Se *Rifacimento* -> Chiedi "Dimensione Immobile"
   - Se *Riparazione* -> Chiedi "Specifiche del guasto"
3. **Domanda 3 (Text):** Descrizione libera.
4. **Domanda 4 (Address):** Località dell'intervento.
5. **Domanda 5 (Auth/Contact):** Login o Registrazione per completare.

**JSON Schema per il Mobile (Logic Engine):**
```json
{
  "electrical": [
    { "id": "service", "type": "choice", "question": "Che tipo di servizio?", "options": [
        { "id": "renovation", "label": "Rifacimento", "nextStepId": "size" },
        { "id": "repair", "label": "Riparazione", "nextStepId": "problem" }
    ]},
    { "id": "size", "type": "choice", "question": "Grandezza casa?", "options": [...] },
    { "id": "address", "type": "address", "question": "Dove serve l'intervento?" }
  ]
}
```

---

## 4. CORE LOGIC: ARTISAN FLOW (Registrazione & Dashboard)

### Onboarding Artigiano:
1. **Step 1: Categorie.** Seleziona i settori (Elettrica, Idraulica, Edile, ecc.).
2. **Step 2: Skill Avanzate.** Solo dopo aver scelto le categorie, abilita le skill specifiche (es. se Elettrica -> abilita "Fotovoltaico", "Allarme", ecc.).
3. **Step 3: Business Details.** Tariffa oraria, raggio d'azione (Km), Partita IVA.
4. **Step 4: Verifica.** Upload documenti (Simulato o Reale).

---

## 5. DASHBOARDS LOGIC

### Dashboard Cliente:
- **Tab Home:** Riepilogo notifiche, suggerimenti artigiani.
- **Tab Richieste:** Lista "I miei Job" con stato (Open, Assigned, Completed).
- **Esplora:** Ricerca artigiani sulla mappa o per categoria.

### Dashboard Artigiano:
- **Tab Home:** Crediti (Token) residui, statistiche profilo.
- **Feed Lavori:** Lista dei lavori aperti filtrati per le SUE categorie e nel SUO raggio d'azione.
- **Le mie Proposte:** Lavori per cui ha già inviato un preventivo.

---

## 6. FIREBASE CONNECTION IN EXPO GO

Per risolvere l'errore di connessione in Expo Go:

1. **Installazione:** `npm install firebase@latest`
2. **Configurazione (`firebaseConfig.js`):**
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "IL_TUO_API_KEY",
  authDomain: "cercartigiano-xxx.firebaseapp.com",
  projectId: "cercartigiano-xxx",
  // ... resto del config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```
**NOTA:** Per Expo Go l'AI deve configurare Firebase usando il modulo "JS SDK" standard e NON `@react-native-firebase/app` (che richiede link nativi non supportati in Expo Go standard).

---

## 7. NAVIGATION SCHEME (Mobile Tabs)

1. **Home:** Hub centrale (Client: Messaggi Rapidi, Worker: Stato Crediti).
2. **Search / Jobs:** (Client: Ricerca Artigiani, Worker: Feed dei lavori).
3. **Chat:** Centro messaggi.
4. **Profile:** Impostazioni e Bio.

---

---

## 8. PROFESSIONS & SKILLS MAPPING (Exhaustive & Detailed)

Antigravity deve implementare la logica di filtraggio delle skill basata sulla categoria selezionata. Ogni settore ha la sua lista di competenze specifiche per permettere all'artigiano di profilarsi correttamente e al cliente di trovare il tecnico giusto.

```typescript
export const CATEGORY_SERVICES = {
  electrical: [
    "Condizionatori e Climatizzatori", "Cancello Automatico", "Ventilatore da Soffitto",
    "Installazione Telecamere", "Sostituzione Citofono", "Antennista Elettricista",
    "Pronto Intervento Elettricista", "Dichiarazione di Rispondenza", "Dichiarazione di Conformità",
    "Installazione Lampadari", "Installazione Colonnine Elettriche", "Automazione Industriale",
    "Fotovoltaico", "Manutenzione Elettrica", "Allarme Casa", "Illuminotecnica",
    "Installazione Wallbox", "Riparazioni Domestiche", "Elettrotecnico", "Domotica (Smart Home)"
  ],
  plumbing: [
    "Riparazione Perdite", "Installazione Caldaia", "Rifacimento Bagno",
    "Sostituzione Rubinetteria", "Disotturazione Scarichi", "Installazione Condizionatori",
    "Pronto Intervento Idraulico", "Sostituzione Sanitari", "Impianto Irrigazione",
    "Trattamento Acque/Addolcitori", "Riparazione Autoclave", "Installazione Scaldabagno"
  ],
  cleaning: [
    "Pulizia Ordinaria", "Pulizia Profonda (Post Ristrutturazione)", "Lavaggio Divani e Tappeti",
    "Pulizia Vetrate Professionali", "Stiratura a Domicilio", "Pulizia Uffici e Negozi",
    "Sanificazione e Igienizzazione", "Trattamento Pavimenti (Marmo/Parquet)",
    "Pulizia B&B e Affitti Brevi", "Sgombero e Pulizia Cantine"
  ],
  construction: [
    "Cartongesso e Controsoffitti", "Posa Pavimenti e Rivestimenti", "Muratura e Intonaco",
    "Tinteggiatura e Pittura", "Ristrutturazione Chiavi in Mano", "Isolamento Termico (Cappotto)",
    "Posa Parquet", "Rifacimento Tetto", "Impermeabilizzazione Terrazzi", "Opere in Cemento Armato"
  ],
  painting: [
    "Pittura Interni", "Pittura Esterni", "Trattamento Antimuffa e Umidità",
    "Rimozione Carta da Parati", "Verniciatura Infissi e Persiane", "Spatolato Venisiano",
    "Decorazioni Pareti", "Pittura Termoisolante"
  ],
  gardening: [
    "Taglio Prato e Bordure", "Potatura Alberi e Siepi", "Installazione Impianto Irrigazione",
    "Progettazione e Realizzazione Giardini", "Manutenzione Periodica Prato",
    "Abbattimento Alberi Alto Fusto", "Trattamenti Fitosanitari", "Creazione Aiuole e Camminamenti"
  ],
  handyman: [
    "Montaggio Mobili (IKEA/Mondo Convenienza)", "Appensione Quadri/Specchi/Mensole",
    "Riparazione Tapparelle e Persiane", "Sostituzione Serrature", "Piccole Riparazioni Elettriche/Idrauliche",
    "Sostituzione Corde Tapparelle", "Regolazione Cerniere Porte e Ante", "Siliconatura Vasche/Docce"
  ],
  moving: [
    "Trasloco Casa Completo", "Trasloco Ufficio", "Piccoli Traslochi (Scatole/Singoli Mobili)",
    "Smontaggio e Rimontaggio Mobili", "Imballaggio Professionale", "Noleggio Piattaforma Aerea",
    "Trasporto Oggetti Fragili/Pianoforti", "Sgombero Case e Aziende"
  ],
  mechanic: [
    "Tagliando Completo", "Sostituzione Freni e Pastiglie", "Diagnosi Elettronica",
    "Riparazione Motore e Cambio", "Cambio Gomme e Equilibratura", "Ricarica Aria Condizionata",
    "Riparazione Cristalli", "Elettrauto e Diagnosi"
  ],
  elderly_care: [
    "Compagnia e Veglia", "Aiuto Igiene Personale", "Preparazione e Somministrazione Pasti",
    "Accompagnamento Visite Mediche", "Acquisto Spesa e Commissioni", "Assistenza Notturna",
    "Aiuto nella Deambulazione", "Supporto Gestione Terapie Farmacologiche"
  ],
  babysitting: [
    "Babysitting Occasionale", "Aiuto Compiti", "Accompagnamento Attività Extra",
    "Animazione Feste", "Puericultrice (Neonati)", "Presa a Scuola/Asilo"
  ],
  pet_sitting: [
    "Dog Walking (Passeggiate)", "Pensione per Cani a Domicilio", "Pensione per Gatti",
    "Toelettatura", "Addestramento Base", "Somministrazione Farmaci Animali"
  ],
  beauty: [
    "Taglio e Piega", "Colore e Schiariture", "Manicure e Pedicure (Smalto Semipermanente)",
    "Trattamenti Viso e Corpo", "Trucco Sposa/Eventi", "Massaggi Rilassanti",
    "Epilazione (Cera/Laser)", "Laminazione Ciglia/Sopracciglia"
  ],
  carpentry: [
    "Riparazione Mobili in Legno", "Creazione Arredi su Misura", "Restauro Antichità",
    "Posa Battiscopa e Parquet", "Riparazione Porte e Infissi", "Costruzione Strutture Esterno (Gazebo)"
  ],
  psychology: [
    "Consulenza Individuale", "Terapia di Coppia", "Sostegno Genitoriale",
    "Psicoterapia Infantile", "Gestione Ansia e Stress", "Coaching e Motivazione"
  ],
  lawyer: [
    "Diritto Civile", "Diritto Penale", "Diritto del Lavoro",
    "Pratiche di Divorzio/Famiglia", "Infortunistica Stradale", "Recupero Crediti"
  ],
  architect: [
    "Progettazione Architettonica", "Interior Design", "Pratiche Edilizie (CILA/SCIA)",
    "Direzione Lavori", "Rilievi e Planimetrie", "Consulenza Arredamento"
  ],
  accountant: [
    "Dichiarazione dei Redditi (730/Unico)", "Apertura Partita IVA", "Contabilità Aziendale",
    "Consulenza Fiscale", "Pianificazione Successoria", "Gestione Buste Paga"
  ],
  physiotherapy: [
    "Riabilitazione Motoria", "Massoterapia", "Terapia Posturale",
    "Fisioterapia Sportiva", "Linfodrenaggio", "Osteopatia"
  ]
};
```

---

## 9. CLIENT GUIDED FLOWS (The "Detailed Wizard" Engine)

Per ogni categoria, l'app Mobile deve presentare un percorso a tappe (progress bar in alto) per raccogliere le informazioni necessarie ad un preventivo serio. Se l'AI riduce i passaggi, l'artigiano non avrà dati a sufficienza.

### ⚡ ELETTRICISTA (`electrical`)
1. **Tipo Intervento:** Scelta tra [Pronto Intervento, Manutenzione, Installazione Nuovo, Certificazione].
2. **Ambito:** [Appartamento, Villa, Condominio, Negozio, Ufficio].
3. **Specifiche:** [Interruttori, Prese, Quadro Elettrico, Illuminazione, Citofono, Altro].
4. **Urgenza:** [Il prima possibile, Entro la settimana, Pianificato].
5. **Dettagli:** Foto del quadro o del problema + Descrizione libera.
6. **Posizione:** Indirizzo rilevato.

### 💧 IDRAULICO (`plumbing`)
1. **Problematica:** [Perdita d'acqua, Scarico ostruito, Caldaia/Clima, Sanitari, Rifacimento].
2. **Locazione:** [Bagno, Cucina, Esterno, Cantina/Box].
3. **Impianto:** [Gas, Acqua, Riscaldamento, Aria Condizionata].
4. **Accessibilità:** [Lavoro a vista, Richiede rottura muri, Non so].
5. **Note:** Marca caldaia/sanitari + Foto del danno.

### 🏗️ EDILIZIA & RISTRUTTURAZIONE (`construction`)
1. **Tipologia:** [Pavimentazione, Cartongesso, Muratura, Ristrutturazione Completa].
2. **Stato Immobile:** [In uso, Vuoto, In costruzione].
3. **Dimensioni:** [Mq esatti o range 0-50, 50-100, 100+].
4. **Materiali:** [Forniti da me, Forniti dal professionista, Da decidere].
5. **Piano:** [Terra, Con ascensore, Senza ascensore].
6. **Note:** Carica planimetria o foto stato attuale.

### ✨ PULIZIA CASA (`cleaning`)
1. **Servizio:** [Ordinaria, Profonda (Primavera), Post Ristrutturazione, B&B].
2. **Ambienti:** [Numero stanze + Numero bagni].
3. **Dimensioni:** [Mq totali].
4. **Extra:** [Stiratura, Pulizia Vetri, Pulizia Interno Forno/Frigo, Lavaggio Tappeti].
5. **Frequenza:** [Singola volta, Settimanale, Quindicinale].
6. **Detergenti:** [Portati dal pro, Presenti in casa].

### 🌳 GIARDINAGGIO (`gardening`)
1. **Lavorazione:** [Sfalcio Erba, Potatura, Irrigazione, Diserbo, Progettazione].
2. **Dimensioni Verde:** [Mq giardino/terrazzo].
3. **Dotazione:** [Acqua presente, Elettricità presente, Smaltimento rifiuti verdi richiesto].
4. **Alberi:** [Altezza siepi, Numero alberi alto fusto].
5. **Pianificazione:** [Manutenzione ricorrente, Intervento una tantum].

### 📦 TRASLOCHI (`moving`)
1. **Origine:** Indirizzo + Piano + Ascensore (Si/No).
2. **Destinazione:** Indirizzo + Piano + Ascensore (Si/No).
3. **Volume:** [Bilocale, Quadrilocale, Solo alcuni mobili, Solo scatole].
4. **Mobili Speciali:** [Armadi > 4 ante, Divani letto, Tavoli vetro, Specchi grandi].
5. **Servizi Extra:** [Smontaggio/Montaggio, Imballaggio piatti/fragili, Noleggio scala].

### 🧰 TUTTOFARE (`handyman`)
1. **Attività:** [Montaggio Mobili, Appensione Quadri, Riparazione Infissi, Serrature, Altro].
2. **Quantità:** [Numero pezzi da montare/riparare].
3. **Dettagli:** [Necessaria scala, Necessaria trapano/tasselli specifici].
4. **Durata Stimata:** [Meno di un'ora, Mezza giornata, Giornata intera].

### 👵 ASSISTENZA & BABY SITTER (`elderly_care`, `babysitting`)
1. **Paziente/Bambino:** [Età, Numero di persone da assistere].
2. **Autonomia:** [Autonomo, Allettato, Ha bisogno di stimoli/compiti].
3. **Orario:** [Diurno, Notturno, Convivenza, Solo weekend].
4. **Mansioni:** [Cucinare, Pulizia casa, Accompagnamento, Somministrazione medicinali].

---

**LOGICA DI SALVATAGGIO (Backend Sync):**
Ogni risposta deve essere salvata nella mappa `meta` del documento `Job`:
`meta: { "step_1": "Rifacimento", "step_2": "Villa", "mq": 120, "has_photos": true }`.
L'artigiano vedrà questi dati formattati come una lista di "Caratteristiche Richiesta".

### ⚖️ SERVIZI PROFESSIONALI (`lawyer`, `accountant`, `architect`)
1. **Tipo Pratica:** [Consulenza, Gestione Ricorrente, Causa Legale, Progetto].
2. **Settore:** [Privato, Azienda, Condominio].
3. **Modalità:** [In Studio, Videochiamata, A Domicilio].
4. **Documentazione:** [Carica file PDF/JPG per analisi preliminare].

### 🚗 MECCANICO (`mechanic`)
1. **Veicolo:** [Marca, Modello, Anno, Targa].
2. **Sintomi:** [Rumori sospetti, Spia accesa, Perdita liquidi, Calo performance].
3. **Intervento:** [Tagliando, Freni, Cinghia Distribuzione, Clima, Altro].
4. **Ritiro:** [Porto io in officina, Presa e riconsegna a domicilio].

### 🧠 PSICOLOGO & SALUTE (`psychology`, `physiotherapy`, `beauty`)
1. **Esigenza:** [Primo colloquio, Terapia continua, Emergenza].
2. **Paziente:** [Individuale, Coppia, Minore].
3. **Sintomi/Obiettivi:** [Stress, Ansia, Riabilitazione, Estetica specifica].
4. **Preferenza:** [Uomo, Donna, Indifferente].

---

## 10. POST-REQUEST LOGIC & JOB LIFECYCLE (Mobile UX)

Dopo l'invio della richiesta, inizia il ciclo di vita del lavoro. Antigravity deve gestire i seguenti stati nel documento `Job`:

### 🔄 Stati del Job
- `open`: Visibile a tutti gli artigiani della categoria.
- `in_progress`: Assegnato ad un professionista specifico (Contratto privato in corso).
- `completed`: Lavoro terminato, pronto per la recensione.
- `expired`: Dopo 30 giorni senza assegnazione.

### 💰 Economia dei Token (Worker Side)
L'artigiano paga per competere. Non ci sono commissioni sul lavoro finale.
1. **Acquisto Token:** Tramite `BuyCreditsModal`. Pacchetti:
   - 20 Token: €49.99
   - 50 Token: €99.99
   - 120 Token: €199.99
2. **Consumo:** L'invio di un preventivo (`JobProposal`) sottrae **1 Token** (di default) dal saldo dell'utente.
3. **Limiti:** Ogni Job accetta un massimo di **5 Proposte**. Raggiunto il limite, il Job scompare dalla bacheca "Trova Lavoro".

### 💬 Sistema di Chat (Real-time)
La chat è il cuore della negoziazione. Firestore Collection: `messages`.
1. **Chat Condivisa (Status: `open`):**
   - Tutti gli artigiani che hanno inviato una proposta possono scrivere al cliente.
   - Il cliente vede tutti i messaggi raggruppati per professionista.
   - Gli artigiani NON vedono i messaggi dei concorrenti.
2. **Chat Esclusiva (Status: `in_progress`):**
   - Una volta che il cliente clicca "Accetta Preventivo", la chat diventa un canale privato 1-a-1 tra Cliente e Artigiano assegnato.
   - Gli altri 4 artigiani perdono l'accesso alla chat (Chat Lock).
3. **Notifiche:** Ogni messaggio deve aggiornare `unreadMessagesCount[targetId]` nel documento `Job` e inviare una notifica push (o alert UI).

### 🤝 Assegnazione e Chiusura
- **Accettazione:** Il cliente sceglie l'artigiano dalla dashboard. Il sistema imposta `assignedWorkerId` e sblocca il contatto.
- **Pagamento:** Ricordare all'utente che il pagamento **NON avviene in app**. Avviene tra le parti secondo gli accordi presi in chat.
- **Completamento:** L'artigiano segna il lavoro come "Terminato" per sbloccare la possibilità al cliente di lasciare una recensione (Rating 1-5 stelle + commento).

---

## 11. FIRESTORE SYNC (Data Structure for Mobile)

Per garantire la compatibilità con il Web, Antigravity deve usare questa struttura:

```typescript
// Documento: jobs/{jobId}
{
  title: string,
  description: string,
  category: string,
  status: 'open' | 'in_progress' | 'completed',
  clientId: string,
  assignedWorkerId?: string,
  proposalCount: number,
  location: { address: string, lat: number, lng: number },
  meta: Record<string, any>, // Risposte del Wizard
  unreadMessagesCount: Record<string, number> // [userId]: count
}

// Documento: proposals/{proposalId}
{
  jobId: string,
  workerId: string,
  clientId: string,
  price: number,
  status: 'pending' | 'accepted' | 'rejected',
  message: string
}

// Documento: users/{userId}
{
  tokens: number, // Saldo disponibile
  role: 'client' | 'worker',
  status: 'active' | 'pending' | 'suspended'
}
```

---

**NOTA AGGIUNTIVA SULLA LOGICA DI BRANCHING:**
L'AI Antigravity deve generare un file `wizardConfig.json` che mappa ogni `category_id` ad un array di `Steps`. Ogni `Step` deve avere un `type` (choice, multi-choice, text, number, date, address, photo).

---

## 12. AUTHENTICATION & ACCESS FLOW (Role-Based)

Antigravity deve gestire un sistema di autenticazione fluido (Google Login + Email/Password) con una chiara distinzione dei ruoli:

### A. Primo Accesso (New User)
1. **Benvenuto:** Schermata splash con stile Apple (Testo grande, bianco su sfondo blu brand).
2. **Selezione Ruolo:** "Cosa cerchi oggi?"
   - [ ] **Sono un Cliente:** "Voglio trovare un professionista per casa mia."
   - [ ] **Sono un Artigiano:** "Voglio trovare lavoro e far crescere il mio business."
3. **Data Entry:** Nome, Cognome, Email, Password.

### B. Accesso Utente Esistente
- Riconoscimento automatico del ruolo dal documento `users/{uid}/role`.
- Reindirizzamento immediato alla relativa Dashboard (Client o Worker).

---

## 13. WORKER QUALIFICATION GUIDELINE (Identifying Skills)

Per l'artigiano, l'identificazione delle proprie qualifiche deve seguire una logica "a imbuto" (Top-Down) per evitare che selezioni competenze fuori settore. Antigravity deve implementare questo modulo di onboarding:

### Fase 1: Identificazione Settore (Categories)
- L'artigiano visualizza la griglia delle 20+ categorie (Icona + Nome).
- **Regola:** Può selezionare più settori (es. Elettricista + Idraulico).
- **Interazione Mobile:** Card con feedback visivo (Bordo Blu Brand quando selezionata).

### Fase 2: Skill Discovery (Dettaglio Competenze)
Una volta scelte le categorie, l'app genera dinamicamente una lista di "Skill Verificate" basata sulla mappatura `CATEGORY_SERVICES`.
- **Esempio:** Se ha scelto "Edilizia", l'app DEVE mostrare solo: [Cartongesso, Posa Pavimenti, Tetti, ecc.].
- **Perché:** Questo garantisce che l'artigiano non si proponga per lavori che non sa svolgere, alzando la qualità del database.
- **UI Mobile:** Lista di chip selezionabili (multi-select).

### Fase 3: Business & Area Geografica
- **Prezzo Orario:** Input numerico (Prezzo minimo suggerito basato sulla categoria).
- **Raggio d'Azione (Km):** Uno Slider Apple-style da 5km a 100km. L'app userà questo valore per filtrare i lavori in `geofencing`.
- **Partita IVA/CF:** Validazione sintattica.

### Fase 4: Verifica Documenti (Trust Building)
- Upload foto: Carta d'Identità, Certificato Camera di Commercio, Assicurazione Professionale.
- **Backend:** Imposta `status: "pending_verification"`. L'artigiano può vedere i lavori ma NON inviare proposte finché l'admin non approva.

---

**NOTA CRITICA PER ANTIGRAVITY:**
La Dashboard Artigiano DEVE mostrare solo i Job che rispettano il binomio:
1. **Settore:** Il `Job.category` deve essere tra le `worker.categories`.
2. **Distanza:** Il `Job.location` deve essere dentro il `worker.radiusKm` dalla posizione dell'artigiano.

---

## 14. ENVIRONMENT & SECRETS (Configuration)

Per funzionare correttamente, Antigravity deve attingere ai seguenti segreti configurati nell'ambiente di produzione:

- `VITE_GOOGLE_CLIENT_ID`: ID Client Web per il login Google (presente nei Secrets di AI Studio).
- `VITE_FIREBASE_API_KEY`: Chiave API per la connessione al database.
- `VITE_GOOGLE_MAPS_API_KEY`: Necessaria per il geofencing e la ricerca indirizzi.

**Mobile Migration (Expo):**
In fase di migrazione verso Expo, l'AI deve mappare queste variabili nel file `.env` locale dell'app mobile usando il prefisso `EXPO_PUBLIC_`.

---

## 15. FIRESTORE SECURITY RULES & ERROR HANDLING

Il backend Firestore è protetto da un set rigoroso di Security Rules. Per supportare il debugging e l'uniformità (come implementato sul Web), l'app Expo deve catturare eventuali errori di permessi mancanti (Missing or insufficient permissions) formatandoli con uno schema ben preciso, fornendo log strutturati.

**Implementazione Error Handler:**
```typescript
export enum OperationType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write' }

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // L'app Expo deve recuperare il context utente (auth) e serializzare l'errore
  // includendo context auth (userId, email, providerData), operationType e path.
  // Loggare sotto forma di JSON per facilitare la diagnostica delle regole di sicurezza.
}
```

---

## 16. RESPONSIVE DESIGN & FLOATING WIDGETS (UI CONSTRAINTS)

Nella trasposizione da Web a Mobile App nativa (React Native), l'uso di posizionamenti assoluti (ad es. per i badge o i pannelli fluttuanti come il badge "Guadagno" presente nella Landing Page) va gestito usando i limiti dello schermo.

- **Evitare overflow laterale:** Quando posizioni elementi con `position: 'absolute'` e right/left negativi, usa `Dimensions.get('window').width` per calcolare una posizione rientrante affinché i contenuti extra non spariscano dai limiti fisici del display dello smartphone.
- **Z-Index Platform-specific:** Su Android l'`elevation` governa l'ombra e l'ordinamento z-index, mentre iOS usa `shadowOpacity` e `zIndex`. L'interfaccia dell'applicazione mobile dovrà essere coerente per non oscurare pulsanti di input o CTA.

## 18. SICUREZZA CONTRO ESFILTRAZIONE DATI ED ESPOSIZIONE PII (ANTI-SCRAPING)

Nella realizzazione dell'App Mobile, Antigravity DEVE adottare rigorose misure per prevenire scraping massivo ed esposizione involontaria di PII (Personally Identifiable Information).

1. **Filtro PII Locale (`validateMessage`):** L'App Mobile deve includere l'esatta logica di validazione `contentFilter.ts` utilizzata sulla Web App. Nessun messaggio di chat (fino all'assegnazione) o descrizione di un nuovo lavoro (Job) deve contenere numeri di telefono o indirizzi email. Antigravity DEVE bloccare il submit lato client se vengono rilevati pattern email o telefonici.
2. **Limitazione Query Massiva (Anti-Scraping):** L'App Mobile non deve eseguire query non limitate come `getDocs(collection(db, 'jobs'))`. Deve sempre richiedere dati filtrati (es. per raggio geografico) con un `limit()` o un sistema a schede/paginato. Le Security Rules di Firebase saranno indurite (`allow list: if isSignedIn();` o simili) per evitare download massivi del database, quindi le views anonime su Mobile andranno limitate.
3. **Integrazione Firebase App Check:** Nelle prossime fasi, CercArtigiano integrerà Firebase App Check con Play Integrity (Android) e DeviceCheck (iOS). Antigravity deve inserire il codice di inizializzazione per App Check (`@react-native-firebase/app-check` o equivalente Expo supportato) per garantire che solo l'app ufficiale possa parlare con Firestore, sventando ogni tentativo di data-exfiltration via bot.

## 19. REGOLE GEOGRAFICHE, DEEP LINKING E GOOGLE MAPS

Il core business di CercArtigiano si basa sulla prossimità radiale e sul blind-bidding (il cliente non cerca in una lista, ma crea la richiesta a cui gli artigiani rispondono). Antigravity deve implementare questa logica su mobile:

1. **Nessun Elenco Pubblico di Artigiani:** L'app mobile NON deve avere una schermata "Cerca Artigiano" che elenca liberamente i professionisti. Il flusso vitale è: il cliente crea un *Job* (Richiesta di Preventivo) -> Il sistema notifica i professionisti nel raggio d'azione -> I professionisti presentano il preventivo.
2. **Geolocalizzazione Obbligatoria (Google Maps Platform):**
   - Durante la registrazione del Professionista o la creazione di un *Job* da parte del Cliente, è **obbligatorio** utilizzare le API di Google Maps per l'autocompletamento dell'indirizzo.
   - Su React Native, utilizzare librerie come `react-native-google-places-autocomplete` che estraggono correttamente Address Components (`citta`, `provincia`, `cap`). Non affidarsi mai al solo testo libero, altrimenti il routing geografico fallisce.
   - Le query di prossimità devono supportare un raggio di ricerca (es. 5km, 10km, espandibile). L'indirizzo salvato su Firestore deve contenere la stringa formattata geocodificata.
3. **Deep Linking (Routing da Web a App):**
   - Oltre alle PWA, le App Native devono supportare *Universal Links* (iOS) e *App Links* (Android) agganciati al dominio `cercartigiano.com`.
   - Quando un utente apre un URL generato dal sito Web (pSEO) come `https://cercartigiano.com/servizi/lombardia/milano/cinisello-balsamo/idraulico`, l'App Native deeplink deve catturarlo.
   - All'apertura, il flusso Mobile Deeplink non deve causare errore: deve aprire il Form Creazione Job pre-compilando `categoria = idraulico` e `citta = cinisello balsamo` per l'utente, guidandolo direttamente nell'invio della richiesta. Se l'utente non è autenticato, presentare il login prima di salvare il form.

---

1. **No Simplified UX:** Ogni categoria DEVE attivare il suo specifico `WizardComponent`.
2. **Mobile Smoothness:** Usa librerie native di animazione come `react-native-reanimated` per transizioni fluide stile Apple.
3. **Cross-Platform Sync:** Assicurati che i dati scritti da Mobile siano leggibili dal Web (nomi campi identici).

---

## 20. PERCORSO DI IDENTIFICAZIONE SPECIALITÀ (LATO ARTIGIANO)

L'app mobile deve garantire che i professionisti possano profilarsi in modo granulare, così da ricevere solo richieste pertinenti. Il percorso "a imbuto" (Top-Down) prevede due fasi essenziali che rispecchiano le strutture presenti in `src/constants.ts`.

### Fase 1: Selezione Macro-Categoria
L'artigiano sceglie uno o più macro-settori (ad es. "Idraulico" o "Elettricista") attingendo direttamente da `SERVICE_CATEGORIES` (icona + label).

### Fase 2: Selezione Specifiche Competenze (Micro-Skill)
Per ogni Macro-Categoria scelta, vengono mostrate le specialità esatte. L'artigiano seleziona solo ciò di cui si occupa realmente, attingendo da `CATEGORY_SERVICES`. Di seguito le definizioni per ogni categoria che l'app Mobile DEVE replicare fedelmente:

- **Elettricista (`electrical`)**: Condizionatori, Cancello Automatico, Telecamere, Citofono, Antennista, Pronto Intervento, Certificazioni, Fotovoltaico, Allarme, Domotica, Illuminotecnica, Wallbox.
- **Idraulico (`plumbing`)**: Perdite, Caldaia, Rifacimento Bagno, Disotturazione, Sanitari, Impianto Irrigazione, Trattamento Acque, Autoclave, Scaldabagno.
- **Pulizia Casa (`cleaning`)**: Ordinaria, Profonda, Divani/Tappeti, Vetrate, Stiratura, Uffici, Sanificazione, B&B.
- **Edilizia (`construction`)**: Cartongesso, Pavimenti, Muratura, Tinteggiatura, Ristrutturazione Completa, Isolamento Termico (Cappotto), Parquet, Tetto.
- **Giardinaggio (`gardening`)**: Taglio Prato, Potatura, Irrigazione, Abbattimento Alto Fusto, Aiuole.
- **Tuttofare (`handyman`)**: Montaggio Mobili (IKEA/etc.), Appensione Quadri, Tapparelle/Persiane, Serrature, Siliconature.
- **Traslochi (`moving`)**: Completo, Ufficio, Solo Scatole, Smontaggio/Rimontaggio, Autoscale, Pianoforti, Sgombero.
- **Meccanico (`mechanic`)**: Tagliando, Freni, Diagnosi, Cambio Gomme, Clima, Cristalli, Elettrauto.
- **Fabbro / Serramenti (`locksmith`)**: Apertura Porte Bloccate, Sostituzione Serrature, Riparazione Tapparelle / Serrande, Installazione Casseforti, Fabbro Pronto Intervento, Lavorazione Ferro / Cancelli.
- **Imbianchino (`painter`)**: Tinteggiatura Interni, Tinteggiatura Esterni, Carta da Parati, Decorazioni (Stucco, Spatolato), Trattamenti Antimuffa, Verniciatura Porte/Finestre.
- **Sarto (`tailor`)**: Riparazioni Sartoriali (Orli, Cerniere), Abiti su Misura, Modifiche Abiti da Cerimonia, Rammendo e Rattoppo, Confezione Tende.
- **Tecnico Informatico (`it_support`)**: Riparazione PC / Mac, Rimozione Virus / Malware, Configurazione Rete / Wi-Fi, Recupero Dati, Assistenza Smartphone / Tablet, Installazione Software.
- **Elettrodomestici (`appliances`)**: Riparazione Lavatrice / Asciugatrice, Riparazione Frigorifero, Riparazione Forno / Piano Cottura, Riparazione Lavastoviglie, Riparazione Piccoli Elettrodomestici.
- **Fotografo / Video (`photography`)**: Servizi Fotografici ed Eventi (Matrimoni), Fotografia Prodotti / E-commerce, Riprese Video e Montaggio, Ritratti, Fotografia Immobiliare.
- **Ripetizioni (`tutoring`)**: Ripetizioni Scolastiche (Matematica, Lingue, ecc.), Aiuto Compiti, Corsi di Lingua Straniera, Preparazione Test Universitari, Informatica di Base.
- **Assistenza Anziani (`elderly_care`)**: Compagnia e Veglia, Aiuto Igiene Personale, Preparazione e Somministrazione Pasti, Accompagnamento Visite Mediche, Acquisto Spesa e Commissioni, Assistenza Notturna, Aiuto nella Deambulazione, Supporto Gestione Terapie Farmacologiche.
- **Baby Sitter (`babysitting`)**: Babysitting Occasionale, Aiuto Compiti, Accompagnamento Attività Extra, Animazione Feste, Puericultrice (Neonati), Presa a Scuola/Asilo.
- **Pet Sitting (`pet_sitting`)**: Dog Walking (Passeggiate), Pensione per Cani a Domicilio, Pensione per Gatti, Toelettatura, Addestramento Base, Somministrazione Farmaci Animali.
- **Estetica / Beauty (`beauty`)**: Taglio e Piega, Colore e Schiariture, Manicure e Pedicure (Smalto Semipermanente), Trattamenti Viso e Corpo, Trucco Sposa/Eventi, Massaggi Rilassanti, Epilazione (Cera/Laser), Laminazione Ciglia/Sopracciglia.
- **Falegname (`carpentry`)**: Riparazione Mobili in Legno, Creazione Arredi su Misura, Restauro Antichità, Posa Battiscopa e Parquet, Riparazione Porte e Infissi, Costruzione Strutture Esterno (Gazebo).
- **Psicologo (`psychology`)**: Consulenza Individuale, Terapia di Coppia, Sostegno Genitoriale, Psicoterapia Infantile, Gestione Ansia e Stress, Coaching e Motivazione.
- **Avvocato (`lawyer`)**: Diritto Civile, Diritto Penale, Diritto del Lavoro, Pratiche di Divorzio/Famiglia, Infortunistica Stradale, Recupero Crediti.
- **Architetto (`architect`)**: Progettazione Architettonica, Interior Design, Pratiche Edilizie (CILA/SCIA), Direzione Lavori, Rilievi e Planimetrie, Consulenza Arredamento.
- **Commercialista (`accountant`)**: Dichiarazione dei Redditi (730/Unico), Apertura Partita IVA, Contabilità Aziendale, Consulenza Fiscale, Pianificazione Successoria, Gestione Buste Paga.
- **Fisioterapista (`physiotherapy`)**: Riabilitazione Motoria, Massoterapia, Terapia Posturale, Fisioterapia Sportiva, Linfodrenaggio, Osteopatia.

I dati verranno poi salvati nel database nel documento `workerProfiles` sotto un array `skills[]`.

---

## 21. PERCORSO DI CREAZIONE RICHIESTA: MATCHING E ALLINEAMENTO (LATO CLIENTE)

Lato cliente, quando viene creata una nuova Richiesta di lavoro (Job), l'applicazione Mobile DEVE seguire un percorso analogo per assicurare il *Matching* corretto con l'Artigiano, sfruttando il motore definito in `src/services/questionService.ts`.

### Fasi del Matching:
1. **Punto d'Ingresso (La Categoria):** Il cliente clicca su una categoria specifica (es. "Elettricista"). Questo parametro (`categoryId="electrical"`) farà sì che il Job sia visibile unicamente agli artigiani che possiedono la Macro-Categoria corrispondente.
2. **Il Wizard Guidato (Matching Naturale):** L'App Mobile lancia una serie di domande a cascata (`Multi-Step Form`). 
   - **Domanda Chiave Esempio ("Di che servizio hai bisogno?"):** Tra le opzioni figurano voci come "Riparazione guasto", "Rifacimento impianto", "Certificazione", "Allarmi", "Fotovoltaico".
   - **Allineamento con le Skill:** Le risposte a questo step vanno salvate all'interno di `Job.meta.service_type`. 
3. **Il Filtro delle Competenze:** Quando il Job viene pubblicato, l'Artigiano la cui lista di `skills[]` (Punto 20) comprende "Fotovoltaico", riceverà immediatamente una notifica Push per la richiesta con tag "Fotovoltaico". 

**Perché è fondamentale che Web e App abbiano lo stesso percorso e gli stessi identificativi veri e propri?**
- Permette al Database di incrociare le parole chiave del Wizard Cliente (`questionService.ts` id degli step e delle options) con le Specialità Artigiano (`constants.ts` ID delle categorie).
- Se l'App Mobile utilizzasse un set di domande diverso, categorie non standard o ID differenti da quelli usati per il Web ("opt_1", "opt_2", "service_type", ecc...), l'algoritmo di matching (che connette l'esigenza del Cliente al portfolio dell'Artigiano) non funzionerebbe e la Dashboard dell'artigiano resterebbe vuota.

Pertanto, **l'App Mobile DEVE importare e renderizzare lo stesso identico file o array di configurazione del Web** (gli stessi `constants.ts` e `questionService.ts` del branch Web) per i wizard cliente e artigiano, costruendo la medesima struttura di step e usando gli **stessi identici ID (`id`) stringa** per le opzioni scelte, salvando le risposte nel documento Firestore del Job, in modo che l'Artigiano navighi nei filter e trovi esattamente le sue specialità.

### Regola d'oro della Sincronizzazione Dati (Web vs Mobile):
1. Gli `id` dentro `SERVICE_CATEGORIES` (es: `electrical`, `painter`) **devono** essere esattamente gli stessi.
2. Le chiavi dentro `CATEGORY_SERVICES` **devono** essere identiche ed estrapolate da un unico file configurativo condiviso (se usate monorepo o npm package condiviso).
3. Tutti gli `id` associati ai singoli step di `questionService.ts` (es: `service_type`, `property_type`, `opt_1`, `opt_2`) **non devono MAI** essere modificati o alterati singolarmente nelle diverse interfacce. Il Backend/Firebase Matching fa un controllo esatto ("Electrical" !== "electrical").
4. Mantenere scrupolosamente una single source of truth se possibile, oppure copiare **testualmente** i file `constants.ts` e `questionService.ts` nell'ambiente mobile a ogni update.

---

## 22. LOGICA DEL COSTO DEI TOKEN (VARIABILE)
L'App Mobile deve rispettare rigorosamente il fatto che **il costo in Token di un preventivo non è fisso a 1**.
- **Costo Variabile (`tokenCost`)**: Quando il Cliente pubblica una richiesta, il sistema Web calcola un "costo tier" del Job in base al livello/budget (es. nell'onboarding, lavori piccoli = 5 Token, medi = 8 Token, grandi/pro = 15/25 Token, con possibili integrazioni di calcolo via AI). 
- Questo valore viene salvato e scolpito in Firestore come campo **`tokenCost`** all'interno dell'Oggetto `Job`.
- **Implementazione App Mobile**: L'App Artigiano non stabilisce il costo da sola. Deve leggere il campo `job.tokenCost` dal DB per sapere quanti Token sottrarre durante la call Transazionale di inoltro del preventivo. Se l'artigiano non ha un `saldo tokens >= tokenCost`, l'App deve inibire l'azione (mostrando "Token Insufficienti").

---

## 23. STATO: APPROVAZIONE ARTIGIANO (MANUALE DA ADMIN)
L'Artigiano **NON può** visualizzare né rispondere a richieste di lavoro subito dopo essersi registrato o aver inviato il documento d'identità. L'approvazione è a tutti gli effetti un processo manuale bloccante.
- **Workflow App**: 
  1. Dopo la Registrazione, lo step "Upload Identità" porta l'account in stato `verificationStatus: 'pending'`.
  2. L'Artigiano deve vedere una schermata di attesa (sul Web è la `WorkerVerificationPhase`).
  3. L'Amministratore, nel suo AdminDashboard, approva l'artigiano impostando `verificationStatus: 'approved'` e `isApproved: true` in Firestore.
  4. L'App Mobile deve "ascoltare" in real-time i cambiamenti del documento Profilo. Solo al ricevimento del flag `'approved'`, si dovrà sbloccare la navigazione verso il feed dei lavori per l'Artigiano.

---

## 24. CONCORRENZA E LIMITI: LA POTENZA DEL 5
Nel portale Web è impostato un cap ferreo denominato **"Top 5 Selection"**. Esiste cioè un tetto massimo alla concorrenza per garantire massima utilità per tutti ed evitare sovraffollamento sul Cliente.
- **Max Preventivi**: Un singolo Lavoro/Job può ricevere al **massimo 5 preventivi**.
- **Implementazione App**: 
  1. Se `isFull` si abilita (calcolato analizzando se la collection interna `proposals` per quel job contiene `>= 5` o tramite counter aggregato `job.proposalsCount >= 5`), la visualizzazione del Lavoro nella bacheca mobile dovrà recare una label ("Lavoro Saturo" / "Pieno") e il CTA di "Invia Preventivo" deve essere obbligatoriamente disabilitato.
  2. Nessun artigiano ulteriore potrà accaparrarsi l'asta post quinto posto.

---

## 25. MENU E PAGINE DASHBOARD CLIENTE (IN DETTAGLIO)
Affinché Web e App siano perfettamente speculari, la Dashboard Cliente sull'App Mobile DEVE presentare le seguenti sezioni di navigazione (Bottom Tab Bar e/o Sidebar) e accogliere le stesse funzioni di input previste dal portale web. L'Admin Dashboard non sarà accessibile da App.

**1. Home / Inizio**
- **Elementi:** Pulsante CTA principale ("Nuova Richiesta"), Carosello degli "Esperti in evidenza" (recuperati dalla collection `workerProfiles`).
- **Input Dati:** Lancio del Wizard `GuidedJobModal`.
  - Gli step input del Wizard (Selezione Servizio, Dettagli/Foto opzionali, Indirizzo via Google Places Autocomplete, Contatti).
  - L'invio crea il job in `jobs` e calcola i token se previsti per la visualizzazione all'artigiano.

**2. Esplora Esperti (Search / Esperti)**
- **Elementi:** Lista completa e mappa degli artigiani attivi e verificati.
- **Input Dati:** Barra di ricerca testuale. Filtri per Categoria (`electrical`, `plumbing`, etc.) e Badge Verificato. Input per aprire il profilo pubblico (`PublicProfileModal`) dell'artigiano.

**3. Le mie Richieste (Jobs / Richieste)**
- **Elementi:** Lista dei Lavori creati dal cliente, divisi per stati ("Aperto", "In Corso", "Completato").
- **Input Dati/Azioni:** 
  - Consultazione delle proposte ricevute (`proposals` collection subordinata).
  - Tasto **"Prolunga Scadenza"**: Se il lavoro scade, l'input prolunga la validità scalando **1 Token** dal portafoglio Cliente.
  - Tasto **"Accetta Preventivo"**: Segna il job come `in_progress`, popola `hiredWorkerId`, rifiuta gli altri, e sblocca la chat (apre `ChatModal`).

**4. Mio Profilo (Profile)**
- **Input Dati Form Anagrafica:**
  - Caricamento Foto Profilo (Avatar Firebase Storage).
  - Nome, Cognome.
  - Indirizzo, Civico, Città, CAP, Provincia, Regione.
  - Telefono (Editabile).
  - Email (Sola Lettura in quanto legato all'Auth Google/Firebase).
- **Privacy Switch (Toggle):** Mostra Email, Mostra Telefono, Mostra Indirizzo.

**5. Ricarica Token / Piani**
- **Elementi/Input:** Acquisizione crediti lato Cliente. Selezione dei vari ticket tier (Es. 1 Token, 5 Token Premium, ecc). In-App Purchase su Mobile (StoreKit/Google Play Billing) mappato su Firebase.

**6. Impostazioni (Settings)**
In questa sezione, il Mobile deve avere gli stessi identici sottomenù presenti nel Web `SettingsView`:
- **Sicurezza & Password:** Form per inoltrare un link di password reset.
- **Notifiche:** Switch on/off per Email o Push relative a Messaggi ricevuti e Aggiornamenti del lavoro.
- **Privacy & GDPR:** 
  - Pulsante per "Esporta i miei dati" (Generazione File JSON delle proprie richieste).
  - Pulsante irreversibile per la **"Cancellazione Account totale"** (Eliminazione Firestore Cloud Function + Auth Cloud).

**7. Uscita (Logout)**
- Interruzione della sessione Firebase Auth e rimando al flow di on-boarding/guest.

---

## 26. MENU E PAGINE DASHBOARD ARTIGIANO (IN DETTAGLIO)
L'App Mobile DEVE replicare il CRM web `WorkerDashboard` con la medesima struttura di root. L'approvazione è bloccante: se `isApproved` (flag database) è `false`, nessuna di queste tab deve mostrare i lavori. 

**1. Home / Bacheca (Trova Lavori)**
- **Elementi:** Elenco Feed Lavori disponibili e non saturati (< 5 limit preventivi).
- **Elaborazione Automatica:** Mostra solo i lavori il cui `category` matcha col vettore `skills[]` dell'Artigiano.
- **Input Dati (Preventivo):** L'Apertura del Lavoro espone un form di input testuale ("Messaggio Preventivo") libero + Input numerico del prezzo stimato.
- **Azione:** L'invio sottrae dinamicamente il valore `tokenCost` del lavoro dall'array tokens (`user.tokens - responseCost`).

**2. Lavori Attivi (Projects)**
- **Elementi/Input:** Storico delle richieste dove l'artigiano ha partecipato (Preventivi pending) o vinto (Jobs in corso).
- **Azione:** Ingresso nella Chat di messaggistica. Consultazione del profilo ridotto del cliente.
- **Rimborso Pay-Per-Win:** Appena si apre la tab, la logica Mobile deve verificare se ci sono preventivi in estado "rejected" e se non rimborsati, ri-accreditare i Token all'artigiano (`workerDashboard` sul web esegue questo on-mount).

**3. Mio Profilo (Profile)**
- **Input Dati Form Anagrafica:** Medesimi campi del cliente (Nome, Telefono, Indirizzo completo e geocodificato Places API).
- **Input Dati Specifici Lavoro:** 
  - Retribuzione oraria stimata (Input Number).
  - Raggio di Lavoro Km (Input Number).
  - Bio Dettagliata (Textarea).
  - Abilità & Categorie (Multi-select dei tag come idraulico/elettricista).
- **Documenti:** Sezione per visualizzare lo stato di completamento dell'Upload Identità (per il badge Verificato).

**4. Ricarica Token / Piani**
- **Elementi/Input:** Sezione acquisti Token Pacchetti Crescita (Es. €49 per 20 Token, 50, 150 Token). Utilizzare In-App Purchases Mobile.

**5. Impostazioni (Settings) e Dati Fiscali**
Area nevralgica. L'app mobile replica tutte le voci della `SettingsView` web per il ruolo *worker*:
- **Sicurezza:** Reset password via Email.
- **Notifiche:** Switch "Nuovi Lavori Disponibili", "Nuovi Messaggi", ecc.
- **Generale Privacy:** Export dati in JSON e **Cancellazione Account**.
- **Dati Fiscali / Fatturazione (Fondamentale):** (Vedi Dettaglio Paragrafo 27). Impostazione Codice Fiscale, P.IVA, Ragione Sociale, e scelta del Regime Fiscale in un componente input dedicato per mantenere allineato l'admin web della piattaforma sulle fatture.

**6. Uscita (Logout)**
- Deslogin e ritorno all'Onboarding Mobile.

---

## 27. DATI FISCALI E FATTURAZIONE
Ogni Artigiano sul Web compila una sezione strutturata per la **Fatturazione Elettronica** (nel `WorkerOnboardingFlow` e in `BillingSettings`). L'App Mobile **DEVE** prevedere gli stessi campi all'interno del menù di modifica/impostazioni fiscali. In Firestore questi dati sono salvati in `billingProfiles/{userId}`. I campi obbligatori sono:

**1. Tipologia (fiscalType)**:
- "Libero Professionista / Ditta Individuale" (`freelancer`)
- "Società / Azienda" (`company`)
- "Privato" (`individual`) *[Se applicabile, anche se su CercArtigiano si presuppone P.IVA base]*

**2. Campi Anagrafici/Fiscali necessari (Input Text/Number)**:
- **Codice Fiscale**: Obbligatorio per tutti, uppercase (16 caratteri o P.IVA se coincidente).
- **Partita IVA**: Obbligatorio per `freelancer` e `company` (11 cifre).
- **Ragione Sociale / Nome Ditta**: Obbligatorio per `freelancer` e `company`.
- **Codice Univoco / SDI** e **Indirizzo PEC**.

**3. Regime Fiscale (Select/Dropdown)**:
Deve esistere il campo `regimeFiscale` con gli stessi identici identificativi:
- `forfettario` (Regime Forfettario L. 190/2014)
- `ordinario` (Regime Ordinario)
- `minimi` (Regime dei Minimi / Vantaggio)
- `privato` (Senza P.IVA - Ritenuta d'acconto / Autofatturazione)
- `altro` (Altro regime)

L'App Mobile dovrà precompilare (in GET) questi campi e farli aggiornare (in PATCH/MERGE) sulla collection `billingProfiles` garantendo a chi gestisce l'Admin Dashboard di estrarre le fatture correttamente per l'acquisto dei Token o Premium.

