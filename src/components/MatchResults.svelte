<script>
  import { convertTime, getOffsetLabel } from '../lib/timezones.js';
  import { findMatches } from '../lib/timeMatch.js';
  
  let { participants } = $props();
  
  const validParticipants = $derived(
    participants.filter(p => p.name && p.city && p.timeslots && p.timeslots.length > 0)
  );
  
  const matches = $derived(findMatches(participants));
  
  const shouldShowResults = $derived(validParticipants.length >= 2 || matches.length > 0);
  
  // Check if a match is currently happening (within the next 15 minutes)
  function isMatchLive(match) {
    const now = new Date();
    const currentUTC = now.getHours() * 60 + now.getMinutes();
    
    // Get the current day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    // Check if this match is for today
    if (match.day !== currentDay) return false;
    
    // Parse the UTC times from the match
    const timeStrToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      const period = timeStr.includes('PM') ? 'PM' : 'AM';
      let hour = parseInt(hours);
      const min = parseInt(minutes);
      
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      return hour * 60 + min;
    };
    
    const matchStart = timeStrToMinutes(match.utcStart);
    const matchEnd = timeStrToMinutes(match.utcEnd);
    const currentTime = currentUTC;
    
    // Check if current time is within 15 minutes of the match start/end
    const timeDiff = Math.min(
      Math.abs(currentTime - matchStart),
      Math.abs(currentTime - matchEnd)
    );
    
    return timeDiff <= 15; // Within 15 minutes
  }
  
  const liveMatch = $derived(matches.find(match => isMatchLive(match)));
</script>

<div class="box" style="overflow-x: auto; max-width: 100%;">
  <h2 class="title is-4">Match Results</h2>
  
  {#if liveMatch}
    <div class="notification is-danger is-light" style="border: 2px solid #ff3860; animation: pulse 2s infinite;">
      <div class="has-text-centered">
        <p class="is-size-4 has-text-weight-bold">
          🔴 MEETING IS LIVE NOW!
        </p>
        <p class="is-size-6">
          {liveMatch.day} {liveMatch.utcStart} - {liveMatch.utcEnd} UTC
        </p>
        <p class="is-size-7 has-text-grey">
          Current time: {new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })}
        </p>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
    </style>
  {/if}
  
  {#if !shouldShowResults}
    <div class="notification is-info is-light">
      <p class="has-text-grey">
        {#if validParticipants.length === 0}
          Add at least one participant with their available timeslots to get started.
        {:else}
          Add more participants and their available timeslots to find matching times. Share the meeting link to invite others!
        {/if}
      </p>
    </div>
  {:else if matches.length === 0}
    <p class="has-text-grey">No matches found. Adjust timeslots to find overlapping availability.</p>
  {:else}
    <div style="min-width: 100%;">
      {#if matches.length > 0}
        {@const bestMatch = matches[0]}
        <div class="mb-5">
          {#if bestMatch.matchCount === bestMatch.totalCount}
            <div class="notification is-success is-light">
              <p class="is-size-5 has-text-weight-bold">
                ✅ {bestMatch.day} - PERFECT MATCH
              </p>
              <p class="mb-3 has-text-weight-semibold">
                Available times: Each participant's local time
              </p>
              <div class="content" style="overflow-x: auto;">
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
                {#each bestMatch.available as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
    {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    {person.originalStart} - {person.originalEnd} ✓ (Overlap: {bestMatch.day} {person.localStartTime} - {person.localEndTime})
                  </p>
                {/each}
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
              </div>
            </div>
          {:else}
            <div class="notification is-warning is-light">
              <p class="is-size-5 has-text-weight-bold">
                ⚠️ {bestMatch.day} - {bestMatch.matchCount} OUT OF {bestMatch.totalCount}
              </p>
              <p class="mb-3 has-text-weight-semibold">
                Available times: Each participant's local time
              </p>
              <div class="content" style="overflow-x: auto;">
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
                {#each bestMatch.available as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
    {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    {person.originalStart} - {person.originalEnd} ✓ (Overlap: {bestMatch.day} {person.localStartTime} - {person.localEndTime})
                  </p>
                {/each}
                {#each bestMatch.unavailable as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
    {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    Not available ✗
                  </p>
                {/each}
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>
