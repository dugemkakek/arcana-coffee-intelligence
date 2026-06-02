# C4 Level 1 — System Context

Shows how Arcana fits in the world around it: who uses it, what external systems it talks to.

```mermaid
C4Context
    title Arcana Coffee Intelligence — System Context

    Person(roaster, "Roaster / Operator", "Runs the roaster, captures roasts, reviews AI feedback")
    Person(owner, "Roastery Owner / Manager", "Manages inventory, plans production, reviews reports")

    System(arcana, "Arcana Coffee Intelligence", "Local-first roastery platform with AI-powered roast analysis")

    System_Ext(artisan, "Artisan Roast Software", "Free open-source roast logging app — produces .json exports")
    System_Ext(kaffelogic, "Kaffelogic Studio", "Desktop app for Nano 7e roaster (closed .klog format, v1.5+ support)")
    System_Ext(phidget, "Phidget TMP1101", "USB thermocouple data logger via VINT Hub")
    System_Ext(pos, "POS / E-commerce", "Olsera, Shopify, WooCommerce, custom (v0.2+)")
    System_Ext(llm, "LLM Provider", "MiniMax (default), Anthropic, OpenRouter, or local LLM")
    System_Ext(billing, "Payment provider", "Stripe / Xendrata for the paid AI tier (v0.2+)")

    Rel(roaster, artisan, "Records roasts using")
    Rel(artisan, phidget, "Reads thermocouples via USB")
    Rel(roaster, arcana, "Imports .json exports, reviews AI feedback")
    Rel(owner, arcana, "Plans production, manages inventory")

    Rel(arcana, llm, "Sends roast analysis requests (per-tenant config)")
    Rel(arcana, billing, "v0.2+ — subscription + usage metering")
    Rel(arcana, kaffelogic, "v1.5+ — read .klog files")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Notes

- **Local-first.** v0.1 runs entirely on the roastery PC. No data leaves the LAN except anonymized LLM requests when the operator runs AI analysis.
- **Open by default.** We use Artisan (free, open-source) as the primary roast capture tool, so operators don't have to learn a new app to start using Arcana.
- **Phidget is just a sensor.** We don't talk to the Phidget directly in v0.1 — Artisan already does that. v0.2 will add a direct capture path.
- **LLM provider is swappable.** MiniMax is the default. Anthropic, OpenRouter, and local LLM adapters exist; only MiniMax is wired in v0.1.
