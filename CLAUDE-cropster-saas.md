# CLAUDE.md – Roastery SaaS (Cropster-style) with AI Layer

> **v0.1 status (2026-06-02):** The first end-to-end vertical slice is built.
> Read [`CLAUDE-arcana-build.md`](./CLAUDE-arcana-build.md) first for the
> current repo map, commands, and what is in/out of scope. This file is the
> long-term product vision — authoritative for non-v0.1 questions.

## Project Intent

This monorepo hosts a roastery management platform inspired by Cropster for micro-roasteries in Indonesia.
The goal is to provide a **free core** (roast telemetry, inventory, POS sync) and a **paid AI layer** that analyzes roast curves, recommends production plans, and answers questions using the roastery's own data.[memory:1]

The system is split into:

- A **local node app** that runs on a LAN machine in each roastery and owns all raw operational data.
- A **central VPS backend** that manages tenants, billing, AI provider configuration, and cross-tenant analytics.
- An **AI service** that exposes a simple JSON API for roast analysis, production planning, and Q&A, backed by external LLM providers (MiniMax by default, with swappable adapters).[memory:2]

## High-Level Architecture

### 1. Local Node (Roastery App)

Responsibilities:

- Connect to roaster telemetry (e.g., Phidget thermocouple) and stream live BT/ET/RoR data.
- Record roast sessions, sample points, and events.
- Manage green and roasted inventory.
- Sync POS / e-commerce sales and compute daily `SalesAggregate` rows.
- Provide a UI for roasters and managers (roast graph, inventory, simple planning).
- Periodically sync aggregates and selected metadata to the central VPS.

Tech assumptions:

- Node/TypeScript backend (Express/Fastify/Nest) with Prisma using `output/local.prisma`.
- React/Next.js frontend for dashboards.
- Postgres (or SQLite for dev) on the local machine.

### 2. Central VPS Backend

Responsibilities:

- Multi-tenant account management (tenants, users, plans).
- AI provider configuration and usage tracking.
- Store aggregated sales and optional roast analysis summaries from local nodes.
- Provide REST/JSON API for AI analysis calls and for auxiliary apps (cupping, review, etc.).

Tech assumptions:

- Node/TypeScript backend with Prisma using `output/vps.prisma`.
- Postgres on VPS.
- Authentication via JWT with tenant scoping.

### 3. AI Service

Responsibilities:

- Normalize all AI calls behind a small function-style HTTP API.
- Talk to external LLM providers (MiniMax, OpenRouter, local model) via adapters.
- Track token usage and cost per tenant.

Core endpoints:

- `POST /ai/roast-analysis` – Analyze a single roast session and return structured JSON + summary.
- `POST /ai/plan-production` – Given inventory + sales aggregates, return a roast plan.
- `POST /ai/qa` – Answer natural language questions about a tenant's data.

## Repository Layout

Suggested monorepo structure:

```text
.
├─ apps/
│  ├─ local-node/         # Local roastery app (backend + UI)
│  ├─ vps-api/            # Central SaaS backend
│  └─ ai-service/         # AI normalization service
├─ packages/
│  ├─ db-local/           # Prisma client + migrations for local node
│  ├─ db-vps/             # Prisma client + migrations for VPS
│  ├─ ai-adapters/        # MiniMax/OpenRouter/local adapters
│  └─ shared-types/       # Shared TypeScript types/schemas
├─ infra/
│  ├─ docker/             # Docker compose for local dev
│  └─ terraform/          # Optional VPS infra scripts
└─ CLAUDE.md
```

## Key Data Models

Use the Prisma schemas as the source of truth for entities.

- **v0.1**: `packages/db-local/prisma/schema.prisma` (SQLite, owned by the monorepo)
- **v0.2+**: `output/vps.prisma` for the central VPS (Postgres)

### Local Node (packages/db-local/prisma/schema.prisma in v0.1)

Important models:

