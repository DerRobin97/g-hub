import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ProjectDetailDto, ProjectMemberDto, ProjectTaskDto } from '@g-hub/shared';
import {
  createPhase,
  createProjectTask,
  getProject,
  listProjectMembers,
  updateProject,
  updateProjectTask,
} from '../../lib/api';
import { Icon } from '../../components/Icon';
import { Ring } from '../../components/ui';
import { PM_PRIO, groupTasks, initial, progress, type GroupMode } from './projectUtils';
import { MemberAvatars } from './MemberAvatars';
import { ProjectTaskModal } from './ProjectTaskModal';

const GROUPS: Array<[GroupMode, string]> = [
  ['phase', 'Phase'],
  ['member', 'Mitglied'],
  ['due', 'Fälligkeit'],
];

function TaskLine({
  task,
  onToggle,
  onOpen,
}: {
  task: ProjectTaskDto;
  onToggle: () => void;
  onOpen: () => void;
}): React.JSX.Element {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px' }}>
      <button
        onClick={onToggle}
        aria-label="Abhaken"
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          borderRadius: 7,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          border: task.done ? '0' : '2px solid var(--line-strong)',
          background: task.done ? 'var(--accent)' : 'transparent',
          color: 'var(--accent-ink)',
        }}
      >
        {task.done && <Icon name="check" size={13} stroke={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onOpen}>
        <div
          className="row-t"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textDecoration: task.done ? 'line-through' : 'none',
            color: task.done ? 'var(--text-3)' : 'var(--text)',
          }}
        >
          {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: PM_PRIO[task.priority].color, flexShrink: 0 }} />
          <span className="dim" style={{ fontFamily: 'var(--ff-mono)', fontSize: 10.5 }}>
            {task.done ? `✓ erledigt` : `◷ ${task.dueLabel || 'offen'}`}
          </span>
        </div>
      </div>
      {task.members.length > 0 && <MemberAvatars members={task.members} size={22} max={2} />}
    </div>
  );
}

