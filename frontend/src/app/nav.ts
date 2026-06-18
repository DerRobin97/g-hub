/**
 * Geteilte Navigations- und Kopfzeilen-Definitionen (migriert aus `app/main.jsx`
 * und `app/main-web.jsx`). Hält Sidebar und Topbar konsistent.
 */
import type { IconName } from '../components/Icon';

export interface NavItem {
  to: string;
  icon: IconName;
  label: string;
}

// Hauptnavigation — identisch zu iPhone/iPad/Desktop des Prototyps.
export const NAV: NavItem[] = [
  { to: '/', icon: 'home', label: 'Startseite' },
  { to: '/projekte', icon: 'layers', label: 'Projekte' },
  { to: '/analytics', icon: 'chart', label: 'Analytics' },
  { to: '/profil', icon: 'user', label: 'Profil' },
];

// Kontext-Spalte (Doppel-Layout) — zweite Navigationsebene von „Projekte".
export interface SubNavItem {
  key: string;
  icon: IconName;
  name: string;
  sub: string;
}

export const PROJ_SUB: SubNavItem[] = [
  { key: 'jahresplan', icon: 'calendar', name: 'Jahresplan', sub: 'Themen je Monat planen' },
  { key: 'planer', icon: 'message', name: 'Social-Media-Planer', sub: 'Planen · Freigeben · Auto-Post' },
  { key: 'kampagnen', icon: 'campaign', name: 'Kampagnenmanager', sub: 'Kampagnen · Maßnahmen' },
  { key: 'projektmanager', icon: 'layers', name: 'Projektmanager', sub: 'Projekte · Aufgaben' },
];

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export interface Head {
  kicker: string;
  title: string;
}

/** Kicker + Titel für die Topbar anhand des aktuellen Pfads. */
export function headFor(pathname: string, firstName?: string): Head {
  if (pathname === '/' || pathname === '')
    return { kicker: 'Gerber-Hub', title: `${greeting()}${firstName ? ', ' + firstName : ''}` };
  if (pathname.startsWith('/projekte')) {
    if (pathname.startsWith('/projekte/projektmanager'))
      return { kicker: 'Projekte', title: 'Projektmanager' };
    if (pathname.startsWith('/projekte/kampagnen'))
      return { kicker: 'Projekte', title: 'Kampagnenmanager' };
    if (pathname.startsWith('/projekte/jahresplan'))
      return { kicker: 'Projekte', title: 'Jahresplan' };
    if (pathname.startsWith('/projekte/planer')) {
      if (pathname.startsWith('/projekte/planer/freigabe')) return { kicker: 'Planer', title: 'Freigabe' };
      if (pathname.startsWith('/projekte/planer/post')) return { kicker: 'Planer', title: 'Post' };
      if (pathname.startsWith('/projekte/planer/tag')) return { kicker: 'Planer', title: 'Tagesplan' };
      return { kicker: 'Projekte', title: 'Social-Media-Planer' };
    }
    const sub = PROJ_SUB.find((s) => pathname === `/projekte/${s.key}`);
    if (sub) return { kicker: 'Projekte', title: sub.name };
    return { kicker: 'Übersicht', title: 'Projekte' };
  }
  if (pathname.startsWith('/analytics')) return { kicker: 'Auswertung', title: 'Analytics' };
  if (pathname === '/profil/aufgaben') return { kicker: 'Profil', title: 'Meine Aufgaben' };
  if (pathname.startsWith('/profil')) return { kicker: 'Konto', title: 'Profil' };
  return { kicker: 'Gerber-Hub', title: 'G-Hub' };
}
