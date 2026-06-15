import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_VERSION, type CampaignSummaryDto } from '@g-hub/shared';
import { getHealth, listCampaigns, type HealthResponse } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../components/Icon';
import { Delta, Ring, SectionHead, Spark, StatusTag, type StatusKey } from '../components/ui';
import { campaignColor, ratio } from '../features/campaigns/campaignUtils';

/**
 * Dashboard-Grundgerüst (Bauplan §… / NEXT_STEPS Schritt 2).
 * Struktur 1:1 aus dem Prototyp `dashboard.jsx`, vorerst mit Platzhalter-Daten.
 * Die echten Aggregate folgen, sobald die Fachbereiche Daten liefern.
 */

interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: number;
  up: boolean;
}
const KPIS: Kpi[] = [
  { id: 'reach', label: 'Reichweite', value: '128,4k', delta: 8.2, up: true },
  { id: 'eng', label: 'Engagement', value: '6,1%', delta: 1.4, up: true },
  { id: 'fol', label: 'Follower', value: '12.840', delta: 2.0, up: true },
  { id: 'conv', label: 'Conversions', value: '312', delta: 3.1, up: false },
];

const FOCUS_SPARK = [42, 48, 45, 53, 61, 58, 67, 72, 69, 78, 84, 92];

const CHANNEL_MIX: Array<{ name: string; val: number; color: string }> = [
  { name: 'Instagram', val: 46, color: '#e1306c' },
  { name: 'Facebook', val: 32, color: '#1877f2' },
  { name: 'LinkedIn', val: 22, color: '#0a66c2' },
];

