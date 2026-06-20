/**
 * G-Hub — zentrale Darstellungs-Logik (growsy Design-System).
 * 5 Themes (dark / neon / hell / glass / mesh) + 3 Varianten (clean / pro / botanisch).
 * CSS-Tokens werden per data-theme + data-variant Attribut auf <html> gesetzt.
 */

export type Theme = 'dark' | 'neon' | 'hell' | 'glass' | 'mesh';
export type Variant = 'clean' | 'pro' | 'botanisch';

// Rückwärtskompatibilität: alte Theme-Namen auf neue mappen
export function normalizeThemeLegacy(v: string | undefined): Theme {
  if (v === 'light') return 'hell';
  if (v === 'gray') return 'dark';
  if (v === 'dark' || v === 'neon' || v === 'hell' || v === 'glass' || v === 'mesh') return v as Theme;
  return 'dark';
}

export function normalizeVariantLegacy(v: string | undefined): Variant {
  if (v === 'clean' || v === 'pro' || v === 'botanisch') return v as Variant;
  // alte corner-Werte mappen
  if (v === 'soft') return 'botanisch';
  if (v === 'sharp') return 'pro';
  return 'clean';
}

// Rückwärtskompatibilität für alten AccentSelection-Import
export type AccentSelection = 'gruen' | 'orange' | 'custom';
export type Corners = Variant;

// Wird noch von AppearanceContext gebraucht: früher cornerVars(), jetzt Stub
export function cornerVars(_v: Variant): { lg: string; md: string; sm: string } {
  return { lg: '26px', md: '20px', sm: '14px' };
}

// Basis-Farb-Tokens je Theme — inline auf document.documentElement gesetzt
// (als Fallback für Stellen, die direkt CSS-Vars lesen ohne data-theme Support)
type ThemeVarMap = Record<string, string>;

