// Test to validate the fix for partial matches not being displayed
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== VALIDATING THE FIX ===');

// Simulate the exact scenario that was causing the issue
const problematicScenario = [
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
    city: '', // Missing city - this was causing the issue
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

console.log('Scenario: Alice has 2 slots, Bob has missing city but 1 overlapping slot');
console.log('BEFORE FIX: Would show "no matches found" due to validation');
console.log('AFTER FIX: Should show partial matches');

const matches = findMatches(problematicScenario);
const validParticipants = problematicScenario.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

// OLD logic (problematic)
const oldShouldShowResults = validParticipants.length >= 2;

// NEW logic (fixed)
const newShouldShowResults = validParticipants.length >= 2 || matches.length > 0;

console.log('\nResults:');
console.log(`Matches found: ${matches.length}`);
console.log(`Valid participants: ${validParticipants.length}/2`);
console.log(`OLD logic (validParticipants.length >= 2): ${oldShouldShowResults}`);
console.log(`NEW logic (validParticipants.length >= 2 || matches.length > 0): ${newShouldShowResults}`);

if (matches.length > 0) {
  console.log('\nMatches details:');
  matches.forEach((match, index) => {
    console.log(`\nMatch ${index + 1}:`);
    console.log(`  Available: ${match.available.length}/${match.totalCount}`);
    match.available.forEach(person => {
      console.log(`    ${person.name}: ${person.originalStart} - ${person.originalEnd}`);
    });
    if (match.unavailable.length > 0) {
      match.unavailable.forEach(person => {
        console.log(`    ${person.name}: Not available (${person.city || 'Missing city'})`);
      });
    }
  });
}

console.log('\n=== FIX VALIDATION ===');
if (newShouldShowResults && matches.length > 0) {
  console.log('✅ SUCCESS: Fix allows showing matches even with invalid participants');
  console.log('✅ Users will now see partial matches instead of "no matches found"');
} else if (oldShouldShowResults && !newShouldShowResults) {
  console.log('❌ ISSUE: Fix broke existing functionality');
} else {
  console.log('⚠️  UNEXPECTED: Check the test scenario');
}

// Test edge case: truly no valid participants
console.log('\n=== EDGE CASE: NO VALID PARTICIPANTS ===');

const noValidParticipants = [
  {
    name: 'Alice',
    city: '',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: []
  }
];

const matchesEmpty = findMatches(noValidParticipants);
const validParticipantsEmpty = noValidParticipants.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

const newShouldShowResultsEmpty = validParticipantsEmpty.length >= 2 || matchesEmpty.length > 0;

console.log(`Valid participants: ${validParticipantsEmpty.length}`);
console.log(`Matches found: ${matchesEmpty.length}`);
console.log(`Should show results: ${newShouldShowResultsEmpty}`);

if (!newShouldShowResultsEmpty && matchesEmpty.length === 0) {
  console.log('✅ CORRECT: No results shown when there are no valid participants or matches');
} else {
  console.log('❌ ISSUE: Edge case not handled correctly');
}