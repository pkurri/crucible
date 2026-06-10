---
name: revenue-optimizer
description: 'Optimize game revenue by analyzing monetization models (Free vs Pro/Premium).
  Generates monetization plans, IAP strategies, and subscription models based on game mechanics.'
license: 'MIT (see repo LICENSE)'
triggers:
  - "When designing monetization for a game"
  - "When the user wants to optimize revenue"
  - "When deciding between free and pro features"
---

# Revenue Optimizer

The Revenue Optimizer analyzes game mechanics and audience to recommend the most effective monetization strategy, specifically distinguishing between Free-to-Play (F2P) and Pro/Premium tiers.

## Workflow

1. **Analyze Game Core**: identify key mechanics, loop, and player types.
2. **Tier Segmentation**: Define what goes into the 'Free' tier vs 'Pro' tier.
3. **Monetization Strategy**:
   - **Free Tier**: Ads, micro-transactions, cosmetic IAPs.
   - **Pro Tier**: One-time purchase, battle passes, exclusive content, ad-free experience.
4. **Economy Balancing**: Ensure the economy isn't 'pay-to-win' if competitive.

## Commands

- `/revenue-audit`: Audit existing game for revenue leaks.
- `/monetize-free`: Generate 10 F2P monetization ideas.
- `/monetize-pro`: Generate "Pro" tier features for premium conversion.

## References

- [Monetization Patterns](references/monetization-patterns.md)
- [Psychological Triggers](references/psychological-triggers.md)
- [Pricing Strategy](references/pricing-strategy.md)

## Integration Points

- Works with `economy-designer` and `producer` agents.
- Links to `043-game-studio-agents` for end-to-end development.
