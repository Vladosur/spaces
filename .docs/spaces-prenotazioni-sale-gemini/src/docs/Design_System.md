
# 🎨 Spaces - Design System & Guida agli Stili

Questo documento fornisce una panoramica completa degli aspetti grafici, delle librerie utilizzate e delle linee guida stilistiche dell'applicazione "Spaces".

---

## 🛠️ Stack Tecnologico & Librerie

L'interfaccia utente è costruita utilizzando un approccio moderno e leggero:

*   **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) (caricato via CDN per rapid prototyping).
*   **Iconografia:** [Lucide React](https://lucide.dev/) (v0.294.0). Icone vettoriali pulite e coerenti.
*   **Font:** [Google Fonts](https://fonts.google.com/).
*   **Animazioni:** Classi native di Tailwind (`transition`, `animate-in`) per micro-interazioni fluide.

---

## 🔤 Tipografia

L'applicazione utilizza un unico font sans-serif per garantire massima leggibilità e modernità.

*   **Font Family:** `Inter`, sans-serif.
*   **Pesi Utilizzati:**
    *   **Regular (400):** Testo del corpo, descrizioni.
    *   **Medium (500):** Etichette, sottotitoli minori, pulsanti secondari.
    *   **SemiBold (600):** Pulsanti primari, intestazioni di card, stati.
    *   **Bold (700):** Titoli principali (H1, H2), loghi, avatar.

---

## 🎨 Palette Colori e Temi

Il sistema di colori è basato su variabili CSS (HSL) per supportare nativamente il cambio di tema (Light/Dark mode) senza modificare le classi HTML.

### 1. Colori Semantici (Variabili CSS)

| Variabile | Descrizione | Light Mode (Esadecimale Approx) | Dark Mode (Esadecimale Approx) |
| :--- | :--- | :--- | :--- |
| `--background` | Sfondo pagina | `#F7F8FA` (Grigio chiarissimo) | `#1E1E20` (Grigio scuro profondo) |
| `--card` | Sfondo elementi | `#FFFFFF` (Bianco puro) | `#2F3137` (Grigio medio) |
| `--foreground` | Testo principale | `#2A303C` (Grigio scuro) | `#F8FAFC` (Bianco sporco) |
| `--primary` | Colore Brand/Azione | `#6D28D9` (Viola Intenso) | `#A4C2DF` (Azzurro Polvere) |
| `--muted` | Sfondi secondari | `#E4E4E7` | `#2F3137` |
| `--border` | Bordi e divisori | `#D8D8DB` | `#404249` |

### 2. Stati delle Prenotazioni

Ogni stato ha un colore associato e un gradiente per le card in dashboard.

*   **🟡 In Attesa (Pending):**
    *   **Colore:** Yellow-500 / Orange-500.
    *   **Stile:** Gradiente caldo, pillola con sfondo traslucido (`bg-yellow-400/20`).
*   **🟢 Approvata (Approved):**
    *   **Colore:** Green-500 / Teal-500.
    *   **Stile:** Gradiente fresco, pillola verde (`bg-green-400/20`).
*   **🔴 Rifiutata (Rejected):**
    *   **Colore:** Red-500 / Pink-500.
    *   **Stile:** Gradiente allarme, pillola rossa (`bg-red-400/20`).

### 3. Identità Piattaforme (Hardcoded)

Colori specifici per riconoscere visivamente la piattaforma di meeting (usati nei bordi laterali delle card calendario).

*   **Google Meet:** `#00ac47` (Verde)
*   **Microsoft Teams:** `#6264a7` (Blurple)
*   **Zoom:** `#2d8cff` (Blu)
*   **Nessuna/Generico:** `#9ca3af` (Grigio)

### 4. Identità Tecnici (Esempi)

*   **Audio/Video:** `#3b82f6` (Blu)
*   **IT & Network:** `#10b981` (Smeraldo)
*   **Supporto Generale:** `#f59e0b` (Ambra)

---

## 💎 Elementi UI e Stili

### Glassmorphism & Trasparenze
L'applicazione fa ampio uso di effetti di sfocatura e semitrasparenza per creare profondità, specialmente nella modalità Admin e Login.
*   **Classi:** `bg-card/60`, `backdrop-blur-xl`, `backdrop-blur-sm`.
*   **Utilizzo:** Card delle prenotazioni, Modali, Sidebar di navigazione (mobile), Card login.

### Arrotondamenti (Border Radius)
Il design è morbido e amichevole.
*   **Standard:** `rounded-xl` (12px) per Card e contenitori principali.
*   **Input/Bottoni:** `rounded-lg` (8px).
*   **Pillole/Badge:** `rounded-full`.

### Ombre (Shadows)
*   **Light Mode:** Ombre diffuse (`shadow-lg`, `shadow-xl`) per elevare gli elementi dal fondo chiaro.
*   **Dark Mode:** Le ombre sono meno percettibili; si usa il contrasto di colore dei bordi (`border-border`) per definire la gerarchia.

### Scrollbar Personalizzata
Per garantire coerenza su Windows/Mac e tra i temi:
*   **Stile:** Sottile (`width: 8px`), arrotondata.
*   **Colori:**
    *   Thumb: `#A0A0A0` (Light) / `#555` (Dark).
    *   Track: `#F1F1F1` (Light) / `#2f3137` (Dark).

---

## 📱 Layout e Responsive

*   **Sidebar:**
    *   **Desktop:** Fissa a sinistra (`w-64`), sempre visibile.
    *   **Mobile:** Off-canvas a scorrimento (`-translate-x-full` to `translate-x-0`) con overlay scuro (`bg-black/50`).
*   **Griglie:**
    *   **Dashboard:** Grid reattiva che passa da 1 colonna (mobile) a 2 (tablet) fino a 3 (desktop XL).
    *   `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`.
*   **Calendario Timeline:**
    *   Layout complesso con `sticky positioning` per mantenere visibili le intestazioni delle stanze (top) e gli orari (left) durante lo scorrimento.

---

## ⚡ Animazioni e Transizioni

*   **Hover:** Transizioni rapide (`duration-200` o `duration-300`) su colori di sfondo, bordi e trasformazioni (`scale-[1.02]`) per le card interattive.
*   **Modali:**
    *   Entrata: `animate-in slide-in-from-bottom-10 fade-in`.
    *   Mobile: Effetto "Bottom Sheet".
    *   Desktop: Effetto "Side Sheet" (scorrimento da destra) o Modale centrale classica.
