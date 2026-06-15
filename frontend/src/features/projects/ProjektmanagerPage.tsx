import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectSummaryDto } from '@g-hub/shared';
import { listProjects } from '../../lib/api';
import { Icon } from '../../components/Icon';
import { Ring } from '../../components/ui';
import { progress } from './projectUtils';
import { MemberAvatars } from './MemberAvatars';
import { ProjectCreateModal } from './ProjectCreateModal';

export function ProjektmanagerPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    listProjects()
      .then((data) => active && setProjects(data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Projekte nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Projekte werden geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;

  const openTasks = projects.reduce((a, p) => a + (p.taskCount - p.doneCount), 0);
  const avg =
    projects.length > 0
      ? Math.round((projects.reduce((a, p) => a + progress(p.doneCount, p.taskCount), 0) / projects.length) * 100)
      : 0;

  return (
    <div className="screen stack">
      <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
        {[
          [String(projects.length), 'aktiv', 'layers'],
          [avg + '%', 'Ø Fortschritt', 'trend'],
          [String(openTasks), 'offene Aufgaben', 'clock'],
        ].map(([v, l, ic]) => (
          <div key={l} className="kpi" style={{ minHeight: 96, padding: 13 }}>
            <div className="kpi-ico">
              <Icon name={ic} size={16} />
            </div>
            <div>
              <div className="kpi-val" style={{ fontSize: 23 }}>
                {v}
              </div>
              <div className="kpi-label" style={{ marginTop: 3, fontSize: 11 }}>
                {l}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-head">
        <div className="sec-title">Projekte</div>
        <span className="dim" style={{ fontSize: 12 }}>
          {projects.length}
        </span>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {projects.map((p) => {
          const pct = Math.round(progress(p.doneCount, p.taskCount) * 100);
          return (
            <button
              key={p.id}
              className="card tap"
              onClick={() => navigate(`/projekte/projektmanager/${p.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textAlign: 'left', width: '100%' }}
            >
              <Ring pct={progress(p.doneCount, p.taskCount)} size={54} sw={6}>
                {pct}%
              </Ring>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-t" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div className="row-s" style={{ marginTop: 2 }}>
                  {p.doneCount}/{p.taskCount}
                  {p.kind ? ` · ${p.kind}` : ''}
                </div>
                <div style={{ marginTop: 8 }}>
                  <MemberAvatars members={p.members} size={22} max={4} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                {p.dueLabel && (
                  <span
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 7,
                      color: 'var(--text-3)',
                      background: 'var(--surface-2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ◷ {p.dueLabel}
                  </span>
                )}
                <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)' }} />
              </div>
            </button>
          );
        })}

        {projects.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div className="dim" style={{ fontSize: 13 }}>
              Noch keine Projekte. Lege das erste an.
            </div>
          </div>
        )}
      </div>

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
        <Icon name="plus" size={18} stroke={2.2} /> Neues Projekt
      </button>

      {showCreate && (
        <ProjectCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(p) => {
            setShowCreate(false);
            navigate(`/projekte/projektmanager/${p.id}`);
          }}
        />
      )}
    </div>
  );
}
