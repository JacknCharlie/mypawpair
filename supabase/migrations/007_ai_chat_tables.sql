-- ================================================================
-- AI Chat Tables Migration
-- Stores chat sessions and messages for Charlie AI assistant
-- ================================================================

-- ----------------------------------------------------------------
-- 1. DOG_PROFILES TABLE
--    Extended dog profile specifically for AI personalization
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dog_profiles (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dog_id            uuid        REFERENCES public.dogs(id) ON DELETE CASCADE,
  
  -- Basic Info
  name              text        NOT NULL,
  pronouns          text,       -- he/him, she/her, they/them
  species           text        DEFAULT 'dog',
  breed             text,
  age               integer,
  
  -- Health & Dietary
  health_conditions text[],
  dietary_needs     text[],
  
  -- Preferences (for future use)
  preferences       jsonb       DEFAULT '{}'::jsonb,
  
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. CHAT_SESSIONS TABLE
--    One session = one conversation with Charlie
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dog_profile_id    uuid        REFERENCES public.dog_profiles(id) ON DELETE SET NULL,
  
  title             text        NOT NULL,
  is_onboarded      boolean     NOT NULL DEFAULT false,
  
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. CHAT_MESSAGES TABLE
--    Individual messages within a session
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid        NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  
  role              text        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content           text        NOT NULL,
  
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dog_profiles_user_id ON public.dog_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_dog_profile ON public.chat_sessions(dog_profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ----------------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE public.dog_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 6. RLS POLICIES
-- ----------------------------------------------------------------

-- DOG_PROFILES --
CREATE POLICY "Users can manage their own dog profiles"
  ON public.dog_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHAT_SESSIONS --
CREATE POLICY "Users can manage their own chat sessions"
  ON public.chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHAT_MESSAGES --
CREATE POLICY "Users can view messages from their sessions"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id AND cs.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 7. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dog_profiles_updated_at
  BEFORE UPDATE ON public.dog_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
