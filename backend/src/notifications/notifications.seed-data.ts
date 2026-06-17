import type { NotificationType } from '@g-hub/shared';

/**
 * Startbestand der Mitteilungen (1:1 aus dem bisherigen Frontend-Mock).
 * Wird beim ersten Abruf je Workspace idempotent angelegt. `who` = Team-Kürzel
 * (oder null bei System), `agedMinutes` = Alter zum Seed-Zeitpunkt (relatives Label).
 */
export interface NotificationSeed {
  type: NotificationType;
  who: string | null;
  txt: string;
  sub: string | null;
  read: boolean;
  agedMinutes: number;
}

export const NOTIFICATION_SEED: NotificationSeed[] = [
  {
    type: 'comment',
    who: 'lena',
    txt: 'hat dich in "Sommer-Launch" erwähnt',
    sub: '„Kannst du den Hook noch checken?"',
    read: false,
    agedMinutes: 8,
  },
  {
    type: 'approve',
    who: 'mira',
    txt: 'Freigabe angefragt',
    sub: 'Produkt-Teaser Reels · 2 Posts',
    read: false,
    agedMinutes: 41,
  },
  {
    type: 'metric',
    who: null,
    txt: 'Sommer-Launch übertrifft Ziel',
    sub: 'Reichweite +18% über Plan',
    read: false,
    agedMinutes: 120,
  },
  {
    type: 'comment',
    who: 'jonas',
    txt: 'hat Creatives hochgeladen',
    sub: '6 neue Assets in der Bibliothek',
    read: true,
    agedMinutes: 300,
  },
  {
    type: 'system',
    who: null,
    txt: '3 Posts wurden veröffentlicht',
    sub: 'Instagram · LinkedIn · X',
    read: true,
    agedMinutes: 1440,
  },
];
