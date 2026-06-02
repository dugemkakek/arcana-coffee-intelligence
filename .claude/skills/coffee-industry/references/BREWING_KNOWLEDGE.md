# Coffee Brewing & Craft Knowledge Base

*A deep library for baristas, home brewers, roasters, and AI agents working in specialty coffee. Part of the coffee-industry-ai skill suite.*

---

## How to Use This File

This file is a **standalone reference module**. Load it alongside `SKILL.md` when handling any query related to:

- Manual brewing (pour-over, AeroPress, French press, siphon, cold brew, moka pot)
- Espresso calibration and troubleshooting
- Espresso-based drinks (recipes, ratios, milk ratios)
- Milk steaming and latte art
- Green coffee processing (wet, dry, honey, anaerobic, etc.)
- Coffee cherry anatomy and post-harvest handling
- Roasting (curve design, phases, defect roast profiles)
- Green and roasted coffee defects (visual + cup)

**When an agent receives a brewing question**, check this file for:
1. Exact parameters (ratios, temps, times)
2. Diagnosis logic (symptom → cause → fix)
3. Step-by-step workflows
4. Reference tables

---

## Part 1: Water & Extraction Fundamentals

Understanding water and extraction is the foundation. All brewing is extraction — pulling soluble compounds out of coffee into water.

### 1.1 Extraction Science

**Total Dissolved Solids (TDS):** Measures how much coffee is dissolved in the brew. Measured with a refractometer.

| Brew Style | Target TDS |
|---|---|
| Espresso | 8–12% |
| Filter / pour-over | 1.15–1.45% |
| Cold brew concentrate | 3–6% |
| Cupping | 1.15–1.35% |

**Extraction Yield (EY):** What percentage of the coffee's mass ended up in the cup.

```
EY (%) = (TDS × Brew Weight) ÷ Dose × 100
```

**SCA Optimal Extraction Window:** 18–22% extraction yield for filter coffee.

| EY | Result | Taste |
|---|---|---|
| <18% | Under-extracted | Sour, salty, thin, hollow |
| 18–22% | Optimal | Balanced, sweet, full |
| >22% | Over-extracted | Bitter, astringent, dry |

**Why this matters for diagnosis:** If a brew tastes sour but the TDS is high, the extraction may be uneven — some channels extracted fast (low) while others slow (high). The fix is not just time or grind; it's distribution.

---

### 1.2 Water Quality

Water is 98%+ of filter coffee. Bad water = bad coffee, regardless of everything else.

**SCA Water Standards:**

| Parameter | Target | Acceptable Range |
|---|---|---|
| Total Hardness (as CaCO₃) | 150 mg/L | 75–250 mg/L |
| Total Alkalinity | 40 mg/L | 20–75 mg/L |
| pH | 7.0 | 6.5–7.5 |
| TDS | 150 mg/L | 75–250 mg/L |
| Chlorine | 0 mg/L | 0 |
| Sodium | 10 mg/L | <30 mg/L |

**Hardness and coffee:**
- Too soft (<75 mg/L as CaCO₃): sour, thin. Minerals are needed for extraction.
- Too hard (>250 mg/L): chalky, dull, builds scale on equipment.
- Calcium is the key ion — it binds to aromatic compounds and carries them to your cup.

**Practical guides:**
- Tap water: run through a filter (Brita or BWT removes chlorine and excessive hardness)
- Bottled: Evian (~300 TDS) is too hard. Volvic (~130 TDS) is close to ideal.
- Best: Third Wave Water or similar mineral packs added to RO/distilled water
- Never brew with distilled water — no minerals = flat, sour, under-extracted

**Temperature:**
- Filter: 90–96°C (194–205°F). Light roasts benefit from 94–96°C; darker roasts drop to 90–92°C.
- Espresso: 90–96°C, most machines default to 93°C. Adjust ±1°C per shot if consistently off.
- Cold brew: room temperature or refrigerator (4°C). No heat = no heat-driven extraction.

---

## Part 2: Manual Brewing Methods

### 2.1 Pour-Over (V60 / Chemex / Kalita Wave)

**Core principle:** Continuous or pulsed water additions through a paper filter. High clarity, origin-expressive, best for light to medium roasts.

---

#### Hario V60

**Equipment:** V60 dripper (plastic/ceramic/glass), paper filter (Hario tabbed), gooseneck kettle, scale with timer.

**Standard Recipe (James Hoffmann 4:6 method — recommended starting point):**

| Parameter | Value |
|---|---|
| Dose | 15g |
| Water | 250g (1:16.7 ratio) |
| Grind | Medium-coarse (sea salt texture) |
| Water temp | 93°C (199°F) |
| Total time | 3:00–3:30 |

**Step-by-step:**

1. **Rinse filter** with hot water. Discard rinse water. This removes paper taste and preheats the dripper.
2. **Add coffee**, level the bed.
3. **Bloom:** pour 50g water (2–3× dose weight), saturate all grounds. Wait 45 seconds. The bloom releases CO₂ — you'll see the bed bubble and rise. Fresh coffee blooms vigorously.
4. **Pour 1:** at 0:45, pour to 150g total. Slow, steady spiral from center outward and back.
5. **Pour 2:** at 1:30, pour to 250g total.
6. **Drawdown:** let the bed drain fully. Aim for last drop at 3:00–3:30.
7. **Evaluate:** check the coffee bed — a flat, even bed means even extraction. A channeled or uneven bed suggests distribution issues.

**4:6 Method Variations (Tetsu Kasuya):**

Split the total water into 5 pours (40% first two pours, 60% last three). Adjusting the first two pours controls balance (sweetness/acidity); adjusting the last three controls strength. Great for systematic exploration of a new coffee.

**Grind troubleshooting:**

| Symptom | Cause | Fix |
|---|---|---|
| Too fast draw (<2:30) | Too coarse | Grind finer, 1 click at a time |
| Too slow draw (>4:30) | Too fine or over-wet | Grind coarser |
| Channeling (water finds a path) | Uneven bed or over-pour | Swirl at 45s bloom, slow pour rate |
| Flat bed on one side | Uneven grind distribution | Gentle tap or Rao spin after last pour |
| Sour + fast | Under-extracted | Finer grind, higher temp, or slower pour |
| Bitter + slow | Over-extracted | Coarser grind, lower temp, or larger grind |

**Coffee-specific adjustments:**

| Coffee Type | Ratio | Temp | Notes |
|---|---|---|---|
| Light roast (washed) | 1:15–1:16 | 94–96°C | Higher temp for dense beans |
| Light roast (natural) | 1:15–1:16 | 92–94°C | Lower temp to avoid jammy sweetness turning muddy |
| Medium roast | 1:16–1:17 | 91–93°C | Standard |
| Dark roast | 1:17–1:18 | 88–91°C | Coarser grind, lower temp |
| Indonesian (Giling Basah) | 1:14–1:15 | 90–92°C | Heavy body, lower temp keeps earthiness clean |

---

#### Chemex

**Characteristics:** Thicker paper filter (25–30% slower flow) = more filtration, cleaner cup, removes more oils.

**Standard Recipe:**

| Parameter | Value |
|---|---|
| Dose | 30g |
| Water | 500g |
| Grind | Medium-coarse (slightly coarser than V60) |
| Temp | 94°C |
| Time | 4:00–5:00 |

**Notes:** The thick paper removes most lipids — ideal for origin clarity. Less body than V60. Works very well for Kenyan, Ethiopian, and Central American coffees where you want maximum brightness and clarity.

