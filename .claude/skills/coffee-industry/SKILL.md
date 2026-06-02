---
name: coffee-industry
description: Specialty coffee industry domain knowledge — green coffee sourcing, roasting profile development, SCA cupping protocol and scoring, cafe operations and espresso dial-in, supply chain and import logistics, contracts and pricing, e-commerce/DTC strategy, regulatory compliance (FDA, FSMA, BPOM, SNI, MUI Halal), plus Indonesian-specific coffee expertise (Giling Basah wet-hulling, per-origin charge temp / DTR adjustments, WhatsApp order parsing, Bahasa intent classification). Loaded whenever the user asks about coffee, kopi, espresso, roast, cupping, green bean, supplier, origin, variety, lot, harvest, first crack, development time, DTR, RoR, Giling Basah, or Indonesian coffee (Sumatra, Java, Sulawesi, Flores, Bali, Papua). Use this skill to give grounded, numerate answers about coffee operations, supply chains, and Indonesian roastery workflows.
---

# Coffee Industry AI Skill

## Overview
This skill equips the agent to perform coffee industry tasks with professional-grade competence. The coffee supply chain spans green coffee sourcing, roasting, quality assurance, cafe operations, import logistics, and direct-to-consumer commerce. This skill covers specialty coffee operations with real-world numbers, workflows, and decision frameworks.

---

## What This Skill Does

The agent assists with:

- **Green coffee sourcing**: evaluating origins, varieties, processing methods, and suppliers
- **Roast profile development**: designing and refining roast curves to achieve target flavor profiles
- **Quality assessment**: running SCA-style cupping sessions, scoring, identifying defects
- **Cafe operations**: espresso dial-in, workflow optimization, equipment selection, training
- **Supply chain & import**: Incoterms, logistics, warehousing, lead times, inventory management
- **Contracts & pricing**: C-market dynamics, specialty premiums, contract structures
- **E-commerce & subscriptions**: DTC models, roast-to-order, subscription management
- **Regulatory compliance**: FDA food safety, import permits, labeling requirements
- **Brewing & extraction science**: For detailed brewing, espresso calibration, processing, roasting, and defect knowledge: load `BREWING_KNOWLEDGE.md`

---

## Trigger Keywords

This skill activates on any of the following topics:

```
kopi, coffee, espresso, roast, cupping, green bean, green coffee,
arabica, robusta, giling basah, wet-hull, sourcing, barista,
extraction, brew method, pour over, french press, aeroPress,
WooCommerce, order, customer, supplier, origin, variety, lot,
harvest, fermentation, first crack, development time,
v60, chemex, kalita, siphon, moka pot, cold brew, batch brew,
dial-in, tamp, WDT, microfoam, latte art, TDS, extraction yield,
roast curve, DTR, charge temp, rate of rise, roast defect,
cupping protocol, SCA score, defect category, process method,
washed, natural, honey, anaerobic, carbonic maceration,
caffè, caffe, latte, cappuccino, single origin, blend,
BPOM, halal, MUI, SNI, Indonesian coffee, Sumatra, Java, Sulawesi
```

---

## Output Format Standards

When returning structured data, agents must use these formats:

**Cupping scores:**
```json
{
  "sample_id": "string",
  "score": 84.5,
  "fragrance": 8.0,
  "flavor": 8.5,
  "aftertaste": 8.0,
  "acidity": 8.0,
  "body": 7.5,
  "balance": 8.0,
  "uniformity": 10,
  "clean_cup": 10,
  "sweetness": 10,
  "overall": 8.0,
  "defects": 0,
  "notes": "string"
}
```

**Supply chain / order status:**
```json
{
  "type": "order_status | inventory_alert | price_update",
  "origin": "string",
  "quantity_kg": number,
  "status": "pending | confirmed | shipped | arrived",
  "eta": "YYYY-MM-DD",
  "notes": "string"
}
```

**Sourcing recommendation:**
```json
{
  "origin": "string",
  "region": "string",
  "variety": "string",
  "process": "washed | natural | honey",
  "fob_price_usd_lb": number,
  "moq_bags": number,
  "lead_time_weeks": number,
  "cupping_score_estimate": number,
  "notes": "string"
}
```

> ⚠️ **Price data staleness warning:** All pricing in this skill is approximate and may be outdated due to C-market volatility. Before any contract, pricing, or costing decision, run `web_search("Arabica coffee futures price today")` to get current market rates.

---

## Agent Roles

This skill is designed for multi-agent stacks. Each agent type has a scoped subset of tasks it should perform using this skill. Agents should identify their role and route to their relevant scope.

### Routing Logic

| Agent Role | Primary Tasks | Escalates To |
|---|---|---|
| Store Ops | Orders, fulfillment, customer replies, WhatsApp | Operations (shipping issues), Research (out-of-stock sourcing) |
| Content | Copy, social, education, flavor notes | Research (new origin info) |
| Research | Sourcing, price, contracts, supplier scouting | Compliance (supplier certifications) |
| Operations | Logistics, import, inventory, QC | Compliance (customs issues) |
| Compliance | BPOM, SNI, Halal, labeling | External legal counsel for novel issues |
| Archive | Data storage, seasonal logs | None — passive role |

---

## 1. Store Ops Agent

**Task Scope:** Day-to-day customer-facing and operational coffee tasks.

- Order processing (WhatsApp, WooCommerce)
- Inventory status checks
- Customer coffee questions (extraction, brew guidance, flavor questions)
- Fulfillment coordination

**Inputs:** Customer messages, WooCommerce order data, inventory reports

**Outputs:** Order confirmations, shipping updates, brew guides, FAQ responses

**Output Format:** Structured JSON for orders (see Output Format Standards); prose for customer replies

**Trigger Keywords (in addition to global list):**
`order`, `beli`, `pesan`, `stock`, `kirim`, `tracking`, `resi`, `WooCommerce`, `checkout`, `subscription`, `langganan`, `brew guide`, `extraction`, `dial-in`, `v60`, `espresso`, `how to brew`

For detailed brew parameters (ratios, temperatures, timing): refer to `BREWING_KNOWLEDGE.md`

**Escalation Triggers:**
- Complaint about wrong order
- Refund request
- Payment failure
- Out-of-stock on item customer wants

---

## 2. Content Agent

**Task Scope:** Marketing, product copy, social media, and educational content about coffee.

- Product descriptions (for new coffees, seasonal releases)
- Brew method guides (pour-over, espresso, French press)
- Origin/cupping notes for customers (translating SCA cupping reports into readable flavor language)
- Social media captions, email newsletters
- Menu copywriting

**Inputs:** Cupping reports, green coffee spec sheets, product lists, social media briefs

**Outputs:** Product descriptions, blog posts, Instagram captions, flavor notes for packaging

**Output Format:** Markdown with headers, bullet points. Customer-facing tone (not technical). Can include emoji.

**Trigger Keywords:**
`caption`, `post`, `instagram`, `deskripsi`, `menu`, `description`, `flavor`, `tasting notes`, `asal kopi`, `posting`, `content`, `brew guide`, `how to brew`, `extraction`

For detailed brew parameters and processing knowledge: refer to `BREWING_KNOWLEDGE.md`

---

## 3. Research Agent (Sourcing & Procurement)

**Task Scope:** Supplier scouting, price monitoring, new origin evaluation, contract decisions.

- Monitoring Arabica/Robusta futures (web_search triggers)
- Supplier comparison and evaluation
- Cupping score analysis against price
- Lead time and MOQ assessment
- Contract review for FOB terms
- EU CSDDD compliance for supply chain due diligence

**Inputs:** Supplier quotes, cupping reports, price feeds, contract drafts

**Outputs:** Supplier comparison tables (JSON), sourcing recommendations (JSON per Output Format Standards), contract risk assessments

**Output Format:** Structured JSON for supplier data; markdown for analysis reports

**Trigger Keywords:**
`supplier`, `quote`, `harga`, `FOB`, `MOQ`, `lead time`, `asalan`, `sample`, `kopi baru`, `new origin`, `contract`, `futures`, `C-market`, `ICO`, `cropster`, `commodity price`

---

## 4. Operations Agent (Fulfillment & Logistics)

**Task Scope:** Import logistics, shipping coordination, warehouse management, inventory tracking.

- Container tracking (ETA, port delays)
- QC check scheduling when shipment arrives
- Inventory level monitoring and reorder triggers
- Inter-island shipping requirements (phytosanitary, customs)
- Storage condition monitoring (humidity, temperature)

**Inputs:** Shipping documents, COO, BL (Bill of Lading), warehouse reports, inventory counts

**Outputs:** Logistics status reports (JSON), inventory alerts, QC schedules

**Output Format:** JSON for structured data; checklist format for SOPs

**Trigger Keywords:**
`container`, `shipping`, `kontainer`, `ETA`, `port`, `QC`, `gudang`, `inventory`, `stock`, `arrived`, `sampai`, `customs`, `bea cukai`, `fumigation`, `phytosanitary`

---

## 5. Compliance Agent

**Task Scope:** Regulatory adherence, labeling, certifications.

- BPOM product registration check
- SNI compliance verification
- Halal documentation management
- Export permit review
- Label content compliance (net weight, halal logo, BPOM number, nutritional info if applicable)

**Inputs:** Product labels, ingredient lists, BPOM/SNI/Halal certificates, Indonesian food regulations

**Outputs:** Compliance checklist (markdown), gap analysis, corrective action list

**Output Format:** Markdown checklist with ✅/❌ items

**Trigger Keywords:**
`BPOM`, `SNI`, `halal`, `MUI`, `label`, `labeling`, `registrasi`, `sertifikat`, `compliance`, `izin`, `edar`, `distribution license`

---

## 6. Archive Agent

**Task Scope:** Persistent storage and retrieval of historical coffee data.

- Storing cupping reports by lot/season
- Seasonal performance tracking (which origins scored best per season)
- Supplier score history
- Customer feedback per coffee (aggregated)

**Inputs:** Cupping reports, customer feedback data, supplier performance records

**Outputs:** Structured records in knowledge base; seasonal summaries

**Output Format:** JSON records for storage; markdown summaries for human review

**Trigger Keywords:**
`store`, `archive`, `save`, `history`, `performance`, `track`, `log`, `database`

---

