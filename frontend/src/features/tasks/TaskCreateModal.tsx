import { useState } from 'react';
import { TASK_PRIORITY, type TaskDto, type TaskPriority } from '@g-hub/shared';
import { createTask } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { PRIO } from './taskUtils';

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

export function TaskCreateModal({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate?: string;
  onClose: () => void;
  onCreated: (task: TaskDto) => void;
}): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [projectText, setProjectText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('med');
  const [dueDate, setDueDate] = useState(defaultDate ?? '');
  const [time, setTime] = useState('');
  const [tag, setTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const task = await createTask({
        title: title.trim(),
        projectText: projectText.trim() || null,
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
        time: time.trim() || null,
        tag: tag.trim() || null,
      });
      onCreated(task);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Aufgabe nicht anlegen.');
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
        disabled={!title.trim() || busy}
        style={{
          padding: '10px 18px',
          borderRadius: 'var(--r-sm)',
          border: 0,
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          cursor: title.trim() && !busy ? 'pointer' : 'not-allowed',
          opacity: title.trim() && !busy ? 1 : 0.6,
          fontWeight: 700,
        }}
      >
        {busy ? 'Speichert …' : 'Anlegen'}
      </button>
    </div>
  );

  return (
    <Modal title="Neue Aufgabe" onClose={onClose} footer={footer}>
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
          <label style={labelStyle}>Titel</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit();
            }}
            placeholder="Was ist zu tun?"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Projekt</label>
          <input
            value={projectText}
            onChange={(e) => setProjectText(e.target.value)}
            placeholder="z. B. Sommer-Launch 2026"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Priorität</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TASK_PRIORITY.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid ' + (priority === p ? 'var(--accent)' : 'var(--line-strong)'),
                  background: priority === p ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span
                  className="cdot"
                  style={{ width: 8, height: 8, borderRadius: '50%', background: PRIO[p].color }}
                />
                {PRIO[p].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fällig am</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ width: 120 }}>
            <label style={labelStyle}>Uhrzeit</label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="14:00"
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Bereich / Tag</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="z. B. Content"
            style={inputStyle}
          />
        </div>
      </div>
    </Modal>
  );
}
