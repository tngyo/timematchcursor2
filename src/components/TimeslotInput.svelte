<script>
  let { participant, onUpdate } = $props();
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  let newDay = $state('Monday');
  let newStart = $state('9:00 AM');
  let newEnd = $state('10:00 AM');
  
  function formatTime(hour) {
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${h}:00 ${period}`;
  }
  
  // Auto-update end time when start time changes
  $effect(() => {
    newStart; // Track dependency
    const startHour = hours.find(h => formatTime(h) === newStart);
    if (startHour !== undefined) {
      const endHour = (startHour + 1) % 24;
      newEnd = formatTime(endHour);
    }
  });
  
  function addTimeslot() {
    // Validate start < end time
    const parseTime = (timeStr) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(newStart);
    const endMinutes = parseTime(newEnd);

    if (startMinutes === null || endMinutes === null) {
      alert('Invalid time format');
      return;
    }

    // Allow cross-midnight slots by computing wrapped duration (e.g., 11 PM to 1 AM)
    const duration = (endMinutes - startMinutes + 24 * 60) % (24 * 60);
    if (duration === 0) {
      alert('End time must differ from start time');
      return;
    }

    // Check for duplicates
    const isDuplicate = participant.timeslots?.some(slot =>
      slot.day === newDay && slot.start === newStart && slot.end === newEnd
    );

    if (isDuplicate) {
      alert('This timeslot already exists');
      return;
    }

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

