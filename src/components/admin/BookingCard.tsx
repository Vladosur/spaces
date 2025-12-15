import React from 'react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import { User, Calendar, Clock, Tv, Wrench } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick }) => {
    const statusConfig = {
        [BookingStatus.PENDING]: {
            gradient: 'from-yellow-500/50 to-orange-500/50',
            pill: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
            text: 'In attesa',
        },
        [BookingStatus.APPROVED]: {
            gradient: 'from-green-500/50 to-teal-500/50',
            pill: 'bg-green-400/20 text-green-700 dark:text-green-400',
            text: 'Approvato',
        },
        [BookingStatus.REJECTED]: {
            gradient: 'from-red-500/50 to-pink-500/50',
            pill: 'bg-red-400/20 text-red-700 dark:text-red-400',
            text: 'Rifiutato',
        },
    };

    const config = statusConfig[booking.status];
    const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl cursor-pointer group bg-card/60 backdrop-blur-xl border border-border"
      onClick={onClick}
    >
        <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-tr ${config.gradient} rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
        
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-foreground pr-4">{booking.room}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${config.pill}`}>
                    {config.text}
                </span>
            </div>

            <div className="w-full h-px bg-border my-4"></div>
            
            <div className="space-y-3 text-sm flex-grow">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{booking.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tv size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{booking.platform}</span>
                </div>
                 {booking.technician && (
                    <div className="flex items-center gap-2">
                        <Wrench size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{booking.technician}</span>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default BookingCard;