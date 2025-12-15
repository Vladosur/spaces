
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import { INITIAL_BOOKINGS } from '@/constants';
import type { EmailSettings } from '@/context/ThemeContext';

// Load from localStorage if available, otherwise use defaults
const loadBookings = (): Booking[] => {
    try {
        const stored = localStorage.getItem('app_bookings');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load bookings from localStorage", e);
    }
    return [...INITIAL_BOOKINGS];
};

const saveBookings = (bookings: Booking[]) => {
    try {
        localStorage.setItem('app_bookings', JSON.stringify(bookings));
    } catch (e) {
        console.error("Failed to save bookings to localStorage", e);
    }
};

let bookings: Booking[] = loadBookings();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const compileEmailTemplate = (template: string, booking: Booking): string => {
    let message = template;
    
    // Handle Date
    if (message.includes('{{date}}')) {
         const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
         message = message.replace(/{{date}}/g, formattedDate);
    }

    // Handle Status
    if (message.includes('{{status}}')) {
        const readableStatus = booking.status === BookingStatus.APPROVED ? 'approvata' : 
                               booking.status === BookingStatus.REJECTED ? 'rifiutata' : 'in attesa';
        message = message.replace(/{{status}}/g, readableStatus);
    }

    // Handle other fields
    const simpleFields: (keyof Booking)[] = ['userName', 'room', 'startTime', 'endTime', 'technician', 'platform'];
    simpleFields.forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        if (message.match(regex)) {
            const val = booking[key];
            message = message.replace(regex, val ? String(val) : '');
        }
    });

    return message;
};

export const getMockBookingForPreview = (): Booking => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    return {
        id: 'preview-mock',
        userId: 'u1',
        userName: 'Mario Rossi',
        email: 'mario.rossi@example.com', // Aggiunto campo email che mancava nel mock ma potrebbe servire
        date: dateStr,
        startTime: '10:00',
        endTime: '12:00',
        room: 'Sala Conferenze A',
        platform: 'Zoom',
        status: BookingStatus.APPROVED,
        technician: 'Tecnico Supporto'
    } as Booking; // Cast necessario se l'interfaccia Booking è rigida su campi opzionali
};


export const getBookings = async (): Promise<Booking[]> => {
  await delay(300);
  // Reload to ensure sync between tabs in a real app scenario (simulated)
  bookings = loadBookings();
  return [...bookings];
};

export const addBooking = async (newBookingData: Omit<Booking, 'id' | 'status' | 'technician'>, emailSettings: EmailSettings): Promise<Booking> => {
  await delay(500);
  const newBooking: Booking = {
    ...newBookingData,
    id: `b${Date.now()}`,
    status: BookingStatus.PENDING,
    technician: null,
  };
  bookings.push(newBooking);
  saveBookings(bookings);

  if (emailSettings.notifyUserOnRequest) {
    const emailBody = compileEmailTemplate(emailSettings.userRequestTemplate, newBooking);
    console.log("--- SIMULAZIONE INVIO EMAIL (Utente) ---");
    console.log("A: user@example.com");
    console.log("Oggetto: Conferma richiesta di prenotazione");
    console.log("---");
    console.log(emailBody);
    console.log("-----------------------------------------");
  }

  return newBooking;
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>, emailSettings: EmailSettings): Promise<Booking | null> => {
  await delay(500);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) {
    return null;
  }

  const originalBooking = bookings[bookingIndex];
  const wasPending = originalBooking.status === BookingStatus.PENDING;

  const updatedBooking = {
    ...originalBooking,
    ...updates,
  };
  bookings[bookingIndex] = updatedBooking;
  saveBookings(bookings);

  const isNowApproved = updatedBooking.status === BookingStatus.APPROVED;
  const isNowRejected = updatedBooking.status === BookingStatus.REJECTED;

  if (wasPending && isNowApproved && updatedBooking.technician && emailSettings.notifyTechnicianOnAssignment) {
      const emailBody = compileEmailTemplate(emailSettings.technicianAssignmentTemplate, updatedBooking);
      console.log("--- SIMULAZIONE INVIO EMAIL (Tecnico) ---");
      console.log("A: tecnico@example.com");
      console.log("Oggetto: Nuova assegnazione prenotazione");
      console.log("---");
      console.log(emailBody);
      console.log("-----------------------------------------");
  }
  
  if (wasPending && (isNowApproved || isNowRejected) && emailSettings.notifyUserOnStatusChange) {
      const emailBody = compileEmailTemplate(emailSettings.statusChangeTemplate, updatedBooking);
      const subject = `Aggiornamento stato prenotazione: ${updatedBooking.status === BookingStatus.APPROVED ? 'Approvata' : 'Rifiutata'}`;
      console.log(`--- SIMULAZIONE INVIO EMAIL (Utente - ${updatedBooking.status === BookingStatus.APPROVED ? 'Approvazione' : 'Rifiuto'}) ---`);
      console.log("A: user@example.com");
      console.log(`Oggetto: ${subject}`);
      console.log("---");
      console.log(emailBody);
      console.log("-----------------------------------------");
  }

  return updatedBooking;
};
