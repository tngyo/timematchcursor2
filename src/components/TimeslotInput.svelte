<script>
  let { participant, onUpdate } = $props();
  
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  let newDay = $state('MONDAY');
  let newStart = $state('9:00 AM');
  let newEnd = $state('10:00 AM');
  
  function addTimeslot() {
    const timeslots = [...(participant.timeslots || []), {
      day: newDay,
      start: newStart,
      end: newEnd
    }];
    onUpdate({ ...participant, timeslots });
  }
  
  function removeTimeslot(index) {
    const timeslots = participant.timeslots.filter((_, i) => i !== index);
    onUpdate({ ...participant, timeslots });
  }
  
  function formatTime(hour) {
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${h}:00 ${period}`;
  }
</script>

<div class="box">
  <h3 class="title is-5">Available Timeslots</h3>
  
  <div class="field is-grouped is-grouped-multiline" style="flex-wrap: wrap; gap: 0.5rem; max-width: 100%;">
    <div class="control" style="flex-shrink: 1; min-width: 0;">
      <div class="select" style="width: 100%;">
        <select bind:value={newDay} style="max-width: 100%;">
          {#each days as day}
            <option value={day}>{day}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="control" style="flex-shrink: 1; min-width: 0;">
      <div class="select" style="width: 100%;">
        <select bind:value={newStart} style="max-width: 100%;">
          {#each hours as hour}
            <option value={formatTime(hour)}>{formatTime(hour)}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="control" style="display: flex; align-items: center; flex-shrink: 0;">
      <span class="is-size-6">to</span>
    </div>
    <div class="control" style="flex-shrink: 1; min-width: 0;">
      <div class="select" style="width: 100%;">
        <select bind:value={newEnd} style="max-width: 100%;">
          {#each hours as hour}
            <option value={formatTime(hour)}>{formatTime(hour)}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="control" style="flex-shrink: 0;">
      <button class="button is-primary" onclick={(e) => { e.preventDefault(); addTimeslot(); }}>Add</button>
    </div>
  </div>
  
  {#if participant.timeslots && participant.timeslots.length > 0}
    <div class="mt-4">
      {#each participant.timeslots as slot, index}
        <div class="tag is-medium mr-2 mb-2">
          {slot.day} {slot.start} - {slot.end}
          <button 
            class="delete is-small ml-2" 
            onclick={(e) => { e.preventDefault(); removeTimeslot(index); }}
            aria-label="Remove timeslot {slot.day} {slot.start} - {slot.end}"
          ></button>
        </div>
      {/each}
    </div>
  {/if}
</div>

