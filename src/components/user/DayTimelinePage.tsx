
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Clock, CheckCircle2 } from 'lucide-react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import * as bookingService from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import BookingModal from '@/components/user/BookingModal';
import UserBookingDetailModal from '@/components/user/UserBookingDetailModal';

const SLOT_DURATION = 30;
const MAX_ROOMS_ON_DESKTOP = 5;
const ROW_HEIGHT = 60;

type FilterType = 'all' | 'mine_approved' | 'mine_pending' | 'occupied';

const DayTimelinePage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emailSettings, validationSettings } = useTheme();
  const { rooms } = useData();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState<{ room: string; startTime: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [roomPage, setRoomPage] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');

  // Calcolo dinamico orari griglia
    const { startHour, totalSlots } = useMemo(() => {
        let s = 7;
        let e = 20;

        if (validationSettings.workingHoursEnabled && validationSettings.workingHours.length > 0) {
                const starts = validationSettings.workingHours.map(w => parseInt(w.start.split(':')[0]));
                const ends = validationSettings.workingHours.map(w => {
                         const [h, m] = w.end.split(':').map(Number);
                         return m > 0 ? h + 1 : h;
                });
        
                if (starts.length > 0) s = Math.min(...starts);
                if (ends.length > 0) e = Math.max(...ends);
        }

        const slots = ((e - s) * 60) / SLOT_DURATION;
        return { startHour: s, totalSlots: slots };
    }, [validationSettings]);


  // Responsive handling for room pages could be enhanced, but keeping simple pagination for now
  const roomsPerPage = window.innerWidth < 768 ? 2 : MAX_ROOMS_ON_DESKTOP;
  const totalRoomPages = Math.ceil(rooms.length / roomsPerPage);
  const displayedRooms = rooms.slice(
    roomPage * roomsPerPage,
    (roomPage + 1) * roomsPerPage
  );

  const fetchBookings = useCallback(async () => {
    try {
      const allBookings = await bookingService.getBookings();
      setBookings(allBookings.filter(b => b.date === date && b.status !== BookingStatus.REJECTED));
    } catch (error) {
      console.error("Failed to fetch bookings for day", error);
    }
  }, [date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePrevRooms = () => setRoomPage(p => Math.max(0, p - 1));
  const handleNextRooms = () => setRoomPage(p => Math.min(totalRoomPages - 1, p + 1));

  // Check if a specific time slot is within valid working hours
  const isSlotBookable = (timeH: number, timeM: number) => {
    if (!validationSettings.workingHoursEnabled) return true;
    
    const slotTime = timeH * 60 + timeM;
    
    // Check if fully contained in AT LEAST one working interval
    // Note: Simple check: start of slot must be >= range start AND end of slot (start+30) <= range end
    return validationSettings.workingHours.some(range => {
        const [sH, sM] = range.start.split(':').map(Number);
        const [eH, eM] = range.end.split(':').map(Number);
        
        const rangeStart = sH * 60 + sM;
        const rangeEnd = eH * 60 + eM;
        const slotEnd = slotTime + SLOT_DURATION;

        return slotTime >= rangeStart && slotEnd <= rangeEnd;
    });
  };

  const handleSlotClick = (room: string, slotIndex: number) => {
    const totalMinutes = slotIndex * SLOT_DURATION;
    const hours = startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (!isSlotBookable(hours, minutes)) return;

    const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    setSelectedSlot({ room, startTime });
    setIsBookingModalOpen(true);
  };

  const handleBookingClick = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user && booking.userId === user.id) {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    }
  };

  const handleBookingSubmit = async (bookingData: { date: string; startTime: string; endTime: string; room: string; platform: string }) => {
    if (!user) return;
    try {
      await bookingService.addBooking({
        ...bookingData,
        userId: user.id,
        userName: user.name,
      }, emailSettings);
      setIsBookingModalOpen(false);
      await fetchBookings();
    } catch (error) {
      console.error('Failed to add booking:', error);
    }
  };

  const formattedDate = date 
    ? new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })
    : '';

  const timeLabels = useMemo(() => {
    return Array.from({ length: totalSlots + 1 }).map((_, i) => {
        const totalMinutes = i * SLOT_DURATION;
        const h = startHour + Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    });
  }, [totalSlots, startHour]);

  const getEventStyle = (booking: Booking) => {
    const [startH, startM] = booking.startTime.split(':').map(Number);
    const [endH, endM] = booking.endTime.split(':').map(Number);
    
    const startMinutesFromDayStart = (startH - startHour) * 60 + startM;
    const endMinutesFromDayStart = (endH - startHour) * 60 + endM;
    
    // Calculate relative to grid start
    const startRow = Math.floor(startMinutesFromDayStart / SLOT_DURATION) + 2;
    const span = Math.ceil((endMinutesFromDayStart - startMinutesFromDayStart) / SLOT_DURATION);
    
    return {
        gridRowStart: Math.max(2, startRow), // Ensure it doesn't go above grid
        gridRowEnd: `span ${span}`,
    };
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border">
          {/* --- HEADER --- */}
          <header className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card z-30">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => navigate('/calendar')}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Torna al calendario"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold capitalize text-card-foreground">{formattedDate}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Disponibilità sale</p>
              </div>
            </div>
            
            {/* Interactive Filters Legend */}
            <div className="hidden lg:flex items-center gap-2 text-sm overflow-x-auto custom-scrollbar pb-1 md:pb-0 max-w-full">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-full transition-all text-xs font-medium border whitespace-nowrap ${filter === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/50'}`}
                >
                    Tutti
                </button>
                
                <button
                    onClick={() => setFilter('mine_approved')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium border whitespace-nowrap ${filter === 'mine_approved' ? 'bg-primary/10 border-primary text-primary' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span>Tua (Approvata)</span>
                </button>
                
                <button
                    onClick={() => setFilter('mine_pending')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium border whitespace-nowrap ${filter === 'mine_pending' ? 'bg-primary/10 border-primary/60 text-primary' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60"></div>
                    <span>Tua (In attesa)</span>
                </button>

                <button
                    onClick={() => setFilter('occupied')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium border whitespace-nowrap ${filter === 'occupied' ? 'bg-accent border-border text-foreground' : 'border-transparent hover:bg-accent text-muted-foreground'}`}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-white/20 border border-border"></div>
                    <span>Occupato</span>
                </button>

                {validationSettings.workingHoursEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1.5 opacity-60 cursor-help border border-transparent whitespace-nowrap" title="Non prenotabile">
                        <div className="w-2.5 h-2.5 rounded-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0tMSwxIGwyLC0yIE0wLDQgbDQsLTQgTTMsNSBsMiwtMiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-muted/50 border border-border"></div>
                        <span className="text-xs">Chiuso</span>
                    </div>
                )}
            </div>
          </header>

          {/* --- TIMELINE CONTENT --- */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
              
              {totalRoomPages > 1 && (
                 <div className="flex justify-between items-center px-4 py-2 bg-accent/30 border-b border-border text-xs font-medium text-muted-foreground flex-shrink-0">
                    <button 
                        onClick={handlePrevRooms} 
                        disabled={roomPage === 0}
                        className="flex items-center gap-1 disabled:opacity-30 hover:text-primary py-1 px-2 rounded hover:bg-background"
                    >
                        <ChevronLeft size={14} /> Precedente
                    </button>
                    <span>Pagina {roomPage + 1}/{totalRoomPages}</span>
                    <button 
                        onClick={handleNextRooms} 
                        disabled={roomPage === totalRoomPages - 1}
                        className="flex items-center gap-1 disabled:opacity-30 hover:text-primary py-1 px-2 rounded hover:bg-background"
                    >
                        Successivo <ChevronRight size={14} />
                    </button>
                 </div>
              )}

              <div className="flex-1 overflow-auto custom-scrollbar bg-card relative">
                <div 
                    className="grid"
                    style={{
                        gridTemplateColumns: `50px repeat(${displayedRooms.length}, minmax(100px, 1fr))`,
                        gridTemplateRows: `40px repeat(${totalSlots}, ${ROW_HEIGHT}px)`,
                        minWidth: '100%', // Ensure it takes at least full width
                        width: 'max-content', // Allow it to grow if columns are wide
                    }}
                >
                    {/* 1. Room Headers (Sticky Top) */}
                    <div className="sticky top-0 left-0 z-30 bg-card border-b border-r border-border"></div>
                    {displayedRooms.map((room, i) => (
                        <div 
                            key={room} 
                            className="sticky top-0 z-20 bg-card border-b border-r border-border font-semibold text-xs md:text-sm text-card-foreground flex items-center justify-center px-2 text-center shadow-sm truncate"
                            style={{ gridColumn: i + 2 }}
                        >
                            <span className="truncate">{room}</span>
                        </div>
                    ))}

                    {/* 2. Time Labels (Sticky Left) */}
                    {timeLabels.slice(0, -1).map((time, i) => (
                        <div 
                            key={time} 
                            className="sticky left-0 z-10 bg-card border-r border-border text-[10px] md:text-xs font-mono text-muted-foreground flex items-start justify-end pr-2 pt-1"
                            style={{ gridRow: i + 2 }}
                        >
                            <span className="-mt-2">{time}</span>
                        </div>
                    ))}
                     <div 
                        className="sticky left-0 z-10 bg-card border-r border-border text-[10px] md:text-xs font-mono text-muted-foreground flex items-start justify-end pr-2"
                        style={{ gridRow: totalSlots + 2, height: 0 }} 
                    >
                        <span className="-mt-2">{timeLabels[timeLabels.length - 1]}</span>
                    </div>


                    {/* 3. Grid Lines & Clickable Slots */}
                    {displayedRooms.map((room, colIndex) => (
                        Array.from({ length: totalSlots }).map((_, rowIndex) => {
                            const totalMinutes = rowIndex * SLOT_DURATION;
                            const h = startHour + Math.floor(totalMinutes / 60);
                            const m = totalMinutes % 60;
                            const bookable = isSlotBookable(h, m);

                            return (
                                <div
                                    key={`slot-${colIndex}-${rowIndex}`}
                                    className={`border-r border-b border-border relative group transition-colors
                                        ${bookable 
                                            ? 'hover:bg-accent/40 cursor-pointer' 
                                            : 'bg-muted/30 cursor-not-allowed bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhMOD 4iIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=")]'
                                        }
                                    `}
                                    style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                                    onClick={() => handleSlotClick(room, rowIndex)}
                                >
                                   {bookable && (
                                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                            <span className="text-primary/50 text-xl font-light">+</span>
                                       </div>
                                   )}
                                </div>
                            );
                        })
                    ))}

                    {/* 4. Bookings Overlay */}
                    {bookings.map(booking => {
                        const roomIndex = displayedRooms.indexOf(booking.room);
                        if (roomIndex === -1) return null;

                        const isOwnBooking = user && booking.userId === user.id;
                        const isPending = booking.status === BookingStatus.PENDING;
                        
                        // Filter Logic
                        if (filter === 'mine_approved' && (!isOwnBooking || isPending)) return null;
                        if (filter === 'mine_pending' && (!isOwnBooking || !isPending)) return null;
                        if (filter === 'occupied' && isOwnBooking) return null;

                        const style = getEventStyle(booking);
                        
                        // Height calculation to conditionally hide details on very short events
                        const [startH, startM] = booking.startTime.split(':').map(Number);
                        const [endH, endM] = booking.endTime.split(':').map(Number);
                        const durationMinutes = ((endH - startH) * 60) + (endM - startM);
                        const isShort = durationMinutes <= 30;

                        return (
                            <div
                                key={booking.id}
                                className={`m-1 rounded md:rounded-md p-1 md:p-2 text-[10px] md:text-xs flex flex-col overflow-hidden border cursor-default shadow-sm transition-colors
                                    ${isOwnBooking 
                                        ? (isPending 
                                            ? 'bg-primary/70 text-primary-foreground border-primary/30 cursor-pointer hover:brightness-110' 
                                            : 'bg-primary text-primary-foreground border-primary/50 cursor-pointer hover:brightness-110')
                                        : 'bg-neutral-100 dark:bg-white/10 text-muted-foreground border-border dark:border-white/10'
                                    }
                                `}
                                style={{ 
                                    gridColumn: roomIndex + 2,
                                    ...style,
                                    zIndex: 5
                                }}
                                onClick={(e) => handleBookingClick(booking, e)}
                            >
                                <div className="flex items-center justify-between gap-1">
                                     <div className="font-bold truncate leading-tight">{isOwnBooking ? 'Tua' : 'Occupato'}</div>
                                     {isOwnBooking && (
                                         <div title={isPending ? "In attesa di approvazione" : "Approvata"}>
                                             {isPending ? <Clock size={12} className="opacity-80" /> : <CheckCircle2 size={12} className="opacity-80" />}
                                         </div>
                                     )}
                                </div>
                                
                                {!isShort && (
                                    <>
                                        <div className="hidden md:flex items-center gap-1 mt-0.5 opacity-90">
                                            <Clock size={10} />
                                            <span>{booking.startTime} - {booking.endTime}</span>
                                        </div>
                                        {isOwnBooking && isPending && (
                                            <div className="mt-auto pt-1 opacity-90 italic text-[9px]">
                                                In attesa...
                                            </div>
                                        )}
                                        {isOwnBooking && !isPending && (
                                             <div className="flex items-center gap-1 mt-auto pt-1 opacity-80">
                                                <User size={10} />
                                                <span className="truncate">{booking.userName}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
              </div>
          </div>
      </div>

      {/* Modals */}
      {user && (
        <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onSubmit={handleBookingSubmit}
            selectedDate={date || null}
            user={user}
            initialRoom={selectedSlot?.room}
            initialStartTime={selectedSlot?.startTime}
        />
      )}
      
      <UserBookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default DayTimelinePage;
