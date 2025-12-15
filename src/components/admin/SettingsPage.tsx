
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

type Theme = 'light' | 'dark';
type ViewMode = 'card' | 'table';
type CalendarViewMode = 'week' | 'day';

interface RadioGroupProps<T> {
  label: string;
  name: string;
  options: { value: T; label: string }[];
  selectedValue: T;
  onChange: (value: T) => void;
}

const RadioGroup = <T extends string>({ label, name, options, selectedValue, onChange }: RadioGroupProps<T>) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground">{label}</label>
        <div className="mt-2 flex gap-2 rounded-lg bg-muted/50 p-1.5 border border-border/50">
            {options.map(option => (
                <button
                    key={option.value}
                    name={name}
                    onClick={() => onChange(option.value)}
                    className={`flex-1 text-center px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                        selectedValue === option.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const { 
        theme, setTheme, 
        defaultView, setDefaultView,
        defaultCalendarView, setDefaultCalendarView
    } = useTheme();
    
    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
            <header className="mb-6 flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Impostazioni</h2>
                <p className="text-muted-foreground mt-1 text-sm">Gestisci le preferenze dell'applicazione.</p>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-2xl space-y-8 pb-8">
                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-xl font-semibold text-card-foreground">Impostazioni di base</h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Configura le opzioni di visualizzazione predefinite per la tua interfaccia.
                        </p>
                        <div className="mt-6 space-y-6">
                            <RadioGroup<Theme>
                                label="Modalità predefinita"
                                name="theme"
                                selectedValue={theme}
                                onChange={(value) => setTheme(value)}
                                options={[
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' },
                                ]}
                            />
                             <RadioGroup<ViewMode>
                                label="Vista predefinita per dati"
                                name="view"
                                selectedValue={defaultView}
                                onChange={(value) => setDefaultView(value)}
                                options={[
                                    { value: 'card', label: 'Cards' },
                                    { value: 'table', label: 'Tabella' },
                                ]}
                            />
                            <RadioGroup<CalendarViewMode>
                                label="Vista predefinita per il calendario"
                                name="calendarView"
                                selectedValue={defaultCalendarView}
                                onChange={(value) => setDefaultCalendarView(value)}
                                options={[
                                    { value: 'week', label: 'Settimana' },
                                    { value: 'day', label: 'Giorno' },
                                ]}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