### Error & Fallback Playbook

Each agent handles errors by returning a structured error response and escalating only when required. Agents should never silently fail or return hallucinations.

**General Error Response Format (JSON):**
```json
{
  "type": "error",
  "agent": "Store Ops | Content | Research | Operations | Compliance | Archive",
  "error_code": "PARSE_FAILED | API_ERROR | AMBIGUOUS_INTENT | BELOW_THRESHOLD | UNKNOWN_SUPPLIER | INSUFFICIENT_DATA",
  "message": "Human-readable error description",
  "context": "What the agent was attempting when the error occurred",
  "fallback_action": "what the agent did instead",
  "escalate": true,
  "escalation_target": "Agent name or 'human'",
  "recovery_hint": "What information or action would resolve this"
}
```

**Store Ops Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| WhatsApp message unparseable | `PARSE_FAILED` | Reply: "Mohon ulangi pesannya ya — saya belum paham. Bisa diketik ulang?" | No |
| WooCommerce API returns error | `API_ERROR` | Log error, flag for Operations, reply customer "Sedang ada masalah teknis, pesanan diproses manual" | Yes → Operations |
| Product out of stock | `INSUFFICIENT_DATA` | Query CATALOG.md for alternatives, offer substitutes | No |
| Order value > Rp 2M | `AMBIGUOUS_INTENT` | Flag for human review before confirming | Yes → human |
| Payment not confirmed > 48h | `API_ERROR` | Send follow-up message, if no response after 72h mark pending-cancel | Yes → human |
| Intent = complaint | `BELOW_THRESHOLD` | Do not attempt to resolve. Acknowledge, apologize, escalate immediately | Yes → human |

**Content Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| No cupping data for product | `INSUFFICIENT_DATA` | Write generic tasting notes based on origin/process; flag "not cup-tested" in notes | No |
| Conflicting information sources | `PARSE_FAILED` | Prioritize most recent source; note discrepancy in output | No |
| Customer feedback contradicts cupping | `AMBIGUOUS_INTENT` | Note both perspectives; do not resolve the contradiction | No |
| Image generation fails | `API_ERROR` | Fall back to text-only caption | No |

**Research Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| Supplier quote missing key data | `INSUFFICIENT_DATA` | Flag missing fields in output; do not estimate | No |
| Price feed unavailable | `API_ERROR` | Add staleness warning; output last-known price with disclaimer | No |
| Cupping score below 80 | `BELOW_THRESHOLD` | Mark as "reject for specialty"; include in output with explanation | No |
| Supplier not in database | `UNKNOWN_SUPPLIER` | Log as new supplier, request human to verify before onboarding | Yes → human |

**Operations Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| Container ETA unknown | `AMBIGUOUS_INTENT` | Contact freight forwarder; do not guess | No |
| QC check reveals defects | `BELOW_THRESHOLD` | Stop fulfillment, notify Compliance | Yes → Compliance |
| Inventory count mismatch | `PARSE_FAILED` | Recount; if still mismatch, flag for audit | Yes → human |
| Customs delay > expected | `API_ERROR` | Escalate to Compliance for permit review | Yes → Compliance |

**Compliance Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| BPOM number format invalid | `PARSE_FAILED` | Return checklist with flag; do not self-certify | No |
| Product has no halal status | `AMBIGUOUS_INTENT` | Flag as "requires halal review"; do not list as halal | No |
| Unknown regulatory scenario | `UNKNOWN_SUPPLIER` | Route to external legal counsel | Yes → external |

**Archive Agent — Error Handling:**

| Error | Code | Fallback Action | Escalate? |
|-------|------|-----------------|------------|
| Record already exists (duplicate ID) | `PARSE_FAILED` | Return existing record; do not overwrite without explicit update command | No |
| Schema mismatch on write | `PARSE_FAILED` | Return error with expected schema; do not write partial data | No |
| Query returns no results | `INSUFFICIENT_DATA` | Return empty result set with suggested broader query | No |

---

## Core Knowledge Areas

### 1. Green Coffee Sourcing

**Major Origins & Profiles:**

| Origin | Key Regions | Common Varieties | Flavor Notes |
|--------|-------------|------------------|-------------|
| Ethiopia | Yirgacheffe, Sidamo, Guji | Heirloom, Typica | Floral, citrus, bergamot, berry |
| Colombia | Huila, Nariño, Tolima | Castillo, Caturra, Colombia | Caramel, stone fruit, chocolate |
| Guatemala | Antigua, Huehuetenango | Bourbon, Typica, Caturra | Chocolate, spice, nuttiness |
| Kenya | Nyeri, Kirinyaga | SL28, SL34, Ruiru 11 | Blackcurrant, grapefruit, tomato |
| Brazil | Mogiana, Sul de Minas, Cerrado | Mundo Novo, Bourbon, Catuaí | Nutty, chocolate, low acidity |
| Costa Rica | Tarrazú, Central Valley | Caturra, Catuaí, Villa Sarchi | Honey, citrus, clean finish |
| Panama | Boquete, Volcán | Geisha, Bourbon, Caturra | Jasmine, bergamot, tropical fruit |
| Yemen | Haraaz, Bani Matar | Heirloom | Dried fruit, wine, complex spice |
| Indonesia | Sumatra, Java, Sulawesi, Flores | Typica, Catimor | Earthy, herbal, woody, full body |

#### Indonesian Origins

Indonesia is the world's fourth-largest coffee producer, unique for its dominant use of **Giling Basah (wet-hulling)** processing and its archipelago geography, which produces distinct regional flavor profiles across Sumatran, Javan, Sulawesi, Flores, Balinese, and Papuan origins.

##### Sumatra — Mandheling, Lintong, Gayo

**Key Regions:**
- **North Sumatra**: Mandheling (Lake Toba region), Lintong (Lintongnihuta highlands)
- **Aceh**: Gayo highlands around Banda Aceh, Lake Tawar

**Common Varieties:** Typica, Catimor (Ateng, Bergimus sub-variants), Tim Tim (Hybrid of Timor)

**Processing: Giling Basah (Wet-Hull)**

The defining process for Sumatran coffee. Steps:

1. **Cherry picking**: Ripe cherries harvested, pulped same day
2. **Fermentation**: Overnight in tanks, 12–24 hours
3. **Washing**: Rinsed with clean water to remove mucilage
4. **First Drying**: Beans dried to ~30–35% moisture content (1–3 days on raised beds or concrete patios)
5. **Wet-Hulling**: Hull removed mechanically while beans still moist — this is the defining step. Gives beans their characteristic blue-green "kulit ari" (pergamino remnant) appearance
6. **Second Drying**: Hulled beans dried again to ~12–13% export moisture

**Flavor Profile:** Earthy, cedar, herbal, dark chocolate, low acidity, syrupy body, "funky" low notes. The wet-hull process creates the distinctive Sumatran profile — heavy body, muted acidity, deep earthiness.

**FOB Pricing:** $2.50–$4.50/lb for specialty Mandheling/Gayo lots

**Harvest:**
- Main crop: October–March
- Fly crop: May–July (lower quality, smaller volume)

**Key Exporters/Contacts:** Counter Culture Coffee (Gayo), Sucafina Indonesia, Pacific Commodities

##### Java — Estate Coffee

**Key Regions:** East Java: Ijen plateau, Bondowoso, Jampit, Blawan, Tugosari estates; West Java: Pangalengan highlands

**History:** Dutch colonial estates from the 17th–19th century. Indonesia's oldest coffee-producing region with continuous estate tradition.

**Common Varieties:** Typica, Bourbon (older estates), Catimor (newer plantings)

**Processing:** Mostly washed on estate operations. Smaller farms may use natural or Giling Basah.

**Flavor Profile:** Full body, dark chocolate, earthy with spicy/herbal notes. Some lots have a distinctive "smoky" character from estate processing. Cleaner than Sumatra, moderate acidity.

**FOB Pricing:** $3.00–$6.00/lb for estate Java

**Harvest:** Main crop November–April

**Note:** Java estates are relatively large, corporate operations (PTPN group). Smaller farmer collectives also exist.

##### Sulawesi — Toraja, Kalosi, Mamasa

**Key Regions:** South Sulawesi: Tana Toraja highlands around Mount Latimojong; Mamasa: Western Sulawesi highlands; Kalosi: specialty market designation

**Common Varieties:** Typica, Catimor (smallholder-sourced Catimor in Toraja)

**Processing:** Mostly washed, with some Giling Basah. Increasingly honey process on specialty lots.

**Flavor Profile:** Complex, earthy but cleaner than Sumatra, dark fruit, long finish, slightly spicy. Toraja has notably more acidity than typical Indonesian coffee — the most "bright" of the major Indonesian origins.

**FOB Pricing:** $3.50–$6.00/lb

**Harvest:** Main crop May–October

**Sourcing Note:** Sulawesi coffee typically flows through collector/aggregator networks rather than direct estate relationships. Less direct traceability.

##### Flores — Bajawa, Manggarai, Ruteng

**Key Regions:** Central Nusa Tenggara: Bajawa volcano region, Manggarai, Ruteng. Isolated island geography with volcanic soils.

**Common Varieties:** Typica, local Typica lines. Relatively isolated means less disease pressure — older variety lines have survived.

**Processing:** Mostly washed, some Giling Basah.

**Flavor Profile:** Earthy, woody, hint of citrus, cleaner than Sumatra. Volcanic soil contributes distinct mineral notes. An emerging specialty origin.

**FOB Pricing:** $3.00–$5.00/lb

**Harvest:** June–December

**Note:** Emerging specialty origin. Limited exporter infrastructure — supply chains less developed.

##### Bali — Kintamani

**Key Region:** Kintamani highlands, Bangli district, Mount Agung volcanic slopes.

**Common Varieties:** Typica, Bourbon, Catimor (local variant called "Kintamani")

**Processing:** Primarily wet (traditional Balinese farming cooperatives).

**Flavor Profile:** Bright acidity for Indonesian coffee, citrus, tropical fruit, some herbal notes, cleaner than Sumatra. Among the most "origin-expressive" of Indonesian coffees.

**FOB Pricing:** $3.00–$5.50/lb

**Harvest:** May–October

**Note:** Relatively small volume. Unique cultural context — Bali is Hindu in majority-Muslim Indonesia.

