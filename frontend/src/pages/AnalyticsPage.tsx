import { PageGrid, PlaceholderCard } from './Placeholder';

/** Analytics-Platzhalter (echte Auswertungen folgen in Phase 3). */
export function AnalyticsPage(): React.JSX.Element {
  return (
    <PageGrid>
      <PlaceholderCard icon="trend" title="Reichweite" sub="Gesamt · Google · Meta" />
      <PlaceholderCard icon="users" title="Zielgruppen" sub="Demografie & Verhalten" />
      <PlaceholderCard icon="target" title="Conversions" sub="Ziele & Funnel" />
    </PageGrid>
  );
}
