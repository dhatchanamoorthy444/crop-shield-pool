
-- =====================
-- ENUMS
-- =====================
CREATE TYPE public.app_role AS ENUM ('farmer', 'leader', 'official');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.id_doc_type AS ENUM ('aadhaar', 'voter_id', 'pan', 'driving_license');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive');
CREATE TYPE public.app_language AS ENUM ('en', 'hi', 'ta', 'kn');

-- =====================
-- updated_at trigger
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================
-- PROFILES
-- =====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  language public.app_language NOT NULL DEFAULT 'en',
  primary_crops TEXT[] DEFAULT '{}',
  kyc_status public.kyc_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- USER ROLES (separate — prevents privilege escalation)
-- =====================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS SETOF public.app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;

-- =====================
-- KYC DOCUMENTS
-- =====================
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type public.id_doc_type NOT NULL,
  storage_path TEXT NOT NULL,
  masked_id_number TEXT,
  extracted_name TEXT,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_kyc_user ON public.kyc_documents(user_id);
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- POOLS
-- =====================
CREATE TABLE public.pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT,
  state TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  default_contribution NUMERIC(12,2) NOT NULL DEFAULT 100,
  target_crops TEXT[] DEFAULT '{}',
  season_start DATE,
  season_end DATE,
  payout_rules JSONB NOT NULL DEFAULT '{"yield_loss_threshold":30,"disease_severity":"high","rainfall_anomaly":40}'::jsonb,
  join_code TEXT NOT NULL UNIQUE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_pools_updated BEFORE UPDATE ON public.pools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- POOL MEMBERS
-- =====================
CREATE TABLE public.pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.member_status NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pool_id, user_id)
);
ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pm_user ON public.pool_members(user_id);
CREATE INDEX idx_pm_pool ON public.pool_members(pool_id);

CREATE OR REPLACE FUNCTION public.is_pool_member(_pool_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.pool_members WHERE pool_id = _pool_id AND user_id = _user_id)
$$;

-- =====================
-- CONTRIBUTIONS
-- =====================
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL DEFAULT 'simulated',
  note TEXT,
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contrib_pool ON public.contributions(pool_id);
CREATE INDEX idx_contrib_user ON public.contributions(user_id);

-- Update pool balance on contribution insert
CREATE OR REPLACE FUNCTION public.bump_pool_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.pools SET balance = balance + NEW.amount WHERE id = NEW.pool_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_contrib_bump AFTER INSERT ON public.contributions FOR EACH ROW EXECUTE FUNCTION public.bump_pool_balance();

-- =====================
-- MARKET PRICES
-- =====================
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'IN',
  price_per_quintal NUMERIC(10,2) NOT NULL,
  recorded_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (crop, region, recorded_on)
);
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prices_crop ON public.market_prices(crop, recorded_on DESC);

-- =====================
-- HANDLE NEW USER → profile + farmer role
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'language')::public.app_language, 'en')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'farmer'));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- RLS POLICIES
-- =====================

-- profiles: own + pool-mates can view; only self updates
CREATE POLICY "view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'official') OR public.has_role(auth.uid(), 'leader'));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- user_roles: read own; only officials manage
CREATE POLICY "view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'official'));
CREATE POLICY "officials manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'official'))
  WITH CHECK (public.has_role(auth.uid(), 'official'));

-- kyc_documents: owner + officials
CREATE POLICY "view own kyc" ON public.kyc_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'official'));
CREATE POLICY "insert own kyc" ON public.kyc_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "officials review kyc" ON public.kyc_documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

-- pools: any signed-in can view (to join); leaders/officials create
CREATE POLICY "view all pools" ON public.pools FOR SELECT TO authenticated USING (true);
CREATE POLICY "leaders create pools" ON public.pools FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND (public.has_role(auth.uid(), 'leader') OR public.has_role(auth.uid(), 'official')));
CREATE POLICY "creator updates pool" ON public.pools FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'official'));

-- pool_members: members see member list; user joins themself
CREATE POLICY "view pool members" ON public.pool_members FOR SELECT TO authenticated
  USING (public.is_pool_member(pool_id, auth.uid()) OR public.has_role(auth.uid(), 'official'));
CREATE POLICY "join self" ON public.pool_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leave self" ON public.pool_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- contributions: pool members can view; user inserts own
CREATE POLICY "members view contribs" ON public.contributions FOR SELECT TO authenticated
  USING (public.is_pool_member(pool_id, auth.uid()) OR public.has_role(auth.uid(), 'official'));
CREATE POLICY "insert own contrib" ON public.contributions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_pool_member(pool_id, auth.uid()));

-- market_prices: public read
CREATE POLICY "anyone reads prices" ON public.market_prices FOR SELECT TO anon, authenticated USING (true);

-- =====================
-- STORAGE: private kyc bucket
-- =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own kyc" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users read own kyc" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'official')));
CREATE POLICY "users update own kyc" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================
-- SEED MARKET PRICES (last 30 days, 4 crops)
-- =====================
DO $$
DECLARE crops TEXT[] := ARRAY['Paddy','Wheat','Tomato','Cotton'];
        base NUMERIC[] := ARRAY[2100, 2300, 1800, 6500];
        i INT; d INT; price NUMERIC;
BEGIN
  FOR i IN 1..array_length(crops,1) LOOP
    FOR d IN 0..29 LOOP
      price := base[i] * (1 + (random()-0.5)*0.18);
      INSERT INTO public.market_prices (crop, region, price_per_quintal, recorded_on)
      VALUES (crops[i], 'IN', ROUND(price::numeric, 2), CURRENT_DATE - d)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
