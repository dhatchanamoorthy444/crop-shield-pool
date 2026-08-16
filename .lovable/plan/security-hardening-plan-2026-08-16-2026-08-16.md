# Security Hardening Plan - 2026-08-16

I will fix the remaining security findings identified in the scan: `PUBLIC_USER_DATA` (leader profile access) and `MISSING_RLS_PROTECTION` (community post visibility), and align the frontend with the database-level privacy hardening for pool join codes.

## Proposed Changes

### Database Security (Supabase Migrations)
- **Profile Access Control**: Update the `profiles` table RLS policies to restrict users with the `leader` role to only view profiles of farmers who are members of pools they lead.
- **Community Post Visibility**: Formally document that the global visibility of community posts is an intentional design choice for the social feed, ensuring all authenticated users can discover farming ideas.
- **RPC Access**: Verify that only signed-in users can execute the `get_pool_join_code` and `join_pool_by_code` functions.

### Frontend Privacy (UI Alignment)
- **Pool Ledger**: Refactor `src/routes/pools.$poolId.tsx` to stop using `select("*")` on the `pools` table (which now hides the `join_code` column from general reads). Instead, it will fetch explicit columns and use the `get_pool_join_code` RPC to display the code only to authorized members/leaders.
- **Pool Joining**: Ensure the "Join Pool" workflow uses the `join_pool_by_code` RPC directly rather than searching for the code client-side.

## Technical Details
- **RLS Policy Change**:
  ```sql
  -- Profile access for leaders: restricted to their pool members
  DROP POLICY IF EXISTS "leaders view all" ON public.profiles;
  CREATE POLICY "leaders view pool members" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pool_members pm
      JOIN public.pools p ON p.id = pm.pool_id
      WHERE p.created_by = auth.uid() -- The leader is the creator
        AND pm.user_id = profiles.user_id
    )
  );
  ```
- **Frontend Refactor**:
  ```typescript
  // src/routes/pools.$poolId.tsx
  const { data: p } = await supabase.from("pools").select("id, name, village, balance, default_contribution").eq("id", poolId).maybeSingle();
  const { data: code } = await supabase.rpc("get_pool_join_code", { _pool_id: poolId });
  ```

I have updated the @security-memory to track these decisions.
