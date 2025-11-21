-- Migration: Add Missing Indexes
-- Description: Add indexes for better query performance and foreign key relationships
-- Date: 2025-01-20

-- =====================================================
-- Documents table indexes
-- =====================================================

-- Index on created_by for filtering documents by creator
CREATE INDEX IF NOT EXISTS idx_documents_created_by
ON documents(created_by);

COMMENT ON INDEX idx_documents_created_by IS 'Index for filtering documents by creator';

-- Composite index for common query pattern: organization + status
CREATE INDEX IF NOT EXISTS idx_documents_org_status_created
ON documents(organization_id, status, created_at DESC);

COMMENT ON INDEX idx_documents_org_status_created IS 'Composite index for common query pattern: org + status + created date';

-- =====================================================
-- Document versions table indexes
-- =====================================================

-- Index on created_by for audit trail queries
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by
ON document_versions(created_by);

COMMENT ON INDEX idx_document_versions_created_by IS 'Index for filtering document versions by creator';

-- Composite index for document version history
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_created
ON document_versions(document_id, created_at DESC);

COMMENT ON INDEX idx_document_versions_doc_created IS 'Index for document version history queries';

-- =====================================================
-- Organization invites table indexes
-- =====================================================

-- Index on invited_by for tracking who sent invites
CREATE INDEX IF NOT EXISTS idx_org_invites_invited_by
ON organization_invites(invited_by);

COMMENT ON INDEX idx_org_invites_invited_by IS 'Index for tracking who sent invites';

-- Index on token for fast lookup (already unique, but explicit index)
CREATE INDEX IF NOT EXISTS idx_org_invites_token
ON organization_invites(token)
WHERE status = 'pending';

COMMENT ON INDEX idx_org_invites_token IS 'Index for fast token lookup on pending invites';

-- Index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_org_invites_expires
ON organization_invites(expires_at)
WHERE status = 'pending';

COMMENT ON INDEX idx_org_invites_expires IS 'Index for finding expired invites';

-- =====================================================
-- Organization members table indexes
-- =====================================================

-- Composite index for user + role queries
CREATE INDEX IF NOT EXISTS idx_org_members_user_role
ON organization_members(user_id, role);

COMMENT ON INDEX idx_org_members_user_role IS 'Index for user + role queries';

-- Composite index for organization + role queries
CREATE INDEX IF NOT EXISTS idx_org_members_org_role
ON organization_members(organization_id, role);

COMMENT ON INDEX idx_org_members_org_role IS 'Index for organization + role queries';

-- =====================================================
-- Document chunks table indexes
-- =====================================================

-- Index on document_id for fast chunk retrieval
CREATE INDEX IF NOT EXISTS idx_document_chunks_document
ON document_chunks(document_id, chunk_index);

COMMENT ON INDEX idx_document_chunks_document IS 'Index for fast chunk retrieval by document';

-- Index on token_count for filtering by chunk size
CREATE INDEX IF NOT EXISTS idx_document_chunks_token_count
ON document_chunks(token_count);

COMMENT ON INDEX idx_document_chunks_token_count IS 'Index for filtering chunks by token count';

-- =====================================================
-- Document processing jobs table indexes
-- =====================================================

-- Index on status for finding pending/failed jobs
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status
ON document_processing_jobs(status, created_at);

COMMENT ON INDEX idx_processing_jobs_status IS 'Index for finding jobs by status';

-- Index on document_id for job lookup
CREATE INDEX IF NOT EXISTS idx_processing_jobs_document
ON document_processing_jobs(document_id, created_at DESC);

COMMENT ON INDEX idx_processing_jobs_document IS 'Index for finding jobs by document';

-- =====================================================
-- AI provider config table indexes
-- =====================================================

-- Index on is_active for filtering active providers
CREATE INDEX IF NOT EXISTS idx_ai_providers_active
ON ai_provider_config(organization_id, is_active)
WHERE is_active = true;

COMMENT ON INDEX idx_ai_providers_active IS 'Index for finding active AI providers';

-- =====================================================
-- AI themes table indexes
-- =====================================================

-- Index for finding themes by organization
CREATE INDEX IF NOT EXISTS idx_ai_themes_org
ON ai_themes(organization_id, created_at DESC);

COMMENT ON INDEX idx_ai_themes_org IS 'Index for finding themes by organization';

-- =====================================================
-- Document templates table indexes
-- =====================================================

-- Index on category for filtering templates
CREATE INDEX IF NOT EXISTS idx_templates_category
ON document_templates(category, is_system);

COMMENT ON INDEX idx_templates_category IS 'Index for filtering templates by category';

-- Index on organization for org-specific templates
CREATE INDEX IF NOT EXISTS idx_templates_org
ON document_templates(organization_id, created_at DESC)
WHERE organization_id IS NOT NULL;

COMMENT ON INDEX idx_templates_org IS 'Index for organization-specific templates';

-- Index on system templates
CREATE INDEX IF NOT EXISTS idx_templates_system
ON document_templates(is_system, created_at DESC)
WHERE is_system = true;

COMMENT ON INDEX idx_templates_system IS 'Index for system templates';

-- =====================================================
-- Analyze tables to update statistics
-- =====================================================

ANALYZE documents;
ANALYZE document_versions;
ANALYZE organization_invites;
ANALYZE organization_members;
ANALYZE document_chunks;
ANALYZE document_processing_jobs;
ANALYZE ai_provider_config;
ANALYZE ai_themes;
ANALYZE document_templates;
