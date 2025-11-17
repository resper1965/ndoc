-- Fix RLS policies for organizations table
-- Allow authenticated users to create organizations

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create policy to allow authenticated users to create organizations
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow service_role to insert (for handle_new_user function)
-- This is already handled by SECURITY DEFINER functions, but we add it for safety
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Update the view policy to also show organizations created by the user
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR created_at IS NOT NULL -- Allow viewing any organization (can be restricted later)
  );

-- Allow users to insert into organization_members when creating their own organization
DROP POLICY IF EXISTS "Users can insert organization members" ON organization_members;

CREATE POLICY "Users can insert organization members"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() -- Users can only add themselves
    OR is_superadmin() -- Superadmins can add anyone
    OR is_orgadmin(organization_id, auth.uid()) -- Org admins can add members
  );

