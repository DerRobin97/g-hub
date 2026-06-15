import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { AppShell } from './app/AppShell';
import { Splash } from './components/Splash';
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
import { PlanerProvider } from './features/planer/store';
import { PlanerScreen } from './features/planer/PlanerScreen';
import { PlanerPostPage } from './features/planer/PlanerPostPage';
import { PlanerFreigabePage } from './features/planer/PlanerFreigabePage';
import { PlanerTagPage } from './features/planer/PlanerTagPage';
import { OverlayProvider } from './app/OverlayContext';
import { SHEET_REGISTRY } from './features/sheets/registry';

/**
 * Auth-Gate + Routing: lädt die Sitzung, zeigt dann entweder den Login
 * oder die App-Shell mit den gerouteten Seiten. Theme/Akzent werden global
 * vom AppearanceProvider angewendet.
 */
export function App(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  // Stille Sitzungsprüfung beim Start (kein Ladescreen) — verhindert den
  // unerwünschten Splash VOR dem Login.
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  // Nicht eingeloggt → direkt zum Login, ohne Ladescreen.
  if (!user) return <AuthScreen />;

  // Eingeloggt → Ladescreen einmal als App-Intro, dann die App aufdecken.
  if (!introDone) return <Splash onDone={finishIntro} />;

  return (
    <PlanerProvider>
      <OverlayProvider registry={SHEET_REGISTRY}>
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
          <Route path="projekte/planer" element={<PlanerScreen />} />
          <Route path="projekte/planer/post/:postId" element={<PlanerPostPage />} />
          <Route path="projekte/planer/freigabe" element={<PlanerFreigabePage />} />
          <Route path="projekte/planer/tag/:day" element={<PlanerTagPage />} />
          <Route path="projekte/:area" element={<ProjektePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="profil/aufgaben" element={<AufgabenPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </OverlayProvider>
    </PlanerProvider>
  );
}
