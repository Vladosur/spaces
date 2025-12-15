
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';
import { MOCK_APP_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    // In a real app, this would be an API call validating credentials.
    // Here we simulate fetching from the "Database" (localStorage) or fallback to constants.
    let availableUsers = MOCK_APP_USERS;
    try {
      const storedUsers = localStorage.getItem('app_users');
      if (storedUsers) {
        availableUsers = JSON.parse(storedUsers);
      }
    } catch (e) {
      console.error("Error reading users for auth", e);
    }

    // Simple simulation: Find the first user with the requested role
    const foundUser = availableUsers.find(u => u.role === role);
    
    if (foundUser) {
        setUser(foundUser);
    } else {
        // Fallback if no user of that role exists in DB (should not happen with mocks)
        setUser({ 
            id: 'temp', 
            name: role === Role.ADMIN ? 'Admin Temp' : 'User Temp', 
            email: 'temp@example.com', 
            role 
        });
    }
  };

  const logout = () => {
    setUser(null);
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => (prevUser ? { ...prevUser, ...updatedData } : null));
    
    // Also update the "Database" to keep consistency during session
    if (user) {
         try {
            const storedUsersStr = localStorage.getItem('app_users');
            let storedUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : MOCK_APP_USERS;
            const updatedUsers = storedUsers.map(u => u.id === user.id ? { ...u, ...updatedData } : u);
            localStorage.setItem('app_users', JSON.stringify(updatedUsers));
         } catch (e) {
             console.error("Error updating user in DB during session update", e);
         }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
