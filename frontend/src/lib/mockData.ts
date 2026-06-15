/**
 * Statische Mock-Daten — TS-Port der relevanten Felder aus dem Prototyp `app/data.js`.
 * Wird design-first verwendet, solange die jeweiligen Backends noch nicht existieren
 * (Analytics, Planer, News, Assets, Team, Zeiterfassung). Farben über CSS-Variablen.
 */

export interface Channel {
  name: string;
  short: string;
  color: string;
}

export const CHANNELS: Record<string, Channel> = {
  instagram: { name: 'Instagram', short: 'IG', color: 'var(--ch-instagram)' },
  linkedin: { name: 'LinkedIn', short: 'in', color: 'var(--ch-linkedin)' },
  x: { name: 'X', short: 'X', color: 'var(--ch-x)' },
  facebook: { name: 'Facebook', short: 'f', color: 'var(--ch-facebook)' },
  tiktok: { name: 'TikTok', short: 'TT', color: 'var(--ch-tiktok)' },
  youtube: { name: 'YouTube', short: 'YT', color: 'var(--ch-youtube)' },
};

export interface Member {
  id: string;
  name: string;
  initials: string;
  grad: string;
  role: string;
}

export const TEAM: Member[] = [
  { id: 'me', name: 'Du', initials: 'DU', grad: 'linear-gradient(140deg,#cdf24d,#5fd3a3)', role: 'Owner' },
  { id: 'lena', name: 'Lena Frank', initials: 'LF', grad: 'linear-gradient(140deg,#5b6cff,#a64dff)', role: 'Content Lead' },
  { id: 'jonas', name: 'Jonas Berg', initials: 'JB', grad: 'linear-gradient(140deg,#ff7a5c,#ff4d8d)', role: 'Designer' },
  { id: 'mira', name: 'Mira Cap', initials: 'MC', grad: 'linear-gradient(140deg,#3fe0d0,#3f9bff)', role: 'Social Manager' },
  { id: 'tom', name: 'Tom Velt', initials: 'TV', grad: 'linear-gradient(140deg,#ffce6b,#ff7a5c)', role: 'Analyst' },
];

export const TEAM_BY_ID: Record<string, Member> = Object.fromEntries(TEAM.map((m) => [m.id, m]));

// --- Planer-Status & Posts (nur Instagram + Facebook) ---
export type PlanerStatusKey = 'entwurf' | 'freigabe' | 'geplant' | 'live';

export const PLANER_STATUS: Record<PlanerStatusKey, { label: string; color: string }> = {
  entwurf: { label: 'Entwurf', color: 'var(--text-3)' },
  freigabe: { label: 'Freigabe', color: 'var(--warn)' },
  geplant: { label: 'Geplant', color: 'var(--ch-linkedin)' },
  live: { label: 'Live', color: 'var(--ok)' },
};

export interface PlanerPost {
  id: string;
  ch: string;
  t: string;
  time: string;
  day: number | null;
  hhmm: string;
  status: PlanerStatusKey;
  ai: boolean;
  autopost: boolean;
  by: string;
  cap: string;
}