export function ProjectDetailPage(): React.JSX.Element {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const [detail, setDetail] = useState<ProjectDetailDto | null>(null);
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupMode>('phase');
  const [descOpen, setDescOpen] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descBuf, setDescBuf] = useState('');
  const [openTask, setOpenTask] = useState<{ task: ProjectTaskDto; phaseName: string } | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    const d = await getProject(projectId);
    setDetail(d);
  }, [projectId]);

  useEffect(() => {
    let active = true;
    Promise.all([getProject(projectId), listProjectMembers()])
      .then(([d, m]) => {
        if (!active) return;
        setDetail(d);
        setMembers(m);
      })
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Projekt nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [projectId]);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Projekt wird geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;
  if (!detail) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Projekt nicht gefunden.</div>;

  const pct = Math.round(progress(detail.doneCount, detail.taskCount) * 100);

  const toggleTask = async (task: ProjectTaskDto): Promise<void> => {
    if (task.done && !window.confirm('Diese Aufgabe ist erledigt. Wirklich wieder öffnen?')) return;
    await updateProjectTask(task.id, { done: !task.done });
    await reload();
  };

  const addPhase = async (): Promise<void> => {
    const name = window.prompt('Name der Phase:');
    if (name?.trim()) {
      setDetail(await createPhase(detail.id, name.trim()));
    }
  };

  const addTask = async (phaseId: string): Promise<void> => {
    const title = window.prompt('Titel der Aufgabe:');
    if (title?.trim()) {
      await createProjectTask(phaseId, { title: title.trim() });
      await reload();
    }
  };

  const saveDesc = async (): Promise<void> => {
    if (descBuf !== (detail.description ?? '')) {
      setDetail(await updateProject(detail.id, { description: descBuf.trim() || null }));
    }
    setEditingDesc(false);
  };

  const groups = groupTasks(detail, group);

  return (
    <div className="screen stack">
      {/* Kopf */}
      <div>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>
          {detail.name}
        </div>
        {detail.kind && <div className="dim" style={{ fontSize: 13, marginTop: 2 }}>{detail.kind}</div>}
      </div>

      {/* Beschreibung */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {editingDesc ? (
          <div style={{ padding: 14 }}>
            <div className="tag" style={{ marginBottom: 6 }}>Beschreibung</div>
            <textarea
              value={descBuf}
              onChange={(e) => setDescBuf(e.target.value)}
              placeholder="Projektbeschreibung …"
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 78, resize: 'vertical', background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 'var(--r-sm)', padding: '10px 12px', color: 'var(--text)', font: 'inherit', fontSize: 13.5, lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingDesc(false)} style={{ padding: '8px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
                Abbrechen
              </button>
              <button onClick={() => void saveDesc()} style={{ padding: '8px 16px', borderRadius: 'var(--r-sm)', border: 0, background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', fontWeight: 700 }}>
                Speichern
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex' }}>
              <button
                onClick={() => setDescOpen((o) => !o)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 0, color: 'var(--text)', fontFamily: 'var(--ff)', fontSize: 12.5, fontWeight: 700, padding: '13px 15px', cursor: 'pointer' }}
              >
                <span className="tag" style={{ color: 'var(--text-2)' }}>Beschreibung</span>
                <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)', transform: descOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              <button
                onClick={() => {
                  setDescBuf(detail.description ?? '');
                  setEditingDesc(true);
                }}
                aria-label="Beschreibung bearbeiten"
                style={{ padding: '0 14px', background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <Icon name="edit" size={15} />
              </button>
            </div>
            {descOpen && (
              <div className="dim" style={{ padding: '0 15px 14px', fontSize: 13.5, lineHeight: 1.55 }}>
                {detail.description || 'Keine Beschreibung.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fortschritt */}
      <div className="card" style={{ textAlign: 'center', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Ring pct={progress(detail.doneCount, detail.taskCount)} size={92} sw={9}>
            {pct}%
          </Ring>
        </div>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16, marginTop: 11 }}>{pct} % abgeschlossen</div>
        <div className="dim" style={{ fontSize: 12.5, marginTop: 3 }}>
          {detail.doneCount} von {detail.taskCount} Aufgaben{detail.dueLabel ? ` · fällig ${detail.dueLabel}` : ''}
        </div>
      </div>

      {/* Verantwortlich + Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="card" style={{ padding: 13 }}>
          <div className="tag">Verantwortlich</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            {detail.lead ? (
              <>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                  {initial(detail.lead.name)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{detail.lead.name.split(' ')[0]}</span>
              </>
            ) : (
              <span className="dim" style={{ fontSize: 13 }}>—</span>
            )}
          </div>
        </div>
        <div className="card" style={{ padding: 13 }}>
          <div className="tag">Budget</div>
          <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 15, marginTop: 8 }}>
            {detail.budgetText || '—'}
          </div>
        </div>
      </div>

      {/* Aufgaben */}
      <div className="sec-head">
        <div className="sec-title">Aufgaben</div>
      </div>
      <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
        {GROUPS.map(([g, l]) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 'calc(var(--r-md) - 4px)',
              border: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              background: group === g ? 'var(--surface)' : 'transparent',
              color: group === g ? 'var(--text)' : 'var(--text-3)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {group === 'phase' ? (
        <div className="stack" style={{ gap: 8 }}>
          {detail.phases.map((ph) => {
            const open = ph.tasks.filter((t) => !t.done).length;
            return (
              <div key={ph.id} className="stack" style={{ gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                  <span>{ph.name}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)' }}>{open} offen · {ph.tasks.length}</span>
                </div>
                {ph.tasks.map((t) => (
                  <TaskLine key={t.id} task={t} onToggle={() => void toggleTask(t)} onOpen={() => setOpenTask({ task: t, phaseName: ph.name })} />
                ))}
                <button
                  onClick={() => void addTask(ph.id)}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px dashed var(--line-strong)', background: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
                >
                  <Icon name="plus" size={14} /> Aufgabe
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          {groups.map((g) => {
            const open = g.items.filter((it) => !it.task.done).length;
            return (
              <div key={g.label} className="stack" style={{ gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                  <span>{g.label}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)' }}>{open} offen · {g.items.length}</span>
                </div>
                {g.items.map((it) => (
                  <TaskLine
                    key={it.task.id}
                    task={it.task}
                    onToggle={() => void toggleTask(it.task)}
                    onOpen={() => setOpenTask({ task: it.task, phaseName: it.phaseName })}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => void addPhase()}
        style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px dashed var(--line-strong)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
      >
        <Icon name="plus" size={16} stroke={2.2} /> Phase hinzufügen
      </button>

      {openTask && (
        <ProjectTaskModal
          task={openTask.task}
          phaseName={openTask.phaseName}
          projectMembers={members}
          onClose={() => setOpenTask(null)}
          onChanged={() => void reload()}
          onDeleted={() => {
            setOpenTask(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
