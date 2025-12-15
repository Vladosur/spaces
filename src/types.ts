
export const Role = {
  USER: 'user',
  ADMIN: 'admin',
} as const;
export type Role = (typeof Role)[keyof typeof Role];


export const BookingStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type TechnicianSpecialization = 'Audio/Video' | 'IT & Network' | 'Allestimento' | 'Supporto Generale';

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: TechnicianSpecialization;
  color?: string;
}

export type PlatformIcon = 'video' | 'monitor' | 'phone' | 'users' | 'share2' | 'box';

export interface Platform {
  id: string;
  name: string;
  color: string;
  icon: PlatformIcon;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  platform: string;
  status: BookingStatus;
  technician: string | null; // Stores the Technician Name
}
