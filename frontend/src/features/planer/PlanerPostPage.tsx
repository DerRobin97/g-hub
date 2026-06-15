import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { ChannelBadge, useReveal } from '../../components/ui';
import { useOverlay } from '../../app/OverlayContext';
import { PL_WD, usePlaner } from './store';
import { PlAiTag, PlPill } from './PlanerScreen';

/** Post-Detail (Port `PlanerPostScreen`): Vorschau, Caption, Planung, Status-Aktionen. */
export function PlanerPostPage(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { postId = '' } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { open } = useOverlay();
  const { find, setStatus, approve, toggleAuto } = usePlaner();
  const p = find(postId);
  const [cap, setCap] = useState(p ? p.cap : '');
  const pop = (): void => navigate(-1);

  if (!p) return <div className="screen" ref={ref}><div className="empty">Post nicht gefunden.</div></div>;
  const dlabel = p.day ? PL_WD[p.day] + ', ' + p.day + '. Juni' : 'kein Termin';

  const actions = (): React.JSX.Element[] => {
    if (p.status === 'entwurf')
      return [
        <button key="a" className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => open('compose')}><Icon name="image" size={16} />Bearbeiten</button>,
        <button key="b" className="btn btn-primary" style={{ flex: 1.5, height: 48 }} onClick={() => { setStatus(p.id, 'freigabe'); pop(); }}><Icon name="check" size={16} />Zur Freigabe</button>,
      ];
    if (p.status === 'freigabe')
      return [
        <button key="a" className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => { setStatus(p.id, 'entwurf'); pop(); }}><Icon name="close" size={16} />Ablehnen</button>,
        <button key="b" className="btn btn-primary" style={{ flex: 1.5, height: 48 }} onClick={() => { approve(p.id); pop(); }}><Icon name="check" size={16} />Freigeben & planen</button>,
      ];
    if (p.status === 'geplant')
      return [
        <button key="a" className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => open('compose')}><Icon name="clock" size={16} />Verschieben</button>,
        <button key="b" className="btn btn-primary" style={{ flex: 1.5, height: 48 }} onClick={() => { setStatus(p.id, 'live'); pop(); }}><Icon name="zap" size={16} />Jetzt posten</button>,
      ];
    return [<button key="a" className="btn btn-ghost btn-block" style={{ height: 48 }} onClick={() => open('ai')}><Icon name="chart" size={16} />Insights ansehen</button>];
  };

  return (
    <div className="screen" ref={ref}>
      <div className="smp-pd-top">
        <ChannelBadge ch={p.ch} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="smp-pd-name">{p.t}</div>
          <div style={{ marginTop: 5 }}><PlPill status={p.status} /></div>
        </div>
        {p.ai && <PlAiTag />}
      </div>

      <div className="ph smp-pd-img"><span className="ph-tag">{p.ch === 'instagram' ? 'Reel/Karussell 4:5' : 'Link-Bild 1200×630'}</span></div>

      <span className="lbl" style={{ marginTop: 14 }}>Caption</span>
      <textarea className="field" style={{ minHeight: 84, fontSize: 13.5, lineHeight: 1.5 }} value={cap} onChange={(e) => setCap(e.target.value)} />
      <div className="smp-ki-row">
        {['Hook verbessern', 'Hashtags', 'Kürzen'].map((s) => (
          <button key={s} className="chip smp-ki-chip" onClick={() => open('ai')}><Icon name="sparkle" size={13} />{s}</button>
        ))}
      </div>

      <div className="card smp-sched">
        <span style={{ color: 'var(--text-2)', display: 'flex' }}><Icon name="clock" size={19} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.day ? dlabel : 'Noch nicht terminiert'}{p.day && p.hhmm ? ' · ' + p.hhmm : ''}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{p.autopost ? 'Auto-Post via Meta-API' : 'Manuell veröffentlichen'}</div>
        </div>
        <button className={'smp-toggle' + (p.autopost ? ' on' : '')} onClick={() => toggleAuto(p.id)} aria-label="Auto-Post"><span /></button>
      </div>

      <div className="smp-actions">{actions()}</div>
    </div>
  );
}
