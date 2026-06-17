import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { AppearanceProvider } from './app/AppearanceContext';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root-Element #root nicht gefunden.');

// iOS-Homescreen-Webapp (standalone): In diesem Modus sind `height: 100%` und der
// Bezugsrahmen für `position: fixed` unzuverlässig — die Bottom-Nav driftet nach
// oben. `window.innerHeight` liefert dagegen die echte nutzbare Höhe. Wir spiegeln
// sie in `--app-height`; die App-Shell nutzt diese Höhe, und die Bottom-Nav ist
// absolut daran verankert (siehe shell.css/mobile-nav.css). Damit sitzt sie auch
// in der Homescreen-App zuverlässig ganz unten.
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
