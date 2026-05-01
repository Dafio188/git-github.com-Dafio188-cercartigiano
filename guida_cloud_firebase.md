# Guida Strategica: Costi, Setup e Pubblicazione CercArtigiano

Benvenuto nella fase operativa. Questo documento, redatto dal team tecnico, spiega come configurare l'infrastruttura professionale per `cercartigiano.it` garantendo sicurezza, scalabilità e costi minimi.

## 1. Analisi dei Costi (Trasparenza Totale)

Utilizzeremo il piano **Firebase Blaze** (Pay-as-you-go), che pur richiedendo una carta di credito per la verifica, offre una quota gratuita ("Free Tier") estremamente generosa.

### A. Firebase (Database e Autenticazione)
*   **Authentication (Login Google)**: Gratuito per i primi 50.000 utenti mensili.
*   **Cloud Firestore (Database)**:
    *   Letture: Gratis fino a 50.000 al giorno.
    *   Scritture: Gratis fino a 20.000 al giorno.
    *   Spazio: Gratis fino a 1 GiB.
    *   *Nota: Se superi queste soglie, i costi sono di pochi centesimi per ogni 100.000 operazioni.*

### B. Google Cloud (Hosting dell'Applicazione)
*   **Cloud Run**: È dove "gira" il motore della tua app.
    *   I primi 180.000 secondi di calcolo al mese sono **gratuiti**.
    *   Per un'app nuova, il costo è solitamente **€0,00/mese** o pochi centesimi.

### C. Riepilogo
Finché non avrai migliaia di visite al giorno, il costo dell'infrastruttura sarà **prossimo allo zero**. L'unica spesa fissa che hai già sostenuto è il dominio su Aruba.

---

## 2. Setup Passo-Passo (Da fare insieme)

Non preoccuparti, ti guiderò io. Ecco i macro-passaggi che dovremo compiere:

### Step 1: Il Progetto "Produzione"
Dovrai creare un nuovo progetto su [Firebase Console](https://console.firebase.google.com/). Questo sarà il "gemello buono" dell'app, quello che vedranno gli utenti.
*   *Io ti fornirò i codici di configurazione da inserire.*

### Step 2: Collegamento Aruba
Su Aruba non useremo l'hosting Linux/Windows classico, ma useremo solo la **Gestione DNS**.
1.  Andremo nel pannello DNS di Aruba.
2.  Inseriremo dei record (chiamati A e CNAME) che Google Cloud ci fornirà.
3.  In questo modo, chi scrive `cercartigiano.it` verrà indirizzato sui server ultra-veloci di Google.

### Step 3: Protezione del Database (Il "Paracadute")
Implementeremo delle "Security Rules" che dicono a Firebase:
*   "Nessuno può cancellare il database."
*   "Solo i professionisti possono vedere i lavori della loro zona."
*   "I dati dei clienti sono visibili solo agli artigiani autorizzati."

---

## 3. Il Workflow di Lavoro (Massima Sicurezza)

Per evitare di "sfasciare il database" come temevi (giustamente), useremo questo metodo:

1.  **AI Studio (Sviluppo)**: Qui facciamo le modifiche, cambiamo la grafica, proviamo nuove funzioni AI. Questo ambiente è collegato a un database "finto" per i test.
2.  **Validazione**: Io controllo che tutto funzioni e che il codice sia pulito.
3.  **Deployment (Produzione)**: Una volta che siamo sicuri al 100%, "carichiamo" l'aggiornamento sul sito ufficiale `cercartigiano.it`.
4.  **Backup**: Attiveremo i backup automatici giornalieri su Google Cloud, così se anche dovessimo sbagliare, possiamo tornare indietro di 24 ore con un clic.

---

## 4. Prossime Azioni
Quando sei pronto, dimmelo e ti darò le prime istruzioni per creare il progetto su Google Cloud. Io sono qui per assicurarmi che ogni bit sia al suo posto.

**Il Team CercArtigiano - Precisione, Sicurezza, Stile.**
