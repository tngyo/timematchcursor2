// Test to reproduce the multiple timeslots issue
import { findMatches } from './src/lib/timeMatch.js';

const testParticipants = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      {
        day: 'Monday',
        start: '9:00 AM',
        end: '11:00 AM'
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
        start: '2:00 PM',
        end: '6:00 PM'
      }
    ]
  }
];

console.log('=== TESTING MULTIPLE TIMESLOTS ISSUE ===\n');

console.log('Test Participants:');
testParticipants.forEach(p => {
  console.log(`${p.name} (${p.city}):`);
  p.timeslots.forEach(slot => {
    console.log(`  ${slot.day}: ${slot.start} - ${slot.end}`);
  });
});

console.log('\n=== ANALYSIS ===');
console.log('Expected: Bob (2PM-6PM London) should overlap with Alice\'s second slot (2PM-4PM NY = 7PM-9PM UTC = 7PM-9PM London)');
console.log('Alice has 2 timeslots, Bob has 1 timeslot that should match with Alice\'s second slot');

console.log('\n=== FINDING MATCHES ===');
const matches = findMatches(testParticipants);

console.log(`Total matches found: ${matches.length}`);

if (matches.length === 0) {
  console.log('❌ BUG REPRODUCED: No matches found even though there should be a match!');
  console.log('Alice\'s 2PM-4PM slot should overlap with Bob\'s 2PM-6PM slot');
} else {
  matches.forEach((match, index) => {
    console.log(`\n--- Match ${index + 1} ---`);
    console.log(`Day: ${match.day}`);
    console.log(`Type: ${match.matchCount === match.totalCount ? 'PERFECT' : 'PARTIAL'}`);
    console.log(`Available: ${match.available.map(p => p.name).join(', ')}`);
    
    match.available.forEach(participant => {
      console.log(`  ${participant.name}: ${participant.originalStart} - ${participant.originalEnd}`);
      console.log(`    Local overlap: ${participant.localStartTime} - ${participant.localEndTime}`);
    });
  });
}