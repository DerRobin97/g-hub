import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { NAV } from './nav';
import { useOverlay } from './OverlayContext';

/** Mobile-Label: „Startseite" wird in der Leiste zu „Start" (Spec 01·C). */
const mobileLabel = (to: string, label: string): string => (to === '/' ? 'Start' : label);

/**
 * Mobile Bottom-Nav „01·C" (Morph zur Pille). Eigenständige Komponente mit
 * eigenen `mnav-*`-Klassen, am Viewport `fixed` (unabhängig vom .web-shell-Grid).
 *
 * Statische Glas-Leiste mit 5 Spalten: zwei Tabs, erhöhter ＋-FAB, zwei Tabs.
 * Tipp auf ＋ morpht den Button in die Doppel-Kapsel „＋ Erstellen ｜ ✦ KI".
 * Kein separater KI-FAB, kein Einklappen beim Scrollen.
 */
export function MobileNav(): React.JSX.Element {
  const { open } = useOverlay();
  const [dial, setDial] = useState(false);
  const closeDial = (): void => setDial(false);

  return (
    <>
      <div className="mnav-shell">
        <nav className="mnav-bar" aria-label="Hauptnavigation">
          <div className="mnav-wrap">
            {NAV.slice(0, 2).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={closeDial}
                className={({ isActive }) => 'mnav-item' + (isActive ? ' on' : '')}
              >
                <Icon name={n.icon} size={22} />
                <span className="mnav-label">{mobileLabel(n.to, n.label)}</span>
              </NavLink>
            ))}

            {/* 01·C — FAB morpht zur Doppel-Kapsel */}
            <div className="mnav-fab-slot">
              <button
                className={'mnav-fab' + (dial ? ' dial-open' : '')}
                onClick={() => setDial((d) => !d)}
                aria-label="Erstellen"
                aria-expanded={dial}
              >
                <Icon name="plus" size={26} stroke={2.4} />
              </button>
              <div className={'mnav-morph' + (dial ? ' show' : '')}>
                <div className="mnav-capsule">
                  <button
                    onClick={() => {
                      setDial(false);
                      open('create');
                    }}
                  >
                    <Icon name="plus" size={18} stroke={2.4} />
                    Erstellen
                  </button>
                  <button
                    onClick={() => {
                      setDial(false);
                      open('ai');
                    }}
                  >
                    <Icon name="sparkle" size={17} stroke={1.9} />
                    KI
                  </button>
                </div>
              </div>
            </div>

            {NAV.slice(2).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={closeDial}
                className={({ isActive }) => 'mnav-item' + (isActive ? ' on' : '')}
              >
                <Icon name={n.icon} size={22} />
                <span className="mnav-label">{mobileLabel(n.to, n.label)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Scrim fängt Taps außerhalb der Kapsel ab */}
      {dial && <div className="mnav-scrim" onClick={closeDial} />}
    </>
  );
}
