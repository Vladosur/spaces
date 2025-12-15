
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { User } from '../../types';
import * as bookingService from '../../services/bookingService';
import { validateBooking } from '../../services/validationService';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: { date: string; startTime: string; endTime: string; room: string; platform: string }) => Promise<void>;
  selectedDate: string | null;
  user: User;
  initialRoom?: string;
  initialStartTime?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, selectedDate, user, initialRoom, initialStartTime }) => {
  const { validationSettings } = useTheme();
  const { rooms, platforms } = useData();

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [platform, setPlatform] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none selection:bg-primary/30 transition-colors";

  useEffect(() => {
    if (isOpen) {
      // 1. Calcolo Orario Inizio Intelligente
      let startVal = initialStartTime || '09:00';

      // Se gli orari di lavoro sono attivi e non è stato fornito un orario specifico
      if (validationSettings.workingHoursEnabled && validationSettings.workingHours.length > 0 && !initialStartTime) {
          const sortedSlots = [...validationSettings.workingHours].sort((a, b) => a.start.localeCompare(b.start));
          if (sortedSlots.length > 0 && sortedSlots[0].start) {
              startVal = sortedSlots[0].start;
          }
      }
      setStartTime(startVal);

      // 2. Calcolo Orario Fine basato su Durata Minima
      const [h, m] = startVal.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(h, m, 0, 0);
      
      const durationMinutes = validationSettings.minDuration > 0 ? validationSettings.minDuration : 60;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      
      const endVal = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      setEndTime(endVal);
      
      setRoom(initialRoom || rooms[0] || '');
      setPlatform(platforms.length > 0 ? platforms[0].name : '');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialStartTime, initialRoom, validationSettings.minDuration, validationSettings.workingHours, validationSettings.workingHoursEnabled, rooms, platforms]);

  if (!selectedDate) return null;
  
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
        const allBookings = await bookingService.getBookings();
        const bookingDataToValidate = {
            date: selectedDate,
            startTime,
            endTime,
            room,
        };
        
        const validationResult = validateBooking(bookingDataToValidate, allBookings, validationSettings);

        if (!validationResult.isValid) {
            setError(validationResult.error || 'Errore di validazione sconosciuto.');
            setIsSubmitting(false);
            return;
        }

        await onSubmit({ date: selectedDate, startTime, endTime, room, platform });

    } catch (apiError) {
        console.error("API error during booking validation/submission", apiError);
        setError("Si è verificato un errore durante la richiesta. Riprova.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 md:p-8 pb-8 md:pb-8">
        <div className="mb-6">
            <h3 className="text-2xl font-bold text-card-foreground">Nuova Prenotazione</h3>
            <p className="text-sm text-muted-foreground mt-1">Compila i dettagli per richiedere una sala.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Utente</span>
            <span className="text-base font-semibold text-foreground">{user.name}</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</span>
            <span className="text-base font-semibold text-foreground capitalize">{formattedDate}</span>
          </div>

          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-muted-foreground">Ora Inizio</label>
            <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClasses} required />
          </div>
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-muted-foreground">Ora Fine</label>
            <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClasses} required />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="room" className="block text-sm font-medium text-muted-foreground">Sala</label>
            <select id="room" value={room} onChange={e => setRoom(e.target.value)} className={inputClasses} required>
              {rooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="platform" className="block text-sm font-medium text-muted-foreground">Piattaforma</label>
            <select id="platform" value={platform} onChange={e => setPlatform(e.target.value)} className={inputClasses} required>
              {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
        
        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium animate-in fade-in">{error}</div>}

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-8">
          <button type="button" onClick={onClose} className="w-full md:w-auto px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Annulla</button>
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? 'Verifico...' : 'Conferma'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
