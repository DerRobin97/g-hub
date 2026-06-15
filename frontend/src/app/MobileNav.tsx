import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV } from './nav';
import { useOverlay } from './OverlayContext';

/**
 * KI „Spark-Slide" (Design-Doku Kap. 6): beim Öffnen des KI-Assistenten zündet am
 * FAB ein kurzer Funken-Burst (WAAPI), danach gleitet das Sheet hoch.
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
 * Dedizierte mobile Bottom-Nav (≤860px). Eigenständig und unabhängig von der
 * Prototyp-`.nav`/`.web-shell`-Grid — eigene `mnav-*`-Klassen, am Viewport `fixed`.
 * Rendert eine Liquid-Glass-Leiste (2 Slots + zentraler Erstellen-FAB + 2 Slots)
 * und einen separaten KI-FAB. `collapsed` wird beim Scrollen vom AppShell gesetzt.
 */
export function MobileNav({ collapsed }: { collapsed: boolean }): React.JSX.Element {
  const { open } = useOverlay();
  return (
    <div className={'mnav-shell' + (collapsed ? ' is-collapsed' : '')}>
      <nav className="mnav-bar" aria-label="Hauptnavigation">
        <div className="mnav-wrap">
          {NAV.slice(0, 2).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => 'mnav-item' + (isActive ? ' on' : '')}
            >
              <Icon name={n.icon} size={22} />
              <span className="mnav-label">{n.label}</span>
            </NavLink>
          ))}
          <div className="mnav-fab-slot">
            <button className="mnav-fab" onClick={() => open('create')} aria-label="Erstellen">
              <Icon name="plus" size={24} stroke={2.3} />
            </button>
          </div>
          {NAV.slice(2).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => 'mnav-item' + (isActive ? ' on' : '')}
            >
              <Icon name={n.icon} size={22} />
              <span className="mnav-label">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <button
        className="mnav-ai"
        onClick={(e) => {
          fireSpark(e.currentTarget);
          open('ai');
        }}
        aria-label="KI-Assistent öffnen"
      >
        <span className="mnav-ai-badge">KI</span>
        <span className="mnav-ai-spark">
          <Icon name="bot" size={26} stroke={1.8} />
        </span>
      </button>
    </div>
  );
}
