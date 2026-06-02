# MVP Scope and Architecture for a Cropster-Style Roastery SaaS with AI Layer

## Overview

This document defines an MVP feature set and high-level architecture for a Cropster-style roastery platform targeted at micro-roasteries in Indonesia, with a free core and a paid AI layer on top.
It focuses on roasting telemetry, inventory management, POS sync, and a clear separation between a locally hosted roastery app and a central VPS backend used for multi-tenant data aggregation and AI services.
Given the user already operates a specialty roastery and is comfortable with Claude Code-style monorepos and API wiring, the design emphasizes clear module boundaries, explicit schemas, and integration points for POS, e-commerce, and future cupping/review apps.

## MVP Core Feature Set

### 1. Roasting Telemetry & Sessions

Core roasting functionality should mirror key capabilities of systems like Cropster Roasting Intelligence and Artisan: real-time data visualization, roast logging, and profile replay.[^1][^2]
MVP telemetry assumes a connected data logger (e.g., Phidget) feeding bean temperature, exhaust temperature, RoR, and event markers (charge, turning point, first crack, drop).

MVP roasting features:

- Real-time roast graph
  - Time vs bean temperature (BT), exhaust temperature (ET), RoR.
  - Event markers: charge, TP, FC start/end, drop, notes.
- Roast session lifecycle
  - Create session bound to: machine, green lot, target batch size, operator.
  - Start/stop logging, record actual green/roasted weights.
  - Store profile curve samples at fixed interval (e.g., 1s or 2s) plus events.
- Profile library
  - Save a profile as a "reference" for a given product/green lot.
  - Tag profiles by product, roast style (light/medium/dark), brew method focus, etc.
- Basic replay support (v1: analytical only)
  - Show reference curve overlay while roasting.
  - Manual guidance, not automated PID control in MVP.

### 2. Inventory (Green & Roasted)

Cropster emphasizes integrated green and roast inventory as a backbone for operations and API syncing.[^3][^4]
MVP should implement a simplified but clean inventory model:

- Green inventory
  - Lots: origin, farm, variety, process, screen size, moisture, density, harvest year.
  - Purchasing: supplier, contract quantity, price, received shipments, warehouse location.
  - Drawdown tracking: link roasted batches to specific green lots to reduce stock.
- Roasted inventory
  - SKUs / products: espresso blend, single origin filter, etc.
  - Batch linkage: each roast session can generate one or more SKUs (blend mapping or one-to-one).
  - Stock adjustments from roasting (increase) and POS/e-commerce sales (decrease).
- Basic inventory KPIs
  - On-hand by lot and SKU.
  - Days of coverage, suggested reorder points (simple thresholds in MVP).

### 3. POS Sync & Simple Production Planning

Cropster’s API is positioned as a bridge between POS/ERP and roasting, syncing green/roast inventory and commerce orders.[^4][^3]
For an Indonesian micro-roastery MVP, integration can focus on:

- POS sales import
  - Pull daily/periodic sales by product SKU from POS backend (e.g., Olsera or similar local systems).
  - Map POS SKUs to roastery SKUs in the app.
- E-commerce orders import
  - Optional MVP: simple REST/CSV import interface so Shopify/WooCommerce etc. can push orders.
- Simple production planning
  - Generate roast plan based on:
    - Current roasted stock per SKU.
    - Open orders (POS + e-commerce) over a lookback window.
    - Target min stock levels.
  - Output: list of planned roasts (date, machine, product, batch size, suggested profile).

### 4. User Management & Multi-Tenancy

Even though the first deployment is for a single roastery, architecture should support multi-tenant SaaS later.
Cropster organizes data by accounts, locations, and machines; similar logical separation is recommended.[^5][^6]

Core concepts:

- Tenant (roastery): top-level account for a business.
- Location: physical site (roastery, warehouse, cafe), optional in MVP but useful later.
- Machine: roasting machines attached to a location.
- Users: operators/admins belonging to a tenant with roles (owner, roaster, staff).

## AI Layer (Paid Tier)

### 1. AI Feature Surface in MVP

The paid AI layer should start narrow and deep rather than broad and shallow.
Given the user’s earlier RoastMind design, there is already a strong concept of an AI co-pilot for roast analysis and planning rather than full automation.

Initial AI features:

- Roast profile analysis
  - After each roast, generate:
    - Curve summary (development %, RoR stability, deviations vs reference).
    - Potential issues (baked, underdeveloped, flick/crash patterns) in plain Indonesian/English.
