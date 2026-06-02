
## CLAUDE.md Supplement: Supplier & Green Coffee Marketplace Module

This file supplements `CLAUDE-cropster-saas.md` with tasks specific to
the **Supplier Directory & Green Coffee Sourcing** module.

---

## Overview

The supplier marketplace is a community layer on top of the core roastery platform.
It lets verified roastery users discover Indonesian green coffee suppliers, browse
lot listings, write purchase-verified reviews, and get AI-generated supplier quality summaries.

Key design constraints:

- Reviews must be verified before they influence AI ratings (either auto-matched to a roast session or moderator-approved)
- AI-generated content (supplier summaries, flavor estimates) must be clearly labeled as AI output
- Suppliers are independent from tenants; a supplier can be listed without being a platform user

---

## New Prisma Models

For the full schema additions, see `output/supplier-module-extension.md`.

### Local node models to add:

- `Supplier` — supplier profile
- `GreenLotListing` — individual lot available from supplier
- `SupplierReview` — per-purchase review with verification status
- `AiSupplierSummary` — stored AI summary per supplier (local copy)
- `AiLotFlavorEstimate` — AI flavor range prediction per lot

### VPS models to add:

- `Supplier` — global supplier registry (synced from local nodes or self-onboarded)
- `AiSupplierSummaryVps` — central copy for cross-platform display

---

## Tasks for Claude

### Scaffold supplier models

1. Add new models to `packages/db-local/schema.prisma`.
2. Add new models to `packages/db-vps/schema.prisma`.
3. Run `prisma migrate dev --name add_supplier_marketplace` in both packages.
4. Export new Prisma types in `packages/shared-types/index.ts`.

### Build supplier API routes in `apps/local-node`

Scaffold these REST endpoints:

| Method | Path | Action |
|--------|------|--------|
| GET | /suppliers | List all suppliers (filterable by province, specialty) |
| GET | /suppliers/:id | Get supplier profile + active listings |
| POST | /suppliers | Create supplier (admin-only) |
| PUT | /suppliers/:id | Update supplier profile (admin-only) |
| GET | /suppliers/:id/listings | Get all lot listings for a supplier |
| POST | /suppliers/:id/listings | Add a new lot listing (admin-only) |
| GET | /listings/:id | Get single lot listing |
| PUT | /listings/:id | Update lot listing |
| POST | /listings/:id/reviews | Submit a review (authenticated user) |
| GET | /listings/:id/reviews | Get all verified reviews for a listing |
| GET | /suppliers/:id/ai-summary | Fetch AI summary for supplier |

### Build review verification background job

Create a job at `apps/local-node/jobs/verify-reviews.ts`:

1. Query `SupplierReview` where `status = "pending"`.
2. For each, check if the reviewer has a `RoastSession` referencing the same `GreenLotListing.id` or a `GreenLot` with matching `code`.
3. If matched → set `status = "auto_verified"`.
4. If not matched → set `status = "pending_moderator"`, create a moderator notification.
5. Emit event `review.verified` for downstream AI summary trigger.

### AI summary job

Create a job at `apps/local-node/jobs/generate-supplier-ai-summary.ts`:

Triggered when:
  - A new review is verified AND the supplier now has ≥ 3 verified reviews
  - Monthly cron on all suppliers with ≥ 3 verified reviews

Logic:
1. Load all verified reviews for the supplier (text + scores).
2. Load supplier metadata.
3. POST to `apps/ai-service/ai/supplier-summary`.
4. Save result to `AiSupplierSummary`.
5. Optionally sync summary to VPS via `POST /api/suppliers/:id/ai-summary`.

### AI lot flavor estimate job

Triggered when:
  - A new `GreenLotListing` is created
  - A lot listing is significantly updated (variety, process, origin)

Logic:
1. Load lot metadata.
2. Query recent platform lots with similar origin + process for historical context.
3. POST to `apps/ai-service/ai/lot-flavor-estimate`.
4. Save to `AiLotFlavorEstimate`.

### Add AI endpoints to `apps/ai-service`

Add these routes:

- `POST /ai/supplier-summary`
  Input:
  ```json
  {
    "supplierId": "...",
    "supplierMeta": { "name": "...", "province": "...", "specialties": [...] },
    "reviews": [{ "ratingOverall": 4, "ratingReliability": 5, "comment": "...", ... }]
  }
  ```
  Output:
  ```json
  {
    "summaryText": "...",
    "sentimentScores": { "reliability": 4.5, "quality": 4.2, "communication": 4.8 },
    "overallAiScore": 4.4
  }
  ```

- `POST /ai/lot-flavor-estimate`
  Input:
  ```json
  {
    "lotMeta": { "origin": "Gayo", "variety": "Bourbon", "process": "natural", "harvestYear": 2025 },
    "similarLotsHistory": [{ "origin": "Gayo", "process": "natural", "cuppingScores": {...} }]
  }
  ```
  Output:
  ```json
  {
    "flavorRanges": { "acidity": "medium-high", "body": "medium", "sweetness": "high", "aftertaste": "clean" },
    "summaryText": "...",
    "confidence": 0.72
  }
  ```

### Build moderator panel in `apps/vps-api`

A minimal admin view (can be a simple table with actions) at `/admin/reviews`:
- List `SupplierReview` where `status = "pending_moderator"` 
- Show reviewer info, roastery name, review text, attachment link
- "Approve" button → set `status = "moderator_verified"` + optional note
- "Reject" button → set `status = "rejected"` + required note to reviewer

Use the VPS tenant-scoped auth. Only `role = "platform_admin"` can access.

### UI screens in `apps/local-node` frontend

- Supplier directory page: searchable/filterable list of suppliers
- Supplier profile page: listings, reviews, AI summary card (clearly labeled)
- Lot listing detail: lot info, AI flavor estimate card (labeled), review list, write-review form
- Write review form: only shown to logged-in users; fields for scores + comment; upload area for cupping sheet

---

## Design Notes

- AI content blocks must always show a label: "AI-generated summary based on X verified reviews"
- Flavor estimates must show: "AI estimate — not a cupping result. Confidence: 72%"
- Star ratings shown as aggregate of verified reviews only; pending reviews excluded
- For suppliers with < 3 verified reviews, show "Insufficient data for AI summary" rather than a placeholder
