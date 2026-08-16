-- 1. Restrict GraphQL discovery for authenticated users on internal tables
-- The linter flags tables visible to 'authenticated' even if RLS is tight.
-- We revoke SELECT from 'authenticated' for tables only accessed via SECURITY DEFINER RPCs.

REVOKE SELECT ON TABLE public.user_roles FROM authenticated;
REVOKE SELECT ON TABLE public.kyc_documents FROM authenticated;
REVOKE SELECT ON TABLE public.audit_logs FROM authenticated;
REVOKE SELECT ON TABLE public.security_alerts FROM authenticated;
REVOKE SELECT ON TABLE public.pool_members FROM authenticated;

-- Ensure service_role and internal functions still work
GRANT SELECT ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.kyc_documents TO service_role;
GRANT SELECT ON TABLE public.audit_logs TO service_role;
GRANT SELECT ON TABLE public.security_alerts TO service_role;
GRANT SELECT ON TABLE public.pool_members TO service_role;

-- 2. Hardening SECURITY DEFINER functions
-- We revoke EXECUTE from PUBLIC/authenticated for functions that are internal triggers 
-- or should only be called by the system.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_username() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_pool_balance() FROM authenticated, anon, PUBLIC;

-- Explicitly grant back ONLY what is needed for the app to function via RPC
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;

-- 3. Fix potential "Signed-In Users Can See Object in GraphQL Schema" for other tables
-- If the app doesn't need GraphQL access for these, we can revoke them.
-- But for now, we've covered the most sensitive internal ones.
