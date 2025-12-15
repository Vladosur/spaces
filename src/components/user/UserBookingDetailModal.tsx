
import React from 'react';
import Modal from '@/components/common/Modal';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import { User, Calendar, Clock, Tv, Wrench } from 'lucide-react';

interface UserBookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const UserBookingDetailModal: React.FC<UserBookingDetailModalProps> = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const statusConfig = {
    [BookingStatus.PENDING]: {
      pill: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
      text: 'In attesa',
    },
    [BookingStatus.APPROVED]: {
      pill: 'bg-green-400/20 text-green-700 dark:text-green-400',
      text: 'Approvato',
    },
    [BookingStatus.REJECTED]: {
      pill: 'bg-red-400/20 text-red-700 dark:text-red-400',
      text: 'Rifiutato',
    },
  };

  const config = statusConfig[booking.status];
  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-foreground text-sm md:text-base">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 md:p-8 pb-8 md:pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 md:mb-8">
          <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-card-foreground leading-tight">{booking.room}</h3>
              <p className="text-sm text-muted-foreground mt-1">Dettagli completi della prenotazione.</p>
          </div>
          <div className="self-start">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-sm ${config.pill}`}>
                {config.text}
              </span>
          </div>
        </div>

        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <DetailItem icon={Calendar} label="Data" value={formattedDate} />
            <DetailItem icon={Clock} label="Orario" value={`${booking.startTime} - ${booking.endTime}`} />
            <DetailItem icon={Tv} label="Piattaforma" value={booking.platform} />
            {booking.technician && <DetailItem icon={Wrench} label="Tecnico" value={booking.technician} />}
            <div className="md:col-span-2">
                <DetailItem icon={User} label="Richiesto da" value={booking.userName} />
            </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserBookingDetailModal;
