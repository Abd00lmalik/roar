-- Migration to fix profiles table for Google Sign-In and Circle wallets
-- 1. Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS circle_wallet_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS confederation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS passport_token_id INTEGER;

-- 2. Drop NOT NULL constraints to allow Google Sign-In before country selection/wallet provisioning
ALTER TABLE profiles ALTER COLUMN wallet_address DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN handle DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN country_code DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN country_name DROP NOT NULL;
