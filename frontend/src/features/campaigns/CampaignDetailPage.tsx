import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CAMPAIGN_STATUS, type CampaignDetailDto, type CampaignStatus, type MeasureDto } from '@g-hub/shared';
import { deleteCampaign, deleteMeasure, getCampaign, updateCampaign } from '../../lib/api';
import { Icon } from '../../components/Icon';
import { StatusTag } from '../../components/ui';
import {
  CAMPAIGN_STATUS_LABEL,
  fmtNum,
  measureTypeLabel,
  MEASURE_TYPE_TONE,
} from './campaignUtils';
import { MeasureCreateModal } from './MeasureCreateModal';

function MeasureCard({
  measure,
  open,
  onToggle,
  onOpenDiscounts,
  onDelete,
}: {
  measure: MeasureDto;
  open: boolean;
  onToggle: () => void;
  onOpenDiscounts: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  const tone = MEASURE_TYPE_TONE[measure.type];
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          background: 'none',
          border: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tone,
            flexShrink: 0,
          }}
        >
          <Icon name={measure.discounts.length ? 'flag' : 'message'} size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-t">{measure.name}</div>
          <div className="row-s">
            {measureTypeLabel(measure.type)} ·{' '}
            {measure.discounts.length ? `${measure.discounts.length} Rabatte` : `${measure.postsCount} Posts`}
          </div>
        </div>
        <StatusTag status={measure.status} />
        <Icon
          name="chevronD"
          size={17}
          style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', marginLeft: 4 }}
        />
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          <div className="bar" style={{ marginBottom: 12 }}>
            <span style={{ width: measure.progress * 100 + '%', background: tone }} />
          </div>
          {measure.discounts.length ? (
            <>
              {measure.discounts.map((r) => (
                <div key={r.id} className="row" style={{ padding: '9px 0' }}>
                  <span
                    className="cbadge"
                    style={{ width: 34, height: 30, borderRadius: 9, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 10, padding: '0 4px' }}
                  >
                    {r.value || '—'}
                  </span>
                  <div className="row-main">
                    <div className="row-t" style={{ fontSize: 13.5 }}>{r.name}</div>
                    <div className="row-s">{r.code ? `${r.code} · ` : ''}{r.zeitraum || '—'}</div>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-ghost btn-block"
                style={{ height: 42, marginTop: 8, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={onOpenDiscounts}
              >
                Rabattaktionen im Detail <Icon name="chevronR" size={15} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div className="dim" style={{ fontSize: 12.5 }}>{measure.postsCount} Posts geplant · keine Rabatte</div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={onOpenDiscounts}
              >
                Rabatte <Icon name="chevronR" size={14} />
              </button>
            </div>
          )}
          <button
            onClick={onDelete}
            style={{ marginTop: 12, background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Maßnahme löschen
          </button>
        </div>
      )}
    </div>
  );
}

export function CampaignDetailPage(): React.JSX.Element {
  const { campaignId = '' } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const reload = useCallback(async (): Promise<void> => {
    setCampaign(await getCampaign(campaignId));
  }, [campaignId]);

  useEffect(() => {
    let active = true;
    getCampaign(campaignId)
      .then((c) => {
        if (!active) return;
        setCampaign(c);
        setOpenId(c.measures.find((m) => m.discounts.length)?.id ?? c.measures[0]?.id ?? null);
      })
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Kampagne nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [campaignId]);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Kampagne wird geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;
  if (!campaign) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Kampagne nicht gefunden.</div>;

  const setStatus = async (s: CampaignStatus): Promise<void> => {
    setCampaign(await updateCampaign(campaign.id, { status: s }));
  };

  const removeMeasure = async (id: string): Promise<void> => {
    if (!window.confirm('Diese Maßnahme inkl. Rabatten wirklich löschen?')) return;
    await deleteMeasure(id);
    await reload();
  };

  const removeCampaign = async (): Promise<void> => {
    if (!window.confirm('Diese Kampagne inkl. aller Maßnahmen und Rabatte wirklich löschen?')) return;
    await deleteCampaign(campaign.id);
    navigate('/projekte/kampagnen');
  };

  return (
    <div className="screen stack">
      {/* Kopf */}
      <div className="feature" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <StatusTag status={campaign.status} />
          {campaign.zeitraum && <span className="dim" style={{ fontSize: 12 }}>· {campaign.zeitraum}</span>}
        </div>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 22 }}>{campaign.name}</div>
        {campaign.kpiText && (
          <div style={{ color: 'var(--accent-fg)', fontSize: 13, marginTop: 4 }}>{campaign.kpiText}</div>
        )}
        <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
          <div>
            <div className="tag">Budget</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{fmtNum(campaign.spent)}/{fmtNum(campaign.budget)}€</div>
          </div>
          <div>
            <div className="tag">Maßnahmen</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{campaign.measureCount}</div>
          </div>
          <div>
            <div className="tag">Rabatte</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{campaign.discountCount}</div>
          </div>
        </div>
      </div>

      {/* Status schnell ändern */}
      <div>
        <div className="tag" style={{ marginBottom: 6 }}>Status</div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
          {CAMPAIGN_STATUS.map((s) => (
            <button
              key={s}
              onClick={() => void setStatus(s)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'calc(var(--r-md) - 4px)',
                border: 0,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 12,
                background: campaign.status === s ? 'var(--surface)' : 'transparent',
                color: campaign.status === s ? 'var(--text)' : 'var(--text-3)',
              }}
            >
              {CAMPAIGN_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Maßnahmen */}
      <div className="sec-head">
        <div className="sec-title">Maßnahmen</div>
        <button className="sec-link" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={14} style={{ verticalAlign: -2 }} /> Neu
        </button>
      </div>
      <div className="stack" style={{ gap: 10 }}>
        {campaign.measures.map((m) => (
          <MeasureCard
            key={m.id}
            measure={m}
            open={openId === m.id}
            onToggle={() => setOpenId(openId === m.id ? null : m.id)}
            onOpenDiscounts={() => navigate(`/projekte/kampagnen/${campaign.id}/massnahme/${m.id}`)}
            onDelete={() => void removeMeasure(m.id)}
          />
        ))}
        {campaign.measures.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="dim" style={{ fontSize: 13 }}>Noch keine Maßnahmen.</div>
          </div>
        )}
      </div>

      <button
        onClick={() => void removeCampaign()}
        style={{ alignSelf: 'flex-start', background: 'none', border: 0, color: 'var(--bad)', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginTop: 4 }}
      >
        Kampagne löschen
      </button>

      {showCreate && (
        <MeasureCreateModal
          campaignId={campaign.id}
          onClose={() => setShowCreate(false)}
          onCreated={(c) => {
            setCampaign(c);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