export const THEME_VARS: Record<Theme, ThemeVarMap> = {
  dark: {
    '--bg':        '#0A0D0C',
    '--bg-2':      '#111614',
    '--surface':   '#161C19',
    '--surface-2': '#1E2620',
    '--surface-3': '#252E29',
    '--pop':       '#1A211D',
    '--hair':      'rgba(255,255,255,0.07)',
    '--hair-2':    'rgba(255,255,255,0.13)',
    '--line':      'rgba(255,255,255,0.07)',
    '--line-strong':'rgba(255,255,255,0.13)',
    '--text':      '#F0F5F2',
    '--text-2':    '#8FA89A',
    '--text-3':    '#546358',
    '--accent':    '#46E08A',
    '--accent-2':  '#2CB86A',
    '--accent-ink':'#061A0F',
    '--accent-fg': '#46E08A',
    '--accent-soft':'color-mix(in oklab, #46E08A 16%, transparent)',
    '--accent-line':'color-mix(in oklab, #46E08A 38%, transparent)',
    '--accent-glow':'color-mix(in oklab, #46E08A 40%, transparent)',
    '--topbar-bg': 'rgba(26,32,29,0.40)',
    '--ok':        '#5fd3a3',
    '--warn':      '#ffce6b',
    '--bad':       '#ff7a6b',
    '--shadow':    '0 18px 40px -18px rgba(0,0,0,0.7)',
    '--shadow-card':'0 2px 12px rgba(0,0,0,0.35)',
  },
  neon: {
    '--bg':        '#060D09',
    '--bg-2':      '#0B1510',
    '--surface':   '#101A13',
    '--surface-2': '#182119',
    '--surface-3': '#1F2B21',
    '--pop':       '#0E1812',
    '--hair':      'rgba(255,255,255,0.07)',
    '--hair-2':    'rgba(255,255,255,0.13)',
    '--line':      'rgba(255,255,255,0.07)',
    '--line-strong':'rgba(255,255,255,0.13)',
    '--text':      '#E8FFE8',
    '--text-2':    '#7DBC8A',
    '--text-3':    '#4A7A52',
    '--accent':    '#7DFF4E',
    '--accent-2':  '#5ECC2A',
    '--accent-ink':'#04120A',
    '--accent-fg': '#7DFF4E',
    '--accent-soft':'color-mix(in oklab, #7DFF4E 16%, transparent)',
    '--accent-line':'color-mix(in oklab, #7DFF4E 38%, transparent)',
    '--accent-glow':'color-mix(in oklab, #7DFF4E 50%, transparent)',
    '--topbar-bg': 'rgba(10,20,13,0.45)',
    '--ok':        '#7DFF4E',
    '--warn':      '#ffce6b',
    '--bad':       '#ff7a6b',
    '--shadow':    '0 18px 40px -18px rgba(0,0,0,0.8)',
    '--shadow-card':'0 2px 16px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(125,255,78,0.12)',
  },
  hell: {
    '--bg':        '#EEF3EC',
    '--bg-2':      '#FFFFFF',
    '--surface':   '#FFFFFF',
    '--surface-2': '#E8EDE6',
    '--surface-3': '#D8E0D5',
    '--pop':       '#FFFFFF',
    '--hair':      'rgba(0,0,0,0.08)',
    '--hair-2':    'rgba(0,0,0,0.14)',
    '--line':      'rgba(0,0,0,0.08)',
    '--line-strong':'rgba(0,0,0,0.14)',
    '--text':      '#1A2A20',
    '--text-2':    '#4A6454',
    '--text-3':    '#7A9882',
    '--accent':    '#1F9D5C',
    '--accent-2':  '#167A47',
    '--accent-ink':'#FFFFFF',
    '--accent-fg': '#167A47',
    '--accent-soft':'color-mix(in oklab, #1F9D5C 14%, transparent)',
    '--accent-line':'color-mix(in oklab, #1F9D5C 30%, transparent)',
    '--accent-glow':'color-mix(in oklab, #1F9D5C 35%, transparent)',
    '--topbar-bg': 'rgba(238,243,236,0.85)',
    '--ok':        '#1F9D5C',
    '--warn':      '#B87A00',
    '--bad':       '#C0392B',
    '--shadow':    '0 18px 40px -18px rgba(0,0,0,0.16)',
    '--shadow-card':'0 2px 8px rgba(0,0,0,0.10)',
  },
  glass: {
    '--bg':        'linear-gradient(135deg, #0D1B2A 0%, #0A2014 50%, #0B1A28 100%)',
    '--bg-2':      'rgba(20,35,45,0.6)',
    '--surface':   'rgba(255,255,255,0.08)',
    '--surface-2': 'rgba(255,255,255,0.05)',
    '--surface-3': 'rgba(255,255,255,0.10)',
    '--pop':       'rgba(20,30,40,0.92)',
    '--hair':      'rgba(255,255,255,0.10)',
    '--hair-2':    'rgba(255,255,255,0.18)',
    '--line':      'rgba(255,255,255,0.10)',
    '--line-strong':'rgba(255,255,255,0.18)',
    '--text':      '#E8F5EE',
    '--text-2':    '#90B8A8',
    '--text-3':    '#5A8070',
    '--accent':    '#9DFF8A',
    '--accent-2':  '#6FD65E',
    '--accent-ink':'#062010',
    '--accent-fg': '#9DFF8A',
    '--accent-soft':'color-mix(in oklab, #9DFF8A 14%, transparent)',
    '--accent-line':'color-mix(in oklab, #9DFF8A 30%, transparent)',
    '--accent-glow':'color-mix(in oklab, #9DFF8A 40%, transparent)',
    '--topbar-bg': 'rgba(15,28,38,0.35)',
    '--ok':        '#9DFF8A',
    '--warn':      '#ffce6b',
    '--bad':       '#ff7a6b',
    '--shadow':    '0 18px 40px -18px rgba(0,0,0,0.6)',
    '--shadow-card':'0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
  },
  mesh: {
    '--bg':        '#0B0F12',
    '--bg-2':      '#141820',
    '--surface':   '#1A2030',
    '--surface-2': '#222840',
    '--surface-3': '#2A3250',
    '--pop':       '#181E2C',
    '--hair':      'rgba(255,255,255,0.07)',
    '--hair-2':    'rgba(255,255,255,0.13)',
    '--line':      'rgba(255,255,255,0.07)',
    '--line-strong':'rgba(255,255,255,0.13)',
    '--text':      '#E8EEFF',
    '--text-2':    '#8090B8',
    '--text-3':    '#505878',
    '--accent':    '#8DFF5A',
    '--accent-2':  '#64D636',
    '--accent-ink':'#061800',
    '--accent-fg': '#8DFF5A',
    '--accent-soft':'color-mix(in oklab, #8DFF5A 16%, transparent)',
    '--accent-line':'color-mix(in oklab, #8DFF5A 38%, transparent)',
    '--accent-glow':'color-mix(in oklab, #8DFF5A 42%, transparent)',
    '--topbar-bg': 'rgba(11,15,18,0.50)',
    '--ok':        '#8DFF5A',
    '--warn':      '#ffce6b',
    '--bad':       '#ff7a6b',
    '--shadow':    '0 18px 40px -18px rgba(0,0,0,0.75)',
    '--shadow-card':'0 2px 16px rgba(0,0,0,0.5)',
  },
};

