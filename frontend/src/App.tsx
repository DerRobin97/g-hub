import { useEffect, useState } from 'react';
import { applyTo, type Theme } from './lib/appearance';
import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { AuthedHome } from './auth/AuthedHome';

/**
 * Auth-Gate: lädt die Sitzung, zeigt dann entweder Login/Register
 * oder die eingeloggte Ansicht. Das Theme wird global angewendet.
 */
export function App(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    applyTo(document.documentElement, theme, 'gruen');
  }, [theme]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ color: 'var(--text-2)' }}>Lädt …</span>
      </main>
    );
  }

  return user ? <AuthedHome theme={theme} onTheme={setTheme} /> : <AuthScreen />;
}
