/**
 * Kleine Präsentations-Primitive (migriert aus dem Prototyp `app/ui.jsx`).
 * Rein darstellend, datenfrei — wiederverwendbar in Dashboard & Fachbereichen.
 */
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Icon } from './Icon';
import { channelMeta, TEAM_BY_ID, type Member } from '../lib/mockData';

/** Tausenderformat (de-DE); 'compact' für kurze Mio/K-Schreibweise. */
export function fmtNum(n: number, mode?: 'compact'): string {
  if (mode === 'compact') {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' Mio';
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace('.', ',') + 'K';
  }
  return n.toLocaleString('de-DE');
}

/**
 * Einblende-Animationen (Port aus dem Prototyp `useReveal`, Design-Doku Kap. 6).
 * Gestaffelte Reveals: jedem `.reveal`-Kind ohne eigenes `--rd` wird anhand seiner
 * Reihenfolge eine Verzögerung zugewiesen (i·70 ms, gedeckelt). Sichtbar wird ein
 * Element per IntersectionObserver, sobald es in den Viewport scrollt (`revFade`).
 * Fallback: ist kein Observer verfügbar, werden alle sofort eingeblendet.
 */
export function useReveal(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    els.forEach((el, i) => {
      if (!el.style.getPropertyValue('--rd')) {
        el.style.setProperty('--rd', `${Math.min(i, 9) * 70}ms`);
      }
    });
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

/**
 * Zahl, die beim Einblenden hochzählt (Design-Doku Kap. 6: rAF-Tween 900 ms,
 * Ease `1−(1−p)³`). Respektiert `prefers-reduced-motion` (zeigt sofort den Endwert)
 * und nutzt `fmtNum` für die Formatierung. Per `tabular-nums` kein Layout-Springen.
 */
export function CountUp({
  value,
  mode,
  duration = 900,
  prefix = '',
  suffix = '',
  format,
}: {
  value: number;
  mode?: 'compact';
  duration?: number;
  prefix?: string;
  suffix?: string;
  // Eigene Formatierung des Zwischenwerts (z. B. „128,4k", „6,1%"). Überschreibt mode.
  format?: (n: number) => string;
}): React.JSX.Element {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const reduce =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    const node = ref.current;
    if (reduce || !node || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    const run = (): void => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number): void => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, duration]);

  const text = format ? format(display) : fmtNum(Math.round(display), mode);
  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

export function Delta({ value, up }: { value: number; up: boolean }): React.JSX.Element {
  return (
    <span className={'delta ' + (up ? 'up' : 'down')}>
      <Icon name="trend" size={12} stroke={2.2} style={up ? undefined : { transform: 'scaleY(-1)' }} />
      {(up ? '+' : '') + value.toString().replace('.', ',')}%
    </span>
  );
}

function smoothPath(
  data: number[],
  w: number,
  h: number,
  pad = 2,
): { dd: string; pts: Array<[number, number]> } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const sx = (w - pad * 2) / (data.length - 1);
  const pts: Array<[number, number]> = data.map((d, i) => [
    pad + i * sx,
    h - pad - ((d - min) / rng) * (h - pad * 2),
  ]);
  let dd = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    dd += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  return { dd, pts };
}

export function Spark({
  data,
  w = 120,
  h = 38,
  color = 'var(--accent-fg)',
  fill = true,
  sw = 2,
}: {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
  sw?: number;
}): React.JSX.Element {
  const id = useId();
  const { dd, pts } = smoothPath(data, w, h, 2);
  const area = `${dd} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={dd} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function Ring({
  pct,
  size = 58,
  sw = 7,
  color = 'var(--accent-fg)',
  children,
}: {
  pct: number;
  size?: number;
  sw?: number;
  color?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--ff-disp)',
          fontWeight: 600,
          fontSize: size * 0.26,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SectionHead({
  title,
  link,
  onLink,
}: {
  title: string;
  link?: string;
  onLink?: () => void;
}): React.JSX.Element {
  return (
    <div className="sec-head">
      <div className="sec-title">{title}</div>
      {link && (
        <button className="sec-link" onClick={onLink}>
          {link}
        </button>
      )}
    </div>
  );
}

export type StatusKey = 'live' | 'sched' | 'draft' | 'review';
const STATUS: Record<StatusKey, { c: string; label: string }> = {
  live: { c: 's-live', label: 'Live' },
  sched: { c: 's-sched', label: 'Geplant' },
  draft: { c: 's-draft', label: 'Entwurf' },
  review: { c: 's-review', label: 'Review' },
};

export function StatusTag({ status }: { status: StatusKey }): React.JSX.Element {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-2)',
      }}
    >
      <span className={'sdot ' + s.c} />
      {s.label}
    </span>
  );
}

/** Team-Avatar (Initialen auf Gradient). `m` ist Member-Objekt oder Team-ID. */
export function Avatar({ m, size = 34 }: { m: Member | string; size?: number }): React.JSX.Element | null {
  const member = typeof m === 'string' ? TEAM_BY_ID[m] : m;
  if (!member) return null;
  return (
    <div className="avatar" style={{ width: size, height: size, background: member.grad, fontSize: size * 0.36 }}>
      {member.initials}
    </div>
  );
}

/** Überlappende Avatar-Gruppe mit „+N"-Überlauf. */
export function AvatarStack({ ids, size = 28, max = 4 }: { ids: string[]; size?: number; max?: number }): React.JSX.Element {
  const shown = ids.slice(0, max);
  const extra = ids.length - max;
  return (
    <div className="astack">
      {shown.map((id) => (
        <Avatar key={id} m={id} size={size} />
      ))}
      {extra > 0 && (
        <div
          className="avatar"
          style={{ width: size, height: size, background: 'var(--surface-3)', color: 'var(--text-2)', fontSize: size * 0.34, border: '2px solid var(--surface)', marginLeft: -9 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Kanal-Badge (Kürzel auf Kanalfarbe). */
export function ChannelBadge({ ch, size = 34 }: { ch: string; size?: number }): React.JSX.Element {
  const c = channelMeta(ch);
  return (
    <div className="cbadge" style={{ width: size, height: size, background: c.color, fontSize: size * 0.38 }}>
      {c.short}
    </div>
  );
}

/** Balkendiagramm; letzter Balken hervorgehoben. */
export function Bars({
  data,
  h = 150,
  color = 'var(--accent-fg)',
  labels,
}: {
  data: number[];
  h?: number;
  color?: string;
  labels?: string[];
}): React.JSX.Element {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h, width: '100%' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 18,
              borderRadius: 6,
              height: `${Math.max(4, (d / max) * 100)}%`,
              background: i === data.length - 1 ? color : 'var(--surface-3)',
              transition: 'height .6s cubic-bezier(.22,1,.36,1)',
            }}
          />
          {labels && <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
