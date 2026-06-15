import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CampaignSummaryDto } from '@g-hub/shared';
import { listCampaigns } from '../../lib/api';
import { Icon } from '../../components/Icon';
import { Ring, StatusTag } from '../../components/ui';
import { campaignColor, channelMeta, fmtNum, ratio } from './campaignUtils';
import { CampaignCreateModal } from './CampaignCreateModal';

type View = 'liste' | 'baum';

const VIEWS: Array<[View, string]> = [
  ['liste', 'Liste'],
  ['baum', 'Baum'],
];

function ChannelBadges({ channels, size = 26 }: { channels: string[]; size?: number }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {channels.map((c) => {
        const m = channelMeta(c);
        return (
          <span
            key={c}
            className="cbadge"
            title={m.label}
            style={{ width: size, height: size, background: m.color, color: '#0d0f12', fontSize: size * 0.42 }}
          >
            {m.short}
          </span>
        );
      })}
    </div>
  );
}

function ListView({
  campaigns,
  onOpen,
}: {
  campaigns: CampaignSummaryDto[];
  onOpen: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {campaigns.map((k) => (
        <div key={k.id} className="card tap" style={{ cursor: 'pointer' }} onClick={() => onOpen(k.id)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <StatusTag status={k.status} />
                {k.zeitraum && <span className="dim" style={{ fontSize: 12 }}>· {k.zeitraum}</span>}
              </div>
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16.5 }}>{k.name}</div>
            </div>
            <ChannelBadges channels={k.channels} />
          </div>
          <div style={{ display: 'flex', gap: 18, margin: '12px 0' }}>
            <div>
              <div className="tag">Maßnahmen</div>
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16, marginTop: 2 }}>{k.measureCount}</div>
            </div>
            <div>
              <div className="tag">Rabatte</div>
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16, marginTop: 2 }}>{k.discountCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="bar" style={{ flex: 1 }}>
              <span style={{ width: ratio(k.spent, k.budget) * 100 + '%', background: campaignColor(k.color) }} />
            </div>
            <span className="dim" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11.5 }}>
              {fmtNum(k.spent)}/{fmtNum(k.budget)}€
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TreeView({
  campaigns,
  onOpen,
}: {
  campaigns: CampaignSummaryDto[];
  onOpen: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className="stack" style={{ gap: 12 }}>
      {campaigns.map((k) => (
        <div key={k.id} className="card tap" style={{ padding: '6px 14px', cursor: 'pointer' }} onClick={() => onOpen(k.id)}>
          <div className="row" style={{ borderTop: 'none' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: campaignColor(k.color),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d0f12',
                flexShrink: 0,
              }}
            >
              <Icon name="campaign" size={17} />
            </div>
            <div className="row-main">
              <div className="row-t" style={{ fontSize: 15 }}>{k.name}</div>
              <div className="row-s">
                {k.measureCount} Maßnahmen · {k.discountCount} Rabatte{k.zeitraum ? ` · ${k.zeitraum}` : ''}
              </div>
            </div>
            <StatusTag status={k.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KampagnenPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('liste');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    listCampaigns()
      .then((data) => active && setCampaigns(data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Kampagnen nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Kampagnen werden geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;

  const open = (id: string): void => navigate(`/projekte/kampagnen/${id}`);
  const totB = campaigns.reduce((s, k) => s + k.budget, 0);
  const totS = campaigns.reduce((s, k) => s + k.spent, 0);
  const liveCount = campaigns.filter((k) => k.status === 'live').length;
  const pct = ratio(totS, totB);

  return (
    <div className="screen stack">
      {/* Budget gesamt */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Ring pct={pct} size={60} sw={7}>
          <span style={{ fontSize: 12 }}>{Math.round(pct * 100)}%</span>
        </Ring>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tag" style={{ marginBottom: 4 }}>Budget gesamt</div>
          <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 20 }}>
            {fmtNum(totS)} € <span className="dim" style={{ fontSize: 13 }}>/ {fmtNum(totB)} €</span>
          </div>
          <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>
            {liveCount} live · {campaigns.length} Kampagnen
          </div>
        </div>
      </div>

      {/* Ansichtsumschalter */}
      <div className="seg">
        {VIEWS.map(([k, l]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
            {l}
          </button>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="dim" style={{ fontSize: 13 }}>Noch keine Kampagnen. Lege die erste an.</div>
        </div>
      ) : view === 'liste' ? (
        <ListView campaigns={campaigns} onOpen={open} />
      ) : (
        <TreeView campaigns={campaigns} onOpen={open} />
      )}

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
        <Icon name="plus" size={18} stroke={2.2} /> Neue Kampagne
      </button>

      {showCreate && (
        <CampaignCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => {
            setShowCreate(false);
            navigate(`/projekte/kampagnen/${c.id}`);
          }}
        />
      )}
    </div>
  );
}
