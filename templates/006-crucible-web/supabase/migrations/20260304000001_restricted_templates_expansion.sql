-- Ecosystem Completion: Additional Restricted Templates
-- Migration: Phase 2

-- 1. Register Additional Restricted Templates
INSERT INTO forge_templates (template_id, name, category, description, icon, tier, complexity, estimated_setup, included_agents, capabilities, integrations, is_restricted)
VALUES 
(
    'vakeels-client-portal', 
    'Legal Client Portal', 
    'Legal', 
    'Secure, high-contrast interface for client-attorney synergy and document management.', 
    'Lock', 
    'Pro', 
    'Medium', 
    '4 minutes', 
    ARRAY['The Case Historian', 'The Guardian'], 
    ARRAY['Client Dashboard', 'Secure Vault', 'Status Timeline'], 
    ARRAY['Vakeels Brain', 'NyayaLink'], 
    TRUE
),
(
    'vakeels-llm-customizer', 
    'Legal LLM Customizer', 
    'AI', 
    'Advanced developer workbench for fine-tuning and evaluating legal model performance.', 
    'Terminal', 
    'Enterprise', 
    'High', 
    '6 minutes', 
    ARRAY['The Drafting Architect', 'The Guardian'], 
    ARRAY['Model Tuning', 'Hallucination Audit', 'Dataset Scrubbing'], 
    ARRAY['OpenAI API', 'Custom Legal LoRA'], 
    TRUE
),
(
    'forecast-ops-dashboard', 
    'Forecast Ops Dashboard', 
    'Operations', 
    'Operational backbone for professional services, tracking resource burn-rates and case timelines.', 
    'TrendingUp', 
    'Pro', 
    'Medium', 
    '3 minutes', 
    ARRAY['Ops Controller', 'Trend Scout'], 
    ARRAY['Predictive Timelines', 'Resource Analytics', 'Margin Control'], 
    ARRAY['Billing API', 'Resource Manager'], 
    TRUE
),
(
    'sentinel-security-hub', 
    'Sentinel Security Hub', 
    'Security', 
    'Global monitoring node for ecosystem-wide compliance and PII leak prevention.', 
    'Shield', 
    'Pro', 
    'Low', 
    '2 minutes', 
    ARRAY['The Guardian'], 
    ARRAY['Leak Alerts', 'Compliance Audit', 'Access Review'], 
    ARRAY['Security API', 'Auth Monitor'], 
    TRUE
);
