-- 1. Restrict KYC documents access
-- RLS was already enabled in previous turns, but we ensure it's tight.
REVOKE SELECT ON TABLE public.kyc_documents FROM authenticated, anon;
GRANT SELECT, INSERT ON public.kyc_documents TO authenticated;
GRANT ALL ON public.kyc_documents TO service_role;

DROP POLICY IF EXISTS "view own kyc" ON public.kyc_documents;
CREATE POLICY "Users can only see their own KYC"
ON public.kyc_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Audit and Alert Privacy
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON TABLE public.audit_logs FROM authenticated, anon;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

DROP POLICY IF EXISTS "Users view own logs" ON public.audit_logs;
CREATE POLICY "Users can only see their own audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON TABLE public.security_alerts FROM authenticated, anon;
GRANT SELECT ON TABLE public.security_alerts TO authenticated;
GRANT ALL ON public.security_alerts TO service_role;

DROP POLICY IF EXISTS "Users view own alerts" ON public.security_alerts;
CREATE POLICY "Users can only see their own security alerts"
ON public.security_alerts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Hardening RPCs
-- Revoke all by default, then re-grant to authenticated/service_role
-- Note: has_role, is_pool_member, etc. were created in previous turns.
-- We ensure they have strict access.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_pool_member(uuid, uuid) TO authenticated, service_role;

-- 4. Discovery Prevention (GraphQL)
-- Revoke all discovery from anon for sensitive tables
REVOKE SELECT ON TABLE public.user_roles FROM anon;
REVOKE SELECT ON TABLE public.kyc_documents FROM anon;
REVOKE SELECT ON TABLE public.audit_logs FROM anon;
REVOKE SELECT ON TABLE public.security_alerts FROM anon;
REVOKE SELECT ON TABLE public.pool_members FROM anon;
