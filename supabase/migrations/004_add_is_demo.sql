-- Migration to add is_demo column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
