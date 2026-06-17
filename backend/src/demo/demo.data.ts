/**
 * Demo-Datensätze (temporär). Werden über POST /api/demo/seed in den Workspace
 * geschrieben und über POST /api/demo/clear wieder entfernt. Inhalte passend zum
 * Profil „Gerber-Hub" (Forst-/Gartentechnik-Marketing).
 */

type TaskStatus = 'offen' | 'arbeit' | 'erledigt';
type TaskPriority = 'high' | 'med' | 'low';
type ProjectTaskPriority = 'high' | 'mid' | 'low';
type CampaignStatus = 'live' | 'review' | 'draft';
type MeasureType = 'organisch' | 'promotion' | 'paid' | 'code';
type DiscountType = 'prozent' | 'zwei_fuer_eins' | 'versand' | 'code';

export interface DemoTask {
  title: string;
  description?: string;
  projectText?: string;
  dueLabel?: string;
  time?: string;
  priority: TaskPriority;
  status: TaskStatus;
  checklist?: string[];
}

export const DEMO_TASKS: DemoTask[] = [
  { title: 'Reel-Skript „Sommer-Launch" finalisieren', projectText: 'Sommer-Launch 2026', dueLabel: 'Heute', time: '14:00', priority: 'high', status: 'arbeit', checklist: ['Hook schreiben', 'Schnittliste', 'CTA festlegen'] },
  { title: 'LinkedIn-Captions Korrektur lesen', projectText: 'Sommer-Launch 2026', dueLabel: 'Heute', time: '17:00', priority: 'med', status: 'offen' },
  { title: 'Influencer-Briefing versenden', dueLabel: 'Morgen', priority: 'high', status: 'offen' },
  { title: 'Produktfotos Akku-Geräte auswählen', projectText: 'Website-Relaunch', dueLabel: 'Diese Woche', priority: 'med', status: 'arbeit', checklist: ['Shortlist 20 Bilder', 'Retusche beauftragen'] },
  { title: 'Budget Q3 mit Geschäftsführung abstimmen', dueLabel: 'Fr', priority: 'high', status: 'offen' },
  { title: 'Newsletter Juni aufsetzen', dueLabel: 'Letzte Woche', priority: 'med', status: 'erledigt' },
  { title: 'TikTok-Trends recherchieren', dueLabel: 'Diese Woche', priority: 'low', status: 'offen' },
  { title: 'Website-Banner „Frühjahrsaktion" aktualisieren', projectText: 'Website-Relaunch', dueLabel: 'Mo', priority: 'med', status: 'offen' },
  { title: 'Kooperationsanfrage Forst-Blog beantworten', dueLabel: 'Morgen', priority: 'low', status: 'offen' },
  { title: 'Monatsreport Mai an Team senden', dueLabel: 'Erledigt', priority: 'med', status: 'erledigt' },
];

export interface DemoProjectTask {
  title: string;
  priority: ProjectTaskPriority;
  done?: boolean;
  dueLabel?: string;
}
export interface DemoPhase {
  name: string;
  tasks: DemoProjectTask[];
}
export interface DemoProject {
  name: string;
  kind?: string;
  dueLabel?: string;
  budgetText?: string;
  description?: string;
  phases: DemoPhase[];
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    name: 'Sommer-Launch 2026',
    kind: 'Kampagne',
    dueLabel: 'bis 31. Aug',
    budgetText: '8.000 €',
    description: 'Produktkampagne für die neue Akku-Geräte-Serie über alle Kanäle.',
    phases: [
      { name: 'Konzept', tasks: [
        { title: 'Zielgruppen & Botschaften definieren', priority: 'high', done: true },
        { title: 'Kanalstrategie festlegen', priority: 'mid', done: true },
        { title: 'Content-Kalender aufsetzen', priority: 'mid' },
      ] },
      { name: 'Produktion', tasks: [
        { title: 'Reels drehen (3 Stück)', priority: 'high', dueLabel: 'KW 26' },
        { title: 'Carousel-Grafiken erstellen', priority: 'mid' },
        { title: 'Texte & Captions schreiben', priority: 'low' },
      ] },
      { name: 'Veröffentlichung', tasks: [
        { title: 'Posts einplanen', priority: 'mid' },
        { title: 'Paid-Budget freigeben', priority: 'high' },
      ] },
    ],
  },
  {
    name: 'Website-Relaunch',
    kind: 'Web',
    dueLabel: 'Q3',
    budgetText: '15.000 €',
    description: 'Neue Produktseiten, schnellere Ladezeiten, Shop-Anbindung.',
    phases: [
      { name: 'Design', tasks: [
        { title: 'Wireframes Startseite', priority: 'high', done: true },
        { title: 'Designsystem festlegen', priority: 'mid' },
      ] },
      { name: 'Content', tasks: [
        { title: 'Produkttexte überarbeiten', priority: 'mid' },
        { title: 'Bildmaterial sortieren', priority: 'low' },
      ] },
      { name: 'Technik', tasks: [
        { title: 'CMS aufsetzen', priority: 'high' },
        { title: 'SEO-Migration planen', priority: 'mid' },
      ] },
    ],
  },
  {
    name: 'Messeauftritt Forst-Expo',
    kind: 'Event',
    dueLabel: 'Okt',
    budgetText: '6.500 €',
    description: 'Stand, Material und Social-Begleitung für die Forst-Expo.',
    phases: [
      { name: 'Planung', tasks: [
        { title: 'Standfläche buchen', priority: 'high', done: true },
        { title: 'Standkonzept abstimmen', priority: 'mid' },
      ] },
      { name: 'Material', tasks: [
        { title: 'Roll-ups & Flyer gestalten', priority: 'mid' },
        { title: 'Give-aways bestellen', priority: 'low' },
      ] },
    ],
  },
];

