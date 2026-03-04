-- Vakeels & LegalSnaps Ecosystem Expansion
-- Unified Migration: Phase 1

-- 1. Add restriction flag to skills and templates if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forge_skills' AND column_name='is_restricted') THEN
        ALTER TABLE forge_skills ADD COLUMN is_restricted BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forge_templates' AND column_name='is_restricted') THEN
        ALTER TABLE forge_templates ADD COLUMN is_restricted BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents_registry' AND column_name='is_restricted') THEN
        ALTER TABLE agents_registry ADD COLUMN is_restricted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Register Specialized Skills (Restricted)
INSERT INTO forge_skills (name, category, description, capabilities, is_restricted, status)
VALUES 
('Legal Precedent Search', 'Data', 'Provides structured access to legal case law and Indian precedents.', ARRAY['citation-search', 'precedent-linking'], TRUE, 'active'),
('PII Redaction Engine', 'Security', 'Ensures client privacy by masking Personally Identifiable Information (PII) in legal drafts.', ARRAY['entity-redaction', 'privacy-audit'], TRUE, 'active'),
('Project Style Extractor', 'Design', 'Dynamically extracts brand DNA from target URLs to flow styles into infographics.', ARRAY['css-variable-scan', 'asset-extraction'], TRUE, 'active'),
('WP REST Publisher', 'Operations', 'Automated content publishing directly to WordPress platforms.', ARRAY['rest-api-auth', 'media-sync'], TRUE, 'active');

-- 3. Register Specialized Agents (Restricted)
INSERT INTO agents_registry (name, type, description, capabilities, is_restricted, status)
VALUES 
('The Case Historian', 'case-historian', 'Indexes and retrieves the vast legal knowledge of Indian precedents.', ARRAY['knowledge-sync', 'legal-research'], TRUE, 'idle'),
('The Guardian', 'guardian-node', 'Monitors ecosystem compliance and guarantees data privacy.', ARRAY['security-audit', 'compliance-monitoring'], TRUE, 'idle'),
('The News Scout', 'news-scout', 'Curates snapworthy legal news for literacy platforms.', ARRAY['content-curation', 'impact-analysis'], TRUE, 'idle'),
('The Visual Architect', 'visual-architect', 'Designs style-matched legal infographics and data visualizations.', ARRAY['layout-design', 'style-flow'], TRUE, 'idle'),
('The Web Publisher', 'web-publisher', 'Automates publishing to WordPress instances.', ARRAY['automated-posting', 'wp-management'], TRUE, 'idle');

-- 4. Register Vakeels & LegalSnaps Templates
INSERT INTO forge_templates (template_id, name, category, description, icon, tier, complexity, estimated_setup, included_agents, capabilities, integrations, is_restricted)
VALUES 
('vakeels-brain-node', 'Vakeels Brain (Legal Research)', 'Legal', 'Architectural blueprint for Indian legal intelligence and research persistence.', 'BrainCircuit', 'Enterprise', 'High', '5 minutes', ARRAY['The Case Historian', 'The Guardian'], ARRAY['Case Research', 'Precedent Sync'], ARRAY['Supabase Vector', 'LawSearch API'], TRUE),
('legalsnaps-cms-sync', 'LegalSnaps CMS Automator', 'Operations', 'End-to-end content pipeline for legal literacy platforms on WordPress.', 'Terminal', 'Pro', 'Medium', '3 minutes', ARRAY['The News Scout', 'The Web Publisher', 'The Visual Architect'], ARRAY['Auto-News', 'Infographic Forge'], ARRAY['WordPress REST API'], TRUE);
