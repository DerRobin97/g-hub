import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PlanMonthDto, PlanThemeDto } from '@g-hub/shared';
import { getPlanYear } from '../../lib/api';
import { Icon } from '../../components/Icon';
import {
  CATEGORY_COLOR,
  CATEGORY_ORDER,
  categoryLabel,
  channelColor,
  channelLabel,
  currentYear,
  monthAbbr,
  monthName,
} from './planUtils';
import { ThemeModal } from './ThemeModal';

function KanChip({ ch }: { ch: string }): React.JSX.Element {
  return (
    <span className="jpd-kanchip">
      <i style={{ background: channelColor(ch) }} />
      {channelLabel(ch)}
    </span>
  );
}

export function MonthDetailPage(): React.JSX.Element {
  const { month: monthParam = '1' } = useParams<{ month: string }>();
  const month = Number(monthParam);
  const year = currentYear();
  const [data, setData] = useState<PlanMonthDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTheme, setEditTheme] = useState<PlanThemeDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const reload = (): void => {
    getPlanYear(year)
      .then((months) => setData(months.find((m) => m.month === month) ?? null))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Konnte Monat nicht laden.'));
  };

  useEffect(() => {
    let active = true;
    getPlanYear(year)
      .then((months) => active && setData(months.find((m) => m.month === month) ?? null))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Konnte Monat nicht laden.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [year, month]);

  if (loading) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Monat wird geladen …</div>;
  if (error) return <div style={{ color: 'var(--bad)', padding: '24px 0' }}>{error}</div>;
  if (!data) return <div style={{ color: 'var(--text-2)', padding: '24px 0' }}>Für {monthName(month)} ist noch nichts geplant.</div>;

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: data.themes.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);
  const usedKan = [...new Set(data.themes.flatMap((t) => t.channels))];

  return (
    <div className="screen stack">
      <div className="jpd-hero">
        <div>
          <div className="jpd-hero-n">{monthAbbr(month)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="jpd-hero-k">Leitmotiv</div>
          <div className="jpd-hero-f">{data.focus || monthName(month)}</div>
          <div className="jpd-hero-s">
            Q{data.quarter} · {data.themes.length} Themen · {usedKan.length} Kanäle
          </div>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.cat}>
          <div className="jpd-group-h">
            <span className="gd" style={{ background: CATEGORY_COLOR[g.cat] }} />
            <span className="gn">{categoryLabel(g.cat)}</span>
            <span className="gc">{g.items.length}{g.items.length === 1 ? ' Thema' : ' Themen'}</span>
          </div>
          {g.items.map((th) => (
            <div
              key={th.id}
              className="jpd-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setEditTheme(th)}
            >
              <div className="gt">{th.title}</div>
              {th.description && <div className="gd2">{th.description}</div>}
              {th.channels.length > 0 && (
                <div className="jpd-kan">
                  {th.channels.map((k) => (
                    <KanChip key={k} ch={k} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {data.themes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div className="dim" style={{ fontSize: 13 }}>Noch keine Themen in diesem Monat.</div>
        </div>
      )}

      {usedKan.length > 0 && (
        <div className="jpd-cover">
          <div className="ct">Kanäle diesen Monat</div>
          <div className="cb">
            {usedKan.map((k) => (
              <KanChip key={k} ch={k} />
            ))}
          </div>
        </div>
      )}

      {data.links.length > 0 && (
        <div>
          <div className="sec-head">
            <div className="sec-title">Verzahnung</div>
          </div>
          <div className="jpd-vz">
            {data.links.map((v) => (
              <div key={v.id} className="jpd-vz-row">
                <div className="jpd-vz-dir">
                  <Icon name={v.direction === 'back' ? 'chevronL' : 'chevronR'} size={16} stroke={2} />
                </div>
                <div className="jpd-vz-main">
                  <div className="jpd-vz-m">{v.direction === 'back' ? '← ' : '→ '}{v.targetMonth}</div>
                  <div className="jpd-vz-t">{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="jpd-add" onClick={() => setShowCreate(true)}>
        <Icon name="plus" size={17} />Thema hinzufügen
      </button>

      {showCreate && (
        <ThemeModal
          year={year}
          month={month}
          onClose={() => setShowCreate(false)}
          onSaved={(m) => {
            setData(m);
            setShowCreate(false);
          }}
        />
      )}
      {editTheme && (
        <ThemeModal
          year={year}
          month={month}
          theme={editTheme}
          onClose={() => setEditTheme(null)}
          onSaved={() => {
            setEditTheme(null);
            reload();
          }}
          onDeleted={() => {
            setEditTheme(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
