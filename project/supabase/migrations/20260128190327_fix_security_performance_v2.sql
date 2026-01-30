/*
  # Fix Security and Performance Issues V2

  ## 1. Add Missing Foreign Key Indexes
    - Add index on `policy_updates_queue.source_id`
    - Add index on `published_policy_updates.queue_id`
    
  ## 2. Optimize RLS Policies (Auth Initialization)
    - Update all policies to use `(select auth.uid())` instead of `auth.uid()` for better performance
    - Properly handle type casting between text and uuid organization_id columns
      
  ## 3. Consolidate Duplicate Permissive Policies
    - Remove duplicate SELECT policies where multiple permissive policies exist
    
  ## Security Notes
    - All changes maintain existing access control
    - Performance improvements through proper auth function calls and indexing
    - No data loss or breaking changes
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_policy_updates_queue_source_id 
ON public.policy_updates_queue(source_id);

CREATE INDEX IF NOT EXISTS idx_published_policy_updates_queue_id 
ON public.published_policy_updates(queue_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - DOCUMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view documents in their organization" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents in their organization" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents in their organization" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents in their organization" ON public.documents;

CREATE POLICY "Users can view documents in their organization"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert documents in their organization"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update documents in their organization"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete documents in their organization"
  ON public.documents FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - USER_PREFERENCES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - DOCUMENT_LINKS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view document links for their organization's document" ON public.document_links;
DROP POLICY IF EXISTS "Users can insert document links for their organization's docume" ON public.document_links;
DROP POLICY IF EXISTS "Users can delete document links for their organization's docume" ON public.document_links;

CREATE POLICY "Users can view document links for their organization's document"
  ON public.document_links FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT d.id FROM public.documents d
      INNER JOIN public.user_profiles up ON d.organization_id::uuid = up.organization_id
      WHERE up.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert document links for their organization's docume"
  ON public.document_links FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT d.id FROM public.documents d
      INNER JOIN public.user_profiles up ON d.organization_id::uuid = up.organization_id
      WHERE up.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete document links for their organization's docume"
  ON public.document_links FOR DELETE
  TO authenticated
  USING (
    document_id IN (
      SELECT d.id FROM public.documents d
      INNER JOIN public.user_profiles up ON d.organization_id::uuid = up.organization_id
      WHERE up.id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - BILLS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view bills in their organization" ON public.bills;
DROP POLICY IF EXISTS "Users can insert bills in their organization" ON public.bills;
DROP POLICY IF EXISTS "Users can update bills in their organization" ON public.bills;
DROP POLICY IF EXISTS "Users can delete bills in their organization" ON public.bills;

CREATE POLICY "Users can view bills in their organization"
  ON public.bills FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert bills in their organization"
  ON public.bills FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update bills in their organization"
  ON public.bills FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete bills in their organization"
  ON public.bills FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view transactions in their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert transactions in their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions in their organization" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their organization" ON public.transactions;

CREATE POLICY "Users can view transactions in their organization"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert transactions in their organization"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update transactions in their organization"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete transactions in their organization"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - TASKS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view tasks in their organization" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their organization" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their organization" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their organization" ON public.tasks;

CREATE POLICY "Users can view tasks in their organization"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert tasks in their organization"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update tasks in their organization"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete tasks in their organization"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - CALENDAR_EVENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete events in their organization" ON public.calendar_events;

CREATE POLICY "Users can view events in their organization"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert events in their organization"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update events in their organization"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete events in their organization"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - LEGAL_CASES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view legal cases in their organization" ON public.legal_cases;
DROP POLICY IF EXISTS "Users can insert legal cases in their organization" ON public.legal_cases;
DROP POLICY IF EXISTS "Users can update legal cases in their organization" ON public.legal_cases;
DROP POLICY IF EXISTS "Users can delete legal cases in their organization" ON public.legal_cases;

CREATE POLICY "Users can view legal cases in their organization"
  ON public.legal_cases FOR SELECT
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert legal cases in their organization"
  ON public.legal_cases FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update legal cases in their organization"
  ON public.legal_cases FOR UPDATE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete legal cases in their organization"
  ON public.legal_cases FOR DELETE
  TO authenticated
  USING (
    organization_id::uuid IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - DASHBOARD_LAYOUTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own dashboard layout" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Users can insert own dashboard layout" ON public.dashboard_layouts;
DROP POLICY IF EXISTS "Users can update own dashboard layout" ON public.dashboard_layouts;

CREATE POLICY "Users can view own dashboard layout"
  ON public.dashboard_layouts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own dashboard layout"
  ON public.dashboard_layouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own dashboard layout"
  ON public.dashboard_layouts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - ORGANIZATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read their organization" ON public.organizations;

CREATE POLICY "Users can read their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = (select auth.uid())
    )
  );

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES - USER_PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES - POLICY TABLES
-- =====================================================

DROP POLICY IF EXISTS "Only admins can manage policy sources" ON public.policy_sources;
DROP POLICY IF EXISTS "Admins can read all queue items" ON public.policy_updates_queue;
DROP POLICY IF EXISTS "Admins can manage queue items" ON public.policy_updates_queue;
DROP POLICY IF EXISTS "Admins can manage published updates" ON public.published_policy_updates;

CREATE POLICY "Only admins can manage policy sources"
  ON public.policy_sources
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can read all queue items"
  ON public.policy_updates_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can manage queue items"
  ON public.policy_updates_queue
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Admins can manage published updates"
  ON public.published_policy_updates
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'owner')
    )
  );

-- =====================================================
-- 14. CONSOLIDATE DUPLICATE PERMISSIVE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can read feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Admins can read integration configs" ON public.integration_configs;
DROP POLICY IF EXISTS "Admins can read jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can read all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can read role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can read rules" ON public.rules;
DROP POLICY IF EXISTS "Admins can read subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can read all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can read user roles" ON public.user_roles;