
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import { Booking, BookingStatus } from '../../types';
import { MONTH_NAMES } from '../../constants';
import CalendarEvent from './CalendarEvent';
import ApprovalModal from './ApprovalModal';
import { useTheme } from '../../context/ThemeContext';

const HOUR_HEIGHT = 80;

const getTimelineHours = (settings: any) => {
    if (settings.workingHoursEnabled && settings.workingHours.length > 0) {
        const starts = settings.workingHours.map((range: any) => parseInt(range.start.split(':')[0]));
        const ends = settings.workingHours.map((range: any) => {
            const [h, m] = range.end.split(':').map(Number);
            return m > 0 ? h + 1 : h;
        });
        
        const start = Math.min(...starts);
        const end = Math.max(...ends);
        // Buffer -1 hour start if possible
        return { startHour: Math.max(0, start - 1) , endHour: Math.min(24, end) };
    }
    return { startHour: 7, endHour: 20 };
}

const CalendarTimeline = React.forwardRef<HTMLDivElement, {
    bookings: (Booking & { wrapperStyle: React.CSSProperties })[];
    onEventClick: (booking: Booking) => void;
    requiredWidth: number;
    startHour: number;
    endHour: number;
    workingHours: { start: string, end: string }[];
    workingHoursEnabled: boolean;
}>(({ bookings, onEventClick, requiredWidth, startHour, endHour, workingHours, workingHoursEnabled }, ref) => {
    
    const timeToPixels = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = (hours - startHour) * 60 + minutes;
        return (totalMinutes / 60) * HOUR_HEIGHT;
    };

    const timelineHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const timelineHeight = (endHour - startHour + 1) * HOUR_HEIGHT;

    // Calculate "Non-working" zones to overlay
    const nonWorkingZones = useMemo(() => {
        if (!workingHoursEnabled || workingHours.length === 0) return [];

        const zones: { top: number; height: number }[] = [];
        const sortedRanges = [...workingHours].sort((a, b) => a.start.localeCompare(b.start));

        // Check gap before first slot
        const firstStart = sortedRanges[0].start;
        const [fsH, fsM] = firstStart.split(':').map(Number);
        const gridStartM = startHour * 60;
        const firstStartM = fsH * 60 + fsM;
        
        if (firstStartM > gridStartM) {
             zones.push({
                 top: 0,
                 height: ((firstStartM - gridStartM) / 60) * HOUR_HEIGHT
             });
        }

        // Check gaps between slots
        for (let i = 0; i < sortedRanges.length - 1; i++) {
            const currentEnd = sortedRanges[i].end;
            const nextStart = sortedRanges[i + 1].start;
            
            const [ceH, ceM] = currentEnd.split(':').map(Number);
            const [nsH, nsM] = nextStart.split(':').map(Number);

            const currentEndM = ceH * 60 + ceM;
            const nextStartM = nsH * 60 + nsM;

            if (nextStartM > currentEndM) {
                const top = ((currentEndM - (startHour * 60)) / 60) * HOUR_HEIGHT;
                const height = ((nextStartM - currentEndM) / 60) * HOUR_HEIGHT;
                zones.push({ top, height });
            }
        }
        
        // Check gap after last slot
        const lastEnd = sortedRanges[sortedRanges.length - 1].end;
        const [leH, leM] = lastEnd.split(':').map(Number);
        const lastEndM = leH * 60 + leM;
        const gridEndM = endHour * 60; // Wait, endHour is exclusive-ish in timeline logic? Usually inclusive row
        // Actually timelineHeight covers endHour - startHour + 1 hours.
        // Let's assume timeline goes up to (endHour + 1) * 60 if using +1 length? 
        // The array length is endHour - startHour + 1. If start 8, end 20. len 13. 8,9...20.
        // The height is 13 * 80. So it covers up to 21:00 physically?
        // No, let's simplify. gridEndM based on total height relative to start.
        const totalGridMinutes = ((endHour - startHour) + 1) * 60; // roughly
        
        // Better: Use pixels.
        const lastEndPixels = ((lastEndM - (startHour * 60)) / 60) * HOUR_HEIGHT;
        if (lastEndPixels < timelineHeight) {
            zones.push({
                top: lastEndPixels,
                height: timelineHeight - lastEndPixels
            });
        }

        return zones;
    }, [workingHours, workingHoursEnabled, startHour, endHour, timelineHeight]);


    const laidOutBookings = useMemo(() => {
        return bookings.map(b => {
             const top = timeToPixels(b.startTime);
             const height = timeToPixels(b.endTime) - top;
             return {
                ...b,
                wrapperStyle: {
                    ...b.wrapperStyle,
                    top: `${top}px`,
                    height: `${Math.max(height, 20)}px`,
                }
             }
        });
    }, [bookings, startHour, endHour]);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background/50">
            <div className="flex">
                <div className="w-14 flex-shrink-0 pt-8 pb-6 bg-card border-r border-border z-10">
                     <div className="relative" style={{ height: `${timelineHeight}px` }}>
                        {timelineHours.map(hour => (
                            <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="relative text-right">
                                <span className="absolute -top-3 right-2 text-muted-foreground text-xs font-mono font-medium">
                                    {String(hour).padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                     </div>
                </div>
                
                <div ref={ref} className="flex-1 overflow-x-auto custom-scrollbar pt-8 pb-6 relative">
                     <div 
                        className="relative"
                        style={{ width: `${requiredWidth}px`, height: `${timelineHeight}px` }}
                    >
                        {/* Background Grid */}
                        <div className="absolute inset-0">
                            {timelineHours.map(hour => (
                                <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="border-t border-border/50"></div>
                            ))}
                        </div>

                        {/* Non-Working Zones Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            {nonWorkingZones.map((zone, i) => (
                                <div 
                                    key={i}
                                    style={{ top: `${zone.top}px`, height: `${zone.height}px` }}
                                    className="absolute w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhMOD 4iIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] bg-muted/30 border-t border-b border-border/20"
                                ></div>
                            ))}
                        </div>

                        {/* Events */}
                        <div className="absolute inset-0">
                            {laidOutBookings.map(booking => (
                                <div key={booking.id} style={booking.wrapperStyle}>
                                    <CalendarEvent booking={booking} onClick={onEventClick} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});


const CalendarHeader: React.FC<{ liveTime: Date; }> = ({ liveTime }) => {
    return (
        <div className="flex-shrink-0 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Calendario</h2>
                    <p className="text-muted-foreground text-sm mt-1">Vista generale delle attività.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-lg font-semibold text-foreground capitalize">
                        {liveTime.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'long' })}
                    </p>
                    <p className="text-muted-foreground font-mono text-base">
                        {liveTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

const CalendarNavigation: React.FC<{
    viewDate: Date;
    selectedDate: Date;
    weekDays: Date[];
    onChangeMonth: (delta: number) => void;
    onChangeWeek: (delta: number) => void;
    onDayClick: (day: Date) => void;
    viewMode: 'week' | 'day';
    onSetViewMode: (mode: 'week' | 'day') => void;
    onChangeDay: (delta: number) => void;
}> = ({ viewDate, selectedDate, weekDays, onChangeMonth, onChangeWeek, onDayClick, viewMode, onSetViewMode, onChangeDay }) => (
    <div className="flex-shrink-0 border-b border-border bg-card/50">
        <div className="w-full mx-auto p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2 md:gap-4 bg-muted/30 p-1 rounded-lg border border-border/50">
                    <button onClick={() => viewMode === 'week' ? onChangeMonth(-1) : onChangeDay(-1)} className="p-1.5 rounded-md hover:bg-card hover:text-primary shadow-sm transition-all"><ChevronLeft size={18} /></button>
                    <span className="text-base md:text-lg font-semibold w-40 md:w-56 text-center capitalize">
                        {viewMode === 'week'
                            ? `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`
                            : selectedDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => viewMode === 'week' ? onChangeMonth(1) : onChangeDay(1)} className="p-1.5 rounded-md hover:bg-card hover:text-primary shadow-sm transition-all"><ChevronRight size={18} /></button>
                </div>
                <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                    <button
                        onClick={() => onSetViewMode('week')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-background text-primary shadow-sm' : 'hover:text-primary text-muted-foreground'}`}>
                        Settimana
                    </button>
                    <button
                        onClick={() => onSetViewMode('day')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-background text-primary shadow-sm' : 'hover:text-primary text-muted-foreground'}`}>
                        Giorno
                    </button>
                </div>
            </div>
            {viewMode === 'week' && (
                <div className="flex items-center">
                    <button onClick={() => onChangeWeek(-1)} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft size={20} /></button>
                    <div className="grid grid-cols-7 w-full gap-1 px-2">
                        {weekDays.map(day => {
                            const isSelected = day.toDateString() === selectedDate.toDateString();
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => onDayClick(day)}
                                    className={`py-2 rounded-lg text-center transition-all duration-200 ${isSelected ? 'bg-primary text-primary-foreground shadow-md transform scale-105' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
                                >
                                    <p className="text-[10px] uppercase tracking-wide opacity-80">{day.toLocaleDateString('it-IT', { weekday: 'short' })}</p>
                                    <p className="font-bold text-lg leading-tight">{day.getDate()}</p>
                                </button>
                            )
                        })}
                    </div>
                    <button onClick={() => onChangeWeek(1)} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronRight size={20} /></button>
                </div>
            )}
        </div>
    </div>
);

const AdminGeneralCalendar: React.FC = () => {
    const { defaultCalendarView, validationSettings, emailSettings } = useTheme();
    const [liveTime, setLiveTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [viewMode, setViewMode] = useState<'week' | 'day'>(defaultCalendarView);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Recalculate bounds when validationSettings changes
    const {startHour, endHour} = useMemo(() => getTimelineHours(validationSettings), [validationSettings]);
    
    const timeStringToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const timelineContainerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const observer = new ResizeObserver(entries => {
                if (entries[0]) {
                    setContainerWidth(entries[0].contentRect.width);
                }
            });
            observer.observe(node);
            return () => observer.disconnect();
        }
    }, []);

    useEffect(() => {
        setViewMode(defaultCalendarView);
    }, [defaultCalendarView]);

    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchBookings = useCallback(async () => {
        const allBookings = await bookingService.getBookings();
        // Modified: Show PENDING bookings as well, exclude only REJECTED
        setBookings(allBookings.filter(b => b.status !== BookingStatus.REJECTED));
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleEventClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleBookingUpdate = async (bookingId: string, updates: Partial<Booking>) => {
        await bookingService.updateBooking(bookingId, updates, emailSettings);
        handleModalClose();
        fetchBookings();
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        if (viewDate.getDate() !== newDate.getDate() && newDate.getMonth() !== (viewDate.getMonth() + delta + 12) % 12) {
            newDate.setDate(0);
        }
        setViewDate(newDate);
        setSelectedDate(newDate);
    };
    
    const changeWeek = (delta: number) => {
        const newViewDate = new Date(viewDate);
        newViewDate.setDate(newViewDate.getDate() + (7 * delta));
        setViewDate(newViewDate);

        const newSelectedDate = new Date(selectedDate);
        newSelectedDate.setDate(newSelectedDate.getDate() + (7 * delta));
        setSelectedDate(newSelectedDate);
    }
    
    const changeDay = (delta: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + delta);
        setSelectedDate(newDate);
        setViewDate(newDate);
    };
    
    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    }

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(viewDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });
    }, [viewDate]);

    const todaysBookings = useMemo(() => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        return bookings.filter(b => b.date === dateStr);
    }, [bookings, selectedDate]);
    
    const { laidOutBookings, requiredWidth } = useMemo(() => {
        if (containerWidth === 0) return { laidOutBookings: [], requiredWidth: 0 };

        const sortedBookings = todaysBookings
            .map(b => ({
                ...b,
                startMinutes: timeStringToMinutes(b.startTime),
                endMinutes: timeStringToMinutes(b.endTime),
            }))
            .sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);
    
        const layoutDetails: { booking: typeof sortedBookings[0]; col: number; numCols: number }[] = [];
        const processedBookingIds = new Set<string>();

        for (const booking of sortedBookings) {
            if (processedBookingIds.has(booking.id)) continue;
    
            const group: typeof sortedBookings = [];
            const queue = [booking];
            processedBookingIds.add(booking.id);
            
            let head = 0;
            while(head < queue.length){
                const current = queue[head++];
                group.push(current);
                
                for (const other of sortedBookings) {
                    if (!processedBookingIds.has(other.id)) {
                        if (current.endMinutes > other.startMinutes && current.startMinutes < other.endMinutes) {
                            queue.push(other);
                            processedBookingIds.add(other.id);
                        }
                    }
                }
            }
            
            group.sort((a,b) => a.startMinutes - b.startMinutes);
            
            const columns: number[] = [];
            const bookingToColMap = new Map<string, number>();
    
            for (const eventInGroup of group) {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    if (eventInGroup.startMinutes >= columns[i]) {
                        columns[i] = eventInGroup.endMinutes;
                        bookingToColMap.set(eventInGroup.id, i);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    bookingToColMap.set(eventInGroup.id, columns.length);
                    columns.push(eventInGroup.endMinutes);
                }
            }
    
            const numCols = columns.length;
            group.forEach(b => layoutDetails.push({ booking: b, col: bookingToColMap.get(b.id)!, numCols }));
        }
    
        let maxRequiredWidth = containerWidth;
        const EVENT_MIN_WIDTH_PX = 150;
        const EVENT_MAX_WIDTH_PX = 320;
        const GAP_PX = 5;
    
        const finalBookings = layoutDetails.map(({ booking, col, numCols }) => {
            const availableWidthForGroup = containerWidth - (numCols - 1) * GAP_PX;
            let eventWidth = availableWidthForGroup / numCols;
            
            eventWidth = Math.min(eventWidth, EVENT_MAX_WIDTH_PX);
            
            if (eventWidth < EVENT_MIN_WIDTH_PX) {
                eventWidth = EVENT_MIN_WIDTH_PX;
                maxRequiredWidth = Math.max(maxRequiredWidth, numCols * eventWidth + (numCols - 1) * GAP_PX);
            }
    
            const left = col * (eventWidth + GAP_PX);
            
            const wrapperStyle: React.CSSProperties = {
                width: `${eventWidth}px`,
                left: `${left}px`,
                position: 'absolute'
            };
            return { ...booking, wrapperStyle };
        });
    
        return { laidOutBookings: finalBookings, requiredWidth: Math.ceil(maxRequiredWidth) };
    }, [todaysBookings, containerWidth]);

    return (
        <div className="flex flex-col h-full p-4 md:p-6 overflow-hidden">
            <CalendarHeader liveTime={liveTime} />
            
            <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border">
                <CalendarNavigation 
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    weekDays={weekDays}
                    onChangeMonth={changeMonth}
                    onChangeWeek={changeWeek}
                    onDayClick={handleDayClick}
                    viewMode={viewMode}
                    onSetViewMode={setViewMode}
                    onChangeDay={changeDay}
                />
                <CalendarTimeline
                    ref={timelineContainerRef}
                    bookings={laidOutBookings}
                    onEventClick={handleEventClick}
                    requiredWidth={requiredWidth}
                    startHour={startHour}
                    endHour={endHour}
                    workingHours={validationSettings.workingHours}
                    workingHoursEnabled={validationSettings.workingHoursEnabled}
                />
            </div>

            <ApprovalModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleBookingUpdate}
                booking={selectedBooking}
            />
        </div>
    );
};

export default AdminGeneralCalendar;
