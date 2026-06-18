import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { AppearanceProvider } from './app/AppearanceContext';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root-Element #root nicht gefunden.');

// iOS-Homescreen-Webapp (standalone): Die App-Shell nutzt primär `100dvh` für die echte
// Bildschirmhöhe (siehe shell.css). Für ältere Engines ohne `dvh`-Support spiegeln wir
// `window.innerHeight` in `--app-height` als Fallback; `height: 100%` ist dort unzuverlässig
// (kollabiert zu kurz).
function setAppHeight(): void {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

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
