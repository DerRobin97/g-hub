import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../components/Icon';
import { useReveal } from '../../components/ui';
import { PLANER_POSTS } from '../../lib/mockData';

/**
 * Projekte-Hub (Port aus dem Prototyp `projekte-hub.jsx`). Einstieg in die
 * Projekte-Fachbereiche mit KPI-Zeile, Bereichs-Kacheln und „Zuletzt bearbeitet".
 * KPI-Werte design-first (statisch/aus Mock-Daten).
 */
const PROJ_AREAS: Array<{ key: string; icon: IconName; name: string; stat: string; extra: string }> = [
  { key: 'jahresplan', icon: 'calendar', name: 'Jahresplan', stat: '12 Monate', extra: 'Q2 · Trimmen & schneiden' },
  { key: 'planer', icon: 'message', name: 'Social-Media-Planer', stat: '12 Posts', extra: '3 zur Freigabe' },
  { key: 'kampagnen', icon: 'campaign', name: 'Kampagnenmanager', stat: '4 Kampagnen', extra: '2 live · 8.000 €' },
  { key: 'projektmanager', icon: 'layers', name: 'Projektmanager', stat: '4 Projekte', extra: 'Ø 47 % · 2 bald fällig' },
];

export function ProjekteHubPage(): React.JSX.Element {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const planLive = PLANER_POSTS.filter((p) => p.status === 'geplant').length;
  const freigaben = PLANER_POSTS.filter((p) => p.status === 'freigabe').length;
  const live = 2;
  const nextPct = 47;

  const recent: Array<{ t: string; s: string; ico: IconName; tone: string; to: string }> = [
    { t: 'Sommer-Launch 2026', s: 'Kampagne · live', ico: 'campaign', tone: 'var(--ch-instagram)', to: '/projekte/kampagnen' },
    { t: 'Produkt-Drop Reveal', s: 'Post · heute 18:00', ico: 'message', tone: 'var(--ch-linkedin)', to: '/projekte/planer' },
    { t: 'Rabattaktion Sommer', s: 'Maßnahme · 3 Rabatte', ico: 'flag', tone: 'var(--ok)', to: '/projekte/kampagnen' },
  ];

  const valStyle: React.CSSProperties = { fontSize: 23, color: 'var(--text)' };
  const labStyle: React.CSSProperties = { fontSize: 10.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 3 };
  const kpiBtn: React.CSSProperties = { minHeight: 0, padding: '13px 10px', gap: 0, alignItems: 'center', justifyContent: 'flex-start', cursor: 'pointer', fontFamily: 'var(--ff)' };

  return (
    <div className="screen stack" ref={ref}>
      {/* KPI-Zeile — Kampagnen | Social Media | Nächstes Projekt */}
      <div className="kpi-grid reveal r-up" style={{ gridTemplateColumns: '0.85fr 1.45fr 1.4fr', gap: 10, marginTop: 4 }}>
        <button className="kpi" onClick={() => navigate('/projekte/kampagnen')} style={{ ...kpiBtn, textAlign: 'center' }}>
          <div className="kpi-label" style={{ fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Kampagnen</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="kpi-val" style={valStyle}>{live}</div>
              <div style={labStyle}>live</div>
            </div>
          </div>
        </button>

        <button className="kpi" onClick={() => navigate('/projekte/planer')} style={kpiBtn}>
          <div className="kpi-label" style={{ fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Social Media</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="kpi-val" style={valStyle}>{planLive}</div>
              <div style={labStyle}>geplant</div>
            </div>
            <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
            <div style={{ textAlign: 'center' }}>
              <div className="kpi-val" style={valStyle}>{freigaben}</div>
              <div style={labStyle}>Freigaben</div>
            </div>
          </div>
        </button>

        <button className="kpi" onClick={() => navigate('/projekte/projektmanager')} style={kpiBtn}>
          <div className="kpi-label" style={{ fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>Nächstes Projekt</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, marginTop: 10 }}>
            <span className="kpi-val" style={valStyle}>{nextPct}%</span>
            <div className="bar" style={{ width: '100%' }}><span style={{ width: nextPct + '%' }} /></div>
          </div>
        </button>
      </div>

      {/* Bereiche */}
      <div className="reveal r-up"><div className="sec-head"><div className="sec-title">Bereiche</div></div></div>
      <div className="stack" style={{ gap: 10 }}>
        {PROJ_AREAS.map((a, i) => (
          <button
            key={a.key}
            className={'card tap reveal ' + (i % 2 ? 'r-right' : 'r-left')}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, width: '100%', textAlign: 'left' }}
            onClick={() => navigate(`/projekte/${a.key}`)}
          >
            <div className="create-ico" style={{ color: 'var(--accent-fg)' }}><Icon name={a.icon} size={20} /></div>
            <div className="row-main">
              <div className="row-t" style={{ fontSize: 15 }}>{a.name}</div>
              <div className="row-s">{a.stat} · {a.extra}</div>
            </div>
            <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>

      {/* Zuletzt bearbeitet */}
      <div className="reveal r-up"><div className="sec-head"><div className="sec-title">Zuletzt bearbeitet</div></div></div>
      <div className="stack" style={{ gap: 10 }}>
        {recent.map((r) => (
          <button
            key={r.t}
            className="card tap reveal r-left"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, width: '100%', textAlign: 'left' }}
            onClick={() => navigate(r.to)}
          >
            <div className="search-ico" style={{ width: 40, height: 40, borderRadius: 12, color: r.tone }}><Icon name={r.ico} size={18} /></div>
            <div className="row-main"><div className="row-t">{r.t}</div><div className="row-s">{r.s}</div></div>
            <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