---

#### Kalita Wave

**Characteristics:** Flat-bottom dripper with 3 holes — more forgiving than V60 due to even extraction across the flat bed.

**Standard Recipe:**

| Parameter | Value |
|---|---|
| Dose | 20g |
| Water | 300g |
| Grind | Medium (between V60 and Chemex) |
| Temp | 93°C |
| Time | 3:00–4:00 |

**Notes:** More consistent extraction than V60 because the flat bed doesn't have the center-rush issue. Better for medium roasts. Good for learners.

---

### 2.2 AeroPress

**Core principle:** Immersion + pressure. Versatile — can mimic espresso-style concentrate, clean filter, or something in between. Almost impossible to make truly bad coffee.

**Standard (Inverted) Recipe:**

| Parameter | Value |
|---|---|
| Dose | 15–17g |
| Water | 200–230g |
| Grind | Medium (slightly finer than V60) |
| Temp | 85–94°C |
| Steep time | 1:30–2:30 |
| Pressure | Gentle, 20–30 seconds press |

**Inverted method steps:**

1. Assemble AeroPress upside down (plunger inserted 1cm).
2. Add coffee, add water to target weight.
3. Stir 10 seconds.
4. At steep time, place filter cap (with rinsed filter), flip onto cup.
5. Press slowly and steadily. Stop at first hiss of air — don't press the puck dry.

**Variations:**

| Style | Dose | Water | Temp | Time | Notes |
|---|---|---|---|---|---|
| Filter-style | 15g | 230g | 94°C | 2:00 | Clean, bright |
| Concentrate + water | 20g | 150g | 88°C | 2:30 | Dilute 1:1 after pressing |
| Cold brew fast | 20g | 200g | Room temp | 5:00 | Ice press directly |
| Light roast highlight | 15g | 200g | 96°C | 1:30 | Fast, hot, acidic |
| Dark roast smooth | 18g | 220g | 85°C | 2:30 | Cooler, longer, reduced bitterness |

**AeroPress troubleshooting:**

| Symptom | Cause | Fix |
|---|---|---|
| Bitter | Over-extracted | Coarser grind or shorter steep |
| Sour / hollow | Under-extracted | Finer grind, higher temp, or longer steep |
| Gritty | Grind too fine / filter bypass | Finer grind bypasses filter seal — use medium |
| Too dilute | Dose too low or ratio wrong | Increase dose or reduce water |
| Hard to press | Grind too fine | Coarser, or press more slowly |

---

### 2.3 French Press

**Core principle:** Full immersion. No filter paper = maximum body and oils present in cup. Best for medium-dark to dark roasts; light roasts can be murky and over-extracted.

**Standard Recipe:**

| Parameter | Value |
|---|---|
| Dose | 30g |
| Water | 500g (1:16.7) |
| Grind | Coarse (sea salt or breadcrumb) |
| Temp | 93–95°C |
| Steep time | 4:00 |

**Steps:**

1. Preheat press with hot water. Discard.
2. Add coffee, add water, stir briefly.
3. Place lid (plunger up), steep 4 minutes.
4. At 4:00 — do NOT plunge! Instead, use a spoon to break the crust and skim the floating grounds. This clears the top layer.
5. Wait 5 more minutes. Grounds sink to bottom.
6. Pour slowly — leave the last 20ml in the pot to avoid muddy grounds in cup.

**Why this matters:** Most bad French press coffee comes from plunging and immediately pouring. The 5-minute post-skim wait allows grounds to settle, producing a cleaner cup without changing the brewing variables.

**Troubleshooting:**

| Symptom | Fix |
|---|---|
| Too muddy | Coarser grind, don't pour last 20ml |
| Too weak | Finer grind or longer steep |
| Bitter | Shorter steep or coarser grind |
| Gritty grounds in cup | Filter broken — replace, or use cloth filter |

---

### 2.4 Moka Pot (Bialetti-style)

**Core principle:** Pressurized steam extraction (~1.5 bar). Not espresso, but espresso-adjacent. Strong, full-bodied, often slightly bitter if boiled.

**Standard Recipe:**

| Parameter | Value |
|---|---|
| Grind | Medium-fine (between espresso and filter) |
| Fill level | Lower chamber to pressure valve |
| Coffee | Level, not tamped, to the brim of basket |
| Heat | Medium-low |
| Total time | 3–5 minutes |

**Technique:**

1. Fill lower chamber with hot water (pre-boiling preserves flavor — cold water extracts too long on the heat source).
2. Fill basket with coffee, level with finger — do NOT tamp.
3. Assemble, place on medium-low heat with lid open.
4. Remove from heat when coffee starts sputtering (golden/honey-colored). Do not let it run dry.
5. Wrap base in cold towel to stop extraction immediately.

**Common mistakes:**

| Mistake | Result | Fix |
|---|---|---|
| Boiling in pot | Bitter, burnt | Start with hot water |
| Full flame | Scorched taste | Medium-low heat only |
| Tamping coffee | Over-pressurized, bad extraction | Level only, no tamp |
| Running completely dry | Burnt residue | Remove at first sputter |

---

### 2.5 Cold Brew

**Core principle:** Time replaces heat. Slow extraction at cold or room temperature. Low acidity, smooth, high caffeine concentration.

**Concentrate Recipe:**

| Parameter | Value |
|---|---|
| Dose | 100g |
| Water | 500g (1:5 ratio) |
| Grind | Coarse (French press grind) |
| Temp | Room temperature or refrigerator |
| Steep time | 12–18 hours at room temp; 18–24 hours cold |

**Ready-to-drink dilution:** Concentrate 1:1 with water or milk.

**Key notes:**
- Refrigerator steep: slower, cleaner, more forgiving on time. Can steep up to 36 hours without going bitter.
- Room temp steep: faster, slightly more complex, needs closer timing.
- Coarser grind is important — fine grind + 18 hours = over-extracted mud.
- Shelf life: 2 weeks refrigerated (concentrate); 3–4 days diluted.

**Nitro cold brew (if using keg):** Charge with nitrogen at 30–35 PSI. Pour from tap. Nitrogen bubbles produce creamy texture. Do not use CO₂ — carbonic acid clashes with coffee.

---

### 2.6 Siphon (Vacuum Pot)

**Core principle:** Vapor pressure from boiling water forces water up into the top chamber where it brews, then vacuum pulls brewed coffee back through a filter when heat is removed.

**Standard Recipe:**

| Parameter | Value |
|---|---|
| Dose | 20g |
| Water | 300g |
| Grind | Medium (between V60 and AeroPress) |
| Temp | Full boil in lower chamber |
| Brew time (top chamber) | 1:00–1:30 |

**Steps:**

1. Fill lower chamber with 300g hot water. Assemble filter in top.
2. Heat lower chamber. Water rises to top as it boils.
3. When water has mostly risen, add coffee. Stir gently to wet all grounds.
4. After 1:00–1:30, remove heat. Coffee draws back down through filter.
5. Serve immediately — siphon produces a very clean, tea-like cup.

**Siphon is theatrical and produces exceptionally clean cups** — the vacuum filtration removes micro-fines that other methods leave. Ideal for showcasing delicate light roasts.

---

### 2.7 Batch Brew / Drip Machine

**For commercial batch brewers (Bunn, Fetco, Marco):**

