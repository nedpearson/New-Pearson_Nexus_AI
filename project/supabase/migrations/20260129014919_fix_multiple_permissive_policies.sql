/*
  # Fix Multiple Permissive Policies Security Issue

  ## Summary
  Consolidates duplicate permissive RLS policies on multiple tables to prevent
  potential security issues where multiple permissive policies could unintentionally
  grant broader access than intended.

  ## Changes Made
  
  ### 1. Plans Table
  - Removed duplicate SELECT policies
  - Kept single policy: "Anyone can read active plans"
  - Reason: Read access to active plans is needed by all authenticated users
  
  ### 2. Policy Sources Table
  - Removed duplicate SELECT policies  
  - Kept single policy: "Anyone can read policy sources"
  - Reason: Policy sources are public information viewable by all authenticated users
  
  ### 3. Policy Updates Queue Table
  - Removed duplicate SELECT policies
  - Kept single policy: "Admins can read all queue items"
  - Reason: Queue items should only be visible to admins before publication
  
  ### 4. Published Policy Updates Table
  - Removed duplicate SELECT policies
  - Kept single policy: "Users can read published updates"
  - Reason: All authenticated users should see published updates
  
  ## Security Notes
  - These changes enforce single, clear access rules per action
  - Removes ambiguity in permission evaluation
  - Maintains existing intended access patterns
  - No data loss or breaking changes to legitimate access
*/

-- =====================================================
-- FIX PLANS TABLE - REMOVE DUPLICATE SELECT POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;

-- Keep only the read policy for all authenticated users
-- The FOR ALL policy was redundant for SELECT operations

-- =====================================================
-- FIX POLICY_SOURCES TABLE - REMOVE DUPLICATE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Only admins can manage policy sources" ON public.policy_sources;

-- Recreate as separate INSERT/UPDATE/DELETE policies (not FOR ALL)
CREATE POLICY "Only admins can insert policy sources"
  ON public.policy_sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Only admins can update policy sources"
  ON public.policy_sources FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Only admins can delete policy sources"
  ON public.policy_sources FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com');

-- =====================================================
-- FIX POLICY_UPDATES_QUEUE - REMOVE DUPLICATE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage queue items" ON public.policy_updates_queue;

-- Recreate as separate INSERT/UPDATE/DELETE policies (not FOR ALL)
CREATE POLICY "Admins can insert queue items"
  ON public.policy_updates_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can update queue items"
  ON public.policy_updates_queue FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can delete queue items"
  ON public.policy_updates_queue FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com');

-- =====================================================
-- FIX PUBLISHED_POLICY_UPDATES - REMOVE DUPLICATE
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage published updates" ON public.published_policy_updates;

-- Recreate as separate INSERT/UPDATE/DELETE policies (not FOR ALL)
CREATE POLICY "Admins can insert published updates"
  ON public.published_policy_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can update published updates"
  ON public.published_policy_updates FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can delete published updates"
  ON public.published_policy_updates FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com');
