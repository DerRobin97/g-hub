import { useEffect, useMemo, useState } from 'react';
import type { TaskDto } from '@g-hub/shared';
import { listTasks, updateTask } from '../../lib/api';
import { Icon } from '../../components/Icon';
import {
  PRIO,
  dayOf,
  formatDayLabel,
  kwOf,
  roleLabel,
  todayIso,
  weekDays,
} from './taskUtils';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';

function TaskRow({
  task,
  showDate,
  onOpen,
  onToggle,
}: {
  task: TaskDto;
  showDate: boolean;
  onOpen: () => void;
  onToggle: () => void;
}): React.JSX.Element {
  const role = roleLabel(task.role);
  const erledigt = task.status === 'erledigt';
  const due = (task.dueLabel ?? (dayOf(task.dueDate) ? formatDayLabel(dayOf(task.dueDate) as string) : '')) || '—';
  return (
    <div
      className="card tap"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, opacity: erledigt ? 0.55 : 1 }}
    >
      <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: PRIO[task.priority].color, flexShrink: 0 }} />
      <button
        onClick={onToggle}
        aria-label={erledigt ? 'Wieder öffnen' : 'Als erledigt markieren'}
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: 7,
          border: erledigt ? '0' : '2px solid var(--line-strong)',
          background: erledigt ? 'var(--accent)' : 'transparent',
          color: 'var(--accent-ink)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {erledigt && <Icon name="check" size={13} stroke={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }} onClick={onOpen}>
        <div
          className="row-t"
          style={{ whiteSpace: 'normal', lineHeight: 1.3, textDecoration: erledigt ? 'line-through' : 'none' }}
        >
          {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              color: 'var(--text-3)',
            }}
          >
            <Icon name="clock" size={12} />
            {showDate ? due + (task.time ? ` · ${task.time}` : '') : task.time || '—'}
          </span>
          <span
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 9.5,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              color: role.accent ? 'var(--accent-fg)' : 'var(--text-3)',
              background: role.accent ? 'var(--accent-soft)' : 'var(--surface-2)',
            }}
          >
            {role.label}
          </span>
          {task.projectText && (
            <span className="dim" style={{ fontSize: 11.5 }}>
              · {task.projectText}
            </span>
          )}
        </div>
      </div>
      <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
    </div>
  );
}

