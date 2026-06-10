---
name: ci-cd-orchestrator
description:
  Multi-cloud CI/CD pipeline automation platform with support for Docker,
  Kubernetes, and serverless deployments. Use when setting up CI/CD pipelines,
  automating deployments, managing release workflows, or implementing GitOps.
triggers:
  - 'CI/CD'
  - 'pipeline'
  - 'deployment'
  - 'automate deploy'
  - 'GitOps'
  - 'release'
---

# CI/CD Orchestrator

Multi-cloud CI/CD platform supporting Docker, Kubernetes, and serverless
deployments with GitOps workflows.

## Capabilities

- **Pipeline Orchestration**: Visual workflow editor
- **Multi-Cloud**: AWS, Azure, GCP, Vercel
- **Docker**: Container builds and registry
- **Kubernetes**: K8s deployments and Helm
- **Serverless**: Lambda, Functions, Edge

## Usage

```markdown
@skill ci-cd-orchestrator

Set up CI/CD for my project:

- Repository: github.com/org/app
- Build: Docker
- Deploy: Kubernetes
- Stages: test → staging → production
```

## Pipeline Configuration

```yaml
# crucible.yaml
version: 1

pipeline:
  name: production-deploy
  triggers:
    - push:
        branches: [main]
    - pull_request:
        branches: [main]

stages:
  - name: test
    steps:
      - run: npm ci
      - run: npm test
      - run: npm run lint

  - name: build
    steps:
      - docker:
          image: myapp:${BUILD_ID}
          registry: ghcr.io

  - name: deploy-staging
    condition: branch == 'main'
    steps:
      - kubernetes:
          namespace: staging
          manifest: ./k8s/

  - name: deploy-production
    condition: manual
    steps:
      - kubernetes:
          namespace: production
          manifest: ./k8s/
```

## Deployment Targets

### Docker

```typescript
await deploy.docker({
  image: 'myapp:latest',
  registry: 'ghcr.io/org/repo',
  tags: ['latest', 'v1.0.0'],
})
```

### Kubernetes

```typescript
await deploy.kubernetes({
  namespace: 'production',
  manifests: ['./k8s/deployment.yaml'],
  strategy: 'rolling',
})
```

### Serverless

```typescript
await deploy.serverless({
  provider: 'vercel',
  regions: ['iad1', 'sfo1'],
})
```

## Features

- **Matrix Builds**: Test across multiple Node versions
- **Parallel Steps**: Speed up with parallel execution
- **Artifacts**: Pass files between stages
- **Secrets**: Encrypted environment variables
- **Notifications**: Slack, Email, Discord

## Integration

- GitHub Actions: Native integration
- GitLab CI: Runner support
- Bitbucket: Pipeline triggers
- Jenkins: Plugin available
- ArgoCD: GitOps sync
