# G-Hub — Fortschritt & nächste Schritte (Session-Übergabe)

<!-- ============================================================= -->
<!--  SESSION-UPDATE 2026-06-15 — ZUERST LESEN                      -->
<!-- ============================================================= -->

## 🟥 Session-Update 2026-06-15 (neueste Übergabe — hier starten)

Alles unten Genannte ist **committet und auf `main` gepusht** (Railway deployt
automatisch). Commits dieser Session (neueste zuerst):

| Commit | Inhalt |
| --- | --- |
| `9c27ebc` | fix(ui): mobile Bottom-Nav `position:fixed` (Versuch, **NICHT gelöst**, s. u.) |
| `82059d7` | fix(auth): OAuth-Redirect in Prod immer aus `FRONTEND_URL` |
| `63449b4` | fix(ui): Ladescreen nur nach Login (App-Intro) |
| `0b2782b` | fix(auth): Mobile-Login — alles same-origin (`/api`-Proxy) |
| `99a1a3a` | feat(search): globale Suche echt |
| `91d6611` | feat(design): 1:1-Animationen + Handy-Shell (Phasen 1–2) |
| `54394f9` | feat(assets): Schritt 8 — Asset-Bibliothek + Storage |
| `e0fcbe5` | fix(auth): Login-Rücksprung via Same-Origin-Proxy (Frontend `server.mjs`) |

### ✅ Erledigt & verifiziert
- **Login (Desktop + Handy)**: Ursache war Cross-Site-/Drittanbieter-Cookies
  (`up.railway.app` = Public-Suffix). Lösung: Frontend liefert `/api` selbst aus und
  **proxyt ans Backend** (`frontend/server.mjs`, express + http-proxy-middleware),
  `BASE_URL` fest auf `/api` (`frontend/src/lib/api.ts`), OAuth-Redirect in Prod aus
  `FRONTEND_URL` abgeleitet (`backend/src/auth/google.service.ts`). Verifiziert per curl:
  Proxy aktiv, `redirect_uri` = Frontend-Domain, State-Cookie first-party.
  **Login klappt jetzt auf Desktop UND Handy** (vom User bestätigt).
- **Ladescreen** erscheint nur noch als Intro **nach** dem Login (`App.tsx` Gating +
  `Splash` `onDone`). Kein Splash mehr vor dem Login.
- **Assets (Schritt 8)**: voll funktionsfähig lokal (MinIO), per curl getestet.
- **Design Phase 1–2**: CountUp, gestaffelte Reveals (IntersectionObserver), Splash-Tempo
  0.85, KI-Spark-Burst; mobile Liquid-Glass-Nav verkabelt (siehe Problem unten).
- **Globale Suche** echt (`backend/src/search/`, `SearchSheet`).

### 🔴 OFFENES PROBLEM (höchste Prio): Mobile Bottom-Nav wird NICHT angezeigt
**Symptom:** Nach dem Login am Handy ist **keine** Menüleiste (Bottom-Nav) sichtbar.

**Was bereits verifiziert ist (also NICHT die Ursache):**
- Markup ist im deployten JS-Bundle vorhanden (`shell-phone`, `nav-fab`, `nav-wrap`).
- CSS ist live korrekt: in `@media(max-width:860px)` gilt `.shell-phone{display:block}`,
  `.web-shell .nav{position:fixed;z-index:60}`, `.web-shell .ai-fab{position:fixed;z-index:61}`,
  `.web-fab{display:none}`, `.web-side{display:none}`.
- Deploy ist live (Asset-Hashes der ausgelieferten CSS/JS = lokaler Build).
- Trotz `position:fixed; z-index:60` am Viewport bleibt die Leiste unsichtbar.

**Relevante Dateien:**
- `frontend/src/app/AppShell.tsx` — rendert `.shell-phone > .nav (.nav-wrap mit 5 Slots) + .ai-fab`.
- `frontend/src/styles/shell.css` — Ein-/Ausblende-/Positions-Regeln (≤860px).
- `frontend/src/styles/styles.css` — Prototyp-`.nav`/`.nav-wrap`/`.nav-fab`/`.ai-fab` (byte-identisch).
- `frontend/src/styles/web.css` — `.web-shell{position:absolute;inset:0;display:grid;overflow:hidden}`,
  `.web-main{position:relative}`, `.web-ai{z-index:55}`.

