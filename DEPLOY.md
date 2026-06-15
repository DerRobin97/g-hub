# Deployment — GitHub → Railway

G-Hub wird als **Monorepo** mit zwei Diensten betrieben (backend + frontend), dazu
**PostgreSQL** und **Redis** als Railway-Plugins. Build erfolgt über die beiden
Dockerfiles im Repo-Root (`Dockerfile.backend`, `Dockerfile.frontend`).

> Beide Images sind lokal verifiziert (Backend: Health 200 + DB-Migration; Frontend: SPA-Serve).

---

## 0. Voraussetzungen

- GitHub-Account + leeres Repo (z. B. `g-hub`)
- Railway-Account (https://railway.app)
- Railway CLI ist lokal installiert (`railway --version`)

Schritte mit 🔒 kann **nur Robin** ausführen (Anmeldung/Secrets) — nicht der Assistent.

---

## 1. Code auf GitHub bringen

Das Repo ist bereits lokal initialisiert (erster Commit vorhanden). Du musst nur noch
das GitHub-Remote anlegen und pushen:

```bash
cd "…/G-Hub - APP-SaaS/g-hub"
# 🔒 Repo auf github.com anlegen (leer, ohne README), dann:
git remote add origin https://github.com/<DEIN-USER>/g-hub.git
git branch -M main
git push -u origin main
```

---

## 2. Railway-Projekt + Plugins

1. 🔒 Auf railway.app einloggen → **New Project** → **Deploy from GitHub repo** → `g-hub` wählen.
2. **PostgreSQL** hinzufügen: Projekt → **+ New** → **Database** → **PostgreSQL**.
3. **Redis** hinzufügen: **+ New** → **Database** → **Redis**.

Railway stellt automatisch `DATABASE_URL` (Postgres) und `REDIS_URL` (Redis) als
Variablen bereit, die per Referenz in die Dienste eingebunden werden.

---

## 3. Service „backend"

1. Aus dem Repo einen Service erstellen (oder den vorhandenen umbenennen zu `backend`).
2. **Settings → Build:**
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile.backend`
   - **Root Directory:** `/` (Repo-Root — wichtig für den `shared`-Build!)
3. **Settings → Deploy → Health Check Path:** `/api/health`
4. **Variables (🔒 Werte eintragen):**

   | Variable                    | Wert                                                        |
   | --------------------------- | ----------------------------------------------------------- |
   | `NODE_ENV`                  | `production`                                                |
   | `DATABASE_URL`              | Referenz auf Postgres-Plugin (`${{Postgres.DATABASE_URL}}`) |
   | `REDIS_URL`                 | Referenz auf Redis-Plugin (`${{Redis.REDIS_URL}}`)          |
   | `JWT_ACCESS_SECRET`         | langer Zufallswert                                          |
   | `JWT_REFRESH_SECRET`        | anderer langer Zufallswert                                  |
   | `JWT_ACCESS_TTL`            | `900`                                                       |
   | `JWT_REFRESH_TTL`           | `2592000`                                                   |
   | `TOKEN_ENCRYPTION_KEY`      | 32-Byte-Hex (für spätere Integrationen)                     |
   | `FRONTEND_URL`              | öffentliche URL des Frontend-Service (siehe Schritt 4)      |
   | `GOOGLE_CLIENT_ID`          | deine Google-Client-ID                                      |
   | `GOOGLE_CLIENT_SECRET`      | dein Google-Secret                                          |
   | `GOOGLE_LOGIN_REDIRECT_URI` | `https://<backend-domain>/api/auth/google/callback`         |
   | `ANTHROPIC_API_KEY`         | (später, für KI)                                            |

   Zufallswerte erzeugen: `openssl rand -hex 32`

5. **Networking → Generate Domain** → ergibt z. B. `https://g-hub-backend-production.up.railway.app`.

---

## 4. Service „frontend"

1. Zweiten Service aus demselben Repo erstellen.
2. **Settings → Build:**
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile.frontend`
   - **Root Directory:** `/`
3. **Variables (🔒):**

   | Variable       | Wert                           |
   | -------------- | ------------------------------ |
   | `VITE_API_URL` | `https://<backend-domain>/api` |

   > Achtung: `VITE_API_URL` wird zur **Build-Zeit** eingebacken. Nach Änderung neu deployen.

4. **Networking → Generate Domain** → ergibt die Frontend-URL.
5. Diese Frontend-URL als `FRONTEND_URL` beim **backend** eintragen (Schritt 3) und backend neu deployen.

---

## 5. Google-Console nachziehen (🔒)

In der Google Cloud Console → OAuth-Client-ID → **Autorisierte Weiterleitungs-URIs** ergänzen:

```
https://<backend-domain>/api/auth/google/callback
```

Und **Autorisierte JavaScript-Quellen**: die Frontend-Domain.

---

## 6. Deploy-Reihenfolge (Abhängigkeiten)

1. Postgres + Redis bereit
2. backend deployen (zieht `DATABASE_URL`, migriert automatisch via `prisma migrate deploy`)
3. frontend deployen (mit `VITE_API_URL` = Backend-URL)
4. `FRONTEND_URL` am backend setzen → backend redeploy (für CORS + Cookies)

---

## 7. Smoke-Test nach Deploy

```bash
curl https://<backend-domain>/api/health          # → {"status":"ok","db":"up",…}
# Frontend im Browser öffnen → Theme-Umschalter + Backend-Status sichtbar
```

---

## Hinweise

- **Cookies:** In Produktion `SameSite=None; Secure` (Frontend ≠ Backend-Domain). Beide
  Dienste müssen über **HTTPS** laufen (Railway-Domains erfüllen das).
- **Migrationen:** laufen beim Backend-Start automatisch. Neue Migrationen lokal mit
  `npm run prisma:migrate --workspace @g-hub/backend -- --name <name>` erstellen und committen.
- **Alternative ohne GitHub:** `railway up` aus dem jeweiligen Service-Kontext (CLI-Direktupload).
