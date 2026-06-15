import { useNavigate, useParams } from 'react-router-dom';
import { PROJ_SUB } from '../app/nav';
import { PageGrid, PlaceholderCard } from './Placeholder';

/**
 * Projekte-Hub-Platzhalter. Zeigt die Fachbereiche als Kacheln; eine ausgewählte
 * Unterseite (`/projekte/:area`) rendert vorerst einen Bereichs-Platzhalter.
 * Die echten Bereiche folgen in Phase 1 (Schritte 4–6).
 */
export function ProjektePage(): React.JSX.Element {
  const { area } = useParams<{ area?: string }>();
  const navigate = useNavigate();

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
          sub="Bereich folgt in Phase 1"
        />
      </div>
    );
  }

  return (
    <PageGrid>
      {PROJ_SUB.map((s) => (
        <PlaceholderCard
          key={s.key}
          icon={s.icon}
          title={s.name}
          sub={s.sub}
          onClick={() => navigate(`/projekte/${s.key}`)}
        />
      ))}
    </PageGrid>
  );
}
