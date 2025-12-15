
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Sidebar from './Sidebar';
import UserDashboard from '../user/UserDashboard';
import UserBookingsPage from '../user/UserBookingsPage';
import AdminDashboard from '../admin/AdminDashboard';
import AdminGeneralCalendar from '../admin/AdminGeneralCalendar';
import RoomManagement from '../admin/RoomManagement';
import TechnicianManagement from '../admin/TechnicianManagement';
import PlatformManagement from '../admin/PlatformManagement';
import SettingsPage from '../admin/SettingsPage';
import ValidationSettingsPage from '../admin/ValidationSettingsPage';
import UserManagement from '../admin/UserManagement';
import EmailSettingsPage from '../admin/EmailSettingsPage';
import ProfilePage from '../profile/ProfilePage';
import DayTimelinePage from '../user/DayTimelinePage';
import { Menu } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return null; 
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border flex-shrink-0 z-20 shadow-sm">
        <div className="font-bold text-xl text-primary">Spaces</div>
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-accent text-foreground transition-colors">
            <Menu size={24} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        user={user} 
        onLogout={logout} 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-background flex flex-col overflow-hidden relative z-0">
        {user.role === Role.USER ? (
            <Routes>
              <Route path="/" element={<Navigate to="/calendar" replace />} />
              <Route path="/calendar" element={<UserDashboard />} />
              <Route path="/giorno/:date" element={<DayTimelinePage />} />
              <Route path="/my-bookings" element={<UserBookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        ) : (
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/calendar" element={<AdminGeneralCalendar />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/rooms" element={<RoomManagement />} />
              <Route path="/technicians" element={<TechnicianManagement />} />
              <Route path="/platforms" element={<PlatformManagement />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/validation" element={<ValidationSettingsPage />} />
              <Route path="/settings/email" element={<EmailSettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
