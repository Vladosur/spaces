
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Pencil, Trash2, LayoutGrid, List, Video, Monitor, Phone, Users, Share2, Box, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import type { Platform, PlatformIcon } from '../../types';

const PlatformManagement: React.FC = () => {
    const { defaultView } = useTheme();
    const { platforms, addPlatform, updatePlatform, deletePlatform } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
    
    const [formData, setFormData] = useState<Partial<Platform>>({
        name: '',
        color: '#9ca3af',
        icon: 'box'
    });

    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [view, setView] = useState<'card' | 'table'>(defaultView);

    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);

    const handleOpenModal = (mode: 'add' | 'edit', platform: Platform | null = null) => {
        setModalMode(mode);
        setCurrentPlatform(platform);
        if (platform) {
            setFormData(platform);
        } else {
            setFormData({ name: '', color: '#9ca3af', icon: 'box' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPlatform(null);
        setFormData({ name: '', color: '#9ca3af', icon: 'box' });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;
        
        const platData = {
            name: formData.name.trim(),
            color: formData.color || '#9ca3af',
            icon: formData.icon || 'box'
        } as Platform;

        if (modalMode === 'add') {
            addPlatform(platData);
        } else if (currentPlatform) {
            updatePlatform(currentPlatform.id, platData);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        deletePlatform(id);
    };

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none";
    const labelClasses = "block text-sm font-medium text-muted-foreground mb-1";

    const availableIcons: { value: PlatformIcon, label: string, icon: React.ElementType }[] = [
        { value: 'video', label: 'Video', icon: Video },
        { value: 'monitor', label: 'Monitor', icon: Monitor },
        { value: 'users', label: 'Team', icon: Users },
        { value: 'phone', label: 'Telefono', icon: Phone },
        { value: 'share2', label: 'Condivisione', icon: Share2 },
        { value: 'box', label: 'Generico', icon: Box },
    ];

    const availableColors = [
        '#00ac47', // Green (Meet)
        '#2d8cff', // Blue (Zoom)
        '#6264a7', // Blurple (Teams)
        '#00bcf2', // Cyan (Webex)
        '#f97316', // Orange
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#9ca3af', // Grey
    ];

    const renderIcon = (iconName: PlatformIcon) => {
        const IconComponent = availableIcons.find(i => i.value === iconName)?.icon || Box;
        return <IconComponent size={20} />;
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Gestione Piattaforme</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Aggiungi, modifica o elimina le piattaforme di meeting e definisci la loro identità visiva.</p>
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
                    <span>Aggiungi Piattaforma</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 min-h-0">
                {view === 'table' ? (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Identità</th>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Nome Piattaforma</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right w-[120px]">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {platforms.map(platform => (
                                    <tr key={platform.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                             <div className="flex items-center gap-3">
                                                 <div 
                                                    className="p-2 rounded-lg text-white shadow-sm"
                                                    style={{ backgroundColor: platform.color }}
                                                 >
                                                     {renderIcon(platform.icon)}
                                                 </div>
                                             </div>
                                        </td>
                                        <td className="p-4 font-medium text-foreground whitespace-nowrap">
                                            {platform.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', platform)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    aria-label={`Modifica ${platform.name}`}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(platform.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                    aria-label={`Elimina ${platform.name}`}
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
                        {platforms.map(platform => (
                            <div key={platform.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="p-2.5 rounded-lg text-white shadow-sm"
                                        style={{ backgroundColor: platform.color }}
                                    >
                                        {renderIcon(platform.icon)}
                                    </div>
                                    <span className="font-medium text-foreground">{platform.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                     <button
                                        onClick={() => handleOpenModal('edit', platform)}
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(platform.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSave} className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-6">
                        {modalMode === 'add' ? 'Aggiungi Piattaforma' : 'Modifica Piattaforma'}
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="platformName" className={labelClasses}>Nome Piattaforma</label>
                            <input
                                type="text"
                                id="platformName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputClasses}
                                placeholder="Es. Google Meet"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Colore Identificativo</label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {availableColors.map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-10 h-10 rounded-full cursor-pointer shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-foreground ring-offset-card' : ''}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {formData.color === color && <Check size={16} className="text-white drop-shadow-md" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Icona</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                                {availableIcons.map(item => {
                                    const Icon = item.icon;
                                    const isSelected = formData.icon === item.value;
                                    return (
                                        <div
                                            key={item.value}
                                            onClick={() => setFormData({ ...formData, icon: item.value })}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-accent'}`}
                                        >
                                            <Icon size={24} />
                                            <span className="text-xs font-medium">{item.label}</span>
                                        </div>
                                    )
                                })}
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

export default PlatformManagement;
