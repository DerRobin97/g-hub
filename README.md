# G-Hub — Monorepo

Produktive SaaS-Variante des Gerber Marketing-Hub. Aus dem klickbaren React-Prototyp
(`../Marketing-Hub - APP-SaaS/G-HubAPP (Marketing-Hub)/`) wird eine echte Web-App.

> Vollständige Spezifikation: `../G-Hub – Bauplan für Claude Code.md`

## Struktur

```
g-hub/
  frontend/          React + Vite + TypeScript (SPA)
  backend/           NestJS + Prisma + PostgreSQL (REST API)
  packages/shared/   geteilte TypeScript-Typen, DTOs, Zod-Schemas
```

Verwaltet als **npm workspaces** (kein pnpm nötig).

## Voraussetzungen

- Node.js ≥ 20 (siehe `.nvmrc`)
- npm ≥ 10
- Docker (für lokale PostgreSQL + Redis) — in späterem Schritt

## Setup

```bash
npm install            # installiert alle Workspaces
cp .env.example .env   # Env-Variablen befüllen
```

## Skripte (Root)

| Befehl              | Zweck                           |
| ------------------- | ------------------------------- |
| `npm run build`     | alle Workspaces bauen           |
| `npm run lint`      | ESLint über das gesamte Repo    |
| `npm run format`    | Prettier-Formatierung schreiben |
| `npm run typecheck` | TypeScript-Checks pro Workspace |

## Status

Aufbau erfolgt **schrittweise** entlang der Roadmap (Bauplan §12).
Aktuell: **Phase 0 — Monorepo-Skeleton + Tooling.**
