-- Migration: Fix Organization Invites Constraint
-- Description: Allow resending invites after expiration by using partial unique index
-- Date: 2025-01-20

-- =====================================================
-- Problem: Current UNIQUE(organization_id, email, status) prevents
-- resending invites after expiration or rejection
--
-- Solution: Use partial unique index to only enforce uniqueness
-- for pending invites
-- =====================================================

-- Drop the old unique constraint
ALTER TABLE organization_invites
DROP CONSTRAINT IF EXISTS organization_invites_organization_id_email_status_key;

-- Alternative constraint name (if it exists)
ALTER TABLE organization_invites
DROP CONSTRAINT IF EXISTS unique_org_email_status;

-- Create partial unique index for pending invites only
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_invites
ON organization_invites(organization_id, email)
WHERE status = 'pending';

COMMENT ON INDEX idx_unique_pending_invites IS 'Ensure only one pending invite per email per organization';

-- =====================================================
-- Add check constraint to prevent duplicate pending invites
-- =====================================================

-- This ensures data integrity at the database level
ALTER TABLE organization_invites
ADD CONSTRAINT check_no_duplicate_pending_invites
CHECK (
  -- If status is pending, there should be no other pending invites
  status != 'pending'
  OR NOT EXISTS (
    SELECT 1 FROM organization_invites oi2
    WHERE oi2.organization_id = organization_invites.organization_id
    AND oi2.email = organization_invites.email
    AND oi2.status = 'pending'
    AND oi2.id != organization_invites.id
  )
);

-- Remove the constraint if it causes issues with existing data
-- (uncomment if needed during testing)
-- ALTER TABLE organization_invites DROP CONSTRAINT IF EXISTS check_no_duplicate_pending_invites;

-- =====================================================
-- Create function to auto-expire old pending invites
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When inserting a new pending invite, expire any old pending invites
  -- for the same email in the same organization
  IF NEW.status = 'pending' THEN
    UPDATE organization_invites
    SET status = 'expired'
    WHERE organization_id = NEW.organization_id
    AND email = NEW.email
    AND status = 'pending'
    AND id != NEW.id
    AND expires_at < NOW();
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION expire_old_invites() IS 'Automatically expire old pending invites when creating new ones';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_expire_old_invites ON organization_invites;

CREATE TRIGGER trigger_expire_old_invites
  BEFORE INSERT ON organization_invites
  FOR EACH ROW
  EXECUTE FUNCTION expire_old_invites();

-- =====================================================
-- Create scheduled job to clean up expired invites
-- (This would run via pg_cron or external scheduler)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE organization_invites
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_invites() IS 'Cleanup function to mark expired invites (run periodically)';

-- Grant execute to authenticated users (for manual cleanup)
GRANT EXECUTE ON FUNCTION cleanup_expired_invites() TO authenticated;
