# SDLC Design Skills, Agents, and Workflows

## 1. SDLC Design Skills

- **Architecture design:** system decomposition, microservices, monoliths,
  event-driven, serverless, layered, hexagonal, CQRS/Event Sourcing
- **Domain modeling:** DDD, entities/value objects/aggregates, bounded contexts,
  context mapping
- **Requirements analysis:** functional/non-functional requirements,
  constraints, risk analysis
- **UML & visual modeling:** class, sequence, activity, state, component,
  deployment, C4, BPMN
- **API design:** REST, GraphQL, gRPC, OpenAPI, versioning, error handling,
  idempotency
- **Database design:** ER modeling, normalization/denormalization, indexing,
  partitioning, schema migration
- **Design patterns:** GoF, architectural patterns, integration patterns,
  anti-patterns
- **Security design:** threat modeling (STRIDE/DREAD), secure-by-design,
  authentication/authorization, secrets management
- **Performance & scalability:** caching, load balancing, horizontal/vertical
  scaling, CAP trade-offs
- **Reliability design:** resilience patterns, circuit breakers, retries,
  observability, disaster recovery
- **UX/UI design:** wireframing, prototyping, design systems, usability,
  accessibility (WCAG)
- **Trade-off analysis:** decision matrices, ATAM, cost/performance/risk
  trade-offs, ADRs
- **Data flow & integration design:** ETL/ELT, messaging, event streaming, API
  gateways
- **Compliance & governance:** GDPR, HIPAA, SOC2, data residency, audit trails
- **Maintainability & testability:** clean architecture, modularity, dependency
  management, TDD alignment

## 2. SDLC Design Agents

- **Software/System Architect:** owns high-level and low-level design,
  technology choices
- **Solution Architect:** maps business requirements to technical solutions
- **Enterprise Architect:** aligns design with organizational strategy and
  standards
- **Product Manager / Product Owner:** defines scope, priorities, acceptance
  criteria
- **Business Analyst:** elicits and documents requirements, models processes
- **UX/UI Designer:** designs user flows, wireframes, prototypes, design system
- **Technical Lead / Engineering Lead:** guides implementation feasibility and
  design review
- **Security Architect / AppSec Engineer:** threat models and reviews security
  posture
- **Data Architect / DBA:** designs data models, storage, and data pipelines
- **DevOps / SRE / Platform Engineer:** designs CI/CD, infrastructure,
  observability, deployment
- **QA / Test Architect:** defines test strategy, testability, and validation
  approach
- **AI coding/design assistant:** suggests patterns, generates diagrams, drafts
  ADRs, reviews design
- **Compliance / Risk Officer:** ensures regulatory and policy adherence
- **Customer / End-user representative:** validates problem fit and usability

## 3. SDLC Design Workflows

- **Requirements → Design:** elicit → analyze → specify → validate requirements
  before designing
- **Architecture decision workflow:** identify need → explore options → evaluate
  trade-offs → document ADR → approve
- **Top-down design workflow:** conceptual design → high-level design (HLD) →
  low-level design (LLD)
- **Domain-driven design workflow:** event storming → bounded contexts → domain
  model → tactical patterns
- **UX design workflow:** research → personas → user journey → wireframes →
  prototype → usability test
- **API design workflow:** define use cases → design contract → review → mock →
  version → publish
- **Data design workflow:** conceptual → logical → physical model → schema
  review → migration plan
- **Security design workflow:** identify assets → threat model → define controls
  → review
- **Design review workflow:** present design → peer review → capture feedback →
  approve or iterate
- **Prototype / PoC workflow:** hypothesis → build prototype → validate → refine
  or reject
- **Traceability workflow:** map requirements ↔ design artifacts ↔ tests ↔ code
- **Design handoff workflow:** finalize artifacts → document → review with
  implementation team → handoff
- **Design change control:** assess impact → update artifacts → re-approve →
  communicate changes
