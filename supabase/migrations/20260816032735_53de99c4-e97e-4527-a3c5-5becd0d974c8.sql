-- 1. Restrict leader access to profiles
DROP POLICY IF EXISTS "Leaders can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "view own profile" ON public.profiles;

CREATE POLICY "Users can manage own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Officials can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'official'));

CREATE POLICY "Leaders can view their pool members"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pool_members pm
    JOIN public.pools p ON p.id = pm.pool_id
    WHERE p.created_by = auth.uid()
      AND pm.user_id = profiles.user_id
  )
);

-- 2. Formalize Community Post visibility
DROP POLICY IF EXISTS "Users can view posts" ON public.posts;
CREATE POLICY "Authenticated users can view community feed"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- 3. Verify RPC execute permissions
REVOKE EXECUTE ON FUNCTION public.get_pool_join_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_pool_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pool_join_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pool_by_code(text) TO authenticated;