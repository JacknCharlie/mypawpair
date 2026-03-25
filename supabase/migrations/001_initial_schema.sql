-- ================================================================
-- myPawPair — Initial Schema Migration
-- Dog-care matchmaking platform (Supabase / PostgreSQL)
-- ================================================================

-- ----------------------------------------------------------------
-- 1. PROFILES TABLE
--    One row per auth.users entry (owner | caregiver | admin)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        text        NOT NULL DEFAULT 'owner'
                          CHECK (role IN ('owner', 'caregiver', 'admin')),
  city        text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. DOGS TABLE
--    Each dog belongs to one owner profile
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dogs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  breed          text,
  size           text        CHECK (size IN ('small', 'medium', 'large')),
  age            integer     CHECK (age >= 0),
  energy_level   integer     CHECK (energy_level BETWEEN 1 AND 5),
  temperament    text[],
  special_needs  boolean     NOT NULL DEFAULT false,
  special_notes  text,
  city           text,
  zip_code       text,
  care_type      text[],
  availability   text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. CAREGIVERS TABLE
--    Extended profile for users with role = 'caregiver'
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.caregivers (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio                   text,
  experience_years      integer     CHECK (experience_years >= 0),
  accepts_sizes         text[],
  accepts_temperaments  text[],
  services              text[],
  certifications        text,
  city                  text,
  zip_code              text,
  availability          text,
  is_approved           boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. MATCHES TABLE
--    Compatibility scoring between a dog and a caregiver.
--    Each score is 0–5 (max total = 25).
--    total_score and compatibility_tier are auto-computed.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id               uuid NOT NULL REFERENCES public.dogs(id)       ON DELETE CASCADE,
  caregiver_id         uuid NOT NULL REFERENCES public.caregivers(id)  ON DELETE CASCADE,

  -- Individual scoring dimensions (0–5 each)
  location_score       integer CHECK (location_score    BETWEEN 0 AND 5),
  size_score           integer CHECK (size_score        BETWEEN 0 AND 5),
  temperament_score    integer CHECK (temperament_score BETWEEN 0 AND 5),
  availability_score   integer CHECK (availability_score BETWEEN 0 AND 5),
  experience_score     integer CHECK (experience_score  BETWEEN 0 AND 5),

  -- Auto-computed: sum of all five scores (max 25)
  total_score integer GENERATED ALWAYS AS (
    COALESCE(location_score,    0) +
    COALESCE(size_score,        0) +
    COALESCE(temperament_score, 0) +
    COALESCE(availability_score,0) +
    COALESCE(experience_score,  0)
  ) STORED,

  -- Auto-computed tier based on total_score
  -- high ≥ 20  |  medium ≥ 12  |  low < 12
  compatibility_tier text GENERATED ALWAYS AS (
    CASE
      WHEN (COALESCE(location_score, 0) + COALESCE(size_score, 0) +
            COALESCE(temperament_score, 0) + COALESCE(availability_score, 0) +
            COALESCE(experience_score, 0)) >= 20 THEN 'high'
      WHEN (COALESCE(location_score, 0) + COALESCE(size_score, 0) +
            COALESCE(temperament_score, 0) + COALESCE(availability_score, 0) +
            COALESCE(experience_score, 0)) >= 12 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,

  match_status text NOT NULL DEFAULT 'suggested'
               CHECK (match_status IN ('suggested', 'contacted', 'accepted', 'rejected')),

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (dog_id, caregiver_id)
);

-- ----------------------------------------------------------------
-- 5. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id          ON public.dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_dogs_city              ON public.dogs(city);
CREATE INDEX IF NOT EXISTS idx_caregivers_user_id     ON public.caregivers(user_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_city        ON public.caregivers(city);
CREATE INDEX IF NOT EXISTS idx_caregivers_is_approved ON public.caregivers(is_approved);
CREATE INDEX IF NOT EXISTS idx_matches_dog_id         ON public.matches(dog_id);
CREATE INDEX IF NOT EXISTS idx_matches_caregiver_id   ON public.matches(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_matches_total_score    ON public.matches(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status         ON public.matches(match_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role          ON public.profiles(role);

-- ----------------------------------------------------------------
-- 6. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches     ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 7. RLS POLICIES
-- ----------------------------------------------------------------

-- PROFILES --
-- Any authenticated user can read all profiles (needed for browsing caregivers)
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile row
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile row
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DOGS --
-- Owners can do everything with their own dogs
CREATE POLICY "Owners can manage their own dogs"
  ON public.dogs FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Approved caregivers (and admins) can read dogs to find matches
CREATE POLICY "Caregivers and admins can view dogs"
  ON public.dogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('caregiver', 'admin')
    )
  );

-- CAREGIVERS --
-- Caregivers can manage their own profile
CREATE POLICY "Caregivers can manage their own caregiver profile"
  ON public.caregivers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners and admins can read approved caregiver profiles
CREATE POLICY "Owners can view approved caregivers"
  ON public.caregivers FOR SELECT
  TO authenticated
  USING (
    is_approved = true
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- MATCHES --
-- Dog owners can see matches for their dogs
CREATE POLICY "Owners can view matches for their dogs"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dogs d
      WHERE d.id = dog_id AND d.owner_id = auth.uid()
    )
  );

-- Caregivers can see their own matches
CREATE POLICY "Caregivers can view their own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.caregivers c
      WHERE c.id = caregiver_id AND c.user_id = auth.uid()
    )
  );

-- Admins can do everything with matches (for the scoring engine)
CREATE POLICY "Admins can manage all matches"
  ON public.matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 8. AUTO-CREATE PROFILE TRIGGER
--    Fires after a new auth.users row is inserted (i.e., on sign-up).
--    Reads `role` and `full_name` from raw_user_meta_data if provided.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'owner')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
