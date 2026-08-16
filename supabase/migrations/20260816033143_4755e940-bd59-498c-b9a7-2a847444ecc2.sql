-- Revoke select from anon for sensitive tables
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.posts FROM anon;
REVOKE SELECT ON TABLE public.kyc_documents FROM anon;
REVOKE SELECT ON TABLE public.audit_logs FROM anon;
REVOKE SELECT ON TABLE public.security_alerts FROM anon;
REVOKE SELECT ON TABLE public.pool_members FROM anon;
REVOKE SELECT ON TABLE public.user_roles FROM anon;

-- Re-grant to authenticated
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.posts TO authenticated;
GRANT SELECT ON TABLE public.kyc_documents TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT SELECT ON TABLE public.security_alerts TO authenticated;
GRANT SELECT ON TABLE public.pool_members TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
