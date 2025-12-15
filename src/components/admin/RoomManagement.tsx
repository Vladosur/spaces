
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Pencil, Trash2, LayoutGrid, List, Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

const RoomManagement: React.FC = () => {
    const { defaultView } = useTheme();
    const { rooms, addRoom, updateRoom, deleteRoom } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [roomName, setRoomName] = useState('');
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [view, setView] = useState<'card' | 'table'>(defaultView);

    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);

    const handleOpenModal = (mode: 'add' | 'edit', room: string | null = null) => {
        setModalMode(mode);
        setCurrentRoom(room);
        setRoomName(room || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRoom(null);
        setRoomName('');
    };

    const handleSave = () => {
        if (!roomName.trim()) return;

        if (modalMode === 'add') {
            addRoom(roomName.trim());
        } else if (currentRoom) {
            updateRoom(currentRoom, roomName.trim());
        }
        handleCloseModal();
    };

    const handleDelete = (roomToDelete: string) => {
        deleteRoom(roomToDelete);
    };

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none";

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 flex-shrink-0">
                <div>
                     <h2 className="text-2xl md:text-3xl font-bold text-foreground">Gestione Sale</h2>
                     <p className="text-muted-foreground mt-1 text-sm">Aggiungi, modifica o elimina le sale disponibili.</p>
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
                    <span>Aggiungi Sala</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 min-h-0">
                 {view === 'table' ? (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground whitespace-nowrap">Nome Sala</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right w-[120px]">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rooms.map(room => (
                                    <tr key={room} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium text-foreground whitespace-nowrap flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Building2 size={18} /></div>
                                            {room}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', room)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    aria-label={`Modifica ${room}`}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                    aria-label={`Elimina ${room}`}
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
                        {rooms.map(room => (
                            <div key={room} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                        <Building2 size={20}/>
                                    </div>
                                    <span className="font-medium text-foreground">{room}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                     <button
                                        onClick={() => handleOpenModal('edit', room)}
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room)}
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
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-6">
                        {modalMode === 'add' ? 'Aggiungi Nuova Sala' : 'Modifica Sala'}
                    </h3>
                    <div>
                        <label htmlFor="roomName" className="block text-sm font-medium text-muted-foreground">Nome Sala</label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className={inputClasses}
                            placeholder="Es. Auditorium"
                        />
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

export default RoomManagement;
