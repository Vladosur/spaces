
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/components/common/Modal';
import type { Booking, TechnicianSpecialization } from '@/types';
import { BookingStatus } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import * as bookingService from '@/services/bookingService';
import { validateBooking } from '@/services/validationService';
import { ChevronDown, Check, AlertCircle, User as UserIcon } from 'lucide-react';


interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, data: Partial<Booking>) => Promise<void>;
  booking: Booking | null;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, onSave, booking }) => {
  const { validationSettings } = useTheme();
  const { rooms, technicians, platforms } = useData();

  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  
  // Custom dropdown state
  const [isTechnicianDropdownOpen, setIsTechnicianDropdownOpen] = useState(false);
  const technicianDropdownRef = useRef<HTMLDivElement>(null);

  // Load all bookings when modal opens to check for conflicts/availability
  useEffect(() => {
    if (isOpen) {
        const fetchBookings = async () => {
            try {
                const res = await bookingService.getBookings();
                setAllBookings(res);
            } catch (e) {
                console.error("Failed to load bookings for validation", e);
            }
        };
        fetchBookings();
    }
  }, [isOpen]);

  useEffect(() => {
    if (booking) {
      setFormData({
        room: booking.room,
        platform: booking.platform,
        startTime: booking.startTime,
        endTime: booking.endTime,
        technician: booking.technician || '',
        status: booking.status,
        date: booking.date,
      });
      setError('');
      setIsSubmitting(false);
    }
  }, [booking]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (technicianDropdownRef.current && !technicianDropdownRef.current.contains(event.target as Node)) {
        setIsTechnicianDropdownOpen(false);
      }
    };

    if (isTechnicianDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTechnicianDropdownOpen]);

  // Calculate busy technicians based on current form dates/times
  const busyTechnicians = useMemo(() => {
    const busyMap: Record<string, string> = {}; // technicianName -> roomName where busy
    
    if (!formData.date || !formData.startTime || !formData.endTime) return busyMap;

    const currentStart = new Date(`${formData.date}T${formData.startTime}`).getTime();
    const currentEnd = new Date(`${formData.date}T${formData.endTime}`).getTime();

    allBookings.forEach(b => {
        // Skip the booking currently being edited
        if (booking && b.id === booking.id) return;

        // We only care about technicians assigned to APPROVED bookings
        if (b.status !== BookingStatus.APPROVED || !b.technician) return;

        // Check date match
        if (b.date !== formData.date) return;

        const bStart = new Date(`${b.date}T${b.startTime}`).getTime();
        const bEnd = new Date(`${b.date}T${b.endTime}`).getTime();

        // Check for time overlap: (StartA < EndB) and (EndA > StartB)
        if (currentStart < bEnd && currentEnd > bStart) {
            busyMap[b.technician] = b.room;
        }
    });

    return busyMap;
  }, [allBookings, formData.date, formData.startTime, formData.endTime, booking]);


  if (!booking) return null;
    
  const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-200 disabled:opacity-50 selection:bg-primary/30";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.status === BookingStatus.APPROVED && !formData.technician) {
      setError('Per approvare la prenotazione, è necessario assegnare un tecnico.');
      setIsSubmitting(false);
      return;
    }
    
    try {
        // We use allBookings which we already fetched
        const validationResult = validateBooking(formData, allBookings, validationSettings, booking.id);

        if (!validationResult.isValid) {
            setError(validationResult.error || 'Errore di validazione sconosciuto.');
            setIsSubmitting(false);
            return;
        }

        await onSave(booking.id, formData);

    } catch(apiError) {
        console.error("API error during booking validation/submission", apiError);
        setError("Si è verificato un errore durante il salvataggio. Riprova.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const specializationBadges: Record<TechnicianSpecialization, string> = {
    'Audio/Video': 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    'IT & Network': 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'Allestimento': 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Supporto Generale': 'text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className={`p-4 md:p-8 transition-all duration-300 ${isTechnicianDropdownOpen ? 'pb-48' : 'pb-8'}`}>
        <div className="mb-6">
            <h3 className="text-2xl font-bold text-card-foreground">Gestione Richiesta</h3>
            <p className="text-sm text-muted-foreground mt-1">Modifica dettagli e stato della prenotazione.</p>
        </div>

        <div className="space-y-4 md:space-y-6">
            {/* Info Summary */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                <div>
                     <span className="text-xs font-medium text-muted-foreground uppercase">Utente</span>
                     <p className="text-sm md:text-base font-semibold text-foreground truncate">{booking.userName}</p>
                </div>
                <div>
                     <span className="text-xs font-medium text-muted-foreground uppercase">Data</span>
                     <p className="text-sm md:text-base font-semibold text-foreground capitalize">
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </p>
                </div>
            </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">Stato</label>
            <select id="status" name="status" value={formData.status || ''} onChange={handleInputChange} className={`${inputClasses} font-semibold`} required>
                <option value={BookingStatus.PENDING}>In attesa</option>
                <option value={BookingStatus.APPROVED}>Approvato</option>
                <option value={BookingStatus.REJECTED}>Rifiutato</option>
            </select>
          </div>

          <hr className="border-border" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-muted-foreground">Ora Inizio</label>
                  <input type="time" id="startTime" name="startTime" value={formData.startTime || ''} onChange={handleInputChange} className={inputClasses} required />
              </div>
              <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-muted-foreground">Ora Fine</label>
                  <input type="time" id="endTime" name="endTime" value={formData.endTime || ''} onChange={handleInputChange} className={inputClasses} required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="room" className="block text-sm font-medium text-muted-foreground">Sala</label>
                <select id="room" name="room" value={formData.room || ''} onChange={handleInputChange} className={inputClasses} required>
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="platform" className="block text-sm font-medium text-muted-foreground">Piattaforma</label>
                <select id="platform" name="platform" value={formData.platform || ''} onChange={handleInputChange} className={inputClasses} required>
                    {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
          </div>
          
          <div className="relative" ref={technicianDropdownRef}>
            <label className="block text-sm font-medium text-muted-foreground">Assegna Tecnico</label>
            
            <div 
                className={`${inputClasses} flex justify-between items-center cursor-pointer hover:bg-accent/50`}
                onClick={() => setIsTechnicianDropdownOpen(!isTechnicianDropdownOpen)}
            >
                <span className={formData.technician ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {formData.technician || (formData.status === BookingStatus.APPROVED ? 'Seleziona un tecnico (Obbligatorio)' : 'Nessun tecnico')}
                </span>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isTechnicianDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isTechnicianDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto custom-scrollbar p-1 animate-in fade-in zoom-in-95 duration-100">
                    <div 
                        className="p-3 rounded-md hover:bg-accent cursor-pointer flex items-center justify-between group transition-colors"
                        onClick={() => {
                            setFormData(prev => ({ ...prev, technician: '' }));
                            setIsTechnicianDropdownOpen(false);
                        }}
                    >
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-muted rounded-full text-muted-foreground">
                                <UserIcon size={16} />
                             </div>
                             <div className="flex flex-col">
                                <span className="font-medium text-foreground text-sm">Nessun tecnico</span>
                                <span className="text-xs text-muted-foreground">Rimuovi assegnazione</span>
                             </div>
                        </div>
                        {!formData.technician && <Check size={16} className="text-primary" />}
                    </div>
                    
                    <div className="h-px bg-border my-1 mx-2"></div>

                    {technicians.map(t => {
                        const busyRoom = busyTechnicians[t.name];
                        const isBusy = !!busyRoom;
                        const isSelected = formData.technician === t.name;
                        const badgeClass = specializationBadges[t.specialization] || specializationBadges['Supporto Generale'];

                        return (
                            <div 
                                key={t.id}
                                className={`p-3 rounded-md flex items-center justify-between transition-colors border border-transparent ${isBusy ? 'opacity-60 cursor-not-allowed bg-muted/30' : 'hover:bg-accent hover:border-border cursor-pointer'}`}
                                onClick={() => {
                                    if (!isBusy) {
                                        setFormData(prev => ({ ...prev, technician: t.name }));
                                        setIsTechnicianDropdownOpen(false);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar / Initial */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isBusy ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                                        {t.name.charAt(0)}
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-foreground text-sm">{t.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                                {t.specialization}
                                            </span>
                                        </div>
                                        
                                        <span className={`text-xs font-medium flex items-center gap-1.5 ${isBusy ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            {isBusy ? (
                                                <>Impegnato in {busyRoom}</>
                                            ) : (
                                                <>Disponibile</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && <Check size={18} className="text-primary" />}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {formData.technician && busyTechnicians[formData.technician] && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 bg-red-500/10 p-2 rounded-md border border-red-500/20">
                    <AlertCircle size={14} />
                    Attenzione: Il tecnico selezionato risulta impegnato in un'altra sala in questo orario.
                </p>
            )}
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium animate-in fade-in">{error}</div>}

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-8 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="w-full md:w-auto px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Chiudi</button>
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApprovalModal;