- `Tenant`, `User`, `Location`, `Machine` – identity and access.
- `GreenLot`, `GreenMovement` – green inventory.
- `Product`, `ProductGreenMapping`, `RoastedInventory`, `InventoryAdjustment` – roasted inventory and blends.
- `RoastSession`, `RoastSamplePoint`, `RoastEvent`, `RoastProfile` – roast telemetry and reference profiles.
- `ExternalSystem`, `ExternalProductMapping`, `ExternalOrder`, `ExternalOrderItem`, `SalesAggregate` – POS/e-commerce sync and daily aggregates.
- `AiAnalysisRoast`, `AiSuggestionPlan` – stored AI outputs for local review.

### VPS Backend (output/vps.prisma)

Important models:

- `Tenant`, `User`, `Location`, `Machine` – global multi-tenant registry.
- `AiProviderConfig`, `AiUsageRecord` – provider settings and usage tracking.
- `SalesAggregate` – copy of node-level aggregates for cross-tenant analytics.
- `AiAnalysisRoastSummary`, `AiSuggestionPlan` – AI outputs stored centrally.
- `Subscription`, `Invoice` – billing.

## Data Flow and Sync

1. **Roasting**
   - Local node records `RoastSession`, `RoastSamplePoint`, and `RoastEvent`.
   - Optionally sends a reduced summary to VPS for AI analysis or chain-level reporting.

2. **Inventory & POS**
   - Local node pulls orders from POS/e-commerce and writes `ExternalOrder`/`ExternalOrderItem`.
   - Local job aggregates into `SalesAggregate` (per product per day).
   - Periodic sync pushes `SalesAggregate` rows to VPS with tenant-scoped auth.

3. **AI Calls**
   - Local node or VPS calls `apps/ai-service` endpoints with structured JSON payloads.
   - AI service forwards requests to configured provider adapter.
   - Responses are stored both locally (`AiAnalysisRoast`, `AiSuggestionPlan`) and optionally as summaries on VPS (`AiAnalysisRoastSummary`).

## Tasks for Claude

When working in this repo, follow these guidelines:

1. **Schema work**
   - Keep `output/local.prisma` and `output/vps.prisma` as the single source of truth.
   - When changing a model, update:
     - Prisma schema,
     - migrations (or use `prisma migrate`),
     - corresponding TypeScript types in `packages/shared-types`.

2. **Local Node implementation**
   - Scaffold `apps/local-node` with:
     - REST endpoints for roast sessions, inventory, POS sync, and planning.
     - WebSocket or SSE endpoint for live roast telemetry.
     - Pages for:
       - Roast live view (graph),
       - Roast history & profiles,
       - Green/roasted inventory,
       - Simple roast plan.

3. **VPS API implementation**
   - Scaffold `apps/vps-api` with:
     - Tenant and user management endpoints.
     - Auth middleware enforcing tenant scoping.
     - Endpoints for receiving `SalesAggregate` and optional roast summaries from nodes.
     - Endpoints for billing webhooks (if/when integrated with a payment provider).

4. **AI Service implementation**
   - In `apps/ai-service`:
     - Implement adapters for MiniMax first, then design interfaces for more providers.
     - Define clear TypeScript interfaces for:
       - `RoastAnalysisRequest/Response`,
       - `ProductionPlanRequest/Response`,
       - `QaRequest/Response`.
     - Implement logging of each call into VPS `AiUsageRecord`.

5. **Prompting and Safety**
   - Store AI prompt templates and system messages in a dedicated directory (e.g., `apps/ai-service/prompts/`).
   - Keep prompts deterministic and structured: clearly describe JSON shapes to be returned.
   - Avoid free-form outputs where structured outputs are possible.

6. **Integration with future cupping/review app**
   - Design models like `CuppingSession` and `CuppingScore` to reference `RoastSession`, `GreenLot`, and `Product`.
   - Expose APIs in `apps/vps-api` so a separate mobile/desktop cupping app can reuse the same tenant and product identities.

## Development Workflow

- Run local databases via Docker Compose.
- Use `packages/db-local` and `packages/db-vps` to generate Prisma clients.
- Ensure each app imports the correct client (local vs VPS).
- Keep sync logic explicit and auditable: background jobs should log each sync batch and any errors.

Use this file as the source of truth when asking Claude to scaffold new modules, refactor services, or add integrations.
