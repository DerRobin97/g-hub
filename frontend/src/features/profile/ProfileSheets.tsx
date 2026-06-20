import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { useAuth } from '../../auth/AuthContext';
import { useAppearance, type WebLayout } from '../../app/AppearanceContext';
import type { AccentSelection, Theme } from '../../lib/appearance';
import { updateProfile, ApiError } from '../../lib/api';
import type { SheetProps } from '../../app/OverlayContext';

// ── Profil bearbeiten ────────────────────────────────────────
const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', marginTop: 16 };
const inputRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
const bareInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: 'none',
  border: 0,
  outline: 'none',
  color: 'var(--text)',
  fontFamily: 'var(--ff)',
  fontSize: 15,
};

export function ProfileEditSheet({ close }: SheetProps): React.JSX.Element {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = (name.trim()[0] ?? user?.name?.trim()?.[0] ?? 'G').toUpperCase();
  const role = user?.memberships[0]?.role ?? 'Mitglied';

  const save = async (): Promise<void> => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });
      await refresh();
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  const foot = (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn btn-ghost" style={{ flex: 1 }} disabled={saving} onClick={close}>
        Abbrechen
      </button>
      <button className="btn btn-primary" style={{ flex: 2 }} disabled={saving} onClick={() => void save()}>
        <Icon name="check" size={17} /> {saving ? 'Speichert …' : 'Speichern'}
      </button>
    </div>
  );

  return (
    <Sheet title="Profil bearbeiten" onClose={close} foot={foot}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ position: 'relative' }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar" style={{ width: 84, height: 84, fontSize: 30 }}>
              {initial}
            </div>
          )}
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--bg-2)',
            }}
          >
            <Icon name="edit" size={14} />
          </span>
        </div>
      </div>

      <div style={fieldWrap}>
        <label className="lbl">Name</label>
        <div className="field" style={inputRow}>
          <Icon name="user" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input style={bareInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
        </div>
      </div>

      <div style={fieldWrap}>
        <label className="lbl">Telefonnummer</label>
        <div className="field" style={inputRow}>
          <Icon name="phone" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            style={bareInput}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="z. B. +49 170 1234567"
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label className="lbl">E-Mail</label>
        <div className="field" style={inputRow}>
          <Icon name="mail" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            style={bareInput}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.de"
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label className="lbl">Rolle</label>
        <div className="field" style={{ ...inputRow, background: 'var(--surface-3)', color: 'var(--text-2)' }}>
          <Icon name="shield" size={18} style={{ color: 'var(--accent-fg)', flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 600, textTransform: 'capitalize' }}>{role}</span>
          <Icon name="lock" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        </div>
        <span className="dim" style={{ fontSize: 12, marginTop: 6 }}>
          Rolle wird vom Administrator vergeben.
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))',
            border: '1px solid var(--bad)',
            color: 'var(--bad)',
            borderRadius: 11,
            padding: '10px 13px',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
    </Sheet>
  );
}

// ── Darstellung ──────────────────────────────────────────────
const THEME_OPTIONS: Array<{ key: Theme; label: string }> = [
  { key: 'dark', label: 'Dark' },
  { key: 'neon', label: 'Neon' },
  { key: 'hell', label: 'Hell' },
  { key: 'glass', label: 'Glass' },
  { key: 'mesh', label: 'Mesh' },
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={o.key} className={'chip ' + (o.key === active ? 'on' : '')} onClick={() => onSelect(o.key)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DarstellungSheet({ close }: SheetProps): React.JSX.Element {
  const { theme, accentSel, customAccent, webLayout, setTheme, setAccent, setWebLayout } =
    useAppearance();

  return (
    <Sheet title="Darstellung" onClose={close}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label className="lbl" style={{ marginBottom: 0 }}>Hintergrund</label>
        <SegRow options={THEME_OPTIONS} active={theme} onSelect={setTheme} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        <label className="lbl" style={{ marginBottom: 0 }}>Akzent</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                width: 40,
                height: 34,
                border: '1px solid var(--line-strong)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface-2)',
                cursor: 'pointer',
              }}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        <label className="lbl" style={{ marginBottom: 0 }}>Desktop-Layout</label>
        <SegRow options={LAYOUT_OPTIONS} active={webLayout} onSelect={setWebLayout} />
      </div>
    </Sheet>
  );
}
