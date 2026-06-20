import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV } from './nav';
import { useOverlay } from './OverlayContext';

/**
 * growsy Floating Capsule Tab Bar (v1m) — frei schwebende Glasmorphismus-Kapsel
 * für schmale Viewports (Handy ≤860px). Desktop nutzt die Seitenleiste (.web-side).
 * Aufbau: 2 Tabs · zentraler FAB · 2 Tabs.
 */
export function MobileDock(): React.JSX.Element {
  const { open } = useOverlay();
  const left = NAV.slice(0, 2);
  const right = NAV.slice(2);

  return (
    <nav className="glb" aria-label="Hauptnavigation">
      <div className="glb-wrap">
        {left.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => 'glb-item' + (isActive ? ' on' : '')}
          >
            <Icon name={n.icon} size={25} />
            <span className="glb-label">{n.label}</span>
          </NavLink>
        ))}

        <button className="glb-fab" onClick={() => open('create')} aria-label="Erstellen">
          <Icon name="plus" size={26} stroke={2.4} />
        </button>

        {right.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => 'glb-item' + (isActive ? ' on' : '')}
          >
            <Icon name={n.icon} size={25} />
            <span className="glb-label">{n.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
