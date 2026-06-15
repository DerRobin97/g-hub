import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { AppShell } from './app/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ProjektePage } from './pages/ProjektePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilPage } from './pages/ProfilPage';

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
        <Route path="projekte/:area" element={<ProjektePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profil" element={<ProfilPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
