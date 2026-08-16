-- Pool join codes must never be readable through direct table SELECT.
-- Column-level privileges: authenticated users may read pool metadata but not join_code.
REVOKE SELECT ON TABLE public.pools FROM authenticated;
GRANT SELECT (
  id, name, village, district, state, created_by, default_contribution,
  target_crops, season_start, season_end, payout_rules, balance,
  created_at, updated_at
) ON public.pools TO authenticated;

-- Writes stay unchanged (RLS still governs them).
GRANT INSERT, UPDATE ON public.pools TO authenticated;
GRANT ALL ON public.pools TO service_role;

-- anon must not discover pools at all.
REVOKE SELECT ON TABLE public.pools FROM anon;

-- Join codes remain reachable only through the hardened RPCs.
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated;

-- Keep pools out of the GraphQL schema surface.
COMMENT ON TABLE public.pools IS '@graphql({"expose": false})';