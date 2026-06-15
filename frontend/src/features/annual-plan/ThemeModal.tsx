import { useState } from 'react';
import {
  PLAN_CATEGORIES,
  PLAN_CHANNELS,
  type PlanCategory,
  type PlanMonthDto,
  type PlanThemeDto,
} from '@g-hub/shared';
import { createPlanTheme, deletePlanTheme, updatePlanTheme } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { CATEGORY_COLOR, categoryLabel, channelColor, channelLabel } from './planUtils';

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-3)',
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--line-strong)',
  background: 'var(--surface)',
  color: 'var(--text)',
  font: 'inherit',
  fontSize: 14,
};

export function ThemeModal({
  year,
  month,
  theme,
  onClose,
  onSaved,
  onDeleted,
}: {
  year: number;
  month: number;
  theme?: PlanThemeDto;
  onClose: () => void;
  onSaved: (updatedMonth: PlanMonthDto | null) => void;
  onDeleted?: () => void;
}): React.JSX.Element {
  const editing = !!theme;
  const [title, setTitle] = useState(theme?.title ?? '');
  const [category, setCategory] = useState<PlanCategory>(theme?.category ?? 'verkauf');
  const [description, setDescription] = useState(theme?.description ?? '');
  const [channels, setChannels] = useState<string[]>(theme?.channels ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChannel = (c: string): void =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async (): Promise<void> => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updatePlanTheme(theme.id, {
          title: title.trim(),
          category,
          description: description.trim() || null,
          channels,
        });
        onSaved(null);
      } else {
        const updatedMonth = await createPlanTheme(year, month, {
          title: title.trim(),
          category,
          description: description.trim() || null,
          channels,
        });
        onSaved(updatedMonth);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Thema nicht speichern.');
      setBusy(false);
    }
  };

  const remove = async (): Promise<void> => {
    if (!editing || busy || !window.confirm('Dieses Thema wirklich löschen?')) return;
    setBusy(true);
    try {
      await deletePlanTheme(theme.id);
      onDeleted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Thema nicht löschen.');
      setBusy(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: 10, justifyContent: editing ? 'space-between' : 'flex-end' }}>
      {editing && (
        <button
          onClick={() => void remove()}
          disabled={busy}
          style={{ padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface-2)', color: 'var(--bad)', cursor: 'pointer', fontWeight: 600 }}
        >
          Löschen
        </button>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
        >
          Abbrechen
        </button>
        <button
          onClick={() => void submit()}
          disabled={!title.trim() || busy}
          style={{ padding: '10px 18px', borderRadius: 'var(--r-sm)', border: 0, background: 'var(--accent)', color: 'var(--accent-ink)', cursor: title.trim() && !busy ? 'pointer' : 'not-allowed', opacity: title.trim() && !busy ? 1 : 0.6, fontWeight: 700 }}
        >
          {busy ? 'Speichert …' : editing ? 'Speichern' : 'Anlegen'}
        </button>
      </div>
    </div>
  );

  return (
    <Modal title={editing ? 'Thema bearbeiten' : 'Neues Thema'} onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{ background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))', border: '1px solid var(--bad)', color: 'var(--bad)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontSize: 13 }}>
            {error}
          </div>
        )}
        <div>
          <label style={labelStyle}>Titel</label>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Mähroboter iMOW" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Geschäftsbereich</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {PLAN_CATEGORIES.map((c) => {
              const on = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 11px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: on ? '1px solid transparent' : '1px solid var(--line-strong)',
                    background: on ? `color-mix(in oklab, ${CATEGORY_COLOR[c]} 22%, var(--surface))` : 'var(--surface)',
                    color: 'var(--text)',
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: CATEGORY_COLOR[c] }} />
                  {categoryLabel(c)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es bei diesem Thema?"
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        <div>
          <label style={labelStyle}>Kanäle</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {PLAN_CHANNELS.map((c) => {
              const on = channels.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 11px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: on ? '1px solid transparent' : '1px solid var(--line-strong)',
                    background: on ? `color-mix(in oklab, ${channelColor(c)} 22%, var(--surface))` : 'var(--surface)',
                    color: 'var(--text)',
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: channelColor(c) }} />
                  {channelLabel(c)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
