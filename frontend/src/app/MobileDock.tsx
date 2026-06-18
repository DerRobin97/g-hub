import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV } from './nav';
import { useOverlay } from './OverlayContext';

/**
 * Massiv-Dock (Variante 01) — feste, randlose Bottom-Navigation für schmale
 * Viewports (Handy). Solide Fläche am Display-Boden, Haarlinie an der Oberkante;
 * der Inhalt scrollt dahinter. Desktop nutzt weiter die Seitenleiste (.web-side);
 * das Dock ist via CSS nur ≤860px sichtbar.
 *
 * Aufbau: 2 Tabs · zentraler ＋-Button (öffnet das Erstellen-Sheet) · 2 Tabs.
 */
export function MobileDock(): React.JSX.Element {
  const { open } = useOverlay();
  const left = NAV.slice(0, 2);
  const right = NAV.slice(2);

  return (
    <nav className="mdock" aria-label="Hauptnavigation">
      <div className="mdock-wrap">
        {left.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => 'mdock-item' + (isActive ? ' on' : '')}
          >
            <Icon name={n.icon} size={22} />
            <span className="mdock-label">{n.label}</span>
          </NavLink>
        ))}

        <div className="mdock-fab-slot">
          <button className="mdock-fab" onClick={() => open('create')} aria-label="Erstellen">
            <Icon name="plus" size={26} stroke={2.4} />
          </button>
        </div>

        {right.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => 'mdock-item' + (isActive ? ' on' : '')}
          >
            <Icon name={n.icon} size={22} />
            <span className="mdock-label">{n.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
