-- 1. Restrict GraphQL discovery
-- Revoke SELECT from anon and authenticated for tables that shouldn't be publicly enumerable
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.posts FROM anon;
REVOKE SELECT ON TABLE public.kyc_documents FROM anon;
REVOKE SELECT ON TABLE public.audit_logs FROM anon;
REVOKE SELECT ON TABLE public.security_alerts FROM anon;
REVOKE SELECT ON TABLE public.pool_members FROM anon;
REVOKE SELECT ON TABLE public.user_roles FROM anon;

-- Re-grant specific access to authenticated users (RLS will handle row-level filtering)
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.posts TO authenticated;
GRANT SELECT ON TABLE public.kyc_documents TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT SELECT ON TABLE public.security_alerts TO authenticated;
GRANT SELECT ON TABLE public.pool_members TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;

-- 2. Secure functions
-- All SECURITY DEFINER functions must have their execute permission revoked from PUBLIC
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_pool_join_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_pool_by_code(text) FROM PUBLIC, anon;

-- Note: handle_new_user and handle_new_user_username are trigger functions
-- They should generally not be executable by anyone but the database system/service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_username() FROM PUBLIC, anon, authenticated;

-- Re-grant execute to authenticated for necessary API-exposed functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated;