| Parameter | Value |
|---|---|
| Ratio | 1:16–1:17 |
| Grind | Medium (paper filter) |
| Water temp | 93–96°C (check machine specs) |
| Spray head | Ensure full coverage — no dry spots |
| Contact time | 4–6 minutes total brew cycle |
| Hold temp | 80–85°C; never above 85°C (staling accelerates) |
| Maximum hold time | 30 minutes on a thermal carafe; discard after |

**Golden Cup Standard (SCA):** 55–65g per liter of water, 18–22% extraction yield, 1.15–1.35% TDS.

---

## Part 3: Espresso — Full Calibration System

### 3.1 Espresso Fundamentals

Espresso is coffee extracted under pressure (typically 9 bar) through a fine grind in a short time, producing a concentrated shot with significant emulsified oils and crema.

**The Espresso Compass (diagnostic framework):**

```
         SOUR / ACIDIC
              ↑
   Under-extracted
              |
LIGHT ←——————+——————→ HEAVY
(thin body)  |         (dense body)
              |
   Over-extracted
              ↓
         BITTER / ASTRINGENT
```

Every shot problem maps to a position on this compass. The goal is the center: balanced, sweet, full-bodied.

---

### 3.2 Parameters and Their Roles

| Parameter | Typical Range | Effect if Too Low | Effect if Too High |
|---|---|---|---|
| Dose (g in) | 14–22g | Thin, low extraction | Slow flow, risk of channeling |
| Yield (g out) | 28–50g | Strong, dense, possibly bitter | Watery, sour, thin |
| Ratio (in:out) | 1:1.5 – 1:3 | Ristretto-style, intense | Lungo-style, diluted |
| Time | 22–38 seconds | Under-extracted | Over-extracted |
| Brew temp | 88–96°C | Flat, sour, dull | Bitter, harsh |
| Pressure | 6–9 bar | Weak extraction | Channeling at >10 bar |
| Grind size | Machine-specific | Too slow, over-extract | Too fast, under-extract |

---

### 3.3 Shot Recipes by Style

| Style | Dose | Yield | Ratio | Time | Use |
|---|---|---|---|---|---|
| Ristretto | 18g | 22–27g | 1:1.2–1:1.5 | 20–28s | Intense, syrupy, milk-drink base |
| Traditional Italian | 7g (single) | 14–25g | 1:2 | 25–30s | Espresso solo |
| Standard specialty double | 18–20g | 36–40g | 1:2 | 25–35s | Most common |
| Modern specialty | 18–20g | 40–46g | 1:2.2–1:2.5 | 28–36s | Sweeter, brighter, less roast-forward |
| Lungo / allongé | 18g | 50–60g | 1:3+ | 35–45s | Less intense, more origin character |
| Turbo shot | 20g | 40g | 1:2 | 10–15s | Very coarse grind at high pressure — clarity, less bitterness |

---

### 3.4 Espresso Dial-In — Full Workflow

**Before you start:** Know your basket. A 20g VST basket with a 15g dose will channel. Match dose to basket within ±2g of rated capacity.

**Step 1: Set dose**
- Weigh into the basket. Dose first, grind setting second. Consistent dose before adjusting grind.
- Standard starting point: 18g in a 20g VST basket.

**Step 2: Distribute**
- WDT (Weiss Distribution Technique): use a thin needle/wire tool to break up clumps in the basket before tamping.
- Rao Spin (optional): tap the portafilter handle 3–5 times then spin the wrist to level the puck.
- Goal: even density across the entire puck surface. No gaps or high spots.

**Step 3: Tamp**
- 15–25 lbs pressure, level tamp. Use a calibrated tamper.
- Level matters more than pressure. A tilted tamp creates a fast channel on one side.
- After tamping: no more tapping the portafilter — breaks the puck seal.

**Step 4: Pull shot and measure**
- Place cup on scale, tare, start timer the moment you press the button.
- Observe: pre-infusion fills the puck with water before full pressure. On machines with pre-infusion, the flow begins slowly then ramps.
- Record: time to first drip, time to target yield, visual color at end of shot.

**Step 5: Taste and diagnose**

| Taste | Likely Cause | Primary Fix | Secondary Fix |
|---|---|---|---|
| Sour, sharp, hollow | Under-extracted | Grind finer | Increase dose, raise temp |
| Bitter, dry, harsh | Over-extracted | Grind coarser | Reduce dose, lower temp |
| Salty, savory | Severely under-extracted | Much finer grind | |
| Sweet, balanced, fruity | Optimal | Lock in recipe | |
| Astringent, drying | Over-extracted or channeling | Grind coarser + improve distribution | |
| Watery, thin | Ratio too high (too much yield) | Reduce yield | |
| Too intense | Ratio too low (too little yield) | Increase yield | |

**Step 6: Adjust one variable at a time**
- Start with **grind size** — it's the primary lever for extraction.
- Then **yield** (output weight) — controls intensity.
- Then **dose** — small effect on extraction, large effect on intensity.
- **Temperature last** — ±1°C increments after everything else is dialed.

**Common dialing sequence:**

```
Sour shot → grind 1 notch finer → pull → taste
Still sour → grind 1 more notch finer → pull → taste
Now slightly bitter → you passed optimal — go back 0.5 notch
Sweet and balanced → lock in recipe
```

---

### 3.5 Pressure Profiling

Some machines (La Marzocco Strada, Decent, Kees van der Westen) allow pressure variation through the shot.

**Common profiles:**

| Profile | Shape | Effect |
|---|---|---|
| Flat 9 bar | ████████ | Standard, consistent |
| Pre-infusion + 9 bar | ▄▄████████ | Reduces channeling risk |
| Declining (9→6 bar) | ████▄▄▄▄ | Softer extraction end, less bitterness |
| Soft start (0→9 bar ramp) | ▁▃▆████ | Gentle puck saturation |
| Blooming (brief hold then ramp) | ▁▁▃▆████ | Deep saturation before extraction |
| Low-pressure long shot (6 bar) | ██████████ | Very clean, tea-like, used for light roasts |

**For fixed-pump machines:** Control pre-infusion time through the OPV (over-pressure valve) or by manual paddle. Most rotary pumps are adjustable.

---

### 3.6 Espresso Troubleshooting: Visual Diagnosis

**Shot flow observations:**

| What you see | What it means | Fix |
|---|---|---|
| Channeling (fast jet from one spot) | Uneven distribution or grind | WDT + level tamp |
| Blonde immediately (pale from start) | Too coarse or too low dose | Finer grind |
| Very dark throughout, no blonding | Too fine | Coarser |
| Fast + blonde early | Under-extracted and channeling | Distribution + finer grind |
| Slow + dark + tiger striping | Good extraction developing | Watch timing |
| Mouse tail (thin uneven stream) | Dose too low for basket | Increase dose |
| Spurting or splitting | Channeling | Redistribute, improve tamping |

**Crema diagnosis:**

| Crema appearance | Indicates |
|---|---|
| Thick, tiger-striped, persistent | Fresh coffee, good extraction |
| Thin, pale, disappears quickly | Stale coffee or under-extraction |
| Very dark, blotchy | Over-roasted or over-extracted |
| White spots | Off-gassing (too fresh) — rest 5–7 days post-roast |
| No crema | Very old or robusta-light blend |

---

### 3.7 Grinder Impact on Espresso

Grinders vary in burr geometry, RPM, and retention. These affect shot behavior independent of grind size setting.

**Flat burrs** (EK43, Mythos, Niche): wider particle size distribution, more fines. Espresso often tastes brighter and more complex. Higher channeling risk.

