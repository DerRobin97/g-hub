import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { AppShell } from './app/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ProjektePage } from './pages/ProjektePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilPage } from './pages/ProfilPage';
import { AufgabenPage } from './features/tasks/AufgabenPage';
import { ProjektmanagerPage } from './features/projects/ProjektmanagerPage';
import { ProjectDetailPage } from './features/projects/ProjectDetailPage';
import { KampagnenPage } from './features/campaigns/KampagnenPage';
import { CampaignDetailPage } from './features/campaigns/CampaignDetailPage';
import { MeasureDetailPage } from './features/campaigns/MeasureDetailPage';
import { JahresplanPage } from './features/annual-plan/JahresplanPage';
import { MonthDetailPage } from './features/annual-plan/MonthDetailPage';

/**
 * Auth-Gate + Routing: lädt die Sitzung, zeigt dann entweder den Login
 * oder die App-Shell mit den gerouteten Seiten. Theme/Akzent werden global
 * vom AppearanceProvider angewendet.
 */
export function App(): React.JSX.Element {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ color: 'var(--text-2)' }}>Lädt …</span>
      </main>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="projekte" element={<ProjektePage />} />
        <Route path="projekte/projektmanager" element={<ProjektmanagerPage />} />
        <Route path="projekte/projektmanager/:projectId" element={<ProjectDetailPage />} />
        <Route path="projekte/kampagnen" element={<KampagnenPage />} />
        <Route path="projekte/kampagnen/:campaignId" element={<CampaignDetailPage />} />
        <Route path="projekte/kampagnen/:campaignId/massnahme/:measureId" element={<MeasureDetailPage />} />
        <Route path="projekte/jahresplan" element={<JahresplanPage />} />
        <Route path="projekte/jahresplan/:month" element={<MonthDetailPage />} />
        <Route path="projekte/:area" element={<ProjektePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profil" element={<ProfilPage />} />
        <Route path="profil/aufgaben" element={<AufgabenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
