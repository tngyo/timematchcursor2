<script>
  import { supabase } from './lib/supabase.js';
  import ParticipantCard from './components/ParticipantCard.svelte';
  import MatchResults from './components/MatchResults.svelte';
  
  let participants = $state([
    { name: '', city: '', timezone: '', offset: 0, timeslots: [] }
  ]);
  
  let meetingName = $state('');
  let meetingId = $state(null);
  let savedMeetingId = $state(null);
  let copySuccess = $state(false);
  let shareDropdownOpen = $state(false);
  let shareLinkCopied = $state(false);
  
  function addParticipant() {
    participants = [...participants, { name: '', city: '', timezone: '', offset: 0, timeslots: [] }];
  }
  
  function updateParticipant(index, updated) {
    participants = participants.map((p, i) => i === index ? updated : p);
  }
  
  function removeParticipant(index) {
    participants = participants.filter((_, i) => i !== index);
    if (participants.length === 0) {
      participants = [{ name: '', city: '', timezone: '', offset: 0, timeslots: [] }];
    }
  }
  
  async function saveMeeting() {
    if (!meetingName.trim()) {
      alert('Please enter a meeting name');
      return;
    }
    
    const validParticipants = participants.filter(p => 
      p.name.trim() && p.city && p.timeslots.length > 0
    );
    
    if (validParticipants.length < 1) {
      alert('Please add at least 1 participant with timeslots');
      return;
    }
    
    // Try with 'meeting_name' first, fallback to 'name'
    // Don't include id - let database generate it
    let insertData = {
      meeting_name: meetingName,
      participants: validParticipants
      // created_at will use database default if not provided
    };
    
    let { data, error } = await supabase
      .from('meetings')
      .insert(insertData)
      .select()
      .single();
    
    // If that fails, try with 'name' column
    if (error && error.message.includes('name')) {
      insertData = {
        name: meetingName,
        participants: validParticipants
        // created_at will use database default if not provided
      };
      const result = await supabase
        .from('meetings')
        .insert(insertData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('Error saving meeting:', error);
      const errorMsg = `Error saving meeting: ${error.message}\n\n` +
        `The 'meetings' table is missing required columns.\n\n` +
        `Please run the SQL in supabase_setup.sql in your Supabase SQL Editor to create/update the table structure.`;
      alert(errorMsg);
      savedMeetingId = null;
    } else {
      meetingId = data.id;
      savedMeetingId = data.id;
      copySuccess = false;
    }
  }
  
  async function loadMeeting() {
    if (!meetingId) return;
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();
    
    if (error) {
      console.error('Error loading meeting:', error);
      alert('Error loading meeting: ' + error.message);
    } else if (data) {
      meetingName = data.meeting_name || data.name || '';
      participants = data.participants || [{ name: '', city: '', timezone: '', offset: 0, timeslots: [] }];
      savedMeetingId = null;
    }
  }
  
  async function copyMeetingId() {
    const idToCopy = savedMeetingId || meetingId;
    if (!idToCopy) return;
    
    try {
      await navigator.clipboard.writeText(idToCopy);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
  
  function getShareableLink() {
    const currentMeetingId = savedMeetingId || meetingId;
    if (!currentMeetingId) return '';
    return `${window.location.origin}${window.location.pathname}?meeting=${currentMeetingId}`;
  }
  
  async function copyShareLink() {
    const link = getShareableLink();
    if (!link) return;
    
    try {
      await navigator.clipboard.writeText(link);
      shareLinkCopied = true;
      shareDropdownOpen = false;
      setTimeout(() => {
        shareLinkCopied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please try again.');
    }
  }
  
  async function shareLink() {
    const link = getShareableLink();
    const meetingIdToShare = savedMeetingId || meetingId;
    if (!link || !meetingIdToShare) return;
    
    const shareData = {
      title: `TimeMatch: ${meetingName || 'Meeting'}`,
      text: `Join me on TimeMatch to find the best meeting time! Meeting: ${meetingName || 'Untitled'}`,
      url: link
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        shareDropdownOpen = false;
      } else {
        // Fallback to copy if Web Share API not available
        await copyShareLink();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
        // Fallback to copy
        await copyShareLink();
      }
    }
  }
  
  // Load meeting from URL parameter on mount
  function loadMeetingFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const meetingParam = urlParams.get('meeting');
    if (meetingParam && !meetingId && !savedMeetingId) {
      meetingId = meetingParam;
      loadMeeting();
    }
  }
  
  // Call on mount
  loadMeetingFromURL();
  
  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (shareDropdownOpen && !event.target.closest('.dropdown')) {
      shareDropdownOpen = false;
    }
  }
  
  // Add event listener for clicking outside
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
  }
</script>

<div class="container mt-5">
  <h1 class="title is-1 has-text-centered">TimeMatch</h1>
  <p class="subtitle has-text-centered">Find perfect meeting times across timezones</p>
  
  <div class="box mb-5">
    <div class="field is-grouped">
      <div class="control is-expanded">
        <input 
          class="input" 
          type="text" 
          placeholder="Meeting name"
          bind:value={meetingName}
        />
      </div>
      <div class="control">
        <button class="button is-primary" onclick={(e) => { e.preventDefault(); saveMeeting(); }}>Save Meeting</button>
      </div>
      <div class="control">
        <input 
          class="input" 
          type="text" 
          placeholder="Meeting ID to load"
          bind:value={meetingId}
        />
      </div>
      <div class="control">
        <button class="button" onclick={(e) => { e.preventDefault(); loadMeeting(); }}>Load Meeting</button>
      </div>
    </div>
    
    {#if savedMeetingId || meetingId}
      <div class="notification is-success is-light mt-4">
        <div class="is-flex is-align-items-center is-flex-wrap-wrap" style="gap: 0.5rem;">
          <span><strong>Meeting ID:</strong></span>
          <code style="user-select: all;">{savedMeetingId || meetingId}</code>
          <button 
            class="button is-small is-light"
            class:is-success={copySuccess}
            onclick={(e) => { e.preventDefault(); copyMeetingId(); }}
          >
            {copySuccess ? '✓ Copied!' : 'Copy ID'}
          </button>
          
          <div class="dropdown" class:is-active={shareDropdownOpen} style="position: relative;">
            <div class="dropdown-trigger">
              <button 
                class="button is-small is-info"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); shareDropdownOpen = !shareDropdownOpen; }}
                aria-haspopup="true"
                aria-controls="share-menu"
              >
                <span>🔗 Share Meeting</span>
                <span>▼</span>
              </button>
            </div>
            <div class="dropdown-menu" id="share-menu" role="menu" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
              <div class="dropdown-content">
                <button 
                  type="button"
                  class="dropdown-item" 
                  onclick={(e) => { e.preventDefault(); copyShareLink(); }}
                >
                  {shareLinkCopied ? '✓ Link Copied!' : '📋 Copy Link'}
                </button>
                <button 
                  type="button"
                  class="dropdown-item" 
                  onclick={(e) => { e.preventDefault(); shareLink(); }}
                >
                  📤 Share via...
                </button>
                <hr class="dropdown-divider">
                <div class="dropdown-item">
                  <small class="has-text-grey">
                    Share this link to let others add their availability
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
        {#if shareLinkCopied}
          <div class="mt-2">
            <p class="has-text-success is-size-7">✓ Shareable link copied to clipboard!</p>
          </div>
        {/if}
      </div>
    {:else if meetingName.trim()}
      <div class="notification is-info is-light mt-4">
        <div class="is-flex is-align-items-center is-flex-wrap-wrap" style="gap: 0.5rem;">
          <span><strong>💡 Tip:</strong> Save your meeting to get a shareable link!</span>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="columns">
    <div class="column is-6" style="max-width: 100%; overflow-x: hidden;">
      <div class="mb-4">
        <button class="button is-success" onclick={(e) => { e.preventDefault(); addParticipant(); }}>
          + Add Participant
        </button>
      </div>
      
      {#each participants as participant, index}
        <ParticipantCard 
          {participant}
          onUpdate={(updated) => updateParticipant(index, updated)}
          onRemove={() => removeParticipant(index)}
        />
      {/each}
    </div>
    
    <div class="column is-6" style="min-width: 0;">
      <div style="position: sticky; top: 20px; max-width: 100%;">
        <MatchResults {participants} />
      </div>
    </div>
  </div>
</div>


