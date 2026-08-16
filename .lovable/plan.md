# Security Hardening & Vulnerability Remediation

I will address the remaining security findings including restricted data enumeration, secure function execution, and reinforced identity verification in server functions.

## Proposed Changes

### Database Security (Supabase Migrations)
- **KYC Privacy**: Restrict KYC document access so users can only see their own files. Revoke general selection privileges on the `kyc_documents` table to prevent enumeration.
- **Audit & Alert Privacy**: Tighten RLS on `audit_logs` and `security_alerts` to ensure users can only see their own security history.
- **RPC Hardening**: Ensure all custom RPCs (`has_role`, `is_pool_member`, etc.) are explicitly restricted to `authenticated` or `service_role` and verify their `search_path` is pinned to `public` to prevent search path hijacking.
- **Discovery Prevention**: Extend privilege revocation to the `graphql` interface for sensitive tables to prevent schema introspection by unauthenticated users.

### Server Function Hardening
- **KYC Processing**: Refactor `processKycDocument` to use the authenticated user's client for the final document update, ensuring RLS is respected throughout the flow, rather than relying on `supabaseAdmin`.
- **Identity Enforcement**: Standardize the extra `supabase.auth.getUser()` check across all sensitive server functions to ensure session integrity and prevent potential middleware bypasses.

### Technical Details

- **KYC Migration**:
  ```sql
  ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.kyc_documents FROM authenticated, anon;
  GRANT SELECT, INSERT ON public.kyc_documents TO authenticated;
  GRANT ALL ON public.kyc_documents TO service_role;
  
  CREATE POLICY "Users can only see their own KYC"
  ON public.kyc_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
  ```

- **Function Verification**:
  Ensure `src/lib/kyc.functions.ts` and others explicitly verify `userId` matches the session user from `supabase.auth.getUser()` to satisfy linter requirements for "Service Role Bypass" prevention.
