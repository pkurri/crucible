export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Crucible Templates
          </h1>
          <p className="text-xl text-gray-600">
            Production-ready templates for rapid development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI/ML Templates */}
          <TemplateCard
            number="031"
            name="AI Code Reviewer"
            category="AI/ML"
            description="Automated code review with AI suggestions"
          />
          <TemplateCard
            number="032"
            name="ML Model Deployment"
            category="AI/ML"
            description="Production ML model serving platform"
          />
          <TemplateCard
            number="033"
            name="AI Content Generator"
            category="AI/ML"
            description="Multi-modal content generation with AI"
          />
          <TemplateCard
            number="034"
            name="Computer Vision Pipeline"
            category="AI/ML"
            description="Real-time image processing with object detection"
          />
          <TemplateCard
            number="035"
            name="NLP Sentiment Analyzer"
            category="AI/ML"
            description="Multi-language sentiment analysis with entity extraction"
          />
          <TemplateCard
            number="036"
            name="Predictive Maintenance"
            category="AI/ML"
            description="IoT sensor monitoring with ML-based failure prediction"
          />
          <TemplateCard
            number="037"
            name="Document Processor"
            category="AI/ML"
            description="OCR and data extraction from documents, forms, and receipts"
          />
          <TemplateCard
            number="038"
            name="Voice Assistant"
            category="AI/ML"
            description="Speech recognition, NLU, and text-to-speech system"
          />
          <TemplateCard
            number="039"
            name="Fraud Detection"
            category="AI/ML"
            description="Real-time transaction monitoring and anomaly detection"
          />
          <TemplateCard
            number="040"
            name="Recommendation Engine"
            category="AI/ML"
            description="Collaborative and content-based filtering for personalized recommendations"
          />
          <TemplateCard
            number="041"
            name="Chatbot Builder"
            category="AI/ML"
            description="Conversational AI with context management and multi-turn dialogue"
          />
          <TemplateCard
            number="042"
            name="Autonomous Agent"
            category="AI/ML"
            description="Self-directed AI agents with goal-oriented behavior"
          />
          <TemplateCard
            number="043"
            name="Knowledge Graph"
            category="AI/ML"
            description="Entity extraction and relationship mapping from unstructured data"
          />
          <TemplateCard
            number="044"
            name="Time Series Forecasting"
            category="AI/ML"
            description="Predictive analytics for trends, seasonality, and anomalies"
          />
          <TemplateCard
            number="045"
            name="Multi-Modal AI"
            category="AI/ML"
            description="Vision, text, and audio combined AI applications"
          />
          <TemplateCard
            number="046"
            name="Subscription Management"
            category="SaaS"
            description="Recurring billing and subscription platform"
          />

          {/* SaaS/Business Templates */}
          <TemplateCard
            number="047"
            name="CRM Platform"
            category="SaaS"
            description="Customer relationship management with pipeline and automation"
          />
          <TemplateCard
            number="048"
            name="Project Management"
            category="SaaS"
            description="Task tracking, Gantt charts, and team collaboration"
          />
          <TemplateCard
            number="049"
            name="Invoicing System"
            category="SaaS"
            description="Automated invoicing, payments, and financial reporting"
          />
          <TemplateCard
            number="050"
            name="HR Management"
            category="SaaS"
            description="Employee onboarding, time tracking, and performance reviews"
          />
          <TemplateCard
            number="051"
            name="Event-Driven Microservices"
            category="SaaS"
            description="Kafka-based event architecture"
          />
          <TemplateCard
            number="052"
            name="Marketing Automation"
            category="SaaS"
            description="Email campaigns, lead scoring, and customer journeys"
          />
          <TemplateCard
            number="053"
            name="Helpdesk Ticketing"
            category="SaaS"
            description="Customer support with SLA tracking and knowledge base"
          />
          <TemplateCard
            number="054"
            name="Document Collaboration"
            category="SaaS"
            description="Real-time document editing with comments and versioning"
          />
          <TemplateCard
            number="055"
            name="Form Builder"
            category="SaaS"
            description="Drag-and-drop form creation with conditional logic"
          />
          <TemplateCard
            number="056"
            name="Appointment Scheduler"
            category="SaaS"
            description="Calendar integration with automated reminders"
          />
          <TemplateCard
            number="057"
            name="Inventory Management"
            category="SaaS"
            description="Stock tracking, reorder points, and supplier management"
          />

          {/* Security Templates */}
          <TemplateCard
            number="058"
            name="API Gateway Kong"
            category="Security"
            description="Rate limiting and authentication proxy"
          />
          <TemplateCard
            number="059"
            name="Identity Access Management"
            category="Security"
            description="IAM with SSO, MFA, and role-based access control"
          />
          <TemplateCard
            number="060"
            name="Threat Intelligence"
            category="Security"
            description="Security event correlation and threat detection"
          />
          <TemplateCard
            number="061"
            name="Security Audit Platform"
            category="Security"
            description="Compliance monitoring and reporting"
          />
          <TemplateCard
            number="062"
            name="Vulnerability Scanner"
            category="Security"
            description="Automated security scanning for CVEs and misconfigurations"
          />
          <TemplateCard
            number="063"
            name="Secrets Manager"
            category="Security"
            description="Secure credential storage and rotation"
          />
          <TemplateCard
            number="064"
            name="Compliance Automation"
            category="Security"
            description="SOC2, GDPR, HIPAA compliance monitoring and reporting"
          />
          <TemplateCard
            number="065"
            name="Penetration Testing"
            category="Security"
            description="Security testing tools and reporting"
          />
          <TemplateCard
            number="066"
            name="Security Operations Center"
            category="Security"
            description="SOC dashboard with incident response workflows"
          />
          <TemplateCard
            number="067"
            name="Cloud Security Posture"
            category="Security"
            description="CSPM for multi-cloud security monitoring"
          />
          <TemplateCard
            number="068"
            name="App Security Testing"
            category="Security"
            description="SAST, DAST, and SCA integration"
          />
          <TemplateCard
            number="069"
            name="Zero Trust Architecture"
            category="Security"
            description="Identity verification and micro-segmentation"
          />
          <TemplateCard
            number="070"
            name="Blockchain Security Audit"
            category="Security"
            description="Smart contract auditing and transaction monitoring"
          />

          {/* Analytics/Data Templates */}
          <TemplateCard
            number="071"
            name="Real-Time Analytics"
            category="Analytics"
            description="Clickstream processing with Apache Flink"
          />
          <TemplateCard
            number="072"
            name="Data Warehouse"
            category="Analytics"
            description="Columnar storage with ETL pipelines"
          />
          <TemplateCard
            number="073"
            name="BI Dashboard"
            category="Analytics"
            description="BI with drag-and-drop report building"
          />
          <TemplateCard
            number="074"
            name="Cohort Analysis"
            category="Analytics"
            description="User retention and behavioral analytics"
          />
          <TemplateCard
            number="075"
            name="Search Engine"
            category="Analytics"
            description="Elasticsearch-powered search with faceting"
          />
          <TemplateCard
            number="076"
            name="Progressive Web App"
            category="Analytics"
            description="Offline-first with service workers"
          />
          <TemplateCard
            number="077"
            name="Log Analytics"
            category="Analytics"
            description="Centralized logging with pattern detection"
          />
          <TemplateCard
            number="078"
            name="Predictive Analytics"
            category="Analytics"
            description="Statistical modeling and forecasting"
          />
          <TemplateCard
            number="079"
            name="Customer Data Platform"
            category="Analytics"
            description="Unified customer profiles and segmentation"
          />
          <TemplateCard
            number="080"
            name="Data Governance"
            category="Analytics"
            description="Data catalog, lineage, and quality monitoring"
          />

          {/* DevOps/Infrastructure Templates */}
          <TemplateCard
            number="081"
            name="CI/CD Orchestrator"
            category="DevOps"
            description="GitHub Actions/GitLab CI pipeline builder"
          />
          <TemplateCard
            number="082"
            name="Container Orchestration"
            category="DevOps"
            description="Kubernetes cluster management platform"
          />
          <TemplateCard
            number="083"
            name="Service Mesh"
            category="DevOps"
            description="Istio/Linkerd service mesh implementation"
          />
          <TemplateCard
            number="084"
            name="Terraform Generator"
            category="DevOps"
            description="Infrastructure-as-code scaffolding"
          />
          <TemplateCard
            number="085"
            name="GitOps Deployment"
            category="DevOps"
            description="ArgoCD/Flux GitOps workflows"
          />
          <TemplateCard
            number="086"
            name="Multi-Cloud Manager"
            category="DevOps"
            description="Cross-cloud resource management"
          />
          <TemplateCard
            number="087"
            name="GraphQL Federation"
            category="DevOps"
            description="Apollo Federation gateway"
          />
          <TemplateCard
            number="088"
            name="Load Testing"
            category="DevOps"
            description="Performance testing and bottleneck analysis"
          />
          <TemplateCard
            number="089"
            name="Chaos Engineering"
            category="DevOps"
            description="Failure injection and resilience testing"
          />
          <TemplateCard
            number="090"
            name="Cost Optimization"
            category="DevOps"
            description="Cloud spend analysis and recommendations"
          />
          <TemplateCard
            number="091"
            name="Backup & DR"
            category="DevOps"
            description="Automated backup and DR orchestration"
          />
          <TemplateCard
            number="092"
            name="Serverless Platform"
            category="DevOps"
            description="Lambda/Cloud Functions management"
          />
          <TemplateCard
            number="093"
            name="Platform Engineering"
            category="DevOps"
            description="Internal developer platform and self-service"
          />

          {/* Web/Mobile Templates */}
          <TemplateCard
            number="094"
            name="E-Commerce Platform"
            category="Web/Mobile"
            description="Multi-vendor marketplace with payments"
          />
          <TemplateCard
            number="095"
            name="Social Media Platform"
            category="Web/Mobile"
            description="Content sharing, feeds, and social graph"
          />
          <TemplateCard
            number="096"
            name="Messaging Chat"
            category="Web/Mobile"
            description="Real-time messaging with end-to-end encryption"
          />
          <TemplateCard
            number="097"
            name="Video Streaming"
            category="Web/Mobile"
            description="HLS/DASH adaptive bitrate streaming"
          />
          <TemplateCard
            number="098"
            name="Content Management"
            category="Web/Mobile"
            description="Headless CMS with editorial workflows"
          />
          <TemplateCard
            number="099"
            name="Collaborative Whiteboard"
            category="Web/Mobile"
            description="Excalidraw-style canvas with CRDTs"
          />
          <TemplateCard
            number="100"
            name="Mobile Backend"
            category="Web/Mobile"
            description="Backend for mobile apps with sync and push"
          />
        </div>
      </div>
    </main>
  );
}

function TemplateCard({
  number,
  name,
  category,
  description,
}: {
  number: string;
  name: string;
  category: string;
  description: string;
}) {
  const colors: Record<string, string> = {
    'AI/ML': 'bg-purple-100 text-purple-800',
    'SaaS': 'bg-blue-100 text-blue-800',
    'Security': 'bg-red-100 text-red-800',
    'Analytics': 'bg-green-100 text-green-800',
    'DevOps': 'bg-orange-100 text-orange-800',
    'Web/Mobile': 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
          {category}
        </span>
        <span className="text-gray-400 text-sm font-mono">#{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
