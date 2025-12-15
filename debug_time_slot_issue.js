// Test to reproduce the specific time slot issue mentioned by user
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== TEST: TWO TIMESLOTS WITH ONE MATCH ===');

// Scenario: One participant has 2 time slots, but only one matches with another participant
const participantsWithTwoSlots = [
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
        start: '11:00 AM', // This should overlap with Alice's 6-8 AM slot (11 AM London = 6 AM New York)
        end: '1:00 PM'
      }
    ]
  }
];

console.log('Alice timeslots:');
participantsWithTwoSlots[0].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nBob timeslots:');
participantsWithTwoSlots[1].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

const matches = findMatches(participantsWithTwoSlots);
console.log(`\nMatches found: ${matches.length}`);

if (matches.length > 0) {
  console.log('\nMatch details:');
  matches.forEach((match, index) => {
    console.log(`\nMatch ${index + 1}:`);
    console.log(`  Day: ${match.day}`);
    console.log(`  UTC Start: ${match.utcStart}`);
    console.log(`  UTC End: ${match.utcEnd}`);
    console.log(`  Available: ${match.available.length}/${match.totalCount}`);
    match.available.forEach(person => {
      console.log(`    ${person.name}: ${person.originalStart} - ${person.originalEnd} (Overlap: ${person.localStartTime} - ${person.localEndTime})`);
    });
    if (match.unavailable.length > 0) {
      console.log(`  Unavailable: ${match.unavailable.length}`);
      match.unavailable.forEach(person => {
        console.log(`    ${person.name}: Not available`);
      });
    }
  });
}

// Now test what the UI would show
const validParticipants = participantsWithTwoSlots.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log('\n=== UI VALIDATION CHECK ===');
console.log(`Valid participants: ${validParticipants.length}/2`);
console.log(`Should show results (validParticipants.length >= 2): ${validParticipants.length >= 2}`);

if (matches.length > 0 && validParticipants.length >= 2) {
  console.log('✅ UI should show matches');
} else if (matches.length > 0) {
  console.log('❌ ISSUE: Matches found but UI would not show them due to validation');
} else {
  console.log('❌ No matches found');
}