export interface DemoDiscount {
  name: string;
  type: DiscountType;
  value?: string;
  code?: string;
  zeitraum?: string;
  redeemed?: number;
  limit?: number;
}
export interface DemoMeasure {
  name: string;
  type: MeasureType;
  status: CampaignStatus;
  progress: number;
  postsCount: number;
  discounts?: DemoDiscount[];
}
export interface DemoCampaign {
  name: string;
  status: CampaignStatus;
  channels: string[];
  budget: number;
  spent: number;
  reach: number;
  kpiText?: string;
  zeitraum?: string;
  dueLabel?: string;
  color?: string;
  measures: DemoMeasure[];
}

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    name: 'Sommer-Launch',
    status: 'live',
    channels: ['instagram', 'facebook', 'linkedin'],
    budget: 8000,
    spent: 5200,
    reach: 142000,
    kpiText: '+18% über Ziel',
    zeitraum: 'Jun – Aug',
    color: 'orange',
    measures: [
      { name: 'Organische Reels', type: 'organisch', status: 'live', progress: 0.7, postsCount: 6 },
      { name: 'Paid Social', type: 'paid', status: 'live', progress: 0.45, postsCount: 4 },
      { name: 'Rabattaktion „Sommer"', type: 'code', status: 'live', progress: 0.6, postsCount: 2, discounts: [
        { name: '10% auf Akku-Geräte', type: 'prozent', value: '10', code: 'SOMMER10', zeitraum: 'Jun', redeemed: 84, limit: 500 },
      ] },
    ],
  },
  {
    name: 'Frühjahrsputz Garten',
    status: 'review',
    channels: ['instagram', 'facebook'],
    budget: 4000,
    spent: 1200,
    reach: 38000,
    kpiText: 'in Freigabe',
    zeitraum: 'Mär – Apr',
    color: 'green',
    measures: [
      { name: 'How-to-Karussells', type: 'organisch', status: 'review', progress: 0.3, postsCount: 3 },
      { name: 'Versand-Aktion', type: 'promotion', status: 'review', progress: 0.2, postsCount: 1, discounts: [
        { name: 'Gratis-Versand ab 50 €', type: 'versand', value: '0', zeitraum: 'Mär', redeemed: 0, limit: 300 },
      ] },
    ],
  },
  {
    name: 'Forsttechnik B2B',
    status: 'draft',
    channels: ['linkedin'],
    budget: 5000,
    spent: 0,
    reach: 0,
    kpiText: 'Entwurf',
    zeitraum: 'Q3',
    color: 'blue',
    measures: [
      { name: 'Fachbeiträge', type: 'organisch', status: 'draft', progress: 0, postsCount: 0 },
      { name: 'LinkedIn Ads', type: 'paid', status: 'draft', progress: 0, postsCount: 0 },
    ],
  },
  {
    name: 'Black Friday Vorbereitung',
    status: 'draft',
    channels: ['instagram', 'facebook', 'linkedin'],
    budget: 10000,
    spent: 0,
    reach: 0,
    kpiText: 'geplant',
    zeitraum: 'Nov',
    color: 'orange',
    measures: [
      { name: 'Teaser-Kampagne', type: 'organisch', status: 'draft', progress: 0, postsCount: 0 },
      { name: 'Code-Aktion', type: 'code', status: 'draft', progress: 0, postsCount: 0, discounts: [
        { name: '2 für 1 Zubehör', type: 'zwei_fuer_eins', code: 'BF2026', zeitraum: 'Nov', redeemed: 0, limit: 1000 },
      ] },
    ],
  },
];
