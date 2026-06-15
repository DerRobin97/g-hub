import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CampaignDetailDto, DiscountDto, MeasureDto } from '@g-hub/shared';
import { deleteDiscount, getCampaign } from '../../lib/api';
import { Icon } from '../../components/Icon';
import { StatusTag } from '../../components/ui';
import { discountTypeLabel, measureTypeLabel, ratio } from './campaignUtils';
import { DiscountCreateModal } from './DiscountCreateModal';

function DiscountCard({ discount, onDelete }: { discount: DiscountDto; onDelete: () => void }): React.JSX.Element {
  const used = ratio(discount.redeemed, discount.limit);
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span
          className="cbadge"
          style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 800, padding: '0 4px' }}
        >
          {discount.value || '—'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-t" style={{ fontSize: 15 }}>{discount.name}</div>
          <div className="row-s">
            {discountTypeLabel(discount.type)}
            {discount.zeitraum ? ` · ${discount.zeitraum}` : ''}
          </div>
        </div>
        {discount.code && (
          <span
            style={{ fontFamily: 'var(--ff-mono)', fontSize: 11.5, fontWeight: 700, color: 'var(--accent-fg)', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', padding: '4px 8px', borderRadius: 8 }}
          >
            {discount.code}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
        <span className="dim">Einlösungen</span>
        <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-2)' }}>
          {discount.redeemed} / {discount.limit}
        </span>
      </div>
      <div className="bar">
        <span style={{ width: used * 100 + '%', background: used > 0.8 ? 'var(--warn)' : 'var(--accent)' }} />
      </div>
      <button
        onClick={onDelete}
        style={{ marginTop: 12, background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
      >
        Rabattaktion löschen
      </button>
    </div>
  );
}

export function MeasureDetailPage(): React.JSX.Element {
  const { campaignId = '', measureId = '' } = useParams<{ campaignId: string; measureId: string }>();
  const [campaign, setCampaign] = useState<CampaignDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const reload = useCallback(async (): Promise<void> => {
    setCampaign(await getCampaign(campaignId));
  }, [campaignId]);

  useEffect(() => {
    let active = true;
    getCampaign(campaignId)
      .then((c) => active && setCampaign(c))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Maßnahme nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [campaignId]);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Maßnahme wird geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;
  const measure: MeasureDto | undefined = campaign?.measures.find((m) => m.id === measureId);
  if (!campaign || !measure) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Maßnahme nicht gefunden.</div>;

  const removeDiscount = async (id: string): Promise<void> => {
    if (!window.confirm('Diese Rabattaktion wirklich löschen?')) return;
    await deleteDiscount(id);
    await reload();
  };

  return (
    <div className="screen stack">
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span className="tag">{campaign.name}</span>
          <Icon name="chevronR" size={12} style={{ color: 'var(--text-3)' }} />
        </div>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 21 }}>{measure.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <StatusTag status={measure.status} />
          <span className="dim" style={{ fontSize: 12 }}>
            · {measureTypeLabel(measure.type)} · {measure.discounts.length} Rabattaktionen
          </span>
        </div>
      </div>

      <div className="sec-head">
        <div className="sec-title">Rabattaktionen</div>
        <button className="sec-link" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={14} style={{ verticalAlign: -2 }} /> Neu
        </button>
      </div>
      <div className="stack" style={{ gap: 12 }}>
        {measure.discounts.map((r) => (
          <DiscountCard key={r.id} discount={r} onDelete={() => void removeDiscount(r.id)} />
        ))}
        {measure.discounts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="dim" style={{ fontSize: 13 }}>Noch keine Rabattaktionen.</div>
          </div>
        )}
      </div>

      {showCreate && (
        <DiscountCreateModal
          measureId={measure.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void reload();
          }}
        />
      )}
    </div>
  );
}