const UPCOMING: Array<{ ch: string; short: string; color: string; t: string; when: string; status: StatusKey }> = [
  { ch: 'instagram', short: 'IG', color: '#e1306c', t: 'Reel: Neue Akku-Geräte', when: '17. Jun · 10:00 Uhr', status: 'sched' },
  { ch: 'facebook', short: 'FB', color: '#1877f2', t: 'Post: Pflanzen-Tipps Juni', when: '18. Jun · 14:30 Uhr', status: 'draft' },
  { ch: 'linkedin', short: 'LI', color: '#0a66c2', t: 'Fachbeitrag: Forsttechnik', when: '20. Jun · 09:00 Uhr', status: 'review' },
];

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummaryDto[]>([]);
  const workspace = user?.memberships[0];

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    listCampaigns()
      .then(setCampaigns)
      .catch(() => setCampaigns([]));
  }, []);

  // „Aktive Kampagnen": laufende zuerst, sonst die neuesten — auf 3 begrenzt.
  const activeCampaigns = [...campaigns]
    .sort((a, b) => Number(b.status === 'live') - Number(a.status === 'live'))
    .slice(0, 3);

  return (
    <div className="screen stack">
      {/* KPI-Leiste */}
      <div className="dash-strip" style={{ marginTop: 4 }}>
        {KPIS.map((k) => (
          <div key={k.id} className="dash-chip">
            <div className="dash-chip-v">{k.value}</div>
            <div className="dash-chip-l">{k.label}</div>
            <div className={'dash-chip-d delta ' + (k.up ? 'up' : 'down')}>
              <Icon name="trend" size={11} stroke={2.2} style={k.up ? undefined : { transform: 'scaleY(-1)' }} />
              {(k.up ? '+' : '−') + Math.abs(k.delta).toString().replace('.', ',')}%
            </div>
          </div>
        ))}
      </div>

      {/* Fokus-Karte — Reichweite */}
      <div className="dash-focus">
        <div className="dash-focus-top">
          <div>
            <div className="tag" style={{ marginBottom: 7 }}>
              Reichweite im Fokus
            </div>
            <div className="dash-focus-val">128,4k</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Delta value={12.4} up />
            <div className="dim" style={{ fontSize: 11.5, marginTop: 4 }}>
              vs. Vorwoche
            </div>
          </div>
        </div>
        <div className="dash-focus-chart">
          <Spark data={FOCUS_SPARK} h={64} sw={2.4} />
        </div>
        <div className="tag" style={{ margin: '13px 0 9px' }}>
          Nach Kanal
        </div>
        <div className="dash-split">
          {CHANNEL_MIX.map((c) => (
            <span key={c.name} className="dash-seg" style={{ flex: c.val, background: c.color }} />
          ))}
        </div>
        <div className="dash-legend">
          {CHANNEL_MIX.map((c) => (
            <div key={c.name} className="dash-leg-i">
              <span className="dash-leg-dot" style={{ background: c.color }} />
              {c.name}
              <span className="dim" style={{ marginLeft: 5 }}>
                {c.val}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Aktive Kampagnen */}
      <div>
        <SectionHead title="Aktive Kampagnen" link="Alle" onLink={() => navigate('/projekte/kampagnen')} />
        <div className="stack" style={{ marginTop: 10 }}>
          {activeCampaigns.map((c) => {
            const pct = ratio(c.spent, c.budget);
            return (
              <div
                key={c.id}
                className="card tap"
                onClick={() => navigate(`/projekte/kampagnen/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <Ring pct={pct} size={48} sw={6} color={campaignColor(c.color)}>
                  <span style={{ fontSize: 12 }}>{Math.round(pct * 100)}</span>
                </Ring>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-t" style={{ fontSize: 15 }}>
                    {c.name}
                  </div>
                  <div
                    className="dim"
                    style={{ fontSize: 12.5, marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <StatusTag status={c.status} />
                    {c.kpiText && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--accent-fg)' }}>{c.kpiText}</span>
                      </>
                    )}
                  </div>
                </div>
                <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
              </div>
            );
          })}
          {activeCampaigns.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div className="dim" style={{ fontSize: 13 }}>Noch keine Kampagnen angelegt.</div>
            </div>
          )}
        </div>
      </div>

      {/* Als Nächstes geplant */}
      <div>
        <SectionHead title="Als Nächstes geplant" link="Planer" onLink={() => navigate('/projekte/planer')} />
        <div className="card" style={{ marginTop: 10, padding: '4px 16px' }}>
          {UPCOMING.map((p) => (
            <div key={p.t} className="row">
              <div
                className="cbadge"
                style={{ width: 34, height: 34, background: p.color, fontSize: 13 }}
              >
                {p.short}
              </div>
              <div className="row-main">
                <div className="row-t">{p.t}</div>
                <div className="row-s">{p.when}</div>
              </div>
              <StatusTag status={p.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Aufgaben + Team Schnellzugriff */}
      <div className="kpi-grid">
        <div
          className="card tap"
          onClick={() => navigate('/profil/aufgaben')}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div className="kpi-ico">
            <Icon name="check" size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 22 }}>
              7 <span style={{ fontSize: 13, color: 'var(--text-3)' }}>offen</span>
            </div>
            <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>
              Aufgaben heute
            </div>
          </div>
        </div>
        <div className="card tap" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="kpi-ico">
            <Icon name="users" size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 22 }}>
              5 <span style={{ fontSize: 13, color: 'var(--text-3)' }}>aktiv</span>
            </div>
            <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>
              Team
            </div>
          </div>
        </div>
      </div>

      {/* Asset-Verknüpfung */}
      <div className="card tap" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="kpi-ico" style={{ width: 40, height: 40, borderRadius: 12 }}>
          <Icon name="layers" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="row-t" style={{ fontSize: 15 }}>
            Asset-Bibliothek
          </div>
          <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>
            48 Medien · zuletzt 6 neu
          </div>
        </div>
        <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
      </div>

      {/* Status-Fußzeile (echt) */}
      <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>
        {workspace ? `${workspace.workspaceName} · ` : ''}G-Hub v{APP_VERSION} · Backend:{' '}
        <span style={{ color: health?.db === 'up' ? 'var(--ok)' : 'var(--warn)' }}>
          {health ? `${health.status} / db ${health.db}` : '…'}
        </span>
      </p>
    </div>
  );
}
