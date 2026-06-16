import { useEffect, useState } from 'react';

/**
 * TEMPORÄRE Diagnose: zeigt Standalone-Modus + Safe-Area-/Viewport-Werte,
 * um das „Nav sitzt zu hoch / Streifen unten"-Problem auf dem echten Gerät
 * eindeutig zu messen. Wird nach der Analyse wieder entfernt.
 */
function readInset(side: 'top' | 'bottom'): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position:fixed;left:0;${side}:0;width:1px;height:env(safe-area-inset-${side});`;
  document.body.appendChild(probe);
  const h = Math.round(probe.getBoundingClientRect().height);
  probe.remove();
  return h;
}

export function SafeAreaDebug(): React.JSX.Element {
  const [info, setInfo] = useState('…');
  useEffect(() => {
    const dmStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const vv = window.visualViewport;
    const lines = [
      `standalone(dm): ${dmStandalone ? 'JA' : 'nein'}`,
      `standalone(ios): ${iosStandalone ? 'JA' : 'nein'}`,
      `safe top/bot: ${readInset('top')} / ${readInset('bottom')}px`,
      `innerH: ${window.innerHeight}`,
      `screenH: ${window.screen.height}`,
      `visualVP H: ${vv ? Math.round(vv.height) : '-'}`,
    ];
    setInfo(lines.join('\n'));
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 4px)',
        left: 4,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.82)',
        color: '#0f0',
        font: '11px/1.35 monospace',
        whiteSpace: 'pre',
        padding: '6px 8px',
        borderRadius: 8,
        pointerEvents: 'none',
        maxWidth: '70vw',
      }}
    >
      {info}
    </div>
  );
}