**Hypothesen für die nächste Session (zu prüfen):**
1. **Media-Query matcht nicht** → Phone rendert evtl. Desktop-Layout. Test: Erscheint
   stattdessen die **Sidebar** (`.web-side`)? Welche `window.innerWidth`/`matchMedia('(max-width:860px)')`?
2. **Grid/Stacking/Overflow-Konflikt**: `.shell-phone` ist Grid-Item in `.web-shell`
   (display:grid, overflow:hidden); evtl. verdeckt die mobile Browser-UI die fixed-Leiste
   oder ein anderes Element liegt darüber.
3. **Theme**: im Dunkelmodus ist die Liquid-Glass-Leiste sehr dezent (translucent) — evtl.
   da, aber kaum sichtbar? (User-Theme klären.)
4. **JS-Fehler** beim Rendern des Nav-Teils (Konsole am Handy prüfen).

**Empfohlenes Vorgehen (WICHTIG):**
- Zuerst **echtes Mobile-Rendering ansehen** (Remote-Debugging: Chrome `chrome://inspect`
  oder Safari Web-Inspector am iPhone) → DOM + Computed-Styles von `.shell-phone`/`.nav`
  inspizieren. Ohne Sicht aufs Rendering ist es Blindflug.
- **Pragmatische Lösung statt Prototyp-`.nav`**: Die Prototyp-`.nav` ist für einen anderen
  Container (Handy-Frame) gebaut. Besser eine **eigene, dedizierte Mobile-Bottom-Nav-
  Komponente** mit eigenem, einfachem CSS schreiben (klar `position:fixed; left/right/bottom:0;
  z-index:hoch`; eigene Klassen, keine Abhängigkeit vom `.web-shell`-Grid/`overflow`), Optik
  danach an die Liquid-Glass-Vorgabe angleichen. Dann Nav-Collapse + KI-FAB daran hängen.
- Alternativ lokal einen **Dev-Auth-Bypass** (nur Entwicklung) bauen, um die App-Shell ohne
  Google-Login am Mobile-Viewport testen zu können.

### 🟡 Offene User-/Infra-Aktionen
- **Google-Console**: Redirect-URI `https://g-hub-frontend-production.up.railway.app/api/auth/google/callback`
  muss eingetragen sein (sonst `redirect_uri_mismatch`).
- **Assets-Storage-Provider** (Cloudflare R2 vs. AWS S3, §14) entscheiden + produktive
  `STORAGE_*`-Variablen in Railway setzen — sonst sind Assets in Prod nicht nutzbar
  (lokal läuft MinIO via docker-compose, Host-Ports 9002/9003).
- **Visuelles QA** Animationen (Mobile/iPad).

### 🟢 Offene Roadmap (Entwicklung)
- **Dashboard teil-echt**: Task-/Asset-Zähler echt; Marketing-KPIs (Reichweite/Engagement/
  Follower) + Analytics + Posts/Planer **blockiert durch Meta/Google** (Bauplan Phase 2/3).
- **News/Mitteilungen** an echtes Backend binden (neue Modelle nötig).
- **Design Phase 3** (iPad-Querformat `.ipad-land`) + **Phase 4** (Screen-Feinabgleich Doku Kap. 9).
  ⚠️ Gegen die bewusste Web-Shell-Architektur (§6.3) und nur compile-, nicht visuell verifizierbar.
- Später: KI real (Claude), BullMQ-Jobs, Meta/Google-Integrationen, Tests/Seeds/Audit/DSGVO.

### 🔧 Nützliche Verifikations-Snippets (curl, Prod)
```bash
# Frontend-Proxy aktiv? (JSON = ja, HTML = nein)
curl -s https://g-hub-frontend-production.up.railway.app/api/health
# OAuth-Redirect zeigt auf Frontend-Domain?
curl -sI https://g-hub-frontend-production.up.railway.app/api/auth/google/connect | grep -i location
# Live-Asset-Hashes (mit lokalem Build vergleichen → Deploy live?)
curl -s https://g-hub-frontend-production.up.railway.app/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.(css|js)'
```

