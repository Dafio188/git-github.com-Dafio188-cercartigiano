# Riepilogo Logica Operativa - CercArtigiano

Questo documento descrive in modo scrupoloso il flusso di lavoro, le decisioni e le funzionalità disponibili per le due tipologie di utenti sulla piattaforma CercArtigiano: il **Cliente** (chi cerca assistenza) e il **Professionista** (l'artigiano/esperto).

---

## 1. Logica per il CLIENTE

Il cliente utilizza la piattaforma per risolvere problemi domestici o tecnici attraverso un percorso guidato in 6 fasi.

### FASE 1: Creazione della Richiesta
- **Decisione**: Il cliente clicca su "Nuova Richiesta" nella Home.
- **Dati inseriti**: Titolo del problema, categoria (es. Idraulica), descrizione dettagliata e budget massimo indicativo.
- **Risultato**: La richiesta viene pubblicata ed è visibile a tutti i professionisti qualificati nella zona.

### FASE 2: Ricerca e Valutazione Professionisti (Smart Matching)
- **Logica**: Il cliente può esplorare i professionisti disponibili tramite la sezione **"Esplora Esperti"**.
- **Gerarchia Geografica (Smart Priority)**: Il sistema implementa un algoritmo di visibilità prioritaria per garantire la migliore scelta locale:
  1. Mostra inizialmente i professionisti della stessa **Città** del cliente.
  2. Se i risultati sono meno di 10, espande la ricerca ai professionisti della stessa **Provincia**.
  3. Se il totale è ancora inferiore a 10, espande la ricerca a tutta la **Regione**.
  4. (Opzionale) Se inferiore a 5, mostra i migliori a livello nazionale.
- **Decisione**: Il cliente può filtrare per categoria o cercare per nome.
- **Valutazione**: Per ogni professionista, il cliente vede Ranking, Recensioni e specializzazioni prima di decidere chi contattare.

### FASE 3: Ricezione e Valutazione Preventivi
- **Decisione**: Il cliente accede alla sezione **"Richieste"**.
- **Azione**: Clicca su una richiesta attiva per aprire il pannello dei preventivi ricevuti.
- **Valutazione**: Per ogni preventivo, il cliente può vedere:
  - Il prezzo proposto.
  - Il messaggio del professionista.
  - Il **Ranking** del professionista (media stelle).
  - Le recensioni precedenti degli altri utenti.
  - Foto dei lavori passati nel profilo del professionista.

### FASE 4: Affidamento dell'Incarico (Svolta Decisiva)
- **Decisione**: Il cliente clicca sul tasto **"Affida Lavoro"** su un preventivo specifico.
- **Logica**: Una volta cliccato, il lavoro passa dallo stato `open` (aperto) allo stato `assigned` (assegnato). 
- **Effetto**: La richiesta scompare dalla sezione pubblica e si sposta automaticamente nella nuova sezione **"Lavorazioni"**.

### FASE 5: Gestione e Coordinamento ("Lavorazioni")
- **Azione**: Nella sezione **"Lavorazioni"**, il cliente ha accesso ai dati sensibili del professionista (sbloccati solo dopo l'affidamento):
  - Numero di telefono diretto.
  - Email.
  - Chat dedicata per lo scambio di messaggi in tempo reale.
- **Obiettivo**: Accordarsi su orari e dettagli tecnici per l'esecuzione.

### FASE 6: Chiusura Intervento
- **Decisione**: Una volta che l'artigiano ha terminato il lavoro fisico, il cliente clicca sul tasto verde **"Lavoro Finito"**.
- **Logica**: Lo stato del lavoro passa a `completed`. Il lavoro non è più considerato "attivo" ma entra nello storico.

### FASE 7: Recensione e Ranking
- **Azione**: Automaticamente dopo il clic su "Lavoro Finito", si apre il modulo di valutazione.
- **Decisione**: Il cliente valuta su una scala da 1 a 5 stelle quattro categorie:
  1. **Precisione & Qualità**
  2. **Velocità & Tempistiche**
  3. **Pulizia Post-Lavoro**
  4. **Cortesia & Carattere**
- **Risultato**: Il feedback aggiorna il ranking globale del professionista, influenzando la sua posizione in classifica.

---

## 2. Logica per il PROFESSIONISTA

Il professionista utilizza la piattaforma come uno strumento di lavoro per acquisire clienti e costruire la propria reputazione digitale.

### FASE 1: Disponibilità e Visibilità
- **Decisione**: Il professionista attiva il toggle **"Online/Disponibile"** nella dashboard.
- **Logica**: Questo segnale indica ai clienti che il professionista è pronto a intervenire rapidamente.

### FASE 2: Ricerca Lavori e Candidatura
- **Decisione**: Accede al **"Centro Lavori"** e naviga tra le richieste aperte.
- **Azione**: Invia una **Candidatura** inserendo un prezzo concorrenziale e un messaggio di presentazione.
- **Monitoraggio**: Può vedere lo stato delle sue candidature (In attesa, Accettata, Rifiutata).

### FASE 3: Accettazione e Inizio Lavorazione
- **Evento**: Se il cliente sceglie il suo preventivo, il professionista riceve una conferma.
- **Logica**: Il lavoro si sposta nella sezione **"Lavorazioni"**.
- **Accesso Dati**: Solo in questa fase il professionista può vedere l'indirizzo esatto e il contatto telefonico del cliente.

### FASE 4: Comunicazione e Esecuzione
- **Azione**: Utilizza la chat o il telefono per coordinare l'intervento.
- **Responsabilità**: Il professionista è incentivato a mantenere un comportamento eccellente (pulizia, cortesia) perché sa che a fine lavoro riceverà una valutazione dettagliata.

### FASE 5: L'Importanza del Ranking (Carriera)
- **Logica**: Ogni recensione positiva aumenta il **Ranking Globale**.
- **Effetto Classifica**: I professionisti con ranking più alto:
  - Appaiono per primi nei risultati di ricerca.
  - Ricevono un badge "Elite" o "Certificato".
  - Hanno una probabilità molto più alta di vedere i propri preventivi accettati.
- **Garanzia**: Il ranking non è manipolabile, ma deriva solo da lavori effettivamente pagati e chiusi sulla piattaforma.

---

## 3. Riepilogo Stati del Lavoro (Job Lifecycle)

1.  **Open**: Richiesta pubblicata e visibile a tutti.
2.  **Assigned**: Preventivo accettato. Contatti sbloccati. Il lavoro è in "Lavorazioni".
3.  **Completed**: Lavoro terminato e certificato dal cliente.
4.  **Reviewed**: Recensione inviata, ranking aggiornato.

## 4. Strategia di Deployment e Sicurezza (Il "Paracadute")

Per garantire che gli esperimenti in fase di sviluppo non danneggino mai il business reale, il team ha deciso di adottare una struttura a due livelli:

- **Separazione degli Ambienti**: 
    - **Ambiente di Sviluppo (AI Studio)**: Utilizzato per testare nuove funzionalità, logiche AI e modifiche grafiche. È collegato a un database Firebase di test per evitare rischi.
    - **Ambiente di Produzione (Live)**: L'app pubblicata su **cercartigiano.it**. Utilizza un database Firebase di produzione dedicato, con regole di sicurezza (Security Rules) stringenti e backup regolari.
- **Gestione Dominio**: Il dominio acquistato su Aruba (`cercartigiano.it` e `.com`) agirà come indirizzo principale. Aruba gestirà il traffico DNS, indirizzando gli utenti verso l'infrastruttura Cloud ottimizzata che ospita l'applicazione.
- **Workflow di Aggiornamento**: Ogni aggiornamento viene prima validato tecnicamente in AI Studio e, solo dopo il successo dei test, viene pubblicato nell'ambiente live. Questo processo garantisce la massima stabilità per i clienti e i professionisti attivi.

---
*Documento redatto dal Team CercArtigiano - Precisione, Sicurezza, Stile.*