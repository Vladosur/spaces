# Fase 1: Analisi dei Requisiti

## Obiettivo dell'Applicazione

L'obiettivo è sviluppare un'applicazione web chiamata "Appointy" per la gestione delle prenotazioni di sale riunioni. L'applicazione si rivolge a due tipi di utenti:
1.  **Utenti Standard:** Possono visualizzare la disponibilità, richiedere la prenotazione di una sala per una data e un orario specifici, e visualizzare lo stato delle loro richieste.
2.  **Amministratori:** Hanno una visione d'insieme di tutte le prenotazioni, possono approvare o rifiutare le richieste in sospeso e assegnare personale tecnico (es. per supporto audio/video).

## Requisiti Iniziali (Derivati dalla richiesta corrente)

*   **Refactoring della Vista Calendario Admin:** La richiesta corrente è di ristrutturare la pagina del calendario per offrire una visualizzazione giornaliera a timeline, più moderna e funzionale.
*   **Tema Scuro:** L'interfaccia dovrà adottare un tema scuro, con colori di sfondo e testo specifici per migliorare la leggibilità e l'estetica.
*   **Visualizzazione Timeline Oraria:** Il calendario mostrerà una singola giornata con un asse temporale verticale che elenca le ore. Le prenotazioni (eventi) saranno posizionate su questa griglia in base al loro orario di inizio e alla loro durata.
*   **Navigazione Intuitiva:** L'utente amministratore dovrà essere in grado di navigare facilmente tra i giorni della settimana e tra i mesi.
*   **Gerarchia Visiva Chiara:** Le informazioni all'interno della vista calendario (titolo, data, ora, eventi) devono essere organizzate in modo gerarchico e facilmente scansionabili.

---

## Stato di Avanzamento

Le seguenti attività relative ai requisiti iniziali sono state completate:

1.  **Implementazione della Vista a Timeline per l'Amministratore:**
    *   **Sviluppo:** La pagina "Calendario" dell'amministratore è stata completamente ricostruita, sostituendo il contenuto precedente con la nuova interfaccia a timeline.
    *   **Tema:** È stato applicato il tema scuro con sfondo `#1e1e20` e uno schema di colori coerente.
    *   **Visualizzazione Dati:** La griglia oraria verticale mostra dinamicamente le prenotazioni approvate, posizionandole correttamente in base a orario e durata.

2.  **Sviluppo dei Controlli di Navigazione:**
    *   Sono stati implementati i controlli per navigare tra i mesi e le settimane, consentendo una facile esplorazione del calendario.

3.  **Affinamento dell'Interfaccia e della Logica (Ciclo di Feedback):**
    *   **Layout e Spaziatura:** La struttura del componente è stata riorganizzata introducendo contenitori separati per l'header, la navigazione e la timeline, con l'aggiunta di padding per migliorare l'aspetto visivo e la leggibilità.
    *   **Logica di Navigazione:** È stato corretto il comportamento della barra di navigazione settimanale. Ora, la settimana visualizzata cambia solo tramite l'uso delle frecce laterali, mentre il clic su un giorno lo seleziona senza causare scorrimenti indesiderati.
    
---

## Evoluzione dei Requisiti e Funzionalità Aggiuntive

Durante lo sviluppo, l'applicazione è stata arricchita con nuove funzionalità per migliorare l'esperienza dell'amministratore e la coerenza generale del sistema.

1.  **Modulo di Gestione Dati (CRUD):**
    *   Sono state create tre pagine dedicate alla gestione dei dati di base dell'applicazione: **Sale**, **Tecnici** e **Piattaforme**.
    *   Ogni pagina offre funzionalità complete di **CRUD** (Create, Read, Update, Delete), permettendo agli amministratori di aggiungere, modificare ed eliminare item attraverso un'interfaccia modale intuitiva.

2.  **Coerenza dell'Interfaccia Utente (UI/UX):**
    *   Tutte le pagine di gestione sono state allineate stilisticamente alla pagina **Dashboard** principale, garantendo un layout, uno schema di colori e un comportamento di scrolling uniformi.
    *   È stato introdotto un **selettore di vista** (Card vs. Tabella) in tutte le pagine di gestione e nella dashboard, permettendo all'utente di scegliere la modalità di visualizzazione preferita.
    *   La gerarchia visiva è stata migliorata posizionando i pulsanti di azione principali (es. "Aggiungi Sala") in una riga separata sotto l'header della pagina, per un maggiore risalto e una migliore organizzazione.

3.  **Sistema di Filtro Avanzato:**
    *   I semplici pulsanti di filtro sono stati sostituiti da un componente riutilizzabile a **Tab**, più moderno ed elegante.
    *   Questo nuovo sistema di filtro è stato implementato nella **Dashboard Admin** e nella pagina **"Le mie prenotazioni"** dell'utente, per un'esperienza di navigazione più fluida e coerente.

