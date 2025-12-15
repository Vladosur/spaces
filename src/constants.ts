
import type { User, Booking, Technician, Platform } from './types';
import { Role, BookingStatus } from './types';

// Helper per generare date relative a oggi
// offset 0 = Oggi, 1 = Domani, -1 = Ieri, ecc.
const getRelativeDate = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const MOCK_USERS: Record<Role, User> = {
  [Role.USER]: { id: 'u1', name: 'Mario Rossi', email: 'mario.rossi@example.com', role: Role.USER },
  [Role.ADMIN]: { id: 'a1', name: 'Admin', email: 'admin@example.com', role: Role.ADMIN },
};

export const MOCK_APP_USERS: User[] = [
    { id: 'u1', name: 'Mario Rossi', email: 'mario.rossi@example.com', role: Role.USER },
    { id: 'a1', name: 'Admin', email: 'admin@example.com', role: Role.ADMIN },
    { id: 'u2', name: 'Luigi Verdi', email: 'luigi.verdi@example.com', role: Role.USER },
    { id: 'u3', name: 'Anna Bianchi', email: 'anna.bianchi@example.com', role: Role.USER },
    { id: 'a2', name: 'Super Admin', email: 'super.admin@example.com', role: Role.ADMIN },
];


export const MOCK_ROOMS: string[] = ['Sala Riunioni 1', 'Sala Grande', 'Sala Blu', 'Auditorium', 'Stanza Progetti', 'Focus Room', 'Sala Creativa', 'Open Space A'];

export const MOCK_PLATFORMS: Platform[] = [
  { id: 'p1', name: 'Google Meet', color: '#00ac47', icon: 'video' }, // Green
  { id: 'p2', name: 'Microsoft Teams', color: '#6264a7', icon: 'users' }, // Blurple
  { id: 'p3', name: 'Zoom', color: '#2d8cff', icon: 'monitor' }, // Blue
  { id: 'p4', name: 'Nessuna', color: '#9ca3af', icon: 'box' }, // Grey
];

export const MOCK_TECHNICIANS: Technician[] = [
    { id: 't1', name: 'Luca Video', email: 'luca.video@example.com', phone: '+39 333 1010101', specialization: 'Audio/Video', color: '#3b82f6' },
    { id: 't2', name: 'Marco Rete', email: 'marco.rete@example.com', phone: '+39 333 2020202', specialization: 'IT & Network', color: '#10b981' },
    { id: 't3', name: 'Giulia Supporto', email: 'giulia.supporto@example.com', specialization: 'Supporto Generale', color: '#f59e0b' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(0), // OGGI
    startTime: '10:00',
    endTime: '11:00',
    room: 'Sala Grande',
    platform: 'Google Meet',
    status: BookingStatus.PENDING,
    technician: null,
  },
  {
    id: 'b2',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(2), // Tra 2 giorni
    startTime: '14:30',
    endTime: '16:00',
    room: 'Sala Blu',
    platform: 'Zoom',
    status: BookingStatus.APPROVED,
    technician: 'Luca Video',
  },
  {
    id: 'b3',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(5), // Tra 5 giorni (settimana prossima)
    startTime: '09:00',
    endTime: '10:30',
    room: 'Auditorium',
    platform: 'Nessuna',
    status: BookingStatus.PENDING,
    technician: null,
  },
  {
    id: 'b4',
    userId: 'a1',
    userName: 'Luigi Verdi',
    date: getRelativeDate(0), // OGGI
    startTime: '09:00',
    endTime: '10:30',
    room: 'Sala Riunioni 1',
    platform: 'Microsoft Teams',
    status: BookingStatus.APPROVED,
    technician: 'Marco Rete',
  },
  {
    id: 'b5',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(0), // OGGI
    startTime: '11:00',
    endTime: '12:30',
    room: 'Sala Blu',
    platform: 'Zoom',
    status: BookingStatus.APPROVED,
    technician: 'Luca Video',
  },
  {
    id: 'b6',
    userId: 'a1',
    userName: 'Anna Bianchi',
    date: getRelativeDate(0), // OGGI
    startTime: '14:00',
    endTime: '17:00',
    room: 'Auditorium',
    platform: 'Nessuna',
    status: BookingStatus.APPROVED,
    technician: 'Giulia Supporto',
  },
  {
    id: 'b7',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(1), // DOMANI
    startTime: '10:00',
    endTime: '12:00',
    room: 'Sala Grande',
    platform: 'Google Meet',
    status: BookingStatus.APPROVED,
    technician: 'Luca Video',
  },
  {
    id: 'b8',
    userId: 'a1',
    userName: 'Paolo Neri',
    date: getRelativeDate(1), // DOMANI
    startTime: '15:00',
    endTime: '16:30',
    room: 'Sala Riunioni 1',
    platform: 'Nessuna',
    status: BookingStatus.APPROVED,
    technician: 'Giulia Supporto',
  },
  {
    id: 'b9',
    userId: 'a1',
    userName: 'Carla Neri',
    date: getRelativeDate(0), // OGGI
    startTime: '16:00',
    endTime: '17:30',
    room: 'Sala Riunioni 1',
    platform: 'Nessuna',
    status: BookingStatus.APPROVED,
    technician: 'Giulia Supporto',
  },
  {
    id: 'b10',
    userId: 'u1',
    userName: 'Mario Rossi',
    date: getRelativeDate(1), // DOMANI
    startTime: '16:00',
    endTime: '18:00',
    room: 'Sala Blu',
    platform: 'Zoom',
    status: BookingStatus.APPROVED,
    technician: 'Luca Video',
  },
];

export const DAY_NAMES: string[] = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const MONTH_NAMES: string[] = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];