**Conical burrs** (Mahlkönig, most home grinders): narrower distribution, fewer fines. More forgiving, fuller body, less channeling.

**High RPM grinders:** More heat = faster flavor staling in the grind. Purge before pulling shots on commercial grinders.

**Retention:** Grinders with high retention (old Mazzer Minis) — dose more than needed and purge. Grinders with low retention (Niche, EK43 with mod) — dose exactly.

**Burr seasoning:** New burrs are sharp and produce inconsistent grind. Most burrs need 2–5kg of coffee before they're calibrated. Don't judge a new grinder's results until it's properly seasoned.

---

## Part 4: Milk Steaming & Espresso-Based Drinks

### 4.1 Milk Science

**Why milk foams:** Steam denatures whey proteins (primarily β-lactoglobulin) which form a network around air bubbles. Fat contributes creaminess and stabilizes the foam. Sugars (lactose) provide sweetness that balances espresso bitterness.

**Milk types and behavior:**

| Milk Type | Fat % | Protein % | Foam Quality | Notes |
|---|---|---|---|---|
| Whole milk (full cream) | 3.5% | 3.3% | Silky, stable | Best for latte art and microfoam |
| Reduced fat (2%) | 2% | 3.4% | Good, less rich | Adequate for most drinks |
| Skim milk | 0.1% | 3.7% | Stiff, dry foam | Too much protein, hard to pour |
| Oat milk | Varies | 1.5% | Good, stable | Works well, slightly sweet |
| Soy milk | 1.8% | 3.3% | Good, less creamy | Can separate if old or scalded |
| Almond milk | 1.5% | 0.4% | Poor stability | Thin foam, splits quickly |
| Coconut milk | 17–24% | 0.5% | Rich, heavy | Separates easily, use barista blend |
| Macadamia milk | 2.5% | 0.5% | Moderate | Good texture, neutral flavor |

**Key insight for alternatives:** "Barista edition" plant milks have added vegetable proteins (pea protein, rapeseed) to mimic dairy behavior. Always use barista editions for latte art.

---

### 4.2 Milk Steaming Technique — Full Protocol

**Equipment check:**
- Steam wand clean and purged (water droplets must be expelled before steaming)
- Pitcher: stainless steel, appropriate size for drink (small pitcher for 1–2 drinks, large for 3+)
- Cold milk: start cold (4°C ideal). Cold milk = more steaming time = more microfoam texture

**Target temperatures:**

| Drink | Temperature |
|---|---|
| Standard latte / cappuccino | 60–65°C (140–149°F) |
| Barista preference | 63°C (145°F) |
| "Skinny" / extra hot customer | 68–70°C (maximum) — quality degrades above 70°C |
| Iced drink base | 55–58°C (poured over ice brings temp down) |
| Children / elderly preference | 55°C |

**Never steam above 72°C** — proteins denature irreversibly, sweetness is destroyed, and a "cooked" flavor appears.

---

**Step-by-step steaming:**

**Phase 1 — Stretching (adding air, volume, foam)**

1. Fill pitcher to just below the spout (1/3 full for latte, 1/2 for cappuccino).
2. Submerge steam tip just below the surface (0.5–1cm).
3. Open steam valve fully.
4. **Tilt pitcher slightly** so milk spins in a vortex.
5. **Keep the tip at the surface** — you should hear a soft, rhythmic "sst-sst-sst" tearing sound. This is air incorporation.
6. Stretch until milk volume increases ~30% (flat white) to 100% (cappuccino dry foam).
7. Drop the pitcher slightly when desired volume is reached — submerge tip deeper to stop air incorporation.

**Phase 2 — Texturing (heating, homogenizing foam)**

1. Submerge tip deeper into the milk.
2. Maintain the vortex spin — the foam folds back into the liquid.
3. Heat until the pitcher is too hot to hold (60–65°C without a thermometer). With thermometer: stop at 62°C and residual heat brings it to 65°C.
4. Close steam valve. Remove wand.
5. Immediately wipe wand clean with damp cloth and purge again.

**Phase 3 — Integration**

1. Tap the pitcher firmly on the counter 2–3 times to pop large bubbles.
2. Swirl vigorously in a circular motion until milk looks glossy, even, paint-like.
3. Should look like wet white paint. No dry foam on top. No visible bubbles.
4. **Pour immediately** — properly textured milk separates if left standing more than 20 seconds.

**Diagnosing milk problems:**

| Problem | Cause | Fix |
|---|---|---|
| Big bubbles / dry foam | Too much air incorporation | Keep tip deeper, less "tearing" time |
| Not enough foam | Tip too deep from start | Start closer to surface |
| Scalded, cooked taste | Overheated >72°C | Watch thermometer, start pouring earlier |
| Milk separates in pitcher | Not enough swirl integration | More aggressive post-steam swirl |
| Steam spitting water | Wand not purged | Always purge before every use |
| Foam won't incorporate | Milk too hot before stretching phase | Use colder milk |
| Grainy foam | Old or UHT milk | Use fresh, pasteurized (not UHT) |

---

### 4.3 Espresso-Based Drink Recipes

All recipes assume a double espresso (18g in, 36–40g out, 1:2 ratio) as the base unless otherwise specified.

---

#### Espresso

| Drink | Espresso | Additions | Cup size |
|---|---|---|---|
| Single | 7g / 14–20g yield | — | 30–40ml demitasse |
| Double | 18g / 36–40g yield | — | 40–60ml demitasse |
| Ristretto | 18g / 22–25g yield | — | 30ml demitasse |
| Lungo | 18g / 50–60g yield | — | 80–100ml |
| Americano | Double espresso | 120–180ml hot water (water first, espresso second) | 180–240ml |
| Long black | Double espresso | 120ml hot water — espresso poured into water | 180ml |

**Americano vs Long Black:** In Long Black, espresso is poured over water — this preserves crema. In Americano, water is added to espresso or simultaneously — crema is integrated.

---

#### Milk-Based Drinks

| Drink | Espresso | Milk | Ratio | Cup | Notes |
|---|---|---|---|---|---|
| Flat White | Double (18g→36g) | 90–110ml microfoam | 1:2.5–1:3 | 150ml | Minimal foam cap, dense texture |
| Latte | Double (18g→36g) | 150–180ml microfoam | 1:4–1:5 | 220–240ml | Light foam cap, mostly textured milk |
| Cappuccino | Double (18g→36g) | 100ml steamed + thick foam cap | 1:1:1 (espresso:milk:foam) | 150–180ml | Equal thirds |
| Macchiato | Single or double | 10–15ml foam spot | — | 40–60ml | Just marks the espresso |
| Cortado | Double (18g→36g) | 40–50ml steamed milk | 1:1 | 80–100ml | Cuts the espresso, minimal foam |
| Gibraltar | Double (18g→36g) | 60ml steamed milk | 1:1.5 | 90–120ml | Served in a Gibraltar glass |
| Breve | Double (18g→36g) | Half-and-half (cream+milk) | 1:3 | 180–200ml | Rich, sweet, American style |
| Café au lait | Double espresso | Equal hot drip coffee + steamed milk | 1:1:1 | 300ml | French style |

**Indonesian popular drinks:**

