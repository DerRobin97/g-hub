import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimeEntryDto, TimeOverviewDto, AssetDto } from '@g-hub/shared';
import { Icon, type IconName } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { Avatar, Bars, ChannelBadge, Ring } from '../../components/ui';
import { useOverlay, type SheetProps } from '../../app/OverlayContext';
import { NewsContent } from '../news/News';
import {
  getTimeMonth,
  getTimeToday,
  timeBreakEnd,
  timeBreakStart,
  timeClockIn,
  timeClockOut,
  getAssets,
  uploadAsset,
} from '../../lib/api';
import {
  ASSETS,
  CHANNELS,
  CONTENT,
  INBOX,
  NEWS,
  TASKS,
  TEAM,
  TEAM_BY_ID,
  type SimpleTask,
} from '../../lib/mockData';

const labelStyleField: React.CSSProperties = { marginTop: 16 };

// ── Create-Hub ───────────────────────────────────────────────
export function CreateHubSheet({ close }: SheetProps): React.JSX.Element {
  const { open } = useOverlay();
  const cards: Array<{ icon: IconName; label: string; sub: string; type: string }> = [
    { icon: 'edit', label: 'Beitrag', sub: 'Feed-Post für mehrere Kanäle', type: 'post' },
    { icon: 'image', label: 'Story', sub: '24-Stunden-Story', type: 'story' },
    { icon: 'video', label: 'Reel', sub: 'Kurzvideo bis 90 Sek.', type: 'reel' },
    { icon: 'campaign', label: 'Kampagne', sub: 'Mehrere Posts & Budget', type: 'campaign' },
  ];
  return (
    <Sheet title="Erstellen" onClose={close}>
      <div className="dim" style={{ fontSize: 13, margin: '0 2px 14px' }}>Was möchtest du erstellen?</div>
      <div className="create-grid">
        {cards.map((c) => (
          <button key={c.label} className="create-opt" onClick={() => open('compose', { type: c.type })}>
            <span className="create-ico"><Icon name={c.icon} size={22} /></span>
            <span className="create-label">{c.label}</span>
            <span className="create-sub">{c.sub}</span>
          </button>
        ))}
      </div>
      <button className="create-row" onClick={() => open('tasks')}>
        <span className="create-ico" style={{ width: 38, height: 38 }}><Icon name="check" size={19} /></span>
        <span style={{ flex: 1, textAlign: 'left' }}>
          <span className="create-label" style={{ fontSize: 15 }}>Aufgabe</span>
          <span className="create-sub">To-do fürs Team anlegen</span>
        </span>
        <Icon name="chevronR" size={18} style={{ color: 'var(--text-3)' }} />
      </button>
    </Sheet>
  );
}

// ── Compose ──────────────────────────────────────────────────
const SUGGESTIONS = [
  '🚀 Großer Tag! Unser Sommer-Launch ist live. Sichert euch jetzt den Early-Bird-Vorteil — nur diese Woche. Link in Bio. #Launch #Sommer2026',
  'Hinter den Kulissen: So entsteht unsere neue Kampagne. Swipe für die 5 wichtigsten Schritte 👉 Was würdet ihr ergänzen?',
  '3 Growth-Hacks, die wir 2026 wirklich nutzen — kurz & ohne Buzzwords. Speichern lohnt sich. Welcher fehlt euch?',
];
const COMPOSE_TITLES: Record<string, string> = { post: 'Beitrag erstellen', story: 'Story erstellen', reel: 'Reel erstellen', campaign: 'Kampagne erstellen' };

