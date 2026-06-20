import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  applyTo,
  normalizeThemeLegacy,
  normalizeVariantLegacy,
  type Theme,
  type Variant,
} from '../lib/appearance';
import { updateAppearance, type AppearancePref, type AppearanceUpdate } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export type WebLayout = 'full' | 'rail' | 'dual';

// Rückwärtskompatibilität
export type { Theme, Variant };
export type AccentSelection = 'gruen' | 'orange' | 'custom';
export type Corners = Variant;

interface AppearanceState {
  theme: Theme;
  variant: Variant;
  accentSel: AccentSelection;
  customAccent: string;
  webLayout: WebLayout;
  corners: Variant;
}

interface AppearanceValue extends AppearanceState {
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setAccent: (sel: AccentSelection, customHex?: string) => void;
  setWebLayout: (l: WebLayout) => void;
  setVariant: (v: Variant) => void;
  setCorners: (c: Variant) => void;
}

const DEFAULTS: AppearanceState = {
  theme: 'dark',
  variant: 'clean',
  accentSel: 'gruen',
  customAccent: '#46E08A',
  webLayout: 'full',
  corners: 'clean',
};

const STORAGE_KEY = 'ghub-appearance';
const AppearanceContext = createContext<AppearanceValue | null>(null);

function normalizeLayout(v: string | undefined): WebLayout {
  return v === 'full' || v === 'rail' || v === 'dual' ? v : DEFAULTS.webLayout;
}

function normalizeAccent(v: string | undefined): AccentSelection {
  return v === 'gruen' || v === 'orange' || v === 'custom' ? v : DEFAULTS.accentSel;
}

function fromPref(pref: AppearancePref): AppearanceState {
  const theme = normalizeThemeLegacy(pref.theme);
  const variant = normalizeVariantLegacy(
    (pref as unknown as { variant?: string }).variant || pref.corners
  );
  return {
    theme,
    variant,
    accentSel: normalizeAccent(pref.accent),
    customAccent: pref.customAccent || DEFAULTS.customAccent,
    webLayout: normalizeLayout(pref.webLayout),
    corners: variant,
  };
}

function readStorage(): AppearanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<AppearanceState & { corners?: string }>;
    const theme = normalizeThemeLegacy(p.theme as string | undefined);
    const variant = normalizeVariantLegacy(
      (p.variant as string | undefined) ?? (p.corners as string | undefined)
    );
    return {
      theme,
      variant,
      accentSel: normalizeAccent(p.accentSel),
      customAccent: p.customAccent || DEFAULTS.customAccent,
      webLayout: normalizeLayout(p.webLayout),
      corners: variant,
    };
  } catch {
    return DEFAULTS;
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { user } = useAuth();
  const [state, setState] = useState<AppearanceState>(readStorage);
  const syncedUserRef = useRef<string | null>(null);

  // CSS-Variablen + data-Attribute auf <html> anwenden
  useEffect(() => {
    applyTo(document.documentElement, state.theme, state.accentSel, state.customAccent, state.variant);
  }, [state.theme, state.accentSel, state.customAccent, state.variant]);

  // Beim Login: Server-Werte übernehmen
  useEffect(() => {
    if (!user) { syncedUserRef.current = null; return; }
    if (syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;
    if (user.appearance) {
      const next = fromPref(user.appearance);
      setState(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    }
  }, [user]);

  const apply = (patch: Partial<AppearanceState>, remote: AppearanceUpdate): void => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (user) void updateAppearance(remote).catch(() => undefined);
  };

  const THEME_CYCLE: Theme[] = ['dark', 'neon', 'hell', 'glass', 'mesh'];

  const value: AppearanceValue = {
    ...state,
    setTheme: (t) => apply({ theme: t }, { theme: t }),
    toggleTheme: () => {
      const idx = THEME_CYCLE.indexOf(state.theme);
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
      apply({ theme: next }, { theme: next });
    },
    setAccent: (sel, customHex) => {
      if (sel === 'custom' && customHex) {
        apply({ accentSel: sel, customAccent: customHex }, { accent: sel, customAccent: customHex });
      } else {
        apply({ accentSel: sel }, { accent: sel });
      }
    },
    setWebLayout: (l) => apply({ webLayout: l }, { webLayout: l }),
    setVariant: (v) => apply({ variant: v, corners: v }, { corners: v }),
    setCorners: (v) => apply({ variant: v, corners: v }, { corners: v }),
  };

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance muss innerhalb von <AppearanceProvider> verwendet werden.');
  return ctx;
}
