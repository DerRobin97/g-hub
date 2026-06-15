/**
 * Line-Icon-Set (Stroke 1.8, currentColor) — migriert aus dem Prototyp `app/icons.jsx`.
 * Verwendung: <Icon name="home" size={22} />
 */
import type { CSSProperties } from 'react';

const ICON_PATHS: Record<string, string> = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5.5h5V20"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  campaign:
    '<path d="M4 9v6l9 4V5L4 9z"/><path d="M4 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13"/>',
  chart:
    '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12.5" y="7" width="3" height="10" rx="1"/><rect x="18" y="13" width="0.5" height="4"/><path d="M7 9.5 11 6l3 2 5-4.5"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  news: '<rect x="3.5" y="5" width="13.5" height="14.5" rx="1.6"/><path d="M17 9h2a1.4 1.4 0 0 1 1.4 1.4V17.5A2 2 0 0 1 18.4 19.5H17"/><path d="M6.5 9h7M6.5 12.5h7M6.5 16h4.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  heart: '<path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 19a5.5 5.5 0 0 0-2.5-4.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.8 2.8L16 9.5"/>',
  chevronR: '<path d="m9 5 7 7-7 7"/>',
  chevronL: '<path d="m15 5-7 7 7 7"/>',
  chevronD: '<path d="m5 9 7 7 7-7"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  image:
    '<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4"/>',
  video: '<rect x="2.5" y="5.5" width="14" height="13" rx="3"/><path d="m16.5 10 5-3v10l-5-3z"/>',
  file: '<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/>',
  sparkle:
    '<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/><path d="M12 8.5 13.6 11 16 12l-2.4 1L12 15.5 10.4 13 8 12l2.4-1L12 8.5z"/>',
  bot: '<rect x="5" y="8" width="14" height="10" rx="4"/><path d="M12 4.5V8"/><circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none"/><circle cx="9.5" cy="13" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13" r="1.1" fill="currentColor" stroke="none"/><path d="M3.5 12.5v3M20.5 12.5v3"/>',
  send: '<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3z"/><path d="M10 13 21 3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pause:
    '<rect x="7" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none"/><rect x="13.8" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" stroke="none"/>',
  coffee:
    '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2.4a2.1 2.1 0 0 1 0 4.2H17"/><path d="M8 2.5c-.6.8-.6 1.7 0 2.5M12 2.5c-.6.8-.6 1.7 0 2.5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 3.5 2 3.5H5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
  arrowUR: '<path d="M7 17 17 7M9 7h8v8"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5 16 12l-6 3.5z" fill="currentColor" stroke="none"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.2"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="3.5" cy="18" r="1.2"/>',
  message: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',
  trend: '<path d="M3 16.5 9 10l4 3.5L21 5"/><path d="M15 5h6v6"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  link: '<path d="M9 15 15 9"/><path d="M11 7.5 13 5.5a3.5 3.5 0 0 1 5 5l-2 2M13 16.5l-2 2a3.5 3.5 0 0 1-5-5l2-2"/>',
  bookmark: '<path d="M6 4.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V5.5a1 1 0 0 1 1-1z"/>',
  phone:
    '<path d="M5 4h3.2l1.4 4.2-2 1.4a11.5 11.5 0 0 0 5.4 5.4l1.4-2 4.2 1.4V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.2 2 2 0 0 1 5 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7.5 8 5.5 8-5.5"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.3 3 7.2 7 8.5 4-1.3 7-4.2 7-8.5V6l-7-3z"/><path d="m9 11.8 2 2 4-4"/>',
};

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  size = 22,
  stroke = 1.8,
  style,
  className = '',
}: {
  name: IconName | string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}): React.JSX.Element {
  const d = ICON_PATHS[name] ?? '';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
