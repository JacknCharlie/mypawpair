-- ================================================================
-- PawPair — Seed Data
-- Run this in the Supabase SQL Editor (as service_role / postgres)
-- after running 001_initial_schema.sql
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1 — Seed auth.users
--   Supabase stores hashed passwords; we use crypt() here so seed
--   accounts are usable for local testing (password = "password123")
-- ----------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
VALUES
  -- 3 Owners
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'ananya.sharma@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ananya Sharma","role":"owner"}',
    false, '', '', '', ''
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'rohan.mehta@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rohan Mehta","role":"owner"}',
    false, '', '', '', ''
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'priya.kapoor@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Priya Kapoor","role":"owner"}',
    false, '', '', '', ''
  ),
  -- 1 Admin (superadmin)
  (
    'f0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@mypawpair.com', crypt('PawPair@Admin2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin","role":"admin"}',
    false, '', '', '', ''
  ),
  -- 3 Caregivers
  (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'kavya.nair@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Kavya Nair","role":"caregiver"}',
    false, '', '', '', ''
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'arjun.verma@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Arjun Verma","role":"caregiver"}',
    false, '', '', '', ''
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'sneha.iyer@example.com', crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sneha Iyer","role":"caregiver"}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 2 — Profiles
--   The trigger handles this automatically on real sign-ups,
--   but since we bypassed auth we insert manually here.
-- ----------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, role, city, phone, created_at)
VALUES
  -- Owners
  ('a0000000-0000-0000-0000-000000000001', 'Ananya Sharma',  'owner',     'Mumbai',    '+91-9876543201', now()),
  ('a0000000-0000-0000-0000-000000000002', 'Rohan Mehta',    'owner',     'Delhi',     '+91-9876543202', now()),
  ('a0000000-0000-0000-0000-000000000003', 'Priya Kapoor',   'owner',     'Bengaluru', '+91-9876543203', now()),
  -- Admin
  ('f0000000-0000-0000-0000-000000000001', 'Super Admin',    'admin',     NULL,        NULL,             now()),
  -- Caregivers
  ('b0000000-0000-0000-0000-000000000001', 'Kavya Nair',     'caregiver', 'Mumbai',    '+91-9876543204', now()),
  ('b0000000-0000-0000-0000-000000000002', 'Arjun Verma',    'caregiver', 'Delhi',     '+91-9876543205', now()),
  ('b0000000-0000-0000-0000-000000000003', 'Sneha Iyer',     'caregiver', 'Bengaluru', '+91-9876543206', now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 3 — Dogs (5 dogs across 3 owners)
-- ----------------------------------------------------------------
INSERT INTO public.dogs (
  id, owner_id, name, breed, size, age,
  energy_level, temperament, special_needs, special_notes,
  city, zip_code, care_type, availability, created_at
)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Bruno', 'Labrador Retriever', 'large', 3,
    4, ARRAY['friendly','playful','social'], false, NULL,
    'Mumbai', '400001', ARRAY['boarding','daycare'], 'weekdays', now()
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Luna', 'Beagle', 'small', 2,
    3, ARRAY['curious','gentle','anxious'], true, 'Needs anxiety medication twice a day',
    'Mumbai', '400001', ARRAY['daycare','drop-in'], 'weekends', now()
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'Max', 'German Shepherd', 'large', 5,
    5, ARRAY['protective','energetic','loyal'], false, NULL,
    'Delhi', '110001', ARRAY['boarding','walking'], 'anytime', now()
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'Coco', 'Poodle', 'medium', 4,
    2, ARRAY['calm','intelligent','affectionate'], false, 'Grooming required every 6 weeks',
    'Delhi', '110002', ARRAY['daycare'], 'weekdays', now()
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000003',
    'Milo', 'Golden Retriever', 'large', 1,
    5, ARRAY['playful','energetic','friendly','mouthy'], false, 'Still in puppy training',
    'Bengaluru', '560001', ARRAY['boarding','daycare','walking'], 'anytime', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 4 — Caregivers (3 caregiver records)
-- ----------------------------------------------------------------
INSERT INTO public.caregivers (
  id, user_id, bio, experience_years,
  accepts_sizes, accepts_temperaments,
  services, certifications,
  city, zip_code, availability, is_approved, created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Dog lover with 6 years of professional pet care experience. I specialize in high-energy and large breed dogs.',
    6,
    ARRAY['medium','large'],
    ARRAY['friendly','playful','energetic','social'],
    ARRAY['boarding','daycare','walking'],
    'Pet First Aid Certified',
    'Mumbai', '400002', 'weekdays', true, now()
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Calm and patient caregiver, great with anxious or special-needs dogs. I treat every dog as my own.',
    4,
    ARRAY['small','medium'],
    ARRAY['anxious','gentle','calm','curious'],
    ARRAY['boarding','drop-in','daycare'],
    'Animal Behavior Certificate',
    'Delhi', '110001', 'weekends', true, now()
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'Certified dog trainer offering premium boarding and training. Experienced with puppies and all sizes.',
    8,
    ARRAY['small','medium','large'],
    ARRAY['playful','energetic','friendly','mouthy','loyal','protective'],
    ARRAY['boarding','daycare','walking','training'],
    'Certified Dog Trainer (IACP)',
    'Bengaluru', '560001', 'anytime', true, now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 5 — Matches (10 matches with varied compatibility scores)
-- ----------------------------------------------------------------
INSERT INTO public.matches (
  id, dog_id, caregiver_id,
  location_score, size_score, temperament_score,
  availability_score, experience_score,
  match_status, created_at
)
VALUES
  -- Bruno (large, Mumbai, weekdays) → Kavya (large/medium, Mumbai, weekdays) — HIGH
  (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    5, 5, 5, 5, 4, 'suggested', now()
  ),
  -- Bruno → Arjun (small/medium, Delhi, weekends) — LOW
  (
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    1, 2, 3, 2, 3, 'suggested', now()
  ),
  -- Bruno → Sneha (all sizes, Bengaluru, anytime) — MEDIUM
  (
    'e0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    2, 5, 5, 4, 5, 'contacted', now()
  ),
  -- Luna (small, anxious, Mumbai, weekends) → Kavya (medium/large, weekdays) — LOW
  (
    'e0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    5, 2, 2, 2, 4, 'suggested', now()
  ),
  -- Luna → Arjun (small/medium, anxious dogs, Delhi, weekends) — HIGH
  (
    'e0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    2, 4, 5, 5, 4, 'accepted', now()
  ),
  -- Max (large, energetic, Delhi) → Arjun (small/medium, Delhi) — MEDIUM
  (
    'e0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    5, 2, 3, 3, 4, 'suggested', now()
  ),
  -- Max → Sneha (all sizes, Bengaluru) — MEDIUM
  (
    'e0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000003',
    2, 5, 5, 5, 5, 'contacted', now()
  ),
  -- Coco (medium, calm, Delhi) → Arjun (small/medium, calm dogs, Delhi) — HIGH
  (
    'e0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000002',
    5, 4, 5, 4, 4, 'accepted', now()
  ),
  -- Milo (large, puppy, Bengaluru) → Sneha (all sizes, trainer, Bengaluru) — HIGH
  (
    'e0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000003',
    5, 5, 5, 5, 5, 'suggested', now()
  ),
  -- Milo → Kavya (large/medium, Mumbai) — LOW (city mismatch)
  (
    'e0000000-0000-0000-0000-000000000010',
    'c0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000001',
    1, 5, 4, 3, 4, 'rejected', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Verification queries (optional — comment out before production)
-- ----------------------------------------------------------------
-- SELECT 'profiles'  AS tbl, count(*) FROM public.profiles;
-- SELECT 'dogs'      AS tbl, count(*) FROM public.dogs;
-- SELECT 'caregivers'AS tbl, count(*) FROM public.caregivers;
-- SELECT 'matches'   AS tbl, count(*) FROM public.matches;
-- SELECT id, total_score, compatibility_tier, match_status FROM public.matches ORDER BY total_score DESC;
