-- Every wallet is a creator AND a fan simultaneously
-- No role column. No is_creator flag. No separation.
ALTER TABLE profiles
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS is_creator;

-- Ensure total_earned exists for every profile regardless of upload history
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_earned NUMERIC(20,0) DEFAULT 0;
