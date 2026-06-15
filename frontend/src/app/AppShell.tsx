import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV, PROJ_SUB, headFor } from './nav';
import { useAppearance, type WebLayout } from './AppearanceContext';
import { useAuth } from '../auth/AuthContext';
import { useOverlay } from './OverlayContext';
import { AIDock } from '../features/ai/AIAssistant';
import { INBOX, NEWS } from '../lib/mockData';

const LAYOUTS: Array<[WebLayout, string]> = [
  ['full', 'Voll'],
  ['rail', 'Rail'],
  ['dual', 'Doppel'],
];

function ThemeGlyph({ light }: { light: boolean }): React.JSX.Element {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {light ? (
        <>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
        </>
      ) : (
        <path d="M20 14.5A8 8 0 0 1 9.5 4 7.5 7.5 0 1 0 20 14.5z" />
      )}
    </svg>
  );
}

/**
 * KI „Spark-Slide" (Design-Doku Kap. 6): beim Öffnen des KI-Assistenten zündet am
 * FAB ein kurzer Funken-Burst (WAAPI), danach gleitet das Sheet hoch (CSS `sheet-ai`).
 * Erzeugt ein transientes Element über dem FAB und entfernt es nach der Animation.
 */
function fireSpark(anchor: HTMLElement): void {
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = anchor.getBoundingClientRect();
  const s = document.createElement('div');
  s.style.cssText =
    `position:fixed; left:${r.left + r.width / 2}px; top:${r.top + r.height / 2}px;` +
    `width:${r.width}px; height:${r.height}px; transform:translate(-50%,-50%);` +
    'border-radius:16px; background:var(--accent); pointer-events:none; z-index:70;';
  document.body.appendChild(s);
  const anim = s.animate(
    [
      { opacity: 1, transform: 'translate(-50%,-50%) scale(.3)', boxShadow: '0 0 0 0 var(--accent-glow)' },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(2.8)', boxShadow: '0 0 0 30px transparent' },
    ],
    { duration: 460, easing: 'cubic-bezier(.2,.7,.3,1)' },
  );
  anim.onfinish = (): void => s.remove();
}

/**
 * App-Shell: Desktop-Sidebar + Topbar (aus `main-web.jsx`), responsive Bottom-Nav
 * (aus `main.jsx`) und Layout-Varianten full/rail/dual. Inhalte kommen via <Outlet/>.
 */
