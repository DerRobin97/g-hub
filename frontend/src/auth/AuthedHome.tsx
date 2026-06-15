import { useEffect, useState } from 'react';
import { APP_VERSION } from '@g-hub/shared';
import { useAuth } from './AuthContext';
import { getHealth, type HealthResponse } from '../lib/api';
import type { Theme } from '../lib/appearance';

export function AuthedHome({
  theme,
  onTheme,
}: {
  theme: Theme;
  onTheme: (t: Theme) => void;
}): React.JSX.Element {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const themes: Theme[] = ['light', 'gray', 'dark'];
  const workspace = user?.memberships[0];

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <section
        style={{
          width: 'min(560px, 94vw)',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow)',
          padding: '30px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: '22px' }}>Hallo, {user?.name} 👋</h1>
            <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '14px' }}>{user?.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--line-strong)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Abmelden
          </button>
        </div>

        {workspace && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>
              Aktiver Workspace
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700 }}>{workspace.workspaceName}</div>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {workspace.role}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', margin: '20px 0' }}>
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => onTheme(t)}
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

        <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0 }}>
          G-Hub v{APP_VERSION} · Backend:{' '}
          <span style={{ color: health?.db === 'up' ? 'var(--ok)' : 'var(--warn)' }}>
            {health ? `${health.status} / db ${health.db}` : '…'}
          </span>
        </p>
      </section>
    </main>
  );
}
