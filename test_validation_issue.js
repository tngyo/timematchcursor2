// Test to understand validation issues
import { findMatches } from './src/lib/timeMatch.js';

// Test case 1: Valid participants
console.log('=== TEST 1: VALID PARTICIPANTS ===');
const validParticipants = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      {
        day: 'Monday',
        start: '6:00 AM',
        end: '8:00 AM'
      }
    ]
  },
  {
    name: 'Bob',
    city: 'London',
    timezone: 'Europe/London',
    timezone_offset: 0,
    offset: 0,
    timeslots: [
      {
        day: 'Monday',
        start: '11:00 AM',
        end: '1:00 PM'
      }
    ]
  }
];

// Simulate the validation logic
const validParticipantsFiltered = validParticipants.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Valid participants: ${validParticipantsFiltered.length}/2`);
console.log(`Should show results: ${validParticipantsFiltered.length >= 2}`);

const matches1 = findMatches(validParticipants);
console.log(`Matches found: ${matches1.length}`);

// Test case 2: Participant with empty timeslots
console.log('\n=== TEST 2: PARTICIPANT WITH EMPTY TIMESLOTS ===');
const participantsWithEmptySlots = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      {
        day: 'Monday',
        start: '6:00 AM',
        end: '8:00 AM'
      }
    ]
  },
  {
    name: 'Bob',
    city: 'London',
    timezone: 'Europe/London',
    timezone_offset: 0,
    offset: 0,
    timeslots: [] // Empty timeslots
  }
];

const validParticipantsFiltered2 = participantsWithEmptySlots.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Valid participants: ${validParticipantsFiltered2.length}/2`);
console.log(`Should show results: ${validParticipantsFiltered2.length >= 2}`);

const matches2 = findMatches(participantsWithEmptySlots);
console.log(`Matches found: ${matches2.length}`);

// Test case 3: Participant with missing data
console.log('\n=== TEST 3: PARTICIPANT WITH MISSING DATA ===');
const participantsWithMissingData = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      {
        day: 'Monday',
        start: '6:00 AM',
        end: '8:00 AM'
      }
    ]
  },
  {
    name: 'Bob',
    city: '', // Missing city
    timezone: 'Europe/London',
    timezone_offset: 0,
    offset: 0,
    timeslots: [
      {
        day: 'Monday',
        start: '11:00 AM',
        end: '1:00 PM'
      }
    ]
  }
];

const validParticipantsFiltered3 = participantsWithMissingData.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Valid participants: ${validParticipantsFiltered3.length}/2`);
console.log(`Should show results: ${validParticipantsFiltered3.length >= 2}`);

const matches3 = findMatches(participantsWithMissingData);
console.log(`Matches found: ${matches3.length}`);

console.log('\n=== CONCLUSION ===');
console.log('If matches.length > 0 but shouldShowResults = false,');
console.log('then the issue is in the UI validation logic, not the matching algorithm.');