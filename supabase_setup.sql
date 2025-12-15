-- SQL to create the meetings table in Supabase
-- Run this in your Supabase SQL Editor

-- Option 1: Create new table (if table doesn't exist)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_name TEXT NOT NULL,
  participants JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Option 2: If table already exists, add missing columns
-- Run these ALTER TABLE commands if your table exists but is missing columns:

-- Add meeting_name column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='meetings' AND column_name='meeting_name') THEN
    ALTER TABLE meetings ADD COLUMN meeting_name TEXT;
  END IF;
END $$;

-- Add participants column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='meetings' AND column_name='participants') THEN
    ALTER TABLE meetings ADD COLUMN participants JSONB;
  END IF;
END $$;

-- Add created_at column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='meetings' AND column_name='created_at') THEN
    ALTER TABLE meetings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Ensure id column has default value (if table already exists)
DO $$ 
BEGIN
  -- Check if id column exists but doesn't have a default
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='meetings' AND column_name='id' 
             AND column_default IS NULL) THEN
    -- Set default for id column
    ALTER TABLE meetings ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Grant necessary permissions
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow all operations on meetings" ON meetings;

CREATE POLICY "Allow all operations on meetings" ON meetings
  FOR ALL
  USING (true)
  WITH CHECK (true);

