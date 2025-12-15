<script>
  import { cities, timezones, getOffsetLabel } from '../lib/timezones.js';
  
  let { participant, onUpdate } = $props();
  
  let inputMethod = $state('search'); // 'search', 'city', 'timezone'
  let searchQuery = $state('');
  let selectedCity = $state('');
  let selectedTimezone = $state('');
  
  const filteredCities = $derived(
    searchQuery.length > 0
      ? cities.filter(c => 
          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : []
  );
  
  function selectCity(city) {
    selectedCity = city.city;
    searchQuery = '';
    updateParticipant(city.city, city.country, city.tz, city.offset);
  }
  
  function handleCitySelect() {
    const city = cities.find(c => `${c.city}, ${c.country}` === selectedCity);
    if (city) {
      updateParticipant(city.city, city.country, city.tz, city.offset);
    }
  }
  
  function handleTimezoneSelect() {
    const tz = timezones.find(t => t.tz === selectedTimezone);
    if (tz) {
      updateParticipant(tz.city, tz.country, tz.tz, tz.offset);
    }
  }
  
  function updateParticipant(city, country, tz, offset) {
    onUpdate({
      ...participant,
      city: `${city}, ${country}`,
      timezone: tz,
      offset: offset
    });
  }
</script>

<div class="box">
  <div class="field">
    <p class="label">Input Method</p>
    <div class="control">
      <div class="buttons has-addons">
        <button 
          class="button" 
          class:is-active={inputMethod === 'search'}
          onclick={(e) => { e.preventDefault(); inputMethod = 'search'; }}
        >
          Search
        </button>
        <button 
          class="button" 
          class:is-active={inputMethod === 'city'}
          onclick={(e) => { e.preventDefault(); inputMethod = 'city'; }}
        >
          City Dropdown
        </button>
        <button 
          class="button" 
          class:is-active={inputMethod === 'timezone'}
          onclick={(e) => { e.preventDefault(); inputMethod = 'timezone'; }}
        >
          Timezone Dropdown
        </button>
      </div>
    </div>
  </div>

  {#if inputMethod === 'search'}
    <div class="field">
      <label class="label" for="search-city-{participant.name || 'new'}">Search City/Country</label>
      <div class="control">
        <input 
          id="search-city-{participant.name || 'new'}"
          class="input" 
          type="text" 
          placeholder="Type to search..."
          bind:value={searchQuery}
        />
      </div>
      {#if filteredCities.length > 0}
        <div class="dropdown is-active" style="width: 100%;">
          <div class="dropdown-menu" style="width: 100%;">
            <div class="dropdown-content">
              {#each filteredCities as city}
                <button 
                  type="button"
                  class="dropdown-item" 
                  onclick={(e) => { e.preventDefault(); selectCity(city); }}
                >
                  {city.city}, {city.country} ({getOffsetLabel(city.offset)})
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if inputMethod === 'city'}
    <div class="field">
      <label class="label" for="select-city-{participant.name || 'new'}">Select City</label>
      <div class="control">
        <div class="select is-fullwidth">
          <select id="select-city-{participant.name || 'new'}" bind:value={selectedCity} onchange={handleCitySelect}>
            <option value="">Choose a city...</option>
            {#each cities as city}
              <option value="{city.city}, {city.country}">
                {city.city}, {city.country} ({getOffsetLabel(city.offset)})
              </option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  {/if}

  {#if inputMethod === 'timezone'}
    <div class="field">
      <label class="label" for="select-timezone-{participant.name || 'new'}">Select Timezone</label>
      <div class="control">
        <div class="select is-fullwidth">
          <select id="select-timezone-{participant.name || 'new'}" bind:value={selectedTimezone} onchange={handleTimezoneSelect}>
            <option value="">Choose a timezone...</option>
            {#each timezones as tz}
              <option value={tz.tz}>
                {tz.city}, {tz.country} ({tz.label})
              </option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  {/if}

  {#if participant.city}
    <div class="notification is-info is-light mt-4">
      <strong>Selected:</strong> {participant.city} ({getOffsetLabel(participant.offset)})
    </div>
  {/if}
</div>

