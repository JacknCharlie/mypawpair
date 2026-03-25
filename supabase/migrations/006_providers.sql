-- ================================================================
-- myPawPair — Provider System
-- Providers offer their own services (grooming, training, vet, etc.)
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Add 'provider' to profiles.role
-- ----------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'caregiver', 'provider', 'admin'));

-- ----------------------------------------------------------------
-- 2. PROVIDERS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.providers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name     text        NOT NULL,
  description       text,
  category          text        NOT NULL CHECK (category IN ('grooming', 'training', 'vet', 'walking', 'boarding', 'other')),
  city              text        NOT NULL,
  zip_code          text,
  phone             text,
  website           text,
  email             text,
  is_verified       boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ----------------------------------------------------------------
-- 3. PROVIDER_SERVICES TABLE (items providers manage)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_services (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       uuid        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  description       text,
  price             numeric(10, 2),
  price_type        text        CHECK (price_type IN ('fixed', 'from', 'free', 'contact')),
  duration_minutes  integer     CHECK (duration_minutes > 0),
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. PROVIDER_INQUIRIES (dog owners contact providers)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_inquiries (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       uuid        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  owner_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dog_id            uuid        REFERENCES public.dogs(id) ON DELETE SET NULL,
  message           text        NOT NULL,
  status            text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'responded')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 5. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_category ON public.providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_city ON public.providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_is_verified ON public.providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON public.provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_inquiries_provider_id ON public.provider_inquiries(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_inquiries_owner_id ON public.provider_inquiries(owner_id);

-- ----------------------------------------------------------------
-- 6. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_inquiries ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own record
CREATE POLICY "Providers can manage own provider profile"
  ON public.providers FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Everyone can read verified providers (for directory)
CREATE POLICY "Anyone can read verified providers"
  ON public.providers FOR SELECT TO authenticated
  USING (is_verified = true OR auth.uid() = user_id);

-- Admins can manage all providers
CREATE POLICY "Admins can manage all providers"
  ON public.providers FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Provider services: provider manages own, public reads active
CREATE POLICY "Providers can manage own services"
  ON public.provider_services FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.providers pr WHERE pr.id = provider_id AND pr.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.providers pr WHERE pr.id = provider_id AND pr.user_id = auth.uid())
  );

CREATE POLICY "Anyone can read active services"
  ON public.provider_services FOR SELECT TO authenticated
  USING (is_active = true);

-- Inquiries: providers read own, owners insert for themselves
CREATE POLICY "Owners can create inquiries"
  ON public.provider_inquiries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Providers can read own inquiries"
  ON public.provider_inquiries FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.providers pr WHERE pr.id = provider_id AND pr.user_id = auth.uid())
  );

CREATE POLICY "Providers can update own inquiry status"
  ON public.provider_inquiries FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.providers pr WHERE pr.id = provider_id AND pr.user_id = auth.uid())
  );

-- Anon can read verified providers and their active services (for public directory)
CREATE POLICY "Anon can read verified providers"
  ON public.providers FOR SELECT TO anon
  USING (is_verified = true);

CREATE POLICY "Anon can read active services of verified providers"
  ON public.provider_services FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.providers pr
      WHERE pr.id = provider_id AND pr.is_verified = true
    )
  );
