-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- 
-- Strategi:
-- 1. Content tables (exams, subtests, questions, dll): READ-ONLY untuk authenticated users
--    Admin operations menggunakan service_role key yang bypass RLS
-- 2. User tables (profiles, attempts, attempt_items): User hanya akses data sendiri
--
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES: User hanya bisa akses profil sendiri
-- ============================================================================

CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- EXAMS: Semua authenticated user bisa baca exam yang aktif
-- ============================================================================

CREATE POLICY "exams_select_active"
ON exams FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================================
-- SUBTESTS: Semua authenticated user bisa baca subtest yang aktif
-- ============================================================================

CREATE POLICY "subtests_select_active"
ON subtests FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================================
-- QUESTIONS: Hanya bisa baca soal yang sudah published
-- ============================================================================

CREATE POLICY "questions_select_published"
ON questions FOR SELECT
TO authenticated
USING (status = 'published');

-- ============================================================================
-- BLUEPRINTS: Semua authenticated user bisa baca blueprint yang aktif
-- ============================================================================

CREATE POLICY "blueprints_select_active"
ON blueprints FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================================
-- BLUEPRINT_SECTIONS: Bisa dibaca jika parent blueprint aktif
-- ============================================================================

CREATE POLICY "blueprint_sections_select"
ON blueprint_sections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM blueprints 
    WHERE blueprints.id = blueprint_sections.blueprint_id 
    AND blueprints.is_active = true
  )
);

-- ============================================================================
-- QUESTION_SETS: Hanya bisa baca set yang published
-- ============================================================================

CREATE POLICY "question_sets_select_published"
ON question_sets FOR SELECT
TO authenticated
USING (status = 'published');

-- ============================================================================
-- QUESTION_SET_ITEMS: Bisa dibaca jika parent set published
-- ============================================================================

CREATE POLICY "question_set_items_select"
ON question_set_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM question_sets 
    WHERE question_sets.id = question_set_items.question_set_id 
    AND question_sets.status = 'published'
  )
);

-- ============================================================================
-- ATTEMPTS: User hanya bisa akses attempt milik sendiri
-- ============================================================================

CREATE POLICY "attempts_select_own"
ON attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "attempts_insert_own"
ON attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attempts_update_own"
ON attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ATTEMPT_ITEMS: User hanya bisa akses items dari attempt milik sendiri
-- ============================================================================

CREATE POLICY "attempt_items_select_own"
ON attempt_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM attempts 
    WHERE attempts.id = attempt_items.attempt_id 
    AND attempts.user_id = auth.uid()
  )
);

CREATE POLICY "attempt_items_insert_own"
ON attempt_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM attempts 
    WHERE attempts.id = attempt_items.attempt_id 
    AND attempts.user_id = auth.uid()
  )
);

CREATE POLICY "attempt_items_update_own"
ON attempt_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM attempts 
    WHERE attempts.id = attempt_items.attempt_id 
    AND attempts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM attempts 
    WHERE attempts.id = attempt_items.attempt_id 
    AND attempts.user_id = auth.uid()
  )
);

-- ============================================================================
-- HELPER: Function untuk auto-create profile saat user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Jalankan function di atas setiap ada user baru signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