export function ComposeSheet({ data, close }: SheetProps): React.JSX.Element {
  const d = data as { type?: string; day?: number } | undefined;
  const composeTitle = COMPOSE_TITLES[d?.type ?? ''] || 'Beitrag erstellen';
  const [chs, setChs] = useState<string[]>(['instagram']);
  const [text, setText] = useState('');
  const [when] = useState(d?.day ? `${d.day}. Juni` : '12. Juni');
  const [time] = useState('09:00');
  const [media, setMedia] = useState<string[]>(['a3']);
  const toggle = (k: string): void => setChs((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const aiFill = (): void => setText(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);

  const foot = (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}>Entwurf</button>
      <button className="btn btn-primary" style={{ flex: 2 }} onClick={close}><Icon name="send" size={17} /> Für {when} planen</button>
    </div>
  );

  return (
    <Sheet title={composeTitle} onClose={close} foot={foot} full>
      <label className="lbl">Kanäle</label>
      <div className="chip-row" style={{ marginBottom: 18 }}>
        {Object.keys(CHANNELS).map((k) => (
          <button key={k} className={'chip ' + (chs.includes(k) ? 'on' : '')} onClick={() => toggle(k)} style={{ paddingLeft: 7 }}>
            <ChannelBadge ch={k} size={20} />{CHANNELS[k].name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label className="lbl" style={{ margin: 0 }}>Text</label>
        <button className="chip on" onClick={aiFill} style={{ background: 'var(--accent-soft)', color: 'var(--accent-fg)', border: '1px solid var(--accent-line)' }}>
          <Icon name="sparkle" size={14} /> KI-Vorschlag
        </button>
      </div>
      <textarea className="field" rows={5} placeholder="Was möchtest du teilen?" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="dim" style={{ fontSize: 11.5, textAlign: 'right', marginTop: 6, fontFamily: 'var(--ff-mono)' }}>{text.length} / 2200</div>

      <label className="lbl" style={labelStyleField}>Medien</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {media.map((id) => {
          const a = ASSETS.find((x) => x.id === id);
          return (
            <div key={id} style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
              <div className="ph" style={{ padding: 6 }}><span className="ph-tag">{a ? a.tag : ''}</span></div>
              <button onClick={() => setMedia((m) => m.filter((x) => x !== id))} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 0, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="close" size={11} /></button>
            </div>
          );
        })}
        <button onClick={() => setMedia((m) => [...m, 'a' + (m.length + 1)])} style={{ width: 72, height: 72, borderRadius: 14, border: '1.5px dashed var(--line-strong)', background: 'var(--surface)', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
          <Icon name="image" size={20} /><span style={{ fontSize: 10, fontWeight: 600 }}>Asset</span>
        </button>
      </div>

      <label className="lbl">Planung</label>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1.4 }}>
          <Icon name="calendar" size={18} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontWeight: 600 }}>{when}</span>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Icon name="clock" size={18} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontWeight: 600 }}>{time}</span>
        </div>
      </div>

      {chs.length > 0 && (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12.5 }}>
          <Icon name="globe" size={15} /> Wird auf {chs.length} {chs.length === 1 ? 'Kanal' : 'Kanälen'} veröffentlicht
        </div>
      )}
    </Sheet>
  );
}

