import type { ReactNode } from 'react';
import { Icon, type IconName } from '../components/Icon';

/**
 * Schlichte Platzhalter-Kachel im Gerber-Design (CSS-Variablen).
 * Wird in Phase 1 durch echte Inhalte ersetzt.
 */
export function PlaceholderCard({
  icon,
  title,
  sub,
  onClick,
  children,
}: {
  icon: IconName;
  title: string;
  sub?: string;
  onClick?: () => void;
  children?: ReactNode;
}): React.JSX.Element {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      style={{
        textAlign: 'left',
        width: '100%',
        cursor: onClick ? 'pointer' : 'default',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow)',
        padding: '20px',
        color: 'var(--text)',
        font: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <span
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--r-sm)',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--accent-soft)',
          color: 'var(--accent-fg)',
        }}
      >
        <Icon name={icon} size={20} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
        {sub && <div style={{ color: 'var(--text-3)', fontSize: '13px', marginTop: '2px' }}>{sub}</div>}
      </div>
      {children}
    </Tag>
  );
}

export function PageGrid({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      }}
    >
      {children}
    </div>
  );
}
