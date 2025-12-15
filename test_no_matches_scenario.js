// Test to reproduce the exact issue: partial matches not being shown
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== TEST: SCENARIO THAT CAUSES "NO MATCHES FOUND" ===');

// Scenario: What if we have participants but no overlapping times?
const noOverlapParticipants = [
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
        start: '6:00 PM', // No overlap with Alice's 6-8 AM (6 PM London = 1 PM New York)
        end: '8:00 PM'
      }
    ]
  }
];

console.log('Alice timeslot: Monday 6:00 AM - 8:00 AM (New York)');
console.log('Bob timeslot: Monday 6:00 PM - 8:00 PM (London)');
console.log('Expected: No overlap (1 PM vs 6 PM)');

const matches1 = findMatches(noOverlapParticipants);
console.log(`\nMatches found: ${matches1.length}`);

// Scenario: What if we have one participant with multiple slots and another with none that overlap?
const mixedParticipants = [
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
      },
      {
        day: 'Monday',
        start: '2:00 PM',
        end: '4:00 PM'
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
        start: '10:00 PM', // No overlap with either Alice slot
        end: '11:00 PM'
      }
    ]
  }
];

console.log('\n=== TEST: MULTIPLE SLOTS BUT NO OVERLAP ===');
console.log('Alice timeslots: Monday 6:00 AM - 8:00 AM, 2:00 PM - 4:00 PM (New York)');
console.log('Bob timeslot: Monday 10:00 PM - 11:00 PM (London)');
console.log('Expected: No overlap');

const matches2 = findMatches(mixedParticipants);
console.log(`\nMatches found: ${matches2.length}`);

// Scenario: What if we have a participant with incomplete data?
const incompleteParticipants = [
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

console.log('\n=== TEST: PARTICIPANT WITH MISSING DATA ===');
console.log('Alice: Complete data with Monday 6:00 AM - 8:00 AM');
console.log('Bob: Missing city, Monday 11:00 AM - 1:00 PM');
console.log('Expected: Should find overlap but Bob is filtered out');

const matches3 = findMatches(incompleteParticipants);
console.log(`\nMatches found: ${matches3.length}`);

const validParticipants = incompleteParticipants.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Valid participants after filtering: ${validParticipants.length}/2`);
console.log(`UI would show results: ${validParticipants.length >= 2}`);

// Let's check what the UI would display in each case
console.log('\n=== UI DISPLAY SIMULATION ===');

function simulateUIDisplay(participants, matches) {
  const validParticipants = participants.filter(p => 
    p.name && p.city && p.timeslots && p.timeslots.length > 0
  );
  
  const shouldShowResults = validParticipants.length >= 2;
  
  console.log(`Valid participants: ${validParticipants.length}`);
  console.log(`Should show results: ${shouldShowResults}`);
  console.log(`Matches found: ${matches.length}`);
  
  if (!shouldShowResults) {
    console.log('UI Display: "Add more participants and their available timeslots to find matching times"');
  } else if (matches.length === 0) {
    console.log('UI Display: "No matches found. Adjust timeslots to find overlapping availability."');
  } else {
    console.log('UI Display: Shows actual matches');
  }
  console.log('---');
}

console.log('\nScenario 1 (No overlap):');
simulateUIDisplay(noOverlapParticipants, matches1);

console.log('\nScenario 2 (Multiple slots, no overlap):');
simulateUIDisplay(mixedParticipants, matches2);

console.log('\nScenario 3 (Incomplete data):');
simulateUIDisplay(incompleteParticipants, matches3);