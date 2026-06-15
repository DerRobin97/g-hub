/* G-Hub — zentrale Darstellungs-Logik (geteilt von iPhone-App, iPad-KI-Dock & HTML).
   Drei Hintergründe (Weiß / Grau / Schwarz) + Akzent-Tokens inkl. frei wählbarer Farbe. */
(function(){
  // Vollständige Variablen-Sätze je Theme — werden inline auf .app bzw. .ipad-screen gesetzt.
  const THEME_VARS = {
    // Weiß — heller Modus, dunkle Schrift
    light: {
      '--bg':'oklch(0.965 0.004 264)', '--bg-2':'#ffffff', '--surface':'#ffffff',
      '--surface-2':'oklch(0.955 0.004 264)', '--surface-3':'oklch(0.915 0.005 264)',
      '--line':'rgba(0,0,0,0.13)', '--line-strong':'rgba(0,0,0,0.22)',
      '--text':'oklch(0.23 0.012 264)', '--text-2':'oklch(0.40 0.012 264)', '--text-3':'oklch(0.50 0.012 264)',
      '--shadow':'0 18px 40px -18px rgba(0,0,0,0.16)',
      /* Semantik im hellen Modus abdunkeln, damit Text/Icons auf Weiß lesbar bleiben */
      '--ok':'oklch(0.55 0.13 162)', '--warn':'oklch(0.60 0.13 72)', '--bad':'oklch(0.55 0.19 25)',
    },
    // Grau — Graphit, helle Schrift, klar heller als Schwarz
    gray: {
      '--bg':'oklch(0.335 0.006 264)', '--bg-2':'oklch(0.365 0.006 264)', '--surface':'oklch(0.39 0.007 264)',
      '--surface-2':'oklch(0.435 0.008 264)', '--surface-3':'oklch(0.49 0.009 264)',
      '--line':'oklch(1 0 0 / 0.10)', '--line-strong':'oklch(1 0 0 / 0.18)',
      '--text':'oklch(0.985 0.003 264)', '--text-2':'oklch(0.83 0.008 264)', '--text-3':'oklch(0.67 0.010 264)',
      '--shadow':'0 18px 40px -18px rgba(0,0,0,0.45)',
    },
    // Schwarz — tiefes Near-Black, helle Schrift
    dark: {
      '--bg':'oklch(0.145 0.004 264)', '--bg-2':'oklch(0.175 0.005 264)', '--surface':'oklch(0.20 0.005 264)',
      '--surface-2':'oklch(0.24 0.006 264)', '--surface-3':'oklch(0.296 0.007 264)',
      '--line':'oklch(1 0 0 / 0.08)', '--line-strong':'oklch(1 0 0 / 0.14)',
      '--text':'oklch(0.975 0.004 264)', '--text-2':'oklch(0.74 0.009 264)', '--text-3':'oklch(0.56 0.011 264)',
      '--shadow':'0 18px 40px -18px rgba(0,0,0,0.7)',
    },
  };

  // Benannte Akzente: [Hauptfarbe, Tinte-auf-Akzent, Akzent-als-Text-im-hellen-Modus]
  const ACCENTS = {
    gruen:  ['#cdf24d','#161a07','oklch(0.47 0.14 140)'],
    orange: ['#ee7203','#2a1402','oklch(0.54 0.17 47)'],
  };

  function lum(hex){
    const c = (hex||'').replace('#','');
    if(c.length<6) return 0.5;
    const r=parseInt(c.slice(0,2),16)/255, g=parseInt(c.slice(2,4),16)/255, b=parseInt(c.slice(4,6),16)/255;
    const f=x=> x<=0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4);
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
  }

  // Liefert [main, ink, fgLight] für die aktuelle Akzent-Auswahl.
  function accentTokens(sel, customHex){
    if(sel==='custom'){
      const hex = customHex || '#5cc8ff';
      const L = lum(hex);
      const ink = L > 0.45 ? '#161a07' : '#ffffff';
      // Im hellen Modus sehr helle Akzente abdunkeln, damit sie als Text lesbar bleiben.
      const fgLight = L > 0.45 ? `color-mix(in oklab, ${hex} 52%, #101012)` : hex;
      return [hex, ink, fgLight];
    }
    return ACCENTS[sel] || ACCENTS.gruen;
  }

  function themeVars(theme){ return THEME_VARS[theme] || THEME_VARS.dark; }
  function isLight(theme){ return theme==='light'; }

  // Setzt alle Theme- + Akzent-Variablen auf ein Host-Element (für Bereiche außerhalb von React).
  function applyTo(host, theme, accentSel, customHex){
    if(!host) return;
    const vars = themeVars(theme);
    Object.entries(vars).forEach(([k,v])=> host.style.setProperty(k,v));
    const acc = accentTokens(accentSel, customHex);
    host.style.setProperty('--accent', acc[0]);
    host.style.setProperty('--accent-ink', acc[1]);
    host.style.setProperty('--accent-fg', isLight(theme) ? (acc[2]||acc[0]) : acc[0]);
  }

  function splashBg(theme){
    if(theme==='light') return 'oklch(0.965 0.004 264)';
    if(theme==='gray')  return 'oklch(0.335 0.006 264)';
    return 'oklch(0.145 0.004 264)';
  }

  window.GHUB_APPEARANCE = { THEME_VARS, ACCENTS, lum, accentTokens, themeVars, isLight, applyTo, splashBg };
})();
