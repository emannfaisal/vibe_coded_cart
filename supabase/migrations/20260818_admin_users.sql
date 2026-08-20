-- Security Task #4A: Create Trusted Admin Authorization Model

-- 1. Create admin_users table in public schema
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create SECURITY DEFINER is_admin() helper function
-- SECURITY DEFINER executes with function owner privileges, bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- Grant execute privilege on is_admin() helper
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 4. RLS Policies on admin_users table
-- Only existing confirmed admins can SELECT from admin_users
CREATE POLICY "Admins can view admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only existing confirmed admins can INSERT new admin_users
CREATE POLICY "Admins can insert admin_users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only existing confirmed admins can UPDATE admin_users
CREATE POLICY "Admins can update admin_users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only existing confirmed admins can DELETE admin_users
CREATE POLICY "Admins can delete admin_users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 5. Seed current designated admin user UUID
INSERT INTO public.admin_users (user_id)
VALUES ('6b7dca95-a9a5-4f39-8c67-6b39f31232bd')
ON CONFLICT (user_id) DO NOTHING;