export const PLANER_POSTS: PlanerPost[] = [
  { id: 'pp1', ch: 'instagram', t: 'Sommer-Drop Teaser Reel', time: 'Fr 18:00', day: 12, hhmm: '18:00', status: 'entwurf', ai: true, autopost: false, by: 'me', cap: 'Es wird heiß ☀️ Unser Sommer-Drop kommt – sichere dir früh die besten Styles. #sommerdrop #newcollection' },
  { id: 'pp2', ch: 'facebook', t: 'Team-Vorstellung: Die Crew', time: '—', day: null, hhmm: '', status: 'entwurf', ai: false, autopost: false, by: 'jonas', cap: 'Lernt das Team hinter den Kulissen kennen 👋 Wer steckt eigentlich hinter euren Lieblingsprodukten?' },
  { id: 'pp3', ch: 'instagram', t: '3 Styling-Tipps Karussell', time: 'Mi 12:00', day: 10, hhmm: '12:00', status: 'freigabe', ai: true, autopost: false, by: 'lena', cap: '3 Styling-Tipps für den Sommer ☀️ Swipe für die Looks unseres neuen Drops. Welcher ist dein Favorit? #styling' },
  { id: 'pp4', ch: 'facebook', t: 'Event: Late-Night-Shopping', time: 'Do 09:00', day: 11, hhmm: '09:00', status: 'freigabe', ai: false, autopost: false, by: 'mira', cap: 'Diesen Freitag: Late-Night-Shopping bis 24 Uhr 🌙 Komm vorbei – Drinks & 20 % auf alles.' },
  { id: 'pp5', ch: 'instagram', t: 'Produkt-Drop Reveal', time: 'Heute 18:00', day: 12, hhmm: '18:00', status: 'geplant', ai: true, autopost: true, by: 'me', cap: 'Es ist soweit – der Drop ist LIVE 🔥 Jetzt shoppen, solange der Vorrat reicht. Link in Bio.' },
  { id: 'pp6', ch: 'facebook', t: 'Wochenend-Special −20 %', time: 'Sa 10:00', day: 13, hhmm: '10:00', status: 'geplant', ai: false, autopost: true, by: 'mira', cap: 'Nur dieses Wochenende: −20 % auf den gesamten Shop mit Code SOMMER20. Bis Sonntag!' },
  { id: 'pp7', ch: 'instagram', t: 'Countdown Story Day 1', time: 'So 19:00', day: 14, hhmm: '19:00', status: 'geplant', ai: true, autopost: true, by: 'me', cap: 'Noch 3 Tage… 👀 Countdown läuft. Bleib dran für exklusive Previews in unseren Stories.' },
  { id: 'pp8', ch: 'instagram', t: 'Behind the Scenes Shooting', time: 'Live · +1,2k', day: 9, hhmm: '14:00', status: 'live', ai: false, autopost: false, by: 'lena', cap: 'Ein Blick hinter die Kulissen unseres Sommer-Shootings 📸 Swipe für mehr.' },
  { id: 'pp9', ch: 'facebook', t: 'Kundenstimme „Bestes Produkt"', time: 'Live · 312 ❤', day: 8, hhmm: '11:00', status: 'live', ai: false, autopost: false, by: 'mira', cap: '„Das beste Produkt, das ich je gekauft habe." – Danke für die tollen Reviews! ❤' },
];

// --- Analytics ---
export interface AnaKpi {
  label: string;
  val: string;
  icon: string;
  delta: number;
  up: boolean;
}

export interface AnaSource {
  name: string;
  color: string;
  icon: string;
  conv: number;
  spend: number;
  series: number[];
  split?: Array<{ ch: string; val: number }>;
  kpis: AnaKpi[];
}

export interface Ana {
  gesamt: { reach: number; conv: number; spend: number; roas: number };
  google: AnaSource;
  meta: AnaSource;
  gesamtKpis: AnaKpi[];
}

export const ANA: Ana = {
  gesamt: { reach: 284500, conv: 842, spend: 6140, roas: 4.2 },
  google: {
    name: 'Google', color: '#4285F4', icon: 'search', conv: 486, spend: 3420,
    series: [42, 45, 44, 50, 53, 51, 58, 60, 63, 61, 67, 70, 72, 75, 78, 82],
    kpis: [
      { label: 'Impressionen', val: '1,24 Mio', icon: 'eye', delta: 9.1, up: true },
      { label: 'Klicks', val: '38,4K', icon: 'target', delta: 6.2, up: true },
      { label: 'CTR', val: '3,1 %', icon: 'zap', delta: 0.4, up: true },
      { label: 'Ø CPC', val: '0,74 €', icon: 'trend', delta: 5.0, up: true },
    ],
  },
  meta: {
    name: 'Meta', color: '#0866FF', icon: 'globe', conv: 356, spend: 2720,
    series: [30, 34, 33, 38, 40, 44, 47, 49, 52, 55, 58, 60, 64, 66, 70, 73],
    split: [{ ch: 'instagram', val: 64 }, { ch: 'facebook', val: 36 }],
    kpis: [
      { label: 'Reichweite', val: '198K', icon: 'eye', delta: 14.2, up: true },
      { label: 'Engagement', val: '6,8 %', icon: 'heart', delta: 0.9, up: true },
      { label: 'Neue Follower', val: '3,1K', icon: 'users', delta: 8.1, up: true },
      { label: 'Frequenz', val: '2,4', icon: 'trend', delta: 2.1, up: false },
    ],
  },
  gesamtKpis: [
    { label: 'Conversions', val: '842', icon: 'target', delta: 3.2, up: false },
    { label: 'Werbeausgaben', val: '6.140 €', icon: 'zap', delta: 4.0, up: true },
    { label: 'ROAS', val: '4,2×', icon: 'trend', delta: 7.5, up: true },
    { label: 'Klicks', val: '76,8K', icon: 'eye', delta: 6.9, up: true },
  ],
};

export const REACH_SERIES = [38, 42, 40, 47, 52, 49, 58, 55, 63, 68, 64, 72, 70, 78, 82, 79, 88, 84, 92, 96, 90, 101, 98, 108];

