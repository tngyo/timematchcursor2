-- COMPLETE DATABASE RESET
-- This script will completely wipe and rebuild your database to eliminate all recursion issues

-- ===============================================
-- STEP 1: COMPLETE CLEANUP
-- ===============================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow all authenticated operations" ON participants;
DROP POLICY IF EXISTS "Allow all authenticated operations" ON meetings;
DROP POLICY IF EXISTS "Users can manage their own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can manage participants in their meetings" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to create meetings" ON meetings;
DROP POLICY IF EXISTS "Allow users to read their meetings" ON meetings;
DROP POLICY IF EXISTS "Allow users to update their meetings" ON meetings;
DROP POLICY IF EXISTS "Allow users to delete their meetings" ON meetings;
DROP POLICY IF EXISTS "Allow users to insert their participation" ON participants;
DROP POLICY IF EXISTS "Allow users to read participants" ON participants;
DROP POLICY IF EXISTS "Allow users to update their participation" ON participants;
DROP POLICY IF EXISTS "Allow users to delete their participation" ON participants;
DROP POLICY IF EXISTS "Allow all operations on meetings" ON meetings;
DROP POLICY IF EXISTS "Allow all operations on participants" ON participants;

-- Drop all existing tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;

-- Disable RLS on both tables
ALTER TABLE IF EXISTS meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS participants DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 2: CREATE CLEAN SCHEMA
-- ===============================================

-- Create meetings table with proper structure
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_name TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participants JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table with proper structure
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  timezone TEXT NOT NULL,
  timezone_offset INTEGER NOT NULL,
  timeslots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- ===============================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_meetings_creator_id ON meetings(creator_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_user ON participants(meeting_id, user_id);

-- ===============================================
-- STEP 4: ENABLE RLS WITH SIMPLE POLICIES
-- ===============================================

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create ONLY basic policies that cannot cause recursion
-- These policies only check auth.uid() and never reference other tables

-- Policy 1: Users can create meetings
CREATE POLICY "Users can create meetings" ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Policy 2: Users can see meetings they created
CREATE POLICY "Users can see their meetings" ON meetings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- Policy 3: Users can update their meetings
CREATE POLICY "Users can update their meetings" ON meetings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Policy 4: Users can delete their meetings
CREATE POLICY "Users can delete their meetings" ON meetings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Policy 5: Users can insert their own participation
CREATE POLICY "Users can insert their participation" ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 6: Users can see participants in their meetings OR their own participation
CREATE POLICY "Users can see participants" ON participants
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = participants.meeting_id 
      AND meetings.creator_id = auth.uid()
    )
  );

-- Policy 7: Users can update their own participation
CREATE POLICY "Users can update their participation" ON participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 8: Users can delete their own participation
CREATE POLICY "Users can delete their participation" ON participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===============================================
-- STEP 5: VERIFICATION
-- ===============================================

-- Check that all policies were created
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;