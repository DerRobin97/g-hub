import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Wiederverwendbares Bottom-Sheet (Port aus dem Prototyp `Sheet`). Klassen 1:1
 * (sheet-scrim/sheet/sheet-grab/sheet-head/sheet-title/sheet-body). Schließt per
 * Scrim-Klick oder Escape. Die aufwändige Spark-Animation des Prototyps ist
 * weggelassen — die CSS-Slide-up-Animation der `.sheet`-Klasse bleibt erhalten.
 */
export function Sheet({
  title,
  onClose,
  children,
  foot,
  full = false,
  variant = '',
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  foot?: ReactNode;
  full?: boolean;
  variant?: string;
}): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className={'sheet' + (variant ? ' ' + variant : '')} style={full ? { height: '92%' } : undefined}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Schließen">
            <Icon name="close" size={17} />
          </button>
        </div>
        <div className="sheet-body" style={{ flex: 1 }}>{children}</div>
        {foot && (
          <div className="sheet-foot">
            {foot}
          </div>
        )}
      </div>
    </>
  );
}
