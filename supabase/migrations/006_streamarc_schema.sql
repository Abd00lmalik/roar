-- Align with Streamarc's table structure

-- Add missing columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email              TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name       TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url         TEXT,
  ADD COLUMN IF NOT EXISTS role               TEXT DEFAULT 'viewer',
  ADD COLUMN IF NOT EXISTS circle_wallet_id   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS circle_wallet_address TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS gateway_balance    NUMERIC(20,6) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supporter_nation   TEXT,
  ADD COLUMN IF NOT EXISTS passport_tx_hash   TEXT,
  ADD COLUMN IF NOT EXISTS wallet_type        TEXT DEFAULT 'circle'
    CHECK (wallet_type IN ('circle', 'web3'));

-- Drop NOT NULL constraints that block Google sign-in
ALTER TABLE profiles
  ALTER COLUMN wallet_address   DROP NOT NULL,
  ALTER COLUMN handle           DROP NOT NULL,
  ALTER COLUMN country_code     DROP NOT NULL,
  ALTER COLUMN country_name     DROP NOT NULL;

-- Watch sessions (mirror Streamarc)
CREATE TABLE IF NOT EXISTS watch_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  video_id        UUID REFERENCES videos(id)   ON DELETE CASCADE,
  seconds_watched INTEGER DEFAULT 0,
  seconds_paid    INTEGER DEFAULT 0,
  total_cost      NUMERIC(20,6) DEFAULT 0,
  settled         BOOLEAN DEFAULT false,
  started_at      TIMESTAMPTZ DEFAULT now(),
  ended_at        TIMESTAMPTZ
);

ALTER TABLE watch_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "viewer_own_sessions" ON watch_sessions
  FOR ALL USING (viewer_id = auth.uid());

-- Payment batches (mirror Streamarc payment_batches)
CREATE TABLE IF NOT EXISTS payment_batches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID REFERENCES watch_sessions(id),
  viewer_id             UUID REFERENCES profiles(id),
  creator_id            UUID REFERENCES profiles(id),
  video_id              UUID REFERENCES videos(id),
  amount_micro          NUMERIC(20,0) NOT NULL,
  seconds_covered       INTEGER NOT NULL,
  circle_transaction_id TEXT,
  status                TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'settled', 'failed')),
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_batches" ON payment_batches
  FOR ALL USING (auth.role() = 'service_role');

-- Earnings (mirror Streamarc earnings)
CREATE TABLE IF NOT EXISTS earnings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID REFERENCES profiles(id),
  video_id      UUID REFERENCES videos(id),
  batch_id      UUID REFERENCES payment_batches(id),
  gross_amount  NUMERIC(20,6) NOT NULL,
  fan_pool_cut  NUMERIC(20,6) NOT NULL,
  treasury_cut  NUMERIC(20,6) NOT NULL,
  net_amount    NUMERIC(20,6) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator_own_earnings" ON earnings
  FOR SELECT USING (creator_id = auth.uid());
