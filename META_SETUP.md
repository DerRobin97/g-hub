# Meta API — Einrichtungsanleitung (Instagram + Facebook)

> Ziel: G-Hub soll **Beiträge auf Instagram & Facebook veröffentlichen** (geplant, automatisch)
> und **Insights** (Reichweite, Engagement) abrufen. Diese Anleitung beschreibt, was du in der
> **Meta for Developers**-Console einrichtest, damit der Server-Code (Phase 2) das nutzen kann.
> Referenz im Bauplan: §8.1.

Schritte mit 🔒 kann **nur du** ausführen (Anmeldung/Secrets) — nicht der Assistent.
Die echten Werte (App-Secret, Tokens) kommen **nur** in `.env` bzw. Railway-Variablen, nie in den Code/Chat.

---

## ✅ Bereits vorbereitet (Stand 2026-06-15)

Folgendes hat Robin in der Meta-Console schon eingerichtet — die nächste Session muss
das **nicht** erneut machen:

- [x] **Meta-App angelegt** (Typ Business)
- [x] **Use Cases gewählt:** „Alles auf deiner Seite verwalten" (Pages API, Facebook)
      **und** „Messaging und Content auf Instagram verwalten" (Instagram Content/Insights)
- [x] **OAuth-Redirect-URIs** eingetragen (beide):
      `http://localhost:3000/api/integrations/meta/callback` +
      `https://g-hub-production.up.railway.app/api/integrations/meta/callback`

**Noch offen / zu prüfen:**

- [ ] **App-ID + App-Secret** in `g-hub/.env` (`META_APP_ID`, `META_APP_SECRET`) — und später in Railway
- [ ] **Instagram-Konto** auf **Business/Creator** + mit der **Facebook-Seite verknüpft** (Voraussetzung §0)
- [ ] **App Review** für Advanced Access (erst für echten Produktivbetrieb nötig, §7)

> Der eigentliche **Connect-/Posting-Code** wird in **Phase 2** gebaut (Modul `integrations`,
> BullMQ-Jobs). Bis dahin ist Meta „geparkt" — Vorbereitung steht.

---

## 0. Wichtige Voraussetzungen (zuerst klären!)

Meta-Posting funktioniert **nur** mit dieser Kette:

