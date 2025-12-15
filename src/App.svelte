<script>
  import { onMount } from 'svelte';
  import Auth from './components/Auth.svelte';
  import ParticipantCard from './components/ParticipantCard.svelte';
  import MatchResults from './components/MatchResults.svelte';
  
  import { authStore, initAuth, signOut, clearAuthError } from './lib/authStore.js';
  import { createMeeting, getMeeting, getParticipants, saveParticipant, removeParticipant, getUserParticipation } from './lib/dbOperations.js';
  
  let authState = $state({ user: null, loading: true, initialized: false, error: null, session: null });
  let currentParticipant = $state(null);
  let meetingName = $state('');
  let meetingId = $state(null);
  let savedMeetingId = $state(null);
  let allParticipants = $state([]);
  let copySuccess = $state(false);
  let shareDropdownOpen = $state(false);
  let shareLinkCopied = $state(false);
  let loading = $state(false);
  let authError = $state('');
  let meetingError = $state('');
  
  // Subscribe to auth store
  $effect(() => {
    const unsubscribe = authStore.subscribe(state => {
      authState = state;
      authError = state.error || '';
    });
    return unsubscribe;
  });
  
  onMount(async () => {
    await initAuth();
  });
  
  function handleAuthSuccess(user) {
    clearLocalAuthError();
    if (meetingId) {
      loadMeetingAndParticipant();
    }
  }
  
  async function handleSignOut() {
    try {
      await signOut();
      // Reset local state
      currentParticipant = null;
      meetingName = '';
      savedMeetingId = null;
      allParticipants = [];
      meetingError = '';
      clearLocalAuthError();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
  
  function handleAuthError(error) {
    authError = error;
    setTimeout(() => {
      authError = '';
    }, 5000);
  }
  
  function clearLocalAuthError() {
    authError = '';
  }
  
  async function loadMeetingAndParticipant() {
    if (!meetingId || !authState.user) return;
    
    try {
      loading = true;
      meetingError = '';
      
      // Load meeting details
      const meeting = await getMeeting(meetingId);
      meetingName = meeting.meeting_name || '';
      
      // Load all participants
      allParticipants = await getParticipants(meetingId);
      
      // Check if current user is a participant
      const userParticipation = await getUserParticipation(meetingId);
      currentParticipant = userParticipation ? {
        name: userParticipation.name,
        city: userParticipation.city,
        timezone: userParticipation.timezone,
        offset: userParticipation.timezone_offset,
        timeslots: userParticipation.timeslots || []
      } : null;
      
    } catch (error) {
      console.error('Error loading meeting:', error);
      meetingError = error.message;
      // Clear meeting data on error
      meetingName = '';
      allParticipants = [];
      currentParticipant = null;
    } finally {
      loading = false;
    }
  }
  
  async function createNewMeeting() {
    if (!authState.user) {
      alert('Please sign in to create meetings');
      return;
    }
    
    if (!meetingName.trim()) {
      alert('Please enter a meeting name');
      return;
    }
    
    try {
      loading = true;
      
      const meeting = await createMeeting(meetingName, []);
      meetingId = meeting.id;
      savedMeetingId = meeting.id;
      meetingError = '';
      
      // Create participant entry for the creator
      if (currentParticipant && currentParticipant.name && currentParticipant.city && currentParticipant.timeslots.length > 0) {
        await saveParticipant(meetingId, currentParticipant);
        allParticipants = await getParticipants(meetingId);
      }
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting: ' + error.message);
    } finally {
      loading = false;
    }
  }
  
  async function loadMeetingById() {
    if (!meetingId) return;
    await loadMeetingAndParticipant();
  }
  
  async function updateMyParticipant(updatedParticipant) {
    if (!meetingId || !authState.user) return;
    
    try {
      currentParticipant = updatedParticipant;
      await saveParticipant(meetingId, updatedParticipant);
      allParticipants = await getParticipants(meetingId);
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Error updating your information: ' + error.message);
    }
  }
  
  async function removeMyParticipation() {
    if (!meetingId || !authState.user) return;
    
    try {
      await removeParticipant(meetingId);
      currentParticipant = null;
      allParticipants = await getParticipants(meetingId);
    } catch (error) {
      console.error('Error removing participation:', error);
      alert('Error removing your participation: ' + error.message);
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
        await copyShareLink();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
        await copyShareLink();
      }
    }
  }
  
  // Load meeting from URL parameter on mount
  function loadMeetingFromURL() {
    if (authState.loading) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const meetingParam = urlParams.get('meeting');
    if (meetingParam && !meetingId) {
      meetingId = meetingParam;
      if (authState.user) {
        loadMeetingAndParticipant();
      }
    }
  }
  
  // Effect to load meeting when auth is ready
  $effect(() => {
    if (authState.initialized && !authState.loading) {
      loadMeetingFromURL();
    }
  });
  
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
  
  {#if authState.loading}
    <div class="has-text-centered">
      <span class="icon">
        <i class="fas fa-spinner fa-spin"></i>
      </span>
      <span>Loading...</span>
    </div>
  {:else if !authState.user}
    <Auth onAuthSuccess={handleAuthSuccess} />
  {:else}
    <!-- User is authenticated -->
    <div class="box mb-5">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div>
              <p class="heading">Signed in as</p>
              <p class="title is-6">{authState.user.email}</p>
            </div>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button class="button is-light" onclick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div class="field is-grouped">
        <div class="control is-expanded">
          <input 
            class="input" 
            type="text" 
            placeholder="Meeting name"
            bind:value={meetingName}
            disabled={loading}
          />
        </div>
        <div class="control">
          <button 
            class="button is-primary" 
            onclick={(e) => { e.preventDefault(); createNewMeeting(); }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
        <div class="control">
          <input 
            class="input" 
            type="text" 
            placeholder="Enter Meeting ID"
            bind:value={meetingId}
            disabled={loading}
          />
        </div>
        <div class="control">
          <button 
            class="button" 
            onclick={(e) => { e.preventDefault(); loadMeetingById(); }}
            disabled={loading || !meetingId}
          >
            Load Meeting ID
          </button>
        </div>
      </div>
      
      {#if meetingError}
        <div class="notification is-danger is-light">
          <button class="delete" onclick={() => meetingError = ''}></button>
          <strong>Error:</strong> {meetingError}
        </div>
      {/if}
      
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
            <span><strong>💡 Tip:</strong> Create a meeting to get a shareable link!</span>
          </div>
        </div>
      {/if}
    </div>
    
    {#if meetingId && !meetingError}
      <div class="columns">
        <div class="column is-6" style="max-width: 100%; overflow-x: hidden;">
          <div class="box">
            <h3 class="title is-5">Your Information</h3>
            
            {#if currentParticipant}
              <ParticipantCard 
                participant={currentParticipant}
                onUpdate={updateMyParticipant}
                onRemove={removeMyParticipation}
              />
            {:else}
              <div class="notification is-info">
                <p>You haven't added your availability yet. Fill out the form below to join this meeting.</p>
              </div>
              <ParticipantCard 
                participant={{ name: '', city: '', timezone: '', offset: 0, timeslots: [] }}
                onUpdate={updateMyParticipant}
                onRemove={() => {}}
              />
            {/if}
          </div>
          
          <div class="box">
            <h3 class="title is-5">All Participants ({allParticipants.length})</h3>
            {#if allParticipants.length > 0}
              {#each allParticipants as participant}
                <div class="notification is-light">
                  <div class="level">
                    <div class="level-left">
                      <div class="level-item">
                        <div>
                          <p class="title is-6">{participant.name}</p>
                          <p class="subtitle is-7">{participant.city} (UTC{participant.timezone_offset >= 0 ? '+' : ''}{participant.timezone_offset})</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {:else}
              <p class="has-text-grey">No participants yet. Be the first to join!</p>
            {/if}
          </div>
        </div>
        
        <div class="column is-6" style="min-width: 0;">
          <div style="position: sticky; top: 20px; max-width: 100%;">
            <MatchResults participants={allParticipants} />
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
