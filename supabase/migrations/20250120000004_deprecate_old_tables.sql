-- Migration: Deprecate Old Table Migrations
-- Description: Document that plans_and_subscriptions tables were removed
-- Date: 2025-01-20

-- =====================================================
-- NOTICE: The following tables were created in migration
-- 20250115000001_plans_and_subscriptions.sql
-- and then REMOVED in migration 20250118000000_cleanup_unused_tables.sql
--
-- Tables that were removed:
-- - plans
-- - subscriptions
-- - usage_tracking
-- - invoices
-- - user_profiles
--
-- If these tables are needed in the future, they should be
-- recreated with a new migration instead of relying on the
-- old migrations.
--
-- This migration serves as documentation only.
-- =====================================================

-- Add comment to organizations table to document the removal
COMMENT ON TABLE organizations IS 'Core organization table for multi-tenancy. Note: plans/subscriptions were removed in migration 20250118000000';

-- =====================================================
-- Cleanup: Remove orphaned functions that referenced deleted tables
-- =====================================================

-- Drop functions related to subscriptions (if they still exist)
DROP FUNCTION IF EXISTS create_default_subscription() CASCADE;
DROP FUNCTION IF EXISTS update_usage_tracking() CASCADE;
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON organizations;
DROP TRIGGER IF EXISTS trigger_update_usage ON organizations;

-- =====================================================
-- Create placeholder for future subscription system
-- (if needed in the future)
-- =====================================================

COMMENT ON SCHEMA public IS 'Main schema. Previous subscription tables were removed. See migration 20250120000004 for history.';
