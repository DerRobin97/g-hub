import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { PLANER_POSTS, type PlanerPost, type PlanerStatusKey } from '../../lib/mockData';

/**
 * Session-lokaler Planer-Store (design-first, kein Backend). Hält die Posts und die
 * Status-Übergänge (Freigeben/Status setzen/Auto-Post togglen) — bleibt über das
 * Navigieren zwischen Übersicht und Unterseiten erhalten.
 */
interface PlanerApi {
  posts: PlanerPost[];
  find: (id: string) => PlanerPost | undefined;
  approve: (id: string) => void;
  setStatus: (id: string, status: PlanerStatusKey) => void;
  toggleAuto: (id: string) => void;
}

const PlanerCtx = createContext<PlanerApi | null>(null);

export function PlanerProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [posts, setPosts] = useState<PlanerPost[]>(() => PLANER_POSTS.map((p) => ({ ...p })));

  const update = useCallback((id: string, patch: (p: PlanerPost) => PlanerPost) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? patch({ ...p }) : p)));
  }, []);

  const approve = useCallback(
    (id: string) =>
      update(id, (p) => ({ ...p, status: 'geplant', autopost: true, day: p.day ?? 13, hhmm: p.hhmm || '10:00' })),
    [update],
  );
  const setStatus = useCallback((id: string, status: PlanerStatusKey) => update(id, (p) => ({ ...p, status })), [update]);
  const toggleAuto = useCallback((id: string) => update(id, (p) => ({ ...p, autopost: !p.autopost })), [update]);
  const find = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  const api = useMemo<PlanerApi>(() => ({ posts, find, approve, setStatus, toggleAuto }), [posts, find, approve, setStatus, toggleAuto]);
  return <PlanerCtx.Provider value={api}>{children}</PlanerCtx.Provider>;
}

export function usePlaner(): PlanerApi {
  const ctx = useContext(PlanerCtx);
  if (!ctx) throw new Error('usePlaner muss innerhalb von PlanerProvider verwendet werden.');
  return ctx;
}

// Wochentags-Kürzel/-Namen (Juni 2026, KW 24) — wie im Prototyp.
export const PL_TODAY = 12;
export const PL_WD: Record<number, string> = { 8: 'Mo', 9: 'Di', 10: 'Mi', 11: 'Do', 12: 'Fr', 13: 'Sa', 14: 'So' };
export const PL_WDLONG: Record<number, string> = {
  8: 'Montag', 9: 'Dienstag', 10: 'Mittwoch', 11: 'Donnerstag', 12: 'Freitag', 13: 'Samstag', 14: 'Sonntag',
};
