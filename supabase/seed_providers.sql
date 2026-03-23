-- ================================================================
-- PawPair — Provider Seed Data
-- Run AFTER 006_providers.sql migration
-- 4 providers with complete data (verified, with services)
-- Password for all: Provider123!
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1 — auth.users (4 provider users)
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
  (
    'a2000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'pawsome.grooming@example.com', crypt('Provider123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Chen","role":"provider"}',
    false, '', '', '', ''
  ),
  (
    'a2000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'doglab.training@example.com', crypt('Provider123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mike Rodriguez","role":"provider"}',
    false, '', '', '', ''
  ),
  (
    'a2000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'happy.paws.vet@example.com', crypt('Provider123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Emily Foster","role":"provider"}',
    false, '', '', '', ''
  ),
  (
    'a2000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'wagging.trails@example.com', crypt('Provider123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"James Wilson","role":"provider"}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 2 — Profiles (provider role)
-- ----------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, role, city, phone, created_at)
VALUES
  ('a2000000-0000-0000-0000-000000000001', 'Sarah Chen',     'provider', 'Austin',   '+1-512-555-1001', now()),
  ('a2000000-0000-0000-0000-000000000002', 'Mike Rodriguez',  'provider', 'Austin',   '+1-512-555-1002', now()),
  ('a2000000-0000-0000-0000-000000000003', 'Dr. Emily Foster','provider', 'Austin',   '+1-512-555-1003', now()),
  ('a2000000-0000-0000-0000-000000000004', 'James Wilson',     'provider', 'Austin',   '+1-512-555-1004', now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 3 — Providers (full business data, all verified)
-- ----------------------------------------------------------------
INSERT INTO public.providers (
  id, user_id, business_name, description, category, city, zip_code, phone, website, email, is_verified, created_at, updated_at
)
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'a2000000-0000-0000-0000-000000000001',
    'PawSome Grooming',
    'Premium dog grooming studio specializing in breed-specific cuts, nail trimming, and spa treatments. We use all-natural products and create a stress-free environment for your furry friend.',
    'grooming',
    'Austin',
    '78701',
    '+1-512-555-1001',
    'https://pawsomegrooming.example.com',
    'contact@pawsomegrooming.example.com',
    true,
    now(),
    now()
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'a2000000-0000-0000-0000-000000000002',
    'DogLab Training',
    'Certified professional dog trainer with 10+ years experience. We offer obedience training, puppy socialization, and behavior modification. Positive reinforcement methods only.',
    'training',
    'Austin',
    '78702',
    '+1-512-555-1002',
    'https://doglabtraining.example.com',
    'info@doglabtraining.example.com',
    true,
    now(),
    now()
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'a2000000-0000-0000-0000-000000000003',
    'Happy Paws Veterinary Clinic',
    'Full-service veterinary clinic providing wellness exams, vaccinations, dental care, and emergency services. We treat every pet like family and offer personalized care plans.',
    'vet',
    'Austin',
    '78703',
    '+1-512-555-1003',
    'https://happypawsvet.example.com',
    'appointments@happypawsvet.example.com',
    true,
    now(),
    now()
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'a2000000-0000-0000-0000-000000000004',
    'Wagging Trails Dog Walking',
    'Professional dog walking and pet sitting services. We offer group walks, solo adventures, and drop-in visits. All walkers are trained, insured, and truly love dogs.',
    'walking',
    'Austin',
    '78704',
    '+1-512-555-1004',
    'https://waggingtrails.example.com',
    'hello@waggingtrails.example.com',
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- STEP 4 — Provider Services (2-4 services per provider)
-- ----------------------------------------------------------------
INSERT INTO public.provider_services (
  id, provider_id, name, description, price, price_type, duration_minutes, is_active, created_at, updated_at
)
VALUES
  -- PawSome Grooming
  ('a3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Basic Groom', 'Bath, brush, nail trim, ear cleaning', 45.00, 'fixed', 60, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Full Groom', 'Breed-specific cut + bath + styling', 75.00, 'from', 90, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Puppy Intro', 'Gentle first grooming experience for puppies', 35.00, 'fixed', 45, true, now(), now()),
  -- DogLab Training
  ('a3000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Puppy 101', 'Basic obedience for puppies 8-16 weeks', 120.00, 'fixed', 60, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'Private Lesson', 'One-on-one training session', 85.00, 'fixed', 60, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000002', 'Behavior Consultation', 'In-depth assessment and behavior plan', 150.00, 'fixed', 90, true, now(), now()),
  -- Happy Paws Veterinary
  ('a3000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000003', 'Wellness Exam', 'Annual checkup and health assessment', 65.00, 'fixed', 30, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003', 'Vaccinations', 'Core vaccines (DHPP, Rabies)', 0, 'contact', 20, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000003', 'Dental Cleaning', 'Professional teeth cleaning under anesthesia', 250.00, 'from', 120, true, now(), now()),
  -- Wagging Trails
  ('a3000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000004', '30-Min Walk', 'Solo walk with photo updates', 25.00, 'fixed', 30, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000004', '60-Min Adventure', 'Extended walk or hike', 40.00, 'fixed', 60, true, now(), now()),
  ('a3000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000004', 'Drop-in Visit', '30-min check-in, feed, play', 30.00, 'fixed', 30, true, now(), now())
ON CONFLICT (id) DO NOTHING;
