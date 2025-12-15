
# Spaces – Gestione Prenotazioni Sale


Spaces è un'applicazione web per la gestione delle prenotazioni di sale riunioni, pensata per aziende, scuole o enti che necessitano di organizzare spazi condivisi in modo semplice, moderno e centralizzato.

> **Attenzione: MVP / Demo**
>
> Questa versione è un MVP (Minimum Viable Product):
> - **Non** è collegata a un database o backend reale.
> - Tutti i dati (utenti, sale, prenotazioni, ecc.) sono **mock** e gestiti solo in memoria/localStorage.
> - Le funzionalità di notifica email sono simulate e non inviano email reali.
> - L'applicazione è pensata per demo, prototipazione e sviluppo, **non per uso in produzione**.


## Caratteristiche principali

- **Gestione Sale, Tecnici e Piattaforme**: CRUD completo per sale, tecnici e piattaforme disponibili, con interfaccia intuitiva per l'amministratore.
- **Prenotazione Sale**: Gli utenti possono visualizzare la disponibilità, richiedere la prenotazione di una sala per data e orario specifici, e monitorare lo stato delle proprie richieste.
- **Dashboard Amministratore**: Visione d'insieme di tutte le prenotazioni, con possibilità di approvare/rifiutare richieste e assegnare tecnici.
- **Validazione dinamica**: Regole configurabili su orari, durata minima/massima e anticipo richiesto per le prenotazioni.
- **Gestione Utenti**: CRUD utenti con ruoli (User/Admin), filtro per ruolo, esclusione del Super Admin.
- **Notifiche Email**: Sistema configurabile di notifiche email per utenti e tecnici, con template personalizzabili e impostazioni SMTP.
- **Profilo Utente**: Modifica sicura di nome, email e password, con verifica e coerenza UI.
- **Tema Light/Dark**: Interfaccia moderna, responsive, con supporto tema chiaro/scuro.
- **Persistenza dati**: Tutti i dati sono gestiti in modo centralizzato e persistenti tramite localStorage.

## Tecnologie utilizzate

- **React 19**
- **TypeScript**
- **Vite**
- **TailwindCSS**
- **React Router DOM**

## Struttura del progetto

- `components/` – Componenti React suddivisi per area (admin, user, auth, layout, profile, common)
- `context/` – Gestione stato globale (autenticazione, tema, impostazioni)
- `services/` – Logica di business per prenotazioni e validazione
- `types.ts` – Tipi e costanti condivise
- `constants.ts` – Dati di esempio e costanti
- `docs/` – Documentazione tecnica e funzionale

## Come iniziare

### Prerequisiti

- Node.js (versione consigliata >= 18)

### Installazione e avvio locale

1. Clona il repository:
   ```bash
   git clone https://github.com/<tuo-utente>/spaces-prenotazioni-sale.git
   cd spaces-prenotazioni-sale
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia l'applicazione in modalità sviluppo:
   ```bash
   npm run dev
   ```
4. Apri il browser su [http://localhost:5173](http://localhost:5173)


> **Nota:** Non sono richieste chiavi API o backend esterni: tutti i dati sono mock e gestiti in locale per demo e sviluppo.

## Ruoli e flussi principali

- **Utente**: può prenotare sale, vedere le proprie prenotazioni, modificare il profilo.
- **Admin**: gestisce sale, tecnici, piattaforme, utenti, approva/rifiuta prenotazioni, configura notifiche e regole.

## Personalizzazione

Le impostazioni di tema, regole di validazione e notifiche email sono accessibili dal pannello di amministrazione.