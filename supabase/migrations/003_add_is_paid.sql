-- Migration to add is_paid column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT TRUE;
