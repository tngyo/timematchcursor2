-- SQL to create the meetings and participants tables in Supabase
-- Run this in your Supabase SQL Editor

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on meetings" ON meetings;
DROP POLICY IF EXISTS "Allow all operations on participants" ON participants;

-- Create policies for meetings table
-- Allow authenticated users to create meetings
CREATE POLICY "Allow authenticated users to create meetings" ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Allow users to read meetings they created or are participating in
CREATE POLICY "Allow users to read their meetings" ON meetings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.meeting_id = meetings.id 
      AND participants.user_id = auth.uid()
    )
  );

-- Allow users to update meetings they created
CREATE POLICY "Allow users to update their meetings" ON meetings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Allow users to delete meetings they created
CREATE POLICY "Allow users to delete their meetings" ON meetings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create policies for participants table
-- Allow authenticated users to insert their own participation
CREATE POLICY "Allow users to insert their participation" ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read participants in meetings they can access
CREATE POLICY "Allow users to read participants" ON participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = participants.meeting_id 
      AND (meetings.creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM participants p 
        WHERE p.meeting_id = meetings.id 
        AND p.user_id = auth.uid()
      ))
    )
  );

-- Allow users to update their own participation
CREATE POLICY "Allow users to update their participation" ON participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own participation
CREATE POLICY "Allow users to delete their participation" ON participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_creator_id ON meetings(creator_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_user ON participants(meeting_id, user_id);
