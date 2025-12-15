
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Server, Bell, PlayCircle } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import Modal from '../common/Modal';

type ActiveTab = 'server' | 'notifications';

const EmailSettingsPage: React.FC = () => {
    const { emailSettings, setEmailSettings, smtpSettings, setSmtpSettings } = useTheme();
    const [activeTab, setActiveTab] = useState<ActiveTab>('server');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    const handleEmailToggle = (key: keyof typeof emailSettings) => {
        setEmailSettings({ ...emailSettings, [key]: !emailSettings[key] });
    };

    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSmtpSettings({
            ...smtpSettings,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value),
        });
    };
    
    const handleEmailTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEmailSettings({
            ...emailSettings,
            [name]: value,
        });
    };

    const handleTestTemplate = (template: string) => {
        const mockBooking = bookingService.getMockBookingForPreview();
        const compiled = bookingService.compileEmailTemplate(template, mockBooking);
        setPreviewContent(compiled);
        setIsPreviewOpen(true);
    };

    const tabOptions: { label: string; value: ActiveTab; icon: React.ElementType }[] = [
        { label: 'Server SMTP', value: 'server', icon: Server },
        { label: 'Notifiche', value: 'notifications', icon: Bell },
    ];
    
    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors";
    const labelClasses = "block text-sm font-medium text-muted-foreground";
    
    const ToggleRow = ({ settingKey, title, description }: { settingKey: keyof typeof emailSettings, title: string, description: string }) => (
        <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
                <h4 className="font-semibold text-card-foreground text-base">{title}</h4>
                <p className="text-muted-foreground text-xs md:text-sm leading-snug mt-0.5">{description}</p>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={emailSettings[settingKey] as boolean} onChange={() => handleEmailToggle(settingKey)} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    );

    return (
        <>
            <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
                <header className="mb-6 flex-shrink-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Posta Elettronica</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Gestisci server SMTP e notifiche email.</p>
                </header>

                <div className="bg-card border border-border rounded-xl p-1.5 flex mb-6 flex-shrink-0 shadow-sm">
                    {tabOptions.map(option => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={() => setActiveTab(option.value)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === option.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <Icon size={16} />
                                <span>{option.label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                    {activeTab === 'server' && (
                        <section className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-xl font-semibold text-card-foreground mb-1">Configurazione Server</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Dettagli del server di posta in uscita.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="host" className={labelClasses}>Host SMTP</label>
                                    <input type="text" name="host" id="host" value={smtpSettings.host} onChange={handleSmtpChange} className={inputClasses} placeholder="smtp.example.com" />
                                </div>
                                <div>
                                    <label htmlFor="port" className={labelClasses}>Porta</label>
                                    <input type="number" name="port" id="port" value={smtpSettings.port} onChange={handleSmtpChange} className={inputClasses} placeholder="587" />
                                </div>
                                <div>
                                    <label htmlFor="username" className={labelClasses}>Nome Utente</label>
                                    <input type="text" name="username" id="username" value={smtpSettings.username} onChange={handleSmtpChange} className={inputClasses} placeholder="user@example.com" />
                                </div>
                                <div>
                                    <label htmlFor="password" className={labelClasses}>Password</label>
                                    <input type="password" name="password" id="password" value={smtpSettings.password} onChange={handleSmtpChange} className={inputClasses} placeholder="••••••••" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="senderEmail" className={labelClasses}>Email Mittente</label>
                                    <input type="email" name="senderEmail" id="senderEmail" value={smtpSettings.senderEmail} onChange={handleSmtpChange} className={inputClasses} placeholder="noreply@example.com" />
                                </div>
                                 <div className="md:col-span-2 flex items-center gap-4 pt-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="useSsl" checked={smtpSettings.useSsl} onChange={handleSmtpChange} className="sr-only peer" />
                                        <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                    <div>
                                        <h4 className="font-semibold text-foreground text-sm">Usa SSL/TLS</h4>
                                        <p className="text-muted-foreground text-xs">Connessione sicura al server.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'notifications' && (
                        <section className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-xl font-semibold text-card-foreground mb-1">Regole Notifiche</h3>
                             <p className="text-muted-foreground text-sm mb-6">
                                Personalizza i trigger e i template delle email.
                            </p>
                            <div className="divide-y divide-border">
                                <div className="py-6 first:pt-0">
                                    <ToggleRow
                                        settingKey="notifyUserOnRequest"
                                        title="Conferma Richiesta Utente"
                                        description="Email all'utente alla creazione della richiesta."
                                    />
                                    {emailSettings.notifyUserOnRequest && (
                                         <div className="mt-4 pt-4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l-2 border-primary/20">
                                            <label htmlFor="userRequestTemplate" className={`${labelClasses} mb-1.5`}>Template Messaggio</label>
                                            <textarea
                                                id="userRequestTemplate"
                                                name="userRequestTemplate"
                                                value={emailSettings.userRequestTemplate}
                                                onChange={handleEmailTemplateChange}
                                                rows={6}
                                                className={`${inputClasses} font-mono text-sm leading-relaxed`}
                                            />
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3">
                                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 break-all flex-1">
                                                    {`Variabili: {{userName}}, {{room}}, {{date}}, {{startTime}}, {{endTime}}`}
                                                </p>
                                                <button 
                                                    onClick={() => handleTestTemplate(emailSettings.userRequestTemplate)}
                                                    className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <PlayCircle size={14} />
                                                    Prova Template
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                 <div className="py-6">
                                    <ToggleRow
                                        settingKey="notifyUserOnStatusChange"
                                        title="Aggiornamento Stato"
                                        description="Email all'utente quando lo stato cambia."
                                    />
                                    {emailSettings.notifyUserOnStatusChange && (
                                         <div className="mt-4 pt-4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l-2 border-primary/20">
                                            <label htmlFor="statusChangeTemplate" className={`${labelClasses} mb-1.5`}>Template Messaggio</label>
                                            <textarea
                                                id="statusChangeTemplate"
                                                name="statusChangeTemplate"
                                                value={emailSettings.statusChangeTemplate}
                                                onChange={handleEmailTemplateChange}
                                                rows={5}
                                                className={`${inputClasses} font-mono text-sm leading-relaxed`}
                                            />
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3">
                                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 break-all flex-1">
                                                    {`Variabili: {{userName}}, {{room}}, {{date}}, {{status}}`}
                                                </p>
                                                <button 
                                                    onClick={() => handleTestTemplate(emailSettings.statusChangeTemplate)}
                                                    className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <PlayCircle size={14} />
                                                    Prova Template
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                 <div className="py-6 last:pb-0">
                                    <ToggleRow
                                        settingKey="notifyTechnicianOnAssignment"
                                        title="Assegnazione Tecnico"
                                        description="Email al tecnico quando viene assegnato."
                                    />
                                    {emailSettings.notifyTechnicianOnAssignment && (
                                         <div className="mt-4 pt-4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l-2 border-primary/20">
                                            <label htmlFor="technicianAssignmentTemplate" className={`${labelClasses} mb-1.5`}>Template Messaggio</label>
                                            <textarea
                                                id="technicianAssignmentTemplate"
                                                name="technicianAssignmentTemplate"
                                                value={emailSettings.technicianAssignmentTemplate}
                                                onChange={handleEmailTemplateChange}
                                                rows={6}
                                                className={`${inputClasses} font-mono text-sm leading-relaxed`}
                                            />
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3">
                                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 break-all flex-1">
                                                    {`Variabili: {{userName}}, {{room}}, {{date}}, {{startTime}}, {{endTime}}`}
                                                </p>
                                                <button 
                                                    onClick={() => handleTestTemplate(emailSettings.technicianAssignmentTemplate)}
                                                    className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <PlayCircle size={14} />
                                                    Prova Template
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
                <div className="p-6 md:p-8 max-w-2xl">
                    <h3 className="text-2xl font-bold text-card-foreground mb-4">Anteprima Email</h3>
                    <div className="bg-muted p-4 rounded-lg border border-border/50 font-mono text-sm whitespace-pre-wrap text-foreground overflow-y-auto max-h-[50vh]">
                        {previewContent}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-yellow-500/10 p-2 rounded text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                        <PlayCircle size={14} />
                        <span>Questa è una simulazione. Le variabili sono state sostituite con dati di esempio.</span>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button 
                            onClick={() => setIsPreviewOpen(false)} 
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Chiudi Anteprima
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EmailSettingsPage;