##### Papua — Baliem Valley

**Key Region:** Baliem Valley, Jayawijaya highlands, 1400–2000m elevation. Very remote.

**Common Varieties:** Improved Typica, local lines

**Processing:** Mostly Giling Basah, some washed.

**Flavor Profile:** Heavy body, earthy, low to mid acidity, wild forest notes.

**FOB Pricing:** $2.50–$4.00/lb

**Harvest:** April–September

**Note:** Very remote origin, limited exporter access. Political complexity around West Papua. Supply chain can be unreliable. Not a primary sourcing origin for most roasters.

##### Giling Basah (Wet-Hull) — Technical Deep Dive

**What Makes It Unique:** Hull is removed at high moisture content (typically 30–35%), whereas most coffee globally is hulled at 11–12% moisture after full drying.

**Why It Developed in Indonesia:** Indonesian climate is extremely humid, especially in Sumatra. Drying coffee to 11% in this humidity is difficult and slow. Wet-hulling allows farmers to dry to a safer intermediate moisture (~30–35%) and still process the bean to a storable, exportable state.

**The Result — Not a Defect:**
- Beans shrink and wrinkle during hulling at high moisture
- Characteristic "kulit ari" or pergamino remnant appearance on beans
- Color turns blue-green (not the brown of washed coffees)
- This is a defined process, not a defect — though poor execution creates defects

**Flavor Impact:** Creates the earthy, herbaceous, low-acid profile defining Sumatran/Mandheling style. Contributes to syrupy body. The "funky" bottom notes (earthy, herbal, cedar) are products of this process.

**Risks When Done Incorrectly:**
- Too much moisture at hulling → mold development, musty off-flavors
- Inconsistent fermentation → irregular flavor development
- "Potato defect" — rare in Indonesia but possible with poor handling

**When to Reject Indonesian Lots:**
- Strong musty/earthy smell beyond characteristic profile
- Visible mold on beans
- "Rubbery" off-flavor (improper fermentation)
- Very high moisture content on arrival (>13%)

##### Sourcing from Indonesia — Practical Notes

**Supplier Types:**

| Type | Examples | Pros | Cons |
|------|----------|------|------|
| Large exporters | Sucafina, Olam, ECOM | Easier logistics, consistent volume | Less traceability, commodity focus |
| Specialty-focused | Pacific Commodities, Vecmont | More traceability, quality focus | Smaller lots, higher minimums |
| Farmer cooperatives | Gayo Organic Coffee Cooperative, KNT | Direct, highland, excellent quality | MOQ challenging, lead time |
| Collectors/aggregators | Various Sulawesi networks | Accessible for remote origins | Less traceability, variable quality |

**MOQ:** Typically 1–5 × 60kg bags for specialty micro-lots. Exporters often ship 1-bag samples for quality approval.

**Logistics:** Primary ports: Surabaya, Semarang (Java). Transit to US East Coast: ~4–6 weeks. Transshipment through Singapore often required.

**Certifications:** Organic (USDA, EU), Rainforest Alliance, UTZ, Fair Trade exist but less common for smallholder lots. Verify per-lot — do not assume based on origin.

**Cupping Notes — What to Look For:**

| Note | Quality Implication |
|------|---------------------|
| Earthy, herbal, cedar | Characteristic of good Indonesian; desirable |
| Tobacco | Acceptable, especially in Java |
| Dark chocolate | Desirable, indicates proper development |
| Musty, moldy | REJECT — processing/storage problem |
| Rubber, chemical | REJECT — fermentation fault |
| Potato | REJECT — serious defect (rare in Indonesia) |

**Common Defects:** Water damage (humid storage), fermentation inconsistency, insect damage in field, immature beans from fly crop, hulling damage from wet-hull process if poorly executed.

**Regional Flavor Summary:**

| Origin | Body | Acidity | Key Notes | Best For |
|--------|------|---------|-----------|----------|
| Sumatra Mandheling/Gayo | Very Heavy | Low | Earthy, cedar, herbal, chocolate | Espresso blends, dark roasts |
| Java Estate | Full | Medium | Dark chocolate, smoky, earthy | Drip, espresso |
| Sulawesi Toraja | Full | Medium-High | Complex, dark fruit, spicy | Single origin pour-overs |
| Flores Bajawa | Medium-Full | Medium | Earthy, woody, citrus, mineral | Single origin, light roast |
| Bali Kintamani | Medium | Medium-High | Citrus, tropical fruit, clean | Bright pour-overs |
| Papua Baliem | Heavy | Low-Mid | Earthy, forest, wild | Blending, dark applications |

**Processing Methods:**

- **Washed (Wet)**: Fruit removed before drying. Clean, bright, consistent. High acidity, clarity of origin.
- **Natural (Dry)**: Coffee dried whole with fruit. Fruity, heavy body, complex. Can be inconsistent.
- **Honey**: Partial fruit removal leaving mucilage on bean during drying. Balance of clean and fruity. White honey (least) → Yellow → Red → Black (most mucilage retained).
- **Anaerobic**: Fermented in sealed tanks without oxygen. Intense, wine-like, distinct flavor development.
- **Carbonic Maceration**: Whole cherries in CO2 environment. Very fruity, floral, innovative.

**Variety Basics:**

- **Typica**: Original mutation, high quality, low yield, susceptible to disease
- **Bourbon**: French island variety, sweeter, more productive than Typica
- **Caturra**: Natural Bourbon mutation, compact, high quality
- **Catuaí**: Caturra × Mundo Novo hybrid, widely planted in Latin America
- **Castillo**: Colombian hybrid, disease resistant, acceptable quality
- **Heirloom**: Unidentified indigenous varieties (especially in Ethiopia, Yemen)
- **Geisha (Gesha)**: Panamanian variety renowned for extraordinary floral/tea-like character

**Sourcing Workflow:**

1. Define target flavor profile (acidity level, body, fruit intensity, finish)
2. Identify origins and processing methods that deliver that profile
3. Request samples (typically 250g–1kg micro-lots)
4. Conduct cupping evaluation (see Cupping Protocols)
5. Negotiate: FOB price, quantity, delivery schedule, processing specs
6. Confirm: place order, arrange shipping, track transit

**Typical Sample Lead Time:** 2–6 weeks from request to receipt.  
**Minimum Order Quantity (MOQ):** 10–60 bags (132lb/60kg each) for most importers.  
**Shipping Time:** 2–8 weeks by sea from origin to US/EU ports.

---

### 2. Coffee Roasting

**Roast Levels (Specialty Equivalents):**

| Name | Agtron Score | Development Time % | Flavor Character |
|------|-------------|-------------------|------------------|
| Light | 85+ | 20–25% | Origin-forward, high acidity, tea-like |
| Medium-Light | 75–85 | 22–26% | Balanced, fruit-forward, mild sweetness |
| Medium | 65–75 | 24–28% | Chocolate, caramel, moderate acidity |
| Medium-Dark | 55–65 | 26–30% | Dark chocolate, low acidity, bittersweet |
| Dark | 45–55 | 28–35% | Smoky, bitter, carbon, minimal origin |
| French/Italian | <45 | >35% | Burnt, ashy, heavy roasting character |

**Development Time % (DTR):** (Time after first crack ÷ total roast time) × 100

**Roast Curve Components:**

- **Charge temperature**: typically 350–400°F (177–204°C) for sample roasters, higher for production
- **Drying phase**: 150–200°F rise to first crack; removes moisture, develops color
- **Maillard reaction**: 280–340°F; sugars and amino acids react, brown color develops, flavor precursors form
- **First crack (FC)**: audible crack around 385–400°F (196–204°C); physical expansion releases CO2
- **Post-first crack development**: most flavor evolution happens here; determines roast character
- **Drop temperature**: typically 385–420°F (196–215°C)

**Roast Profiling Workflow:**

1. Collect green analysis (density, moisture %, screen size)
2. Set target: final color, DTR, charge temp based on experience with the coffee
3. Roast initial batches, cup each, record observations
4. Adjust: more development for body/sweetness, less for brightness/acidity
5. Repeat until target profile achieved
6. Document curve (time-temperature data) for reproducibility

**Roast Loss:** Typical weight loss 12–18% depending on density, moisture, and roast level.  
**Batch Size:** Production roasters range from 1kg (sample) to 120kg+ (industrial).  
**Roast Time:** 8–15 minutes for sample/small batch, 10–18 minutes for production.

---

#### Indonesian Coffee Roasting Notes

Giling Basah (wet-hull) beans have distinct roasting behavior compared to standard washed or natural coffees. Adjust your approach when roasting Indonesian origins:

**Giling Basah Characteristics Affecting Roasting:**

- **High residual moisture**: Wet-hulled beans typically enter the roaster at 15–20% moisture (vs 10–12% for washed). The drying phase runs longer and cooler — pushing heat too early causes uneven moisture evaporation and mutes the flavor development.
- **Lower bean density**: Wet-hulling reduces bean density, making beans more susceptible to scorching and requiring gentler heat application.
- **Irregular size distribution**: Mix of screen sizes means beans develop unevenly in the same batch. Account for this with more generous development time.
- **Thin parchment remnant**: The "kulit ari" (pergamino remnant) left after wet-hulling can create a slightly papery note if over-developed. Best practice: end the roast while bean interior is still slightly soft at the core.

**Recommended Adjustments by Origin:**

| Origin | Key Adjustment |
|--------|---------------|
| Sumatra Mandheling/Gayo | Lower charge temp ~10–15°F vs washed. Longer drying phase. More development time post-FC to tame the earthy/herbal intensity. Medium-Dark to Dark suits the origin profile. |
| Java Estate | Similar to washed — follows standard profile. Some darker estate lots benefit from slightly longer Maillard for smoky character. |
| Sulawesi Toraja | Moderate approach. Post-FC development brings out the dark fruit complexity. Don't rush the finish. |
| Flores Bajawa | Lower density — watch for scorching at high drum speeds. Lighter roasts preserve the citrus/mineral notes. |
| Bali Kintamani | Can handle slightly higher heat early. Bright acidity holds well — medium or medium-light works best. |

**General Rules for Indonesian Roasting:**

