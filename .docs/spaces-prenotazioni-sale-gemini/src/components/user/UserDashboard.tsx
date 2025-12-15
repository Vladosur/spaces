
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import { Booking } from '../../types';
import * as bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const fetchBookings = useCallback(async () => {
      try {
          const allBookings = await bookingService.getBookings();
          setBookings(allBookings);
      } catch (error) {
          console.error("Failed to fetch all bookings", error);
      }
  }, []);

  useEffect(() => {
      fetchBookings();
  }, [fetchBookings]);

  const handleDayCellClick = (date: string) => {
    navigate(`/giorno/${date}`);
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 bg-background">
      <div className="flex-1 flex flex-col overflow-hidden shadow-sm rounded-xl border border-border">
        <Calendar 
          onDateClick={handleDayCellClick}
          bookings={bookings} 
        />
      </div>
    </div>
  );
};

export default UserDashboard;
