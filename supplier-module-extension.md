
## Supplier Marketplace & Green Coffee Sourcing Module

This module adds a community-driven green coffee marketplace to the platform,
focused on verified Indonesian and regional suppliers. It includes a moderated
review and AI-powered supplier rating system.

---

## Feature Scope

### 1. Supplier Directory

- Supplier profile page
  - Business name, location (province, kabupaten), contact info (masked by default)
  - Origin specialties (e.g., Gayo, Flores, Toraja, Wamena, Bajawa)
  - Process types available (washed, natural, honey, wet-hulled/Giling Basah)
  - Certifications (if any: organic, RFA, Fairtrade, UTZ)
  - Active green lots with stock status

- Supplier tiers (based on reviews + platform history)
  - Verified: passed basic platform onboarding
  - Trusted: has 5+ verified reviews, no unresolved disputes
  - Premium: opted-in paid listing with priority placement

### 2. Green Lot Listings

- Listed by supplier; searchable by:
  - Origin region (province/area)
  - Variety (Typica, Bourbon, Linie-S, Tim-Tim, etc.)
  - Process type
  - Screen size
  - Harvest year / crop season
  - Availability (spot / forward contract / inquiry only)

- Each lot card shows:
  - Origin, variety, process
  - Min order quantity (MOQ)
  - Price range or "contact for price"
  - AI-generated flavor expectation (based on similar lots, clearly labeled as AI estimate)
  - Average rating from verified purchasers

### 3. Verified Review System

Reviews are only accepted from platform users who:
  - Have an active roastery account on the platform (tenant on local node or SaaS)
  - Have logged a roast session that references the reviewed green lot
  - OR submit a purchase receipt that is manually verified by a moderator

Review fields:
  - Overall rating (1-5 stars)
  - Green quality score (appearance, uniformity)
  - Flavor score (cupping result after roasting)
  - Supplier reliability (delivery time, packaging, communication)
  - Free text comment (min 50 chars)
  - Attachment: optional cupping score sheet or photo

Verification states:
  - Pending: newly submitted
  - Auto-verified: matched to a logged roast session in the system
  - Moderator-verified: manually approved after receipt review
  - Rejected: spam, conflict of interest, or insufficient evidence

### 4. AI Supplier & Lot Rating Summary

After 3+ verified reviews exist on a supplier or lot, the AI layer generates:

- Supplier summary card (refreshed monthly or on new review):
  - Sentiment-analyzed strengths and weaknesses from review text
  - Reliability trend (improving / stable / declining) based on last 12 months
  - Overall AI-weighted score (combines star rating + sentiment + recency)
  - Short narrative paragraph (plain Indonesian or English, configurable)

- Lot quality prediction (for new lots from a known supplier):
  - Cross-reference origin, variety, process against platform's lot history
  - Generate flavor expectation ranges (acidity, body, sweetness, aftertaste)
  - Clearly labeled: "AI estimate based on similar lots — not a cupping result"

AI summary is generated via the same AI service (MiniMax primary, OpenRouter fallback).
Input to AI: structured JSON with:
  - Supplier metadata
  - All verified reviews (text + scores)
  - Lot metadata

Output:
  - `summaryText`: 100-200 word narrative
  - `sentimentScores`: { reliability, quality, communication }
  - `overallAiScore`: float 0-5
  - `lastUpdated`: timestamp

---

## Data Model Additions (local.prisma + vps.prisma)

### New tables for local.prisma

