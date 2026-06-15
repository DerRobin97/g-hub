import { useEffect, useState } from 'react';
import { APP_VERSION } from '@g-hub/shared';
import { applyTo, type Theme } from './lib/appearance';
import { getHealth, type HealthResponse } from './lib/api';

/**
 * Phase-0-Platzhalter-App: beweist die End-to-End-Verkettung
 *   - Appearance-System wird auf den Host angewendet (CSS-Variablen)
 *   - geteilte Konstante aus @g-hub/shared
 *   - Backend-Health über den /api-Proxy
 * Die echte Shell (Sidebar/Topbar, responsive) folgt im nächsten Schritt.
 */
export function App(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('dark');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyTo(document.documentElement, theme, 'gruen');
  }, [theme]);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unbekannter Fehler'));
  }, []);

  const themes: Theme[] = ['light', 'gray', 'dark'];

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <section
        style={{
          width: 'min(520px, 92vw)',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow)',
          padding: '28px',
        }}
      >
        <h1 style={{ margin: '0 0 4px', fontSize: '22px' }}>G-Hub</h1>
        <p style={{ margin: '0 0 20px', color: 'var(--text-2)' }}>
          Marketing-Hub · Frontend-Skeleton v{APP_VERSION}
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--line-strong)',
                cursor: 'pointer',
                background: t === theme ? 'var(--accent)' : 'var(--surface-2)',
                color: t === theme ? 'var(--accent-ink)' : 'var(--text)',
                fontWeight: 600,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '14px',
          }}
        >
          <strong>Backend-Status</strong>
          <div style={{ marginTop: '8px', color: 'var(--text-2)' }}>
            {error && <span style={{ color: 'var(--bad)' }}>Nicht erreichbar: {error}</span>}
            {!error && !health && <span>lädt …</span>}
            {health && (
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>status: {health.status}</li>
                <li>version: {health.version}</li>
                <li>
                  db:{' '}
                  <span style={{ color: health.db === 'up' ? 'var(--ok)' : 'var(--warn)' }}>
                    {health.db}
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
