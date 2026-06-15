import type { PlanCategory, PlanChannel, PlanLinkDirection } from '@g-hub/shared';

/**
 * Erstbefüllung des Jahresplans — 1:1 aus dem Prototyp (`app/jahresplan.jsx`,
 * Konstante `JP_MONTHS`). Dient als Vorlage zum workspace-gescopten Seeden
 * (POST /plan/:year/seed). Inhalte stammen aus dem Marketingplan Gerber.
 */
export interface SeedTheme {
  title: string;
  category: PlanCategory;
  description: string;
  channels: PlanChannel[];
}

export interface SeedLink {
  direction: PlanLinkDirection;
  targetMonth: string;
  text: string;
}

export interface SeedMonth {
  month: number; // 1..12
  focus: string;
  themes: SeedTheme[];
  links: SeedLink[];
}

export const PLAN_SEED_MONTHS: SeedMonth[] = [
  {
    month: 1,
    focus: 'Brennholz & Werkstatt',
    themes: [
      { title: 'Brennholz-Sägen', category: 'verkauf', description: 'Motorsägen für Brennholz, alle Leistungsklassen — mit Beratung & Einweisung.', channels: ['social', 'ads', 'flyer'] },
      { title: 'Spalten & Pflege', category: 'verkauf', description: 'Keile, Forstwerkzeug, Oest Kraftstoff & Kettenpflege.', channels: ['social', 'newsletter'] },
      { title: 'Werkstatt-Wintercheck', category: 'service', description: 'Wintercheck & Ketten schärfen — jetzt kurze Wartezeiten.', channels: ['ads', 'newsletter', 'flyer'] },
    ],
    links: [{ direction: 'back', targetMonth: 'Dezember', text: 'Wintercheck wurde im Dezember-Flyer angeteasert.' }],
  },
  {
    month: 2,
    focus: 'Schnitt vor der Schonzeit',
    themes: [
      { title: 'Baumpflege & Hochentaster', category: 'verkauf', description: 'Hochentaster & Berger Astscheren — sicher ohne Leiter.', channels: ['social', 'ads'] },
      { title: 'Heckenschnitt-Frist', category: 'frist', description: 'Radikalschnitt in der Regel nur bis Ende Februar erlaubt (Gemeinde beachten).', channels: ['social', 'newsletter', 'flyer'] },
      { title: 'Geräte mieten', category: 'vermietung', description: 'Hochentaster & Co. online reservieren — mieten statt kaufen.', channels: ['ads', 'flyer'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'Juni', text: 'Frist-Wissen wird im Juni referenziert (Formschnitt erlaubt).' }],
  },
  {
    month: 3,
    focus: 'Rasen erwacht',
    themes: [
      { title: 'Vertikutieren', category: 'verkauf', description: 'Rasen aus dem Winter holen — kaufen oder mieten.', channels: ['social', 'ads'] },
      { title: 'Rasenmäher-Saisonstart', category: 'verkauf', description: 'STIHL & Stiga — Akku vs. Benzin, ehrliche Beratung.', channels: ['social', 'ads', 'flyer'] },
      { title: 'Frühjahrs-Check & Deals', category: 'service', description: 'Mäher-Check + Frühjahrsdeals & geprüfte Gebrauchtgeräte.', channels: ['newsletter', 'flyer'] },
    ],
    links: [{ direction: 'back', targetMonth: 'Januar', text: 'Zweite Chance für Wintercheck-Verpasser.' }],
  },
  {
    month: 4,
    focus: 'Große Flächen & Wildwuchs',
    themes: [
      { title: 'Aufsitzmäher', category: 'verkauf', description: 'Stiga Aufsitzmäher — Probefahrt & Finanzierung.', channels: ['social', 'ads'] },
      { title: 'AS-Motor Hochgrasmäher', category: 'verkauf', description: 'Für Wildwiese, Hang & Kommune (B2B).', channels: ['social', 'ads'] },
      { title: 'Finanzierung & Vorführung', category: 'service', description: 'Vorführung vor Ort, Finanzierung möglich.', channels: ['newsletter', 'flyer'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'Mai', text: 'April-Besucher per Remarketing mit iMOW ansprechen.' }],
  },
  {
    month: 5,
    focus: 'Smart & sauber',
    themes: [
      { title: 'Mähroboter iMOW', category: 'verkauf', description: 'Einrichten & vernetzen — die Einweisung ist der Fachhandels-USP.', channels: ['social', 'ads', 'newsletter'] },
      { title: 'Hochdruckreiniger & Kehrmaschinen', category: 'verkauf', description: 'Frühjahrsputz für Terrasse, Hof, Einfahrt.', channels: ['social', 'flyer'] },
      { title: 'iMOW-Einweisung', category: 'service', description: 'Inbetriebnahme & Einweisung beim Fachhandel.', channels: ['ads', 'newsletter'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'September', text: 'iMOW-Käufer im September zur Einlagerung anschreiben.' }],
  },
  {
    month: 6,
    focus: 'Trimmen & schneiden',
    themes: [
      { title: 'Freischneider & Motorsensen', category: 'verkauf', description: 'STIHL FS gegen hohes Gras — sofort verfügbar, mit Einweisung.', channels: ['social', 'ads', 'flyer'] },
      { title: 'Heckenscheren — Formschnitt', category: 'verkauf', description: 'Formschnitt ist erlaubt; Akku-Komfort (leicht & leise) betonen.', channels: ['social', 'newsletter'] },
      { title: 'Schnellservice & Reparatur', category: 'service', description: 'Hochsaison-Reparatur — auch für woanders gekaufte Geräte (Neukunden).', channels: ['ads', 'newsletter', 'flyer'] },
    ],
    links: [
      { direction: 'back', targetMonth: 'Februar', text: 'Schonzeit-Frist referenzieren — Formschnitt ist erlaubt.' },
      { direction: 'fwd', targetMonth: 'Juli', text: 'Werkstatt-Zahlen aus der Wo-4-Story zitieren.' },
    ],
  },
  {
    month: 7,
    focus: 'Power & Nachschub',
    themes: [
      { title: 'STIHL Akku-System', category: 'verkauf', description: 'Ein Akku für alle Geräte — leise & abgasfrei.', channels: ['social', 'ads', 'newsletter'] },
      { title: 'Zubehör & Verbrauchsmaterial', category: 'verkauf', description: 'Sägeketten, Mähfäden, Oest Öle & Spezialkraftstoffe.', channels: ['social', 'newsletter'] },
      { title: 'Ersatzteil-Service', category: 'service', description: 'Schnelle Beschaffung — auch für Fremdfabrikate.', channels: ['ads', 'newsletter'] },
    ],
    links: [{ direction: 'back', targetMonth: 'März–Juni', text: 'Newsletter gezielt an Käufer aus März–Juni (Cross-Selling).' }],
  },
  {
    month: 8,
    focus: 'Hecke & Rasen-Comeback',
    themes: [
      { title: 'Heckenschnitt Spätsommer', category: 'verkauf', description: 'Zweiter Formschnitt — Akku-Heckenschere im Komfort.', channels: ['social', 'ads'] },
      { title: 'Rasen-Nachsaat & -pflege', category: 'saison', description: 'Beste Saatzeit ab Mitte August — Pflegeplan liefern.', channels: ['social', 'newsletter'] },
      { title: 'Vertikutierer mieten', category: 'vermietung', description: 'Rasenkur am Wochenende ohne Neukauf.', channels: ['ads', 'flyer'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'Oktober', text: 'Story baut die Brücke zur Fällsaison.' }],
  },
  {
    month: 9,
    focus: 'Herbst voraus',
    themes: [
      { title: 'Laubbläser & Saughäcksler', category: 'verkauf', description: 'Laubsaison startet — Akku & Benzin.', channels: ['social', 'ads', 'flyer'] },
      { title: 'Rasen winterfit', category: 'saison', description: 'Herbst-Vertikutieren, letzte Mahd, Herbstdüngung.', channels: ['social', 'newsletter'] },
      { title: 'iMOW-Einlagerung & Wartung', category: 'service', description: 'Mähroboter winterfest machen.', channels: ['ads', 'newsletter'] },
    ],
    links: [
      { direction: 'back', targetMonth: 'Mai', text: 'Service-Block adressiert die Mai-iMOW-Käufer.' },
      { direction: 'fwd', targetMonth: 'Oktober', text: 'Motorsägen-Kampagne vorbereiten (live am 1.10.).' },
    ],
  },
  {
    month: 10,
    focus: 'Fällsaison & Häckseln',
    themes: [
      { title: 'Motorsägen zur Fällsaison', category: 'verkauf', description: 'Ab 1.10. darf in der Regel gefällt werden — Sägen, Keile, Eder.', channels: ['social', 'ads', 'flyer'] },
      { title: 'Häcksler', category: 'verkauf', description: 'Rückschnitt & Gartenabfall verwerten.', channels: ['social', 'ads'] },
      { title: 'Häcksler & Säge mieten', category: 'vermietung', description: 'Miet-Aktion zur Fällsaison.', channels: ['ads', 'flyer'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'November', text: 'Cliffhanger sät das PSA-Thema für November.' }],
  },
  {
    month: 11,
    focus: 'Sicher & einlagern',
    themes: [
      { title: 'Schnittschutz & PSA', category: 'verkauf', description: 'Pfanner & Protos — Anprobe nur im Fachhandel (vs. Versand).', channels: ['social', 'ads', 'flyer'] },
      { title: 'Geräte einwintern', category: 'saison', description: 'Reinigen, Kraftstoff, Akku-Lagerung.', channels: ['social', 'newsletter'] },
      { title: 'Einlagerungs-Service', category: 'service', description: 'Jetzt bringen, im Frühjahr startklar abholen.', channels: ['ads', 'newsletter', 'flyer'] },
    ],
    links: [
      { direction: 'back', targetMonth: 'Oktober', text: 'Zielgruppe = Oktober-Sägenkäufer.' },
      { direction: 'fwd', targetMonth: 'Dezember', text: 'Flyer teasert die Weihnachts-Gutscheine.' },
    ],
  },
  {
    month: 12,
    focus: 'Schenken & wärmen',
    themes: [
      { title: 'Geschenke & Gutscheine', category: 'verkauf', description: 'Akku-Sets, Zubehör, Werkstatt-Gutschein (3 Preisstufen).', channels: ['social', 'ads', 'flyer'] },
      { title: 'Funktions- & Arbeitskleidung', category: 'verkauf', description: 'Pfanner & Protos — warm durch die kalte Jahreszeit.', channels: ['social', 'newsletter'] },
      { title: 'Geschenkberatung & Gutschein', category: 'service', description: 'Null-Risiko-Option für Schenkende ohne Technik-Wissen.', channels: ['ads', 'newsletter'] },
    ],
    links: [{ direction: 'fwd', targetMonth: 'Januar', text: 'Flyer-Teaser schließt den Kreis zum Wintercheck.' }],
  },
];
