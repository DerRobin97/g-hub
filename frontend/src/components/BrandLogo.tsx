/**
 * Marken-Logo (Gerber-Hub-Wortmarke) als statisches Asset aus `public/`.
 * 1:1 dieselbe Vektorgrafik wie der Ladescreen. Höhe steuerbar; Breite automatisch.
 */
export function BrandLogo({ height = 28, style }: { height?: number; style?: React.CSSProperties }): React.JSX.Element {
  return (
    <img
      src="/gerber-hub-logo.svg"
      alt="Gerber Hub"
      height={height}
      style={{ height, width: 'auto', display: 'block', ...style }}
    />
  );
}