4.  **Pannello Impostazioni Amministratore:**
    *   È stata creata una nuova sezione "Impostazioni", suddivisa in due pagine:
        *   **Generali:** Permette di configurare le preferenze di visualizzazione dell'applicazione, come il tema (Light/Dark), la vista predefinita per le tabelle (Card/Tabella) e la vista predefinita per il calendario (Giorno/Settimana).
        *   **Regole di Validazione:** Offre un controllo granulare sulle regole che governano la creazione delle prenotazioni. L'admin può abilitare e configurare gli orari di lavoro, la durata minima/massima di un meeting e l'anticipo minimo richiesto per una prenotazione.

5.  **Validazione Dinamica delle Prenotazioni:**
    *   Il servizio di validazione è stato potenziato per utilizzare dinamicamente le regole definite dall'amministratore nel pannello delle impostazioni. Questo rende il sistema flessibile e adattabile alle policy aziendali senza richiedere modifiche al codice.

6.  **Modulo di Gestione Utenti:**
    *   È stata implementata una nuova pagina dedicata alla **gestione degli utenti**, accessibile solo agli amministratori.
    *   Fornisce funzionalità **CRUD** complete per creare, modificare ed eliminare utenti.
    *   L'interfaccia include un **filtro a schede (Tab)** per separare e visualizzare distintamente gli utenti con ruolo "User" e "Admin".
    *   Per motivi di sicurezza e gestione, l'utente "Super Admin" è escluso dalla lista e non può essere modificato da questa interfaccia.

7.  **Architettura a Stato Centralizzato (DataContext):**
    *   È stata introdotta una modifica architetturale fondamentale con la creazione di un **`DataContext`** React.
    *   Questo contesto centralizza la gestione dei dati dinamici dell'applicazione (sale, tecnici, piattaforme, utenti), creando un'unica "fonte di verità".
    *   I dati vengono resi **persistenti** tra le sessioni di navigazione utilizzando il `localStorage` del browser.
    *   Questa architettura rende l'applicazione **dinamica**: qualsiasi modifica apportata in una pagina di gestione (es. l'aggiunta di una nuova sala) viene immediatamente riflessa in tutte le altre parti dell'applicazione che utilizzano quel dato (es. il menu a tendina nel modulo di creazione prenotazione).

8.  **Sistema di Notifiche Email Configurabile:**
    *   È stata introdotta una nuova pagina nelle **Impostazioni** chiamata **"Posta Elettronica"** per una gestione completa delle comunicazioni via email.
    *   **Configurazione Server SMTP:** La pagina permette agli amministratori di configurare i dettagli tecnici del server di posta (host, porta, credenziali, email mittente), rendendo il sistema autonomo.
    *   **Gestione Notifiche:** L'admin può abilitare o disabilitare selettivamente le notifiche email per eventi chiave:
        *   Conferma della richiesta di prenotazione all'utente.
        *   Aggiornamento dello stato (approvata/rifiutata) della richiesta all'utente.
        *   Notifica di assegnazione al tecnico.
    *   **Template Personalizzabili:** Per ogni notifica, è stata aggiunta un'area di testo che permette di personalizzare completamente il corpo dell'email, utilizzando segnaposto dinamici (es. `{{userName}}`, `{{room}}`) che vengono sostituiti con i dati reali della prenotazione.
    *   **Coerenza UI:** L'interfaccia della nuova pagina utilizza la stessa navigazione a schede (Tab) presente in altre sezioni dell'applicazione (es. Dashboard, Gestione Utenti) per garantire un'esperienza utente uniforme. È stato inoltre corretto lo stile delle schede nella pagina di gestione utenti per allinearlo al design system.

9.  **Gestione del Profilo Utente:**
    *   È stata introdotta una pagina **Profilo** dedicata, accessibile a tutti gli utenti (standard e admin) cliccando sull'area utente nella sidebar.
    *   **Modifica Informazioni Personali:** Gli utenti possono visualizzare e modificare il proprio nome completo. Ogni modifica viene salvata e riflessa istantaneamente in tutta l'applicazione (es. nella sidebar).
    *   **Modifica Sicura dell'Email:** È stato implementato un flusso di lavoro sicuro per la modifica dell'indirizzo email. Per proteggere l'account, il processo richiede:
        1.  L'inserimento della password attuale per verificare l'identità dell'utente.
        2.  L'inserimento di un codice di verifica (simulato) inviato al nuovo indirizzo email per confermare la proprietà.
    *   **Cambio Password:** La pagina include un modulo per aggiornare la password di accesso, richiedendo la password attuale e la conferma della nuova.
    *   **Coerenza UI:** La pagina del profilo è stata progettata per essere pienamente coerente con il design system dell'applicazione, supportando sia il tema light che dark e utilizzando gli stessi componenti riutilizzabili.