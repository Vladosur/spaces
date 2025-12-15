
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import * as bookingService from '@/services/bookingService';
import BookingCard from '@/components/admin/BookingCard';
import BookingTable from '@/components/admin/BookingTable';
import ApprovalModal from '@/components/admin/ApprovalModal';
import { LayoutGrid, List } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

type FilterType = BookingStatus | 'all';

const AdminDashboard: React.FC = () => {
  const { defaultView, emailSettings } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterType>(BookingStatus.PENDING);
  const [view, setView] = useState<'card' | 'table'>(defaultView);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const allBookings = await bookingService.getBookings();
      setBookings(allBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

  const filteredBookings = useMemo(() => {
    if (filter === 'all') {
      return bookings;
    }
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const handleCardClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleSave = async (bookingId: string, data: Partial<Booking>) => {
    try {
      await bookingService.updateBooking(bookingId, data, emailSettings);
      setIsModalOpen(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (error) {
      console.error('Failed to process booking:', error);
    }
  };
  
  const filterOptions: { label: string; value: FilterType }[] = [
      { label: 'Tutte', value: 'all' },
      { label: 'In attesa', value: BookingStatus.PENDING },
      { label: 'Approvate', value: BookingStatus.APPROVED },
      { label: 'Rifiutate', value: BookingStatus.REJECTED },
  ];

  return (
    <>
      <main className="flex flex-col h-full p-4 md:p-6 overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 flex-shrink-0">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground text-sm mt-1">Panoramica delle richieste e stato prenotazioni.</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-card p-1 rounded-lg border border-border shadow-sm">
                     <button 
                        onClick={() => setView('card')}
                        className={`p-2 rounded-md transition-colors ${view === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        aria-label="Vista a card"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={() => setView('table')}
                        className={`p-2 rounded-md transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        aria-label="Vista a tabella"
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </header>

        <div className="bg-card border border-border rounded-xl p-2 flex flex-wrap gap-2 mb-6 flex-shrink-0 shadow-sm">
            {filterOptions.map(option => (
                <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex-grow md:flex-grow-0 ${filter === option.value ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                    {option.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 rounded-xl">
             {isLoading ? (
              <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground animate-pulse">Caricamento prenotazioni...</p>
              </div>
            ) : filteredBookings.length > 0 ? (
                view === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                        {filteredBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} onClick={() => handleCardClick(booking)} />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar rounded-xl border border-border bg-card shadow-sm">
                       <BookingTable bookings={filteredBookings} onRowClick={handleCardClick} />
                    </div>
                )
            ) : (
               <div className="flex flex-col items-center justify-center h-64 bg-card/50 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground">Nessuna prenotazione trovata con lo stato selezionato.</p>
               </div>
            )}
        </div>
      </main>

      <ApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        booking={selectedBooking}
      />
    </>
  );
};

export default AdminDashboard;
