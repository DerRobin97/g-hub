import { useEffect, useState } from 'react';
import { APP_VERSION } from '@g-hub/shared';
import { getHealth, type HealthResponse } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import { PageGrid, PlaceholderCard } from './Placeholder';

/**
 * Dashboard-Platzhalter (Phase 1, Schritt 2 füllt die Kacheln mit echten Aggregaten).
 */
export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const workspace = user?.memberships[0];

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {workspace && (
        <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>
          Aktiver Workspace: <strong style={{ color: 'var(--text)' }}>{workspace.workspaceName}</strong>{' '}
          <span style={{ color: 'var(--text-3)' }}>· {workspace.role}</span>
        </div>
      )}

      <PageGrid>
        <PlaceholderCard icon="message" title="Social-Media-Planer" sub="Anstehende Posts" />
        <PlaceholderCard icon="campaign" title="Kampagnen" sub="Laufende Maßnahmen" />
        <PlaceholderCard icon="check" title="Meine Aufgaben" sub="Offene To-dos" />
        <PlaceholderCard icon="chart" title="Analytics" sub="Reichweite & Trends" />
      </PageGrid>

      <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0 }}>
        G-Hub v{APP_VERSION} · Backend:{' '}
        <span style={{ color: health?.db === 'up' ? 'var(--ok)' : 'var(--warn)' }}>
          {health ? `${health.status} / db ${health.db}` : '…'}
        </span>
      </p>
    </div>
  );
}
