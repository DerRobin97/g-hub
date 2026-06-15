import { useState } from 'react';
import type { ProjectDetailDto } from '@g-hub/shared';
import { createProject } from '../../lib/api';
import { Modal } from '../../components/Modal';

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

export function ProjectCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (project: ProjectDetailDto) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('');
  const [dueLabel, setDueLabel] = useState('');
  const [budgetText, setBudgetText] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        kind: kind.trim() || null,
        dueLabel: dueLabel.trim() || null,
        budgetText: budgetText.trim() || null,
        description: description.trim() || null,
      });
      onCreated(project);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Projekt nicht anlegen.');
      setBusy(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button
        onClick={onClose}
        style={{
          padding: '10px 16px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line-strong)',
          background: 'var(--surface-2)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Abbrechen
      </button>
      <button
        onClick={() => void submit()}
        disabled={!name.trim() || busy}
        style={{
          padding: '10px 18px',
          borderRadius: 'var(--r-sm)',
          border: 0,
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          cursor: name.trim() && !busy ? 'pointer' : 'not-allowed',
          opacity: name.trim() && !busy ? 1 : 0.6,
          fontWeight: 700,
        }}
      >
        {busy ? 'Speichert …' : 'Anlegen'}
      </button>
    </div>
  );

  return (
    <Modal title="Neues Projekt" onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div
            style={{
              background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))',
              border: '1px solid var(--bad)',
              color: 'var(--bad)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 12px',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label style={labelStyle}>Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Neue Webseite"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Art</label>
            <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="Web · Relaunch" style={inputStyle} />
          </div>
          <div style={{ width: 130 }}>
            <label style={labelStyle}>Fällig</label>
            <input value={dueLabel} onChange={(e) => setDueLabel(e.target.value)} placeholder="15. Jul" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Budget</label>
          <input value={budgetText} onChange={(e) => setBudgetText(e.target.value)} placeholder="14,2 / 22 k€" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es im Projekt?"
            style={{ ...inputStyle, minHeight: 78, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>
      </div>
    </Modal>
  );
}
