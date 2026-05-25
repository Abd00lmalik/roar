ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS google_user_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS supporter_nation TEXT,
  ADD COLUMN IF NOT EXISTS free_seconds_remaining INTEGER NOT NULL DEFAULT 120;

CREATE INDEX IF NOT EXISTS idx_profiles_google_user_id ON profiles(google_user_id);
