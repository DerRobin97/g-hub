import { useState } from 'react';
import { DISCOUNT_TYPES, type DiscountType, type MeasureDto } from '@g-hub/shared';
import { createDiscount } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { discountTypeLabel } from './campaignUtils';

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

export function DiscountCreateModal({
  measureId,
  onClose,
  onCreated,
}: {
  measureId: string;
  onClose: () => void;
  onCreated: (measure: MeasureDto) => void;
}): React.JSX.Element {
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('prozent');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [zeitraum, setZeitraum] = useState('');
  const [limit, setLimit] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const limitNum = limit.trim() ? Math.max(0, Math.round(Number(limit))) : 0;
      const measure = await createDiscount(measureId, {
        name: name.trim(),
        type,
        value: value.trim() || null,
        code: code.trim() || null,
        zeitraum: zeitraum.trim() || null,
        limit: Number.isFinite(limitNum) ? limitNum : 0,
      });
      onCreated(measure);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Rabattaktion nicht anlegen.');
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
    <Modal title="Neue Rabattaktion" onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{ background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))', border: '1px solid var(--bad)', color: 'var(--bad)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontSize: 13 }}>
            {error}
          </div>
        )}
        <div>
          <label style={labelStyle}>Name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. −20 % auf alles" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Art</label>
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}>
            {DISCOUNT_TYPES.map((t) => (
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
                  fontSize: 11.5,
                  background: type === t ? 'var(--surface)' : 'transparent',
                  color: type === t ? 'var(--text)' : 'var(--text-3)',
                }}
              >
                {discountTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Wert</label>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="−20 %" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SOMMER20" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Zeitraum</label>
            <input value={zeitraum} onChange={(e) => setZeitraum(e.target.value)} placeholder="01.–14. Jun" style={inputStyle} />
          </div>
          <div style={{ width: 130 }}>
            <label style={labelStyle}>Limit</label>
            <input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="1000" inputMode="numeric" style={inputStyle} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
