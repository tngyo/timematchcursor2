// Test with 4 random users in different timezones with random timeslots
import { findMatches } from './src/lib/timeMatch.js';

console.log('═══════════════════════════════════════════════════════════════');
console.log('TEST: 4 Random Users in Different Timezones');
console.log('═══════════════════════════════════════════════════════════════\n');

// Define 4 users with random timezones and timeslots
const participants = [
  {
    name: 'Sarah Chen',
    city: 'Tokyo',
    offset: +9,
    timeslots: [
      { day: 'Wednesday', start: '9:00 AM', end: '12:00 PM' },
      { day: 'Wednesday', start: '2:00 PM', end: '6:00 PM' },
      { day: 'Thursday', start: '10:00 AM', end: '3:00 PM' }
    ]
  },
  {
    name: 'Marcus Johnson',
    city: 'New York',
    offset: -5,
    timeslots: [
      { day: 'Tuesday', start: '7:00 PM', end: '11:00 PM' },
      { day: 'Wednesday', start: '6:00 AM', end: '9:00 AM' },
      { day: 'Wednesday', start: '8:00 PM', end: '11:00 PM' }
    ]
  },
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    offset: +5.5,
    timeslots: [
      { day: 'Wednesday', start: '8:30 AM', end: '11:30 AM' },
      { day: 'Wednesday', start: '4:00 PM', end: '8:00 PM' },
      { day: 'Thursday', start: '9:00 AM', end: '1:00 PM' }
    ]
  },
  {
    name: 'Emma Wilson',
    city: 'London',
    offset: 0,
    timeslots: [
      { day: 'Wednesday', start: '12:00 AM', end: '4:00 AM' },
      { day: 'Wednesday', start: '1:00 PM', end: '5:00 PM' },
      { day: 'Thursday', start: '2:00 AM', end: '5:00 AM' }
    ]
  }
];

console.log('📋 PARTICIPANT INPUT DATA:\n');
participants.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.name} (${p.city}, UTC${p.offset >= 0 ? '+' : ''}${p.offset})`);
  p.timeslots.forEach(slot => {
    console.log(`   ${slot.day}: ${slot.start} - ${slot.end}`);
  });
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('RUNNING MATCH ALGORITHM...\n');

const matches = findMatches(participants);

console.log(`Found ${matches.length} matching time slot(s)\n`);

if (matches.length === 0) {
  console.log('❌ NO MATCHES FOUND');
  console.log('\nAnalysis:');
  console.log('- The 4 participants have no overlapping availability');
  console.log('- Consider adjusting schedules or timezones for better alignment\n');
} else {
  matches.forEach((match, idx) => {
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`MATCH #${idx + 1} - ${match.day.toUpperCase()}`);
    console.log(`${'═'.repeat(65)}\n`);
    
    console.log(`Participants Available: ${match.available.length}`);
    console.log(`Match Quality: ${match.available.length === participants.length ? '🟢 PERFECT MATCH (All 4)' : '🟡 PARTIAL MATCH'}\n`);
    
    console.log('UTC Meeting Window:');
    console.log(`  ${match.utcStart} - ${match.utcEnd} UTC\n`);
    
    console.log('👥 AVAILABLE PARTICIPANTS:\n');
    match.available.forEach((person, i) => {
      console.log(`${i + 1}. ${person.name} (${person.city}, UTC${person.offset >= 0 ? '+' : ''}${person.offset})`);
      console.log(`   Local Time: ${person.localStartTime} - ${person.localEndTime}`);
      console.log(`   All Available Slots:`);
      if (person.allSlots && person.allSlots.length > 0) {
        person.allSlots.forEach(slot => {
          console.log(`     - ${slot.day}: ${slot.start} - ${slot.end}`);
        });
      } else {
        console.log(`     - ${person.originalDay}: ${person.originalStart} - ${person.originalEnd}`);
      }
      console.log('');
    });
    
    if (match.unavailable && match.unavailable.length > 0) {
      console.log('❌ UNAVAILABLE PARTICIPANTS:\n');
      match.unavailable.forEach((person, i) => {
        console.log(`${i + 1}. ${person.name} (${person.city})`);
        console.log(`   Reason: No availability during this time window\n`);
      });
    }
  });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('TEST COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Export for documentation
export { participants, matches };