- **Charge temp**: 10–15°F lower than washed coffees of same density
- **Drying phase**: Extend by 1–2 minutes. Target bean color change to yellow-brown before color shift to brown.
- **First crack**: Typically quieter and later than washed coffees — don't expect the same crack intensity
- **Development time**: +2–4% DTR compared to washed equivalents. Giling Basah benefits from the extra cook.
- **Drop temperature**: 5–10°F lower than you might for a washed coffee — the residual moisture carries extra heat into the bean.
- **Rest time**: Indonesian coffees benefit from 3–5 days rest minimum after roast. The Giling Basah profile opens up significantly with degassing.

**When the Roast Goes Wrong:**

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Muddy, indistinct flavors | Under-developed, too cool a roast | Increase post-FC development time by 10–15% |
| Harsh, papery note | Over-developed or too high a drop temp | Reduce DTR 2–3%, lower drop temp |
| Burnt/chemical off-flavor | Drum too hot, scorching | Lower charge temp, slow drying phase |
| Flat, no sweetness | Too fast overall | Extend total roast time by 1–2 min |

---

### 3. Cupping Protocols (SCA Methodology)

**Standard Cupping Procedure:**

1. **Grind**: 8.25g coffee at setting 8 (SCA standard) per 150ml water
2. **Water**: Filtered, 200°F (93°C), freshly drawn
3. **Steep**: Pour all water at once, start timer, 4 minute steep
4. **Break crust**: At 4:00, break crust with spoon, push grounds back, skim foam
5. **Slurp**: At ~4:30, begin slurping from spoon to evaluate (loud slurp incorporates air)
6. **Score**: Evaluate at 5:00, 8:00, and 12:00+ minutes
7. **Rehydrate** (optional): Add hot water to dilute if too strong, re-evaluate

**SCA Scoring Scale (100-point):**

| Score | Quality Tier | Description |
|-------|-------------|-------------|
| 90+ | Outstanding | Exceptional, rare, benchmark |
| 85–89.99 | Excellent | Special, complex, notable |
| 80–84.99 | Very Good | Quality, solid, no defect |
| <80 | Not Special | Below specialty threshold |

**SCA Cupping Form — Evaluate:**

- **Fragrance/Aroma**: Dry and wet aroma intensity and quality
- **Flavor**: Taste, weighted heavily; 15% of total score
- **Aftertaste**: Persistence of flavor after swallowing, weighted 15%
- **Acidity**: Brightness, liveliness; should match origin expectations
- **Body**: Texture, mouthfeel, weight (low → high)
- **Balance**: How elements integrate together
- **Uniformity**: Consistency across cups
- **Clean Cup**: Free of taints and faults
- **Sweetness**: Natural sweetness, absence of harshness
- **Overall**: Personal impression, overall preference

**Defects (SCAA Protocol):**

- **Category 1 defects** (3 per 350g = 0 defects allowed in specialty): Sour, fermented, chemical, rubbery, etc.
- **Category 2 defects** (8 category 1 + category 2 mixed = 0 allowed): Rough, papery, woody, stale, etc.
- Count defects, convert to score penalty using SCAA tables.

**Cupping Workflow:**

1. Prepare cupping table, label samples blind
2. Grind and evaluate fragrance
3. Pour water, note bloom and aroma
4. Break crust at 4:00, smell, skim
5. Begin slurping evaluation at 4:30
6. Score at intervals; note observations
7. Clean cup, taste again with water
8. Calculate score, compare samples

---

### 4. Cafe Operations

**Espresso Dial-In Process:**

1. **Grind setting**: Start at known baseline (finer for darker roasts)
2. **Dose**: 18–20g for double shot (adjust for basket size)
3. **Yield**: Target 36–40g out (1:2 ratio) for traditional; 40–50g for modern
4. **Time**: Target 25–35 seconds
5. **Adjust logic**:

   - Too fast → grind finer (more resistance)
   - Too slow → grind coarser (less resistance)
   - Sour (under-extracted) → increase dose or grind finer
   - Bitter (over-extracted) → decrease dose or grind coarser

**Ratio Reference:**

| Style | Dose (g) | Yield (g) | Ratio | Time (s) |
|-------|----------|-----------|-------|----------|
| Ristretto | 18 | 24–28 | 1:1.3–1:1.5 | 22–28 |
| Traditional | 18–20 | 36–40 | 1:2 | 25–35 |
| Lungo | 18–20 | 50–60 | 1:2.5–1:3 | 30–45 |
| Triple | 21–22 | 42–46 | 1:2 | 28–35 |

**Milk Texturing:**

- Use fresh, cold milk (any fat % works, but consistency matters)
- Steam wand tip just below surface, create vortex
- Texture until 140°F (60°C); avoid scalding
- Target: glossy, paint-like consistency; pours smoothly

**Workflow Optimization:**

- Group orders by drink type: all espresso first, milk drinks second, cold drinks third
- Pre-gram doses in holder if time allows
- Flush group between shots to maintain temperature
- Clean steam wand immediately after use

**Barista Training Fundamentals:**

- Hand placement, tamping pressure (30lbs, level)
- Distribution techniques (WDT, OCD, tap)
- Pressure profiling vs fixed pump
- Diagnosing extraction issues

---

### 5. Supply Chain & Import

**Key Incoterms for Coffee:**

| Term | Meaning | Who Pays Freight | Risk Transfer |
|------|---------|------------------|---------------|
| FOB | Free on Board | Buyer | At origin port |
| CIF | Cost, Insurance, Freight | Seller | At destination port |
| EXW | Ex Works | Buyer | At seller's premises |
| DAP | Delivered at Place | Seller | At named place |
| DDP | Delivered Duty Paid | Seller | At destination |

**Green Coffee Import Process:**

1. Source → negotiate → confirm order
2. Arrange pre-shipment inspection (optional but recommended)
3. Book container (20ft: ~275 bags; 40ft: ~560 bags)
4. Ship via ocean freight (2–8 weeks depending on origin)
5. Customs clearance (FDA prior notice, customs entry)
6. Transfer to warehouse or direct to roastery
7. QC on arrival (moisture, screen size, defect count, cupping)

**Lead Times:**

| Origin | Sea Freight | Transit to Door | Total |
|--------|-------------|------------------|-------|
| Colombia | 7–14 days | 3–5 days | 10–19 days |
| Ethiopia | 21–35 days | 5–7 days | 26–42 days |
| Brazil | 14–21 days | 3–5 days | 17–26 days |
| Panama | 10–18 days | 3–5 days | 13–23 days |

**Warehouse Requirements:**

- Temperature: 50–70°F (10–21°C) — never above 75°F
- Relative humidity: 50–65%
- Away from direct sunlight, strong odors, moisture
- FIFO (First In, First Out) inventory rotation
- Green coffee shelf life: 12–24 months depending on origin/process

**Inventory Math:**

- Monthly consumption = bags/month
- Safety stock = 2–4 weeks supply
- Reorder point = (lead time in weeks + safety weeks) × weekly consumption
- Ideal: 6–10 weeks of stock on hand at any time

---

### 6. Pricing & Contracts

**Coffee Pricing:**

- **C-market (ICE)**: Global benchmark, driven by supply/demand, speculation. Arabica futures in cents/lb.
- **Specialty premium**: Above C-market for quality, reflects scarcity, brand, relationships
- **Fixed price contracts**: Lock price at confirmation; buyer absorbs C-market risk
- **Floating price contracts**: Price tied to C-market at delivery; both parties share risk

**Price Structure Example (2024):**

| Component | $/lb |
|-----------|------|
| C-market base | $2.00–3.50 |
| Country premium | +$0.30–1.50 |
| Processing premium (washed/specialty) | +$0.20–2.00 |
| Relationship/floor | +$0.10–0.50 |
| **FOB delivered price** | **$2.60–7.50** |
| Ocean freight | +$0.15–0.40 |
| Duties (green coffee 0¢/lb in many markets) | Varies |
| Warehouse/milling | +$0.10–0.30 |
| **Landed cost** | **~$3.00–8.50** |

**Contract Basics:**

- **Sample approval**: contract contingent on QC approval of pre-ship sample
- **Quantity tolerance**: ±5–10% at seller's option
- **Payment**: Letter of Credit (L/C), Telegraphic Transfer (TT), Net 30
- **Weight**: Landed weight or net weight (not green weight)
- **Force majeure**: Covers crop failures, port closures, weather

**Contract Workflow:**

1. Request quotation from exporter/importer
2. Negotiate: price, quantity, delivery window, terms
3. Agree on: price basis (fixed/floating), payment terms, QC method
4. Sign contract (SPA or LCAF)
5. Confirm pre-ship sample approval
6. Track shipment, arrival, final QC
7. Arrange payment per terms

---

### 7. E-commerce & Direct-to-Consumer

**Subscription Models:**

| Model | Description | Pros | Cons |
|-------|-------------|------|------|
| Prepay (6/12mo) | Pay upfront, monthly delivery | Predictable revenue, loyalty | Inventory commitment |
| Ongoing | Month-to-month, cancel anytime | Lower barrier | Uncertain demand |
| Coffee-of-Month | Surprise selection each month | Simpler logistics, discovery | Less personalization |
| Build-a-Box | Customer selects origins/roasts | Flexibility, perceived control | Complex fulfillment |

**Roast-to-Order Workflow:**

1. Customer places order online
2. Order queued (30–60 min buffer to batch)
3. Roast batch (same day or next)
4. Package and ship within 24–48 hours of roast
5. Target: delivered within 5–10 days of roast

**Shipping Green (Unroasted) Beans:**

- Legal in the US (green coffee is not a regulated food in same way)
- Requires proper labeling: country of origin, roaster info
- Shelf life is 12–24 months when stored properly
- Less carbon footprint (lighter, no degassing)
- Growing trend for home roasting enthusiasts

**E-commerce Metrics:**

- **CAC** (Customer Acquisition Cost): total sales & marketing / new customers
- **LTV** (Lifetime Value): average order × orders/year × avg lifespan
- **Target ratio**: LTV:CAC > 3:1
- **Churn rate**: % of subscribers canceling per month/quarter
- **AOV** (Average Order Value): track and optimize with bundles, subscriptions

**Platforms:** Shopify, Squarespace, WooCommerce, BigCommerce, dedicated roaster platforms (Stand, Commerce Coffee)

---

