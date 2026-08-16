# Security Hardening: Discovery Prevention & Function Lockdown

I will resolve the remaining security linter warnings by strictly limiting object visibility in the GraphQL schema and securing `SECURITY DEFINER` functions.

## Proposed Changes

### Database Security (Supabase Migrations)
- **GraphQL Discovery Prevention**: Revoke `SELECT` privileges from `authenticated` for sensitive internal tables (`user_roles`, `kyc_documents`, `audit_logs`, `security_alerts`, `pool_members`). These tables will only be accessible via secured server functions or RPCs, which prevents them from appearing in GraphQL introspection for standard users.
- **Function Hardening**: The linter flags `SECURITY DEFINER` functions callable by `authenticated`. I will verify that only the strictly necessary API functions (`has_role`, `is_pool_member`, `get_pool_join_code`, `join_pool_by_code`, `get_my_roles`) are executable by `authenticated`, while internal logic like `handle_new_user` remains completely restricted.

### Technical Details

- **Revocation Migration**:
  ```sql
  -- Restrict discovery for 'authenticated' role
  REVOKE SELECT ON TABLE public.user_roles FROM authenticated;
  REVOKE SELECT ON TABLE public.kyc_documents FROM authenticated;
  REVOKE SELECT ON TABLE public.audit_logs FROM authenticated;
  REVOKE SELECT ON TABLE public.security_alerts FROM authenticated;
  REVOKE SELECT ON TABLE public.pool_members FROM authenticated;
  
  -- Ensure these remain hidden from GraphQL
  COMMENT ON TABLE public.user_roles IS '@graphql({"expose": false})';
  COMMENT ON TABLE public.kyc_documents IS '@graphql({"expose": false})';
  -- ... (repeat for others)
  ```

- **Function Verification**:
  I have confirmed that the critical `SECURITY DEFINER` functions are already revoked from `anon`. I will now ensure that only the minimum set required for front-end logic is granted to `authenticated`.
