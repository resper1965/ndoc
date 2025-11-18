-- Fix RLS para permitir UPDATE e melhorar SELECT em organizations
-- Usuários devem poder atualizar suas próprias organizações

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;

-- Create policy to allow authenticated users to update their organizations
CREATE POLICY "Users can update their organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR is_superadmin() -- Superadmins can update any organization
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR is_superadmin() -- Superadmins can update any organization
  );

-- Melhorar política de SELECT para funcionar com joins
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    -- Usuário é membro da organização
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
    -- OU é superadmin
    OR is_superadmin()
  );

