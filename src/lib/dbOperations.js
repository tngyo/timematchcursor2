import { supabase } from './supabase.js';
import { getCurrentUser } from './authStore.js';

// Create a new meeting
export async function createMeeting(meetingName, participants = []) {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      meeting_name: meetingName,
      creator_id: user.id
      // Note: participants field is managed separately in participants table
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating meeting:', error);
    throw error;
  }
  return data;
}

// Get meeting by ID
export async function getMeeting(meetingId) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (error) {
    console.error('Error fetching meeting:', error);
    if (error.code === 'PGRST116') {
      throw new Error('Meeting not found');
    }
    if (error.code === '42501') {
      throw new Error('Access denied to this meeting');
    }
    throw new Error(`Failed to load meeting: ${error.message}`);
  }
  return data;
}

// Get participants for a meeting
export async function getParticipants(meetingId) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    throw new Error(`Failed to load participants: ${error.message}`);
  }
  return data || [];
}

// Add or update participant
export async function saveParticipant(meetingId, participantData) {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const participantInfo = {
    meeting_id: meetingId,
    user_id: user.id,
    name: participantData.name,
    city: participantData.city,
    timezone: participantData.timezone,
    timezone_offset: participantData.offset,
    timeslots: participantData.timeslots
  };

  // Check if participant already exists
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('meeting_id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update existing participant
    const { data, error } = await supabase
      .from('participants')
      .update(participantInfo)
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new participant
    const { data, error } = await supabase
      .from('participants')
      .insert(participantInfo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Remove participant
export async function removeParticipant(meetingId) {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('meeting_id', meetingId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// Get user's meeting participation status
export async function getUserParticipation(meetingId) {
  const user = getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('meeting_id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error;
  }
  
  return data;
}