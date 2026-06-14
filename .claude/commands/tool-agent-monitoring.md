---
name: tool-agent-monitoring
description: >
  Agent performance monitoring and analytics system. Tracks agent productivity,
  communication patterns, task completion rates, and collaboration metrics.
  Provides real-time dashboards, performance insights, and optimization
  recommendations for multi-agent teams. Use when monitoring agent
  effectiveness, optimizing workflows, or analyzing team performance.
triggers:
  - 'agent monitoring'
  - 'performance metrics'
  - 'agent analytics'
  - 'team productivity'
  - 'agent performance'
  - 'monitor agents'
  - 'agent metrics'
---

# Tool: Agent Monitoring

Comprehensive monitoring and analytics system for tracking agent performance,
communication patterns, and collaboration effectiveness in multi-agent
environments.

---

## Setup

```bash
npm install @types/node prom-client chart.js ws
```

---

## Best Practices

1. **Comprehensive Coverage**: Monitor all aspects of agent performance
2. **Real-time Updates**: Provide immediate feedback on agent activities
3. **Actionable Insights**: Generate specific, actionable recommendations
4. **Privacy Respect**: Monitor performance without compromising agent privacy
5. **Benchmarking**: Compare performance against industry standards
6. **Continuous Improvement**: Use monitoring data to optimize agent workflows

---

## Environment Variables

```bash
# Monitoring Configuration
METRICS_COLLECTION_INTERVAL=60
METRICS_RETENTION_DAYS=30
DASHBOARD_UPDATE_INTERVAL=5

# Alert Configuration
ALERT_CHECK_INTERVAL=60
ALERT_NOTIFICATION_CHANNELS=email,slack
ALERT_ESCALATION_TIMEOUT=3600
```