| Drink | Base | Method | Notes |
|---|---|---|---|
| Kopi Susu (ES) | Espresso double | Espresso over ice, sweetened condensed milk (40–50ml), full ice | Most popular cold drink in Indonesia |
| Kopi Hitam | Robusta espresso | Black, no milk, often with sugar | Traditional Indonesian coffee |
| Es Kopi Kenangan style | Espresso | Espresso + condensed milk + fresh milk + ice | Similar to Vietnamese cà phê |
| Kopi Tubruk | Coarsely ground | Boiling water poured directly on grounds in cup, settled | Traditional Javanese method |
| Kopi Jahe | Espresso/strong brew | Espresso + fresh ginger syrup | Warming spiced coffee |
| Dalgona | Instant coffee | Whipped (2:2:2 instant:sugar:hot water) over cold milk | Popular home pandemic drink |

---

#### Cold Drinks

| Drink | Recipe | Notes |
|---|---|---|
| Iced latte | Double espresso over 150g ice + 120ml cold milk | Pour espresso first, then milk — layered look |
| Iced Americano | Double espresso + 150ml cold water over ice | |
| Cold brew latte | 80ml concentrate + 120ml milk over ice | Smoother than iced latte |
| Shakerato | Double espresso shaken hard in cocktail shaker with ice + 5ml simple syrup | Italian style, served in martini glass |
| Espresso tonic | Double espresso over 150ml tonic water + ice | Bitter + bitter = interesting. Works best with light roast |
| Affogato | Single espresso poured over 1 scoop vanilla gelato | Dessert drink |

---

### 4.4 Latte Art Basics

Latte art requires: properly textured milk (microfoam), espresso with crema, and correct pouring technique.

**Milk preparation for art:**
- Texture to "wet paint" consistency — no visible bubbles, homogenous.
- Pour within 10–15 seconds of stopping steam.
- Swirl the pitcher immediately before pouring to reintegrate.

**Basic pour technique:**
1. Give the espresso cup a gentle swirl to level the crema.
2. Tilt the cup 20–30°.
3. Begin pouring from height (~10cm) — this sinks the foam under the crema.
4. Once the cup is 60% full, lower the pitcher spout to the surface.
5. Slow the pour, begin the design motion.

**Rosette:**
1. Lower spout to surface, begin gentle side-to-side wiggle while pouring.
2. Pour slowly through the center at the end, cutting through the pattern to split it.

**Heart:**
1. Pour to fill cup 70%.
2. Lower spout to surface, pour in one spot until a white circle forms.
3. Lift and pull the spout through the center of the circle to create the heart point.

**Common latte art problems:**

| Problem | Cause | Fix |
|---|---|---|
| Foam sinks into espresso | Too wet milk, tip too high | More stretch time, lower pour point |
| Can't see design | Milk too thick | Thinner microfoam |
| Foam clumps on top | Milk too stiff | Less air incorporation |
| Espresso crema breaks before pour | Crema very old | Pour faster after pulling shot |
| White blob, no defined edges | Pour too slow or milk separation | Pour faster, swirl before pouring |

---

## Part 5: Coffee Processing Knowledge

### 5.1 Coffee Cherry Anatomy

Understanding the fruit is essential for processing decisions. From outside to inside:

```
[Outer skin / Exocarp]  — Red, yellow, or orange when ripe
[Pulp / Mesocarp]       — Sugary, fleshy fruit layer (1–3mm)
[Mucilage / Pectin]     — Sticky, sweet, gelatinous layer clinging to parchment
[Parchment / Endocarp]  — Papery hull surrounding the bean
[Silver skin / Spermoderm] — Thin membrane (chaff) on the bean surface
[Green bean / Endosperm] — The coffee seed, what we roast
```

**Cherry ripeness indicators:**
- Ripe: uniform red (or yellow, orange — variety-dependent), yields to pressure, sweet smell
- Unripe (green): hard, starchy, astringent flavor if processed
- Overripe: shriveled, purple/black, fermented off-flavors
- Floaters: immature or damaged beans that float in water — separate and discard

**Selective vs strip picking:**
- Selective: hand-pick only ripe cherries. Labor intensive, higher quality. Used in specialty.
- Strip picking: strip all cherries off branch at once. Fast, cheap, mixes ripe and unripe. Lower quality.
- Mechanical: machines strip trees. Used in Brazil. Not suitable for hilly terrain.

**Sorting on arrival at processing station:**
1. **Float tank:** Fill large tank with water. Floaters rise (hollow, immature) — remove them. Sinkers are dense and ripe.
2. **Visual sort:** Remove green, overripe, damaged cherries.
3. **Density sort (optional):** Mechanical density tables separate by weight.

---

### 5.2 Processing Methods — Full Detail

#### Washed Processing (Wet Process)

**Overview:** All fruit is removed before drying. The clean cup is the product.

**Step-by-step:**

1. **Depulp:** Cherries fed through a depulper machine that squeezes out the bean + parchment, leaving pulp behind.
2. **Fermentation tank:** Beans in parchment go into water tanks. Naturally occurring microbes (yeasts, bacteria) break down the remaining mucilage.
   - Duration: 12–72 hours depending on temperature, altitude, microbial load
   - Warmer climates = faster fermentation (12–24h)
   - Higher altitude, cooler = slower (36–72h)
   - Indication of completion: mucilage rubs off cleanly when bean is rubbed between fingers (the "squeaky clean" test)
3. **Wash:** Beans are rinsed thoroughly with clean water to remove all fermented mucilage residue.
4. **Dry:** Parchment coffee dried on raised beds or patios to 10.5–11.5% moisture. Takes 1–4 weeks.
5. **Rest (optional):** Bagged in parchment for 4–8 weeks to allow moisture equilibration.
6. **Dry mill / hulling:** Parchment removed by machine. Green beans sorted, graded, bagged.

**Flavor impact:** Clean, bright, high acidity, clear origin character. Terroir-transparent — you taste the bean, not the fruit.

**Water consumption:** High. Significant environmental concern in water-scarce regions.

**Best origins for washed:** Colombia, Kenya, Ethiopia (washed), Central America.

---

#### Natural Processing (Dry Process)

**Overview:** The whole cherry is dried with all fruit intact. The fruit ferments around the bean during drying.

**Step-by-step:**

1. **Sorting:** Float sort, visual remove defects and overripes.
2. **Drying:** Spread cherries in single layers on raised beds or patios. Must be turned/raked every 1–2 hours to prevent mold.
3. **Drying duration:** 3–6 weeks until moisture reaches 10–11%. The cherry skin shrivels and darkens.
4. **Dry milling:** Hull, sort, grade.

**Critical risk factors:**
- **Mold:** If cherries are too deep or not turned frequently enough, surface mold forms → musty, moldy cup defect
- **Over-fermentation:** Too slow drying or rain → "boozy", vinegary notes
- **Rain:** Ruins drying lots. Natural processing requires dry season and sun.

**Flavor impact:** Fruity, heavy body, wine-like, jammy sweetness. The fruit sugars and fermentation by-products impart tropical fruit, berry, and fermented notes.

**Best origins for naturals:** Ethiopia (Sidamo, Yirgacheffe naturals), Brazil, Yemen.

---

#### Honey Processing

**Overview:** The skin is removed but some or all mucilage is left on the parchment during drying. A spectrum between washed and natural.

**Honey types (by mucilage remaining):**

| Type | Mucilage Removed | Drying Behavior | Flavor |
|---|---|---|---|
| White Honey | 80–90% | Fast, lower risk | Clean, slight sweetness |
| Yellow Honey | 50–75% | Moderate | Balanced, fruity |
| Red Honey | 25–50% | Slower, needs turning | Fruity, full body |
| Black Honey | 10–25% | Slow, high risk of mold | Most fruit-forward, wine-like |