### Indonesia Ops — WhatsApp & WooCommerce

This section covers the day-to-day operational layer for Indonesian coffee businesses running WhatsApp-based orders and WooCommerce as the storefront.

---

#### WhatsApp Order Parsing

WhatsApp is the primary order channel for many Indonesian coffee businesses. Agents must parse free-form messages in Bahasa Indonesia, English, or mixed-language.

**Common Order Patterns:**

| Pattern | Example | Parsed Intent |
|---------|---------|---------------|
| Direct product request | "Mau 2 bungkus Arabica Gayo" | 2 bags × Gayo |
| Subscription | "Mau langganan 1 bulan" | Subscribe × 1 month |
| Stock inquiry | "Ada kopi Flores?" | Query stock × Flores |
| Price request | "Harga Giling Basah berapa?" | Query price × Giling Basah |
| Reorder | "Sama kayak yang lalu" | Reorder × last order |
| Partial/ambiguous | "bisa kirim ke solo?" | Query × delivery × Solo |

**Intent Classification Output (JSON):**
```json
{
  "channel": "whatsapp",
  "customer_name": "string",
  "message_raw": "string",
  "intent": "order | inquiry | subscription | complaint | reorder | other",
  "items": [
    {
      "product": "string or null",
      "quantity": number,
      "unit": "bag | kg | box | month",
      "notes": "string or null"
    }
  ],
  "delivery_address": "string or null",
  "delivery_city": "string or null",
  "confidence": 0.0-1.0,
  "requires_human": false
}
```

**Bilingual Response Templates:**

*Order confirmation (Bahasa-dominant):*
> "Halo [Nama]! Order diterima ✅\n> [Qty] × [Produk]\n> Total: Rp[Harga]\n> Dikirim ke: [Alamat]\n> Estimasi kirim: [H+1 hingga H+3]\n> Mohon konfirmasi dengan reply 'OK' ya."

*Stock unavailable (mixed):*
> "Mohon maaf, [Produk] sedang kosong. Estimasi restock: [Tanggal]. Alternative lain: [Produk pengganti] — mau dicoba?"

*Subscription inquiry (English option):*
> "For our subscription plans: 1-month (4 deliveries), 3-month (12 deliveries), or 6-month (24 deliveries). Each delivery is 250g or 500g of your chosen coffee. We roast fresh per delivery. Shall I set up your subscription?"

**Escalation Rules — Route to Human When:**
- Complaint about quality or wrong order
- Order value > Rp 2,000,000 (suspiciously large)
- Request for Net 30/60 payment terms
- Delivery address is incomplete or unclear
- Customer explicitly asks for roaster/proprietor
- Same customer has 2+ complaints in 30 days

---

#### WooCommerce Integration

**Order Status Flow:**

```
Pending Payment → Processing → Shipped → Completed
                      ↓
                  On Hold (if inventory issue)
                      ↓
                  Cancelled (if unresolved)
```

**Store Ops Agent WooCommerce Tasks:**

1. **Check new orders** — Poll WooCommerce REST API (`/wp-json/wc/v3/orders`) for status = "pending" or "processing" every 15 minutes
2. **Update inventory** — After each order, decrement stock for ordered products. If stock drops below reorder threshold, trigger inventory alert.
3. **Mark shipped** — When fulfillment posts tracking number, update order status to "shipped" and add tracking note
4. **Handle payment failures** — Orders stuck at "pending" > 48h should be flagged for follow-up

**WooCommerce Stock Alert Format:**
```json
{
  "type": "inventory_alert",
  "product_name": "string",
  "sku": "string",
  "current_stock": number,
  "reorder_threshold": number,
  "status": "low_stock | out_of_stock",
  "action_required": "reorder | contact_supplier | none",
  "eta_if_reorder": "YYYY-MM-DD"
}
```

**Key WooCommerce API Endpoints (for agent use):**
- `GET /wp-json/wc/v3/orders?status=pending,processing` — new orders
- `PUT /wp-json/wc/v3/orders/{id}` — update order status
- `GET /wp-json/wc/v3/products` — product list with stock
- `PUT /wp-json/wc/v3/products/{id}` — update stock quantity

**WooCommerce + WhatsApp Sync Rule:**
When an order ships, send WhatsApp message to customer with tracking number. Template:
> "Halo [Nama]! Pesanan sudah dikirim 🚚\n> Tracking: [Nomor Resi]\n> Ekspedisi: [Jasa Kirim]\n> Estimasi sampai: [H+2 hingga H+5]\n> Lacak di: [Link Tracking]"

---

#### Order Fulfillment Checklist

For each outgoing order:

- [ ] Verify payment received (or confirm PayLater/transfer on hold)
- [ ] Check product stock is physically available (not just WooCommerce count)
- [ ] Roast fresh if roast-to-order model (note roast date on bag label)
- [ ] Package: nitrogen flush or valve bag, opaque bag, label with: product name, roast date, net weight, BPOM/halal logos if applicable
- [ ] Attach packing slip (order number, customer name, items)
- [ ] Drop at courier before cutoff time (typically 15:00 WIB for same-day pickup)
- [ ] Update WooCommerce order status to "shipped" with tracking number
- [ ] Send WhatsApp shipping notification to customer

---

#### Pricing in IDR — Costing Basics

For Indonesian operations, all pricing is in Rupiah (IDR). Agents working in WooCommerce must handle IDR correctly.

**Key numbers:**
- USD 1 ≈ IDR 16,000 (check current rate — this fluctuates)
- 60kg green coffee bag at $13/lb FOB = ~IDR 12,480,000 per bag (before shipping, duties, local transport)
- Cost per 250g retail bag (rough): (green coffee cost + roast loss + packaging + labor) × 2.2–2.5 markup = wholesale price
- Consumer price guide (approximate):
  - 250g homebrew single origin: IDR 75,000–150,000
  - 250g premium/competition: IDR 150,000–350,000
  - Espresso-based drinks at cafe: IDR 25,000–55,000

**Margin Check:** Target gross margin ≥ 50% for wholesale, ≥ 60% for DTC retail after accounting for green coffee, packaging, labor, and shipping.

---

### 8. Regulatory Compliance

**FDA Requirements (US):**

- **FSMA (Food Safety Modernization Act)**: Requires Hazard Analysis and Risk-Based Preventive Controls (HARPC) for food facilities
- **Prior Notice**: Must notify FDA before imported food arrives at port
- **Facility Registration**: Domestic facilities must register with FDA every 2 years
- **Labeling**: Ingredient list, allergen declarations, nutrition facts (if required), country of origin

**Import Permits:**

- Green coffee generally does not require specific import permits beyond customs entry
- Some countries require phytosanitary certificates from origin
- Organic certification requires USDA-accredited certifier

**Organic Coffee:**

- Must be certified by USDA-accredited agent
- Requires: organic system plan, field history (3 years no prohibited substances)
- Additional cost: $500–$5000+ annually depending on scale
- Price premium: typically $0.30–1.00/lb at green level

**Allergen Declarations:**

- Coffee is generally allergen-free
- Cross-contact risk: milk, flavorings, chocolate added post-roast
- List any added ingredients (flavored coffees, milk powders)

**Country of Origin Labeling (COOL):**

- Required for unpackaged coffee sold in the US
- "Product of [Country]" required if >50% of value is from that country
- For blends, origin of each component if marketed as origin-specific

**EU Regulations:**
- EU Food Information Regulations: allergen labeling, nutritional info
- Maximum residue levels (MRLs) for pesticides
- Organic certification must be EU-equivalent

### Indonesian Regulatory Compliance (BPOM, SNI, Halal)

**Overview:** Indonesia's coffee market is regulated by three main frameworks: BPOM (food safety/registration), SNI (national standards), and MUI (halal certification). A fourth area covers export/import procedures. Compliance requirements vary based on whether you are roasting, packing, importing, or exporting coffee.

---

#### 1. BPOM — Badan Pengawas Obat dan Makanan

**Role:** BPOM is Indonesia's food and beverage regulatory authority, equivalent to the US FDA. All food products sold commercially in Indonesia must be registered with BPOM and carry a distribution number (ML — Nomor Lisensi) on packaging.

**Coffee Products Requiring BPOM Registration:**
- Green coffee beans (biji kopi hijau)
- Roasted coffee beans (kopi sangrai)
- Ground roasted coffee (kopi bubuk)
- Instant coffee (kopi instan)
- Ready-to-drink (RTD) coffee beverages

**BPOM Number Format:**
Format: `AI 12345678901` — 13 digits total (2-letter prefix + 11 digits). Must appear on all packaged coffee products sold in Indonesia.

**Application Process:**
1. Register company on OSS (Online Single Submission) portal (oss.go.id) to obtain NIB (Nomor Induk Berusaha — Business Identification Number)
2. Submit application via BPOM website (pom.go.id) with:
   - Company legal documents (NIB, business license)
   - Product formulation and details
   - Label design (must comply with BPOM labeling rules)
   - Test results from accredited laboratory (KAN-accredited labs)
3. BPOM review and inspection
4. Issuance of ML (distribution license) number

**Timeline:** 3–6 months for new registration. Emergency use of existing registered products (purchased from authorized distributor) can be faster.

**For Importers (e.g., Solo roaster importing green beans):**
- The importer must hold a BPOM-authorized import license
- The roaster buying from a registered importer does not always need their own BPOM number
- However, if the roaster brands and sells their own packaged product, they need their own BPOM ML number

**Key BPOM Standards for Coffee:**

| Parameter | Limit |
|-----------|-------|
| Green coffee max moisture | 12.5% |
| Roasted coffee max moisture | ≤5.0% (see SNI) |
| Aflatoxin B1 | ≤5 ppb |
| Aflatoxin total | ≤10 ppb |
| Lead | ≤0.1 mg/kg |
| Cadmium | ≤0.05 mg/kg |
| Total Viable Count (TVC) | ≤10^5 cfu/g |
| E. coli | Absent in 0.1g |
| Salmonella | Absent in 25g |

**Note on Cadmium:** Indonesian coffee often tests higher in cadmium due to volcanic soil. Roasters should source from suppliers who test and can provide documentation. This is a known issue for Toraja, Sulawesi, and some Java coffees.

