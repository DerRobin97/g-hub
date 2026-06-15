import { useState } from 'react';
import { MEASURE_TYPES, type CampaignDetailDto, type MeasureType } from '@g-hub/shared';
import { createMeasure } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { measureTypeLabel } from './campaignUtils';

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-3)',
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--line-strong)',
  background: 'var(--surface)',
  color: 'var(--text)',
  font: 'inherit',
  fontSize: 14,
};

export function MeasureCreateModal({
  campaignId,
  onClose,
  onCreated,
}: {
  campaignId: string;
  onClose: () => void;
  onCreated: (campaign: CampaignDetailDto) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [type, setType] = useState<MeasureType>('organisch');
  const [postsCount, setPostsCount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const posts = postsCount.trim() ? Math.max(0, Math.round(Number(postsCount))) : 0;
      const campaign = await createMeasure(campaignId, {
        name: name.trim(),
        type,
        postsCount: Number.isFinite(posts) ? posts : 0,
      });
      onCreated(campaign);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Maßnahme nicht anlegen.');
      setBusy(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button
        onClick={onClose}
        style={{ padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
      >
        Abbrechen
      </button>
      <button
        onClick={() => void submit()}
        disabled={!name.trim() || busy}
        style={{ padding: '10px 18px', borderRadius: 'var(--r-sm)', border: 0, background: 'var(--accent)', color: 'var(--accent-ink)', cursor: name.trim() && !busy ? 'pointer' : 'not-allowed', opacity: name.trim() && !busy ? 1 : 0.6, fontWeight: 700 }}
      >
        {busy ? 'Speichert …' : 'Anlegen'}
      </button>
    </div>
  );

  return (
    <Modal title="Neue Maßnahme" onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{ background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))', border: '1px solid var(--bad)', color: 'var(--bad)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontSize: 13 }}>
            {error}
          </div>
        )}
        <div>
          <label style={labelStyle}>Name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Instagram Reels-Serie" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Art</label>
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
            {MEASURE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 'calc(var(--r-md) - 4px)',
                  border: 0,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                  background: type === t ? 'var(--surface)' : 'transparent',
                  color: type === t ? 'var(--text)' : 'var(--text-3)',
                }}
              >
                {measureTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Geplante Posts</label>
          <input value={postsCount} onChange={(e) => setPostsCount(e.target.value)} placeholder="0" inputMode="numeric" style={inputStyle} />
        </div>
      </div>
    </Modal>
  );
}
