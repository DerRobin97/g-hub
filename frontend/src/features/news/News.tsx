import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { SectionHead } from '../../components/ui';
import { Sheet } from '../../components/Sheet';
import { useOverlay } from '../../app/OverlayContext';
import { NEWS, type NewsHighlight, type NewsItem as NewsItemT } from '../../lib/mockData';

/** News & Trends (Port `news.jsx`): Startseiten-Sektion, Liste, Detail-Sheet. */
const NEWS_COLORS: Record<string, string> = {
  Trend: 'var(--ch-tiktok)',
  Plattform: 'var(--ch-linkedin)',
  Mention: 'var(--ch-instagram)',
};
const catStyle = (cat: string): React.CSSProperties => ({
  color: NEWS_COLORS[cat],
  background: 'color-mix(in oklab, ' + NEWS_COLORS[cat] + ' 18%, transparent)',
});

type Article = NewsHighlight | NewsItemT;

function HighlightCard({ h, onClick }: { h: NewsHighlight; onClick?: () => void }): React.JSX.Element {
  return (
    <div className={'card' + (onClick ? ' tap' : '')} onClick={onClick} style={{ padding: 0, overflow: 'hidden' }}>
      <div className="ph" style={{ height: 152, alignItems: 'flex-start', padding: 13 }}>
        <span className="news-cat" style={catStyle(h.cat)}>{h.cat}</span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 16.5, lineHeight: 1.28, letterSpacing: '-0.01em' }}>{h.title}</div>
        <div className="dim" style={{ fontSize: 13, marginTop: 7, lineHeight: 1.5 }}>{h.teaser}</div>
        <div style={{ marginTop: 11, fontFamily: 'var(--ff-mono)', fontSize: 11.5, color: 'var(--text-3)', letterSpacing: '0.03em' }}>{h.src} · {h.time}</div>
      </div>
    </div>
  );
}

function NewsRow({ it, onClick }: { it: Article; onClick?: () => void }): React.JSX.Element {
  return (
    <div className="news-item" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <span className="news-dot" style={{ background: NEWS_COLORS[it.cat] }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="news-it-title">{it.title}</div>
        <div className="news-it-meta">{it.cat} · {it.src} · {it.time}</div>
      </div>
    </div>
  );
}

/** Startseiten-Sektion (Highlight + Liste). */
export function NewsSection(): React.JSX.Element {
  const { open } = useOverlay();
  const { highlight, items } = NEWS;
  return (
    <div>
      <div className="reveal r-up"><SectionHead title="Branchen-News & Trends" link="Alle" onLink={() => open('alerts', { tab: 'news' })} /></div>
      <div className="reveal r-up" style={{ marginTop: 10 }}>
        <HighlightCard h={highlight} onClick={() => open('newsDetail', { article: highlight })} />
      </div>
      <div className="card reveal r-up" style={{ marginTop: 12, padding: '2px 16px' }}>
        {items.slice(0, 3).map((it, i) => (
          <NewsRow key={i} it={it} onClick={() => open('newsDetail', { article: it })} />
        ))}
      </div>
    </div>
  );
}

/** Vollständige News-Liste (im Mitteilungen-Sheet). */
export function NewsContent(): React.JSX.Element {
  const { open } = useOverlay();
  const { highlight, items } = NEWS;
  const cats = ['Alle', 'Trend', 'Plattform', 'Mention'];
  const [f, setF] = useState('Alle');
  const list = f === 'Alle' ? items : items.filter((i) => i.cat === f);
  const showHi = f === 'Alle' || f === highlight.cat;
  const goDetail = (article: Article): void => open('newsDetail', { article });
  return (
    <>
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {cats.map((c) => (
          <button key={c} className={'chip ' + (f === c ? 'on' : '')} onClick={() => setF(c)}>{c}</button>
        ))}
      </div>
      {showHi && <HighlightCard h={highlight} onClick={() => goDetail(highlight)} />}
      <div style={{ marginTop: showHi ? 14 : 0, padding: '0 2px' }}>
        {list.map((it, i) => <NewsRow key={i} it={it} onClick={() => goDetail(it)} />)}
        {list.length === 0 && <div className="dim" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Keine Einträge in dieser Kategorie.</div>}
      </div>
    </>
  );
}

/** News-Detail-Sheet. */
export function NewsDetailSheet({ data, close }: { data: unknown; close: () => void }): React.JSX.Element {
  const { open } = useOverlay();
  const a = (data as { article?: Article })?.article ?? NEWS.highlight;
  const lead = ('teaser' in a && a.teaser) || 'Kompakte Einordnung für dein Social-Media-Team — tippe auf „Zur Quelle", um den vollständigen Beitrag zu lesen.';
  const related = [NEWS.highlight, ...NEWS.items].filter((n) => n.title !== a.title && n.cat === a.cat).slice(0, 3);
  const reason: Record<string, string> = {
    Trend: 'Relevanter Branchen-Trend — wirkt sich auf deine Content-Strategie aus.',
    Plattform: 'Plattform-Update — kann deine Reichweite und Posting-Optionen verändern.',
    Mention: 'Erwähnung deiner Marke — gut für Social Proof und Reposts.',
  };
  return (
    <Sheet
      title="News-Beitrag"
      onClose={close}
      full
      foot={
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ height: 46, width: 46, padding: 0, flexShrink: 0 }} aria-label="Merken"><Icon name="bookmark" size={18} /></button>
          <button className="btn btn-primary" style={{ flex: 1, height: 46, fontSize: 14 }}>Zur Quelle <Icon name="arrowUR" size={16} /></button>
        </div>
      }
    >
      <div className="ph" style={{ height: 190, borderRadius: 16, alignItems: 'flex-start', padding: 14, marginBottom: 18 }}>
        <span className="news-cat" style={catStyle(a.cat)}>{a.cat}</span>
      </div>
      <h1 style={{ fontFamily: 'var(--ff-disp)', fontWeight: 600, fontSize: 23, lineHeight: 1.22, letterSpacing: '-0.01em', margin: 0 }}>{a.title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--text-3)' }}>
        <span style={{ color: NEWS_COLORS[a.cat], fontWeight: 700 }}>{a.src}</span>
        <span>·</span>
        <span>{a.time}</span>
      </div>
      <div style={{ height: 1, background: 'var(--line)', margin: '18px 0' }} />
      <p style={{ fontSize: 15.5, lineHeight: 1.62, color: 'var(--text)', margin: 0 }}>{lead}</p>
      <div className="card" style={{ marginTop: 18, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', background: 'color-mix(in oklab, ' + NEWS_COLORS[a.cat] + ' 9%, var(--surface))', borderColor: 'color-mix(in oklab, ' + NEWS_COLORS[a.cat] + ' 30%, transparent)' }}>
        <span style={{ color: NEWS_COLORS[a.cat], flexShrink: 0, marginTop: 1 }}><Icon name="zap" size={18} /></span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Warum das zählt</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{reason[a.cat]}</div>
        </div>
      </div>
      {related.length > 0 && (
        <>
          <div className="sec-head" style={{ marginTop: 24 }}><div className="sec-title">Ähnliche Beiträge</div></div>
          <div className="card" style={{ padding: '2px 16px' }}>
            {related.map((it, i) => <NewsRow key={i} it={it} onClick={() => open('newsDetail', { article: it })} />)}
          </div>
        </>
      )}
    </Sheet>
  );
}