**Key Contacts:**
- BPOM Head Office: Jakarta — pom.go.id
- Provincial/municipal offices in each province
- OSS portal for business licensing: oss.go.id

---

#### 2. SNI — Standar Nasional Indonesia (Indonesian National Standard)

**Standard:** SNI 01-3542:2019 — Indonesian National Standard for Roasted Coffee

**Scope:** Defines requirements for roasted coffee beans, ground roasted coffee, and instant coffee sold in Indonesia. Compliance is mandatory under Permentan 59/2018 (Ministry of Agriculture regulation making SNI mandatory for agricultural products).

**Key Requirements under SNI 01-3542:2019:**

| Parameter | Requirement |
|-----------|-------------|
| Moisture content | ≤5.0% (weight basis) |
| Ash content | 3.0–6.0% for pure coffee (detects adulteration with starch, chicory, soybean, corn) |
| Caffeine content | Minimum 0.3% for pure roasted coffee (detects adulteration) |
| Extraneous matter | ≤0.1% by weight |
| Defect count | Maximum allowable defects per 300g sample (black, sour, insect-damaged, etc.) |
| Packaging | Food-grade, airtight, light-protective (foil laminate or opaque) |
| Net content | Must match labeled amount (random government inspections) |

**SNI Certification Process:**
1. Apply to BSN (Badan Standardisasi Nasional — National Standards Body)
2. Submit product for testing by KAN-accredited laboratory
3. Factory audit by BSN assessor
4. Certificate issuance (valid for variable period, typically 1–3 years)
5. Surveillance audits

**SNI Certification Costs (approximate):**
- Initial audit: IDR 15–30 million
- Annual maintenance fees: IDR 5–15 million
- Laboratory testing: IDR 2–10 million per product

**Practical Reality for Small Roasters:**
- SNI certification is expensive and burdensome for micro/small roasters
- Most small artisan roasters operate with understanding that enforcement targets large commercial players
- However, if selling through modern retail channels (Indomaret, Alfamart, supermarkets, e-commerce platforms like Tokopedia/Shopee), retailers typically require SNI compliance
- Small roasters selling direct-to-consumer (DTC) with no retail distribution often operate without SNI, though this carries some legal risk

**SNI Mark (Tanda SNI):** Diamond-shaped mark. Not required for small artisan roasters selling direct-to-consumer if not requested by customers or retailers.

---

#### 3. Halal Certification — MUI (Majelis Ulama Indonesia)

**Background:** Indonesia has the world's largest Muslim population (~87%). Halal certification is important for market access, particularly in modern retail and for Muslim consumers.

**Legal Framework:** Law No. 33/2014 on Halal Product Assurance mandates that all food, beverage, and consumer goods sold in Indonesia must be halal-certified by 2026 (phased implementation timeline).

**Coffee Products and Halal Status:**

| Product Type | Halal Requirement |
|--------------|-------------------|
| Pure roasted coffee beans (100% coffee, no additives) | Generally NOT required — coffee itself is not haram (forbidden). Some producers get a "halal-free" letter or self-declare. |
| Flavored coffee (vanilla, caramel, etc.) | Required — added ingredients trigger mandatory certification |
| Instant coffee with sugar/creamer | Required — multi-ingredient product |
| Coffee with milk powder/cream | Required |
| Coffee-based beverages (Latte, Cappuccino mixes) | Required |

**MUI Halal Certification Process:**
1. Apply to MUI Provincial or Central office with product formulation and full ingredients list
2. Submit sample to accredited laboratory for halal testing
3. Factory audit by MUI assessor team
4. MUI Fatwa Commission review
5. Halal certificate issued

**Timeline:** 3–6 months typically
**Cost:** IDR 5–20 million depending on product complexity
**Certificate Validity:** 2 years with annual surveillance audit

**For Pure Coffee Roasters:**
If you sell only 100% roasted coffee with no additives, no flavoring, no blending with milk/cream products, you may be able to:
- Obtain a "halal-free" letter from MUI (surat keterangan bebas halal)
- Self-declare (increasingly accepted for pure single-ingredient products)

**Halal Logo:** White diamond shape with Arabic script. Required on packaging for certified products. Some specialty roasters avoid displaying the halal logo as it may limit export flexibility to non-Muslim markets.

---

#### 4. Export from Indonesia

**Inter-Island Shipping (e.g., Sumatra to Java):**
- Phytosanitary Certificate (Sertifikat Kesehatan Karantina) from Indonesian Quarantine Agency (Barantin) required
- Must meet quality standards of destination province
- Mobile coffee quality declarations

**Export from Indonesia (International):**

| Requirement | Details |
|-------------|---------|
| Phytosanitary Certificate | Required; ISPM 15 compliance for wood packaging materials |
| Certificate of Origin | From Chamber of Commerce (Kadin) — required for most destinations |
| Fumigation | Methyl bromide treatment often required; heat treatment preferred (more environmentally friendly) |
| Documentation | Cupping report, SCA score documentation helpful for customs clearance in destination country |
| Export duty | 7% on green coffee (check current rates as subject to change) |

---

#### 5. Import into Indonesia

**For Roasters Importing Green Coffee:**
- **NPIK (Nomor Pengenal Importir Khusus):** Special Importer Identification Number — required for commercial importers
- **Import Declaration (SPP):** Submitted via INSW (Indonesia National Single Window) system
- **Quarantine clearance:** Must present phytosanitary certificate from country of origin
- **Import tariffs on green coffee:**
  - Import duty: 5%
  - VAT (PPN): 10%
  - Luxury goods tax (PPnBM): Not typically applied to green coffee
- **Coffee roasting machines:** 0% import duty under HS code 8479.20.00 (check specific machine classification); VAT still applies

---

#### 6. Food Safety — HACCP, GMP, and Licensing

**BPOM Requirements:**
- HACCP (Hazard Analysis and Critical Control Points) plan required for food businesses
- GMP (Good Manufacturing Practice) certification recommended

**Basic Food Safety SOPs for Roasters:**
- Handwashing and personal hygiene
- Equipment sanitation schedules
- Pest control program
- Temperature and moisture monitoring
- Separate storage of green vs. roasted coffee
- Traceability records

**Licensing Tiers in Indonesia:**

| License Type | Description |
|--------------|-------------|
| PIRT (Produk Industri Rumah Tangga) | For home/small-scale food businesses — not suitable for commercial roasters |
| MD (Marketing Authorization) | Product registration — number assigned to registered product |
| ML (Nomor Lisensi — Distribution License) | Facility license for distribution of registered product |
| NIB (Nomor Induk Berusaha) | Business identification number from OSS — required first step |

**Recommendation for Commercial Roasters:** Aim for MD/ML from BPOM rather than PIRT. NIB is the foundational business registration obtained through oss.go.id.

---

#### Quick Reference Summary

| Requirement | Mandatory? | Notes |
|-------------|------------|-------|
| BPOM ML number | Yes (for packaged product sales) | 3–6 months to obtain |
| SNI 01-3542:2019 | Yes (for roasted coffee) | Enforced for retail; relaxed for DTC artisan |
| Halal certification | Yes (if product contains non-coffee ingredients) | 3–6 months, IDR 5–20M |
| Phytosanitary (inter-island) | Yes | From Barantin |
| Phytosanitary (export) | Yes | ISPM 15 for wood packaging |
| HACCP plan | Yes (for food businesses) | Implement basic food safety SOPs |
| Import license (NPIK) | Yes (for importers) | For roasters importing directly |

---

## 9. AI Agents in the Coffee Supply Chain

*Research findings — AI Agents in the Coffee Supply Chain (May 31, 2026)*

### 9.1 Key Finding: No Unified AI Exists

**The coffee industry has no end-to-end AI agent connecting farm to cup.** Each stage — farming, grading, roasting, trading, logistics, retail — has fragmented point solutions that don't communicate. The biggest opportunity is building agentic AI systems that connect these stages with real-time data flowing between them.

### 9.2 AI Adoption by Stage

| Stage | AI Maturity | Key Technologies |
|-------|-------------|-----------------|
| **Farming** | Low | Precision ag, satellite/drone imaging, disease detection, yield prediction |
| **Grading/QC** | Medium-High | Computer vision sorting (Demetria, Te.A.works), NIR spectroscopy |
| **Roasting** | Medium | Automated roast profiling, predictive color tracking, blend optimization |
| **Trading** | High | Price forecasting, procurement optimization, arbitrage detection |
| **Logistics** | Medium | Route optimization, cold chain monitoring, blockchain traceability |
| **Retail** | High | Demand forecasting, dynamic pricing, personalization, inventory |

**Computer vision is the most mature AI technology** in coffee — defect sorting, disease detection, and color tracking are all commercially deployed.

### 9.3 Key Companies & Technologies

**Farming AI:**
- **Cropin** (India) — farm intelligence platform, satellite + IoT, commercial deployment at large plantations
- **PlantVillage Nuru** — free disease detection app deployed in East Africa, smartphone-based
- **World Coffee Research (WCR)** — AI for breeding disease-resistant varieties

**Grading AI:**
- **Demetria** (Colombia/USA) — NIR spectroscopy + ML for green coffee quality classification, partnered with Starbucks
- **Te.A.works** (Colombia) — optical sorting with AI at processing facilities
- **Singulator** (Australia) — AI cherry grading at farm level

**Roasting AI:**
- **Banana Rain** (USA) — AI roasting "Botz" system, machine learning roast optimization
- **Bellwether Coffee** (USA) — electric smart roasters, cloud-connected, sustainability focus
- **Cropster** — market leader in roast profiling software, 2000+ roasters, large dataset of roast profiles

**Trading AI:**
- **ECOM** (Switzerland) — major global trader, proprietary AI trading and risk management
- **Volcafe** — weather + crop analytics for trading intelligence
- ICO (International Coffee Organization) — market reports with ML insights

**Logistics AI:**
- **Farmer Connect** (IBM) — blockchain + AI, Starbucks using it, 400,000+ farmers connected
- **Bext360** — origin verification, blockchain traceability
- **Mosi** — cold chain monitoring, route optimization

**Retail AI:**
- **Luckin Coffee** (China) — AI-native retailer, 10,000+ stores, app-only ordering, demand prediction at scale
- **Nespresso** — AI subscription management, churn prediction
- **Starbucks Deep Brew** — personalized recommendations, demand forecasting

