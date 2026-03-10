-- ================================================================
-- PawPair — Migration 002
-- Allow dog owners to insert/upsert matches for their own dogs.
-- This is needed so the quiz server action can save match results.
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

-- Drop first if already exists (safe re-run)
DROP POLICY IF EXISTS "Owners can insert matches for their dogs" ON public.matches;
DROP POLICY IF EXISTS "Owners can update matches for their dogs" ON public.matches;

CREATE POLICY "Owners can insert matches for their dogs"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dogs d
      WHERE d.id = dog_id AND d.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update matches for their dogs"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dogs d
      WHERE d.id = dog_id AND d.owner_id = auth.uid()
    )
  );
