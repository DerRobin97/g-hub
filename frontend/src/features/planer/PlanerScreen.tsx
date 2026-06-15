import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../components/Icon';
import { Avatar, ChannelBadge, SectionHead, useReveal } from '../../components/ui';
import { PLANER_STATUS, TEAM_BY_ID, type PlanerPost, type PlanerStatusKey } from '../../lib/mockData';
import { useOverlay } from '../../app/OverlayContext';
import { CHANNELS } from '../../lib/mockData';
import { PL_TODAY, PL_WD, PL_WDLONG, usePlaner } from './store';

// Persistenter Ansichts-Status (überlebt Remounts beim Navigieren), wie PL_STATE im Prototyp.
const PL_UI = { view: 'hub' as PlView, filter: 'all' as string, day: 12 };
type PlView = 'hub' | 'kalender' | 'timeline';

// ── Bausteine ────────────────────────────────────────────────
export function PlPill({ status, small }: { status: PlanerStatusKey; small?: boolean }): React.JSX.Element {
  const s = PLANER_STATUS[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: small ? 10.5 : 11.5, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

export function PlAiTag(): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--ff-mono)', fontSize: 9, fontWeight: 700, color: 'var(--accent-fg)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: 6 }}>
      <Icon name="sparkle" size={10} />
      KI
    </span>
  );
}

export function PlRow({ p, showDay, onOpen }: { p: PlanerPost; showDay?: boolean; onOpen: (id: string) => void }): React.JSX.Element {
  return (
    <button className="smp-row" onClick={() => onOpen(p.id)}>
      <div className="smp-row-time">
        <div className="smp-row-t1">{p.hhmm || '—'}</div>
        {showDay && <div className="smp-row-t2">{p.day ? PL_WD[p.day] + ' ' + p.day + '.' : 'offen'}</div>}
      </div>
      <ChannelBadge ch={p.ch} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="smp-row-title">{p.t}</div>
        <div className="smp-row-meta">
          <PlPill status={p.status} small />
          <span className="smp-by">
            <Avatar m={p.by} size={14} />
            {TEAM_BY_ID[p.by].name.split(' ')[0]}
          </span>
          {p.ai && <PlAiTag />}
        </div>
      </div>
      {p.status === 'freigabe' ? (
        <span className="smp-pill-warn">prüfen</span>
      ) : p.autopost ? (
        <span style={{ color: 'var(--ok)', display: 'flex' }}><Icon name="zap" size={15} /></span>
      ) : (
        <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)' }} />
      )}
    </button>
  );
}

function PlSwitch({ view, setView }: { view: PlView; setView: (v: PlView) => void }): React.JSX.Element {
  const tabs: Array<[PlView, string, IconName]> = [
    ['hub', 'Übersicht', 'grid'],
    ['kalender', 'Kalender', 'calendar'],
    ['timeline', 'Timeline', 'list'],
  ];
  return (
    <div className="smp-switch">
      {tabs.map(([k, l, ic]) => (
        <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
          <Icon name={ic} size={14} />
          {l}
        </button>
      ))}
    </div>
  );
}

