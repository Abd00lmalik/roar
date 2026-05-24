-- Add Circle wallet ID to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS circle_wallet_id TEXT,
  ADD COLUMN IF NOT EXISTS circle_wallet_address TEXT;

CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  total_owed_micro NUMERIC(20,0) NOT NULL,
  creator_cut NUMERIC(20,0) NOT NULL,
  fan_pool_cut NUMERIC(20,0) NOT NULL,
  treasury_cut NUMERIC(20,0) NOT NULL,
  status TEXT NOT NULL DEFAULT 'settled'
    CHECK (status IN ('settled', 'failed')),
  settled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_sessions" ON payment_sessions
  FOR SELECT USING (user_address = lower(auth.jwt() ->> 'sub'));
CREATE POLICY "service_role_write" ON payment_sessions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS var_challenges (
  video_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('open', 'upheld', 'dismissed', 'expired')),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  opened_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ
);

ALTER TABLE var_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_var" ON var_challenges FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS fan_passports (
  wallet_address TEXT PRIMARY KEY,
  country_code TEXT NOT NULL,
  token_id TEXT NOT NULL,
  staked_okb NUMERIC(20,0) NOT NULL,
  minted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fan_passports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_passports" ON fan_passports FOR SELECT USING (true);