- Inventory & production suggestions
  - Recommend which SKUs to roast next based on inventory levels and recent sales.
  - Suggest batch sizes to minimize unsold coffee and stock-outs (simple heuristic + narrative explanation).
- Queryable assistant
  - Chat interface scoped to the tenant’s data: "How much Ethiopia natural is left?", "What should I roast tomorrow?" etc.

These can be implemented as stateless API calls that take structured JSON (roast session, inventory snapshot, sales summary) and return text plus suggested actions.

### 2. AI Infrastructure and Provider Strategy

Cropster’s API uses OAuth-based server-to-server authentication and RPC-style HTTP endpoints; the AI layer can follow a similar pattern but is independent of that.[^7][^8]
Given the user’s preference for MiniMax as a primary provider with the option to swap in others, the design should:

- Define an internal AI abstraction
  - Interface: `analyzeRoast`, `suggestProductionPlan`, `answerRoasteryQuestion`.
  - Implementation adapters: `MinimaxAdapter`, `OpenRouterAdapter`, `LocalLLMAdapter`.
- Provider selection strategy
  - Tenant-level configuration: choose provider, model name, max tokens, etc.
  - Global fallback: if primary fails or rate limited, fall back to a secondary provider.
- Billing and access control
  - Free tier: no AI or very limited credits.
  - Paid tier: monthly subscription + soft usage caps; track per-tenant token usage.

### 3. Data Ownership and Privacy Model

The design needs to ensure that roasteries own their data while still allowing aggregated analytics across tenants.
This aligns with the user’s desire for local-first deployments that still sync data to a VPS.

Model:

- Local node (roastery server)
  - Primary data store for raw roast curves, inventory, and POS sync.
  - Runs the web app used in the roastery.
- Central VPS backend
  - Receives structured sync snapshots (roast summaries, inventory aggregates, sales aggregates), not necessarily full raw curves.
  - Hosts AI services and multi-tenant account management.
- Ownership and consent
  - Each tenant’s raw data lives on their local node by default.
  - Sync scope is configurable: opt-in to share raw curves, anonymized aggregates, or nothing.
  - Terms clearly state that data remains the roastery’s property; platform gets license for AI training/analytics only if explicitly granted.

## High-Level Architecture

### 1. Components

Inspired by Cropster’s separation between local roasting software (RI client) and a central online platform (C-sar), the system can be structured similarly.[^1][^9]

- Local Roastery App
  - Runs on LAN machine (Windows mini PC, NUC, etc.).
  - Responsibilities:
    - Device integration (roaster sensors/loggers).
    - Local database with roast sessions, inventory, SKU mappings, POS sync cache.
    - UI for roasters and managers.
    - Background job to sync aggregates with central VPS.
- Central SaaS Backend (VPS)
  - Multi-tenant API and management console.
  - Stores tenant metadata, billing, and AI usage logs.
  - Provides AI endpoints for analysis and suggestions.
  - Optionally stores cross-tenant analytics datasets.
- Integrations
  - POS/E-commerce connect either directly to local app (LAN) or to central backend, depending on what is easiest for the vendor.
  - Future cupping/review app uses the same central API and tenant model, sharing inventory and roast data.

### 2. Tech Stack Assumptions

Given the user’s existing work:

- Backend
  - Node/TypeScript or Python service with REST/JSON endpoints.
  - ORM (e.g., Prisma/Drizzle if using TypeScript) for schema control.
  - PostgreSQL for both local node and VPS (with separate instances and schemas).
- Frontend
  - Web UI (React/Next.js, or similar) for roastery dashboard and SaaS console.
- Sync and messaging
  - Local node periodically POSTs sync payloads to the VPS (simple HTTPS, signed JWT).
  - Optional future: message queue for async jobs.
- AI Layer
  - Dedicated microservice that exposes normalized endpoints to the rest of the system and talks to external AI providers.

## Core Data Model / ERD (Textual)

### 1. Tenancy & Access

- Tenant
  - id (uuid)
  - name
  - slug
  - country
  - timezone
  - plan (free, ai_basic, ai_pro)
  - created_at, updated_at
- User
  - id
  - tenant_id (fk → Tenant)
  - email
  - name
  - role (owner, admin, roaster, staff)
  - password_hash / auth provider fields
  - created_at, updated_at
- Location
  - id
  - tenant_id (fk)
  - name
  - type (roastery, warehouse, cafe, other)
  - country, city, address, timezone
  - created_at, updated_at
