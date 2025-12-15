
# Piano di Miglioramento ed Evoluzione "Spaces"

Questo documento raccoglie le proposte di funzionalità ad alto valore aggiunto discusse e l'analisi tecnica per l'integrazione con servizi esterni.

## 1. Funzionalità ad Alto Impatto (UX & Business Value)

### A. Caratteristiche e Capienza delle Sale (Amenities) 🛋️
*   **Problema:** L'utente sceglie la sala solo in base al nome, senza conoscere le dotazioni effettive.
*   **Soluzione:** Aggiungere metadati alle sale:
    *   **Capienza:** (es. "Max 8 persone").
    *   **Dotazioni:** Icone per Proiettore, Lavagna Interattiva, Videoconferenza, Wi-Fi dedicato.
*   **Valore:** Ottimizzazione nell'uso delle risorse (evita che 2 persone occupino la sala conferenze da 20 posti).

### B. Export Calendario (.ics) 📅
*   **Problema:** Rischio di "No-show" perché l'utente dimentica l'appuntamento se non è presente sul suo calendario lavorativo (Outlook/Google).
*   **Soluzione (Immediata):** Aggiungere un pulsante "Aggiungi al calendario" che genera un file standard `.ics`.
*   **Compatibilità:** Universale (Outlook, Apple Calendar, Google Calendar, Thunderbird).

### C. Dashboard Analytics per Admin 📊
*   **Problema:** Mancanza di dati sull'utilizzo degli spazi.
*   **Soluzione:** Grafici e KPI su:
    *   Tasso di occupazione per sala.
    *   Orari di picco vs. orari morti.
    *   Top utenti prenotatori.
*   **Valore:** Data-driven decision making per il Facility Management.

### D. Sistema di "Check-in" (Anti-Ghosting) 👻
*   **Problema:** Sale prenotate ma lasciate vuote ("Ghost meetings").
*   **Soluzione:** Richiesta di conferma (Check-in) via app o QR Code fuori dalla sala 15 minuti prima dell'inizio. Cancellazione automatica se non confermato entro un tempo limite.

### E. Prenotazioni Ricorrenti 🔄
*   **Soluzione:** Opzione "Ripeti ogni [Giorno/Settimana] per [X] volte" nel form di prenotazione.
*   **Valore:** Risparmio di tempo per riunioni di routine (es. Weekly Standup).

---

## 2. Focus Tecnico: Integrazione Google Calendar

### Scenario A: Implementazione Reale (Backend)
In un ambiente di produzione con Backend (Node.js/.NET/Python), l'integrazione deve essere nativa e bidirezionale, senza scambio manuale di file.

1.  **OAuth 2.0:**
    *   Registrazione app su Google Cloud Console.
    *   Implementazione flusso "Sign in with Google" per ottenere l'accesso allo scope `calendar`.
2.  **Gestione Token:**
    *   Salvataggio sicuro di `Access Token` e `Refresh Token` nel database associati all'utente.
    *   Gestione del refresh automatico del token.
3.  **Sincronizzazione:**
    *   **Spaces -> Google:** Chiamata API Google alla creazione/modifica su Spaces.
    *   **Google -> Spaces:** Webhook (Push Notifications) da Google per aggiornare Spaces se l'evento viene spostato su GCal.

### Scenario B: Strategia per la Demo (Frontend Only)
Non avendo un backend per gestire OAuth in sicurezza in questa fase, simuliamo l'esperienza utente completa per mostrare il valore al cliente.

**Implementazione Mock:**
1.  **Tab "Integrazioni" nel Profilo:**
    *   Creazione di una sezione dedicata nel profilo utente.
    *   Switch o Pulsante "Connetti Google Calendar".
2.  **Simulazione Flusso:**
    *   Al click, simulazione di caricamento/connessione (spinner o fake popup).
    *   Cambio stato visivo in "✅ Connesso come [email utente]".
3.  **Effetto sulla UI:**
    *   Se connesso (simulato): Mostrare un badge "Sincronizzato con Google Calendar" sulla card della prenotazione.
    *   Se non connesso: Mostrare il pulsante di fallback "Scarica .ics" o "Aggiungi al calendario".

---

## 3. Focus Tecnico: Autenticazione a Due Fattori (MFA/TOTP)

Per abilitare l'uso di app come **Google Authenticator**, Microsoft Authenticator o Authy, è necessario implementare il protocollo **TOTP (Time-based One-Time Password)** definito nella RFC 6238.

### Requisiti Database
La tabella utenti dovrà essere estesa con i seguenti campi (protetti/criptati):
*   `two_factor_secret`: Stringa (Base32). Il segreto condiviso tra server e app.
*   `two_factor_enabled`: Booleano.
*   `two_factor_recovery_codes`: JSON/Array. Codici di emergenza usa e getta.