**Step-by-step:**
1. Depulp (remove skin).
2. Calibrate mucilage removal on the depulper — or manually adjust screws to leave desired amount.
3. Lay parchment on raised beds — no washing step.
4. Turn frequently (every 30–60 minutes for black honey, less for yellow).
5. Dry to 10–11% moisture.

**Challenges:** Black and red honey require intensive monitoring. They can look like natural process coffee but need dedicated attention to prevent fermentation defects.

**Best origins for honey:** Costa Rica (pioneered honey), Guatemala, El Salvador, Brazil.

---

#### Anaerobic Processing

**Overview:** Cherries or depulped parchment are sealed in oxygen-free tanks with CO₂ or nitrogen atmosphere. Anaerobic bacteria dominate fermentation, producing different flavor compounds.

**Types:**

| Type | Input | Duration | Flavor Notes |
|---|---|---|---|
| Anaerobic natural | Whole cherry | 48–120 hours | Tropical fruit, wine, fermented |
| Anaerobic washed | Depulped parchment | 24–72 hours | Cleaner fruit, floral, complex |
| Extended anaerobic | Whole cherry | 5–15 days | Intense, funky, divisive |
| Carbonic maceration | Whole cherry in CO₂ | 72–120 hours | Floral, candy, bubblegum |

**Step-by-step (anaerobic natural):**
1. Cherries loaded into sealed food-grade tanks (plastic or stainless).
2. Tank sealed with one-way CO₂ valve — gas can escape, but air cannot enter.
3. Fermentation proceeds: CO₂ produced by bacteria builds up.
4. Monitor temperature (target 18–22°C) and CO₂ pressure.
5. At target duration, open tank, transfer to raised beds for drying.

**Flavor mechanism:** Anaerobic fermentation produces lactic acid (from LAB — Lactic Acid Bacteria) and various esters and alcohols that impart fruity, fermented character. The key is controlled fermentation — not random.

**Risks:** Over-fermentation (vinegar, alcohol, "bag defect"), inconsistent batches if temperature uncontrolled.

---

#### Wet-Hull / Giling Basah (Indonesian-specific)

*Full detail in SKILL.md Indonesia section. Summary here:*

**Unique steps:**
1. Cherry picked and pulped same day.
2. Short fermentation (12–24h) + wash.
3. First drying to 30–35% moisture (NOT full drying).
4. **Wet-hull:** parchment removed while still moist (defining step).
5. Second drying to 12–13% export moisture.

**Why it's done:** Indonesia's humid climate makes full drying before hulling impractical. Wet-hulling allows processing before mold risk increases.

**Flavor result:** Earth, cedar, herbaceous, low acidity, heavy body — the "Sumatran profile."

---

#### Experimental / Emerging Methods

| Method | Description | Flavor |
|---|---|---|
| Lactic fermentation | Specific bacteria inoculation in anaerobic tanks | Yogurt, tangy, clean acidity |
| Yeast inoculation | Added commercial wine/bread yeast to tanks | Controlled fermentation, consistent fruit notes |
| Thermal shocking | Ice-bath after anaerobic for fixed time | Stops fermentation precisely |
| Co-fermentation | Other fruits added to fermentation tank (cacao, fruit peels) | Imparts external flavors |
| Fungal processing | Specific mold applied (rare, experimental) | Very unusual, niche |

**Agent note:** Experimental processing is growing rapidly in specialty. Results are inconsistent across producers. High price premium (2–5× standard). Controversial in specialty community — purists argue it masks terroir.

---

### 5.3 Water Activity and Moisture Management

Green coffee must reach and maintain correct moisture for stability:

| Stage | Target Moisture % |
|---|---|
| At harvest (cherry) | 60–80% |
| End of primary drying | 10–12.5% |
| Export standard | 10.5–12% |
| Water activity target (aw) | <0.65 |
| Danger zone (mold growth) | >0.70 aw / >13% moisture |

**Measuring:** Moisture meters (Sinar, Perten) for %, water activity meter for aw. Check both — high moisture AND high water activity = mold risk.

---

## Part 6: Roasting — Deep Knowledge

### 6.1 Roasting Physics and Chemistry

Coffee roasting is a cascade of physical and chemical reactions triggered by heat. Understanding the sequence explains every decision in profile development.

**The roast arc — what happens chronologically:**

| Phase | Temp Range | Time | What Happens |
|---|---|---|---|
| Charge | 160–200°C | 0:00 | Green coffee added to hot drum |
| Drying / yellowing | 100–160°C | 0:00–3:00 | Moisture evaporates (~12% water loss), bean yellows |
| Maillard reaction | 150–190°C | 3:00–7:00 | Sugars + amino acids → brown compounds, aroma precursors |
| Caramelization | 170–200°C | 5:00–9:00 | Sugars caramelize → sweetness, brown color deepens |
| First crack | ~196–204°C | 7:00–10:00 | Exothermic. CO₂ released, cells rupture, audible crack |
| Development phase | 196–220°C | Post-FC | Pyrolysis. Maillard products transform. Flavor "develops." |
| Second crack | ~224–230°C | Post-FC+3min | Oils migrate to surface. Cell structure collapses. |
| Dark / French | >225°C | — | Carbon compounds dominate. Carbonization. |

---

### 6.2 Key Roast Metrics

**Rate of Rise (RoR):** How fast temperature is increasing (°C per minute). Most important metric for profile control.

- Ideal RoR: declining curve from ~15–18°C/min at start of Maillard to 3–8°C/min at first crack
- Crashing RoR (drops to 0 or negative): "baked" flavor — flat, bread-like, lifeless
- Spiking RoR (sharp increases): risks tipping/scorching, loss of origin clarity
- Smooth, declining RoR = even, predictable development

**Development Time Ratio (DTR):**
```
DTR = (Time after first crack ÷ Total roast time) × 100
```

| Roast Level | DTR Target |
|---|---|
| Light | 18–23% |
| Medium-Light | 22–26% |
| Medium | 24–28% |
| Medium-Dark | 26–32% |
| Dark | 30–40% |

**Key principle:** DTR controls sweetness and body development. Too low DTR = underdeveloped, sour, grassy. Too high DTR = baked, flat, over-developed.

**Charge Temperature:** The drum/air temperature when green coffee is loaded.

- Higher charge = faster initial drying, more aggressive start
- Lower charge = slower, more gentle start, better for dense beans
- Typical range: 165–195°C for production drum roasters
- Always calibrate to bean density and moisture — dense beans tolerate higher charges

**Airflow:** Controls heat transfer and smoke evacuation.

- More airflow = cooler, more convective heat, faster drying phase
- Less airflow = hotter, more conductive heat, slower drying
- Most mistakes come from wrong airflow, not wrong temperature

---

### 6.3 Profile Development for Different Coffees

**Dense, high-altitude beans (Kenya SL28, Ethiopian Yirgacheffe, Colombian Huila):**
- Higher charge temperature (180–195°C)
- Slower initial RoR — let the drying phase extend 30–45 seconds longer
- Aim for brighter first crack
- Moderate DTR (20–24%) to preserve acidity and origin character
- Watch for RoR crash going into first crack — increase heat slightly

