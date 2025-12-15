
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, ShieldCheck } from 'lucide-react';
import { Role } from '../../types';
import EmailChangeModal from './EmailChangeModal';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    
    // State for editable fields
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [nameFeedback, setNameFeedback] = useState('');
    const [passwordFeedback, setPasswordFeedback] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    if (!user) {
        return null; // or a loading component
    }

    const handleNameSave = (e: React.FormEvent) => {
        e.preventDefault();
        setNameFeedback('');
        if (name.trim() && name.trim() !== user.name) {
            updateUser({ name: name.trim() });
            setNameFeedback('Nome aggiornato con successo!');
            setTimeout(() => setNameFeedback(''), 3000);
        }
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordFeedback('');
        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordFeedback('Tutti i campi sono obbligatori.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordFeedback('Le nuove password non coincidono.');
            return;
        }
        if (newPassword.length < 8) {
             setPasswordFeedback('La nuova password deve essere di almeno 8 caratteri.');
             return;
        }

        // --- SIMULATION ---
        console.log('Password change requested:', { currentPassword, newPassword });
        setPasswordFeedback('Password aggiornata con successo! (Simulazione)');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordFeedback(''), 3000);
    };

    const isUser = user.role === Role.USER;
    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors";

    return (
        <>
            <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
                <header className="mb-6 flex-shrink-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Profilo</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Gestisci le tue informazioni personali e le impostazioni di sicurezza.</p>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
                        {/* Personal Info Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-full flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-4xl uppercase">
                                         {isUser ? user.name.charAt(0) : <ShieldCheck size={48} />}
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 bg-secondary p-2 rounded-full border-2 border-card hover:bg-muted transition-colors" aria-label="Cambia avatar">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-card-foreground">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                 <span className={`mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    user.role === Role.ADMIN 
                                    ? 'bg-blue-400/20 text-blue-600 dark:text-blue-400' 
                                    : 'bg-gray-400/20 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {user.role === Role.ADMIN ? 'Admin' : 'User'}
                                </span>
                            </div>
                        </div>

                        {/* Forms Card */}
                        <div className="lg:col-span-2 space-y-8">
                             {/* Edit Info Form */}
                            <form onSubmit={handleNameSave} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                <h3 className="text-xl font-semibold text-card-foreground">Informazioni Personali</h3>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">Nome Completo</label>
                                        <input type="text" id="fullName" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Indirizzo Email</label>
                                        <div className="flex items-center gap-2">
                                            <input type="email" id="email" value={user.email} disabled className={`${inputClasses} opacity-60 cursor-not-allowed flex-1`} />
                                            <button 
                                                type="button" 
                                                onClick={() => setIsEmailModalOpen(true)}
                                                className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors mt-1"
                                            >
                                                Modifica
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex items-center justify-end gap-4 mt-6">
                                    {nameFeedback && <p className="text-sm text-green-500">{nameFeedback}</p>}
                                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50" disabled={name.trim() === user.name || name.trim() === ''}>
                                        Salva Modifiche
                                    </button>
                                </div>
                            </form>

                            {/* Change Password Form */}
                             <form onSubmit={handlePasswordSave} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                <h3 className="text-xl font-semibold text-card-foreground">Sicurezza Account</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Modifica la tua password di accesso.
                                </p>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-muted-foreground">Password Attuale</label>
                                        <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground">Nuova Password</label>
                                        <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} />
                                    </div>
                                     <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground">Conferma Nuova Password</label>
                                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-4 mt-6">
                                    {passwordFeedback && <p className={`text-sm ${passwordFeedback.includes('successo') ? 'text-green-500' : 'text-red-500'}`}>{passwordFeedback}</p>}
                                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                        Cambia Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <EmailChangeModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setIsEmailModalOpen(false)} 
            />
        </>
    );
};
export default ProfilePage;
