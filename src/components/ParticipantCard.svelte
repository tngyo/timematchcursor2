<script>
  import LocationInput from './LocationInput.svelte';
  import TimeslotInput from './TimeslotInput.svelte';
  import { getOffsetLabel } from '../lib/timezones.js';
  
  let { participant, onUpdate, onRemove } = $props();
</script>

<div class="card mb-5">
  <header class="card-header">
    <p class="card-header-title">
      {participant.name || 'New Participant'}
      {#if participant.city}
        <span class="tag is-info ml-2">
          {participant.city} ({getOffsetLabel(participant.offset)})
        </span>
      {/if}
    </p>
    <button class="card-header-icon" onclick={(e) => { e.preventDefault(); onRemove(); }} aria-label="remove">
      <span class="delete"></span>
    </button>
  </header>
  <div class="card-content">
    <div class="field">
      <label class="label" for="participant-name-{participant.name || 'new'}">Name</label>
      <div class="control">
        <input 
          id="participant-name-{participant.name || 'new'}"
          class="input" 
          type="text" 
          placeholder="Participant name"
          value={participant.name}
          oninput={(e) => onUpdate({ ...participant, name: e.target.value })}
        />
      </div>
    </div>
    
    <LocationInput {participant} {onUpdate} />
    
    {#if participant.city}
      <TimeslotInput {participant} {onUpdate} />
    {/if}
  </div>
</div>

