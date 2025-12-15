

import React, { useState, useMemo } from 'react';
import { DAY_NAMES, MONTH_NAMES } from '../../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '../../types';
import CalendarDayEvent from './CalendarDayEvent';

interface CalendarProps {
  onDateClick: (date: string) => void;
  bookings: Booking[];
}

const Calendar: React.FC<CalendarProps> = ({ onDateClick, bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-11-20T00:00:00'));

  const changeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const bookingsByDate = useMemo(() => {
    return bookings.reduce((acc, booking) => {
        (acc[booking.date] = acc[booking.date] || []).push(booking);
        return acc;
    }, {} as Record<string, Booking[]>);
  }, [bookings]);

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonthRaw = new Date(year, month, 1).getDay();
    // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];
    let dayCounter = 1;
    
    // Total cells is always 42 for 6 weeks
    for (let i = 0; i < 42; i++) {
        const isBeforeFirstDay = i < firstDayOfMonth;
        const isAfterLastDay = dayCounter > daysInMonth;

        if (isBeforeFirstDay || isAfterLastDay) {
            days.push(<div key={`empty-${i}`} className="border border-border bg-muted/50"></div>);
        } else {
            const day = dayCounter;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            
            const cellClasses = `border border-border relative flex flex-col cursor-pointer hover:bg-accent/50 transition-colors duration-200 ${isToday ? 'border-2 border-primary bg-primary/10' : ''}`;
            
            const dayBookings = (bookingsByDate[dateStr] || []).sort((a,b) => a.startTime.localeCompare(b.startTime));

            days.push(
                <div key={day} className={cellClasses} onClick={() => onDateClick(dateStr)}>
                    <div className="p-1">
                        <span className="font-medium text-foreground">{day}</span>
                    </div>
                    <div className="flex-1 mt-1 space-y-1 overflow-y-auto custom-scrollbar px-2 pb-2">
                        {dayBookings.map(booking => (
                            <CalendarDayEvent 
                            key={booking.id} 
                            booking={booking}
                            />
                        ))}
                    </div>
                    {/* 
                      VECCHIA LOGICA PRESERVATA COME COMMENTO
                      Questo era il trigger per la modale di prenotazione, ora gestito
                      dal click sull'intera cella che porta a una nuova pagina.

                      <div 
                          className="p-1 cursor-pointer hover:bg-accent transition-colors rounded-t-md"
                          onClick={() => onDateClick(dateStr)}
                      >
                          <span className="font-medium text-foreground">{day}</span>
                      </div>
                    */}
                </div>
            );
            dayCounter++;
        }
    }
    return days;
  };

  return (
    <div className="bg-card rounded-xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-3 md:px-8 md:py-3 border-b border-border flex-shrink-0">
        <h2 className="text-xl font-bold text-card-foreground">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Weekday Names */}
      <div className="grid grid-cols-7 px-8 pt-3 md:px-8 md:py-3 flex-shrink-0">
        {DAY_NAMES.map(day => (
          <div key={day} className="font-semibold text-center text-muted-foreground text-sm">{day}</div>
        ))}
      </div>
      
      {/* Grid of Days */}
      <div className="flex-1 overflow-hidden px-8 pt-3 pb-8 py-3 md:pt-3 md:pb-8">
        <div className="grid grid-cols-7 grid-rows-6 gap-px h-full">
          {renderCalendarGrid()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;