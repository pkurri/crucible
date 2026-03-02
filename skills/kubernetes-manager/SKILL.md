---
name: kubernetes-manager
description: Kubernetes cluster management and application deployment with Helm charts, monitoring, and auto-scaling. Use when deploying to K8s, managing clusters, setting up Helm, or configuring ingress and services.
triggers:
  - "Kubernetes"
  - "K8s"
  - "Helm"
  - "deploy to cluster"
  - "container orchestration"
---

# Kubernetes Manager

Complete Kubernetes management with deployments, services, ingress, and Helm charts.

## Capabilities

- **Deployments**: Rolling updates, rollback
- **Services**: Load balancing, discovery
- **Ingress**: Traffic routing, SSL
- **Helm**: Package management
- **Monitoring**: Prometheus, Grafana
- **Auto-scaling**: HPA, VPA

## Usage

```markdown
@skill kubernetes-manager

Deploy my app to Kubernetes:
- Image: ghcr.io/org/app:v1.0
- Replicas: 3
- Resources: 1 CPU, 2GB RAM
- Ingress: app.example.com
```

## Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: ghcr.io/org/app:v1.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
```

## Service & Ingress

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt"
spec:
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

## Helm Chart

```yaml
# Chart.yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

## Commands

```bash
# Deploy
kubectl apply -f deployment.yaml

# Update
kubectl set image deployment/my-app app=ghcr.io/org/app:v1.1

# Rollback
kubectl rollout undo deployment/my-app

# Scale
kubectl scale deployment my-app --replicas=5

# View logs
kubectl logs -f deployment/my-app
```

## Features

- **ConfigMaps**: External configuration
- **Secrets**: Sensitive data
- **PVCs**: Persistent storage
- **Jobs**: Batch processing
- **CronJobs**: Scheduled tasks
- **Network Policies**: Security