### Workflow di Implementazione

#### Fase 1: Attivazione (Enrollment)
1.  **Generazione:** Il backend genera un segreto casuale.
2.  **Visualizzazione:** Il backend crea un URI `otpauth://totp/Spaces:UserEmail?secret=XYZ&issuer=Spaces` e il frontend lo mostra come **QR Code**.
3.  **Verifica:** L'utente scansiona il QR e inserisce il codice generato. Il backend convalida il codice per confermare che la configurazione sia avvenuta correttamente prima di salvare il segreto.

#### Fase 2: Login (Challenge)
1.  L'utente esegue il login classico (email/password).
2.  Il backend verifica la password. Se `two_factor_enabled` è attivo, non rilascia il token di sessione finale ma richiede un secondo step.
3.  Il frontend mostra la schermata "Inserisci codice 2FA".
4.  Il backend verifica il codice TOTP rispetto al segreto salvato e all'orario attuale.

#### Fase 3: Librerie Consigliate
*   **Node.js:** `speakeasy` o `otplib` per la logica TOTP, `qrcode` per generare l'immagine.
*   **.NET:** `Ot Net` o `GoogleAuthenticator`.
*   **Python:** `pyotp`.

---

## 4. Focus Funzionale: Sistema di Messaggistica Istantanea

### Analisi Costi/Benefici
**Pro:**
*   **Contesto:** Comunicazione legata specificamente alla prenotazione (niente "di che sala parli?").
*   **Audit Trail:** Tracciamento storico delle decisioni e richieste (es. richieste extra, cambi orario concordati).
*   **Privacy:** Utenti e tecnici comunicano senza scambiarsi contatti personali (es. WhatsApp).

**Contro:**
*   **Ridondanza:** Rischio di creare l'ennesima inbox ignorata se l'azienda usa già Teams/Slack in modo massiccio.
*   **Costo Tecnico:** Le funzionalità real-time (WebSockets) e le notifiche push sono onerose da sviluppare e mantenere.

### Strategia Consigliata: "Messaggistica Contestuale"
Si sconsiglia una chat generale. L'approccio vincente è la **Chat per Prenotazione**.
*   **Partecipanti:** Utente Richiedente + Admin + Tecnico Assegnato.
*   **Scopo:** Solo comunicazioni operative su quello specifico evento (es. "Il proiettore serve 10 minuti prima", "Arrivo in ritardo").

### Implementazione Tecnica

#### Fase Demo (Frontend Only)
*   Estensione modello dati: Aggiunta campo `messages: Message[]` all'oggetto `Booking`.
*   UI: Aggiunta Tab "Comunicazioni" nei modali di dettaglio prenotazione.
*   Simulazione: Risposte automatiche del sistema per mostrare l'interattività.

#### Fase Backend (Reale)
*   **WebSockets (SignalR / Socket.io):** Necessari per rendere la chat istantanea senza ricaricare la pagina.
*   **Notifiche Ibride:** Fondamentale inviare email/push ("Hai un nuovo messaggio sulla prenotazione #123") quando l'utente è offline, altrimenti i messaggi non verranno letti tempestivamente.

---

## 5. Priorità di Implementazione Suggerita

1.  **Fase Demo (Immediata):**
    *   Implementazione generazione file `.ics` (Done).
    *   Creazione UI "Integrazioni" nel profilo (In Progress).
    *   Implementazione Notifiche Desktop Native (Done).
    *   Arricchimento visivo delle Sale con icone (Amenities) (To Do).
    *   **Gestione Avanzata Tecnici** (Done): Strutturazione dati tecnici (email, telefono, specializzazione).
    *   **Identità Visiva Piattaforme** (Done): Loghi, colori e icone per le piattaforme.

2.  **Fase Sviluppo Backend (Successiva):**
    *   Implementazione OAuth reale per Google Calendar.
    *   Sviluppo logica ricorrenze e check-in automatizzato.
    *   Implementazione MFA/TOTP reale.
    *   Integrazione sistema di messaggistica contestuale (WebSockets).

---

## 6. Focus Funzionale: Notifiche Desktop Native

### Obiettivo
Permettere agli utenti (soprattutto Admin e Tecnici) di ricevere avvisi critici (es. "Nuova prenotazione urgente") direttamente dal sistema operativo, anche se il browser è minimizzato o l'utente sta guardando un'altra scheda.

### Architettura Implementata
1.  **Notification API (W3C):** Utilizziamo l'API standard del browser, supportata da Chrome, Firefox, Safari ed Edge.
2.  **Gestione Permessi:**
    *   Il browser richiede un'interazione esplicita dell'utente.
    *   Abbiamo implementato uno **Switch** nella pagina Profilo (`ProfilePage.tsx`) per richiedere il permesso in modo controllato.
    *   Stato salvato nel `ThemeContext` per persistenza della preferenza utente.