// ── Inbox / Mitteilungen ─────────────────────────────────────
function InboxContent(): React.JSX.Element {
  const [items, setItems] = useState(INBOX);
  const icons: Record<string, IconName> = { comment: 'message', approve: 'checkCircle', metric: 'trend', system: 'bell', upload: 'layers' };
  const markAll = (): void => setItems((it) => it.map((x) => ({ ...x, unread: false })));
  const unread = items.filter((x) => x.unread).length;
  return (
    <>
      {unread > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
          <span className="dim" style={{ fontSize: 12.5 }}>{unread} ungelesen</span>
          <button className="sec-link" onClick={markAll}>Alle als gelesen</button>
        </div>
      )}
      <div className="stack">
        {items.map((n) => (
          <div key={n.id} className="card" style={{ display: 'flex', gap: 13, padding: 14, position: 'relative', borderColor: n.unread ? 'var(--accent-line)' : 'var(--line)' }}>
            {n.who ? (
              <Avatar m={n.who} size={40} />
            ) : (
              <div className="kpi-ico" style={{ width: 40, height: 40, borderRadius: 12, background: 'none', color: 'var(--accent-fg)' }}><Icon name={icons[n.type]} size={19} /></div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.35 }}>
                {n.who && <span style={{ fontWeight: 700 }}>{TEAM_BY_ID[n.who].name} </span>}
                <span className="muted">{n.txt}</span>
              </div>
              {n.sub && <div className="dim" style={{ fontSize: 13, marginTop: 4, fontStyle: n.type === 'comment' ? 'italic' : 'normal' }}>{n.sub}</div>}
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--ff-mono)' }}>{n.t}</div>
            </div>
            {n.unread && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </>
  );
}

export function AlertsSheet({ data, close }: SheetProps): React.JSX.Element {
  const [tab, setTab] = useState((data as { tab?: string })?.tab || 'inbox');
  return (
    <Sheet title="Mitteilungen" onClose={close} full>
      <div className="seg" style={{ marginBottom: 16 }}>
        <button className={tab === 'inbox' ? 'on' : ''} onClick={() => setTab('inbox')}>Benachrichtigungen</button>
        <button className={tab === 'news' ? 'on' : ''} onClick={() => setTab('news')}>News</button>
      </div>
      {tab === 'inbox' ? <InboxContent /> : <NewsContent />}
    </Sheet>
  );
}

// ── Suche ────────────────────────────────────────────────────
interface SearchHit {
  k: string;
  icon?: IconName;
  ch?: string;
  avatar?: string;
  title: string;
  sub: string;
  go: () => void;
}

export function SearchSheet({ close }: SheetProps): React.JSX.Element {
  const { open } = useOverlay();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 360);
    return () => clearTimeout(t);
  }, []);
  const ql = q.trim().toLowerCase();
  const m = (s: string): boolean => (s || '').toLowerCase().includes(ql);

  const posts: Array<{ ch: string; t: string; time: string; day: number }> = [];
  Object.keys(CONTENT).forEach((d) => CONTENT[+d].forEach((p) => posts.push({ ...p, day: +d })));

  const groups: Array<[string, SearchHit[]]> = !ql
    ? []
    : (
        [
          ['Beiträge', posts.filter((p) => m(p.t)).map((p, i) => ({ k: 'p' + i, ch: p.ch, title: p.t, sub: `${p.day}. Juni · ${p.time} Uhr`, go: () => open('post', p) }))],
          ['Aufgaben', TASKS.filter((t) => m(t.t)).map((t) => ({ k: t.id, icon: 'check' as IconName, title: t.t, sub: t.tag + ' · ' + t.due, go: () => open('tasks') }))],
          ['Assets', ASSETS.filter((a) => m(a.tag)).map((a) => ({ k: a.id, icon: 'layers' as IconName, title: a.tag, sub: a.kind, go: () => open('assets') }))],
          ['Team', TEAM.filter((x) => m(x.name)).map((x) => ({ k: x.id, avatar: x.id, title: x.name, sub: x.role, go: () => open('team') }))],
          ['News', [NEWS.highlight, ...NEWS.items].filter((n) => m(n.title)).map((n, i) => ({ k: 'n' + i, icon: 'news' as IconName, title: n.title, sub: n.cat + ' · ' + n.src, go: () => open('alerts', { tab: 'news' }) }))],
        ] as Array<[string, SearchHit[]]>
      ).filter((g) => g[1].length);
  const total = groups.reduce((s, g) => s + g[1].length, 0);

  return (
    <Sheet title="Suche" onClose={close} variant="sheet-search">
      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Icon name="search" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Beiträge, Aufgaben, Assets, Team, News…" style={{ flex: 1, minWidth: 0, background: 'none', border: 0, outline: 'none', color: 'var(--text)', fontFamily: 'var(--ff)', fontSize: 15 }} />
        {q && (
          <button onClick={() => setQ('')} aria-label="Leeren" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'var(--surface-3)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={12} /></button>
        )}
      </div>

      {!ql && (
        <div className="dim" style={{ fontSize: 13, textAlign: 'center', padding: '34px 24px', lineHeight: 1.55 }}>
          Durchsuche die ganze App — geplante Beiträge, Aufgaben, Assets, Team und News.
        </div>
      )}
      {ql && total === 0 && <div className="empty" style={{ padding: '34px 0' }}>Keine Treffer für „{q}".</div>}

      {groups.map(([label, items]) => (
        <div key={label} style={{ marginTop: 14 }}>
          <div className="search-grp">{label} · {items.length}</div>
          <div className="card" style={{ padding: '2px 14px' }}>
            {items.map((it) => (
              <button key={it.k} className="search-row" onClick={it.go}>
                {it.avatar ? <Avatar m={it.avatar} size={34} /> : it.ch ? <ChannelBadge ch={it.ch} size={34} /> : <span className="search-ico"><Icon name={it.icon ?? 'search'} size={18} /></span>}
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <span className="search-t">{it.title}</span>
                  <span className="search-s">{it.sub}</span>
                </span>
                <Icon name="chevronR" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  );
}

// ── Team ─────────────────────────────────────────────────────
export function TeamSheet({ close }: SheetProps): React.JSX.Element {
  return (
    <Sheet title="Team" onClose={close} full foot={<button className="btn btn-ghost btn-block" onClick={close}><Icon name="plus" size={18} /> Mitglied einladen</button>}>
      <div className="stack">
        {TEAM.map((m) => (
          <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13 }}>
            <Avatar m={m} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-t" style={{ fontSize: 15 }}>{m.name}</div>
              <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

// ── Assets ───────────────────────────────────────────────────
export function AssetsSheet({ close }: SheetProps): React.JSX.Element {
  const [filter, setFilter] = useState('Alle');
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const kinds = ['Alle', 'Bild', 'Video', 'Datei'];

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setAssets(await getAssets());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assets konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) await uploadAsset(file);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const shown = filter === 'Alle' ? assets : assets.filter((a) => a.kind === filter);
  const hintStyle: React.CSSProperties = {
    padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
  };

  return (
    <Sheet title="Asset-Bibliothek" onClose={close} full foot={<button className="btn btn-primary btn-block" disabled={uploading} onClick={() => inputRef.current?.click()}><Icon name="plus" size={18} /> {uploading ? 'Lädt hoch…' : 'Hochladen'}</button>}>
      <input ref={inputRef} type="file" multiple hidden onChange={onPick} />
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {kinds.map((k) => <button key={k} className={'chip ' + (filter === k ? 'on' : '')} onClick={() => setFilter(k)}>{k}</button>)}
      </div>
      {error && (
        <div style={{ background: 'color-mix(in oklab, var(--bad) 14%, var(--surface))', border: '1px solid var(--bad)', color: 'var(--bad)', borderRadius: 11, padding: '10px 13px', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}
      {loading ? (
        <div style={hintStyle}>Lädt…</div>
      ) : shown.length === 0 ? (
        <div style={hintStyle}>Noch keine Assets — lade welche hoch.</div>
      ) : (
        <div className="asset-grid">
          {shown.map((a) => (
            <div key={a.id} className="asset">
              {a.kind === 'Bild' ? (
                <img src={a.url} alt={a.tag} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="ph"><span className="ph-tag">{a.tag}</span></div>
              )}
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                  <Icon name={a.kind === 'Video' ? 'video' : a.kind === 'Datei' ? 'file' : 'image'} size={11} />{a.kind}
                </span>
              </div>
              {a.channel && <div style={{ position: 'absolute', bottom: 8, right: 8 }}><ChannelBadge ch={a.channel} size={22} /></div>}
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

// ── Aufgaben ─────────────────────────────────────────────────
const PRIO: Record<string, { c: string; l: string }> = {
  high: { c: 'var(--bad)', l: 'Hoch' },
  med: { c: 'var(--warn)', l: 'Mittel' },
  low: { c: 'var(--text-3)', l: 'Niedrig' },
};

export function TasksSheet({ close }: SheetProps): React.JSX.Element {
  const [tasks, setTasks] = useState<SimpleTask[]>(TASKS);
  const [filter, setFilter] = useState('open');
  const toggle = (id: string): void => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done, due: !t.done ? 'Erledigt' : 'Heute' } : t)));
  const shown = tasks.filter((t) => (filter === 'open' ? !t.done : filter === 'done' ? t.done : true));
  const openN = tasks.filter((t) => !t.done).length;
  return (
    <Sheet title="Aufgaben" onClose={close} full foot={<button className="btn btn-primary btn-block" onClick={close}><Icon name="plus" size={18} /> Aufgabe hinzufügen</button>}>
      <div className="seg" style={{ marginBottom: 16 }}>
        {([['open', `Offen · ${openN}`], ['done', 'Erledigt'], ['all', 'Alle']] as Array<[string, string]>).map(([k, l]) => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="stack">
        {shown.map((t) => (
          <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, opacity: t.done ? 0.6 : 1 }}>
            <button onClick={() => toggle(t.id)} style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, cursor: 'pointer', border: t.done ? '0' : '2px solid var(--line-strong)', background: t.done ? 'var(--accent)' : 'transparent', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}>
              {t.done && <Icon name="check" size={14} stroke={3} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-t" style={{ whiteSpace: 'normal', textDecoration: t.done ? 'line-through' : 'none' }}>{t.t}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <span className="cdot" style={{ background: PRIO[t.prio].c }} />
                <span className="dim" style={{ fontSize: 12 }}>{t.tag}</span>
                <span className="dim" style={{ fontSize: 12 }}>· {t.due}</span>
              </div>
            </div>
            <Avatar m={t.who} size={28} />
          </div>
        ))}
        {shown.length === 0 && <div className="empty">Alles erledigt 🎉</div>}
      </div>
    </Sheet>
  );
}

// ── Post-Detail (aus Suche) ──────────────────────────────────
export function PostSheet({ data, close }: SheetProps): React.JSX.Element {
  const p = data as { ch: string; t: string; day: number; time: string; status?: string };
  return (
    <Sheet title="Geplanter Beitrag" onClose={close}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <ChannelBadge ch={p.ch} size={42} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{CHANNELS[p.ch]?.name ?? p.ch}</div>
          <div className="dim" style={{ fontSize: 12.5 }}>{p.day}. Juni · {p.time} Uhr</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ph" style={{ height: 170, alignItems: 'flex-end' }}><span className="ph-tag">visual · {p.t}</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6 }}>{p.t}</div>
          <div className="dim" style={{ fontSize: 13, lineHeight: 1.5 }}>Beschreibung & Caption werden hier angezeigt. Hashtags und Mentions inklusive. #marketing #growth</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}><Icon name="edit" size={16} /> Bearbeiten</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={close}><Icon name="check" size={17} /> Freigeben</button>
      </div>
    </Sheet>
  );
}

// ── Zeiterfassung (echtes Backend, §4.11) ────────────────────
const pad2 = (n: number): string => String(n).padStart(2, '0');
const hmsFromSeconds = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  return pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60);
};
const fmtH = (n: number): string => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function WorkTimeSheet({ close }: SheetProps): React.JSX.Element {
  const [entry, setEntry] = useState<TimeEntryDto | null>(null);
  const [overview, setOverview] = useState<TimeOverviewDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const reload = useCallback(async (): Promise<void> => {
    const [t, o] = await Promise.all([getTimeToday(), getTimeMonth()]);
    setEntry(t);
    setOverview(o);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const status = entry?.status ?? 'out';

  // Live-Ticker, solange eine Stempelung läuft (in/break).
  useEffect(() => {
    if (status === 'out') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const segElapsed = (): number => {
    if (!entry?.segmentStart) return 0;
    return Math.max(0, Math.floor((now - Date.parse(entry.segmentStart)) / 1000));
  };
  const liveWork = (entry?.workSeconds ?? 0) + (status === 'in' ? segElapsed() : 0);
  const liveBreak = (entry?.breakSeconds ?? 0) + (status === 'break' ? segElapsed() : 0);

  const act = (fn: () => Promise<TimeEntryDto>): void => {
    if (busy) return;
    setBusy(true);
    fn()
      .then(() => reload())
      .finally(() => setBusy(false));
  };

  const sinceLabel = entry?.clockIn
    ? new Date(entry.clockIn).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : '';
  const stColor = status === 'in' ? 'var(--ok)' : status === 'break' ? 'var(--accent)' : 'var(--text-3)';
  const stLabel = status === 'in' ? `Eingestempelt seit ${sinceLabel}` : status === 'break' ? 'In Pause' : 'Ausgestempelt';

  const monthH = (overview?.monthSeconds ?? 0) / 3600;
  const targetH = (overview?.targetSeconds ?? 0) / 3600;
  const balanceH = (overview?.balanceSeconds ?? 0) / 3600;
  const weekSumH = (overview?.week.reduce((s, d) => s + d.seconds, 0) ?? 0) / 3600;
  const weeklyTarget = overview?.settings.weeklyTarget ?? 40;
  const A = overview?.absence;
  const absCards = A
    ? [
        { label: 'Urlaub übrig', value: A.vacationTotal - A.vacationUsed + ' T', tint: 'var(--ch-instagram)' },
        { label: 'Urlaub genutzt', value: A.vacationUsed + ' T', tint: 'var(--text-2)' },
        { label: 'Krank', value: A.sickDays + ' T', tint: 'var(--bad)' },
        { label: 'Feiertage', value: A.holidays + ' T', tint: 'var(--text-2)' },
      ]
    : [];

  return (
    <Sheet title="Arbeitszeit" onClose={close} full variant="sheet-worktime">
      <div className="feature" style={{ textAlign: 'center', paddingTop: 18, paddingBottom: 18 }}>
        <div className="tag" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stColor, transition: 'background .2s' }} />{stLabel}
        </div>
        <div className="tabular" style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: 48, letterSpacing: '-0.02em', margin: '8px 0 4px', fontVariantNumeric: 'tabular-nums' }}>
          {status === 'out' ? '00:00:00' : hmsFromSeconds(liveWork)}
        </div>
        <div className="dim" style={{ fontFamily: 'var(--ff-mono)', fontSize: 12.5, minHeight: 18 }}>
          {status === 'out' ? 'Bereit zum Einstempeln' : `Pause heute · ${hmsFromSeconds(liveBreak)}`}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {status === 'out' && <button className="btn btn-primary btn-block" disabled={busy} onClick={() => act(timeClockIn)}><Icon name="play" size={18} /> Einstempeln</button>}
          {status === 'in' && (
            <>
              <button className="btn btn-ghost" style={{ flex: 1 }} disabled={busy} onClick={() => act(timeBreakStart)}><Icon name="coffee" size={17} /> Pause</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--bad)', color: '#fff' }} disabled={busy} onClick={() => act(timeClockOut)}><Icon name="stop" size={16} /> Ausstempeln</button>
            </>
          )}
          {status === 'break' && <button className="btn btn-primary btn-block" disabled={busy} onClick={() => act(timeBreakEnd)}><Icon name="play" size={18} /> Pause beenden</button>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Ring pct={targetH ? Math.min(monthH / targetH, 1) : 0} size={84} sw={9}><span style={{ fontSize: 15 }}>{targetH ? Math.round((monthH / targetH) * 100) : 0}%</span></Ring>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tag" style={{ marginBottom: 4 }}>{overview?.monthLabel ?? '—'}</div>
          <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 19 }}>{fmtH(monthH)} <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/ {Math.round(targetH)} Std</span></div>
          <div className="dim" style={{ fontSize: 12.5, marginTop: 4 }}>Saldo <span style={{ color: balanceH >= 0 ? 'var(--ok)' : 'var(--bad)', fontWeight: 600 }}>{balanceH >= 0 ? '+' : ''}{fmtH(balanceH)} Std</span> · Woche {fmtH(weekSumH)} Std</div>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginTop: 12 }}>
        {absCards.map((c) => (
          <div key={c.label} className="kpi" style={{ minHeight: 0, gap: 3, padding: '13px 14px' }}>
            <div className="kpi-val" style={{ fontSize: 21, color: c.tint }}>{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="sec-title" style={{ fontSize: 15 }}>Diese Woche</div>
          <span className="dim" style={{ fontSize: 12.5 }}>Ziel {Math.round(weeklyTarget / 5)} Std/Tag</span>
        </div>
        <Bars data={(overview?.week ?? []).map((d) => d.seconds / 3600)} labels={(overview?.week ?? []).map((d) => d.label)} h={120} />
      </div>

      <div className="card" style={{ marginTop: 12, padding: '4px 16px' }}>
        {(overview?.week ?? []).map((d) => {
          const h = d.seconds / 3600;
          return (
            <div key={d.date} className="row">
              <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 14, width: 34 }}>{d.label}</div>
              <div className="bar" style={{ flex: 1 }}><span style={{ width: `${Math.min((h / 8) * 100, 100)}%` }} /></div>
              <span className="tabular" style={{ fontFamily: 'var(--ff-mono)', fontSize: 12.5, color: 'var(--text-2)', width: 56, textAlign: 'right' }}>{fmtH(h)} Std</span>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
