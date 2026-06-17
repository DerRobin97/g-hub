import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAppearance, type WebLayout } from '../app/AppearanceContext';
import type { AccentSelection, Theme } from '../lib/appearance';
import { Icon } from '../components/Icon';
import { clearDemoData, seedDemoData } from '../lib/api';

const THEME_OPTIONS: Array<{ key: Theme; label: string }> = [
  { key: 'light', label: 'Weiß' },
  { key: 'gray', label: 'Grau' },
  { key: 'dark', label: 'Schwarz' },
];
const ACCENT_OPTIONS: Array<{ key: AccentSelection; label: string }> = [
  { key: 'gruen', label: 'Grün' },
  { key: 'orange', label: 'Orange' },
  { key: 'custom', label: 'Eigene' },
];
const LAYOUT_OPTIONS: Array<{ key: WebLayout; label: string }> = [
  { key: 'full', label: 'Voll' },
  { key: 'rail', label: 'Rail' },
  { key: 'dual', label: 'Doppel' },
];

function SegRow<T extends string>({
  options,
  active,
  onSelect,
}: {
  options: Array<{ key: T; label: string }>;
  active: T;
  onSelect: (key: T) => void;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onSelect(o.key)}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line-strong)',
            cursor: 'pointer',
            background: o.key === active ? 'var(--accent)' : 'var(--surface-2)',
            color: o.key === active ? 'var(--accent-ink)' : 'var(--text)',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** TEMPORÄR: Demo-Daten in den Workspace einfügen / wieder entfernen. */
function DemoControls(): React.JSX.Element {
  const [busy, setBusy] = useState<null | 'seed' | 'clear'>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async (kind: 'seed' | 'clear'): Promise<void> => {
    if (kind === 'clear' && !window.confirm('Alle Demo-Inhalte (Aufgaben, Projekte, Kampagnen, Jahresplan, News, Mitteilungen) dieses Workspace löschen?')) return;
    setBusy(kind);
    setMsg(null);
    try {
      const res = kind === 'seed' ? await seedDemoData() : await clearDemoData();
      const txt: Record<string, string> = {
        seeded: 'Demo-Daten eingefügt. Seiten neu laden, um sie zu sehen.',
        exists: 'Demo-Daten sind bereits vorhanden.',
        cleared: 'Inhalte entfernt. Seiten neu laden.',
      };
      setMsg(txt[res.status] ?? res.status);
    } catch {
      setMsg('Fehler — bitte erneut versuchen.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--line-strong)',
        borderRadius: 'var(--r-md)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 700 }}>Demo-Daten (temporär)</div>
      <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
        Füllt den Workspace mit Beispiel-Inhalten zum Testen. „Entfernen" löscht alle Inhalte
        der Module Aufgaben, Projekte, Kampagnen, Jahresplan, News und Mitteilungen.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => void run('seed')}
          disabled={busy !== null}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--r-sm)',
            border: 0,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            cursor: 'pointer',
            fontWeight: 700,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy === 'seed' ? 'Füge ein …' : 'Demo-Daten einfügen'}
        </button>
        <button
          onClick={() => void run('clear')}
          disabled={busy !== null}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line-strong)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy === 'clear' ? 'Entferne …' : 'Demo-Daten entfernen'}
        </button>
      </div>
      {msg && <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{msg}</div>}
    </section>
  );
}

/** Profil + Darstellungs-Einstellungen (an GET/PUT /api/me/appearance gebunden). */
export function ProfilPage(): React.JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, accentSel, customAccent, webLayout, setTheme, setAccent, setWebLayout } =
    useAppearance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '560px' }}>
      <section
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow)',
          padding: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>{user?.email}</div>
        </div>
        <button
          onClick={() => void logout()}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line-strong)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Abmelden
        </button>
      </section>

      <button
        onClick={() => navigate('/profil/aufgaben')}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          cursor: 'pointer',
          color: 'var(--text)',
          font: 'inherit',
          textAlign: 'left',
        }}
      >
        <span className="kpi-ico" style={{ width: 40, height: 40, borderRadius: 12 }}>
          <Icon name="check" size={19} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Meine Aufgaben</div>
          <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 2 }}>
            Persönliche To-dos & Wochenkalender
          </div>
        </div>
        <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
      </button>

      <section
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700 }}>Darstellung</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Hintergrund</span>
          <SegRow options={THEME_OPTIONS} active={theme} onSelect={setTheme} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Akzent</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <SegRow
              options={ACCENT_OPTIONS}
              active={accentSel}
              onSelect={(k) => setAccent(k, k === 'custom' ? customAccent : undefined)}
            />
            {accentSel === 'custom' && (
              <input
                type="color"
                value={customAccent}
                onChange={(e) => setAccent('custom', e.target.value)}
                aria-label="Eigene Akzentfarbe"
                style={{
                  width: '40px',
                  height: '34px',
                  border: '1px solid var(--line-strong)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                  cursor: 'pointer',
                }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Desktop-Layout</span>
          <SegRow options={LAYOUT_OPTIONS} active={webLayout} onSelect={setWebLayout} />
        </div>
      </section>

      <DemoControls />
    </div>
  );
}
