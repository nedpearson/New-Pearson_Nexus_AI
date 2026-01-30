/*
  # Fix RLS Performance and Remove Unused Indexes

  ## Summary
  This migration addresses critical performance issues in Row Level Security policies
  and removes unused indexes to improve write performance.

  ## 1. RLS Performance Optimization
  
  ### Problem
  Multiple policies re-evaluate auth functions (auth.jwt(), auth.uid()) for each row,
  causing significant performance degradation at scale.
  
  ### Solution
  Wrap all auth function calls in SELECT subqueries: `(select auth.jwt())` and 
  `(select auth.uid())`. This ensures the function is evaluated once per query
  instead of once per row.
  
  ### Affected Tables
  - `policy_sources` - 3 policies fixed
  - `policy_updates_queue` - 3 policies fixed
  - `published_policy_updates` - 3 policies fixed
  
  ## 2. Remove Unused Indexes
  
  ### Problem
  Multiple indexes exist but are not being used by queries, wasting storage and
  slowing down INSERT/UPDATE/DELETE operations.
  
  ### Solution
  Drop all unused indexes. Indexes can be recreated if query patterns change and
  performance monitoring indicates they would be beneficial.
  
  ### Indexes Removed
  - 46 unused indexes across multiple tables
  - Primarily covering foreign keys, status fields, and date columns
  - Will be monitored and recreated if performance analysis indicates benefit
  
  ## Security & Performance Notes
  - All RLS policies maintain identical access control logic
  - Performance improvement: O(n) to O(1) for auth function evaluation
  - Write performance improved by removing index overhead
  - No breaking changes to application functionality
  - No data loss
*/

-- =====================================================
-- 1. FIX RLS POLICIES - POLICY_SOURCES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Only admins can insert policy sources" ON public.policy_sources;
DROP POLICY IF EXISTS "Only admins can update policy sources" ON public.policy_sources;
DROP POLICY IF EXISTS "Only admins can delete policy sources" ON public.policy_sources;

CREATE POLICY "Only admins can insert policy sources"
  ON public.policy_sources FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Only admins can update policy sources"
  ON public.policy_sources FOR UPDATE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com')
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Only admins can delete policy sources"
  ON public.policy_sources FOR DELETE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

-- =====================================================
-- 2. FIX RLS POLICIES - POLICY_UPDATES_QUEUE TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert queue items" ON public.policy_updates_queue;
DROP POLICY IF EXISTS "Admins can update queue items" ON public.policy_updates_queue;
DROP POLICY IF EXISTS "Admins can delete queue items" ON public.policy_updates_queue;

CREATE POLICY "Admins can insert queue items"
  ON public.policy_updates_queue FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can update queue items"
  ON public.policy_updates_queue FOR UPDATE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com')
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can delete queue items"
  ON public.policy_updates_queue FOR DELETE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

-- =====================================================
-- 3. FIX RLS POLICIES - PUBLISHED_POLICY_UPDATES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert published updates" ON public.published_policy_updates;
DROP POLICY IF EXISTS "Admins can update published updates" ON public.published_policy_updates;
DROP POLICY IF EXISTS "Admins can delete published updates" ON public.published_policy_updates;

CREATE POLICY "Admins can insert published updates"
  ON public.published_policy_updates FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can update published updates"
  ON public.published_policy_updates FOR UPDATE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com')
  WITH CHECK ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can delete published updates"
  ON public.published_policy_updates FOR DELETE
  TO authenticated
  USING ((select auth.jwt())->>'email' = 'nedpearson@gmail.com');

-- =====================================================
-- 4. REMOVE UNUSED INDEXES
-- =====================================================

-- Documents table indexes
DROP INDEX IF EXISTS public.idx_documents_organization_id;
DROP INDEX IF EXISTS public.idx_documents_category;
DROP INDEX IF EXISTS public.idx_documents_status;
DROP INDEX IF EXISTS public.idx_documents_date;
DROP INDEX IF EXISTS public.idx_documents_file_path;

-- Document links indexes
DROP INDEX IF EXISTS public.idx_document_links_document_id;
DROP INDEX IF EXISTS public.idx_document_links_entity;

-- Audit log indexes
DROP INDEX IF EXISTS public.idx_audit_log_tenant_id;
DROP INDEX IF EXISTS public.idx_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_audit_log_actor_id;
DROP INDEX IF EXISTS public.idx_audit_log_resource_type;

-- Integration configs indexes
DROP INDEX IF EXISTS public.idx_integration_configs_tenant_id;

-- Role permissions indexes
DROP INDEX IF EXISTS public.idx_role_permissions_permission_id;

-- Rules indexes
DROP INDEX IF EXISTS public.idx_rules_tenant_id;

-- Bills table indexes
DROP INDEX IF EXISTS public.idx_bills_organization_id;
DROP INDEX IF EXISTS public.idx_bills_due_date;
DROP INDEX IF EXISTS public.idx_bills_status;

-- Transactions table indexes
DROP INDEX IF EXISTS public.idx_transactions_organization_id;
DROP INDEX IF EXISTS public.idx_transactions_date;
DROP INDEX IF EXISTS public.idx_transactions_type;

-- Tasks table indexes
DROP INDEX IF EXISTS public.idx_tasks_organization_id;
DROP INDEX IF EXISTS public.idx_tasks_status;
DROP INDEX IF EXISTS public.idx_tasks_priority;
DROP INDEX IF EXISTS public.idx_tasks_due_date;

-- Subscriptions table indexes
DROP INDEX IF EXISTS public.idx_subscriptions_plan_id;
DROP INDEX IF EXISTS public.idx_subscriptions_tenant_id;

-- Tenants table indexes
DROP INDEX IF EXISTS public.idx_tenants_plan_id;
DROP INDEX IF EXISTS public.idx_tenants_status;

-- User roles indexes
DROP INDEX IF EXISTS public.idx_user_roles_role_id;
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_tenant_id;

-- Calendar events indexes
DROP INDEX IF EXISTS public.idx_calendar_events_organization_id;
DROP INDEX IF EXISTS public.idx_calendar_events_date;
DROP INDEX IF EXISTS public.idx_calendar_events_event_type;

-- Feature flags indexes
DROP INDEX IF EXISTS public.idx_feature_flags_key;
DROP INDEX IF EXISTS public.idx_feature_flags_tenant_id;
DROP INDEX IF EXISTS public.idx_feature_flags_user_id;

-- Jobs indexes
DROP INDEX IF EXISTS public.idx_jobs_status;
DROP INDEX IF EXISTS public.idx_jobs_type;

-- Legal cases indexes
DROP INDEX IF EXISTS public.idx_legal_cases_organization_id;
DROP INDEX IF EXISTS public.idx_legal_cases_status;
DROP INDEX IF EXISTS public.idx_legal_cases_case_type;
DROP INDEX IF EXISTS public.idx_legal_cases_next_hearing_date;

-- User preferences indexes
DROP INDEX IF EXISTS public.idx_user_preferences_user_id;

-- User profiles indexes
DROP INDEX IF EXISTS public.idx_user_profiles_organization_id;
DROP INDEX IF EXISTS public.idx_user_profiles_email;

-- Policy tables indexes (keeping these as they're used for foreign key joins)
-- DROP INDEX IF EXISTS public.idx_policy_updates_queue_source_id;
-- DROP INDEX IF EXISTS public.idx_published_policy_updates_queue_id;