export function AppShell(): React.JSX.Element {
  const { user } = useAuth();
  const { theme, webLayout, setWebLayout, toggleTheme } = useAppearance();
  const { open } = useOverlay();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const alertCount = INBOX.filter((n) => n.unread).length + (NEWS.unread || 0);

  // Nav-Collapse beim Scrollen (Design-Doku Kap. 6): ab scrollTop > 18 px einklappen.
  const onCanvasScroll = (): void => setNavCollapsed((canvasRef.current?.scrollTop ?? 0) > 18);
  // Beim Routenwechsel Nav wieder ausklappen und Inhalt nach oben scrollen.
  useEffect(() => {
    setNavCollapsed(false);
    canvasRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const isLight = theme === 'light';
  const firstName = user?.name?.split(' ')[0];
  const head = headFor(location.pathname, firstName);
  const initial = (user?.name?.trim()?.[0] ?? 'G').toUpperCase();
  const workspace = user?.memberships[0];

  const onProjekte = location.pathname.startsWith('/projekte');
  const showSub = webLayout === 'dual' && onProjekte;
  const isWide = location.pathname === '/' || location.pathname.startsWith('/analytics');
  // „Zurück" anzeigen, sobald wir auf einer Unterseite sind (z. B. /projekte/<bereich>).
  const depth = location.pathname.split('/').filter(Boolean).length;
  const showBack = depth > 1;

  const shellClass = `web-shell layout-${webLayout}${isLight ? ' theme-light' : ''}${aiOpen ? ' ai-open' : ''}`;
  const canvasClass = `web-canvas ${isWide ? 'wide' : 'col'}${showSub ? ' in-sub' : ''}`;

  return (
    <div className={shellClass}>
      {/* ---------- Seitenleiste (Desktop) ---------- */}
      <aside className="web-side">
        <div className="web-brand">
          <div className="web-brand-mark">{initial}</div>
          <div className="web-brand-tx">
            <div className="web-brand-name">{workspace?.workspaceName ?? 'Gerber-Hub'}</div>
            <div className="web-brand-sub">Marketing</div>
          </div>
        </div>

        <button className="web-create" data-tip="Erstellen" onClick={() => open('create')}>
          <Icon name="plus" size={20} stroke={2.3} />
          <span className="web-create-tx">Erstellen</span>
        </button>

        <div className="web-nav-grp">Navigation</div>
        <nav className="web-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => 'web-nav-item' + (isActive ? ' on' : '')}
            >
              <span className="web-nav-ic">
                <Icon name={n.icon} size={21} />
              </span>
              <span className="web-nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="web-side-spacer" />

        <div className="web-foot">
          <div className="web-seg" role="tablist" aria-label="Layout">
            {LAYOUTS.map(([k, l]) => (
              <button
                key={k}
                className={webLayout === k ? 'on' : ''}
                onClick={() => setWebLayout(k)}
                title={'Layout: ' + l}
              >
                <span className="web-seg-tx">{l}</span>
              </button>
            ))}
          </div>
          <div className="web-foot-row">
            <button className="web-profile" onClick={() => navigate('/profil')}>
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                {initial}
              </div>
              <div className="web-profile-tx">
                <div className="web-profile-name">{user?.name}</div>
                <div className="web-profile-role">{workspace?.role ?? 'Mitglied'}</div>
              </div>
            </button>
            <button
              className="web-iconbtn"
              onClick={toggleTheme}
              title={isLight ? 'Dunkel' : 'Hell'}
              aria-label="Erscheinung wechseln"
            >
              <ThemeGlyph light={isLight} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Hauptbereich ---------- */}
      <div className={'web-main' + (showSub ? ' has-sub' : '')}>
        <header className="web-top">
          {showBack && (
            <button className="web-back" onClick={() => navigate(-1)} aria-label="Zurück">
              <Icon name="chevronL" size={22} stroke={2.1} />
            </button>
          )}
          <div className="web-titles">
            <div className="web-kicker">{head.kicker}</div>
            <div className="web-title">{head.title}</div>
          </div>
          <button className="web-search" onClick={() => open('search')} aria-label="Suche öffnen">
            <Icon name="search" size={17} />
            <span style={{ flex: 1, textAlign: 'left' }}>Suchen …</span>
            <kbd>⌘K</kbd>
          </button>
          <div className="web-top-actions">
            <button className="web-iconbtn" onClick={() => open('alerts')} aria-label="Mitteilungen">
              <Icon name="bell" size={19} />
              {alertCount > 0 && <span className="web-badge-dot">{alertCount}</span>}
            </button>
          </div>
        </header>

        {/* Kontext-Spalte (Doppel-Layout) */}
        {showSub && (
          <div className="web-subnav">
            <div className="web-subnav-grp">Bereiche</div>
            {PROJ_SUB.map((s) => (
              <NavLink
                key={s.key}
                to={`/projekte/${s.key}`}
                className={({ isActive }) => 'web-subnav-item' + (isActive ? ' on' : '')}
              >
                <span className="web-nav-ic">
                  <Icon name={s.icon} size={19} />
                </span>
                <span>
                  <span className="web-subnav-t">{s.name}</span>
                  <span className="web-subnav-s">{s.sub}</span>
                </span>
              </NavLink>
            ))}
          </div>
        )}

        {/* Inhaltsfläche — geroutete Seiten */}
        <div className={canvasClass} ref={canvasRef} onScroll={onCanvasScroll}>
          <div className="web-inner">
            <Outlet />
          </div>
        </div>
      </div>

      {/* ---------- KI-Assistent (andockbares Panel) ---------- */}
      <div className="web-ai" aria-hidden={!aiOpen}>
        {aiOpen && <AIDock onClose={() => setAiOpen(false)} />}
      </div>

      {/* ---------- KI-FAB (unten rechts) ---------- */}
      {!aiOpen && (
        <button className="web-fab" onClick={() => setAiOpen(true)} aria-label="KI-Assistent öffnen">
          <Icon name="bot" size={24} stroke={1.9} />
          <span className="web-fab-tx">KI-Assistent</span>
        </button>
      )}

      {/* ---------- Handy-Shell: Liquid-Glass-Nav + zentraler FAB + KI-FAB ---------- */}
      <div className={'shell-phone' + (navCollapsed ? ' nav-collapsed' : '')}>
        <nav className={'nav' + (navCollapsed ? ' nav-collapsed' : '')} aria-label="Hauptnavigation">
          <div className="nav-wrap">
            {NAV.slice(0, 2).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' on' : '')}
              >
                <Icon name={n.icon} size={22} />
                <span className="nav-label">{n.label}</span>
              </NavLink>
            ))}
            <div className="nav-fab-slot">
              <button className="nav-fab" onClick={() => open('create')} aria-label="Erstellen">
                <Icon name="plus" size={24} stroke={2.3} />
              </button>
            </div>
            {NAV.slice(2).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' on' : '')}
              >
                <Icon name={n.icon} size={22} />
                <span className="nav-label">{n.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <button
          className="ai-fab"
          onClick={(e) => {
            fireSpark(e.currentTarget);
            open('ai');
          }}
          aria-label="KI-Assistent öffnen"
        >
          <span className="ai-fab-badge">KI</span>
          <span className="ai-fab-spark"><Icon name="bot" size={26} stroke={1.8} /></span>
        </button>
      </div>
    </div>
  );
}
