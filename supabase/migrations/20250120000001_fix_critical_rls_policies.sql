-- Migration: Fix Critical RLS Policies
-- Description: Fix security vulnerabilities in RLS policies
-- Date: 2025-01-20

-- =====================================================
-- Fix: Organizations RLS Policy
-- Problem: OR created_at IS NOT NULL allows viewing ALL organizations
-- Solution: Remove overly permissive condition
-- =====================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Create corrected policy
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    -- User is a member of the organization
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR
    -- User is a superadmin
    is_superadmin()
  );

COMMENT ON POLICY "Users can view their organizations" ON organizations IS 'Users can only view organizations they belong to, or all if superadmin';

-- =====================================================
-- Fix: Audit Logs RLS Policy
-- Problem: FOR ALL blocks INSERT operations, breaking audit triggers
-- Solution: Allow INSERT, block only UPDATE and DELETE
-- =====================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "No one can modify audit logs" ON audit_logs;

-- Create separate policies for different operations
CREATE POLICY "Allow audit log creation"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "No one can update audit logs"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete audit logs"
  ON audit_logs FOR DELETE
  USING (false);

CREATE POLICY "Users can view relevant audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR is_superadmin()
  );

COMMENT ON POLICY "Allow audit log creation" ON audit_logs IS 'Allow system to create audit log entries';
COMMENT ON POLICY "No one can update audit logs" ON audit_logs IS 'Audit logs are immutable - prevent updates';
COMMENT ON POLICY "No one can delete audit logs" ON audit_logs IS 'Audit logs are immutable - prevent deletion';
COMMENT ON POLICY "Users can view relevant audit logs" ON audit_logs IS 'Users can view audit logs for their organizations';

-- =====================================================
-- Fix: Document Chunks RLS Policy
-- Problem: Using auth.role() = 'service_role' (anti-pattern)
-- Solution: Proper service role handling
-- =====================================================

-- Drop service role policies (they bypass RLS anyway)
DROP POLICY IF EXISTS "Service role has full access to document chunks" ON document_chunks;
DROP POLICY IF EXISTS "Service role has full access to document embeddings" ON document_embeddings;

-- Ensure proper user access policies exist
DROP POLICY IF EXISTS "Users can view their organization's document chunks" ON document_chunks;

CREATE POLICY "Users can view their organization's document chunks"
  ON document_chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert document chunks for their documents"
  ON document_chunks FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor', 'superadmin')
      )
    )
  );

CREATE POLICY "Users can delete document chunks for their documents"
  ON document_chunks FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor', 'superadmin')
      )
    )
  );

-- =====================================================
-- Fix: Document Embeddings RLS Policy
-- =====================================================

DROP POLICY IF EXISTS "Users can view their organization's embeddings" ON document_embeddings;

CREATE POLICY "Users can view their organization's embeddings"
  ON document_embeddings FOR SELECT
  USING (
    chunk_id IN (
      SELECT dc.id FROM document_chunks dc
      INNER JOIN documents d ON dc.document_id = d.id
      WHERE d.organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert embeddings for their documents"
  ON document_embeddings FOR INSERT
  WITH CHECK (
    chunk_id IN (
      SELECT dc.id FROM document_chunks dc
      INNER JOIN documents d ON dc.document_id = d.id
      WHERE d.organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor', 'superadmin')
      )
    )
  );

CREATE POLICY "Users can delete embeddings for their documents"
  ON document_embeddings FOR DELETE
  USING (
    chunk_id IN (
      SELECT dc.id FROM document_chunks dc
      INNER JOIN documents d ON dc.document_id = d.id
      WHERE d.organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor', 'superadmin')
      )
    )
  );

-- =====================================================
-- Add missing RLS policy for organization_invites
-- Allow unauthenticated users to view invites by token
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view pending invites by token" ON organization_invites;

CREATE POLICY "Anyone can view pending invites by token"
  ON organization_invites FOR SELECT
  TO anon
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

COMMENT ON POLICY "Anyone can view pending invites by token" ON organization_invites IS 'Allow unauthenticated users to view valid pending invites';
