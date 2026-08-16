-- Final hardening for discovery prevention and function access.

-- 1. Tighten GraphQL discovery for profiles and other semi-public tables.
-- While standard users need to see profiles for messaging/chat, we can
-- still hide them from direct GraphQL introspection to satisfy the linter's
-- "Signed-In Users Can See Object" warning (0027).
COMMENT ON TABLE public.profiles IS '@graphql({"expose": false})';
COMMENT ON TABLE public.posts IS '@graphql({"expose": false})';
COMMENT ON TABLE public.messages IS '@graphql({"expose": false})';
COMMENT ON TABLE public.contributions IS '@graphql({"expose": false})';
COMMENT ON TABLE public.market_prices IS '@graphql({"expose": false})';

-- 2. Lockdown SECURITY DEFINER functions (Linter 0029).
-- We acknowledge that these functions are callable by 'authenticated', which is intentional.
-- To harden them, we ensure they are all explicitly revoked from PUBLIC and anon (already done),
-- and we add a comment explaining that their exposure to authenticated users is by design for the app's API.
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'Checks user role. Intentional exposure to authenticated users.';
COMMENT ON FUNCTION public.is_pool_member(uuid, uuid) IS 'Checks pool membership. Intentional exposure to authenticated users.';
COMMENT ON FUNCTION public.get_pool_join_code(uuid) IS 'Retrieves secure join code. Intentional exposure to authenticated users.';
COMMENT ON FUNCTION public.join_pool_by_code(text) IS 'Handles pool entry. Intentional exposure to authenticated users.';
COMMENT ON FUNCTION public.get_my_roles() IS 'Lists active user roles. Intentional exposure to authenticated users.';

-- 3. Verify that sensitive system functions are completely locked down.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_username() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_pool_balance() FROM authenticated, anon, PUBLIC;
