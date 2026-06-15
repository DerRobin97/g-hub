import { useState } from 'react';
import { CAMPAIGN_STATUS, CHANNELS, type CampaignDetailDto, type CampaignStatus } from '@g-hub/shared';
import { createCampaign } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { CAMPAIGN_STATUS_LABEL, channelMeta } from './campaignUtils';

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

export function CampaignCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (campaign: CampaignDetailDto) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [channels, setChannels] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [zeitraum, setZeitraum] = useState('');
  const [kpiText, setKpiText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChannel = (c: string): void =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async (): Promise<void> => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const budgetNum = budget.trim() ? Math.max(0, Math.round(Number(budget.replace(',', '.')))) : 0;
      const campaign = await createCampaign({
        name: name.trim(),
        status,
        channels,
        budget: Number.isFinite(budgetNum) ? budgetNum : 0,
        zeitraum: zeitraum.trim() || null,
        kpiText: kpiText.trim() || null,
        // Akzentfarbe aus dem ersten Kanal ableiten (sonst Default-Akzent).
        color: channels[0] ? channelMeta(channels[0]).color : null,
      });
      onCreated(campaign);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Kampagne nicht anlegen.');
      setBusy(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button
        onClick={onClose}
        style={{
          padding: '10px 16px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line-strong)',
          background: 'var(--surface-2)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Abbrechen
      </button>
      <button
        onClick={() => void submit()}
        disabled={!name.trim() || busy}
        style={{
          padding: '10px 18px',
          borderRadius: 'var(--r-sm)',
          border: 0,
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          cursor: name.trim() && !busy ? 'pointer' : 'not-allowed',
          opacity: name.trim() && !busy ? 1 : 0.6,
          fontWeight: 700,
        }}
      >
        {busy ? 'Speichert …' : 'Anlegen'}
      </button>
    </div>
  );

  return (
    <Modal title="Neue Kampagne" onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div
            style={{
              background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))',
              border: '1px solid var(--bad)',
              color: 'var(--bad)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 12px',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label style={labelStyle}>Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Sommer-Launch 2026"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
            {CAMPAIGN_STATUS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 'calc(var(--r-md) - 4px)',
                  border: 0,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                  background: status === s ? 'var(--surface)' : 'transparent',
                  color: status === s ? 'var(--text)' : 'var(--text-3)',
                }}
              >
                {CAMPAIGN_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Kanäle</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CHANNELS.map((c) => {
              const m = channelMeta(c);
              const on = channels.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 11px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: on ? '1px solid transparent' : '1px solid var(--line-strong)',
                    background: on ? `color-mix(in oklab, ${m.color} 22%, var(--surface))` : 'var(--surface)',
                    color: 'var(--text)',
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: m.color }} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Budget (€)</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="8000"
              inputMode="numeric"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Zeitraum</label>
            <input value={zeitraum} onChange={(e) => setZeitraum(e.target.value)} placeholder="01.–30. Jun" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>KPI / Ziel</label>
          <input value={kpiText} onChange={(e) => setKpiText(e.target.value)} placeholder="z. B. +18% Reichweite" style={inputStyle} />
        </div>
      </div>
    </Modal>
  );
}
