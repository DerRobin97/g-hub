import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV, PROJ_SUB, headFor } from './nav';
import { useAppearance, type WebLayout } from './AppearanceContext';
import { useAuth } from '../auth/AuthContext';

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
 * App-Shell: Desktop-Sidebar + Topbar (aus `main-web.jsx`), responsive Bottom-Nav
 * (aus `main.jsx`) und Layout-Varianten full/rail/dual. Inhalte kommen via <Outlet/>.
 */
export function AppShell(): React.JSX.Element {
  const { user } = useAuth();
  const { theme, webLayout, setWebLayout, toggleTheme } = useAppearance();
  const location = useLocation();
  const navigate = useNavigate();

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

  const shellClass = `web-shell layout-${webLayout}${isLight ? ' theme-light' : ''}`;
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
          <div className="web-search" aria-hidden="true">
            <Icon name="search" size={17} />
            <span style={{ flex: 1, textAlign: 'left' }}>Suchen …</span>
            <kbd>⌘K</kbd>
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
        <div className={canvasClass}>
          <div className="web-inner">
            <Outlet />
          </div>
        </div>
      </div>

      {/* ---------- Bottom-Nav (Handy) ---------- */}
      <nav className="shell-bottomnav" aria-label="Hauptnavigation">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => 'shell-bn-item' + (isActive ? ' on' : '')}
          >
            <span className="shell-bn-ic">
              <Icon name={n.icon} size={22} />
            </span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