1. Ein **Facebook-Konto** (persönlich, zum Verwalten).
2. Eine **Facebook-Seite** (Page) für Gerber Fachhandel.
3. Ein **Instagram-Konto vom Typ „Business" oder „Creator"** — **kein** privates Konto.
4. Das **Instagram-Konto ist mit der Facebook-Seite verknüpft** (in den Seiten-Einstellungen
   bzw. Meta Business Suite → „Verknüpfte Konten").
5. Idealerweise ein **Meta Business Portfolio** (business.facebook.com), das Seite + IG bündelt.

> Ohne Business-/Creator-IG-Konto + verknüpfte Seite ist **kein** automatisches Posten möglich.
> Bilder/Videos müssen außerdem unter einer **öffentlich erreichbaren URL** liegen (unser
> Asset-Bucket, Phase 1/2) — Instagram lädt das Medium selbst von dieser URL.

---

## 1. Meta-App anlegen

1. 🔒 Gehe zu **https://developers.facebook.com** → oben **My Apps** → **Create App**.
2. **Use case / App-Typ:** „**Other**" → **Business**.
3. **App-Name:** `G-Hub` (oder `Gerber Marketing-Hub`), Kontakt-E-Mail eintragen.
4. **Business Portfolio:** dein Gerber-Business-Portfolio auswählen (falls vorhanden).
5. App erstellen.

Nach dem Erstellen findest du **App-ID** und **App-Secret** unter
**App-Einstellungen → Grundlegendes (Basic)**.

---

## 2. Produkte hinzufügen

Im App-Dashboard links **„Add Product"** → folgende hinzufügen:

- **Facebook Login** (für den OAuth-Flow / Seiten-Zugriff)
- **Instagram** → „**Instagram Graph API**" bzw. „Instagram API with Instagram Login"
  (für Veröffentlichen + Insights)

---

## 3. Facebook Login konfigurieren

**Facebook Login → Einstellungen (Settings):**

- **Gültige OAuth-Redirect-URIs** (beide eintragen):
  ```
  http://localhost:3000/api/integrations/meta/callback
  https://g-hub-production.up.railway.app/api/integrations/meta/callback
  ```
- **Client-OAuth-Login:** an
- **Web-OAuth-Login:** an

**App-Domains** (App-Einstellungen → Basic):

```
localhost
g-hub-production.up.railway.app
```

Und unter **„Website"** die Frontend-/Backend-URL hinterlegen.

---

## 4. Benötigte Berechtigungen (Permissions / Scopes)

Diese Scopes fragt der OAuth-Flow später an:

| Scope                       | Wofür                                |
| --------------------------- | ------------------------------------ |
| `pages_show_list`           | verbundene Facebook-Seiten auflisten |
| `pages_read_engagement`     | Seiten-Inhalte/Engagement lesen      |
| `pages_manage_posts`        | Beiträge auf der FB-Seite erstellen  |
| `instagram_basic`           | IG-Konto + Basisdaten lesen          |
| `instagram_content_publish` | **IG-Beiträge veröffentlichen**      |
| `business_management`       | Business-Assets verwalten            |
| `read_insights`             | Reichweite/Engagement-Insights lesen |

> **Standard vs. Advanced Access:** Im **Entwicklungsmodus** funktionieren diese Scopes
> **nur für Personen mit App-Rolle** (Admin/Developer/Tester). Für den Produktiveinsatz mit
> echten Kunden brauchst du **Advanced Access** → **App Review** (siehe §7).

---

## 5. Tokens & IDs (Ablauf, den der Server später macht)

Damit du das Konzept kennst — der Code (Phase 2) erledigt das automatisch:

1. **OAuth-Login** → Nutzer-Access-Token (kurzlebig, ~1 h).
2. **In Long-Lived-Token tauschen** (~60 Tage) via App-ID/Secret.
3. **Seiten-Token holen**: `GET /me/accounts` → liefert pro Seite ein **Page-Access-Token**
   (mit Long-Lived-User-Token sind Page-Tokens praktisch dauerhaft gültig).
4. **IG-Business-Account-ID holen**: `GET /{page-id}?fields=instagram_business_account`.
5. **Posten (Instagram)**:
   - `POST /{ig-user-id}/media` mit `image_url`/`video_url` + `caption` → **Container-ID**
   - `POST /{ig-user-id}/media_publish` mit der Container-ID → veröffentlicht
6. **Posten (Facebook-Seite)**: `POST /{page-id}/photos` bzw. `/feed`.
7. **Insights**: `GET /{ig-user-id}/insights` bzw. `/{page-id}/insights`.

Tokens werden **verschlüsselt** in der DB gespeichert (`SocialAccount`, Bauplan §4.2),
nie im Frontend.

---

## 6. Webhooks (optional, später — für Kommentare/Mentions)

Wenn wir Echtzeit-Benachrichtigungen (neue Kommentare) wollen:

- **Produkt „Webhooks"** hinzufügen → Objekt **Instagram** / **Page** abonnieren.
- **Callback-URL:** `https://g-hub-production.up.railway.app/api/integrations/meta/webhook`
- **Verify-Token:** ein selbst gewählter String — derselbe Wert kommt in
  `META_WEBHOOK_VERIFY_TOKEN` (siehe §8). Meta schickt diesen beim Einrichten zur Prüfung.

(Kann zunächst übersprungen werden — Posten + Insights gehen ohne Webhooks.)

---

## 7. App Review (für den Produktivbetrieb)

Für **Advanced Access** der Posting-/Insights-Scopes brauchst du App Review:

1. **Datenschutzerklärung-URL** und **Nutzungsbedingungen-URL** hinterlegen (App Basic).
2. App von **Entwicklungsmodus → Live** schalten (sobald bereit).
3. Pro Permission ein **Screencast + Begründung** einreichen, der den Use Case zeigt
   (z. B. „App plant und veröffentlicht Beiträge für die eigene Unternehmensseite").
4. **Business-Verifizierung** des Portfolios kann nötig sein.

> Vorlaufzeit einplanen — Review dauert. **Für Tests** reicht der Entwicklungsmodus mit
> dir selbst als Admin/Tester (dann brauchst du noch keinen Review).

---

## 8. Was in `.env` / Railway kommt

In `g-hub/.env` (lokal) bzw. **Railway → backend → Variables**:

```
META_APP_ID=deine-app-id
META_APP_SECRET=dein-app-secret
META_REDIRECT_URI=https://g-hub-production.up.railway.app/api/integrations/meta/callback
META_WEBHOOK_VERIFY_TOKEN=ein-selbst-gewaehlter-zufallsstring
```

- Lokal die `localhost`-Redirect-URI verwenden, in Railway die Produktiv-URL.
- `META_APP_SECRET` ist geheim → nur in `.env`/Railway, niemals committen oder in den Chat.
- `META_WEBHOOK_VERIFY_TOKEN` frei wählbar (z. B. `openssl rand -hex 16`), muss in Meta
  und in der Env **identisch** sein.

---

## 9. Checkliste (zum Abhaken)

- [ ] Facebook-Seite für Gerber existiert
- [ ] Instagram-Konto auf **Business/Creator** umgestellt
- [ ] IG-Konto mit der Facebook-Seite verknüpft
- [ ] Meta-App (Typ Business) erstellt → **App-ID + Secret** notiert
- [ ] Produkte **Facebook Login** + **Instagram Graph API** hinzugefügt
- [ ] OAuth-Redirect-URIs (localhost + Railway) eingetragen
- [ ] App-Domains gesetzt
- [ ] `META_APP_ID` / `META_APP_SECRET` in `.env` und Railway gesetzt
- [ ] (später) App Review für Advanced Access eingereicht

---

## 10. Was der Assistent später baut (Phase 2)

- `integrations`-Modul: `GET /api/integrations/meta/connect` → OAuth → `callback`,
  Tokens verschlüsselt als `SocialAccount` speichern, Token-Refresh-Job.
- Posting-Job (BullMQ/Redis) zur `scheduled_at`-Zeit → IG/FB veröffentlichen,
  `external_post_id` zurückschreiben.
- Insights-Sync-Job → `MetricSnapshot` (für Analytics + Planer-„Insights").

Sobald **App-ID + Secret** in `.env`/Railway stehen und die Voraussetzungen (§0) erfüllt
sind, kann der Connect-Flow gebaut und getestet werden.
