
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import type { ValidationSettings } from '@/context/ThemeContext';

/**
 * Funzione principale per validare una prenotazione rispetto a tutte le regole.
 * @param bookingData - I dati della prenotazione da validare.
 * @param allBookings - Tutte le prenotazioni esistenti per il controllo di sovrapposizione.
 * @param settings - Le impostazioni di validazione correnti.
 * @param excludeBookingId - (Opzionale) L'ID di una prenotazione da escludere dai controlli (utile in caso di modifica).
 * @returns Un oggetto con { isValid: boolean, error: string | null }.
 */
export const validateBooking = (
  bookingData: Partial<Booking>,
  allBookings: Booking[],
  settings: ValidationSettings,
  excludeBookingId?: string
): { isValid: boolean; error: string | null } => {
  const { date, startTime, endTime, room } = bookingData;

  if (!date || !startTime || !endTime || !room) {
    return { isValid: false, error: 'Dati di prenotazione incompleti.' };
  }

  const now = new Date();
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  // Controllo preliminare coerenza orari
  if (endDateTime <= startDateTime) {
    return { isValid: false, error: 'L\'orario di fine deve essere successivo all\'orario di inizio.' };
  }

  // 1. Divieto di prenotazione nel passato (Sempre attivo per logica di base)
  if (startDateTime < now) {
    return { isValid: false, error: 'Non è possibile creare o spostare prenotazioni nel passato.' };
  }

  // 2. Controllo Anticipo Minimo (Se abilitato)
  if (settings.minAdvanceEnabled) {
      const minAdvanceMilliseconds = settings.minAdvance * 60 * 1000;
      if (startDateTime.getTime() - now.getTime() < minAdvanceMilliseconds) {
        return { isValid: false, error: `La prenotazione deve essere effettuata con almeno ${settings.minAdvance} minuti di anticipo.` };
      }
  }
  
  // Calcolo Durata
  const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);

  // 3. Controllo Durata Minima (Se abilitato)
  if (settings.minDurationEnabled) {
      if (durationMinutes < settings.minDuration) {
        return { isValid: false, error: `La durata minima della prenotazione è di ${settings.minDuration} minuti.` };
      }
  }

  // 4. Controllo Durata Massima (Se abilitato)
  if (settings.maxDurationEnabled) {
      if (durationMinutes > settings.maxDuration) {
        return { isValid: false, error: `La durata massima della prenotazione è di ${settings.maxDuration} minuti.` };
      }
  }

  // 5. Controllo Orari di Lavoro (Supporto per fasce multiple e verifica robusta)
  if (settings.workingHoursEnabled) {
    const startMinutes = startDateTime.getHours() * 60 + startDateTime.getMinutes();
    const endMinutes = endDateTime.getHours() * 60 + endDateTime.getMinutes();
    
    // Controlla se la prenotazione è interamente contenuta in ALMENO UNA delle fasce definite
    const isWithinWorkingHours = settings.workingHours.some(slot => {
      if (!slot.start || !slot.end) return false; // Salta slot malformati
      
      const [startH, startM] = slot.start.split(':').map(Number);
      const [endH, endM] = slot.end.split(':').map(Number);
      
      const slotStartMinutes = startH * 60 + startM;
      const slotEndMinutes = endH * 60 + endM;
      
      // La prenotazione deve iniziare DOPO o UGUALE all'inizio dello slot
      // E finire PRIMA o UGUALE alla fine dello slot.
      return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
    });

    if (!isWithinWorkingHours) {
      return { isValid: false, error: 'La prenotazione deve avvenire all\'interno degli orari di lavoro definiti (e non può essere a cavallo di una pausa).' };
    }
  }

  // 6. Controllo Disponibilità (sovrapposizioni) - SEMPRE ATTIVO
  const conflictingBooking = allBookings.find(b => {
    // Escludi la prenotazione corrente (se in modifica), o se non è per la stessa sala/data, o se è stata rifiutata.
    if (b.id === excludeBookingId || b.room !== room || b.date !== date || b.status === BookingStatus.REJECTED) {
      return false;
    }
    const existingStart = new Date(`${b.date}T${b.startTime}`).getTime();
    const existingEnd = new Date(`${b.date}T${b.endTime}`).getTime();
    const newStart = startDateTime.getTime();
    const newEnd = endDateTime.getTime();
    
    // Controlla se c'è una sovrapposizione
    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (conflictingBooking) {
    return { isValid: false, error: `La sala è già prenotata (o in attesa di approvazione) dalle ${conflictingBooking.startTime} alle ${conflictingBooking.endTime}.` };
  }
  
  // Se tutti i controlli passano
  return { isValid: true, error: null };
};
