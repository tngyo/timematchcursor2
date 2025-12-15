-- FIX: Allow participants to access meetings they're trying to join
-- This enables the second user to access existing meetings

-- Drop the restrictive meeting policies
DROP POLICY IF EXISTS "Users can see their meetings" ON meetings;

-- Create a new policy that allows users to see meetings they created OR meetings they're participating in
CREATE POLICY "Users can see accessible meetings" ON meetings
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

-- The other policies remain the same:
-- Policy 1: Users can create meetings (already correct)
-- Policy 3: Users can update their meetings (already correct)  
-- Policy 4: Users can delete their meetings (already correct)
-- Policy 5: Users can insert their participation (already correct)
-- Policy 6: Users can see participants (already correct)
-- Policy 7: Users can update their participation (already correct)
-- Policy 8: Users can delete their participation (already correct)