### 9.4 EU Sustainability Regulations — Key Driver

The **EU Corporate Sustainability Due Diligence Directive (CSDDD)** is pushing large buyers (Nestlé, Starbucks, Lavazza) to verify sustainability claims at farm level. This is funding AI traceability tools that previously had no business case.

**Impact:** Mandatory supply chain due diligence = AI traceability becomes compliance requirement, not nice-to-have.

### 9.5 Gaps & Opportunities

**Gaps:**
- Smallholder farmers (~80% of global coffee) lack affordable AI tools — connectivity and cost barriers
- Electronic nose for flavor prediction — 3-5 years away from commercial reliability
- No end-to-end AI system connecting farm to cup
- Real-time quality tracking during shipping — sensor cost barriers

**Opportunities for Coffee Trading AI:**
1. **Coffee as macro signal** — The intelligence layer can ingest coffee commodity data (Arabica/Robusta prices, weather in origin countries, ICO reports) as a macro input for crypto trading. Coffee prices correlate with inflation and emerging market sentiment.

2. **Coffee trading via crypto exchanges** — Apply a trading AI decision engine framework to coffee futures. Start with Binance/Bybit coffee perpetual contracts for market data.

3. **Extending to coffee** — Existing macro + sentiment analysis capability can extend to coffee commodity research without new infrastructure.

**Build Opportunities:**
4. **Farm-to-cup data aggregation agent** — connects Cropin (farm data), Demetria (grading), Cropster (roasting), and logistics APIs. Gives roasters/traders real-time visibility across supply chain.

5. **Smallholder decision support agent** — mobile-first, works offline, harvest timing + disease alerts + market prices. On-device ML to handle connectivity gaps.

6. **Coffee price intelligence agent** — real-time monitoring of Arabica/Robusta prices, weather in origins, news. Buy/sell signals for physical traders and arbitrage across exchanges.

7. **Sustainability compliance agent** — tracks EU regulations, auto-generates required documentation from supply chain data.

### 9.6 Important Caveats

- **Fully autonomous roasting** — still requires human sensory validation. AI handles process control, not flavor judgment.
- **Disease detection accuracy** in varied field conditions — [UNVERIFIED]
- **Electronic nose** — 3-5 years away from commercial viability for coffee flavor prediction
- **Price forecasting models** — coffee price shocks from climate events (frost, drought) remain hard to predict. AI helps but human judgment on climate risk is still superior.
- **Blockchain traceability ≠ fair pricing** — farmers often still receive minimum prices even with full traceability. Tracing coffee doesn't automatically improve farmer livelihoods.

### 9.7 Source Quality

**Well-documented:** Cropin, Demetria, Farmer Connect, ECOM, Volcafe, Cropster, Luckin Coffee, Starbucks (earnings reports), SCA working groups.

**Growing/less data:** Mosi, EcoChain, Pecan Machine, Banana Rain (specialty press only), Xcafé (limited English documentation).

**Key industry voices:** James Hoffmann (World Barista Champion), SCA technical committees, World Coffee Research, ICO.

---

## Glossary of Key Terms

**Agronomy**

- **Arabica**: Primary coffee species (~60% of production), higher quality, more delicate, ~1.5% caffeine
- **Robusta**: Secondary species, higher caffeine, more bitter, used for espresso blends and instant
- **Varietal/Variety**: Specific cultivar of coffee plant (Geisha, Bourbon, Castillo, etc.)
- **Heirloom**: Traditional varieties, often unspecified origin varieties
- **Estate/Farm**: Single farm producing coffee (vs. cooperative or washing station blend)
- **Cooperative/Coop**: Association of smallholder farmers pooling resources

**Processing**

- **Washing station/Central mill**: Facility where cherries are processed
- **Wet milling**: Removing fruit mechanically with water
- **Fermentation**: Microbes breaking down mucilage (hours to days)
- **Drying**: Reducing moisture from ~60% to 10–12% (sun, mechanical, raised beds)
- **Mucilage**: Sticky sugar layer between skin and bean
- ** parchment**: Dry hulled shell surrounding green bean (removed at dry mill)
- **Green coffee**: Processed, dried, ready-to-roast coffee bean
- **Screen size**: Physical size grading (17/18 = largest, 13/14 = smallest)

**Roasting**

- **Charge**: Initial green coffee load into roaster
- **Drying phase**: Initial stage, moisture evaporation (yellowing)
- **Maillard**: Chemical reaction creating brown color and flavor precursors (~280°F+)
- **First crack**: Audible crack signaling start of development phase (~385–400°F)
- **Development time ratio (DTR)**: Post-FC time / total roast time
- **Drop**: End of roast when coffee is discharged
- **Rest/degassing**: CO2 release after roasting (24–72 hrs before brewing)
- **Roast level**: Light to dark classification

**Quality**

- **Cupping**: Professional evaluation method, standardized protocol
- **Q Grader**: SCA-certified coffee quality professional
- **SCA score**: 100-point specialty coffee evaluation scale
- **Defect**: Off-flavor from farming, processing, or storage issues
- **Taint**: Noticeable off-flavor, lower score impact
- **Fault**: Severe off-flavor, major score impact
- **Acidity**: Brightness, preferred in specialty; too much = sharp/unpleasant
- **Body**: Weight, texture in the mouth, ranging from tea-like to syrupy
- **Balance**: How flavor elements integrate

**Trading & Contracts**

- **FOB (Free on Board)**: Price includes delivery to origin port
- **CIF (Cost, Insurance, Freight)**: Price includes delivery to destination port
- **C-market**: ICE Arabica coffee futures market
- **Settlement**: Final price at delivery based on contract terms
- **Letter of Credit (L/C)**: Bank-guaranteed payment method
- **T/T (Telegraphic Transfer)**: Wire transfer payment
- **Net 30**: Payment terms, 30 days from invoice
- **SPA**: Simple Purchase Agreement
- **LCAF**: Licensed Coffee Import Agreement (industry standard contract)

**Equipment**

- **Roaster**: Machine for roasting coffee (drum, fluidized bed, hot air)
- **Brewer**: Equipment for brewing (espresso machine, drip, pour-over, batch)
- **Grinder**: Machine for grinding coffee (burr vs blade)
- **Dial-in**: Process of adjusting grind to achieve target extraction
- **Temperature surfing**: Managing group temperature for consistency
- **Pressure profiling**: Varying pressure during extraction

**E-commerce & Ops**

- **DTC**: Direct-to-consumer
- **AOV**: Average Order Value
- **CAC**: Customer Acquisition Cost
- **LTV/LTV:CAC**: Lifetime Value ratio
- **FIFO**: First In, First Out (inventory rotation)
- **MOQ**: Minimum Order Quantity
- **Lead time**: Time from order to delivery
- **SKU**: Stock Keeping Unit
- **ROAS**: Return on Advertising Spend

---

## Workflows

### Workflow 1: Sourcing a New Origin

**Objective:** Evaluate and source a new green coffee supplier.

**Steps:**

1. **Define targets**: What flavor profile? What price range? What volumes?
2. **Research**: Identify origins/regions producing desired profile. Ask importers for recommendations.
3. **Request samples**: Contact exporter/importer. Request 250g–1kg sample of target lots. Clarify: variety, processing, harvest date, farm/station name.
4. **Receive & prep**: Upon receipt, check: moisture (10–12%), screen size, defect count (visual), bag integrity.
5. **Cup**: Run SCA cupping protocol. Score blind. Note: fragrance, flavor, acidity, body, aftertaste, overall.
6. **Compare**: Score sheet vs. profile targets. Identify top performers.
7. **Request info**: For finalists, get: farm details, certifications, processing specs, export history.
8. **Negotiate**: Quote for 10–60 bags. Confirm: price (FOB/CIF), payment terms, lead time, sample approval clause.
9. **Contract**: Sign SPA. Confirm pre-ship sample approval required.
10. **Track**: Monitor production, shipping, arrival. Cup arrival sample against pre-ship sample.
11. **Approve or reject**: If arrival QC matches or exceeds sample, approve. If not, invoke contract clause.

**Tools:** Cupping forms (SCA template), supplier database (spreadsheet or Notion), sample tracking log.

---

### Workflow 2: Developing a Roast Profile

**Objective:** Create a roast curve to achieve target flavor from a given green coffee.

**Steps:**

1. **Green analysis**: Check moisture (10–12%), density (floating test or equipment), screen size distribution.
2. **Set target**: Based on origin and processing (e.g., washed Ethiopian → target high acidity, floral notes, light body).
3. **Initial roast**: Baseline charge temp, moderate DTR (22–24%). Cup, record observations.
4. **Evaluate**: Identify gaps between flavor and target.
5. **Adjust curve**:

   - Want more brightness? → Increase charge temp slightly, reduce DTR
   - Want more body/sweetness? → Extend DTR, slightly higher post-FC development
   - Want to preserve delicate florals? → Reduce overall heat application, shorten DTR
   - Want more chocolate/nutty? → Lower charge temp, extend DTR to medium roast level

6. **Second roast**: Apply adjustment. Cup.
7. **Iterate**: Repeat 2–3 batches until target achieved.
8. **Document**: Save curve data (time-temperature chart). Note: charge temp, roast time, DTR, drop temp, batch size.
9. **Validate**: Run same curve on different day with same green. Confirm reproducibility.
10. **Scale up**: Apply curve to production roaster (may need minor adjustment vs. sample roaster).

**Tools:** Roast profiling software (Artisan, Cropster, Roastlog), color meter (Agtron), spreadsheet for curve data.

---

### Workflow 3: Espresso Dial-In

**Objective:** Achieve target extraction parameters for a given coffee on a given machine.

**Steps:**

1. **Know your baseline**: Start from known grind setting for that roast level (finer for lighter, coarser for darker).
2. **Set dose**: 18–20g into double basket (verify basket size).
3. **Pull shot**: Note: extraction time, yield, visual flow (fast/slow, sputtering).
4. **Taste**: Evaluate against target (e.g., balanced, sweet, no sour/bitter).
5. **Adjust based on symptoms**:

   | Symptom | Cause | Fix |
   |---------|-------|-----|
   | Too fast (<25s), sour | Under-extracted | Grind finer, increase dose |
   | Too slow (>35s), bitter | Over-extracted | Grind coarser, decrease dose |
   | Right time but sour | Not enough extraction | Grind finer |
   | Right time but bitter | Too much extraction | Grind coarser |
   | Channeling, inconsistent | Distribution issue | Use WDT, level, tap |

