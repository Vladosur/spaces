import React from 'react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';

interface BookingTableProps {
  bookings: Booking[];
  onRowClick: (booking: Booking) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, onRowClick }) => {

    const getStatusPill = (status: BookingStatus) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap";
        switch (status) {
            case BookingStatus.PENDING:
                return <span className={`${baseClasses} bg-yellow-400/20 text-yellow-600 dark:text-yellow-400`}>In attesa</span>;
            case BookingStatus.APPROVED:
                return <span className={`${baseClasses} bg-green-400/20 text-green-700 dark:text-green-400`}>Approvato</span>;
            case BookingStatus.REJECTED:
                return <span className={`${baseClasses} bg-red-400/20 text-red-700 dark:text-red-400`}>Rifiutato</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="p-4 font-semibold text-muted-foreground">Utente</th>
                        <th className="p-4 font-semibold text-muted-foreground">Sala</th>
                        <th className="p-4 font-semibold text-muted-foreground">Data</th>
                        <th className="p-4 font-semibold text-muted-foreground">Orario</th>
                        <th className="p-4 font-semibold text-muted-foreground">Piattaforma</th>
                        <th className="p-4 font-semibold text-muted-foreground">Stato</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {bookings.map(booking => (
                        <tr 
                            key={booking.id} 
                            onClick={() => onRowClick(booking)}
                            className="hover:bg-muted transition-colors cursor-pointer"
                        >
                            <td className="p-4 font-medium text-foreground">{booking.userName}</td>
                            <td className="p-4 text-muted-foreground">{booking.room}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(booking.date)}</td>
                            <td className="p-4 text-muted-foreground">{booking.startTime} - {booking.endTime}</td>
                            <td className="p-4 text-muted-foreground">{booking.platform}</td>
                            <td className="p-4">{getStatusPill(booking.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookingTable;