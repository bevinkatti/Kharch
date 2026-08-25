-- ============================================================
-- Kharch — Database Schema v3
-- Run entire file in Supabase SQL Editor.
-- All ALTER TABLE statements are idempotent (IF NOT EXISTS).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── user_settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id    TEXT        UNIQUE NOT NULL,
  currency    TEXT        NOT NULL DEFAULT '₹',
  city_label  TEXT        NOT NULL DEFAULT 'My Budget',
  ef_target   NUMERIC     NOT NULL DEFAULT 100000,
  salary      NUMERIC     NOT NULL DEFAULT 0,
  salary_day  INTEGER     CHECK (salary_day BETWEEN 1 AND 31),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS salary_day INTEGER CHECK (salary_day BETWEEN 1 AND 31);

-- ── months ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS months (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id    TEXT        NOT NULL,
  month_key   TEXT        NOT NULL,
  salary      NUMERIC     NOT NULL DEFAULT 0,
  bonus       NUMERIC     NOT NULL DEFAULT 0,
  ef_amount   NUMERIC     NOT NULL DEFAULT 0,
  notes       TEXT        NOT NULL DEFAULT '',
  checks      BOOLEAN[]   NOT NULL DEFAULT ARRAY[false,false,false,false,false,false,false],
  check_items JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clerk_id, month_key)
);
-- Idempotent migration for existing tables
ALTER TABLE months ADD COLUMN IF NOT EXISTS check_items JSONB;

-- ── expenses ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_id    UUID        NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  clerk_id    TEXT        NOT NULL,
  label       TEXT        NOT NULL DEFAULT 'Expense',
  category    TEXT        NOT NULL CHECK (category IN ('fixed','living','savings')) DEFAULT 'living',
  amount      NUMERIC     NOT NULL DEFAULT 0,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_months_clerk       ON months(clerk_id);
CREATE INDEX IF NOT EXISTS idx_months_key         ON months(clerk_id, month_key);
CREATE INDEX IF NOT EXISTS idx_expenses_month     ON expenses(month_id);
CREATE INDEX IF NOT EXISTS idx_expenses_clerk     ON expenses(clerk_id);
CREATE INDEX IF NOT EXISTS idx_settings_clerk     ON user_settings(clerk_id);

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS months_updated_at       ON months;
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER months_updated_at        BEFORE UPDATE ON months        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE months         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses       ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_settings' AND policyname='deny_anon') THEN
    CREATE POLICY deny_anon ON user_settings FOR ALL TO anon USING (false); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='months' AND policyname='deny_anon') THEN
    CREATE POLICY deny_anon ON months FOR ALL TO anon USING (false); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expenses' AND policyname='deny_anon') THEN
    CREATE POLICY deny_anon ON expenses FOR ALL TO anon USING (false); END IF;
END $$;