3.  **Logica di Trigger:**
    *   **Creazione Prenotazione:** Se l'utente attuale è un Admin, riceve una notifica desktop istantanea.
    *   **Aggiornamento Stato:** Se la prenotazione di un utente viene approvata/rifiutata, l'utente riceve una notifica.
4.  **Limitazioni:**
    *   Richiede contesto sicuro (HTTPS) in produzione.
    *   Su Windows, le notifiche rispettano le impostazioni di "Focus Assist" (Non disturbare).

---

## 7. Focus Tecnico: Autenticazione Aziendale (Microsoft Entra ID - Cloud Native)

Data l'assenza di Domain Controller locali e la gestione utenti esclusivamente in cloud, l'integrazione con **Microsoft Entra ID (ex Azure AD)** è la soluzione naturale, più sicura e più semplice da implementare.

### Architettura: Single Page Application (SPA) + API
L'applicazione "Spaces" delegherà completamente l'autenticazione a Microsoft. Non c'è bisogno di server intermedi per l'autenticazione (niente ADFS o LDAP).

### Stack Tecnologico Consigliato
*   **Protocollo:** OAuth 2.0 / OpenID Connect (OIDC) con flusso *Authorization Code Flow with PKCE* (standard di sicurezza per app frontend come React).
*   **Libreria Frontend:** `@azure/msal-react` e `@azure/msal-browser` (Microsoft Authentication Library). Gestisce il redirect al login Microsoft, il rinnovo silenzioso dei token e la cache sicura.
*   **Libreria Backend:** Middleware per la validazione del *Bearer Token* JWT (JSON Web Token).

### Flusso di Integrazione Dettagliato

1.  **App Registration (Azure Portal):**
    *   Si registra "Spaces" nel tenant Entra ID dell'azienda.
    *   Si configura l'applicazione come SPA (Single Page Application).
    *   Si ottengono `Client ID` e `Tenant ID` da inserire nel file `.env` dell'app React.

2.  **Gestione Ruoli (RBAC - Role Based Access Control):**
    *   **Approccio Cloud-Native:** Invece di gestire i ruoli nel database dell'app, si definiscono gli **App Roles** direttamente nel "Manifest" dell'applicazione su Entra ID (es. `Spaces.Admin`, `Spaces.User`).
    *   **Assegnazione:** Gli amministratori IT assegnano utenti o gruppi aziendali (es. "IT Dept") a questi ruoli dal portale Azure.
    *   **Consumo:** Quando l'utente fa login, il token JWT ricevuto da "Spaces" contiene già il claim `roles`. L'app React legge il token e sa immediatamente se mostrare l'interfaccia Admin o User, senza bisogno di interrogare un database locale.

3.  **Arricchimento Dati (Microsoft Graph API):**
    *   Essendo un'app nativa cloud, "Spaces" può utilizzare il token di accesso per chiamare **Microsoft Graph**.
    *   Questo permette di scaricare automaticamente la foto profilo dell'utente, il job title, il dipartimento e l'ufficio di appartenenza, arricchendo l'interfaccia utente senza sforzo di data entry.

---

## 8. Focus Funzionale: Gestione Avanzata Risorse (Vista Tecnici)

### Problema
L'attuale visualizzazione del calendario si concentra sulle Sale Riunioni. Tuttavia, quando il volume di prenotazioni cresce, diventa difficile gestire la disponibilità delle risorse umane (Tecnici), rischiando conflitti di pianificazione o un carico di lavoro sbilanciato.

### Soluzione: Vista Calendario Dedicata
Introdurre un toggle "Vista: Sale / Tecnici" nel calendario generale Admin.

*   **Vista Tecnici:**
    *   **Righe:** Ogni riga rappresenta un Tecnico (invece di una Sala).
    *   **Eventi:** Gli eventi visualizzati sono le prenotazioni a cui quel tecnico è assegnato.
    *   **Slot Vuoti:** Permette di vedere a colpo d'occhio chi è libero in una determinata fascia oraria.
    *   **Riga "Non Assegnati":** Una riga speciale che raccoglie tutte le prenotazioni approvate che richiedono un tecnico ma non ne hanno ancora uno assegnato.
    *   **Drag & Drop:** Possibilità di trascinare un evento dalla riga "Non Assegnati" alla riga di un tecnico libero per assegnarlo rapidamente.

### Valore
*   **Ottimizzazione:** Migliore distribuzione del carico di lavoro.
*   **Prevenzione Errori:** Riduzione drastica delle doppie prenotazioni per lo stesso operatore.
*   **Velocità:** Assegnazione massiva e rapida delle richieste in sospeso.

---

## 9. Focus Funzionale: Logica di Modifica e Storicizzazione