6. **Repeat**: Pull next shot with adjustment. Taste. Continue until dialed.
7. **Lock in**: Record grind setting, dose, yield, time as dialed recipe.
8. **Re-dial when**: Coffee changes (new batch, different roast date, origin change).

**Tools:** Refractometer (for TDS/extraction %), shot timer, dose scale (0.1g precision), tamper.

---

### Workflow 4: Cupping Session (SCA Protocol)

**Objective:** Evaluate multiple coffees in a standardized format.

**Steps:**

1. **Prep**: Set up cupping table. Grind each sample to SCA standard (8.25g : 150ml). Label blind (code only).
2. **Grind & smell**: Grind each, note fragrance/aroma dry.
3. **Pour**: 200°F water to 150ml mark on each cup. Start timer.
4. **Steep**: At 4:00, break crust with spoon. Push grounds back, skim foam.
5. **Slurp**: At 4:30, begin slurping from spoon. Cup each at 5:00, 8:00, 12:00+.
6. **Score**: Use SCA form. Assign scores for each attribute.
7. **Calculate**: Sum attributes + subtract defects = total score.
8. **Compare**: Tabulate scores. Note top performers and why.
9. **Re-taste**: With water to reset palate. Final ranking.
10. **Document**: Record observations, scores, and recommendations.

**Tools:** SCA cupping form, cupping bowls, spoons, grinder, kettle, timer, hot water source.

---

### Workflow 5: Menu Costing & Pricing

**Objective:** Calculate food cost and set menu prices for cafe drinks.

**Steps:**

1. **Determine recipe**: List ingredients, quantities per drink.
2. **Calculate ingredient cost**: Using purchase price per unit. Example: espresso shot uses 18g coffee. At $15/lb green, and 12% roast loss, coffee cost = $15/lb × 1.12 / 453.6g × 18g = $0.67.
3. **Sum costs**: Add all ingredients (milk, syrup, cup, lid, straw).
4. **Apply food cost target**: Divide ingredient cost by target food cost %. If target FC% = 30%, menu price = cost / 0.30.
5. **Test price**: Compare to market. Adjust if needed (competition, positioning).
6. **Document**: Recipe card with cost breakdown and target price.
7. **Re-price quarterly**: Recalculate as ingredient prices change.

**Tools:** Spreadsheet (cost calculator), POS system (for actual cost tracking), recipe management software.

---

## Tools

**Web & Research:**

- **Google**: Search for origin information, supplier directories, market news
- **ICE Futures**: Check C-market arabica coffee futures prices
- **SCA News**: Specialty Coffee Association publications, research
- **Coffee Commodity Index**: Real-time pricing data
- **Origin trip reports**: Farm documentation, processing notes

**Software:**

- **Artisan**: Open-source roast profiling and data logging
- **Cropster**: Professional roast management, inventory, quality control
- **Roastlog**: Simple roast logging
- **Square/Shopify**: POS and e-commerce
- **QuickBooks/Xero**: Accounting
- **Notion/Airtable**: Supplier and inventory database
- **Google Sheets/Excel**: Cost modeling, inventory tracking, cupping forms

**Equipment (physical):**

- **Coffee refractometer**: Measures TDS and extraction % (e.g., Atago, VST)
- **Color meter**: Agtron/Ellis for roast color measurement
- **Moisture analyzer**: For green coffee moisture testing
- **Doser grinder**: Precision dosing for espresso
- **Precision scale**: 0.1g resolution for weighing
- **Tamper**: Flat, level tamper for espresso puck
- **Distribution tool**: WDT (Weiss Distribution Technique) or OCD (On Coffee)

---

## Pitfalls to Avoid

1. **Buying on price alone**: Lowest cost green often means compromise on quality or consistency. Specialty is premium for a reason.

2. **Skipping pre-ship approval**: Without sample approval clause, you accept whatever arrives. Insist on approval.

3. **Underestimating lead time**: Specialty coffee can take 4–8+ weeks from order to arrival. Plan inventory accordingly.

4. **Cupping incorrectly**: Rushing the steep, not breaking crust properly, or slurping too quietly misses key aromatics. Follow protocol.

5. **Roast profile too hot**: Pushing too hard damages delicate origin character. Heat is a tool, not a goal.

6. **Dial-in without measuring**: Eyeballing extraction leads to inconsistency. Use scale, timer, refractometer.

7. **Ignoring degassing**: Brewing coffee too fresh (under 24hrs post-roast) causes poor extraction and off-gassing flavors. Rest before brewing.

8. **Over-roasting to hide defects**: Using very dark roast to mask mediocre green. Proper roasting showcases quality.

9. **FIFO failure**: Older coffee in front of newer. Rotate stock properly to prevent staleness.

10. **Contract without QC clause**: Always include pre-ship sample approval or arrival QC rejection clause.

11. **Underpricing drinks**: Menu prices should reflect quality. Calculate real costs including labor, rent, overhead.

12. **Ignoring regulatory changes**: FDA FSMA compliance is not optional for food businesses. Stay current.

13. **Scaling before testing**: Don't commit to large orders of new origin without cupping multiple samples.

14. **Shipping speed vs cost**: Air freight is 5–10x faster but 3–5x more expensive. Weight cost against cash flow.

15. **All-in-one contracts**: Avoid contracts with no escape clause if QC fails on arrival.

---

## File Naming Conventions

Standardize file names for easy searching and version control.

```
[YYYY-MM-DD]_[Type]_[Origin]_[Roaster/Supplier]_[Notes]

Examples:
2024-03-15_cupping_Ethiopia-Yirgacheffe_ABC-Importers_sample-A.docx
2024-04-02_roast-profile_Colombia-Huila_Production-roast_curves.xlsx
2024-05-10_contract_Brazil-Cerrado_FOB-Net30_SPA.docx
2024-06-20_inventory_green-coffee_warehouse_2024-Q2.xlsx
2024-07-05_menu-costing_Espresso-drinks_2024-v2.xlsx
```

**Type prefixes:**

- cupping_
- roast-profile_
- contract_
- inventory_
- menu-costing_
- sourcing_
- supplier_
- equipment_
- regulatory_

---

## Example Prompts

**Green Coffee Sourcing:**
> "I need to source a natural process coffee from Colombia with notes of blueberry and dark chocolate. We want to buy 30 bags, FOB. Find me 3 supplier options with pricing and lead times."

> "We received our arrival sample of Ethiopian Yirgacheffe. Help me run an SCA cupping and compare it to the pre-ship sample we approved. Document the results."

**Roasting:**
> "I have 20kg of washed Kenya SL28. I want to achieve a medium-light roast that highlights the blackcurrant acidity but preserves the sweetness. Design a roast curve and help me iterate on it."

> "Our last roast of Brazil Cerrado turned out too dark and bitter. Analyze the roast curve and identify what went wrong. Suggest corrections for the next batch."

**Cupping:**
> "Run a SCA cupping protocol for 6 samples I have. Label them blind, prepare the table, run the full protocol, and give me a scored ranking with flavor notes."

> "I need to compare two processing methods for the same lot. We have washed and natural versions of a Panamanian Geisha. Cup them side-by-side and tell me which you prefer and why."

**Cafe Operations:**
> "We just changed to a new coffee, medium roast from Guatemala. Help me dial in the espresso on a La Marzocco Linea. Walk me through the process step by step."

> "Our milk drinks are inconsistent between baristas. Create a training checklist for milk texturing and espresso extraction to standardize quality."

**Supply Chain:**
> "We need to order more green coffee. Our current stock is 45 bags, we use about 15 bags/week, and the lead time from Colombia is 3 weeks. Calculate reorder point and safety stock. Advise on timing."

> "Review this FOB contract for Ethiopian Yirgacheffe. Identify any unusual terms, risks, or missing clauses. Flag anything that needs negotiation."

**E-commerce:**
> "Design a coffee subscription model for a small roaster. Options: prepaid 6-month at 15% discount, or month-to-month ongoing. Calculate pricing given our landed cost of $4.50/lb and target 35% food cost."

> "Our churn rate increased from 5% to 8% this quarter. Analyze possible causes and suggest 3 interventions to reduce churn for a coffee subscription service."

**Regulatory:**
> "What FDA food safety documentation do I need to maintain as a small roaster selling DTC? Outline FSMA requirements and labeling rules for coffee."

> "We want to label our blend as 'Ethiopian Blend'. What are the country of origin labeling requirements and what percentage of each origin must be present?"

---

## Reference Data (2024 Approximate)

**Typical Weights:**

- 1 bag green coffee = 60kg (132.28 lb)
- 20ft container = ~275 bags
- 40ft container = ~560 bags
- 1 lb green = ~0.88 lb roasted (12% roast loss)
- 1 kg green = ~0.88 kg roasted

**Price Benchmarks (2024):**

- C-market Arabica: ~$2.00–3.50/lb
- Colombian Excelso: ~$3.00–4.50/lb FOB
- Ethiopian Yirgacheffe: ~$3.50–6.00/lb FOB
- Panamanian Geisha: ~$15–60+/lb FOB
- Ocean freight (Colombo): ~$0.15–0.30/lb

**Equipment Ranges:**

- Sample roaster (1kg): $3,000–15,000
- Production roaster (10–30kg): $20,000–80,000
- Commercial espresso machine: $5,000–30,000
- Commercial grinder: $500–5,000
- Refractometer: $300–600

**Timing:**

- Espresso extraction: 25–35 seconds
- Roast rest before brewing: 24–72 hours
- Green coffee shelf life: 12–24 months
- Max shelf life for roasted: 6 months (degrades faster)
- Sample lead time: 2–6 weeks
- Ocean shipping: 2–8 weeks depending on origin

---

## Notes

- Specialty coffee definitions and protocols align with SCA (Specialty Coffee Association) standards
- All pricing is approximate and varies with market conditions, origin, and relationship
- Regulatory requirements vary by country; consult local authorities for specific compliance
- Cupping scores reflect subjective evaluation; use as one tool among many for sourcing decisions