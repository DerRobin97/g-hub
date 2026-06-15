import { useParams } from 'react-router-dom';
import { PROJ_SUB } from '../app/nav';
import { PlaceholderCard } from './Placeholder';
import { ProjekteHubPage } from '../features/projects/ProjekteHubPage';

/**
 * Projekte-Einstieg. Ohne Bereich: der Projekte-Hub (1:1 aus dem Prototyp).
 * Eine noch nicht gebaute Unterseite (`/projekte/:area`) zeigt einen Platzhalter.
 */
export function ProjektePage(): React.JSX.Element {
  const { area } = useParams<{ area?: string }>();

  if (area) {
    const sub = PROJ_SUB.find((s) => s.key === area);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', margin: 0 }}>
          {sub?.sub ?? 'Dieser Bereich wird in einer späteren Phase gebaut.'}
        </p>
        <PlaceholderCard
          icon={sub?.icon ?? 'layers'}
          title={sub?.name ?? area}
          sub="Bereich folgt in Kürze"
        />
      </div>
    );
  }

  return <ProjekteHubPage />;
}