---


> Diese Datei ist die **Übergabe für die nächste Session**. Sie beschreibt den aktuellen
> Stand, wie man lokal entwickelt/deployt, wichtige Stolpersteine und die konkreten
> nächsten Aufgaben. Vollständige Spezifikation: `../G-Hub – Bauplan für Claude Code.md`.

_Stand: Phase 0 + Phase-1-Schritte 1–7 lokal fertig (committet, **noch zu pushen
bzw. gepusht**). Zusätzlich: kompletter 1:1-Design-Rollout (Projekte-Hub, Analytics,
Planer, News, Sheets, KI-Assistent, Ladescreen/Logo) design-first mit Mock-Daten.
Phase 0 ist **live auf Railway**._

> **Hier weitermachen (nächste Session):** Phase 1, **Schritt 8 — Assets** (§4.7,
> Upload zu S3-kompatiblem Bucket; Provider offen, §14) als nächster Fachbereich.
> Siehe „Empfohlene Reihenfolge" (§6) — Schritte 1–7 sind erledigt. Danach die
> design-first-Bereiche (Analytics/Planer/News) sukzessive an echte Backends binden.

---

## 0. Schnellstart für die nächste Session

**Was ist passiert (zuletzt):**
- **Backend-Vertikalschnitte fertig** (Prisma + NestJS-Modul + Migration + shared-DTOs +
  `lib/api.ts` + UI, jeweils per curl getestet): Aufgaben, Projektmanager, Kampagnen,
  Jahresplan (+Seed), **Zeiterfassung** (Stempeluhr-State-Machine, `time-tracking`-Modul).
- **Kompletter 1:1-Design-Rollout (design-first, statische Daten)**: Ladescreen
  `<gerber-hub-loader>` (`public/gerberhub-loader.js`) + Logo (`public/gerber-hub-logo.svg`),
  Projekte-Hub, Analytics, Social-Media-Planer (+ Unterseiten + session-lokaler Store),
  News-Sektion, alle Sheets (Erstellen/Compose/Suche/Mitteilungen/Team/Assets/Aufgaben/
  Zeit/Post), KI-Assistent (Dock/FAB/Sheet, canned replies), Shell-Verkabelung
  (Erstellen/Suche/Alerts/KI). Overlay/Sheet-System: `app/OverlayContext.tsx` +
  `components/Sheet.tsx` + `features/sheets/registry.tsx`.
- Mock-Daten zentral in **`frontend/src/lib/mockData.ts`**. Die CSS ist **byte-identisch**
  zum Prototyp migriert (`frontend/src/styles/`), daher beim Portieren **keine neuen
  CSS-Regeln** nötig — nur Prototyp-`className`s + Inline-Styles exakt übernehmen.
- Alles auf `main` gepusht (Railway Auto-Deploy). Migrationen laufen beim Backend-Start.

**Wichtige Architektur-Hinweise:**
- Echte Daten kommen aus dem Backend über `lib/api.ts`; design-first-Bereiche nutzen
  `lib/mockData.ts`. Beim „Echt-machen" eines Bereichs: Mock durch API-Aufrufe ersetzen
  (Muster: wie `WorkTimeSheet` jetzt `lib/api.ts` nutzt statt `WORKTIME`).
- Neue Prototyp-Screens 1:1 portieren: Quelle unter
  `../Marketing-Hub - APP-SaaS/G-HubAPP (Marketing-Hub)/app/*.jsx`.
- Lokaler Login ist **nur Google-OAuth** → UI lässt sich lokal schwer einloggen;
  Verifikation v. a. über `typecheck`/`build`/`lint` + curl gegen die API.

**Konkret als Nächstes (Optionen):**
1. **Schritt 8 — Assets (§4.7):** braucht Storage-Entscheidung (Cloudflare R2 vs. AWS S3,
   §14) — **vorher klären**. Modell `Asset`, presigned-Upload-Endpunkte, `AssetsSheet`/
   Asset-Bibliothek an echtes Backend binden.
