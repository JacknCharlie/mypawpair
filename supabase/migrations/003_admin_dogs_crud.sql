-- ================================================================
-- PawPair — Migration 003
-- Grant admins full CRUD access to the dogs table.
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

DROP POLICY IF EXISTS "Admins can manage all dogs" ON public.dogs;

CREATE POLICY "Admins can manage all dogs"
  ON public.dogs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
