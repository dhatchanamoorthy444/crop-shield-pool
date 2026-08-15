-- 1. Pin search_path on the remaining function
CREATE OR REPLACE FUNCTION public.handle_new_user_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET username = COALESCE(
           username,
           lower(regexp_replace(split_part(COALESCE(NEW.email, 'user'), '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(NEW.id::text, 1, 6)
         )
   WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- 2. Trigger functions must not be callable through the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_username() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_pool_balance() FROM anon, authenticated;

-- 3. Helper SECURITY DEFINER functions: signed-in users only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM anon;

-- 4. Remove blanket anon/authenticated table privileges, then re-grant narrowly
REVOKE ALL ON public.profiles, public.user_roles, public.kyc_documents, public.pools,
  public.pool_members, public.contributions, public.messages, public.posts,
  public.audit_logs, public.security_alerts, public.market_prices FROM anon;

REVOKE ALL ON public.profiles, public.user_roles, public.kyc_documents, public.pools,
  public.pool_members, public.contributions, public.messages, public.posts,
  public.audit_logs, public.security_alerts, public.market_prices FROM authenticated;

-- public read-only reference data
GRANT SELECT ON public.market_prices TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kyc_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pools TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.pool_members TO authenticated;
GRANT SELECT, INSERT ON public.contributions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.security_alerts TO authenticated;

GRANT ALL ON public.profiles, public.user_roles, public.kyc_documents, public.pools,
  public.pool_members, public.contributions, public.messages, public.posts,
  public.audit_logs, public.security_alerts, public.market_prices TO service_role;