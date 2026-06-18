import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { AppearanceProvider } from './app/AppearanceContext';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root-Element #root nicht gefunden.');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <App />
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
