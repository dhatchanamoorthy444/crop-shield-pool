-- 1. Secure SECURITY DEFINER functions by revoking PUBLIC execute and granting to specific roles
-- This addresses SUPA_authenticated_security_definer_function_executable

DO $$ 
DECLARE 
    func_record RECORD;
BEGIN 
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args 
        FROM pg_proc p 
        JOIN pg_namespace n ON n.oid = p.pronamespace 
        WHERE n.nspname = 'public' AND prosecdef = true
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated;', func_record.proname, func_record.args);
    END LOOP;
END $$;

-- Explicitly grant back to authenticated for API-exposed functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated;

-- Keep triggers restricted to service_role/system
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user_username() TO service_role;
GRANT EXECUTE ON FUNCTION public.bump_pool_balance() TO service_role;

-- 2. Address GraphQL discovery warnings (SUPA_pg_graphql_anon_table_exposed / SUPA_pg_graphql_authenticated_table_exposed)
-- Revoke all discovery from anon for internal tables
REVOKE SELECT ON TABLE public.user_roles FROM anon;
REVOKE SELECT ON TABLE public.kyc_documents FROM anon;
REVOKE SELECT ON TABLE public.audit_logs FROM anon;
REVOKE SELECT ON TABLE public.security_alerts FROM anon;
REVOKE SELECT ON TABLE public.pool_members FROM anon;

-- For authenticated users, linter warns if they can "see" objects they don't need to enumerate.
-- We keep SELECT but RLS handles the rows. To satisfy the "discovery" lint, we can comment or 
-- move them to a different schema, but in Supabase Start, we typically just ensure RLS is tight.
-- However, we can revoke SELECT from authenticated on very sensitive internal tables if they are only accessed via RPC.
REVOKE SELECT ON TABLE public.user_roles FROM authenticated;
GRANT SELECT ON TABLE public.user_roles TO service_role; -- service_role needs it for checks

-- If RLS on user_roles uses has_role (which reads user_roles), it might need care.
-- But has_role is SECURITY DEFINER, so it works even if the user can't SELECT the table.
