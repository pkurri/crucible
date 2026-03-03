---
name: ab-testing-platform
description:
  A/B testing and experimentation platform for feature rollouts, conversion
  optimization, and statistical analysis. Use when running experiments, testing
  features, measuring conversion, or analyzing experiment results.
triggers:
  - 'A/B test'
  - 'experiment'
  - 'split test'
  - 'feature flag'
  - 'conversion optimization'
  - 'experimentation'
---

# A/B Testing Platform

Experimentation platform for A/B tests, feature flags, and conversion
optimization.

## Capabilities

- **A/B Tests**: Split traffic, measure outcomes
- **Feature Flags**: Gradual rollouts
- **Multivariate**: Multiple variable testing
- **Analysis**: Statistical significance
- **Targeting**: User segmentation

## Usage

```markdown
@skill ab-testing-platform

Create an A/B test:

- Name: New checkout flow
- Variants: Current vs New
- Metric: Conversion rate
- Traffic: 50/50 split
- Duration: 2 weeks
```

## Experiment Setup

```typescript
import {Experiment} from '@crucible/experiments'

const experiment = new Experiment({
  name: 'checkout-redesign',
  description: 'Test new checkout flow',

  variants: [
    {id: 'control', name: 'Current', weight: 0.5},
    {id: 'treatment', name: 'New Design', weight: 0.5},
  ],

  metrics: [
    {
      name: 'conversion',
      type: 'conversion',
      event: 'purchase_completed',
    },
    {
      name: 'revenue',
      type: 'revenue',
      event: 'purchase_completed',
      value: 'amount',
    },
  ],

  targeting: {
    percentage: 100,
    rules: [{attribute: 'country', operator: 'in', value: ['US', 'CA']}],
  },
})

// Assign user to variant
const variant = await experiment.assign(userId)

// Track events
experiment.track(userId, 'purchase_completed', {amount: 99.99})
```

## Feature Flags

```typescript
import { FeatureFlag } from '@crucible/experiments';

const flag = new FeatureFlag({
  name: 'new-dashboard',
  description: 'Enable new dashboard UI',
  defaultValue: false
});

// Check if enabled
if (await flag.isEnabled(userId)) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}

// Gradual rollout
await flag.rollout({
  percentage: 10,
  targeting: { segments: ['beta-users'] }
});
```

## Analysis

```typescript
// Get experiment results
const results = await experiment.analyze();

// Output:
{
  status: 'significant',
  winner: 'treatment',
  metrics: {
    conversion: {
      control: 0.12,
      treatment: 0.15,
      lift: 0.25,
      pValue: 0.03,
      significant: true
    }
  },
  sampleSize: {
    control: 10000,
    treatment: 10000
  },
  duration: '14 days'
}
```

## Statistical Methods

- **Frequentist**: Z-test, T-test
- **Bayesian**: Probability of best variant
- **Sequential**: Early stopping
- **Multi-armed Bandit**: Dynamic allocation

## Integration

- React: Component-level experiments
- Node.js: Server-side rendering
- Mobile: React Native SDK
- Analytics: Amplitude, Mixpanel
- Data Warehouse: Snowflake sync

## Best Practices

1. **Hypothesis**: Define before testing
2. **Sample Size**: Calculate minimum detectable effect
3. **Duration**: Run for full business cycles
4. **Isolation**: One test per user at a time
5. **Monitoring**: Watch for negative impacts