// Radius + Abstands-Tokens je Variante
export const VARIANT_VARS: Record<Variant, Record<string, string>> = {
  clean: {
    '--r-card':   '20px',
    '--r-ctl':    '13px',
    '--r-tile':   '12px',
    '--r-pill':   '999px',
    '--r-sheet':  '30px',
    '--r-lg':     '20px',
    '--r-md':     '20px',
    '--r-sm':     '13px',
    '--r-xs':     '12px',
    '--pad-screen':'18px',
    '--gap':       '14px',
    '--card-pad':  '16px',
    '--base-size': '16px',
  },
  pro: {
    '--r-card':   '12px',
    '--r-ctl':    '9px',
    '--r-tile':   '9px',
    '--r-pill':   '999px',
    '--r-sheet':  '20px',
    '--r-lg':     '12px',
    '--r-md':     '12px',
    '--r-sm':     '9px',
    '--r-xs':     '9px',
    '--pad-screen':'14px',
    '--gap':       '10px',
    '--card-pad':  '13px',
    '--base-size': '15px',
  },
  botanisch: {
    '--r-card':   '26px',
    '--r-ctl':    '16px',
    '--r-tile':   '15px',
    '--r-pill':   '999px',
    '--r-sheet':  '34px',
    '--r-lg':     '26px',
    '--r-md':     '26px',
    '--r-sm':     '16px',
    '--r-xs':     '15px',
    '--pad-screen':'20px',
    '--gap':       '16px',
    '--card-pad':  '18px',
    '--base-size': '16px',
  },
};

export function isLight(theme: Theme): boolean {
  return theme === 'hell';
}

export function themeVars(theme: Theme): ThemeVarMap {
  return THEME_VARS[theme] || THEME_VARS.dark;
}

// Setzt Theme + Variante als data-Attribute + CSS-Variablen auf den Host.
export function applyTo(
  host: HTMLElement | null,
  theme: Theme,
  _accentSel?: string,
  _customHex?: string,
  variant: Variant = 'clean',
): void {
  if (!host) return;

  // data-Attribute setzen (CSS nutzt diese für Selektoren)
  host.setAttribute('data-theme', theme);
  host.setAttribute('data-variant', variant);

  // CSS-Variablen inline setzen (Fallback für alten Code)
  const vars = themeVars(theme);
  for (const [k, v] of Object.entries(vars)) {
    if (k !== '--bg' || !v.startsWith('linear')) {
      host.style.setProperty(k, v);
    }
  }
  const vvars = VARIANT_VARS[variant] || VARIANT_VARS.clean;
  for (const [k, v] of Object.entries(vvars)) {
    host.style.setProperty(k, v);
  }
}

// Splashscreen-Hintergrund je Theme
export function splashBg(theme: Theme): string {
  if (theme === 'hell') return '#EEF3EC';
  if (theme === 'neon') return '#060D09';
  if (theme === 'glass') return '#0D1B2A';
  if (theme === 'mesh') return '#0B0F12';
  return '#0A0D0C';
}

// Accent-Tokens (Rückwärtskompatibilität mit altem Code der accentTokens() aufruft)
export function accentTokens(_sel: string, _customHex?: string): [string, string, string] {
  return ['#46E08A', '#061A0F', '#46E08A'];
}

export function lum(hex: string): number {
  const c = (hex || '').replace('#', '');
  if (c.length < 6) return 0.5;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const f = (x: number): number => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
