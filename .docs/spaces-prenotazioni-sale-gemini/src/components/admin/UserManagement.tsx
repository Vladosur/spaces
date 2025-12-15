
import React, { useState, useEffect, useMemo } from 'react';
import { User, Role } from '../../types';
import Modal from '../common/Modal';
import { Plus, Pencil, Trash2, LayoutGrid, List, UserCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

const UserManagement: React.FC = () => {
    const { defaultView } = useTheme();
    const { users, addUser, updateUser, deleteUser } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: Role.USER });
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [view, setView] = useState<'card' | 'table'>(defaultView);
    const [activeTab, setActiveTab] = useState<Role>(Role.USER);

    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);
    
    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u.name.toLowerCase() !== 'super admin')
            .filter(u => u.role === activeTab);
    }, [users, activeTab]);

    const handleOpenModal = (mode: 'add' | 'edit', user: User | null = null) => {
        setModalMode(mode);
        setCurrentUser(user);
        const defaultRole = mode === 'add' ? activeTab : (user ? user.role : Role.USER);
        setFormData(user ? { name: user.name, email: user.email, role: user.role } : { name: '', email: '', role: defaultRole });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({ name: '', email: '', role: Role.USER });
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim()) return;

        if (modalMode === 'add') {
            const newUser: User = {
                id: `u${Date.now()}`,
                ...formData
            };
            addUser(newUser);
        } else if (currentUser) {
            updateUser(currentUser.id, formData);
        }
        handleCloseModal();
    };

    const handleDelete = (userId: string) => {
        deleteUser(userId);
    };

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none";

    const RoleBadge = ({ role }: { role: Role }) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            role === Role.ADMIN 
            ? 'bg-blue-400/20 text-blue-600 dark:text-blue-400' 
            : 'bg-gray-400/20 text-gray-600 dark:text-gray-400'
        }`}>
            {role === Role.ADMIN ? 'Admin' : 'User'}
        </span>
    );

    const tabOptions = [
        { label: 'Utenti', value: Role.USER },
        { label: 'Admin', value: Role.ADMIN },
    ];

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 flex-shrink-0">
                <div>
                     <h2 className="text-2xl md:text-3xl font-bold text-foreground">Gestione Utenti</h2>
                     <p className="text-muted-foreground mt-1 text-sm">Aggiungi, modifica o elimina gli utenti che possono accedere alla piattaforma.</p>
                </div>
                <div className="flex items-center gap-4">
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
            
             <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                <div className="bg-card border border-border rounded-lg p-1.5 flex flex-wrap gap-2 w-full sm:w-auto shadow-sm">
                    {tabOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setActiveTab(option.value)}
                            className={`flex-grow sm:flex-grow-0 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === option.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto shadow-sm"
                >
                    <Plus size={20} />
                    <span>Aggiungi Utente</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 min-h-0">
                 {view === 'table' ? (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Nome</th>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Email</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Ruolo</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right w-[120px]">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium text-foreground whitespace-nowrap">{user.name}</td>
                                        <td className="p-4 text-muted-foreground whitespace-nowrap">{user.email}</td>
                                        <td className="p-4"><RoleBadge role={user.role} /></td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', user)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    aria-label={`Modifica ${user.name}`}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                    aria-label={`Elimina ${user.name}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {user.role === Role.ADMIN ? <ShieldCheck className="text-blue-500" size={24} /> : <UserCircle className="text-muted-foreground" size={24}/>}
                                        <span className="font-semibold text-foreground truncate max-w-[120px]">{user.name}</span>
                                    </div>
                                    <RoleBadge role={user.role} />
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                <div className="flex items-center gap-2 self-end mt-auto">
                                     <button
                                        onClick={() => handleOpenModal('edit', user)}
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Nessun utente trovato per questa categoria.</p>
                    </div>
                 )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-6">
                        {modalMode === 'add' ? 'Aggiungi Nuovo Utente' : 'Modifica Utente'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-muted-foreground">Nome</label>
                            <input
                                type="text"
                                id="userName"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={inputClasses}
                                placeholder="Es. Mario Rossi"
                            />
                        </div>
                         <div>
                            <label htmlFor="userEmail" className="block text-sm font-medium text-muted-foreground">Email</label>
                            <input
                                type="email"
                                id="userEmail"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={inputClasses}
                                placeholder="Es. mario.rossi@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="userRole" className="block text-sm font-medium text-muted-foreground">Ruolo</label>
                             <select 
                                id="userRole" 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value as Role})} 
                                className={inputClasses}
                            >
                                <option value={Role.USER}>User</option>
                                <option value={Role.ADMIN}>Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Annulla</button>
                        <button type="button" onClick={handleSave} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            Salva
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
