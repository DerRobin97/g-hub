import { googleConnectUrl } from '../lib/api';

function googleErrorText(code: string | null): string | null {
  if (!code) return null;
  if (code === 'google_state')
    return 'Google-Login abgebrochen (Sicherheitsprüfung). Bitte erneut versuchen.';
  if (code === 'google_failed') return 'Google-Login fehlgeschlagen. Bitte erneut versuchen.';
  return 'Google-Login fehlgeschlagen.';
}

export function AuthScreen(): React.JSX.Element {
  const urlError = googleErrorText(new URLSearchParams(window.location.search).get('error'));

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <section
        style={{
          width: 'min(400px, 94vw)',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow)',
          padding: '34px 30px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 14px',
            borderRadius: '14px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: '22px',
          }}
        >
          G
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px' }}>Willkommen bei G-Hub</h1>
        <p style={{ margin: '0 0 26px', color: 'var(--text-2)', fontSize: '14px' }}>
          Melde dich an, um fortzufahren
        </p>

        {urlError && (
          <div
            style={{
              background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))',
              border: '1px solid var(--bad)',
              color: 'var(--bad)',
              borderRadius: '11px',
              padding: '10px 13px',
              fontSize: '13px',
              marginBottom: '18px',
              textAlign: 'left',
            }}
          >
            {urlError}
          </div>
        )}

        <a
          href={googleConnectUrl()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px',
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
