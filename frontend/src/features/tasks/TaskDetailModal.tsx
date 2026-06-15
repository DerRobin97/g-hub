import { useState } from 'react';
import type { TaskDto } from '@g-hub/shared';
import { deleteTask, updateTask } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { Icon } from '../../components/Icon';
import { PRIO, STATUS_LABEL, roleLabel } from './taskUtils';

const metaRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
  borderTop: '1px solid var(--line)',
};

export function TaskDetailModal({
  task: initial,
  onClose,
  onChanged,
  onDeleted,
}: {
  task: TaskDto;
  onClose: () => void;
  onChanged: (task: TaskDto) => void;
  onDeleted: (id: string) => void;
}): React.JSX.Element {
  const [task, setTask] = useState<TaskDto>(initial);
  const [busy, setBusy] = useState(false);
  const role = roleLabel(task.role);
  const st = STATUS_LABEL[task.status] ?? STATUS_LABEL.offen;
  const done = task.checklist.filter((c) => c.done).length;

  const patch = async (data: Parameters<typeof updateTask>[1]): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await updateTask(task.id, data);
      setTask(updated);
      onChanged(updated);
    } finally {
      setBusy(false);
    }
  };

  const toggleItem = (idx: number): void => {
    const next = task.checklist.map((c, i) => ({ title: c.title, done: i === idx ? !c.done : c.done }));
    void patch({ checklist: next });
  };

  const toggleComplete = (): void => {
    void patch({ status: task.status === 'erledigt' ? 'offen' : 'erledigt' });
  };

  const remove = async (): Promise<void> => {
    if (busy) return;
    if (!window.confirm('Diese Aufgabe wirklich löschen?')) return;
    setBusy(true);
    try {
      await deleteTask(task.id);
      onDeleted(task.id);
    } finally {
      setBusy(false);
    }
  };

  const deadline = (task.dueLabel ?? '') + (task.time ? ` · ${task.time} Uhr` : '');
  const meta = [
    { ic: 'campaign' as const, l: 'Projekt', v: task.projectText || '—' },
    { ic: 'clock' as const, l: 'Deadline', v: deadline || '—' },
    { ic: 'flag' as const, l: 'Priorität', v: PRIO[task.priority].label, dot: PRIO[task.priority].color },
    { ic: 'list' as const, l: 'Bereich', v: task.tag || '—' },
  ];

  const footer = (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={() => void remove()}
        disabled={busy}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line-strong)',
          background: 'var(--surface-2)',
          color: 'var(--bad)',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <Icon name="close" size={16} /> Löschen
      </button>
      <button
        onClick={toggleComplete}
        disabled={busy}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 'var(--r-sm)',
          border: 0,
          background: task.status === 'erledigt' ? 'var(--surface-3)' : 'var(--accent)',
          color: task.status === 'erledigt' ? 'var(--text)' : 'var(--accent-ink)',
          cursor: 'pointer',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}
      >
        <Icon name="check" size={17} />
        {task.status === 'erledigt' ? 'Wieder öffnen' : 'Als erledigt'}
      </button>
    </div>
  );

  return (
    <Modal title="Aufgabe" onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-2)',
          }}
        >
          <span className="sdot" style={{ background: st.color }} />
          {st.label}
        </span>
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 7,
            color: role.accent ? 'var(--accent-fg)' : 'var(--text-3)',
            background: role.accent ? 'var(--accent-soft)' : 'var(--surface-2)',
          }}
        >
          {role.label}
        </span>
      </div>

      <div
        style={{
          fontFamily: 'var(--ff-disp)',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          textDecoration: task.status === 'erledigt' ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </div>

      {task.description && (
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ marginTop: 14 }}>
        {meta.map((m) => (
          <div key={m.l} style={metaRow}>
            <div className="kpi-ico" style={{ width: 32, height: 32 }}>
              <Icon name={m.ic} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-s" style={{ marginTop: 0 }}>
                {m.l}
              </div>
              <div className="row-t" style={{ fontSize: 14 }}>
                {'dot' in m && m.dot && (
                  <span
                    className="cdot"
                    style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: m.dot, marginRight: 6 }}
                  />
                )}
                {m.v}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Beteiligt */}
      {task.assignees.length > 0 && (
        <>
          <div className="sec-head">
            <div className="sec-title" style={{ fontSize: 15 }}>
              Beteiligt
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {task.assignees.map((a, i) => (
              <div key={a.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {(a.name?.[0] ?? '?').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row-t">{a.name}</div>
                </div>
                {i === 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '3px 7px',
                      borderRadius: 6,
                      color: 'var(--accent-fg)',
                      background: 'var(--accent-soft)',
                    }}
                  >
                    Verantwortlich
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Checkliste */}
      {task.checklist.length > 0 && (
        <>
          <div className="sec-head">
            <div className="sec-title" style={{ fontSize: 15 }}>
              Checkliste
            </div>
            <span className="dim" style={{ fontSize: 12 }}>
              {done}/{task.checklist.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {task.checklist.map((c, i) => (
              <button
                key={c.id}
                onClick={() => toggleItem(i)}
                disabled={busy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    flexShrink: 0,
                    border: c.done ? '0' : '2px solid var(--line-strong)',
                    background: c.done ? 'var(--accent)' : 'transparent',
                    color: 'var(--accent-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {c.done && <Icon name="check" size={13} stroke={3} />}
                </span>
                <span
                  className="row-t"
                  style={{
                    fontSize: 14,
                    textDecoration: c.done ? 'line-through' : 'none',
                    color: c.done ? 'var(--text-3)' : 'var(--text)',
                  }}
                >
                  {c.title}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
