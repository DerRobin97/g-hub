import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlanMonthDto } from '@g-hub/shared';
import { getPlanYear, seedPlanYear } from '../../lib/api';
import { Icon } from '../../components/Icon';
import { CATEGORY_COLOR, currentMonth, currentYear, monthAbbr } from './planUtils';

export function JahresplanPage(): React.JSX.Element {
  const navigate = useNavigate();
  const year = currentYear();
  const nowMonth = currentMonth();
  const [months, setMonths] = useState<PlanMonthDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const nowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    getPlanYear(year)
      .then((data) => active && setMonths(data))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Jahresplan nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [year]);

  // Sanft zum aktuellen Monat scrollen, sobald die Liste steht.
  useEffect(() => {
    if (months.length > 0) nowRef.current?.scrollIntoView({ block: 'center' });
  }, [months]);

  const seed = async (): Promise<void> => {
    setSeeding(true);
    setError(null);
    try {
      setMonths(await seedPlanYear(year));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konnte Vorlage nicht laden.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Jahresplan wird geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;

  return (
    <div className="screen stack">
      <div className="jp-yearbar">
        <span className="yr">{year}</span>
        <span className="hint">Themen je Monat — die Grundlage für Maßnahmen &amp; Social-Content.</span>
      </div>

      {months.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '28px 18px' }}>
          <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16 }}>Noch kein Jahresplan für {year}</div>
          <div className="dim" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            Befülle den Kalender mit der Gerber-Vorlage (12 Monate, Themen &amp; Verzahnungen) und
            passe ihn anschließend an.
          </div>
          <button
            onClick={() => void seed()}
            disabled={seeding}
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              borderRadius: 'var(--r-md)',
              border: 0,
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              cursor: seeding ? 'default' : 'pointer',
              fontWeight: 700,
            }}
          >
            <Icon name="sparkle" size={17} /> {seeding ? 'Wird befüllt …' : 'Aus Vorlage befüllen'}
          </button>
        </div>
      ) : (
        <div className="jp-list">
          {months.map((m) => {
            const isNow = year === currentYear() && m.month === nowMonth;
            return (
              <button
                key={m.id}
                ref={isNow ? nowRef : null}
                className={'jp-mrow' + (isNow ? ' now' : '')}
                onClick={() => navigate(`/projekte/jahresplan/${m.month}`)}
              >
                <div className="jp-mrail">
                  <div className="jp-mab">{monthAbbr(m.month)}</div>
                  <div className="jp-mq">Q{m.quarter}</div>
                  {isNow && <div className="jp-mnow">JETZT</div>}
                </div>
                <div className="jp-mmain">
                  <div className="jp-mfocus">{m.focus || monthAbbr(m.month)}</div>
                  <div className="jp-chips">
                    {m.themes.map((th) => (
                      <span key={th.id} className="jp-chip">
                        <span className="jp-cdot" style={{ background: CATEGORY_COLOR[th.category] }} />
                        {th.title}
                      </span>
                    ))}
                  </div>
                  <div className="jp-mfoot">
                    <span>{m.themes.length} Themen</span>
                    <span style={{ marginLeft: 'auto' }}>
                      <Icon name="chevronR" size={15} style={{ color: 'var(--text-3)' }} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
