# ☕ Coffee Industry AI Skill

A Hermes agent skill for the specialty coffee industry. When loaded, it gives the agent domain expertise across the full coffee supply chain — from cherry on the tree to subscription box at the door.

---

## What This Is

`SKILL.md` is the agent's brain. When a user asks a coffee-related question, the agent loads this file and uses it to reason about:
- Green coffee sourcing and origin selection
- Roasting profile development and production planning
- Quality control via SCA cupping protocols
- Cafe operations and espresso dial-in
- Supply chain, import logistics, and contracting
- E-commerce strategy and subscription models
- Regulatory compliance (FDA, FSMA, import permits)

---

## Quick Start for Agents

The agent loads this skill automatically when coffee-related topics are detected. No manual activation needed.

For manual loading:
```
skill_view(name="coffee-industry")
```

---

## Repository Structure

```
coffee-industry-ai/
├── SKILL.md                  ← Agent knowledge base (load this)
├── QUICKREF.md               ← Human-readable cheat sheet
├── EXAMPLE_PROMPTS.md        ← Realistic prompt templates
├── BREWING_KNOWLEDGE.md      ← Brewing, extraction, processing, roasting, defects (1325 lines)
├── CATALOG.md                ← Product SKU reference (18 SKUs)
├── SCHEMAS.md                ← Archive agent data models
├── AGENT_SOURCES.md          ← AI in coffee supply chain research digest
├── CHANGELOG.md              ← Version history
└── README.md
```

---

## Knowledge Areas

| Area | Coverage |
|------|----------|
| **Green Coffee Sourcing** | Origins, varieties (Heirloom, Bourbon, SL28), processing (washed/natural/honey), altitude, lot selection |
| **Roasting** | Heat application, Maillard reaction, first crack, DTR, roast levels, profile development |
| **Cupping & QC** | SCA protocol, scoring (80+ = specialty), defect mapping, roast benchmarking |
| **Cafe Operations** | Espresso dial-in, grind size, dose/yield/time ratios, milk texturing, workflow |
| **Supply Chain** | Incoterms (FOB, CIF), container logistics (20ft/40ft), warehouse, lead times |
| **Pricing & Contracts** | C-market, specialty premium, fixed vs浮动 price, contract structures |
| **E-Commerce & DTC** | Subscription models, roast-to-order, shipping green unroasted, unit economics |
| **Regulatory** | FDA food facility registration, FSMA, Country of Origin Labeling, SCA importer requirements |

---

## Key Terminology (Sample)

| Term | Definition |
|------|------------|
| **FOB** | Free on Board — buyer owns goods from port of origin |
| **DTR** | Development Time Ratio — % of roast after first crack |
| **Brix** | Sugar content measurement pre-harvest |
| **Variety** | Coffee plant cultivar (Bourbon, SL28, Heirloom, etc.) |
| **Processing** | Post-harvest method: washed, natural, honey |
| **Lot** | Single-origin, single-harvest batch |
| **Traceability** | Ability to track coffee from farm to cup |
| **SCA Score** | Quality rating 0-100 (80+ = specialty grade) |

---

## Tier Guide (Quality)

| Tier | Score | Description |
|------|-------|-------------|
| **Specialty** | 80+ | Distinctive, no primary defects |
| **Premium** | 85+ | Exceptional origin character |
| **Competition** | 88+ | Used in barista competitions |
| **Lottery** | 90+ | Rare micro-lots, auction-only |

---

## License

MIT — knowledge is meant to be shared.

---

## Contributing

This skill is maintained as part of the Srivijaya multi-agent stack. To update or extend the knowledge base, edit `SKILL.md` and submit a PR. Changes should be grounded in real industry operations — not theoretical.