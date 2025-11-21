-- Migration: Add Missing Helper Functions
-- Description: Create helper functions referenced in RLS policies but never defined
-- Date: 2025-01-20

-- =====================================================
-- Function: is_superadmin
-- Description: Check if current user is a superadmin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_superadmin() IS 'Check if the current user has superadmin role';

-- =====================================================
-- Function: is_orgadmin
-- Description: Check if current user is an org admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_orgadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('orgadmin', 'owner', 'superadmin')
  );
END;
$$;

COMMENT ON FUNCTION public.is_orgadmin() IS 'Check if the current user has orgadmin, owner, or superadmin role';

-- =====================================================
-- Function: user_belongs_to_organization
-- Description: Check if user belongs to specific org
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  );
END;
$$;

COMMENT ON FUNCTION public.user_belongs_to_organization(UUID) IS 'Check if the current user belongs to a specific organization';

-- =====================================================
-- Function: get_user_organizations
-- Description: Get all organization IDs for current user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE(organization_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id
  FROM organization_members om
  WHERE om.user_id = auth.uid();
END;
$$;

COMMENT ON FUNCTION public.get_user_organizations() IS 'Get all organization IDs that the current user belongs to';

-- =====================================================
-- Function: get_user_role_in_organization
-- Description: Get user's role in a specific organization
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_role_in_organization(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM organization_members
  WHERE user_id = auth.uid()
  AND organization_id = org_id;

  RETURN user_role;
END;
$$;

COMMENT ON FUNCTION public.get_user_role_in_organization(UUID) IS 'Get the current user''s role in a specific organization';

-- =====================================================
-- Grant permissions to authenticated users
-- =====================================================
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_orgadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organizations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_in_organization(UUID) TO authenticated;
