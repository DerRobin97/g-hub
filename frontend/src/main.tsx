import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { AppearanceProvider } from './app/AppearanceContext';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root-Element #root nicht gefunden.');

// iOS-Homescreen-Webapp (standalone): In diesem Modus ist `height: 100%` unzuverlässig
// (kollabiert zu einer zu kurzen Höhe). `window.innerHeight` liefert dagegen die echte
// nutzbare Höhe. Wir spiegeln sie in `--app-height`; die App-Shell nutzt diese Höhe als
// Bezug für ihr internes Scroll-Layout (`.web-canvas` scrollt innerhalb der Shell, siehe
// shell.css/web.css). Die Bottom-Nav selbst ist davon unabhängig am Viewport `fixed`.
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
