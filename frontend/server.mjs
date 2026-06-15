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
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN;
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
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[frontend] läuft auf :${PORT} — /api → ${BACKEND_ORIGIN ?? '(kein Proxy)'}`,
  );
});
