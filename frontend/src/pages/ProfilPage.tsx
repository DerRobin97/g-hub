import { useAuth } from '../auth/AuthContext';
import { useAppearance, type WebLayout } from '../app/AppearanceContext';
import type { AccentSelection, Theme } from '../lib/appearance';

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

/** Profil + Darstellungs-Einstellungen (an GET/PUT /api/me/appearance gebunden). */
export function ProfilPage(): React.JSX.Element {
  const { user, logout } = useAuth();
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
    </div>
  );
}
