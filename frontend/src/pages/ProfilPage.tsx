import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useOverlay } from '../app/OverlayContext';
import { Icon } from '../components/Icon';
import { Bars, Ring, SectionHead, useReveal } from '../components/ui';
import {
  clearDemoData,
  getTimeMonth,
  getTimeToday,
  listTasks,
  seedDemoData,
  type TaskDto,
  type TimeEntryDto,
  type TimeOverviewDto,
} from '../lib/api';
import { dayOf, todayIso, weekDays } from '../features/tasks/taskUtils';
import { APP_VERSION } from '../lib/version';

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

interface TimeStatusInfo {
  label: string;
  color: string;
}

function timeStatusInfo(entry: TimeEntryDto | null): TimeStatusInfo {
  if (entry?.status === 'in') return { label: 'Eingestempelt', color: 'var(--ok)' };
  if (entry?.status === 'break') return { label: 'Pause', color: 'var(--warn)' };
  return { label: 'Ausgestempelt', color: 'var(--text-3)' };
}

interface SettingItem {
  icon: string;
  label: string;
  onClick?: () => void;
}

/** Profil-Übersicht (Aufgaben-/Arbeitszeit-Kennzahlen, Einstellungen, Darstellung). */
export function ProfilPage(): React.JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { open } = useOverlay();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [month, setMonth] = useState<TimeOverviewDto | null>(null);
  const [today, setToday] = useState<TimeEntryDto | null>(null);

  useEffect(() => {
    let active = true;
    void listTasks({ assignee: 'me' }).then((t) => active && setTasks(t)).catch(() => {});
    void getTimeMonth().then((m) => active && setMonth(m)).catch(() => {});
    void getTimeToday().then((e) => active && setToday(e)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // ── Aufgaben-Kennzahlen ──────────────────────────────────────
  const openTasks = tasks.filter((t) => t.status !== 'erledigt');
  const todayKey = todayIso();
  const weekIsos = new Set(weekDays(new Date()).map((d) => d.iso));
  const dueToday = openTasks.filter((t) => dayOf(t.dueDate) === todayKey).length;
  const dueWeek = openTasks.filter((t) => {
    const d = dayOf(t.dueDate);
    return d !== null && weekIsos.has(d);
  }).length;

  // ── Arbeitszeit-Kennzahlen ───────────────────────────────────
  const weekSeconds = month ? month.week.reduce((s, d) => s + d.seconds, 0) : 0;
  const weeklyTarget = month?.settings.weeklyTarget ?? 0;
  const targetSeconds = weeklyTarget * 3600;
  const timePct = targetSeconds > 0 ? Math.min(1, weekSeconds / targetSeconds) : 0;
  const weekHours = (weekSeconds / 3600).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const status = timeStatusInfo(today);

  // ── Profil-Kopf ──────────────────────────────────────────────
  const initial = (user?.name?.trim()?.[0] ?? 'G').toUpperCase();
  const role = user?.memberships[0]?.role ?? 'Mitglied';

  const settings: SettingItem[] = [
    { icon: 'shield', label: 'Konto & Sicherheit' },
    { icon: 'bell', label: 'Benachrichtigungen', onClick: () => open('alerts') },
    { icon: 'eye', label: 'Darstellung', onClick: () => open('darstellung') },
    { icon: 'message', label: 'Hilfe & Support' },
  ];

  return (
    <div ref={root} className="screen stack" style={{ maxWidth: 560, gap: 22 }}>
      {/* 1 — Profil-Kopf */}
      <section
        className="reveal r-up"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div className="avatar" style={{ width: 88, height: 88, fontSize: 32 }}>
            {initial}
          </div>
        )}
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 22, marginTop: 6 }}>
          {user?.name}
        </div>
        <div className="dim" style={{ fontSize: 13 }}>G-Hub</div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            padding: '5px 12px',
            borderRadius: 999,
            background: 'color-mix(in oklab, var(--accent) 16%, transparent)',
            color: 'var(--accent-fg)',
            fontSize: 12.5,
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        >
          <Icon name="shield" size={13} /> {role}
        </span>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
          {user?.email}
        </div>
        {user?.phone && (
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--text-2)' }}>
            {user.phone}
          </div>
        )}
        <button
          className="btn btn-ghost"
          style={{ height: 42, marginTop: 12 }}
          onClick={() => open('profileEdit')}
        >
          <Icon name="edit" size={16} /> Profil bearbeiten
        </button>
      </section>

      {/* 2 — Hero „Meine Aufgaben" */}
      <button
        className="feature tap reveal r-up"
        onClick={() => navigate('/profil/aufgaben')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          textAlign: 'left',
          font: 'inherit',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Meine Aufgaben
          </div>
          <div className="big" style={{ margin: '8px 0 6px' }}>{openTasks.length}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {dueToday} heute fällig · {dueWeek} diese Woche
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 12,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          Öffnen <Icon name="chevronR" size={16} />
        </span>
      </button>

      {/* 3 — Arbeitszeit */}
      <div className="reveal r-up">
        <SectionHead title="Arbeitszeit" link="Verwalten" onLink={() => open('worktime')} />
        <div
          className="card tap"
          style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 16 }}
          onClick={() => open('worktime')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Ring pct={timePct} size={64} sw={7}>
              <span style={{ fontSize: 15 }}>{Math.round(timePct * 100)}</span>
            </Ring>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 20 }}>
                {weekHours} / {weeklyTarget} Std
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, color: 'var(--text-2)' }}>
                <span className="sdot" style={{ background: status.color }} />
                {status.label}
              </div>
            </div>
          </div>
          {month && month.week.length > 0 && (
            <Bars
              data={month.week.map((d) => d.seconds / 3600)}
              labels={month.week.map((d) => d.label)}
              h={84}
            />
          )}
        </div>
      </div>

      {/* 4 — Einstellungs-Liste */}
      <div className="card reveal r-up" style={{ padding: '4px 16px' }}>
        {settings.map((s) => (
          <button
            key={s.label}
            className="row"
            onClick={s.onClick}
            style={{
              width: '100%',
              background: 'none',
              border: 0,
              cursor: s.onClick ? 'pointer' : 'default',
              font: 'inherit',
              textAlign: 'left',
              color: 'var(--text)',
            }}
          >
            <span className="kpi-ico">
              <Icon name={s.icon} size={18} />
            </span>
            <span className="row-main row-t">{s.label}</span>
            <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>

      {/* 5 — Abmelden */}
      <button
        className="btn btn-ghost btn-block reveal r-up"
        style={{ color: 'var(--bad)' }}
        onClick={() => void logout()}
      >
        Abmelden
      </button>

      {/* 6 — Versionszeile */}
      <div
        className="reveal r-up"
        style={{ textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--text-3)' }}
      >
        G-Hub · {APP_VERSION}
      </div>

      <DemoControls />
    </div>
  );
}
