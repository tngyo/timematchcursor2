import { findMatches } from './src/lib/timeMatch.js';

console.log('=== TESTING DISPLAY FIX ===\n');

console.log('Scenario: User A - 9AM to 2PM, User B - 12PM to 4PM (both GMT+0)');
console.log('Expected: Should show both original availability AND overlap period\n');

const testParticipants = [
  {
    name: 'A',
    city: 'Auckland',
    timezone: 'Pacific/Auckland',
    offset: 0,
    timeslots: [{ day: 'Monday', start: '9:00 AM', end: '2:00 PM' }]
  },
  {
    name: 'B',
    city: 'Auckland',
    timezone: 'Pacific/Auckland',
    offset: 0,
    timeslots: [{ day: 'Monday', start: '12:00 PM', end: '4:00 PM' }]
  }
];

const matches = findMatches(testParticipants);

if (matches.length > 0) {
  const match = matches[0];
  console.log('Algorithm Results:');
  console.log(`- Match Type: ${match.matchCount === match.totalCount ? 'PERFECT MATCH' : 'PARTIAL MATCH'}`);
  console.log(`- Calculated Overlap: ${match.start} - ${match.end}`);
  console.log(`- Available Participants: ${match.available.map(p => p.name).join(', ')}`);
  
  console.log('\nFrontend Display Simulation:');
  console.log(`✅ ${match.day} - ${match.matchCount === match.totalCount ? 'PERFECT MATCH' : `${match.matchCount} OUT OF ${match.totalCount}`}`);
  console.log('Available times: Each participant\'s local time');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  match.available.forEach(person => {
    const display = `${person.name.padEnd(20)} (${person.city} GMT${person.offset >= 0 ? '+' : ''}${person.offset})    ${person.originalStart} - ${person.originalEnd} ✓ (Overlap: ${match.start} - ${match.end})`;
    console.log(display);
  });
  
  match.unavailable.forEach(person => {
    const display = `${person.name.padEnd(20)} (${person.city} GMT${person.offset >= 0 ? '+' : ''}${person.offset})    Not available ✗`;
    console.log(display);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
} else {
  console.log('❌ No matches found');
}