-- Fix RLS policies for AI tables to use RPC functions and avoid recursion

-- ============================================
-- RLS POLICIES: ai_themes
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view AI themes" ON ai_themes;
DROP POLICY IF EXISTS "Editors can manage AI themes" ON ai_themes;

-- Users can view themes from their organizations
CREATE POLICY "Users can view AI themes"
  ON ai_themes FOR SELECT
  USING (
    is_superadmin()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Editors, admins and owners can manage themes
CREATE POLICY "Editors can manage AI themes"
  ON ai_themes FOR ALL
  USING (
    is_superadmin()
    OR (
      organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
      )
    )
  )
  WITH CHECK (
    is_superadmin()
    OR (
      organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
      )
    )
  );

-- ============================================
-- RLS POLICIES: ai_provider_config
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view AI provider config" ON ai_provider_config;
DROP POLICY IF EXISTS "Admins can manage AI provider config" ON ai_provider_config;

-- Only admins and owners can view provider config
CREATE POLICY "Admins can view AI provider config"
  ON ai_provider_config FOR SELECT
  USING (
    is_superadmin()
    OR (
      organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

-- Only admins and owners can manage provider config
CREATE POLICY "Admins can manage AI provider config"
  ON ai_provider_config FOR ALL
  USING (
    is_superadmin()
    OR (
      organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  )
  WITH CHECK (
    is_superadmin()
    OR (
      organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

