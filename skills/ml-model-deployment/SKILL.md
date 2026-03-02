---
name: ml-model-deployment
description: MLOps platform for deploying, monitoring, and versioning ML models. Use when deploying ML models, managing model versions, setting up A/B tests, or monitoring model performance in production.
triggers:
  - "deploy model"
  - "ML model"
  - "model versioning"
  - "A/B test model"
  - "monitor model"
---

# ML Model Deployment Platform

Complete MLOps platform for managing ML model lifecycle: deployment, versioning, A/B testing, and monitoring.

## Capabilities

- **Model Deployment**: Deploy to production with one click
- **Version Management**: Track model versions and artifacts
- **A/B Testing**: Compare model performance
- **Monitoring**: Track accuracy, latency, and drift
- **Auto-Scaling**: Scale based on traffic

## Usage

```markdown
@skill ml-model-deployment

Deploy this model to production:
- Model: sentiment-analysis-v2.pkl
- Framework: scikit-learn
- Required resources: 2 CPU, 4GB RAM
```

## Workflow

### 1. Register Model

```python
from crucible.ml import ModelRegistry

registry = ModelRegistry()
model = registry.register(
    name="sentiment-analysis",
    version="2.0.0",
    artifact_path="./model.pkl",
    framework="sklearn",
    metrics={"accuracy": 0.94}
)
```

### 2. Deploy Model

```python
deployment = model.deploy(
    environment="production",
    replicas=3,
    resources={"cpu": 2, "memory": "4Gi"}
)
```

### 3. Monitor Performance

```python
from crucible.ml import ModelMonitor

monitor = ModelMonitor(model)
monitor.track_latency()
monitor.track_accuracy()
monitor.alert_on_drift()
```

## Features

- **Blue/Green Deployment**: Zero-downtime updates
- **Canary Releases**: Gradual rollout
- **Feature Store**: Centralized feature management
- **Model Explainability**: SHAP values and LIME
- **Drift Detection**: Data and concept drift

## Integration

- MLflow: Experiment tracking
- Kubeflow: Pipeline orchestration
- Prometheus: Metrics
- Grafana: Dashboards
