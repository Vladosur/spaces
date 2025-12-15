
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Pencil, Trash2, LayoutGrid, List, Users, Mail, Phone, Briefcase, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { Technician, TechnicianSpecialization } from '../../types';

const TechnicianManagement: React.FC = () => {
    const { defaultView } = useTheme();
    const { technicians, addTechnician, updateTechnician, deleteTechnician } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(null);
    
    const [formData, setFormData] = useState<Partial<Technician>>({
        name: '',
        email: '',
        phone: '',
        specialization: 'Supporto Generale'
    });

    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [view, setView] = useState<'card' | 'table'>(defaultView);

    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);

    const handleOpenModal = (mode: 'add' | 'edit', technician: Technician | null = null) => {
        setModalMode(mode);
        setCurrentTechnician(technician);
        if (technician) {
            setFormData(technician);
        } else {
            setFormData({ name: '', email: '', phone: '', specialization: 'Supporto Generale' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTechnician(null);
        setFormData({ name: '', email: '', phone: '', specialization: 'Supporto Generale' });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.email?.trim()) return;

        const techData = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone?.trim() || '',
            specialization: formData.specialization || 'Supporto Generale'
        } as Technician;

        if (modalMode === 'add') {
            addTechnician(techData);
        } else if (currentTechnician) {
            updateTechnician(currentTechnician.id, techData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        deleteTechnician(id);
    };

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors";
    const labelClasses = "block text-sm font-medium text-muted-foreground";

    const specializationColors: Record<TechnicianSpecialization, string> = {
        'Audio/Video': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        'IT & Network': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        'Allestimento': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        'Supporto Generale': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    };

    const SpecializationBadge = ({ spec }: { spec: TechnicianSpecialization }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${specializationColors[spec] || specializationColors['Supporto Generale']}`}>
            {spec}
        </span>
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Gestione Tecnici</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Gestisci le risorse, i contatti e le specializzazioni.</p>
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
            
            <div className="mt-6 flex-shrink-0">
                <button
                    onClick={() => handleOpenModal('add')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full md:w-auto shadow-sm"
                >
                    <Plus size={20} />
                    <span>Aggiungi Tecnico</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 min-h-0">
                {view === 'table' ? (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Tecnico</th>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Contatti</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Specializzazione</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right w-[120px]">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {technicians.map(tech => (
                                    <tr key={tech.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium text-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-full text-primary"><Users size={18} /></div>
                                                {tech.name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail size={14} /> <span>{tech.email}</span>
                                                </div>
                                                {tech.phone && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Phone size={14} /> <span>{tech.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <SpecializationBadge spec={tech.specialization} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', tech)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tech.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {technicians.map(tech => (
                            <div key={tech.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Users size={24}/>
                                    </div>
                                    <div className="flex items-center gap-1">
                                         <button
                                            onClick={() => handleOpenModal('edit', tech)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tech.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">{tech.name}</h3>
                                    <div className="mt-2">
                                         <SpecializationBadge spec={tech.specialization} />
                                    </div>
                                </div>

                                <div className="mt-auto space-y-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail size={14} /> <span className="truncate">{tech.email}</span>
                                    </div>
                                    {tech.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone size={14} /> <span>{tech.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSave} className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-6">
                        {modalMode === 'add' ? 'Aggiungi Nuovo Tecnico' : 'Modifica Tecnico'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className={labelClasses}>Nome e Cognome</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={`${inputClasses} pl-10`}
                                    placeholder="Es. Mario Rossi"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="email" className={labelClasses}>Email Aziendale</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={`${inputClasses} pl-10`}
                                    placeholder="mario@azienda.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className={labelClasses}>Telefono / Interno</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className={`${inputClasses} pl-10`}
                                    placeholder="+39 333..."
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="specialization" className={labelClasses}>Specializzazione</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <select
                                    id="specialization"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({...formData, specialization: e.target.value as TechnicianSpecialization})}
                                    className={`${inputClasses} pl-10`}
                                >
                                    <option value="Supporto Generale">Supporto Generale</option>
                                    <option value="Audio/Video">Audio/Video</option>
                                    <option value="IT & Network">IT & Network</option>
                                    <option value="Allestimento">Allestimento</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Annulla</button>
                        <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            Salva
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TechnicianManagement;
