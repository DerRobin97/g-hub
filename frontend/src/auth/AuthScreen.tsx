import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError, googleConnectUrl } from '../lib/api';

type Mode = 'login' | 'register';

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 13px',
  borderRadius: '11px',
  border: '1px solid var(--line-strong)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: '15px',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-2)',
  margin: '0 0 6px',
};

function googleErrorText(code: string | null): string | null {
  if (!code) return null;
  if (code === 'google_state')
    return 'Google-Login abgebrochen (Sicherheitsprüfung). Bitte erneut versuchen.';
  if (code === 'google_failed') return 'Google-Login fehlgeschlagen. Bitte erneut versuchen.';
  return 'Google-Login fehlgeschlagen.';
}

export function AuthScreen(): React.JSX.Element {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlError = googleErrorText(new URLSearchParams(window.location.search).get('error'));

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, workspaceName });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <section
        style={{
          width: 'min(420px, 94vw)',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow)',
          padding: '30px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              margin: '0 auto 12px',
              borderRadius: '13px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            G
          </div>
          <h1 style={{ margin: '0 0 2px', fontSize: '21px' }}>
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '14px' }}>
            G-Hub — Marketing-Hub
          </p>
        </div>

        {/* Tab-Umschalter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            padding: '4px',
            background: 'var(--surface-2)',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              style={{
                padding: '9px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-3)',
                boxShadow: mode === m ? 'var(--shadow)' : 'none',
              }}
            >
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        {(error || urlError) && (
          <div
            style={{
              background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))',
              border: '1px solid var(--bad)',
              color: 'var(--bad)',
              borderRadius: '11px',
              padding: '10px 13px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error ?? urlError}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Robin Hohe"
                  required
                  minLength={2}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Workspace-Name</label>
                <input
                  style={inputStyle}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Gerber Fachhandel"
                  required
                  minLength={2}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>E-Mail</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firma.de"
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Passwort</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'mind. 8 Zeichen' : '••••••••'}
              required
              minLength={mode === 'register' ? 8 : 1}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              cursor: busy ? 'default' : 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Bitte warten …' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </form>

        {/* Trenner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '18px 0',
            color: 'var(--text-3)',
            fontSize: '12px',
          }}
        >
          <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          oder
          <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        </div>

        {/* Google-Login (serverseitiger OAuth-Flow) */}
        <a
          href={googleConnectUrl()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px',
            borderRadius: '12px',
            border: '1px solid var(--line-strong)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          <GoogleIcon />
          Mit Google anmelden
        </a>
      </section>
    </main>
  );
}

function GoogleIcon(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.9 35.5 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
