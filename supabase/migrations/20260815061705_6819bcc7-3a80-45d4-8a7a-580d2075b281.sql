-- 1. Hide pool invite codes from general reads (column-level privileges)
REVOKE SELECT ON public.pools FROM authenticated;
GRANT SELECT (
  id, name, village, district, state, created_by, default_contribution,
  target_crops, season_start, season_end, payout_rules, balance,
  created_at, updated_at
) ON public.pools TO authenticated;

-- Members (and officials) read the code through a controlled function
CREATE OR REPLACE FUNCTION public.get_pool_join_code(_pool_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.join_code
  FROM public.pools p
  WHERE p.id = _pool_id
    AND (
      public.is_pool_member(p.id, auth.uid())
      OR p.created_by = auth.uid()
      OR public.has_role(auth.uid(), 'official')
    )
$$;

-- Joining by code no longer requires reading the code column
CREATE OR REPLACE FUNCTION public.join_pool_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pool_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _pool_id
  FROM public.pools
  WHERE join_code = upper(btrim(_code));

  IF _pool_id IS NULL THEN
    RAISE EXCEPTION 'Pool not found';
  END IF;

  INSERT INTO public.pool_members (pool_id, user_id)
  VALUES (_pool_id, _uid)
  ON CONFLICT DO NOTHING;

  RETURN _pool_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_pool_join_code(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_pool_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated, service_role;

-- 2. Controlled deletion path for KYC documents
CREATE POLICY "owners delete own kyc files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'official')
  )
);