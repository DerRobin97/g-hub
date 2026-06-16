import type { NewsCategory } from '@g-hub/shared';

/**
 * Startbestand für die Branchen-News (1:1 aus dem bisherigen Frontend-Mock).
 * Wird beim ersten Abruf je Workspace idempotent angelegt (siehe NewsService).
 * `agedMinutes` = Alter zum Seed-Zeitpunkt → daraus bildet das Frontend das
 * relative Label („vor 2 Std", „Gestern", …). `read:false` = ungelesen (Badge).
 */
export interface NewsSeed {
  category: NewsCategory;
  title: string;
  teaser: string | null;
  source: string;
  tag: string | null;
  highlight: boolean;
  read: boolean;
  agedMinutes: number;
}

export const NEWS_SEED: NewsSeed[] = [
  {
    category: 'Trend',
    title: 'Kurzvideos dominieren 2026: Reels & Shorts treiben 68 % der organischen Reichweite',
    teaser:
      'Das Wachstum verschiebt sich plattformübergreifend klar zu kurzen, vertikalen Videos. Marken mit ≥3 Reels pro Woche wachsen 2,4× schneller.',
    source: 'Social Media Today',
    tag: 'trend-report-2026',
    highlight: true,
    read: false,
    agedMinutes: 120,
  },
  {
    category: 'Plattform',
    title: 'Instagram rollt „Trial Reels" für alle Business-Accounts aus',
    teaser: null,
    source: 'Meta Newsroom',
    tag: null,
    highlight: false,
    read: false,
    agedMinutes: 240,
  },
  {
    category: 'Plattform',
    title: 'LinkedIn priorisiert künftig Karussell-Posts im Feed',
    teaser: null,
    source: 'LinkedIn Blog',
    tag: null,
    highlight: false,
    read: false,
    agedMinutes: 360,
  },
  {
    category: 'Trend',
    title: 'UGC schlägt Hochglanz: authentische Inhalte mit +34 % Engagement',
    teaser: null,
    source: 'HubSpot',
    tag: null,
    highlight: false,
    read: false,
    agedMinutes: 540,
  },
  {
    category: 'Mention',
    title: '„Sommer-Launch 2026" in 12 Branchen-Newslettern erwähnt',
    teaser: null,
    source: 'Mention-Tracking',
    tag: null,
    highlight: false,
    read: true,
    agedMinutes: 25 * 60,
  },
  {
    category: 'Plattform',
    title: 'TikTok erweitert Suchanzeigen auf den DACH-Raum',
    teaser: null,
    source: 'TikTok Business',
    tag: null,
    highlight: false,
    read: true,
    agedMinutes: 26 * 60,
  },
  {
    category: 'Trend',
    title: 'KI-Captioning halbiert die Produktionszeit für Social-Clips',
    teaser: null,
    source: 'Later',
    tag: null,
    highlight: false,
    read: true,
    agedMinutes: 48 * 60,
  },
  {
    category: 'Mention',
    title: 'G-Hub von @marketingweek als „Tool der Woche" gelistet',
    teaser: null,
    source: 'X · @marketingweek',
    tag: null,
    highlight: false,
    read: true,
    agedMinutes: 49 * 60,
  },
];
