import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Schlichter, zentrierter Modal-Dialog (ruhig, wie die Web-Sheets im Prototyp).
 * Schließt per Escape, Backdrop-Klick oder ✕.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 94vw)',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-2)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--r-md)',
          boxShadow: '0 40px 90px -30px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontFamily: 'var(--ff-disp)', fontWeight: 700, fontSize: '17px' }}>
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        <div style={{ padding: '18px 20px', overflowY: 'auto' }}>{children}</div>

        {footer && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
