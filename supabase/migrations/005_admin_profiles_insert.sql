-- ================================================================
-- PawPair — Migration 005
-- Allow admins to INSERT into profiles (for manual profile creation
-- or updates after auth.admin.createUser when trigger may not suffice).
-- ================================================================

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
