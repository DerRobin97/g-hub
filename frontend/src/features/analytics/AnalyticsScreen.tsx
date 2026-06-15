import { useRef, useState } from 'react';
import { Icon, type IconName } from '../../components/Icon';
import { ChannelBadge, Delta, Spark, fmtNum, useReveal } from '../../components/ui';
import { ANA, CHANNELS, REACH_SERIES, TOP_POSTS, type AnaKpi } from '../../lib/mockData';

/**
 * Analytics (Port aus dem Prototyp `analytics.jsx`). Umschalter Gesamt/Google/Meta,
 * Hero-KPI mit Sparkline, KPI-Raster und quellenspezifische Auswertungen.
 * Design-first mit statischen Daten (ANA aus mockData).
 */
type Source = 'gesamt' | 'google' | 'meta';

interface AnView {
  color: string;
  icon: IconName;
  heroLabel: string;
  heroVal: string;
  heroDelta: number;
  series: number[];
  kpis: AnaKpi[];
}

function anView(sel: Source): AnView {
  if (sel === 'google')
    return { color: ANA.google.color, icon: 'search', heroLabel: 'Impressionen', heroVal: '1,24 Mio', heroDelta: 9.1, series: ANA.google.series, kpis: ANA.google.kpis };
  if (sel === 'meta')
    return { color: ANA.meta.color, icon: 'globe', heroLabel: 'Reichweite', heroVal: '198K', heroDelta: 14.2, series: ANA.meta.series, kpis: ANA.meta.kpis };
  return { color: 'var(--accent-fg)', icon: 'chart', heroLabel: 'Gesamtreichweite', heroVal: '284,5K', heroDelta: 12.4, series: REACH_SERIES.slice(-16), kpis: ANA.gesamtKpis };
}

const AN_GOOGLE_TOP = [
  { t: 'Search · Brand', reach: '18,2K Klicks', eng: 3.4 },
  { t: 'Performance Max', reach: '12,8K Klicks', eng: 2.9 },
  { t: 'Display Retargeting', reach: '7,4K Klicks', eng: 1.8 },
];

function AnSourceSeg({ sel, set }: { sel: Source; set: (s: Source) => void }): React.JSX.Element {
  const opts: Array<[Source, string, string | null]> = [
    ['gesamt', 'Gesamt', null],
    ['google', 'Google', ANA.google.color],
    ['meta', 'Meta', ANA.meta.color],
  ];
  return (
    <div className="seg" style={{ marginTop: 6 }}>
      {opts.map(([k, l, col]) => (
        <button key={k} className={sel === k ? 'on' : ''} onClick={() => set(k)} style={sel === k && col ? { color: '#fff', background: col } : {}}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsScreen(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const [sel, setSel] = useState<Source>('gesamt');
  const v = anView(sel);

  return (
    <div className="screen" ref={ref}>
      <AnSourceSeg sel={sel} set={setSel} />

      {/* Hero */}
      <div className="card reveal r-up" style={{ marginTop: 14, paddingBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={v.icon} size={13} style={{ color: v.color }} />
              {v.heroLabel}
            </div>
            <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 34, lineHeight: 1.05, marginTop: 4 }}>{v.heroVal}</div>
          </div>
          <Delta value={v.heroDelta} up />
        </div>
        <div style={{ margin: '10px -16px -8px' }}>
          <Spark data={v.series} h={92} sw={2.4} color={v.color} />
        </div>
      </div>

      {/* KPI-Raster */}
      <div className="kpi-grid" style={{ marginTop: 12 }}>
        {v.kpis.map((k) => (
          <div key={k.label} className="kpi reveal r-up">
            <div className="kpi-top">
              <div className="kpi-ico" style={{ color: v.color }}><Icon name={(k.icon as IconName) || 'trend'} size={17} /></div>
              <Delta value={k.delta} up={k.up} />
            </div>
            <div>
              <div className="kpi-val" style={{ fontSize: 24 }}>{k.val}</div>
              <div className="kpi-label" style={{ marginTop: 4 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversions nach Quelle (nur Gesamt) */}
      {sel === 'gesamt' && (
        <div className="card reveal r-up" style={{ marginTop: 12 }}>
          <div className="sec-title" style={{ fontSize: 15, marginBottom: 14 }}>Conversions nach Quelle</div>
          <div className="stack" style={{ gap: 12 }}>
            {([['Google', ANA.google.conv, ANA.google.color], ['Meta', ANA.meta.conv, ANA.meta.color]] as Array<[string, number, string]>).map((r) => (
              <div key={r[0]}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r[0]}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 12.5, color: 'var(--text-2)' }}>{r[1]}</span>
                </div>
                <div className="bar"><span style={{ width: (r[1] / (ANA.google.conv + ANA.meta.conv)) * 100 + '%', background: r[2] }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google: Top-Kampagnen */}
      {sel === 'google' && (
        <div className="card reveal r-up" style={{ marginTop: 12, padding: '4px 16px' }}>
          <div className="sec-title" style={{ fontSize: 15, margin: '14px 0 4px' }}>Top-Kampagnen</div>
          {AN_GOOGLE_TOP.map((p, i) => (
            <div key={p.t} className="row">
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 18, color: 'var(--text-3)', width: 20 }}>{i + 1}</div>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: ANA.google.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="search" size={16} /></div>
              <div className="row-main"><div className="row-t">{p.t}</div><div className="row-s">{p.reach}</div></div>
              <span className="delta up">{p.eng.toString().replace('.', ',')}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Meta: Reichweite nach Kanal */}
      {sel === 'meta' && ANA.meta.split && (
        <div className="card reveal r-up" style={{ marginTop: 12 }}>
          <div className="sec-title" style={{ fontSize: 15, marginBottom: 16 }}>Reichweite nach Kanal</div>
          <div className="stack" style={{ gap: 13 }}>
            {ANA.meta.split.map((m) => (
              <div key={m.ch} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ChannelBadge ch={m.ch} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{CHANNELS[m.ch].name}</span>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 12.5, color: 'var(--text-2)' }}>{m.val}%</span>
                  </div>
                  <div className="bar"><span style={{ width: m.val + '%', background: CHANNELS[m.ch].color, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-Beiträge (Gesamt + Meta) */}
      {sel !== 'google' && (
        <div className="card reveal r-up" style={{ marginTop: 12, padding: '4px 16px' }}>
          <div className="sec-title" style={{ fontSize: 15, margin: '14px 0 4px' }}>Top-Beiträge</div>
          {TOP_POSTS.filter((p) => ['instagram', 'facebook'].includes(p.ch) || sel === 'gesamt').map((p, i) => (
            <div key={p.t} className="row">
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 18, color: 'var(--text-3)', width: 20 }}>{i + 1}</div>
              <ChannelBadge ch={p.ch} size={32} />
              <div className="row-main"><div className="row-t">{p.t}</div><div className="row-s">{fmtNum(p.reach, 'compact')} Reichweite</div></div>
              <span className="delta up">{p.eng.toString().replace('.', ',')}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