```prisma
model Supplier {
  id          String   @id @default(uuid())
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  tenantId    String
  name        String
  slug        String   @unique
  location    String?  // province / kabupaten
  province    String?
  contact     String?  // encrypted or masked
  bio         String?
  specialties String[] // origin names
  processTypes String[] // washed, natural, honey, giling_basah
  certifications String[]
  tier        String   @default("verified") // verified, trusted, premium
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  listings    GreenLotListing[]
  reviews     SupplierReview[]
  aiSummary   AiSupplierSummary?
}

model GreenLotListing {
  id          String   @id @default(uuid())
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  supplierId  String
  name        String
  originCountry String @default("Indonesia")
  region      String?
  province    String?
  variety     String?
  process     String?
  screenSize  String?
  harvestYear Int?
  cropSeason  String?
  moqKg       Float?
  priceMin    Float?
  priceMax    Float?
  currency    String?  @default("IDR")
  availability String  // spot, forward_contract, inquiry
  notes       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  reviews     SupplierReview[]
  aiFlavorEst AiLotFlavorEstimate?
}

model SupplierReview {
  id          String   @id @default(uuid())
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  supplierId  String
  listing     GreenLotListing? @relation(fields: [listingId], references: [id])
  listingId   String?
  reviewer    User     @relation(fields: [reviewerUserId], references: [id])
  reviewerUserId String
  roastSession RoastSession? @relation(fields: [roastSessionId], references: [id])
  roastSessionId String?
  ratingOverall      Int  // 1-5
  ratingGreenQuality Int? // 1-5
  ratingFlavor       Int? // 1-5
  ratingReliability  Int? // 1-5
  comment     String
  attachmentUrl String?
  status      String   // pending, auto_verified, moderator_verified, rejected
  moderatorNote String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AiSupplierSummary {
  id          String   @id @default(uuid())
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  supplierId  String   @unique
  provider    String
  modelName   String
  summaryText String
  sentimentJson Json   // { reliability, quality, communication }
  overallAiScore Float
  reviewCount Int
  lastUpdated DateTime @default(now())
}

model AiLotFlavorEstimate {
  id          String   @id @default(uuid())
  listing     GreenLotListing @relation(fields: [listingId], references: [id])
  listingId   String   @unique
  provider    String
  modelName   String
  flavorRangesJson Json // { acidity, body, sweetness, aftertaste }
  summaryText String
  confidence  Float?
  createdAt   DateTime @default(now())
}
```

### New tables for vps.prisma

```prisma
model Supplier {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  province    String?
  tier        String   @default("verified")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  aiSummary   AiSupplierSummaryVps?
}

model AiSupplierSummaryVps {
  id           String   @id @default(uuid())
  supplier     Supplier @relation(fields: [supplierId], references: [id])
  supplierId   String   @unique
  summaryText  String
  sentimentJson Json
  overallAiScore Float
  reviewCount  Int
  lastUpdated  DateTime @default(now())
}
```

---

## AI Endpoints (ai-service additions)

- `POST /ai/supplier-summary`
  - Input: `{ supplierId, reviews: [], supplierMeta: {} }`
  - Output: `{ summaryText, sentimentScores, overallAiScore }`

- `POST /ai/lot-flavor-estimate`
  - Input: `{ lotMeta: { origin, variety, process, harvestYear }, similarLotsHistory: [] }`
  - Output: `{ flavorRanges, summaryText, confidence }`

Both endpoints:
- Clearly label AI-generated content in the UI
- Fall back to OpenRouter if MiniMax fails
- Log usage to `AiUsageRecord`

---

## Moderation Flow

1. Review submitted → status = `pending`
2. Background job checks: is there a matching `RoastSession` referencing the same `GreenLotListing` or `GreenLot`?
   - YES → status = `auto_verified`
   - NO → status = `pending_moderator`, send notification to moderator queue
3. Moderator reviews receipt/evidence in admin panel on VPS
4. Marks as `moderator_verified` or `rejected` with note
5. Once 3+ verified reviews exist on a supplier/lot, trigger AI summary generation job

---

## Roadmap Note

This module can run as part of the local roastery app (browsable, read-only marketplace)
while write operations (listing, reviewing, verifying) go through the central VPS API.

Future extension: allow suppliers to self-onboard via the VPS portal and manage their own listings.
Indonesian regional focus first (Aceh, Sumatra, Java, Flores, Sulawesi, Papua), with cross-border later.
