
import React from 'react';
import type { Booking } from '../../types';
import { BookingStatus } from '../../types';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface CalendarEventProps {
  booking: Booking;
  onClick: (booking: Booking) => void;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({ booking, onClick }) => {
    const { platforms } = useData();
    
    // Find platform configuration
    const platformConfig = platforms.find(p => p.name === booking.platform);
    
    // Dynamic styles based on platform config
    const borderColor = platformConfig ? platformConfig.color : '#9ca3af';
    const isPending = booking.status === BookingStatus.PENDING;

    return (
        <button
            onClick={() => onClick(booking)}
            className="p-0 m-0 border-0 bg-transparent text-left h-full w-full"
            aria-label={`Prenotazione per ${booking.room} dalle ${booking.startTime} alle ${booking.endTime}`}
        >
            <div 
                className={`bg-secondary rounded-lg h-full w-full max-w-xs p-2 flex flex-col justify-between shadow-lg border-l-4 hover:bg-accent transition-colors duration-200 cursor-pointer overflow-hidden relative group`}
                style={{ borderLeftColor: borderColor }}
            >
                
                {/* Status Badge */}
                <div className={`absolute top-1 right-1 rounded-full p-0.5 ${isPending ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' : 'bg-green-500/20 text-green-600 dark:text-green-500'}`} title={isPending ? "In attesa" : "Approvato"}>
                    {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                </div>

                <div className="pr-4">
                    <p className="font-bold text-secondary-foreground text-sm truncate">{booking.room}</p>
                    <p className="text-xs text-muted-foreground truncate">{booking.userName}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{booking.platform}</p>
                </div>
                <p className="text-xs text-muted-foreground font-mono self-end">{booking.startTime} - {booking.endTime}</p>
            </div>
        </button>
    );
};

export default CalendarEvent;
