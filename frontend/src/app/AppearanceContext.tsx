import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  applyTo,
  cornerVars,
  type AccentSelection,
  type Corners,
  type Theme,
} from '../lib/appearance';
import { updateAppearance, type AppearancePref, type AppearanceUpdate } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export type WebLayout = 'full' | 'rail' | 'dual';

interface AppearanceState {
  theme: Theme;
  accentSel: AccentSelection;
  customAccent: string;
  webLayout: WebLayout;
  corners: Corners;
}

interface AppearanceValue extends AppearanceState {
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setAccent: (sel: AccentSelection, customHex?: string) => void;
  setWebLayout: (l: WebLayout) => void;
  setCorners: (c: Corners) => void;
}

const DEFAULTS: AppearanceState = {
  theme: 'dark',
  accentSel: 'gruen',
  customAccent: '#5cc8ff',
  webLayout: 'full',
  corners: 'standard',
};

const STORAGE_KEY = 'ghub-appearance';
const AppearanceContext = createContext<AppearanceValue | null>(null);

function normalizeTheme(v: string | undefined): Theme {
  return v === 'light' || v === 'gray' || v === 'dark' ? v : DEFAULTS.theme;
}
function normalizeAccent(v: string | undefined): AccentSelection {
  return v === 'gruen' || v === 'orange' || v === 'custom' ? v : DEFAULTS.accentSel;
}
function normalizeLayout(v: string | undefined): WebLayout {
  return v === 'full' || v === 'rail' || v === 'dual' ? v : DEFAULTS.webLayout;
}
function normalizeCorners(v: string | undefined): Corners {
  return v === 'soft' || v === 'standard' || v === 'sharp' ? v : DEFAULTS.corners;
}

function fromPref(pref: AppearancePref): AppearanceState {
  return {
    theme: normalizeTheme(pref.theme),
    accentSel: normalizeAccent(pref.accent),
    customAccent: pref.customAccent || DEFAULTS.customAccent,
    webLayout: normalizeLayout(pref.webLayout),
    corners: normalizeCorners(pref.corners),
  };
}

function readStorage(): AppearanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      theme: normalizeTheme(p.theme),
      accentSel: normalizeAccent(p.accentSel),
      customAccent: p.customAccent || DEFAULTS.customAccent,
      webLayout: normalizeLayout(p.webLayout),
      corners: normalizeCorners(p.corners),
    };
  } catch {
    return DEFAULTS;
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { user } = useAuth();
  const [state, setState] = useState<AppearanceState>(readStorage);
  // Verhindert, dass die Server-Synchronisierung pro Login mehrfach greift.
  const syncedUserRef = useRef<string | null>(null);

  // CSS-Variablen global anwenden (Login-Screen + Shell teilen sich :root).
  useEffect(() => {
    const root = document.documentElement;
    applyTo(root, state.theme, state.accentSel, state.customAccent);
    const c = cornerVars(state.corners);
    root.style.setProperty('--r-lg', c.lg);
    root.style.setProperty('--r-md', c.md);
    root.style.setProperty('--r-sm', c.sm);
  }, [state.theme, state.accentSel, state.customAccent, state.corners]);

  // Beim Login die Server-Werte übernehmen (Quelle der Wahrheit), sonst lokal bleiben.
  useEffect(() => {
    if (!user) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;
    if (user.appearance) {
      const next = fromPref(user.appearance);
      setState(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage nicht verfügbar — egal
      }
    }
  }, [user]);

  const apply = (patch: Partial<AppearanceState>, remote: AppearanceUpdate): void => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignorieren
      }
      return next;
    });
    // Nur persistieren, wenn eingeloggt; Fehler still schlucken (Best-Effort).
    if (user) void updateAppearance(remote).catch(() => undefined);
  };

  const value: AppearanceValue = {
    ...state,
    setTheme: (t) => apply({ theme: t }, { theme: t }),
    toggleTheme: () => {
      const t: Theme = state.theme === 'light' ? 'dark' : 'light';
      apply({ theme: t }, { theme: t });
    },
    setAccent: (sel, customHex) => {
      if (sel === 'custom' && customHex) {
        apply({ accentSel: sel, customAccent: customHex }, { accent: sel, customAccent: customHex });
      } else {
        apply({ accentSel: sel }, { accent: sel });
      }
    },
    setWebLayout: (l) => apply({ webLayout: l }, { webLayout: l }),
    setCorners: (c) => apply({ corners: c }, { corners: c }),
  };

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance muss innerhalb von <AppearanceProvider> verwendet werden.');
  return ctx;
}