- Machine
  - id
  - tenant_id (fk)
  - location_id (fk)
  - name
  - manufacturer
  - model
  - batch_capacity_kg
  - data_logger_type (phidget, modbus, none)
  - created_at, updated_at

### 2. Inventory: Green Coffee

- GreenLot
  - id
  - tenant_id (fk)
  - code (human-readable lot code)
  - name (e.g., Ethiopia Guji Natural)
  - origin_country
  - region
  - farm
  - variety
  - process (washed, natural, honey, etc.)
  - screen_size
  - moisture
  - density
  - harvest_year
  - supplier_name
  - contract_quantity_kg
  - initial_stock_kg
  - current_stock_kg
  - status (active, finished, archived)
  - created_at, updated_at
- GreenMovement (optional MVP or later)
  - id
  - green_lot_id (fk)
  - type (inbound, adjustment, transfer)
  - quantity_kg
  - from_location_id (nullable)
  - to_location_id (nullable)
  - reason
  - created_at

### 3. Inventory: Roasted Products

- Product (SKU)
  - id
  - tenant_id (fk)
  - code (SKU code; must map to POS/e-commerce SKU)
  - name
  - description
  - roast_style (light, medium, dark, etc.)
  - default_batch_size_kg
  - active (bool)
  - created_at, updated_at
- ProductGreenMapping
  - id
  - product_id (fk)
  - green_lot_id (fk)
  - percentage (e.g., 0.60 for 60% of blend)

- RoastedInventory
  - id
  - tenant_id (fk)
  - product_id (fk)
  - location_id (fk)
  - on_hand_kg
  - updated_at

- InventoryAdjustment (Roasted)
  - id
  - tenant_id (fk)
  - product_id (fk)
  - location_id (fk)
  - delta_kg (positive or negative)
  - reason (roast_batch, sale_sync, writeoff, manual_adjustment)
  - ref_id (optional, e.g., roast_session_id or sale_id)
  - created_at

### 4. Roasting Sessions & Telemetry

- RoastSession
  - id
  - tenant_id (fk)
  - machine_id (fk)
  - location_id (fk)
  - product_id (fk, nullable if purely exploratory)
  - green_lot_id (fk)
  - target_batch_size_kg
  - green_weight_kg
  - roasted_weight_kg
  - charge_time
  - drop_time
  - roast_date
  - operator_user_id (fk → User)
  - reference_profile_id (fk → RoastProfile, nullable)
  - notes
  - created_at, updated_at

- RoastSamplePoint
  - id
  - roast_session_id (fk)
  - timestamp_ms (relative or absolute)
  - bean_temp_c
  - exhaust_temp_c
  - ror
  - gas_setting (optional numeric or enum)
  - airflow_setting (optional)

- RoastEvent
  - id
  - roast_session_id (fk)
  - event_type (charge, turning_point, first_crack_start, first_crack_end, drop, note)
  - timestamp_ms
  - value (optional string or numeric)

- RoastProfile
  - id
  - tenant_id (fk)
  - product_id (fk, nullable)
  - name (e.g., "Ethiopia Natural V60")
  - description
  - source_roast_session_id (fk → RoastSession)
  - is_reference (bool)
  - created_at, updated_at

### 5. POS & E-commerce Sync

- ExternalSystem
  - id
  - tenant_id (fk)
  - type (pos, ecommerce)
  - provider_name (olsera, shopify, woocommerce, custom)
  - base_url
  - api_key / credentials (encrypted)
  - config_json (for mapping details)
  - created_at, updated_at

- ExternalProductMapping
  - id
  - tenant_id (fk)
  - external_system_id (fk)
  - external_sku
  - product_id (fk → Product)

- ExternalOrder
  - id
  - tenant_id (fk)
  - external_system_id (fk)
  - external_order_id
  - order_date
  - status
  - total_amount
  - currency
  - created_at, updated_at

- ExternalOrderItem
  - id
  - external_order_id (fk)
  - external_sku
  - product_id (fk)
  - quantity
  - unit

- SalesAggregate (for AI and planning)
  - id
  - tenant_id (fk)
  - product_id (fk)
  - date
  - total_quantity_sold
  - total_revenue
  - source (pos, ecommerce, mixed)

### 6. AI Layer Data & Billing

- AiProviderConfig
  - id
  - tenant_id (fk)
  - provider (minimax, openrouter, local)
  - model_name
  - api_key (encrypted, if per-tenant)
  - max_tokens_per_call
  - created_at, updated_at