**Low-density beans (Brazilian naturals, some Sumatran):**
- Lower charge temperature (165–175°C)
- More careful airflow — lower density absorbs heat faster
- Shorter drying phase
- Higher DTR can work for sweetness development (22–28%)
- Watch for scorching — the bean's outer cell walls are less dense

**Indonesian / Giling Basah beans (Sumatra, Sulawesi):**
- Irregular density from wet-hull processing
- Moisture content can vary 12–14% (higher than other origins)
- Extend drying phase — moisture needs more time to drive off
- Watch for "grassy" phase extending longer than expected
- RoR crash risk in Maillard phase — keep a gentle input of heat
- Medium to medium-dark roasts work best — light roasts can taste medicinal or earthy-sour
- DTR: 24–30% range

**Old crop / aged beans:**
- Much lower moisture (8–9%)
- Drying phase very short
- Risk of scorching in early phases
- Lower charge temperature, slow start
- Can taste flat regardless of profile — aged green doesn't respond well to light roast

---

### 6.4 Roast Defects — Cause and Diagnosis

#### Baked / Flat

**Symptoms in cup:** Flat, bread-like, cardboard, no acidity, no brightness, sweet but lifeless.

**Cause:** RoR crashed during or after Maillard reaction. Heat stalled the transformation of flavor compounds without completing them.

**Root cause:**
- Reduced heat input in mid-roast without compensating airflow
- DTR too short — bean didn't fully develop before drop
- Or contradictorily, DTR too long at very low temperatures ("oven baked")

**Fix:** Maintain declining but active RoR. Never let RoR flat-line before first crack. Increase heat input 30–60 seconds before expected first crack.

---

#### Scorched / Tipped

**Symptoms in cup:** Harsh, bitter, acrid, roasted-grain bitterness in front palate.

**Visual on green bean:** Black tips on the end of beans. Observable before roasting in a "tipped" lot.

**Cause:** Too high charge temperature or too much heat in early phases. The outer cell layers carbonize before interior reaches proper temperature.

**Fix:** Lower charge temperature. Increase airflow in early phase to prevent surface overheating.

---

#### Underdeveloped / Grassy

**Symptoms in cup:** Grassy, vegetal, hay-like, green tea-like without the elegance. Sour and starchy.

**Cause:** DTR too short — first crack reached too quickly without sufficient Maillard reaction time. Or beans dropped too early after first crack.

**Fix:** Slow the Maillard phase (reduce heat/airflow before first crack). Extend post-first-crack time. Target minimum DTR for roast level.

---

#### Faded / Stale (pre-roast)

**Symptoms in cup:** Flat, woody, papery, lacking vibrancy. No brightness or clarity.

**Cause:** Old crop green coffee or green stored poorly (humidity, temperature fluctuations). Not a roasting problem — a green quality problem.

**Fix:** Can't be fixed by roasting. Source fresher green. Darker roast slightly masks it, but quality ceiling is lower.

---

#### Quaker (in cup)

**Symptom in cup:** Peanut shell, raw grain, bland, hollow note that appears mid-sip.

**Visual:** In finished roasted coffee, quakers are underdeveloped beans — beige/pale in a dark batch. Easy to spot.

**Cause:** Immature green beans (picked before ripe) processed into the lot. They have low sugar content and don't develop properly during roasting.

**Fix in roasting:** None — roasting can't fix immature beans. Identify and sort them pre-roast. Improve sourcing QC — request lower defect count from supplier.

---

#### Uneven Roast (mottled appearance)

**Symptom:** Batch shows varying shades of brown — some beans much darker, some lighter.

**Cause:**
- Batch size too large for drum — beans stacking, not rolling evenly
- Drum speed too slow — insufficient agitation
- Bean density inconsistency in the lot
- Moisture variation in green

**Cup impact:** Inconsistent cup — some sips over-extracted (dark beans), some under (light beans).

**Fix:** Reduce batch size. Increase drum speed. Better green sorting.

---

## Part 7: Green Coffee Defects

### 7.1 SCA Primary Defects (Category 1)

Any of these present in a 350g sample disqualifies from specialty grade.

| Defect | Visual Description | Cup Impact |
|---|---|---|
| Full black | Entirely black bean | Phenolic, medicinal, pungent |
| Full sour | Yellow, brown, or reddish, wrinkled | Sour, vinegar, fermented |
| Dried cherry / pod | Whole cherry dried on bean | Fermented, winey, sour |
| Fungus-damaged | Wet, discolored patches (brown, ochre) | Musty, moldy, earthy-unpleasant |
| Foreign matter | Sticks, stones, glass, metal | Physical damage to equipment; bitter contamination |
| Severe insect damage | >3 holes per bean, internal damage | Bitter, hollow, earthy |

---

### 7.2 SCA Secondary Defects (Category 2)

Up to 5 full defect equivalents allowed in specialty grade (depending on severity mix).

| Defect | Visual Description | Cup Impact |
|---|---|---|
| Partial black | Portion of bean blackened | Phenolic, harsh, bitter |
| Partial sour | Discolored, light/irregular ferment | Slight sourness, off-note |
| Floater | Hollow, light bean (floats in water) | Hollow, thin, woody |
| Immature / unripe | Green, wrinkled, underdeveloped | Starchy, peanut, grassy |
| Withered | Thin, shriveled, drought-affected | Woody, papery, hollow |
| Shell / broken / cut | Split along natural seam, missing piece | Hollow shell = fast roasting = uneven. Slight papery. |
| Hull / husk | Parchment or silver skin still on | Woody, earthy, contaminating |
| Slight insect damage | 1–2 entry holes | Minor bitterness |

---

### 7.3 Roasted Coffee Defects (Post-Roast Inspection)

| Defect | Appearance | Cause | Cup Impact |
|---|---|---|---|
| Quaker | Pale/beige bean in finished batch | Immature green bean | Peanut shell, hollow |
| Tipped | Black charred tips | High charge temp | Harsh, acrid bitterness |
| Scorched | Dark patches on surface | Too much heat, underdevelopment | Harsh, grain, bitter |
| Blistered | Surface blisters | Moisture trapped, too rapid drying | Papery, hollow |
| Faded | Uniform very pale roast | Underdeveloped | Grassy, sour |
| Oily (too soon) | Surface oils on light/medium | Old beans outgassing, or over-roasted | Stale faster |
| Uneven | Mixed shades | Batch size, drum speed | Inconsistent cup |

---

### 7.4 Cup Defects and Their Diagnoses

| Cup Defect | Descriptor | Most Likely Source |
|---|---|---|
| Musty / earthy | Wet basement, soil | Fungal damage, poor storage |
| Rubbery | Tire, burnt rubber | Over-fermented or robusta contamination |
| Fermented / vinegary | Sour, balsamic | Over-fermented natural or poorly controlled washed |
| Phenolic | Medicine, antiseptic, Band-Aid | Full black beans in lot, or microbial contamination |
| Metallic | Metallic, coin | Equipment contamination, immature beans |
| Woody / papery | Cardboard, paper | Old crop, improper storage, parchment contamination |
| Skunky | Sulfurous, savory | Over-fermentation, specific anaerobic bacteria |
| Potato defect | Raw potato | Antestia bug damage (common in East Africa), Erwinia bacteria |
| Grassy / hay | Fresh cut grass | Under-roasted, underdeveloped, immature green |
| Smoky | Campfire, cigarette | Excessive chaff, airflow issues, dark roast artifact |

---

## Part 8: Brew Method Selection Guide

Agent decision tree: given a coffee and a goal, recommend the right method.

