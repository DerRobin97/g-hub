import { useEffect } from 'react';
import { APP_VERSION } from '@g-hub/shared';

interface GerberHubLoaderEl extends HTMLElement {
  hide?: () => Promise<void>;
}

/**
 * Ladescreen (Splash) — nutzt die eigenständige Web-Komponente `<gerber-hub-loader>`
 * (in `public/gerberhub-loader.js`, 1:1 aus dem Prototyp). Wird imperativ an den Body
 * gehängt (position:fixed, z-index:9999) und beim Unmount sanft ausgeblendet.
 *
 * Wird als App-Intro NACH dem Login gezeigt; `onDone` feuert nach der vollen
 * Animation (~3,4 s), damit die App danach aufgedeckt wird.
 */
export function Splash({ onDone }: { onDone?: () => void }): null {
  useEffect(() => {
    const el = document.createElement('gerber-hub-loader') as GerberHubLoaderEl;
    el.setAttribute('version', `G-Hub v${APP_VERSION}`);
    // Tempo & Dauer 1:1 nach Design-Doku (Kap. 5): speed=0.85, App-Anzeige ~3,4 s.
    // So läuft die volle Logo-Animation (Buchstaben-Pop → „Hub" → Spinner → Settle)
    // immer komplett durch.
    el.setAttribute('speed', '0.85');
    el.setAttribute('min-visible', '3400');
    document.body.appendChild(el);
    const timer = onDone ? window.setTimeout(onDone, 3400) : undefined;
    return () => {
      if (timer) window.clearTimeout(timer);
      // Sanftes Ausblenden; entfernt sich danach selbst. Fallback: hartes Remove.
      if (typeof el.hide === 'function') void el.hide();
      else el.remove();
    };
  }, [onDone]);
  return null;
}