- AiUsageRecord
  - id
  - tenant_id (fk)
  - feature (roast_analysis, production_plan, qa_chat)
  - tokens_prompt
  - tokens_completion
  - cost_estimate
  - created_at

- AiAnalysisRoast
  - id
  - roast_session_id (fk)
  - tenant_id (fk)
  - provider
  - model_name
  - analysis_json (structured, e.g., scores per phase, flags)
  - summary_text
  - created_at

- AiSuggestionPlan
  - id
  - tenant_id (fk)
  - date_range_start
  - date_range_end
  - input_snapshot_json (inventory + sales summary)
  - suggestion_json (planned roasts list)
  - summary_text
  - created_at

## Local vs VPS Data Split

To satisfy the requirement that servers run locally but still interact with a VPS database, the data model can be split logically:

- Local node (per tenant)
  - Full RoastSession, RoastSamplePoint, RoastEvent.
  - Full GreenLot and detailed movements.
  - Full RoastedInventory and InventoryAdjustments.
  - Cached copies of ExternalOrder/ExternalOrderItem as needed.
- Central VPS
  - Tenant, User, plan, AiProviderConfig, AiUsageRecord, billing data.
  - High-level aggregates: SalesAggregate, simplified inventory snapshots, AiAnalysisRoast (if tenant opts in).

Sync process:

- Local node periodically:
  - Computes or updates SalesAggregate for the last N days.
  - Sends latest aggregates + metadata for new roast sessions to VPS via signed API calls.
- VPS:
  - Stores aggregates and makes them available for AI and cross-tenant analytics.
  - Never requires direct access to raw telemetry unless explicitly allowed.

## Integration Points for Future Apps

The architecture allows a future cupping and coffee review app (desktop/mobile) to:

- Reuse Tenant, Product, RoastSession entities.
- Link cupping scores and flavor notes to specific roast sessions and green lots.
- Call the same AI layer to predict flavor outcomes or suggest roast adjustments.

Similarly, additional POS integrations or chain-level inventory insight features can compare POS shot-level data against inventory and brewing metrics, similar to Cropster’s cafe inventory tools that compare sold shots to actual brewed shots to detect losses.[^10]

This report provides a foundation for:

- Implementing a Prisma schema for both local and VPS databases.
- Defining REST endpoints for telemetry ingest, POS sync, AI analysis, and tenant management.
- Writing a Claude Code `CLAUDE.md` that describes tasks for agents to scaffold, extend, and refactor the system iteratively.

---

## References

1. [Cropster - Joper Roasters](https://joper-roasters.com/cropster/) - Crospter coffee roasting profile software solution for consistent and quality roasts, simplified wor...

2. [About | Leading coffee roasting software - Artisan](https://artisan-scope.org/about/) - Roast Profiling · Flexible User Interface · Roast Control & Automation · Profile Design & Analytics ...

3. [Real-Time Data Sync for ERP & Coffee Systems - Cropster API](https://www.cropster.com/cropster-api-integration/) - Eliminate manual data entry. Use our Cropster API to sync your green and roast inventory with NetSui...

4. [API](https://www.cropster.com/solutions/api/) - Included in Advanced packageAvailable as add-on to Core & Scale packages

5. [Managing Locations - Cropster Helpdesk](https://help.cropster.com/day-to-day-operations/managing-locations) - Setting up one or more locations enables comprehensive oversight of your coffee supply chain by cent...

6. [Cropster - Coffed Coffee Roasters](https://coffedroasters.com/blog/coffe/cropster) - Cropster creates software to help coffee professionals from origin to cafe get the best out of their...

7. [Step 2: Request Access Token](https://docs.cropster.com/guides/getting-started)

8. [API Development Update](https://help.cropster.com/en_US/account-administration/api-development-update) - Our commitment to enhancing the Cropster ecosystem continues with the upcoming release of a new RPC ...

9. [New sample handling, simpler, more integrated and available ...](https://www.cropster.com/blog-post/new-sample-handling-simpler-more-integrated-and-available-anywhere/) - Sample details, traceability, history and quality information is now displayed together to give a co...

10. [The New Cropster Cafe Inventory Insight Feature Revolutionizes ...](https://sprudge.com/the-new-cropster-cafe-inventory-insight-feature-revolutionizes-inventory-tracking-for-coffee-chains-257935.html) - The Inventory Insight feature includes Dashboard and KPI Cards that deliver detailed information on ...

