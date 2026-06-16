/**
 * Produktions-Server für das Frontend (Railway).
 *
 * Liefert die gebaute SPA aus `dist/` aus UND proxyt `/api/*` an das Backend.
 * Dadurch laufen Browser-Requests immer über die Frontend-Domain → die
 * Auth-Cookies des Backends sind FIRST-PARTY und werden nicht als
 * Cross-Site-/Drittanbieter-Cookies blockiert (Ursache des Login-Rücksprungs:
 * `up.railway.app` ist ein Public-Suffix → Frontend- und Backend-Subdomain
 * gelten als verschiedene Sites).
 *
 * Env:
 *   PORT            Port (Railway setzt ihn; Default 8080)
 *   BACKEND_ORIGIN  Backend-Origin OHNE /api-Pfad,
 *                   z. B. https://g-hub-production.up.railway.app
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
// Ziel-Backend für den /api-Reverse-Proxy. Default = produktive Backend-URL,
// damit der Proxy auch ohne gesetzte Env-Var funktioniert (per BACKEND_ORIGIN
// überschreibbar, z. B. für eigene Domains).
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'https://g-hub-production.up.railway.app';
const distDir = path.join(__dirname, 'dist');

const app = express();

// /api → Backend (gleiche Origin aus Browser-Sicht → first-party Cookies).
if (BACKEND_ORIGIN) {
  app.use(
    createProxyMiddleware('/api', {
      target: BACKEND_ORIGIN,
      changeOrigin: true,
      xfwd: true,
      // Redirects (Google-OAuth) unverändert durchreichen.
      followRedirects: false,
    }),
  );
} else {
  console.warn('[frontend] BACKEND_ORIGIN nicht gesetzt — /api wird NICHT geproxyt.');
}

// Statische Assets mit Cache; index.html wird unten als SPA-Fallback geliefert.
app.use(express.static(distDir, { index: false, maxAge: '1h' }));

// SPA-Fallback: alle übrigen GET-Routen → index.html (Client-Routing).
// index.html NICHT cachen: sie referenziert die gehashten Assets. Sonst lädt
// (v. a. die iOS-Homescreen-PWA) nach einem Deploy alte HTML→alte CSS/JS und
// Änderungen erscheinen scheinbar nicht. Die gehashten Assets bleiben 1h gecacht.
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[frontend] läuft auf :${PORT} — /api → ${BACKEND_ORIGIN ?? '(kein Proxy)'}`,
  );
});
