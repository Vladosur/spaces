
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Trash2, PlusCircle, Clock, AlertCircle, AlertTriangle, Hourglass, CalendarClock, ArrowRightFromLine } from 'lucide-react';

const ValidationSettingsPage: React.FC = () => {
    const { validationSettings, setValidationSettings } = useTheme();

    const handleToggle = (key: keyof typeof validationSettings) => {
        setValidationSettings({ ...validationSettings, [key]: !validationSettings[key] });
    };

    const handleNumberChange = (key: keyof typeof validationSettings, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setValidationSettings({ ...validationSettings, [key]: numValue });
        }
    };
    
    const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
        const newWorkingHours = [...validationSettings.workingHours];
        newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
        setValidationSettings({ ...validationSettings, workingHours: newWorkingHours });
    };

    const addWorkingHourSlot = () => {
        let newStart = '09:00';
        let newEnd = '13:00';
        
        if (validationSettings.workingHours.length > 0) {
            const lastSlot = validationSettings.workingHours[validationSettings.workingHours.length - 1];
            
            if (lastSlot.end) {
                 const [h, m] = lastSlot.end.split(':').map(Number);
                 let nextStartH = h + 1;
                 let nextStartM = m;
                 if (nextStartH >= 24) nextStartH = 7; 

                 let nextEndH = nextStartH + 4;
                 let nextEndM = m;
                 if (nextEndH >= 24) { nextEndH = 23; nextEndM = 59; }
                 
                 const format = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                 newStart = format(nextStartH, nextStartM);
                 newEnd = format(nextEndH, nextEndM);
                 
                 if (newStart >= newEnd && nextEndH === 23) newEnd = '23:59';
            }
        }

        const newWorkingHours = [...validationSettings.workingHours, { start: newStart, end: newEnd }];
        setValidationSettings({ ...validationSettings, workingHours: newWorkingHours });
    };

    const removeWorkingHourSlot = (index: number) => {
        const newWorkingHours = validationSettings.workingHours.filter((_, i) => i !== index);
        setValidationSettings({ ...validationSettings, workingHours: newWorkingHours });
    };

    const getMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const checkOverlap = (index: number) => {
        const current = validationSettings.workingHours[index];
        const startA = getMinutes(current.start);
        const endA = getMinutes(current.end);
        if (startA >= endA) return false;

        return validationSettings.workingHours.some((other, i) => {
            if (i === index) return false; 
            const startB = getMinutes(other.start);
            const endB = getMinutes(other.end);
            if (startB >= endB) return false; 
            return startA < endB && endA > startB;
        });
    };

    const inputClasses = "mt-1 w-full p-3 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors";
    const errorInputClasses = "mt-1 w-full p-3 bg-destructive/5 border border-destructive/50 text-destructive rounded-lg shadow-sm focus:ring-2 focus:ring-destructive focus:border-destructive outline-none transition-colors placeholder:text-destructive/50";
    const warningInputClasses = "mt-1 w-full p-3 bg-orange-500/5 border border-orange-500/50 text-orange-600 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors";
    const labelClasses = "block text-sm font-medium text-muted-foreground mb-1";

    const isDurationError = validationSettings.minDurationEnabled && validationSettings.maxDurationEnabled && (validationSettings.minDuration > validationSettings.maxDuration);
    const hasAnyOverlap = validationSettings.workingHours.some((_, i) => checkOverlap(i));

    const RuleToggleRow = ({ 
        label, 
        description, 
        settingKey, 
        enabledKey, 
        icon: Icon,
        suffix
    }: { 
        label: string, 
        description: string, 
        settingKey: 'minDuration' | 'maxDuration' | 'minAdvance', 
        enabledKey: 'minDurationEnabled' | 'maxDurationEnabled' | 'minAdvanceEnabled',
        icon: React.ElementType,
        suffix: string
    }) => {
        const isEnabled = validationSettings[enabledKey];
        
        return (
            <div className={`p-4 rounded-lg border transition-all duration-200 ${isEnabled ? 'bg-card border-border' : 'bg-muted/20 border-border/50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg mt-0.5 ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h4 className={`font-semibold ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{description}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-32">
                            <input 
                                type="number" 
                                value={validationSettings[settingKey]} 
                                onChange={(e) => handleNumberChange(settingKey, e.target.value)}
                                disabled={!isEnabled}
                                className={`w-full p-2 pr-12 bg-background border rounded-md text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary ${isEnabled ? 'border-input text-foreground' : 'border-transparent bg-transparent text-muted-foreground'}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{suffix}</span>
                        </div>
                        
                        <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" checked={isEnabled} onChange={() => handleToggle(enabledKey)} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="mb-6 flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Regole di Validazione</h2>
                <p className="text-muted-foreground mt-1 text-sm">Configura le regole per la creazione e modifica delle prenotazioni.</p>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="max-w-3xl space-y-8">
                    {/* Working Hours Section */}
                    <section className={`bg-card p-4 md:p-6 rounded-xl border shadow-sm transition-colors ${hasAnyOverlap ? 'border-orange-500/30' : 'border-border'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                                    <Clock size={20} className={hasAnyOverlap ? "text-orange-500" : "text-primary"}/>
                                    Orari di Lavoro (Fasce)
                                </h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Definisci i turni prenotabili (es. Mattina e Pomeriggio). Se disabilitato, si applica l'orario standard 07:00 - 20:00.
                                </p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer self-end sm:self-center">
                                <input type="checkbox" checked={validationSettings.workingHoursEnabled} onChange={() => handleToggle('workingHoursEnabled')} className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {validationSettings.workingHoursEnabled && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {hasAnyOverlap && (
                                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2 text-orange-600 text-sm font-medium mb-2">
                                        <AlertTriangle size={16} />
                                        Attenzione: Alcune fasce orarie si sovrappongono.
                                    </div>
                                )}

                                {validationSettings.workingHours.map((slot, index) => {
                                    const isInvalidRange = slot.start >= slot.end;
                                    const isOverlapping = checkOverlap(index);
                                    
                                    let containerClass = 'bg-muted/30 border-border/50';
                                    if (isInvalidRange) containerClass = 'bg-destructive/5 border-destructive/30';
                                    else if (isOverlapping) containerClass = 'bg-orange-500/5 border-orange-500/30';

                                    return (
                                        <div key={index} className={`p-4 rounded-lg border flex flex-col gap-4 transition-colors ${containerClass}`}>
                                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                                                <div className="w-full md:flex-1">
                                                    <label className={labelClasses}>Ora Inizio</label>
                                                    <input 
                                                        type="time" 
                                                        value={slot.start} 
                                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)} 
                                                        className={isInvalidRange ? errorInputClasses : (isOverlapping ? warningInputClasses : inputClasses)} 
                                                    />
                                                </div>
                                                <div className="w-full md:flex-1">
                                                    <label className={labelClasses}>Ora Fine</label>
                                                    <input 
                                                        type="time" 
                                                        value={slot.end} 
                                                        onChange={(e) => handleTimeChange(index, 'end', e.target.value)} 
                                                        className={isInvalidRange ? errorInputClasses : (isOverlapping ? warningInputClasses : inputClasses)} 
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => removeWorkingHourSlot(index)} 
                                                    className="w-full md:w-auto p-3 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                                                    aria-label="Rimuovi orario"
                                                >
                                                    <Trash2 size={18} />
                                                    <span className="md:hidden ml-2 font-medium">Rimuovi</span>
                                                </button>
                                            </div>
                                            {isInvalidRange && (
                                                <div className="flex items-center gap-2 text-destructive text-sm font-medium px-1">
                                                    <AlertCircle size={16} />
                                                    <span>L'orario di fine deve essere successivo all'orario di inizio.</span>
                                                </div>
                                            )}
                                            {!isInvalidRange && isOverlapping && (
                                                 <div className="flex items-center gap-2 text-orange-600 text-sm font-medium px-1">
                                                    <AlertTriangle size={16} />
                                                    <span>Questa fascia si sovrappone con un'altra esistente.</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <button onClick={addWorkingHourSlot} className="w-full py-3 border-2 border-dashed border-primary/30 text-primary rounded-lg hover:bg-primary/5 font-medium flex items-center justify-center gap-2 transition-colors">
                                    <PlusCircle size={18} />
                                    Aggiungi fascia oraria
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Duration Rules Section */}
                    <section className={`bg-card p-4 md:p-6 rounded-xl border shadow-sm transition-colors ${isDurationError ? 'border-destructive/30' : 'border-border'}`}>
                        <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-2 mb-1">
                            <AlertCircle size={20} className={isDurationError ? "text-destructive" : "text-primary"}/>
                            Limiti e Anticipo
                        </h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            Abilita e configura i limiti di durata e di anticipo per le prenotazioni.
                        </p>
                        
                        <div className="space-y-3">
                            <RuleToggleRow 
                                label="Durata Minima"
                                description="Impedisci la creazione di riunioni troppo brevi."
                                settingKey="minDuration"
                                enabledKey="minDurationEnabled"
                                icon={Hourglass}
                                suffix="min"
                            />
                            
                            <RuleToggleRow 
                                label="Durata Massima"
                                description="Impedisci l'occupazione della sala per un tempo eccessivo."
                                settingKey="maxDuration"
                                enabledKey="maxDurationEnabled"
                                icon={ArrowRightFromLine}
                                suffix="min"
                            />

                            <RuleToggleRow 
                                label="Anticipo Minimo"
                                description="Tempo minimo richiesto tra il momento della prenotazione e l'inizio dell'evento."
                                settingKey="minAdvance"
                                enabledKey="minAdvanceEnabled"
                                icon={CalendarClock}
                                suffix="min"
                            />
                        </div>

                        {isDurationError && (
                            <div className="flex items-center gap-2 text-destructive text-sm font-medium mt-4 bg-destructive/5 p-3 rounded-lg border border-destructive/20 animate-in fade-in">
                                <AlertTriangle size={16} />
                                <span>Errore Logico: La durata minima impostata è superiore alla durata massima.</span>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ValidationSettingsPage;
