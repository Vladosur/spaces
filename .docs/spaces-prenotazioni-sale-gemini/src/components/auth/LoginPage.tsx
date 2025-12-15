import React from 'react';
import { Role } from '../../types';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle form-based login here.
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background text-foreground">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
              <div className="text-center lg:text-left mb-12">
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Spaces</h1>
                  <p className="text-muted-foreground mt-2">Sistema di gestione prenotazioni</p>
              </div>

              <h2 className="text-2xl font-semibold text-foreground mb-6">Accedi al tuo account</h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                      <label className="text-sm font-medium text-muted-foreground" htmlFor="email">Email</label>
                      <input 
                          id="email" 
                          type="email" 
                          disabled 
                          className="mt-1 w-full p-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-muted-foreground" htmlFor="password">Password</label>
                      <input 
                          id="password" 
                          type="password" 
                          disabled
                          className="mt-1 w-full p-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                          <input id="remember" type="checkbox" disabled className="h-4 w-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50"/>
                          <label htmlFor="remember" className="text-muted-foreground">Ricordami</label>
                      </div>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                      >
                        Password dimenticata?
                      </a>
                  </div>
                  <button 
                      type="submit" 
                      disabled
                      className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Accedi
                  </button>
              </form>
          </div>
      </div>
      <div className="hidden lg:flex relative items-center justify-center p-12 bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10 dark:via-background dark:to-background"></div>
        <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl"></div>
        
        <div className="relative bg-card/60 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <h3 className="text-2xl font-bold text-card-foreground">Accesso Rapido (Demo)</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Usa questi profili per esplorare l'applicazione.
          </p>
          <div className="space-y-4">
            <button
                onClick={() => onLogin(Role.ADMIN)}
                className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-base"
            >
                Accedi come Admin
            </button>
            <button
                onClick={() => onLogin(Role.USER)}
                className="w-full bg-secondary text-secondary-foreground p-3 rounded-lg font-semibold hover:bg-muted transition-colors text-base"
            >
                Accedi come User
            </button>
          </div>
        </div>
      </div>
      {/* Quick login for mobile */}
      <div className="lg:hidden px-6 pb-12">
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Oppure usa un account demo</span>
            </div>
        </div>
        <div className="space-y-4">
             <button
                onClick={() => onLogin(Role.ADMIN)}
                className="w-full bg-secondary text-secondary-foreground p-3 rounded-lg font-semibold hover:bg-muted transition-colors text-sm"
            >
                Accedi come Admin
            </button>
             <button
                onClick={() => onLogin(Role.USER)}
                className="w-full bg-secondary text-secondary-foreground p-3 rounded-lg font-semibold hover:bg-muted transition-colors text-sm"
            >
                Accedi come User
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;