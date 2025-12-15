
import React from 'react';
import { Booking, BookingStatus } from '../../types';

interface CalendarDayEventProps {
  booking: Booking;
}

const CalendarDayEvent: React.FC<CalendarDayEventProps> = ({ booking }) => {
    const statusConfig = {
        [BookingStatus.PENDING]: 'bg-yellow-500',
        [BookingStatus.APPROVED]: 'bg-green-500',
        [BookingStatus.REJECTED]: 'bg-red-500',
    };

    return (
        <div 
          className="p-1.5 rounded-md bg-secondary text-secondary-foreground text-xs overflow-hidden"
        >
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig[booking.status]}`}></div>
                <div className="flex-1 truncate">
                    <p className="font-medium truncate">{booking.room}</p>
                    <p className="text-muted-foreground">{booking.startTime} - {booking.endTime}</p>
                </div>
            </div>
        </div>
    );
};

export default CalendarDayEvent;
