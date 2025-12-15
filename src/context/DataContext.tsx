
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MOCK_ROOMS, MOCK_TECHNICIANS, MOCK_PLATFORMS, MOCK_APP_USERS } from '@/constants';
import type { User, Technician, Platform, PlatformIcon } from '@/types';

interface DataContextType {
  rooms: string[];
  addRoom: (name: string) => void;
  updateRoom: (oldName: string, newName: string) => void;
  deleteRoom: (name: string) => void;

  technicians: Technician[];
  addTechnician: (tech: Omit<Technician, 'id'>) => void;
  updateTechnician: (id: string, updatedData: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;

  platforms: Platform[];
  addPlatform: (tech: Omit<Platform, 'id'>) => void;
  updatePlatform: (id: string, updatedData: Partial<Platform>) => void;
  deletePlatform: (id: string) => void;

  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updatedData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or constants
  const [rooms, setRooms] = useState<string[]>(() => {
    const saved = localStorage.getItem('app_rooms');
    return saved ? JSON.parse(saved) : MOCK_ROOMS;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('app_technicians');
    try {
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                return MOCK_TECHNICIANS;
            }
            return parsed;
        }
    } catch (e) {
        console.error("Error parsing technicians", e);
    }
    return MOCK_TECHNICIANS;
  });

  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const saved = localStorage.getItem('app_platforms');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration logic: if we detect an array of strings (old data), convert to objects
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            console.warn("Migrating legacy platforms data...");
            return parsed.map((pName: string) => ({
                id: `migrated_${Date.now()}_${Math.random()}`,
                name: pName,
                color: '#9ca3af', // Default grey
                icon: 'box' as PlatformIcon
            }));
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing platforms", e);
    }
    return MOCK_PLATFORMS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : MOCK_APP_USERS;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('app_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('app_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('app_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  // Room Actions
  const addRoom = (name: string) => {
    if (!rooms.includes(name)) setRooms([...rooms, name]);
  };
  const updateRoom = (oldName: string, newName: string) => {
    setRooms(rooms.map(r => r === oldName ? newName : r));
  };
  const deleteRoom = (name: string) => {
    setRooms(rooms.filter(r => r !== name));
  };

  // Technician Actions
  const addTechnician = (tech: Omit<Technician, 'id'>) => {
      const newTech: Technician = { ...tech, id: `t${Date.now()}` };
      setTechnicians([...technicians, newTech]);
  };
  const updateTechnician = (id: string, updatedData: Partial<Technician>) => {
    setTechnicians(technicians.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };
  const deleteTechnician = (id: string) => {
    setTechnicians(technicians.filter(t => t.id !== id));
  };

  // Platform Actions
  const addPlatform = (platform: Omit<Platform, 'id'>) => {
    const newPlatform: Platform = { ...platform, id: `p${Date.now()}` };
    setPlatforms([...platforms, newPlatform]);
  };
  const updatePlatform = (id: string, updatedData: Partial<Platform>) => {
    setPlatforms(platforms.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };
  const deletePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
  };

  // User Actions
  const addUser = (user: User) => {
    setUsers([...users, user]);
  };
  const updateUser = (id: string, updatedData: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };
  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <DataContext.Provider value={{
      rooms, addRoom, updateRoom, deleteRoom,
      technicians, addTechnician, updateTechnician, deleteTechnician,
      platforms, addPlatform, updatePlatform, deletePlatform,
      users, addUser, updateUser, deleteUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
