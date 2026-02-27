-- Enable RLS on all tenant tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Only allow access to rows matching current org context
CREATE POLICY "org_isolation" ON projects
  USING (org_id = (current_setting('app.org_id', true))::uuid);

-- Grant access to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO app_user;
