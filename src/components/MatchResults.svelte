<script>
  import { convertTime, getOffsetLabel } from '../lib/timezones.js';
  import { findMatches } from '../lib/timeMatch.js';
  
  let { participants } = $props();
  
  const validParticipants = $derived(
    participants.filter(p => p.name && p.city && p.timeslots && p.timeslots.length > 0)
  );
  
  const matches = $derived(findMatches(participants));
  
  const shouldShowResults = $derived(validParticipants.length >= 2);
</script>

<div class="box" style="overflow-x: auto; max-width: 100%;">
  <h2 class="title is-4">Match Results</h2>
  
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
      {#each matches as match}
        <div class="mb-5">
          {#if match.matchCount === match.totalCount}
            <div class="notification is-success is-light">
              <p class="is-size-5 has-text-weight-bold">
                ✅ {match.day} {match.start} - PERFECT MATCH
              </p>
              <p class="mb-3 has-text-weight-semibold">
                Overlapping time: {match.available[0]?.overlapStart || match.start} - {match.available[0]?.overlapEnd || match.end}
              </p>
              <div class="content" style="overflow-x: auto;">
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
                {#each match.available as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
   {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    {person.overlapStart} - {person.overlapEnd}
                  </p>
                {/each}
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
              </div>
            </div>
          {:else}
            <div class="notification is-warning is-light">
              <p class="is-size-5 has-text-weight-bold">
                ⚠️ {match.day} {match.start} - {match.matchCount} OUT OF {match.totalCount}
              </p>
              {#if match.available.length > 0 && match.available[0]?.overlapStart}
                <p class="mb-3 has-text-weight-semibold">
                  Overlapping time: {match.available[0].overlapStart} - {match.available[0].overlapEnd}
                </p>
              {/if}
              <div class="content" style="overflow-x: auto;">
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
                {#each match.available as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
   {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    {person.overlapStart || person.localTime} - {person.overlapEnd || ''} ✓
                  </p>
                {/each}
                {#each match.unavailable as person}
                  <p style="margin: 0.5rem 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">
   {person.name.padEnd(20)} ({person.city} {getOffsetLabel(person.offset)})    Not available ✗
                  </p>
                {/each}
                <pre style="background: transparent; border: none; padding: 0; margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

