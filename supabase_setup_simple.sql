-- Simple SQL to fix infinite recursion issue
-- This creates basic policies without circular references

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_name TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id),
  participants JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
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

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies first
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

-- Create VERY SIMPLE policies - no circular references
-- Meetings: Users can only see/modify their own meetings
CREATE POLICY "Users can manage their own meetings" ON meetings
  FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Participants: Users can only see participants in meetings they created
CREATE POLICY "Users can manage participants in their meetings" ON participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = participants.meeting_id 
      AND meetings.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = participants.meeting_id 
      AND meetings.creator_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meetings_creator_id ON meetings(creator_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);