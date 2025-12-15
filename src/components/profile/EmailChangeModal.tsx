
import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EmailChangeModal: React.FC<EmailChangeModalProps> = ({ isOpen, onClose }) => {
    const { updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors";

    const handleReset = () => {
        setStep(1);
        setCurrentPassword('');
        setNewEmail('');
        setVerificationCode('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!currentPassword || !newEmail) {
            setError('Tutti i campi sono obbligatori.');
            return;
        }
        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(newEmail)) {
            setError('Inserisci un indirizzo email valido.');
            return;
        }

        setIsLoading(true);
        // --- SIMULATION ---
        console.log('Verifying current password...');
        setTimeout(() => {
            console.log('Password verified. Simulating sending verification code to', newEmail);
            setIsLoading(false);
            setStep(2);
        }, 1000);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (verificationCode !== '123456') {
            setError('Il codice di verifica non è corretto.');
            return;
        }

        setIsLoading(true);
        // --- SIMULATION ---
        console.log('Verification code correct. Updating email...');
        setTimeout(() => {
            updateUser({ email: newEmail });
            setIsLoading(false);
            handleReset();
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleReset}>
            {step === 1 && (
                <form onSubmit={handleStep1Submit} className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">Modifica Indirizzo Email</h3>
                    <p className="text-muted-foreground mb-6 text-sm">Per sicurezza, inserisci la tua password attuale.</p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="modal-current-password" className="block text-sm font-medium text-muted-foreground">Password Attuale</label>
                            <input
                                type="password"
                                id="modal-current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="modal-new-email" className="block text-sm font-medium text-muted-foreground">Nuovo Indirizzo Email</label>
                            <input
                                type="email"
                                id="modal-new-email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={handleReset} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Annulla</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isLoading ? 'Verifico...' : 'Continua'}
                        </button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleStep2Submit} className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">Inserisci Codice di Verifica</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Abbiamo inviato un codice a <strong>{newEmail}</strong>. Inseriscilo qui per confermare la modifica. (Suggerimento: il codice è 123456)
                    </p>

                    <div>
                        <label htmlFor="modal-verification-code" className="block text-sm font-medium text-muted-foreground">Codice di Verifica</label>
                        <input
                            type="text"
                            id="modal-verification-code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className={inputClasses}
                            placeholder="______"
                            maxLength={6}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    
                    <p className="text-xs text-muted-foreground mt-4">
                        Non hai ricevuto il codice? <button type="button" className="text-primary font-medium hover:underline">Invia di nuovo</button> (Simulazione)
                    </p>

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-muted transition-colors">Indietro</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isLoading ? 'Confermo...' : 'Conferma e Salva'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default EmailChangeModal;
