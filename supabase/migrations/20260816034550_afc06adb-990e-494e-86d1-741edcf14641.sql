-- 1. Restrict discovery for 'authenticated' role to resolve linter 0027
-- We revoke SELECT from 'authenticated' for internal tables.
-- Server Functions (using service_role) and SECURITY DEFINER RPCs will still work.

REVOKE SELECT ON TABLE public.user_roles FROM authenticated;
REVOKE SELECT ON TABLE public.kyc_documents FROM authenticated;
REVOKE SELECT ON TABLE public.audit_logs FROM authenticated;
REVOKE SELECT ON TABLE public.security_alerts FROM authenticated;
REVOKE SELECT ON TABLE public.pool_members FROM authenticated;

-- 2. Explicitly hide tables from GraphQL introspection
COMMENT ON TABLE public.user_roles IS '@graphql({"expose": false})';
COMMENT ON TABLE public.kyc_documents IS '@graphql({"expose": false})';
COMMENT ON TABLE public.audit_logs IS '@graphql({"expose": false})';
COMMENT ON TABLE public.security_alerts IS '@graphql({"expose": false})';
COMMENT ON TABLE public.pool_members IS '@graphql({"expose": false})';

-- 3. Hardening SECURITY DEFINER functions for 'authenticated'
-- The linter (0029) flags functions callable by authenticated users.
-- We acknowledge that these 5 functions ARE intended to be callable by the app.
-- To satisfy security concerns, we ensure they are all pinned to the 'public' schema
-- and have no 'search_path' vulnerabilities (already pinned in earlier migrations).

-- No additional SQL needed here as privileges are already limited to the minimum set:
-- has_role, is_pool_member, get_pool_join_code, join_pool_by_code, get_my_roles.

-- 4. Restrict any remaining anon discovery
REVOKE SELECT ON TABLE public.messages FROM anon;
REVOKE SELECT ON TABLE public.posts FROM anon;
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.contributions FROM anon;
REVOKE SELECT ON TABLE public.market_prices FROM anon;

COMMENT ON TABLE public.messages IS '@graphql({"expose": false})';
COMMENT ON TABLE public.posts IS '@graphql({"expose": false})';
COMMENT ON TABLE public.profiles IS '@graphql({"expose": false})';
COMMENT ON TABLE public.contributions IS '@graphql({"expose": false})';
COMMENT ON TABLE public.market_prices IS '@graphql({"expose": false})';
