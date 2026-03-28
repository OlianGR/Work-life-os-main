-- Migration: Initial Schema for Work Life OS
-- Description: Tables for shift profiles, daily logs, and user configuration.

-- 1. Enable RLS
-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS shift_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('worked', 'off', 'holiday')),
  profile_id UUID REFERENCES shift_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  is_worked_holiday BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. Create User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_limit INTEGER DEFAULT 225,
  holiday_limit INTEGER DEFAULT 13,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE shift_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profiles" 
  ON shift_profiles FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own logs" 
  ON daily_logs FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" 
  ON user_settings FOR ALL 
  USING (auth.uid() = user_id);
