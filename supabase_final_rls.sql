-- Final SQL: Re-enable RLS with proper, non-recursive policies
-- Run this after testing to secure the database

-- Re-enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
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

-- Create simple, non-recursive policies
-- Meetings: Users can only manage meetings they created
CREATE POLICY "Users can manage their own meetings" ON meetings
  FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Participants: Users can only manage participants in meetings they created
CREATE POLICY "Meeting creators can manage participants" ON participants
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