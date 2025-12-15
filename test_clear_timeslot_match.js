// Test with clearer timeslot overlap scenario
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
        start: '11:00 AM',
        end: '1:00 PM'
      }
    ]
  }
];

console.log('=== TESTING CLEAR TIMESLOT OVERLAP ===\n');

console.log('Test Participants:');
testParticipants.forEach(p => {
  console.log(`${p.name} (${p.city}, GMT${p.offset >= 0 ? '+' : ''}${p.offset}):`);
  p.timeslots.forEach(slot => {
    console.log(`  ${slot.day}: ${slot.start} - ${slot.end}`);
  });
});

console.log('\n=== TIMEZONE ANALYSIS ===');
console.log('Alice timeslots in UTC:');
console.log('  6:00 AM - 8:00 AM New York (GMT-5) = 11:00 AM - 1:00 PM UTC');
console.log('  2:00 PM - 4:00 PM New York (GMT-5) = 7:00 PM - 9:00 PM UTC');
console.log('');
console.log('Bob timeslot in UTC:');
console.log('  11:00 AM - 1:00 PM London (GMT+0) = 11:00 AM - 1:00 PM UTC');
console.log('');
console.log('Expected overlap: Alice\'s first slot (11:00 AM - 1:00 PM UTC) with Bob\'s slot (11:00 AM - 1:00 PM UTC)');
console.log('Alice\'s second slot (7:00 PM - 9:00 PM UTC) should NOT overlap with Bob');

console.log('\n=== FINDING MATCHES ===');
const matches = findMatches(testParticipants);

console.log(`Total matches found: ${matches.length}`);

if (matches.length === 0) {
  console.log('❌ BUG: No matches found even though there should be a match!');
} else {
  matches.forEach((match, index) => {
    console.log(`\n--- Match ${index + 1} ---`);
    console.log(`Day: ${match.day}`);
    console.log(`Type: ${match.matchCount === match.totalCount ? 'PERFECT' : 'PARTIAL'}`);
    console.log(`Available: ${match.available.map(p => p.name).join(', ')}`);
    console.log(`Unavailable: ${match.unavailable.map(p => p.name).join(', ')}`);
    
    match.available.forEach(participant => {
      console.log(`  ${participant.name}: ${participant.originalStart} - ${participant.originalEnd}`);
      console.log(`    Local overlap: ${participant.localStartTime} - ${participant.localEndTime}`);
    });
  });
}