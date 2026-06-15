import { useState } from 'react';
import { PROJECT_TASK_PRIORITY, type ProjectMemberDto, type ProjectTaskDto } from '@g-hub/shared';
import { deleteProjectTask, updateProjectTask } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { Icon } from '../../components/Icon';
import { PM_PRIO, initial } from './projectUtils';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface)',
  border: '1px solid var(--line-strong)',
  borderRadius: 'var(--r-sm)',
  padding: '9px 11px',
  color: 'var(--text)',
  font: 'inherit',
  fontSize: 13.5,
};

export function ProjectTaskModal({
  task: initialTask,
  phaseName,
  projectMembers,
  onClose,
  onChanged,
  onDeleted,
}: {
  task: ProjectTaskDto;
  phaseName: string;
  projectMembers: ProjectMemberDto[];
  onClose: () => void;
  onChanged: (task: ProjectTaskDto) => void;
  onDeleted: (id: string) => void;
}): React.JSX.Element {
  const [task, setTask] = useState<ProjectTaskDto>(initialTask);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueLabel, setDueLabel] = useState(task.dueLabel ?? '');
  const [linkBuf, setLinkBuf] = useState('');

  const prio = PM_PRIO[task.priority];
  const addable = projectMembers.filter((m) => !task.members.some((x) => x.userId === m.userId));

  const apply = async (patch: Parameters<typeof updateProjectTask>[1]): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await updateProjectTask(task.id, patch);
      setTask(updated);
      onChanged(updated);
    } finally {
      setBusy(false);
    }
  };

  const toggleDone = (): void => {
    if (task.done && !window.confirm('Diese Aufgabe ist erledigt. Wirklich wieder öffnen?')) return;
    void apply({ done: !task.done });
  };

  const finishEdit = async (): Promise<void> => {
    const patch: Parameters<typeof updateProjectTask>[1] = {};
    if (title.trim() && title !== task.title) patch.title = title.trim();
    if (description !== (task.description ?? '')) patch.description = description.trim() || null;
    if (dueLabel !== (task.dueLabel ?? '')) patch.dueLabel = dueLabel.trim() || null;
    if (Object.keys(patch).length) await apply(patch);
    setEditing(false);
  };

  const remove = async (): Promise<void> => {
    if (busy || !window.confirm('Diese Aufgabe wirklich löschen?')) return;
    setBusy(true);
    try {
      await deleteProjectTask(task.id);
      onDeleted(task.id);
    } finally {
      setBusy(false);
    }
  };

  const setMembers = (ids: string[]): void => void apply({ memberIds: ids });
  const setLinks = (links: string[]): void => void apply({ links });

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
        }}
      >
        Löschen
      </button>
      <button
        onClick={() => (editing ? void finishEdit() : setEditing(true))}
        disabled={busy}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 'var(--r-sm)',
          border: 0,
          background: editing ? 'var(--accent)' : 'var(--surface-3)',
          color: editing ? 'var(--accent-ink)' : 'var(--text)',
          cursor: 'pointer',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}
      >
        <Icon name={editing ? 'check' : 'edit'} size={16} /> {editing ? 'Fertig' : 'Bearbeiten'}
      </button>
    </div>
  );

  return (
    <Modal title="Aufgabe" onClose={onClose} footer={footer}>
      {/* Titel */}
      {editing ? (
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...fieldStyle, fontSize: 16, fontWeight: 700 }} />
      ) : (
        <div
          style={{
            fontFamily: 'var(--ff-disp)',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            textDecoration: task.done ? 'line-through' : 'none',
            color: task.done ? 'var(--text-3)' : 'var(--text)',
          }}
        >
          {task.title}
        </div>
      )}

      {/* Status */}
      <div style={{ marginTop: 14 }}>
        {task.done ? (
          <div
            className="card"
            style={{
              padding: 14,
              borderColor: 'color-mix(in oklab, var(--ok) 35%, transparent)',
              background: 'color-mix(in oklab, var(--ok) 10%, var(--surface))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--ok)', color: '#06300f', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={18} stroke={3} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="row-t">Erledigt</div>
                {task.completedAt && (
                  <div style={{ fontSize: 12, color: 'var(--ok)', fontFamily: 'var(--ff-mono)', marginTop: 2 }}>
                    {new Date(task.completedAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={toggleDone}
              disabled={busy}
              style={{ width: '100%', marginTop: 12, padding: '9px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
            >
              Wieder öffnen
            </button>
          </div>
        ) : (
          <button
            onClick={toggleDone}
            disabled={busy}
            style={{ width: '100%', padding: '11px', borderRadius: 'var(--r-sm)', border: 0, background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <Icon name="check" size={17} stroke={2.6} /> Als erledigt markieren
          </button>
        )}
      </div>

      {/* Beschreibung */}
      <div style={{ marginTop: 16 }}>
        <div className="tag" style={{ marginBottom: 6 }}>
          Beschreibung
        </div>
        {editing ? (
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibung …" style={{ ...fieldStyle, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }} />
        ) : (
          <div className="dim" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
            {task.description || 'Keine Beschreibung.'}
          </div>
        )}
      </div>

      {/* Fällig + Phase */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="tag">Fällig</div>
          {editing ? (
            <input value={dueLabel} onChange={(e) => setDueLabel(e.target.value)} placeholder="z. B. 24. Jun" style={{ ...fieldStyle, marginTop: 6 }} />
          ) : (
            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{task.dueLabel || '—'}</div>
          )}
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="tag">Phase</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{phaseName}</div>
        </div>
      </div>

      {/* Priorität */}
      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 6 }}>
          Priorität
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
            {PROJECT_TASK_PRIORITY.map((k) => (
              <button
                key={k}
                onClick={() => void apply({ priority: k })}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 'calc(var(--r-md) - 4px)',
                  border: 0,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                  background: task.priority === k ? 'var(--surface)' : 'transparent',
                  color: task.priority === k ? PM_PRIO[k].color : 'var(--text-3)',
                }}
              >
                {PM_PRIO[k].label}
              </button>
            ))}
          </div>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '5px 11px',
              borderRadius: 99,
              color: prio.color,
              background: `color-mix(in oklab, ${prio.color} 16%, transparent)`,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: prio.color }} />
            {prio.label}
          </span>
        )}
      </div>

      {/* Mitglieder */}
      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 6 }}>
          Verknüpfte Mitglieder
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {task.members.length ? (
            task.members.map((m) => (
              <div key={m.userId} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px' }}>
                <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                  {initial(m.name)}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                {editing && (
                  <button
                    onClick={() => setMembers(task.members.filter((x) => x.userId !== m.userId).map((x) => x.userId))}
                    style={{ background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                    aria-label="Entfernen"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="dim" style={{ fontSize: 13 }}>
              Noch niemand verknüpft.
            </div>
          )}
        </div>
        {editing && addable.length > 0 && (
          <div className="card" style={{ marginTop: 8, padding: 6 }}>
            {addable.map((m) => (
              <button
                key={m.userId}
                onClick={() => setMembers([...task.members.map((x) => x.userId), m.userId])}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 10, cursor: 'pointer', background: 'none', border: 0, color: 'var(--text)', textAlign: 'left' }}
              >
                <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                  {initial(m.name)}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                <Icon name="plus" size={15} style={{ color: 'var(--text-3)' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 6 }}>
          Verknüpfte Links
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {task.links.length ? (
            task.links.map((l, i) => (
              <div key={`${l}-${i}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px' }}>
                <span style={{ display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--accent-fg)' }}>
                  <Icon name="link" size={15} />
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: 'var(--accent-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l}
                </span>
                {editing && (
                  <button
                    onClick={() => setLinks(task.links.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                    aria-label="Entfernen"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="dim" style={{ fontSize: 13 }}>
              Noch keine Links verknüpft.
            </div>
          )}
        </div>
        {editing && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={linkBuf}
              onChange={(e) => setLinkBuf(e.target.value)}
              placeholder="https://… oder Beschreibung"
              style={fieldStyle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && linkBuf.trim()) {
                  setLinks([...task.links, linkBuf.trim()]);
                  setLinkBuf('');
                }
              }}
            />
            <button
              onClick={() => {
                if (linkBuf.trim()) {
                  setLinks([...task.links, linkBuf.trim()]);
                  setLinkBuf('');
                }
              }}
              style={{ flexShrink: 0, padding: '0 16px', borderRadius: 'var(--r-sm)', border: 0, background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', fontWeight: 700 }}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
