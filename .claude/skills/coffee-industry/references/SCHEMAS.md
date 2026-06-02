# Archive Agent — Data Schemas

## Overview

The Archive Agent maintains a searchable historical record of all coffee-related data. This enables all agents to query past performance, trends, and evaluations to inform current decisions.

**When data is written:** Each schema has a specific trigger (see sections below). Data is written once and never modified — updates create new records.

**Which agent writes:** The Archive Agent is the sole writer, ensuring consistency and completeness.

**Which agents read:** All agents can query the Archive. Common queries include:
- "What's our best-performing origin last season?"
- "Which suppliers consistently deliver above-contract scores?"
- "What feedback are customers giving on our best-selling roast?"

**Query pattern:** Any agent asks the Archive Agent for historical context. The Archive Agent searches its stored records and returns relevant findings.

---

## 1. CuppingLog

**When to write:** After every formal SCA cupping session — pre-shipment Q-grade, roaster calibration, new lot evaluation.

**Written by:** Archive Agent  
**Read by:** All agents

```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-15",
  "sample_id": "ETH-YIR-2025-001",
  "origin": "Ethiopia",
  "region": "Yirgacheffe",
  "variety": "Heirloom",
  "process": "Washed",
  "roast_level": "Light",
  "roaster": "Probat BRZ-12",
  "score": 84.5,
  "aroma": 8.0,
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
  "defect_type": null,
  "notes": "Bright citrus, floral notes with a clean finish. Good structure.",
  "recommendation": "accept",
  "price_evaluated_at_usd_lb": 4.25,
  "value_verdict": "good",
  "archived_by": "ArchiveAgent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| log_id | string (UUID) | Unique identifier for this cupping record |
| date | string (YYYY-MM-DD) | Date cupping was performed |
| sample_id | string | Lab or internal sample identifier |
| origin | string | Country of origin |
| region | string | Growing region within the country |
| variety | string | Coffee variety cultivar |
| process | string | Processing method (washed, natural, honey, etc.) |
| roast_level | string | Roast level used for cupping |
| roaster | string | Equipment used |
| score | number | Overall SCA score (0–100) |
| aroma | number | Aroma score (0–10) |
| flavor | number | Flavor score (0–10) |
| aftertaste | number | Aftertaste score (0–10) |
| acidity | number | Acidity score (0–10) |
| body | number | Body score (0–10) |
| balance | number | Balance score (0–10) |
| uniformity | number | Uniformity score (0–10) |
| clean_cup | number | Clean cup score (0–10) |
| sweetness | number | Sweetness score (0–10) |
| overall | number | Overall preference score (0–10) |
| defects | number | Number of defect cups found |
| defect_type | string or null | Type of defect if present |
| notes | string | Free-form sensory notes |
| recommendation | string | accept / reject / conditional |
| price_evaluated_at_usd_lb | number | Price per pound at time of evaluation |
| value_verdict | string | excellent / good / fair / overpriced |
| archived_by | string | Agent that archived this record |

---

## 2. SeasonalPerformance

**When to write:** End of each harvest season — quarterly or bi-annually per origin.

**Written by:** Archive Agent  
**Read by:** All agents

```json
{
  "record_id": "7a3f1200-e29b-41d4-b716-446655440001",
  "season": "2025-2026",
  "origin": "Colombia",
  "region": "Huila",
  "variety": "Caturra",
  "process": "Washed",
  "lots_cupped": 24,
  "average_score": 85.2,
  "highest_score": 88.5,
  "lowest_score": 81.0,
  "score_std_dev": 1.8,
  "defect_rate_percent": 2.1,
  "best_lot_sample_id": "COL-HUA-2025-017",
  "customer_feedback_avg": 4.3,
  "repeat_order_rate_percent": 67,
  "notes": "Strong year for Huila. Clean naturals outperformed washed slightly.",
  "archived_by": "ArchiveAgent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| record_id | string (UUID) | Unique identifier for this seasonal record |
| season | string | Harvest season label (e.g. "2025-2026") |
| origin | string | Country of origin |
| region | string | Growing region |
| variety | string | Coffee variety |
| process | string | Processing method |
| lots_cupped | number | Total number of lots evaluated |
| average_score | number | Mean SCA score across all lots |
| highest_score | number | Highest individual lot score |
| lowest_score | number | Lowest individual lot score |
| score_std_dev | number | Standard deviation of scores |
| defect_rate_percent | number | Percentage of lots with defects |
| best_lot_sample_id | string | Sample ID of the highest-scoring lot |
| customer_feedback_avg | number or null | Average customer rating (1–5 scale) |
| repeat_order_rate_percent | number | Percentage of orders that were repeat purchases |
| notes | string | Seasonal observations and highlights |
| archived_by | string | Agent that archived this record |

---

## 3. SupplierScorecard

**When to write:** After each shipment received and QC-checked.

**Written by:** Archive Agent  
**Read by:** All agents

```json
{
  "record_id": "9b5e2300-e29b-41d4-c716-446655440002",
  "date": "2025-10-28",
  "supplier_name": "Cafe de Altura SA",
  "supplier_origin": "Guatemala",
  "lot_id": "GUA-ANT-2025-003",
  "origin": "Guatemala",
  "quantity_kg": 600,
  "cupping_score_received": 86.0,
  "score_vs_contract_estimate": "above",
  "defects_found": 1,
  "defect_types": ["fermentation"],
  "on_time_delivery": true,
  "communication_quality": "excellent",
  "documentation_complete": true,
  "price_usd_lb": 3.80,
  "value_rating": "excellent",
  "would_reorder": true,
  "notes": "Fifth shipment from this supplier. Consistent performer.",
  "archived_by": "ArchiveAgent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| record_id | string (UUID) | Unique identifier for this scorecard |
| date | string (YYYY-MM-DD) | Date shipment was received |
| supplier_name | string | Name of the supplier company |
| supplier_origin | string | Country where supplier is based |
| lot_id | string | Lot identifier for this shipment |
| origin | string | Country of origin for the coffee |
| quantity_kg | number | Weight in kilograms |
| cupping_score_received | number | Actual cupping score from QC |
| score_vs_contract_estimate | string | above / met / below |
| defects_found | number | Number of defects found on inspection |
| defect_types | array of string | List of defect types identified |
| on_time_delivery | boolean | Whether delivery met the scheduled time |
| communication_quality | string | excellent / good / fair / poor |
| documentation_complete | boolean | Whether all paperwork was in order |
| price_usd_lb | number | Price per pound paid |
| value_rating | string | excellent / good / fair / poor |
| would_reorder | boolean | Indicator of intent to reorder |
| notes | string | Additional observations |
| archived_by | string | Agent that archived this record |

---

## 4. ProductPerformance

**When to write:** Monthly aggregate or after notable customer feedback events.

**Written by:** Archive Agent  
**Read by:** All agents

```json
{
  "record_id": "cf7f3400-e29b-41d4-d716-446655440003",
  "month": "2025-11",
  "sku": "ROB-HAZ-250",
  "product_name": "Hazelnut Roast 250g",
  "origin": "Blend",
  "units_sold": 342,
  "revenue_idr": 6156000,
  "average_rating": 4.1,
  "feedback_count": 87,
  "top_positive_notes": ["Great flavor", "Fast shipping", "Fresh beans"],
  "top_negative_notes": ["Grind inconsistency"],
  "refund_count": 4,
  "refund_rate_percent": 1.2,
  "out_of_stock_days": 0,
  "notes": "Steady month. New 500g variant launching next month.",
  "archived_by": "ArchiveAgent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| record_id | string (UUID) | Unique identifier for this record |
| month | string (YYYY-MM) | Month of the aggregate |
| sku | string | Stock keeping unit identifier |
| product_name | string | Product display name |
| origin | string | Origin of the coffee (single or blend) |
| units_sold | number | Number of units sold |
| revenue_idr | number | Revenue in Indonesian Rupiah |
| average_rating | number or null | Average customer rating (1–5 scale) |
| feedback_count | number | Number of feedback submissions |
| top_positive_notes | array of string | Most common positive comments |
| top_negative_notes | array of string | Most common negative comments |
| refund_count | number | Number of refunds issued |
| refund_rate_percent | number | Refunds as percentage of sales |
| out_of_stock_days | number | Days product was out of stock |
| notes | string | Additional observations and context |
| archived_by | string | Agent that archived this record |