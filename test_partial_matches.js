// Test to identify the exact issue with partial matches not being displayed
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== TESTING PARTIAL MATCH DISPLAY ISSUE ===');

// Scenario: User has 2 time slots, but only 1 matches with another participant
// This should show the partial match but user reports "no matches found"

const participantsWithPartialMatch = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      {
        day: 'Monday',
        start: '6:00 AM', // This matches Bob
        end: '8:00 AM'
      },
      {
        day: 'Monday',
        start: '2:00 PM', // This does NOT match Bob
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
        start: '11:00 AM', // This overlaps with Alice's 6-8 AM slot
        end: '1:00 PM'
      }
    ]
  }
];

console.log('Alice has 2 timeslots:');
participantsWithPartialMatch[0].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nBob has 1 timeslot:');
participantsWithPartialMatch[1].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nExpected: Should show partial match (Alice available, Bob unavailable for 2nd slot)');

const matches = findMatches(participantsWithPartialMatch);
console.log(`\nMatches found: ${matches.length}`);

matches.forEach((match, index) => {
  console.log(`\nMatch ${index + 1}:`);
  console.log(`  Day: ${match.day}`);
  console.log(`  Match count: ${match.matchCount}/${match.totalCount}`);
  console.log(`  Available participants:`);
  match.available.forEach(person => {
    console.log(`    ${person.name}: ${person.originalStart} - ${person.originalEnd}`);
  });
  if (match.unavailable.length > 0) {
    console.log(`  Unavailable participants:`);
    match.unavailable.forEach(person => {
      console.log(`    ${person.name}: Not available`);
    });
  }
});

// Now test what the UI would display
const validParticipants = participantsWithPartialMatch.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log('\n=== UI VALIDATION CHECK ===');
console.log(`Valid participants: ${validParticipants.length}/2`);
console.log(`Should show results (>= 2 valid): ${validParticipants.length >= 2}`);

if (matches.length > 0) {
  console.log('✅ Matches found - UI should display them');
  console.log('✅ If user sees "no matches found", the issue is NOT in the matching logic');
  console.log('✅ The issue is likely in UI display or user expectation');
} else {
  console.log('❌ No matches found - this would explain user\'s issue');
}

// Let's test edge case: What if user has exactly 2 participants but one has invalid data?
console.log('\n=== EDGE CASE: INVALID PARTICIPANT ===');

const participantsWithInvalid = [
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
    city: '', // Missing city - invalid!
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

const matchesInvalid = findMatches(participantsWithInvalid);
const validParticipantsInvalid = participantsWithInvalid.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Valid participants: ${validParticipantsInvalid.length}/2`);
console.log(`Matches found: ${matchesInvalid.length}`);
console.log(`UI would show results: ${validParticipantsInvalid.length >= 2}`);

if (matchesInvalid.length > 0 && validParticipantsInvalid.length < 2) {
  console.log('🚨 ISSUE FOUND: Matches exist but UI won\'t show them due to validation!');
  console.log('🚨 This explains why user sees "no matches found"');
}