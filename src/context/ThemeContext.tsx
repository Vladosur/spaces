
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ViewMode = 'card' | 'table';
type CalendarViewMode = 'week' | 'day';

export interface ValidationSettings {
  workingHoursEnabled: boolean;
  workingHours: { start: string, end: string }[];
  
  minDurationEnabled: boolean;
  minDuration: number; // in minutes
  
  maxDurationEnabled: boolean;
  maxDuration: number; // in minutes
  
  minAdvanceEnabled: boolean;
  minAdvance: number; // in minutes
}

export interface EmailSettings {
  notifyUserOnRequest: boolean;
  userRequestTemplate: string;
  notifyUserOnStatusChange: boolean;
  statusChangeTemplate: string;
  notifyTechnicianOnAssignment: boolean;
  technicianAssignmentTemplate: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  senderEmail: string;
  useSsl: boolean;
}

interface AppSettings {
  theme: Theme;
  defaultView: ViewMode;
  defaultCalendarView: CalendarViewMode;
  validation: ValidationSettings;
  email: EmailSettings;
  smtp: SmtpSettings;
}

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  defaultView: ViewMode;
  setDefaultView: (view: ViewMode) => void;
  defaultCalendarView: CalendarViewMode;
  setDefaultCalendarView: (view: CalendarViewMode) => void;
  validationSettings: ValidationSettings;
  setValidationSettings: (settings: ValidationSettings) => void;
  emailSettings: EmailSettings;
  setEmailSettings: (settings: EmailSettings) => void;
  smtpSettings: SmtpSettings;
  setSmtpSettings: (settings: SmtpSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultValidationSettings: ValidationSettings = {
  workingHoursEnabled: false,
  workingHours: [{ start: '09:00', end: '18:00' }],
  
  minDurationEnabled: true,
  minDuration: 15,
  
  maxDurationEnabled: true,
  maxDuration: 240,
  
  minAdvanceEnabled: true,
  minAdvance: 60,
};

const defaultEmailSettings: EmailSettings = {
  notifyUserOnRequest: true,
  userRequestTemplate: `Ciao {{userName}},\n\nLa tua richiesta di prenotazione per la sala {{room}} il giorno {{date}} dalle {{startTime}} alle {{endTime}} è stata ricevuta ed è in attesa di approvazione.\n\nGrazie.`,
  notifyUserOnStatusChange: true,
  statusChangeTemplate: `Ciao {{userName}},\n\nLa tua richiesta di prenotazione per la sala {{room}} il giorno {{date}} è stata {{status}}.\n\nSaluti.`,
  notifyTechnicianOnAssignment: true,
  technicianAssignmentTemplate: `Ciao,\n\nSei stato assegnato alla prenotazione per la sala {{room}} il giorno {{date}} dalle {{startTime}} alle {{endTime}} richiesta da {{userName}}.\n\nGrazie.`,
};

const defaultSmtpSettings: SmtpSettings = {
  host: '',
  port: 587,
  username: '',
  password: '',
  senderEmail: '',
  useSsl: true,
};

const getInitialSettings = (): AppSettings => {
  const defaults: AppSettings = { 
    theme: 'dark', 
    defaultView: 'card', 
    defaultCalendarView: 'week', // Changed from 'day' to 'week'
    validation: defaultValidationSettings,
    email: defaultEmailSettings,
    smtp: defaultSmtpSettings,
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }
  
  try {
    const item = window.localStorage.getItem('appSettings');
    const storedSettings: Partial<AppSettings> = item ? JSON.parse(item) : {};

    const initialTheme = storedSettings.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    return {
      theme: initialTheme,
      defaultView: storedSettings.defaultView || defaults.defaultView,
      defaultCalendarView: storedSettings.defaultCalendarView || defaults.defaultCalendarView,
      validation: { ...defaults.validation, ...(storedSettings.validation || {}) },
      email: { ...defaults.email, ...(storedSettings.email || {}) },
      smtp: { ...defaults.smtp, ...(storedSettings.smtp || {}) },
    };

  } catch (error) {
    console.error("Error reading settings from localStorage", error);
    return defaults;
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(settings.theme === 'dark' ? 'light' : 'dark');
    root.classList.add(settings.theme);
    
    try {
      window.localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to localStorage", error);
    }
  }, [settings]);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setDefaultView = useCallback((view: ViewMode) => {
    setSettings(prev => ({ ...prev, defaultView: view }));
  }, []);

  const setDefaultCalendarView = useCallback((view: CalendarViewMode) => {
    setSettings(prev => ({ ...prev, defaultCalendarView: view }));
  }, []);

  const setValidationSettings = useCallback((validation: ValidationSettings) => {
    setSettings(prev => ({ ...prev, validation }));
  }, []);
  
  const setEmailSettings = useCallback((email: EmailSettings) => {
    setSettings(prev => ({ ...prev, email }));
  }, []);

  const setSmtpSettings = useCallback((smtp: SmtpSettings) => {
    setSettings(prev => ({ ...prev, smtp }));
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      theme: settings.theme, 
      toggleTheme,
      setTheme,
      defaultView: settings.defaultView, 
      setDefaultView,
      defaultCalendarView: settings.defaultCalendarView,
      setDefaultCalendarView,
      validationSettings: settings.validation,
      setValidationSettings,
      emailSettings: settings.email,
      setEmailSettings,
      smtpSettings: settings.smtp,
      setSmtpSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useTheme = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