```
Goal: maximum clarity / origin transparency
  → V60, Chemex, Siphon
  → Washed coffees from Ethiopia, Kenya, Colombia

Goal: maximum body / full texture
  → French Press, Moka Pot
  → Indonesian coffees, Brazilian naturals, dark roasts

Goal: versatility / experimentation
  → AeroPress (infinite adjustability)
  → Any coffee

Goal: convenience / volume
  → Batch brewer, cold brew concentrate
  → Any coffee

Goal: concentrated / espresso-style without machine
  → Moka Pot, AeroPress (concentrate recipe)
  → Medium-dark roasts work best

Goal: low acidity
  → Cold brew (12–18h)
  → Brazilian naturals, Indonesian coffees, medium-dark roasts

Goal: showcase fruit / natural process coffee
  → V60 or AeroPress, lighter roast, 93–95°C
  → Ethiopian natural, Kenyan natural

Goal: teach a beginner
  → AeroPress (most forgiving), or Kalita Wave
  → Any approachable medium roast
```

---

## Part 9: Reference Tables

### 9.1 Coffee-to-Water Ratios by Method

| Method | Ratio | Grams Coffee | Grams Water |
|---|---|---|---|
| V60 | 1:15–1:17 | 15g | 225–255g |
| Chemex | 1:15–1:17 | 30g | 450–510g |
| French Press | 1:15–1:17 | 30g | 450–510g |
| AeroPress (standard) | 1:13–1:16 | 15–17g | 200–230g |
| AeroPress (concentrate) | 1:7–1:10 | 20g | 140–200g |
| Cold brew concentrate | 1:5–1:6 | 100g | 500–600g |
| Moka pot | N/A (fill basket) | Fill basket level | Fill to valve |
| Batch brew | 1:16–1:17 | 55–65g/L | Per batch size |
| Cupping (SCA) | 1:18.18 | 8.25g | 150ml |

---

### 9.2 Brewing Temperature Quick Reference

| Method | Temperature | Notes |
|---|---|---|
| V60 (light roast) | 94–96°C | Dense beans need heat |
| V60 (medium) | 92–94°C | Standard |
| V60 (dark roast) | 88–92°C | Lower temp reduces bitterness |
| AeroPress | 80–96°C | Adjustable by goal |
| French Press | 93–95°C | Full boil minus ~1 minute cooling |
| Moka Pot | Pre-boil water | Don't heat cold water in pot |
| Chemex | 94°C | Slightly lower due to thick paper |
| Espresso | 90–96°C | 93°C default |
| Cold brew | Room temp / 4°C | No heat |

---

### 9.3 Extraction Time Reference

| Method | Target Total Time |
|---|---|
| V60 (15g) | 2:30–3:30 |
| V60 (30g) | 3:30–4:30 |
| Chemex (30g) | 4:00–5:00 |
| French Press | 4:00 steep + 5:00 settle |
| AeroPress | 1:30–2:30 total + 20s press |
| Moka Pot | 3–5 minutes on stove |
| Espresso | 22–38 seconds |
| Cold brew | 12–24 hours |
| Siphon | 1:00–1:30 in top chamber |

---

### 9.4 Grind Size Quick Reference

Finest → Coarsest:

```
[Turkish/Ibrik] ← [Espresso] ← [AeroPress fine] ← [Moka Pot] ← [AeroPress standard]
← [V60 medium] ← [Kalita] ← [Chemex] ← [French Press] ← [Cold Brew]
```

Visual reference:
- Espresso: fine powder, slightly coarser than flour
- V60: table salt / fine beach sand
- French Press: coarse sea salt / raw sugar
- Cold brew: breadcrumbs / coarse cornmeal

---

## Part 10: Skill References & Further Learning

*These are authoritative sources this skill draws from. When a query requires more detail than the skill contains, direct the user to these.*

### Primary References

**SCA (Specialty Coffee Association)**
- Website: [sca.coffee](https://sca.coffee)
- Key resources: SCA Brewing Handbook, Green Coffee Classification, Water Quality Report, Barista Skills curriculum
- Protocols: Cupping, Water Standards, Green Coffee Defects, Brew Control Chart

**World Coffee Research (WCR)**
- Website: [worldcoffeeresearch.org](https://worldcoffeeresearch.org)
- Key resources: Sensory Lexicon (standardized flavor vocabulary with physical references), variety catalog, research on processing

**Coffee Quality Institute (CQI)**
- Website: [coffeeinstitute.org](https://coffeeinstitute.org)
- Key resources: Q Grader program, defect standards, cupping protocols

---

### Books

| Title | Author | Best For |
|---|---|---|
| The World Atlas of Coffee | James Hoffmann | Origins, processing, brew methods overview |
| Coffee Roaster's Companion | Scott Rao | Roasting — definitive reference |
| The Professional Barista's Handbook | Scott Rao | Espresso, milk, cafe operations |
| Water for Coffee | Maxwell Colonna-Dashwood & Christopher Hendon | Water chemistry and its effect on extraction |
| God in a Cup | Michaele Weissman | Specialty buying and sourcing culture |
| The Craft and Science of Coffee | Britta Folmer (ed.) | Academic overview of all stages |

---

### Online References

| Source | URL | Content |
|---|---|---|
| Barista Hustle | baristahustle.com | Extraction science, advanced techniques, free articles |
| Perfect Daily Grind | perfectdailygrind.com | Industry news, processing, origin features |
| Seattle Coffee Gear | seattlecoffeegear.com | Equipment guides |
| ICO (International Coffee Organization) | ico.org | Commodity prices, trade data, country reports |
| Cropster | cropster.com | Roast profiling documentation |
| Artisan Scope | artisan-scope.org | Free open-source roast profiling software docs |
| SCA Research | sca.coffee/research | Scientific papers, standards documents |
| Roast Magazine | roastmagazine.com | Trade journal for roasters |
| Jimseven (blog) | jimseven.com | James Hoffmann's research and experiments |

---

### Video & Educational

| Source | Platform | Content |
|---|---|---|
| James Hoffmann | YouTube | Brewing science, equipment, technique — best general channel |
| Lance Hedrick | YouTube | Espresso deep-dives, grinder testing |
| Hoffmann's V60 Technique | YouTube | Definitive V60 guide |
| World Barista Championship | YouTube | World-class espresso technique |
| Scott Rao | seminars / books | Roasting, extraction science |
| Tim Wendelboe | YouTube | Nordic approach to light roast brewing |

---

### Equipment Calibration Tools

| Tool | Use | Brands |
|---|---|---|
| Coffee refractometer | Measure TDS and extraction yield | Atago PAL-COFFEE, VST LAB Coffee III |
| Thermometer / probe | Water and milk temperature | Hario, Puckpuck, digital probe |
| Precision scale (0.1g) | Dose, yield, brew ratio | Acaia Pearl, Hario V60, Timemore |
| Moisture meter (green) | Green coffee moisture % | Sinar, Perten |
| Color meter | Roast level (Agtron number) | Agtron M-Basic, Tonino, Lighttells |
| Pressure gauge (portafilter) | Espresso machine calibration | Various |
| Distribution tool (WDT) | Espresso puck prep | Ona Coffee, DIY needle |

---

*This file is part of the coffee-industry-ai skill suite.*
*Primary knowledge file: SKILL.md*
*Quick reference: QUICKREF.md*
*Example prompts: EXAMPLE_PROMPTS.md*
*Last updated: 2026-06-01*