### Problema
La gestione del ciclo di vita di una prenotazione richiede regole precise per mantenere l'integrità dei dati e la coerenza delle comunicazioni.

### Requisiti e Regole di Business

1.  **Immutabilità dello Storico (Passato):**
    *   Le prenotazioni la cui data è antecedente alla data odierna devono essere considerate **"chiuse"** e immodificabili.
    *   **Lato Admin:** Il modale di dettaglio per queste prenotazioni deve aprirsi in modalità *sola lettura*. I pulsanti "Salva Modifiche", "Approva/Rifiuta" o "Elimina" devono essere disabilitati o nascosti.
    *   **Obiettivo:** Preservare l'audit trail di ciò che è effettivamente accaduto.

2.  **Modifica di Prenotazioni Attive (Presente/Futuro) già Approvate:**
    *   **Scenario:** Un admin modifica una prenotazione (es. cambia orario o sala) che era già stata approvata e per la quale erano già partite le email di conferma.
    *   **Criticità:** La modifica invalida le informazioni precedentemente comunicate all'utente e al tecnico.
    *   **Soluzione Proposta:**
        *   Il sistema deve rilevare se la modifica tocca campi "sensibili" (Data, Ora Inizio, Ora Fine, Sala, Tecnico).
        *   **Conferma Esplicita:** Prima di salvare, mostrare un alert: *"Attenzione: stai modificando una prenotazione già confermata. Procedendo, verrà inviata una nuova notifica di aggiornamento all'utente e al tecnico."*
        *   **Notifiche a Cascata:**
            *   **All'Utente:** Email di "Aggiornamento Prenotazione" con i nuovi dettagli evidenziati.
            *   **Al Tecnico (se coinvolto):**
                *   Se il tecnico rimane lo stesso ma cambia l'orario: Email di "Aggiornamento Orario".
                *   Se il tecnico cambia: Email di "Cancellazione Assegnazione" al vecchio tecnico e "Nuova Assegnazione" al nuovo tecnico.

---

## 10. Focus Funzionale: Gestione Avanzata Risorse Umane (Tecnici)

### Obiettivo
Trasformare l'entità "Tecnico" da una semplice etichetta di testo a un profilo strutturato per migliorare l'assegnazione delle risorse e la comunicazione.

### Struttura Dati Estesa
*   **Anagrafica:** Nome, Email (per notifiche dirette), Telefono (per emergenze).
*   **Profilazione:**
    *   **Specializzazione:** Audio/Video, IT/Network, Allestimento, Supporto Generale.
    *   **Colore Identificativo:** Per riconoscimento visivo rapido sul calendario.
*   **Stato:** Disponibile, Ferie, Malattia (Futuro).

### Impatto sulla UI
*   **Lista Tecnici:** Tabella arricchita con contatti rapidi.
*   **Assegnazione (Smart Assign):**
    *   Il dropdown di selezione mostra non solo il nome ma anche la specializzazione.
    *   Filtro visivo per disponibilità (già implementato: mostra se occupato in altra sala).

### Evoluzioni Future (Backend)
*   **Turni di Lavoro:** Definizione orari specifici per tecnico (es. Mario: 08:00-14:00, Luigi: 14:00-20:00).
*   **Skill Matching:** Algoritmo che suggerisce il tecnico migliore in base al tipo di richiesta (es. Richiesta "Videoconferenza complessa" -> Suggerisci "Mario (AV Specialist)").

---

## 11. Focus Funzionale: Gestione Avanzata Piattaforme (Virtual Meeting)

### Obiettivo
Migliorare l'esperienza utente associata alle videoconferenze, fornendo non solo un nome (es. "Zoom") ma istruzioni e identità visiva.

### Implementazione Corrente (Identità Visiva)
*   **Struttura Dati:** Ogni piattaforma ha ora un colore associato (es. Blu per Zoom, Viola per Teams) e un'icona rappresentativa.
*   **Impatto UI:** Le card delle prenotazioni nel calendario mostrano un bordo colorato corrispondente alla piattaforma, facilitando il riconoscimento visivo.

### Evoluzioni Future
1.  **Manuali Operativi:**
    *   Campo per inserire un URL (PDF/Wiki) con le istruzioni della sala (es. "Come collegare il PC in Sala Blu").
    *   Visualizzazione di un link "Guida Sala" nel dettaglio prenotazione.
2.  **Link Meeting Dinamici:**
    *   Distinzione tra link statici (Personal Room) e link da generare.
    *   Integrazione futura con API (Zoom/Teams) per generare il link alla creazione della prenotazione.
3.  **Gestione Licenze:**
    *   Flag "Richiede Licenza Host".
    *   Warning all'utente: "Attenzione: per usare questa piattaforma devi avere un account Pro aziendale".
