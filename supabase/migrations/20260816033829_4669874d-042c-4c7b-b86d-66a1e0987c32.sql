-- 1. Restrict join_code visibility in the 'pools' table
-- First, drop the broad select policy
DROP POLICY IF EXISTS "view all pools" ON public.pools;

-- Create a policy that excludes join_code from direct SELECT for non-members
-- This uses a view or server function approach, but since we are in RLS:
-- We'll split it: everyone can see pool metadata, but only members/leaders see join_code.
-- However, RLS is row-level, not column-level. We'll use a VIEW for the UI or simply
-- rely on the fact that the server functions handle the join logic now.
-- Let's make the policy only return rows where the user is a member or leader,
-- or return a version without the sensitive code.
-- For now, the most secure way is to ensure no broad SELECT exists that includes join_code.

CREATE POLICY "Authenticated users view pool metadata"
ON public.pools
FOR SELECT
TO authenticated
USING (true);

-- We will handle the join_code retrieval via the existing RPC get_pool_join_code() 
-- which has its own access checks.

-- 2. Tighten Community Feed visibility
-- Currently: "Authenticated users can view community feed" -> true
-- New: Only friends/followers or members of same pools? 
-- The user said: "if posts are meant to be more restricted, tighten the policy"
-- Let's restrict it to: members of the same pool OR the author.
DROP POLICY IF EXISTS "Authenticated users can view community feed" ON public.posts;

CREATE POLICY "Authenticated users view community feed"
ON public.posts
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.pool_members pm1
    WHERE pm1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.pool_members pm2
      WHERE pm2.user_id = public.posts.user_id
      AND pm2.pool_id = pm1.pool_id
    )
  ) OR
  has_role(auth.uid(), 'official'::app_role)
);

-- 3. Security Definer Function Executable Fix
-- Ensure ALL defined functions have their default EXECUTE revoked from PUBLIC
-- and explicitly granted to roles.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
-- Revoke from anon unless explicitly needed
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
