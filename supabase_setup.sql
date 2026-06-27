-- ============================================================
-- DESAFIO SAUDÁVEL — Setup completo do Supabase
-- Execute no SQL Editor do Supabase (em ordem)
-- ============================================================

-- 1. TABELA: perfis de usuário (display_name para o placar)
CREATE TABLE public.user_profiles (
  user_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: check-ins diários
CREATE TABLE public.daily_checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  agua          BOOLEAN NOT NULL DEFAULT FALSE,
  fruta         BOOLEAN NOT NULL DEFAULT FALSE,
  legume        BOOLEAN NOT NULL DEFAULT FALSE,
  sem_fast_food BOOLEAN NOT NULL DEFAULT FALSE,
  cigarros      INT,       -- null = não registrou; 0 = zerou
  leitura       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)   -- 1 check-in por pessoa por dia
);

-- 3. TABELA: logs de exercício (1 linha = 1 treino)
CREATE TABLE public.exercise_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: auditoria (append-only, nunca deletar)
CREATE TABLE public.audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  action     TEXT NOT NULL,   -- checkin_create | checkin_update | exercise_add | exercise_remove
  field      TEXT,            -- campo alterado (ex: 'agua', 'cigarros')
  old_value  TEXT,
  new_value  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário só lê/escreve os próprios dados.
-- user_profiles é leitura pública (para o placar).
-- ============================================================

ALTER TABLE public.user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;

-- user_profiles: qualquer autenticado pode LER (placar), só dono pode escrever
CREATE POLICY "profiles_select" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- daily_checkins: só o dono
CREATE POLICY "checkins_select" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checkins_insert" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins_update" ON public.daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- exercise_logs: só o dono
CREATE POLICY "exercises_select" ON public.exercise_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exercises_insert" ON public.exercise_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exercises_delete" ON public.exercise_logs
  FOR DELETE USING (auth.uid() = user_id);

-- audit_logs: só o dono pode ler e inserir; NUNCA deletar (sem policy de delete)
CREATE POLICY "audit_select" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PLACAR: o dashboard precisa LER checkins e exercises do parceiro.
-- Liberamos SELECT para authenticated em daily_checkins e exercise_logs.
-- (Os dados do parceiro são somente leitura no app — o app não escreve por ele)
-- ============================================================
DROP POLICY "checkins_select" ON public.daily_checkins;
CREATE POLICY "checkins_select" ON public.daily_checkins
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY "exercises_select" ON public.exercise_logs;
CREATE POLICY "exercises_select" ON public.exercise_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_checkins_user_date  ON public.daily_checkins (user_id, date DESC);
CREATE INDEX idx_exercises_user_date ON public.exercise_logs  (user_id, date DESC);
CREATE INDEX idx_audit_user_date     ON public.audit_logs     (user_id, created_at DESC);

-- ============================================================
-- DADOS INICIAIS: insira os dois usuários depois de criá-los
-- no Supabase Auth (Authentication → Users → Invite user).
-- Substitua os UUIDs pelos reais após criar as contas.
-- ============================================================

-- INSERT INTO public.user_profiles (user_id, display_name) VALUES
--   ('UUID-DO-LUCAS-AQUI',    'Lucas'),
--   ('UUID-DA-NAMORADA-AQUI', 'Nome dela');
