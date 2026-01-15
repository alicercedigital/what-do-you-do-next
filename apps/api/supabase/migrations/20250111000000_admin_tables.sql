-- Migration: Admin Panel Tables
-- Run these SQL statements in your Supabase SQL editor

-- 1. Add is_admin column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- 2. Create system_config table for runtime configuration
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default configuration values
INSERT INTO system_config (key, value, description) VALUES
  ('credit_costs', '{"ai_generation": 5, "image_generation": 10, "smart_model": 8, "cheap_model": 2}', 'Credit costs for AI operations'),
  ('tier_limits', '{"free": {"universes": 3, "ai_per_day": 20}, "creator": {"universes": 10, "ai_per_day": 100}, "pro": {"universes": -1, "ai_per_day": -1}}', 'Limits per tier (-1 = unlimited)'),
  ('feature_flags', '{"new_editor": true, "marketplace_v2": false, "challenges": true}', 'Feature flags'),
  ('maintenance_mode', 'false', 'Maintenance mode flag')
ON CONFLICT (key) DO NOTHING;

-- 3. Create admin_audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_logs(target_type, target_id);

-- 4. Create content_reports table for user reports
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for content reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON content_reports(reporter_id);

-- 5. Create user_bans table for ban management
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  banned_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id)
);

-- Index for ban lookups
CREATE INDEX IF NOT EXISTS idx_bans_user ON user_bans(user_id, is_active);

-- 6. Add is_banned computed column or function for profiles
-- Note: You may want to add a trigger or view to compute is_banned status

-- Create a view to check ban status (optional helper)
CREATE OR REPLACE VIEW active_bans AS
SELECT DISTINCT user_id
FROM user_bans
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());

-- RLS Policies (enable RLS on new tables)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Admin-only read policy for system_config
CREATE POLICY "Admins can read system config" ON system_config
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin-only write policy for system_config
CREATE POLICY "Admins can update system config" ON system_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin-only read policy for audit logs
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin-only insert policy for audit logs
CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can create reports
CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON content_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON content_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can manage bans
CREATE POLICY "Admins can manage bans" ON user_bans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Grant service role full access (for API server)
-- Note: The service role bypasses RLS, so these are redundant but included for clarity
GRANT ALL ON system_config TO service_role;
GRANT ALL ON admin_audit_logs TO service_role;
GRANT ALL ON content_reports TO service_role;
GRANT ALL ON user_bans TO service_role;