2. **Design-first verdrahten:** Analytics / Planer / News / Suche / Mitteilungen an echte
   Backends binden (jeweils Prisma + Modul + API + UI-Umstellung).
3. **Dashboard-Aggregate** (KPIs/Fokus/Posts) echt machen (Kampagnen sind schon echt).

---

## 1. Wo wir stehen

### ✅ Fertig (Phase 0 — Fundament, live)

- **Monorepo** (npm workspaces): `frontend`, `backend`, `packages/shared`
- **Backend** (NestJS + Prisma + PostgreSQL): Module `health`, `auth`, `prisma`
  - Entitäten: `Workspace`, `User`, `Membership`, `AppearancePref` (Prisma)
  - **Auth**: `POST /api/auth/register|login|refresh|logout`, `GET /api/auth/me`,
    Google-OAuth `GET /api/auth/google/connect|callback`
  - argon2-Passwort-Hashing, JWT in **httpOnly-Cookies** (Access + Refresh)
- **Frontend** (Vite + React + TS): Appearance-System (`lib/appearance.ts`),
  Prototyp-CSS (`styles/`), **Login-UI nur via Google** (`auth/AuthScreen.tsx`),
  Auth-Gate (`App.tsx`), einfache eingeloggte Startansicht (`auth/AuthedHome.tsx`)
- **Deployment**: GitHub `DerRobin97/g-hub` → Railway Auto-Deploy
  - 4 Services: **backend**, **frontend**, **Postgres**, **Redis**

### ✅ Fertig (Phase 1 — Schritte 1–7, lokal committet)

- **Schritt 1 — App-Shell + Routing** (`b9aecd7`): React-Router, Desktop-Sidebar/Topbar
  (`app/AppShell.tsx`) + responsive Bottom-Nav, Layout-Varianten full/rail/dual,
  `AppearanceProvider` an `GET/PUT /api/me/appearance` gebunden (neues Backend-`me`-Modul),
  Icon nach TS migriert. Platzhalter-Seiten Projekte/Analytics/Profil.
- **Schritt 2 — Dashboard-Grundgerüst** (`dac145c`): Layout aus `dashboard.jsx` mit
  Platzhalter-Daten (KPI-Leiste, Fokus-Karte, Kampagnen, geplante Posts, Aufgaben/Team,
  Asset-Shortcut); Präsentations-Primitive in `components/ui.tsx` (Delta/Spark/Ring/…).
- **Schritt 3 — Aufgaben** (`7b182e2`): `Task` + `TaskAssignee` + Checkliste (§4.6),
  `tasks`-Modul `GET/POST/GET:id/PATCH/DELETE /api/tasks` (workspace-gescopt),
  „Meine Aufgaben"-UI (`features/tasks/`), Route `/profil/aufgaben`.
- **Schritt 4 — Projektmanager** (`b6a30bf`): `Project`/`Phase`/`ProjectTask` (§4.5),
  `projects`-Modul (Projekt-/Phasen-/Task-CRUD + `GET /api/projects/members`),
  Übersicht + Projekt-Detail (Gruppierung, Abhaken, Phase/Aufgabe anlegen) +
  Task-Detail-Modal (`features/projects/`), Routen `/projekte/projektmanager[/:projectId]`.
- **Schritt 5 — Kampagnen** (§4.4): `Campaign`/`Measure`/`Discount` (mit `workspaceId`),
  Enums `CampaignStatus`/`MeasureType`/`DiscountType`, Migration `add_campaigns`.
  `campaigns`-Modul (Kampagnen-CRUD + `…/measures`, `measures/:id` + `…/discounts`,
  `discounts/:id` — alles `JwtAuthGuard` + workspace-gescopt). Frontend `features/campaigns/`:
  Übersicht (Liste/Baum + Budget-Ring) → Maßnahmen-Detail → Rabatt-Detail, Create-Modals,
  Routen `/projekte/kampagnen[/:campaignId[/massnahme/:measureId]]`. Dashboard-„Aktive
  Kampagnen" + Shortcut auf echte Daten umgestellt.
