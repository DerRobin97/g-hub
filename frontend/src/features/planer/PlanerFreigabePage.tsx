import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Avatar, ChannelBadge, SectionHead, useReveal } from '../../components/ui';
import { TEAM_BY_ID } from '../../lib/mockData';
import { usePlaner } from './store';

/** Freigabe-Übersicht (Port `PlanerFreigabeScreen`): offene Posts prüfen & freigeben. */
export function PlanerFreigabePage(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const navigate = useNavigate();
  const { posts, setStatus, approve } = usePlaner();
  const [autopost, setAutopost] = useState(true);
  const pending = posts.filter((p) => p.status === 'freigabe');

  return (
    <div className="screen" ref={ref}>
      <div className="feature" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 42, lineHeight: 1 }}>{pending.length}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{pending.length === 1 ? 'wartet' : 'warten'} auf Freigabe</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>Nach Freigabe wird per Meta-API gepostet</div>
        </div>
      </div>

      <button className="card smp-sched" onClick={() => setAutopost((a) => !a)}>
        <span style={{ color: autopost ? 'var(--ok)' : 'var(--text-3)', display: 'flex' }}><Icon name="zap" size={20} /></span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Automatisch posten</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Meta-API · Instagram & Facebook</div>
        </div>
        <span className={'smp-toggle' + (autopost ? ' on' : '')}><span /></span>
      </button>

      <SectionHead title="Zur Prüfung" />
      {pending.length ? (
        <div className="stack" style={{ gap: 12 }}>
          {pending.map((p) => (
            <div key={p.id} className="card" style={{ padding: 14 }}>
              <button className="smp-row" style={{ border: 0, background: 'none', padding: 0, marginBottom: 11 }} onClick={() => navigate(`/projekte/planer/post/${p.id}`)}>
                <ChannelBadge ch={p.ch} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="smp-row-title">{p.t}</div>
                  <div className="smp-row-meta">
                    <span className="smp-by">{p.hhmm || '—'} · <Avatar m={p.by} size={14} /> {TEAM_BY_ID[p.by].name}</span>
                  </div>
                </div>
                <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)' }} />
              </button>
              <div className="smp-cap">{p.cap}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, height: 42, fontSize: 13 }} onClick={() => setStatus(p.id, 'entwurf')}><Icon name="close" size={15} />Ablehnen</button>
                <button className="btn btn-primary" style={{ flex: 1.4, height: 42, fontSize: 13 }} onClick={() => approve(p.id)}><Icon name="check" size={15} />Freigeben</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="smp-done"><div className="smp-done-ico"><Icon name="check" size={28} stroke={2.4} /></div>Alles freigegeben 🎉</div>
      )}
    </div>
  );
}
