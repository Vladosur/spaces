
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, Role } from '../../types';
import { LogOut, Calendar, List, ShieldCheck, LayoutGrid, Building2, Users, Share2, Sun, Moon, Settings, GanttChartSquare, UsersRound, Mail, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu = ({ onClick }: { onClick: () => void }) => {
    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "hover:bg-accent hover:text-foreground text-muted-foreground"
        }`;
    
    return (
        <ul className="space-y-1">
            <li>
                <NavLink to="/calendar" className={getLinkClass} onClick={onClick}>
                    <Calendar size={20} />
                    <span>Calendario</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/my-bookings" className={getLinkClass} onClick={onClick}>
                    <List size={20} />
                    <span>Le mie prenotazioni</span>
                </NavLink>
            </li>
        </ul>
    );
};


const AdminMenu = ({ onClick }: { onClick: () => void }) => {
    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "hover:bg-accent hover:text-foreground text-muted-foreground"
        }`;
    
    return (
        <ul className="space-y-1">
            <li>
                <NavLink to="/" className={getLinkClass} onClick={onClick}>
                    <LayoutGrid size={20} />
                    <span>Dashboard</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/calendar" className={getLinkClass} onClick={onClick}>
                    <Calendar size={20} />
                    <span>Calendario</span>
                </NavLink>
            </li>
            <li className="pt-4 mt-4 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">Gestione</p>
            </li>
             <li>
                <NavLink to="/users" className={getLinkClass} onClick={onClick}>
                    <UsersRound size={20} />
                    <span>Utenti</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/rooms" className={getLinkClass} onClick={onClick}>
                    <Building2 size={20} />
                    <span>Sale</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/technicians" className={getLinkClass} onClick={onClick}>
                    <Users size={20} />
                    <span>Tecnici</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/platforms" className={getLinkClass} onClick={onClick}>
                    <Share2 size={20} />
                    <span>Piattaforme</span>
                </NavLink>
            </li>
        </ul>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isOpen, onClose }) => {
  const isUser = user.role === Role.USER;
  const { theme, toggleTheme } = useTheme();

  const getSettingsLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 p-3 w-full rounded-lg transition-all duration-200 ${
        isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "hover:bg-accent hover:text-foreground text-muted-foreground"
        }`;

  return (
    <aside 
        className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-card text-card-foreground h-screen flex flex-col border-r border-border shadow-xl md:shadow-none
            transform transition-transform duration-300 ease-in-out md:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
    >
      <div className="flex justify-between items-center p-6">
          <div className="font-bold text-2xl text-primary hidden md:block">Spaces</div>
          
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden p-2 rounded-md hover:bg-accent text-muted-foreground ml-auto">
            <X size={24} />
          </button>
      </div>

      <div className="px-4 mb-4">
        <Link to="/profile" onClick={onClose} className="block p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors border border-border/50">
            <div className="flex items-center gap-3">
                {isUser ? (
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold uppercase shadow-sm">
                        {user.name.charAt(0)}
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-muted rounded-full flex items-center justify-center font-bold text-foreground shadow-sm border border-border">
                        <ShieldCheck size={20} />
                    </div>
                )}
                <div className="overflow-hidden">
                    <span className="font-semibold text-foreground block truncate text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground block truncate">{user.email}</span>
                </div>
            </div>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            {isUser ? 'Menu' : 'Workspace'}
        </p>
        {isUser ? <UserMenu onClick={onClose} /> : <AdminMenu onClick={onClose} />}
      </nav>

      <div className="p-4 mt-auto border-t border-border bg-card/50 backdrop-blur-sm space-y-2">
         {!isUser && (
            <div className="space-y-1 pb-2 mb-2 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3 pt-2">Impostazioni</p>
                <NavLink to="/settings" end className={getSettingsLinkClass} onClick={onClose}>
                    <Settings size={20} />
                    <span>Generali</span>
                </NavLink>
                 <NavLink to="/settings/validation" className={getSettingsLinkClass} onClick={onClose}>
                    <GanttChartSquare size={20} />
                    <span>Regole</span>
                </NavLink>
                 <NavLink to="/settings/email" className={getSettingsLinkClass} onClick={onClose}>
                    <Mail size={20} />
                    <span>Email</span>
                </NavLink>
            </div>
         )}
        <button onClick={toggleTheme} className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={onLogout} className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