- **Schritt 6 — Jahresplan** (§4.8): `PlanMonth`/`PlanTheme`/`PlanLink` (mit `workspaceId`),
  Enums `PlanCategory`/`PlanLinkDirection`, Migration `add_plan`. `plan`-Modul (`GET /plan/:year`,
  `POST /plan/:year/seed`, `PATCH /plan/:year/months/:m`, `…/themes`, `…/links`,
  `plan-themes/:id`, `plan-links/:id` — `JwtAuthGuard` + workspace-gescopt). **Seed aus
  `JP_MONTHS`** (12 Monate, server-seitig `plan.seed-data.ts`, idempotent, workspace-gescopt).
  Frontend `features/annual-plan/`: Übersicht (Monats-Timeline, „Aus Vorlage befüllen") →
  Monats-Detail (Bereichs-Gruppen, Kanäle, Verzahnung) im 1:1-Prototyp-Design
  (`jahresplan.css`), Themen-CRUD via Modal, Routen `/projekte/jahresplan[/:month]`.
- **Schritt 7 — Zeiterfassung** (§4.11): `TimeEntry`/`AbsenceBalance`/`WorkSettings`
  (Enum `TimeStatus`), Migration `add_time_tracking`. `time-tracking`-Modul mit
  Stempeluhr-State-Machine (`GET /time/today|month`, `POST /time/clock-in|clock-out|
  break/start|break/end` — `JwtAuthGuard`, user-/workspace-gescopt). Frontend: API in
  `lib/api.ts`, `WorkTimeSheet` an echtes Backend gebunden (Live-Timer aus Server-Segment).
- **Design-Rollout (design-first, statische Daten):** Ladescreen `<gerber-hub-loader>` +
  Logo, Projekte-Hub, Analytics, Social-Media-Planer (+ Unterseiten), News-Sektion, alle
  Sheets (Erstellen/Compose/Suche/Mitteilungen/Team/Assets/Aufgaben/Zeit/Post), KI-Assistent
  (Dock/FAB/Sheet), Shell-Verkabelung. CSS 1:1 (byte-identisch migriert); Mock-Daten in
  `frontend/src/lib/mockData.ts`.

> **Alle Schritte sind durch Typecheck + Build + Lint gegangen; die CRUD-/State-APIs
> (Tasks, Projects, Campaigns, Plan, Time) wurden lokal per curl verifiziert (inkl.
> Mandantentrennung, Seed-Idempotenz, Stempeluhr-Übergänge + Kaskaden-Löschung).**

### ⏳ Noch nicht gebaut

- **Assets** (§4.7) ← **als Nächstes** (S3-kompatibler Bucket, Provider offen §14)
- Design-first-Bereiche an echte Backends binden: Analytics, Planer, News, Suche, Mitteilungen
- Dashboard-KPIs/Fokus-Karte/Posts auf echte Aggregate umstellen (Kampagnen sind echt)
- KI real (Claude-Anbindung statt canned replies)
- BullMQ-Jobs (Redis ist bereitgestellt, aber noch nicht verdrahtet)
- Tests, Seeds, Audit-Log, DSGVO

---

## 2. Live-URLs & Railway

| Service     | URL                                                |
| ----------- | -------------------------------------------------- |
| Frontend    | https://g-hub-frontend-production.up.railway.app   |
| Backend API | https://g-hub-production.up.railway.app/api        |
| Healthcheck | https://g-hub-production.up.railway.app/api/health |

- **Auto-Deploy**: jeder `git push` auf `main` baut beide Services neu.
- **Backend-Variablen** in Railway gesetzt: `NODE_ENV, DATABASE_URL (${{Postgres.DATABASE_URL}}),
REDIS_URL (${{Redis.REDIS_URL}}), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TTL,
JWT_REFRESH_TTL, TOKEN_ENCRYPTION_KEY, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
GOOGLE_LOGIN_REDIRECT_URI`.
- **Frontend-Variable**: `VITE_API_URL=https://g-hub-production.up.railway.app/api`
  (⚠️ wird zur **Build-Zeit** eingebacken → nach Änderung Redeploy nötig).
- Detaillierte Deploy-Schritte: siehe `DEPLOY.md`.

---

## 3. Lokal entwickeln (Quickstart)

```bash
cd "…/G-Hub - APP-SaaS/g-hub"
npm install                       # alle Workspaces
cp .env.example .env              # einmalig; Werte sind lokal schon gefüllt
docker compose up -d              # Postgres :5434, Redis :6379

# Shared zuerst bauen (wird von beiden gebraucht)
npm run build:shared

# Backend (Terminal 1)
cd backend
npm run prisma:generate
npm run prisma:migrate            # legt/aktualisiert Tabellen (lokal)
npm run dev                       # NestJS auf http://localhost:3000/api

# Frontend (Terminal 2)
cd frontend
npm run dev                       # Vite auf http://localhost:5173 (Proxy /api → :3000)
```

Prüfen: `curl http://localhost:3000/api/health` → `{"status":"ok","db":"up",...}`

**Root-Skripte:** `npm run lint`, `npm run format`, `npm run typecheck`, `npm run build`.

---

## 4. Wichtige Stolpersteine (gelernt)

1. **Railway-Port = 8080.** App muss auf `process.env.PORT` und `0.0.0.0` lauschen
   (siehe `backend/src/main.ts`). Dockerfiles haben `EXPOSE 8080`. Bei „502 Application
   failed to respond" zuerst den Ziel-Port der Domain prüfen.
2. **`@g-hub/shared` ist CommonJS** (für Nest). Frontend/Vite liest es über
   `vite.config.ts` (`optimizeDeps.include` + `commonjsOptions`). Nicht auf ESM umstellen,
   ohne beide Seiten anzupassen.
3. **Cookies cross-domain**: in Produktion `SameSite=None; Secure` (Frontend- ≠ Backend-
   Domain). Lokal `Lax` (gleiche Origin via Vite-Proxy). Siehe `auth/token.service.ts`.
4. **CORS**: Backend erlaubt nur `FRONTEND_URL` mit `credentials: true` (`main.ts`).
   Bei neuer Frontend-Domain → `FRONTEND_URL` am Backend anpassen.
5. **Migrationen** laufen beim Backend-Start automatisch (`prisma migrate deploy` im
   Dockerfile-CMD). Neue Migration lokal erzeugen und **committen**.
   - Vor `prisma migrate dev` muss **Docker Desktop laufen** (`open -a Docker`) und die DB
     hochgefahren sein (`docker compose up -d postgres`).
   - Prisma findet `DATABASE_URL` nicht automatisch (sie liegt in `g-hub/.env`, nicht in
     `backend/`). Daher im `backend/`-Ordner vorher laden, z. B.:
     `set -a && . ../.env && set +a && npx prisma migrate dev --name <name>`.
   - Bisherige Migrationen: `…_init_auth_workspace`, `…_add_tasks`, `…_add_projects`,
     `…_add_campaigns`, `…_add_plan`, `…_add_time_tracking`.
6. **Google-Login** ist die einzige Anmeldeoption. In der Google Console müssen
   eingetragen sein:
   - Redirect-URI: `https://g-hub-production.up.railway.app/api/auth/google/callback`
   - JS-Origin: `https://g-hub-frontend-production.up.railway.app`
   - (lokal: `http://localhost:3000/api/auth/google/callback`)

---

## 5. Muster: einen neuen Fachbereich hinzufügen

Beispiel „Aufgaben" (Task) — gilt analog für Kampagnen, Projekte, Jahresplan, …:

1. **Prisma-Modell** in `backend/prisma/schema.prisma` ergänzen (mit `workspaceId` für
   Mandantentrennung!). Felder aus Bauplan §4 übernehmen.
2. `npm run prisma:migrate -- --name add_tasks` (lokal) → Migration committen.
3. **Nest-Modul** `backend/src/tasks/` (Controller + Service + DTOs), per `JwtAuthGuard`
   geschützt, immer auf `workspaceId` des eingeloggten Users scopen.
4. In `app.module.ts` registrieren.
5. **Geteilte Typen** (Enums/DTOs) in `packages/shared/src/index.ts` ergänzen.
6. **Frontend**: API-Funktionen in `lib/api.ts`, Feature-Ordner unter
   `frontend/src/features/<bereich>/`, UI im Gerber-Design (CSS-Variablen).
7. Lokal testen (curl + Browser), dann `git push` → Railway deployt automatisch.

---

## 6. Empfohlene Reihenfolge (Phase 1)

> Ziel von Phase 1: voll nutzbares internes Tool mit echten Daten (ohne externe APIs).

1. ~~**App-Shell + Routing**~~ ✅ erledigt (`b9aecd7`).
2. ~~**Dashboard-Grundgerüst** (`dashboard.jsx`)~~ ✅ erledigt (`dac145c`) — noch Platzhalter-Daten.
3. ~~**Aufgaben** (`Task`, §4.6)~~ ✅ erledigt (`7b182e2`).
4. ~~**Projektmanager** (`Project`/`Phase`/`ProjectTask` — §4.5)~~ ✅ erledigt (`b6a30bf`).
5. ~~**Kampagnen** (`Campaign`/`Measure`/`Discount` — §4.4)~~ ✅ erledigt: Prisma-Modelle
   (mit `workspaceId`) + Migration `add_campaigns`, `campaigns`-Modul (CRUD, `JwtAuthGuard`,
   workspace-gescopt), shared-DTOs/Enums, `lib/api.ts`, Feature-UI unter `features/campaigns/`,
   Routen unter `/projekte/kampagnen`. Dashboard-„Aktive Kampagnen" + Shortcut auf echte Daten.
6. ~~**Jahresplan** (`PlanMonth`/`PlanTheme`/`PlanLink` — §4.8) + **Seed** aus `JP_MONTHS`~~ ✅ erledigt:
   Prisma-Modelle (mit `workspaceId`) + Migration `add_plan`, `plan`-Modul (CRUD, `JwtAuthGuard`,
   workspace-gescopt) inkl. idempotentem Seed `POST /plan/:year/seed`, shared-DTOs/Enums, `lib/api.ts`,
   Feature-UI unter `features/annual-plan/` (1:1-Prototyp-Design), Routen `/projekte/jahresplan[/:month]`.
7. ~~**Zeiterfassung** (`TimeEntry`/`AbsenceBalance`/`WorkSettings` — §4.11)~~ ✅ erledigt:
   Migration `add_time_tracking`, `time-tracking`-Modul (Stempeluhr-State-Machine, `JwtAuthGuard`),
   shared-DTOs, `lib/api.ts`, `WorkTimeSheet` an echtes Backend gebunden (Live-Timer).
8. **← HIER WEITER: Assets** (§4.7) — Upload zu S3-kompatiblem Bucket (Provider noch offen, §14).
9. **Profil**, **Suche**, **Mitteilungen** auf echte Daten; design-first-Bereiche (Analytics/Planer/News) verdrahten.

Danach Phase 2 (Social-Planer + Meta), Phase 3 (Analytics + Google), Phase 4 (KI),
Phase 5 (Härtung). Siehe Bauplan §12.

---

## 7. Offene Entscheidungen (Bauplan §14)

- Asset-Storage-Provider (Cloudflare R2 vs. AWS S3).
- Meta/Google-Integrationen: App-Review & Developer-Token beantragen.
- KI-Budget/Anbieter final (Claude angenommen).
- Rollen-Matrix final (wer darf freigeben/posten/Budget/Integration).
- Eigene Domains für Frontend/Backend auf Railway.

---

## 8. Repo-Karte (Kurz)

```
g-hub/
  backend/   NestJS + Prisma (src/auth, src/prisma, src/health, src/common)
  frontend/  Vite + React (src/auth, src/lib, src/styles)
  packages/shared/  geteilte Enums/Typen (CommonJS-Build)
  Dockerfile.backend / Dockerfile.frontend  (Build-Kontext = Repo-Root)
  docker-compose.yml  (lokal: Postgres :5434, Redis :6379)
  DEPLOY.md  (Railway-Schritte)  ·  NEXT_STEPS.md (diese Datei)
```
