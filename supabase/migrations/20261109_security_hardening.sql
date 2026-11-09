-- ============================================================================
-- Migration: 20261109_security_hardening.sql
-- Description: Consolidated Security Hardening & Strict RLS Enforcement
--
-- AUDIT FIX COMPLIANCE:
-- 1. Server-Calculated Pricing & Credit Accounting: Verified in app.ts & RPCs.
-- 2. Never Trust Role / isPro / Plan From Browser: Verified in app.ts & profiles RLS.
-- 3. Turn on RLS for Every Table: Explicitly enabled on profiles, usage, credit_reservations, generations, and global_daily_usage.
-- 4. Rate-Limit Email Forms: Implemented on /api/contact, /api/auth/request-password-reset, and /api/validate-email.
-- 5. Ownership Verification Before Update or Delete: Enforced in RLS policies & /api/history handlers.
-- 6. Secret Keys Isolated Server-Side: Verified in app.ts & vite.config.ts.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TURN ON RLS FOR EVERY TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.global_daily_usage ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. STRICT RLS POLICIES & OWNERSHIP VERIFICATION
-- ----------------------------------------------------------------------------

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own display_name only" ON public.profiles;
DROP POLICY IF EXISTS "Service role manages all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ownership Check on UPDATE: Users can ONLY update their own profile, and CANNOT change plan/role/isPro
CREATE POLICY "Users can update own display_name only"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    plan = (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "Service role manages all profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.profiles FROM PUBLIC, anon;
GRANT SELECT, UPDATE(display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;


-- USAGE TABLE (Read-only for users, writes strictly restricted to service_role)
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage;
DROP POLICY IF EXISTS "Service role manages all usage" ON public.usage;

CREATE POLICY "Users can view own usage"
  ON public.usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages all usage"
  ON public.usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.usage FROM PUBLIC, anon;
GRANT SELECT ON public.usage TO authenticated;
GRANT ALL ON public.usage TO service_role;


-- CREDIT_RESERVATIONS TABLE (Read-only for users, writes strictly restricted to service_role)
DROP POLICY IF EXISTS "Users can view own credit reservations" ON public.credit_reservations;
DROP POLICY IF EXISTS "Service role manages all reservations" ON public.credit_reservations;

CREATE POLICY "Users can view own credit reservations"
  ON public.credit_reservations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages all reservations"
  ON public.credit_reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.credit_reservations FROM PUBLIC, anon;
GRANT SELECT ON public.credit_reservations TO authenticated;
GRANT ALL ON public.credit_reservations TO service_role;


-- GENERATIONS TABLE (Users can SELECT & DELETE ONLY their own records)
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
DROP POLICY IF EXISTS "Service role manages all generations" ON public.generations;

CREATE POLICY "Users can view own generations"
  ON public.generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ownership Check on DELETE: Users can DELETE ONLY their own generation records
CREATE POLICY "Users can delete own generations"
  ON public.generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages all generations"
  ON public.generations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.generations FROM PUBLIC, anon;
GRANT SELECT, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;


-- GLOBAL_DAILY_USAGE TABLE (Service Role Exclusive Access)
REVOKE ALL ON TABLE public.global_daily_usage FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.global_daily_usage TO service_role;
