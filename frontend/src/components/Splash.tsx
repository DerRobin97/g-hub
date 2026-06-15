import { useEffect } from 'react';
import { APP_VERSION } from '@g-hub/shared';

interface GerberHubLoaderEl extends HTMLElement {
  hide?: () => Promise<void>;
}

/**
 * Ladescreen (Splash) — nutzt die eigenständige Web-Komponente `<gerber-hub-loader>`
 * (in `public/gerberhub-loader.js`, 1:1 aus dem Prototyp). Wird imperativ an den Body
 * gehängt (position:fixed, z-index:9999) und beim Unmount sanft ausgeblendet.
 */
export function Splash(): null {
  useEffect(() => {
    const el = document.createElement('gerber-hub-loader') as GerberHubLoaderEl;
    el.setAttribute('version', `G-Hub v${APP_VERSION}`);
    el.setAttribute('min-visible', '700');
    document.body.appendChild(el);
    return () => {
      // Sanftes Ausblenden; entfernt sich danach selbst. Fallback: hartes Remove.
      if (typeof el.hide === 'function') void el.hide();
      else el.remove();
    };
  }, []);
  return null;
}
