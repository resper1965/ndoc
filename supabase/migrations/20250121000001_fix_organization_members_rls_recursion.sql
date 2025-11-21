-- Migration: Fix Infinite Recursion in organization_members RLS Policy
-- Description: Replace recursive RLS policy with SECURITY DEFINER function to avoid infinite recursion
-- Date: 2025-01-21

-- =====================================================
-- Problem: Infinite recursion in organization_members RLS
-- 
-- The current policy causes infinite recursion because:
-- 1. Policy checks: SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
-- 2. This SELECT triggers the RLS policy check again
-- 3. Which does another SELECT from organization_members
-- 4. Infinite loop!
--
-- Solution: Use SECURITY DEFINER function that bypasses RLS
-- =====================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_members;

-- Create helper function to check user role without RLS recursion
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.user_has_role_in_org(org_id UUID, required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- This function bypasses RLS (SECURITY DEFINER) so it won't cause recursion
  RETURN EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND organization_id = org_id
    AND role = ANY(required_roles)
  );
END;
$$;

COMMENT ON FUNCTION public.user_has_role_in_org(UUID, TEXT[]) IS 
  'Check if current user has one of the required roles in an organization (bypasses RLS to avoid recursion)';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_has_role_in_org(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role_in_org(UUID, TEXT[]) TO anon;

-- =====================================================
-- Fix: Users can view organization members
-- Use the helper function to avoid recursion
-- =====================================================

CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    -- Use helper function that bypasses RLS to avoid recursion
    user_belongs_to_organization(organization_id)
    OR
    -- Superadmins can view all members
    is_superadmin()
  );

COMMENT ON POLICY "Users can view organization members" ON organization_members IS 
  'Users can view members of organizations they belong to. Uses helper function to avoid RLS recursion.';

-- =====================================================
-- Fix: Users can insert organization members
-- Allow users to add themselves when creating an org
-- =====================================================

CREATE POLICY "Users can insert organization members"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can add themselves (when creating their own org)
    user_id = auth.uid()
    OR
    -- Superadmins can add anyone
    is_superadmin()
    OR
    -- Org admins/owners can add members (use helper function to avoid recursion)
    user_has_role_in_org(organization_id, ARRAY['admin', 'owner', 'superadmin']::TEXT[])
  );

COMMENT ON POLICY "Users can insert organization members" ON organization_members IS 
  'Users can add themselves or be added by org admins. Uses helper function to avoid RLS recursion.';

-- =====================================================
-- Fix: Admins can update organization members
-- Only admins/owners can update member roles
-- =====================================================

CREATE POLICY "Admins can update organization members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    -- User must be admin/owner of the organization (use helper function to avoid recursion)
    user_has_role_in_org(organization_id, ARRAY['admin', 'owner', 'superadmin']::TEXT[])
    OR
    -- Superadmins can update any member
    is_superadmin()
  )
  WITH CHECK (
    -- Same check for WITH CHECK clause
    user_has_role_in_org(organization_id, ARRAY['admin', 'owner', 'superadmin']::TEXT[])
    OR
    is_superadmin()
  );

COMMENT ON POLICY "Admins can update organization members" ON organization_members IS 
  'Only admins/owners can update member roles. Uses helper function to avoid RLS recursion.';

-- =====================================================
-- Fix: Admins can delete organization members
-- Only admins/owners can remove members
-- =====================================================

CREATE POLICY "Admins can delete organization members"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    -- User must be admin/owner of the organization (use helper function to avoid recursion)
    user_has_role_in_org(organization_id, ARRAY['admin', 'owner', 'superadmin']::TEXT[])
    OR
    -- Superadmins can delete any member
    is_superadmin()
    OR
    -- Users can remove themselves
    user_id = auth.uid()
  );

COMMENT ON POLICY "Admins can delete organization members" ON organization_members IS 
  'Admins/owners can remove members, users can remove themselves. Uses helper function to avoid RLS recursion.';