export const CHANNEL_MIX: Array<{ ch: string; val: number }> = [
  { ch: 'instagram', val: 42 },
  { ch: 'tiktok', val: 23 },
  { ch: 'linkedin', val: 18 },
  { ch: 'youtube', val: 9 },
  { ch: 'x', val: 8 },
];

export interface TopPost {
  ch: string;
  t: string;
  reach: number;
  eng: number;
}

export const TOP_POSTS: TopPost[] = [
  { ch: 'instagram', t: '5 Growth-Hacks Karussell', reach: 48200, eng: 9.2 },
  { ch: 'tiktok', t: 'Trend-Audio Behind-the-Scenes', reach: 39100, eng: 11.4 },
  { ch: 'linkedin', t: 'Case Study: 3× ROI', reach: 21800, eng: 6.1 },
];

// --- Content nach Tag im Monat (Juni 2026) ---
export interface ContentItem {
  ch: string;
  t: string;
  time: string;
  status: string;
}

export const CONTENT: Record<number, ContentItem[]> = {
  3: [{ ch: 'instagram', t: 'Behind-the-Scenes Reel', time: '09:00', status: 'sched' }, { ch: 'linkedin', t: 'Branchen-Insight Post', time: '12:30', status: 'sched' }],
  4: [{ ch: 'tiktok', t: 'Trend-Audio Clip', time: '17:00', status: 'draft' }],
  5: [{ ch: 'x', t: 'Produkt-Thread (6 Teile)', time: '10:00', status: 'review' }, { ch: 'instagram', t: 'Karussell: 5 Tipps', time: '15:00', status: 'sched' }, { ch: 'facebook', t: 'Event-Ankündigung', time: '18:00', status: 'sched' }],
  9: [{ ch: 'youtube', t: 'Tutorial: Setup in 5 Min', time: '11:00', status: 'sched' }],
  11: [{ ch: 'instagram', t: 'Sommer-Launch Teaser', time: '09:00', status: 'sched' }, { ch: 'tiktok', t: 'Countdown Day 1', time: '19:00', status: 'sched' }],
  12: [{ ch: 'instagram', t: 'Launch! Reveal Reel', time: '10:00', status: 'sched' }, { ch: 'facebook', t: 'Launch Announcement', time: '10:05', status: 'sched' }, { ch: 'linkedin', t: 'Launch Story', time: '11:00', status: 'draft' }],
  17: [{ ch: 'linkedin', t: 'Case-Study Karussell', time: '13:00', status: 'sched' }],
  18: [{ ch: 'x', t: 'Q&A Live-Thread', time: '16:00', status: 'draft' }],
  24: [{ ch: 'instagram', t: 'UGC Repost', time: '14:00', status: 'sched' }, { ch: 'youtube', t: 'Webinar Highlights', time: '17:00', status: 'review' }],
};

// --- News & Trends ---
export interface NewsHighlight {
  cat: string;
  title: string;
  teaser: string;
  src: string;
  time: string;
  tag: string;
}

export interface NewsItem {
  cat: string;
  title: string;
  src: string;
  time: string;
}

export const NEWS: { highlight: NewsHighlight; items: NewsItem[]; unread: number } = {
  highlight: {
    cat: 'Trend',
    title: 'Kurzvideos dominieren 2026: Reels & Shorts treiben 68 % der organischen Reichweite',
    teaser: 'Das Wachstum verschiebt sich plattformübergreifend klar zu kurzen, vertikalen Videos. Marken mit ≥3 Reels pro Woche wachsen 2,4× schneller.',
    src: 'Social Media Today', time: 'vor 2 Std', tag: 'trend-report-2026',
  },
  items: [
    { cat: 'Plattform', title: 'Instagram rollt „Trial Reels" für alle Business-Accounts aus', src: 'Meta Newsroom', time: 'vor 4 Std' },
    { cat: 'Plattform', title: 'LinkedIn priorisiert künftig Karussell-Posts im Feed', src: 'LinkedIn Blog', time: 'vor 6 Std' },
    { cat: 'Trend', title: 'UGC schlägt Hochglanz: authentische Inhalte mit +34 % Engagement', src: 'HubSpot', time: 'vor 9 Std' },
    { cat: 'Mention', title: '„Sommer-Launch 2026" in 12 Branchen-Newslettern erwähnt', src: 'Mention-Tracking', time: 'Gestern' },
    { cat: 'Plattform', title: 'TikTok erweitert Suchanzeigen auf den DACH-Raum', src: 'TikTok Business', time: 'Gestern' },
    { cat: 'Trend', title: 'KI-Captioning halbiert die Produktionszeit für Social-Clips', src: 'Later', time: 'vor 2 Tagen' },
    { cat: 'Mention', title: 'G-Hub von @marketingweek als „Tool der Woche" gelistet', src: 'X · @marketingweek', time: 'vor 2 Tagen' },
  ],
  unread: 4,
};