// ── Hub ──────────────────────────────────────────────────────
function PlHub({
  openPost,
  setView,
  setFilter,
}: {
  openPost: (id: string) => void;
  setView: (v: PlView) => void;
  setFilter: (f: string) => void;
}): React.JSX.Element {
  const navigate = useNavigate();
  const { open } = useOverlay();
  const { posts } = usePlaner();
  const cnt = (s: PlanerStatusKey): number => posts.filter((p) => p.status === s).length;
  const funnel: Array<[PlanerStatusKey, number]> = [
    ['entwurf', cnt('entwurf')],
    ['freigabe', cnt('freigabe')],
    ['geplant', cnt('geplant')],
    ['live', cnt('live')],
  ];
  const freigabeN = cnt('freigabe');
  const today = posts.filter((p) => p.day === PL_TODAY).sort((a, b) => (a.hhmm > b.hhmm ? 1 : -1));
  const upcoming = posts.filter((p) => p.status === 'geplant').sort((a, b) => (a.day ?? 99) - (b.day ?? 99));
  const goStatus = (s: string): void => {
    setFilter(s);
    setView('timeline');
  };

  return (
    <div>
      <div className="card smp-funnel">
        <div className="smp-funnel-head">
          <span>Pipeline</span>
          <span className="dim" style={{ fontFamily: 'var(--ff-mono)', fontSize: 10.5 }}>{posts.length} Posts</span>
        </div>
        <div className="smp-funnel-row">
          {funnel.map(([s, n]) => (
            <button key={s} className={'smp-funnel-seg' + (s === 'freigabe' && n > 0 ? ' alert' : '')} onClick={() => goStatus(s)}>
              <div className="smp-funnel-n">{n}</div>
              <div className="smp-funnel-l">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLANER_STATUS[s].color }} />
                {PLANER_STATUS[s].label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {freigabeN > 0 && (
        <button className="smp-banner" onClick={() => navigate('/projekte/planer/freigabe')}>
          <div className="smp-banner-ico"><Icon name="check" size={19} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="smp-banner-t">{freigabeN} Posts warten auf Freigabe</div>
            <div className="smp-banner-s">Jetzt prüfen & per Meta-API posten</div>
          </div>
          <Icon name="chevronR" size={17} style={{ color: 'var(--text-3)' }} />
        </button>
      )}

      <div className="smp-cta">
        <button className="btn btn-primary" style={{ flex: 1.3, height: 48 }} onClick={() => open('compose')}><Icon name="plus" size={17} />Neuer Post</button>
        <button className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => open('ai')}><Icon name="sparkle" size={16} />KI-Content</button>
      </div>

      <SectionHead title={'Heute · ' + PL_TODAY + '. Juni'} link="Kalender" onLink={() => setView('kalender')} />
      {today.length ? (
        <div className="stack" style={{ gap: 10 }}>{today.map((p) => <PlRow key={p.id} p={p} onOpen={openPost} />)}</div>
      ) : (
        <div className="empty">Heute nichts geplant.</div>
      )}

      <SectionHead title="Nächste Veröffentlichungen" link="Timeline" onLink={() => goStatus('geplant')} />
      <div className="stack" style={{ gap: 10 }}>{upcoming.map((p) => <PlRow key={p.id} p={p} showDay onOpen={openPost} />)}</div>
    </div>
  );
}

// ── Kalender ─────────────────────────────────────────────────
function PlKal({ day, setDay, openPost }: { day: number; setDay: (d: number) => void; openPost: (id: string) => void }): React.JSX.Element {
  const navigate = useNavigate();
  const { open } = useOverlay();
  const { posts } = usePlaner();
  const week = [8, 9, 10, 11, 12, 13, 14];
  const dayPosts = (d: number): PlanerPost[] => posts.filter((p) => p.day === d);
  const selPosts = dayPosts(day).sort((a, b) => (a.hhmm > b.hhmm ? 1 : -1));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 13px' }}>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 17 }}>Juni 2026 · KW 24</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="chevronL" size={15} /></button>
          <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="chevronR" size={15} /></button>
        </div>
      </div>
      <div className="smp-week">
        {week.map((n) => {
          const chs = [...new Set(dayPosts(n).map((p) => p.ch))];
          const on = day === n;
          const today = n === PL_TODAY;
          return (
            <button key={n} className={'cal-cell' + (on ? ' sel' : '') + (today ? ' today' : '')} style={{ aspectRatio: '1/1.32', alignItems: 'center', textAlign: 'center', gap: 5 }} onClick={() => setDay(n)}>
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{PL_WD[n]}</span>
              <span className="cal-num" style={{ fontSize: 14 }}>{n}</span>
              <span className="smp-daydots">{chs.map((c) => <span key={c} style={{ width: 5, height: 5, borderRadius: '50%', background: CHANNELS[c].color }} />)}</span>
            </button>
          );
        })}
      </div>
      <SectionHead title={PL_WDLONG[day] + ' · ' + day + '. Juni' + (day === PL_TODAY ? ' · Heute' : '')} link="Tagesplan →" onLink={() => navigate(`/projekte/planer/tag/${day}`)} />
      {selPosts.length ? (
        <div className="stack" style={{ gap: 10 }}>{selPosts.map((p) => <PlRow key={p.id} p={p} onOpen={openPost} />)}</div>
      ) : (
        <button className="smp-add" onClick={() => open('compose')}><Icon name="plus" size={15} />Post für diesen Tag</button>
      )}
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────
function PlTime({ filter, setFilter, openPost }: { filter: string; setFilter: (f: string) => void; openPost: (id: string) => void }): React.JSX.Element {
  const { posts } = usePlaner();
  const filters: Array<[string, string, PlanerStatusKey | null]> = [
    ['all', 'Alle', null],
    ['entwurf', 'Entwurf', 'entwurf'],
    ['freigabe', 'Freigabe', 'freigabe'],
    ['geplant', 'Geplant', 'geplant'],
    ['live', 'Live', 'live'],
  ];
  const groupOf = (p: PlanerPost): string => {
    if (p.status === 'live') return 'v';
    if (p.day === PL_TODAY) return 'h';
    if (p.status === 'entwurf') return 'e';
    return 'w';
  };
  const groups: Array<[string, string]> = [
    ['h', 'Heute · 12. Juni'],
    ['w', 'Diese Woche'],
    ['e', 'Entwürfe'],
    ['v', 'Veröffentlicht'],
  ];
  const vis = posts.filter((p) => (filter === 'all' ? true : p.status === filter));
  return (
    <div>
      <div className="smp-filter">
        {filters.map(([k, l, sc]) => (
          <button key={k} className={'chip ' + (filter === k ? 'on' : '')} onClick={() => setFilter(k)} style={{ fontSize: 11.5, padding: '5px 11px' }}>
            {sc && <span style={{ width: 7, height: 7, borderRadius: '50%', background: PLANER_STATUS[sc].color }} />}
            {l}
          </button>
        ))}
      </div>
      {groups.map(([g, label]) => {
        const items = vis.filter((p) => groupOf(p) === g).sort((a, b) => (a.day ?? 99) - (b.day ?? 99));
        if (!items.length) return null;
        return (
          <div key={g}>
            <div className="smp-group">
              <span>{label}</span>
              <span className="smp-group-line" />
              <span className="dim" style={{ fontFamily: 'var(--ff-mono)', fontSize: 10.5 }}>{items.length}</span>
            </div>
            <div className="stack" style={{ gap: 10 }}>{items.map((p) => <PlRow key={p.id} p={p} showDay onOpen={openPost} />)}</div>
          </div>
        );
      })}
      {!vis.length && <div className="empty">Keine Posts in diesem Filter.</div>}
    </div>
  );
}

// ── Hauptscreen ──────────────────────────────────────────────
export function PlanerScreen(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const navigate = useNavigate();
  const [view, setViewS] = useState<PlView>(PL_UI.view);
  const [filter, setFilterS] = useState<string>(PL_UI.filter);
  const [day, setDayS] = useState<number>(PL_UI.day);
  const setView = (v: PlView): void => { PL_UI.view = v; setViewS(v); };
  const setFilter = (f: string): void => { PL_UI.filter = f; setFilterS(f); };
  const setDay = (d: number): void => { PL_UI.day = d; setDayS(d); };
  const openPost = (id: string): void => navigate(`/projekte/planer/post/${id}`);

  return (
    <div className="screen" ref={ref}>
      <PlSwitch view={view} setView={setView} />
      <div className="smp-viewwrap" key={view}>
        {view === 'hub' && <PlHub openPost={openPost} setView={setView} setFilter={setFilter} />}
        {view === 'kalender' && <PlKal day={day} setDay={setDay} openPost={openPost} />}
        {view === 'timeline' && <PlTime filter={filter} setFilter={setFilter} openPost={openPost} />}
      </div>
    </div>
  );
}
