-- ============================================================
-- OPERATOROS — COMPLETE SUPABASE DATABASE SCHEMA
-- Version: 1.0
-- Run this entire file in Supabase SQL Editor on a fresh project
-- ============================================================

-- =================== EXTENSIONS ===================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- UTILITY FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;


-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name             TEXT,
  email                 TEXT,
  currency              TEXT        NOT NULL DEFAULT 'NGN',
  timezone              TEXT        NOT NULL DEFAULT 'Africa/Lagos',
  avatar_url            TEXT,
  daily_task_target     INT         NOT NULL DEFAULT 5,
  daily_habit_target    INT         NOT NULL DEFAULT 3,
  daily_outreach_target INT         NOT NULL DEFAULT 2,
  onboarded             BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, currency)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, 'NGN')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- FINANCE MODULE: categories
-- ============================================================
CREATE TABLE public.categories (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  icon       TEXT        NOT NULL DEFAULT '📦',
  color      TEXT        NOT NULL DEFAULT '#b2bec3',
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX categories_user_id_idx ON public.categories(user_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

INSERT INTO public.categories (name, icon, color, is_default, user_id) VALUES
  ('Food & Dining',     '🍔', '#ff9f43', TRUE, NULL),
  ('Transport',         '🚗', '#4db8ff', TRUE, NULL),
  ('Bills & Utilities', '💡', '#ffb547', TRUE, NULL),
  ('Rent & Housing',    '🏠', '#a29bfe', TRUE, NULL),
  ('Health',            '❤️', '#ff5f7e', TRUE, NULL),
  ('Entertainment',     '🎬', '#fd79a8', TRUE, NULL),
  ('Business',          '💼', '#00cec9', TRUE, NULL),
  ('Savings',           '💰', '#1ed9a4', TRUE, NULL),
  ('Shopping',          '🛍️', '#e17055', TRUE, NULL),
  ('Education',         '📚', '#74b9ff', TRUE, NULL),
  ('Travel',            '✈️', '#55efc4', TRUE, NULL),
  ('Other',             '📦', '#b2bec3', TRUE, NULL);


-- ============================================================
-- FINANCE MODULE: transactions
-- ============================================================
CREATE TABLE public.transactions (
  id         UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      TEXT          NOT NULL,
  amount     NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  type       TEXT          NOT NULL CHECK (type IN ('income','expense')),
  category   TEXT          NOT NULL,
  date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  note       TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX transactions_user_id_idx   ON public.transactions(user_id);
CREATE INDEX transactions_date_idx      ON public.transactions(user_id, date DESC);
CREATE INDEX transactions_type_idx      ON public.transactions(user_id, type);
CREATE INDEX transactions_category_idx  ON public.transactions(user_id, category);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================
-- FINANCE MODULE: budgets
-- ============================================================
CREATE TABLE public.budgets (
  id         UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category   TEXT          NOT NULL,
  amount     NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  month      INT           NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       INT           NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category, month, year)
);

CREATE INDEX budgets_user_id_idx ON public.budgets(user_id);
CREATE INDEX budgets_period_idx  ON public.budgets(user_id, year, month);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_select" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budgets_insert" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budgets_update" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budgets_delete" ON public.budgets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================
-- FINANCE MODULE: savings_goals + savings_contributions
-- ============================================================
CREATE TABLE public.savings_goals (
  id             UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name           TEXT          NOT NULL,
  icon           TEXT          NOT NULL DEFAULT '🎯',
  target_amount  NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline       DATE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX savings_goals_user_id_idx ON public.savings_goals(user_id);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "savings_goals_select" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "savings_goals_insert" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "savings_goals_update" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "savings_goals_delete" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.savings_contributions (
  id         UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id    UUID          REFERENCES public.savings_goals(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount     NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  note       TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX savings_contributions_goal_idx ON public.savings_contributions(goal_id);
CREATE INDEX savings_contributions_user_idx ON public.savings_contributions(user_id);
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contributions_select" ON public.savings_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contributions_insert" ON public.savings_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contributions_delete" ON public.savings_contributions FOR DELETE USING (auth.uid() = user_id);

-- Auto-update goal current_amount on contribution insert
CREATE OR REPLACE FUNCTION public.handle_contribution_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.savings_goals SET current_amount = current_amount + NEW.amount WHERE id = NEW.goal_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_contribution_inserted
  AFTER INSERT ON public.savings_contributions FOR EACH ROW EXECUTE PROCEDURE public.handle_contribution_insert();

-- Auto-reverse on delete
CREATE OR REPLACE FUNCTION public.handle_contribution_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.savings_goals SET current_amount = GREATEST(0, current_amount - OLD.amount) WHERE id = OLD.goal_id;
  RETURN OLD;
END; $$;
CREATE TRIGGER on_contribution_deleted
  AFTER DELETE ON public.savings_contributions FOR EACH ROW EXECUTE PROCEDURE public.handle_contribution_delete();


-- ============================================================
-- EXECUTION MODULE: tasks
-- ============================================================
CREATE TABLE public.tasks (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  priority     TEXT        NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('low','medium','high','critical')),
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','in_progress','done','cancelled')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  is_recurring BOOLEAN     NOT NULL DEFAULT FALSE,
  recurrence   TEXT        CHECK (recurrence IN ('daily','weekly','monthly') OR recurrence IS NULL),
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_user_id_idx  ON public.tasks(user_id);
CREATE INDEX tasks_status_idx   ON public.tasks(user_id, status);
CREATE INDEX tasks_due_date_idx ON public.tasks(user_id, due_date);
CREATE INDEX tasks_priority_idx ON public.tasks(user_id, priority);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Auto-set completed_at on status change
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_task_status_change
  BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_task_completion();


-- ============================================================
-- EXECUTION MODULE: habits + habit_completions
-- ============================================================
CREATE TABLE public.habits (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name              TEXT        NOT NULL,
  description       TEXT,
  icon              TEXT        NOT NULL DEFAULT '⚡',
  color             TEXT        NOT NULL DEFAULT '#7c6dfa',
  frequency         TEXT        NOT NULL DEFAULT 'daily'
                    CHECK (frequency IN ('daily','weekdays','weekends','weekly')),
  target_count      INT         NOT NULL DEFAULT 1 CHECK (target_count > 0),
  current_streak    INT         NOT NULL DEFAULT 0,
  longest_streak    INT         NOT NULL DEFAULT 0,
  total_completions INT         NOT NULL DEFAULT 0,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX habits_user_id_idx ON public.habits(user_id);
CREATE INDEX habits_active_idx  ON public.habits(user_id, is_active);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_select" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete" ON public.habits FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.habit_completions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id   UUID        REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  count      INT         NOT NULL DEFAULT 1 CHECK (count > 0),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, date)
);

CREATE INDEX habit_completions_habit_idx ON public.habit_completions(habit_id);
CREATE INDEX habit_completions_user_idx  ON public.habit_completions(user_id);
CREATE INDEX habit_completions_date_idx  ON public.habit_completions(user_id, date DESC);
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_completions_select" ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habit_completions_insert" ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_completions_update" ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habit_completions_delete" ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Streak calculation on insert
CREATE OR REPLACE FUNCTION public.handle_habit_completion_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_yesterday_exists BOOLEAN;
  v_current_streak   INT;
  v_longest_streak   INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.habit_completions
    WHERE habit_id = NEW.habit_id AND date = NEW.date - INTERVAL '1 day'
  ) INTO v_yesterday_exists;

  SELECT current_streak, longest_streak INTO v_current_streak, v_longest_streak
  FROM public.habits WHERE id = NEW.habit_id;

  v_current_streak := CASE WHEN v_yesterday_exists THEN v_current_streak + 1 ELSE 1 END;
  v_longest_streak := GREATEST(v_current_streak, v_longest_streak);

  UPDATE public.habits SET
    current_streak    = v_current_streak,
    longest_streak    = v_longest_streak,
    total_completions = total_completions + 1
  WHERE id = NEW.habit_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_habit_completed
  AFTER INSERT ON public.habit_completions FOR EACH ROW EXECUTE PROCEDURE public.handle_habit_completion_insert();

-- Reverse on delete
CREATE OR REPLACE FUNCTION public.handle_habit_completion_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.habits SET
    total_completions = GREATEST(0, total_completions - 1)
  WHERE id = OLD.habit_id;
  RETURN OLD;
END; $$;
CREATE TRIGGER on_habit_completion_deleted
  AFTER DELETE ON public.habit_completions FOR EACH ROW EXECUTE PROCEDURE public.handle_habit_completion_delete();


-- ============================================================
-- DAILY SCORES
-- ============================================================
CREATE TABLE public.daily_scores (
  id               UUID  DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID  REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date             DATE  NOT NULL DEFAULT CURRENT_DATE,
  score            INT   NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  execution_score  INT   NOT NULL DEFAULT 0 CHECK (execution_score  BETWEEN 0 AND 40),
  discipline_score INT   NOT NULL DEFAULT 0 CHECK (discipline_score BETWEEN 0 AND 35),
  growth_score     INT   NOT NULL DEFAULT 0 CHECK (growth_score     BETWEEN 0 AND 15),
  awareness_score  INT   NOT NULL DEFAULT 0 CHECK (awareness_score  BETWEEN 0 AND 10),
  tasks_due        INT   NOT NULL DEFAULT 0,
  tasks_done       INT   NOT NULL DEFAULT 0,
  habits_scheduled INT   NOT NULL DEFAULT 0,
  habits_done      INT   NOT NULL DEFAULT 0,
  outreach_done    INT   NOT NULL DEFAULT 0,
  finance_logged   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX daily_scores_user_idx ON public.daily_scores(user_id);
CREATE INDEX daily_scores_date_idx ON public.daily_scores(user_id, date DESC);
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_scores_select" ON public.daily_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_scores_insert" ON public.daily_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_scores_update" ON public.daily_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER daily_scores_updated_at
  BEFORE UPDATE ON public.daily_scores FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Score calculation RPC
CREATE OR REPLACE FUNCTION public.calculate_daily_score(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  score INT, execution_score INT, discipline_score INT,
  growth_score INT, awareness_score INT,
  tasks_due INT, tasks_done INT,
  habits_scheduled INT, habits_done INT,
  outreach_done INT, finance_logged BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tasks_due INT; v_tasks_done INT;
  v_habits_scheduled INT; v_habits_done INT;
  v_outreach_done INT; v_finance_logged BOOLEAN;
  v_exec INT; v_disc INT; v_growth INT; v_aware INT; v_total INT;
  v_outreach_target INT;
BEGIN
  SELECT COUNT(*) INTO v_tasks_due   FROM public.tasks WHERE user_id = p_user_id AND due_date = p_date AND status != 'cancelled';
  SELECT COUNT(*) INTO v_tasks_done  FROM public.tasks WHERE user_id = p_user_id AND due_date = p_date AND status = 'done';
  SELECT COUNT(*) INTO v_habits_scheduled FROM public.habits
    WHERE user_id = p_user_id AND is_active = TRUE
    AND (frequency = 'daily'
      OR (frequency = 'weekdays' AND EXTRACT(DOW FROM p_date) BETWEEN 1 AND 5)
      OR (frequency = 'weekends' AND EXTRACT(DOW FROM p_date) IN (0,6))
      OR (frequency = 'weekly'   AND EXTRACT(DOW FROM p_date) = 1));
  SELECT COUNT(*) INTO v_habits_done    FROM public.habit_completions WHERE user_id = p_user_id AND date = p_date;
  SELECT COUNT(*) INTO v_outreach_done  FROM public.outreach_logs WHERE user_id = p_user_id AND DATE(contacted_at) = p_date;
  SELECT EXISTS(SELECT 1 FROM public.transactions WHERE user_id = p_user_id AND date = p_date) INTO v_finance_logged;
  SELECT daily_outreach_target INTO v_outreach_target FROM public.profiles WHERE id = p_user_id;

  v_exec   := CASE WHEN v_tasks_due = 0 THEN 20 ELSE LEAST(40, ROUND((v_tasks_done::NUMERIC / v_tasks_due) * 40)) END;
  v_disc   := CASE WHEN v_habits_scheduled = 0 THEN 18 ELSE LEAST(35, ROUND((v_habits_done::NUMERIC / v_habits_scheduled) * 35)) END;
  v_growth := CASE WHEN v_outreach_done >= COALESCE(v_outreach_target,2) THEN 15 WHEN v_outreach_done > 0 THEN ROUND((v_outreach_done::NUMERIC / COALESCE(v_outreach_target,2)) * 15) ELSE 0 END;
  v_aware  := CASE WHEN v_finance_logged THEN 10 ELSE 0 END;
  v_total  := v_exec + v_disc + v_growth + v_aware;

  INSERT INTO public.daily_scores (user_id,date,score,execution_score,discipline_score,growth_score,awareness_score,tasks_due,tasks_done,habits_scheduled,habits_done,outreach_done,finance_logged)
  VALUES (p_user_id,p_date,v_total,v_exec,v_disc,v_growth,v_aware,v_tasks_due,v_tasks_done,v_habits_scheduled,v_habits_done,v_outreach_done,v_finance_logged)
  ON CONFLICT (user_id,date) DO UPDATE SET
    score=EXCLUDED.score, execution_score=EXCLUDED.execution_score,
    discipline_score=EXCLUDED.discipline_score, growth_score=EXCLUDED.growth_score,
    awareness_score=EXCLUDED.awareness_score, tasks_due=EXCLUDED.tasks_due,
    tasks_done=EXCLUDED.tasks_done, habits_scheduled=EXCLUDED.habits_scheduled,
    habits_done=EXCLUDED.habits_done, outreach_done=EXCLUDED.outreach_done,
    finance_logged=EXCLUDED.finance_logged, updated_at=NOW();

  RETURN QUERY SELECT v_total,v_exec,v_disc,v_growth,v_aware,v_tasks_due,v_tasks_done,v_habits_scheduled,v_habits_done,v_outreach_done,v_finance_logged;
END; $$;


-- ============================================================
-- GROWTH MODULE: outreach_logs
-- ============================================================
CREATE TABLE public.outreach_logs (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT        NOT NULL,
  company      TEXT,
  channel      TEXT        NOT NULL DEFAULT 'other'
               CHECK (channel IN ('linkedin','email','twitter','instagram','whatsapp','phone','in_person','other')),
  status       TEXT        NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent','opened','replied','meeting_booked','closed','not_interested')),
  subject      TEXT,
  notes        TEXT,
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  follow_up_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX outreach_user_id_idx   ON public.outreach_logs(user_id);
CREATE INDEX outreach_status_idx    ON public.outreach_logs(user_id, status);
CREATE INDEX outreach_contacted_idx ON public.outreach_logs(user_id, contacted_at DESC);
CREATE INDEX outreach_followup_idx  ON public.outreach_logs(user_id, follow_up_at) WHERE follow_up_at IS NOT NULL;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outreach_select" ON public.outreach_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "outreach_insert" ON public.outreach_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outreach_update" ON public.outreach_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "outreach_delete" ON public.outreach_logs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER outreach_updated_at
  BEFORE UPDATE ON public.outreach_logs FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================
-- VISION MODULE: vision_assets
-- ============================================================
CREATE TABLE public.vision_assets (
  id            UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT          NOT NULL,
  description   TEXT,
  category      TEXT          NOT NULL DEFAULT 'general'
                CHECK (category IN ('wealth','health','relationships','career','lifestyle','impact','general')),
  type          TEXT          NOT NULL DEFAULT 'goal'
                CHECK (type IN ('goal','affirmation','milestone','image')),
  target_date   DATE,
  target_value  NUMERIC(14,2),
  current_value NUMERIC(14,2) DEFAULT 0,
  image_url     TEXT,
  is_achieved   BOOLEAN       NOT NULL DEFAULT FALSE,
  achieved_at   TIMESTAMPTZ,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX vision_user_id_idx   ON public.vision_assets(user_id);
CREATE INDEX vision_category_idx  ON public.vision_assets(user_id, category);
CREATE INDEX vision_achieved_idx  ON public.vision_assets(user_id, is_achieved);
ALTER TABLE public.vision_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vision_select" ON public.vision_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "vision_insert" ON public.vision_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vision_update" ON public.vision_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vision_delete" ON public.vision_assets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER vision_assets_updated_at
  BEFORE UPDATE ON public.vision_assets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================
-- ANALYTICS VIEWS
-- ============================================================
CREATE OR REPLACE VIEW public.v_monthly_finance AS
SELECT user_id,
  EXTRACT(YEAR FROM date)::INT  AS year,
  EXTRACT(MONTH FROM date)::INT AS month,
  type, SUM(amount) AS total, COUNT(*) AS count
FROM public.transactions GROUP BY user_id, year, month, type;

CREATE OR REPLACE VIEW public.v_category_spending AS
SELECT user_id, category,
  EXTRACT(YEAR FROM date)::INT  AS year,
  EXTRACT(MONTH FROM date)::INT AS month,
  SUM(amount) AS total, COUNT(*) AS count
FROM public.transactions WHERE type = 'expense'
GROUP BY user_id, category, year, month;

CREATE OR REPLACE VIEW public.v_weekly_execution AS
SELECT user_id,
  AVG(score)::INT            AS avg_score,
  SUM(tasks_done)            AS total_tasks_done,
  SUM(habits_done)           AS total_habits_done,
  SUM(outreach_done)         AS total_outreach
FROM public.daily_scores
WHERE date >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY user_id;

CREATE OR REPLACE VIEW public.v_habit_streaks AS
SELECT h.user_id, h.id AS habit_id, h.name, h.icon, h.color,
  h.current_streak, h.longest_streak, h.total_completions, h.frequency
FROM public.habits h WHERE h.is_active = TRUE;

CREATE OR REPLACE VIEW public.v_outreach_pipeline AS
SELECT user_id, channel, status, COUNT(*) AS count,
  COUNT(*) FILTER (WHERE contacted_at >= NOW() - INTERVAL '7 days')  AS last_7_days,
  COUNT(*) FILTER (WHERE contacted_at >= NOW() - INTERVAL '30 days') AS last_30_days
FROM public.outreach_logs GROUP BY user_id, channel, status;


-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outreach_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vision_assets;


-- ============================================================
-- RPC GRANTS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.calculate_daily_score(UUID, DATE) TO authenticated;
GRANT SELECT ON public.v_monthly_finance    TO authenticated;
GRANT SELECT ON public.v_category_spending  TO authenticated;
GRANT SELECT ON public.v_weekly_execution   TO authenticated;
GRANT SELECT ON public.v_habit_streaks      TO authenticated;
GRANT SELECT ON public.v_outreach_pipeline  TO authenticated;