// --- Mitteilungen / Inbox ---
export interface InboxItem {
  id: string;
  type: string;
  who: string | null;
  txt: string;
  sub: string;
  t: string;
  unread: boolean;
}

export const INBOX: InboxItem[] = [
  { id: 'n1', type: 'comment', who: 'lena', txt: 'hat dich in "Sommer-Launch" erwähnt', sub: '„Kannst du den Hook noch checken?"', t: 'vor 8 Min', unread: true },
  { id: 'n2', type: 'approve', who: 'mira', txt: 'Freigabe angefragt', sub: 'Produkt-Teaser Reels · 2 Posts', t: 'vor 41 Min', unread: true },
  { id: 'n3', type: 'metric', who: null, txt: 'Sommer-Launch übertrifft Ziel', sub: 'Reichweite +18% über Plan', t: 'vor 2 Std', unread: true },
  { id: 'n4', type: 'comment', who: 'jonas', txt: 'hat Creatives hochgeladen', sub: '6 neue Assets in der Bibliothek', t: 'vor 5 Std', unread: false },
  { id: 'n5', type: 'system', who: null, txt: '3 Posts wurden veröffentlicht', sub: 'Instagram · LinkedIn · X', t: 'Gestern', unread: false },
];

// --- Assets ---
export interface Asset {
  id: string;
  tag: string;
  kind: string;
  ch: string | null;
}

export const ASSETS: Asset[] = [
  { id: 'a1', tag: 'reel-cover.mp4', kind: 'Video', ch: 'instagram' },
  { id: 'a2', tag: 'launch-key-visual', kind: 'Bild', ch: null },
  { id: 'a3', tag: 'carousel-01.png', kind: 'Bild', ch: 'instagram' },
  { id: 'a4', tag: 'logo-pack.zip', kind: 'Datei', ch: null },
  { id: 'a5', tag: 'ad-banner-1080', kind: 'Bild', ch: 'facebook' },
  { id: 'a6', tag: 'webinar-cut.mp4', kind: 'Video', ch: 'youtube' },
  { id: 'a7', tag: 'quote-template', kind: 'Bild', ch: 'linkedin' },
  { id: 'a8', tag: 'product-shot-03', kind: 'Bild', ch: null },
];

// --- Aufgaben (einfache Liste für Sheets/Suche) ---
export interface SimpleTask {
  id: string;
  t: string;
  who: string;
  due: string;
  done: boolean;
  prio: 'high' | 'med' | 'low';
  tag: string;
}

export const TASKS: SimpleTask[] = [
  { id: 't1', t: 'Reel-Skript für Sommer-Launch finalisieren', who: 'lena', due: 'Heute', done: false, prio: 'high', tag: 'Content' },
  { id: 't2', t: 'Creatives für TikTok-Ads exportieren', who: 'jonas', due: 'Heute', done: false, prio: 'high', tag: 'Design' },
  { id: 't3', t: 'LinkedIn-Captions Korrektur lesen', who: 'me', due: 'Morgen', done: false, prio: 'med', tag: 'Content' },
  { id: 't4', t: 'Influencer-Briefing versenden', who: 'mira', due: '4. Jun', done: false, prio: 'med', tag: 'Outreach' },
  { id: 't5', t: 'Mai-Report an Geschäftsführung', who: 'tom', due: 'Erledigt', done: true, prio: 'low', tag: 'Analytics' },
  { id: 't6', t: 'Hashtag-Set für Q2 aktualisieren', who: 'mira', due: 'Erledigt', done: true, prio: 'low', tag: 'Content' },
];

// --- Zeiterfassung ---
export const WORKTIME = {
  target: 40,
  week: [{ d: 'Mo', h: 8.0 }, { d: 'Di', h: 7.5 }, { d: 'Mi', h: 8.0 }, { d: 'Do', h: 6.0 }, { d: 'Fr', h: 3.0 }],
  clockedIn: true,
  since: '09:12',
  month: { label: 'Juni 2026', done: 142.5, target: 160, balance: 4.5 },
  absence: { urlaubLeft: 18, urlaubUsed: 12, sick: 2, holidays: 1 },
  today: { worked: 3.2, break: 0.5 },
};

export function channelMeta(ch: string): Channel {
  return CHANNELS[ch] ?? { name: ch, short: ch.slice(0, 2).toUpperCase(), color: 'var(--text-3)' };
}