export function AufgabenPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selDay, setSelDay] = useState(todayIso);
  const [detail, setDetail] = useState<TaskDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    listTasks({ assignee: 'me' })
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Konnte Aufgaben nicht laden.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const week = useMemo(() => weekDays(anchor), [anchor]);
  const today = todayIso();

  const byDay = useMemo(() => {
    const map: Record<string, TaskDto[]> = {};
    for (const t of tasks) {
      const d = dayOf(t.dueDate);
      if (d) (map[d] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const offen = tasks.filter((t) => t.status !== 'erledigt').length;
  const heute = tasks.filter((t) => dayOf(t.dueDate) === today && t.status !== 'erledigt').length;
  const weekSet = new Set(week.map((w) => w.iso));
  const woche = tasks.filter(
    (t) => t.status !== 'erledigt' && dayOf(t.dueDate) && weekSet.has(dayOf(t.dueDate) as string),
  ).length;

  const selTasks = byDay[selDay] ?? [];
  const selLabel = selDay === today ? 'Heute fällig' : formatDayLabel(selDay);
  const upcoming = tasks
    .filter((t) => t.status !== 'erledigt' && (!t.dueDate || (dayOf(t.dueDate) as string) > selDay))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    .slice(0, 5);

  const replace = (u: TaskDto): void => setTasks((prev) => prev.map((t) => (t.id === u.id ? u : t)));
  const removeLocal = (id: string): void => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDetail(null);
  };
  const quickToggle = (t: TaskDto): void => {
    const next = t.status === 'erledigt' ? 'offen' : 'erledigt';
    void updateTask(t.id, { status: next }).then(replace);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Aufgaben werden geladen …</div>;
  }
  if (error) {
    return (
      <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>
    );
  }

  return (
    <div className="screen stack">
      {/* KPI-Übersicht */}
      <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
        {[
          [offen, 'offen', 'var(--text)'],
          [heute, 'heute fällig', 'var(--bad)'],
          [woche, 'diese Woche', 'var(--text)'],
        ].map(([v, l, c]) => (
          <div key={l} className="kpi" style={{ minHeight: 88, padding: 13, alignItems: 'flex-start' }}>
            <div className="kpi-val" style={{ fontSize: 26, color: c as string }}>
              {v}
            </div>
            <div className="kpi-label" style={{ marginTop: 4, fontSize: 11 }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Wochenkalender */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="sec-title" style={{ fontSize: 14 }}>
            KW {kwOf(week[0].date)} · {formatDayLabel(week[0].iso).split('. ')[1]} {week[0].date.getFullYear()}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="icon-btn"
              style={{ width: 30, height: 30 }}
              onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
              aria-label="Vorige Woche"
            >
              <Icon name="chevronL" size={14} />
            </button>
            <button
              className="icon-btn"
              style={{ width: 30, height: 30 }}
              onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
              aria-label="Nächste Woche"
            >
              <Icon name="chevronR" size={14} />
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
          {week.map((d) => {
            const items = byDay[d.iso] ?? [];
            const on = selDay === d.iso;
            const isToday = d.iso === today;
            return (
              <button
                key={d.iso}
                onClick={() => setSelDay(d.iso)}
                className="cal-cell"
                style={{
                  aspectRatio: '1 / 1.35',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid ' + (on ? 'var(--accent)' : isToday ? 'var(--accent-line)' : 'var(--line)'),
                  cursor: 'pointer',
                  background: on
                    ? 'color-mix(in oklab, var(--accent) 14%, var(--surface))'
                    : isToday
                      ? 'color-mix(in oklab, var(--accent) 7%, var(--surface))'
                      : 'var(--surface)',
                }}
              >
                <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{d.dow}</span>
                <span style={{ fontSize: 15, color: isToday ? 'var(--accent-fg)' : 'var(--text-2)', fontWeight: 600 }}>
                  {d.num}
                </span>
                <div style={{ display: 'flex', gap: 2, minHeight: 6 }}>
                  {items.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: PRIO[p.priority].color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aufgaben des gewählten Tags */}
      <div className="sec-head">
        <div className="sec-title">{selLabel}</div>
        <span className="dim" style={{ fontSize: 12 }}>
          {selTasks.length}
        </span>
      </div>
      <div className="stack" style={{ gap: 10 }}>
        {selTasks.length ? (
          selTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              showDate={false}
              onOpen={() => setDetail(t)}
              onToggle={() => quickToggle(t)}
            />
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div className="dim" style={{ fontSize: 13 }}>
              Keine Aufgaben an diesem Tag.
            </div>
          </div>
        )}
      </div>

      {/* Als Nächstes */}
      {upcoming.length > 0 && (
        <>
          <div className="sec-head">
            <div className="sec-title">Als Nächstes</div>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {upcoming.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                showDate
                onOpen={() => setDetail(t)}
                onToggle={() => quickToggle(t)}
              />
            ))}
          </div>
        </>
      )}

      {/* Neue Aufgabe */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 16px',
          borderRadius: 'var(--r-md)',
          border: '1px dashed var(--line-strong)',
          background: 'var(--surface)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        <Icon name="plus" size={18} stroke={2.2} /> Neue Aufgabe
      </button>

      {detail && (
        <TaskDetailModal
          task={detail}
          onClose={() => setDetail(null)}
          onChanged={replace}
          onDeleted={removeLocal}
        />
      )}
      {showCreate && (
        <TaskCreateModal
          defaultDate={selDay}
          onClose={() => setShowCreate(false)}
          onCreated={(t) => {
            setTasks((prev) => [t, ...prev]);
            setShowCreate(false);
            const d = dayOf(t.dueDate);
            if (d) setSelDay(d);
          }}
        />
      )}
    </div>
  );
}
