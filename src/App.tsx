
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import LoginPage from '@/components/auth/LoginPage';
import MainLayout from '@/components/layout/MainLayout';

const AppContent: React.FC = () => {
  const { user, login } = useAuth();

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <HashRouter>
        <MainLayout />
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
