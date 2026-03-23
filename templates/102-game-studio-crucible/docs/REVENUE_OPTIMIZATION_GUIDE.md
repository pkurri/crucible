# 💰 How to Use: Revenue Optimizer

The **Revenue Optimizer** is built directly into the Crucible Gaming Studio workflow. It helps you decide which features should be **FREE** (to maximize reach) and which should be **PRO** (to maximize revenue).

## 1. Triggering the Optimizer

You can trigger the optimizer at any point in **Phase 1 (Market & Feasibility)**.

```bash
/revenue-opt "A casual match-3 puzzle game on mobile"
```

The system will analyze your game's genre and mechanics to produce a split.

## 2. Reading the Optimization Plan (`REVENUE_PLAN.md`)

The optimizer generates a `REVENUE_PLAN.md` file in your `docs/` folder. It classifies features as follows:

| Classification | Goal | Examples |
| :--- | :--- | :--- |
| **FREE (The Hook)** | Reach & Retention | Core mechanics, basic skins, first 20 levels. |
| **PRO (The Value)** | Conversion & Revenue | Expansion packs, ad-removal, exclusive VFX. |
| **IAP (The Upsell)** | Daily Monetization | Currency packs, energy refills, battle passes. |

## 3. Integrating with Agents

Once the revenue plan is finalized, follow these steps to integrate it into development:

1.  **ECONOMY DESIGNER**: Uses the `REVENUE_PLAN.md` to balance the numbers (drop rates, prices).
2.  **GAME DESIGN LEAD**: Updates the GDD to include [PRO] tags on specific features.
3.  **PRODUCER**: Prioritizes [FREE] features for the MVP and [PRO] features for the v1.1 update.
4.  **UI SPECIALIST**: Implements the "Pro Store" and "Upsell" screens based on the plan.

## 4. Automation: The Master Switch

You can tell the studio to prioritize specific revenue models:
- `"Optimize for High-Reach (Ad-Supported F2P)"`
- `"Optimize for High-ARPU (Hybrid/IAP-heavy)"`
- `"Optimize for Premium (Pro-only/No Ads)"`

The **REVENUE_OPTIMIZER** will adjust the feature-set accordingly.

---
Part of **Crucible: Gaming Edition**.
