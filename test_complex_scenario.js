// Complex scenario test with 3+ users, multiple days, different time slots
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== COMPLEX SCENARIO: MULTI-USER, MULTI-DAY TEST ===');

// Create a complex scenario with 4 users from different timezones
const complexParticipants = [
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
        day: 'Tuesday',
        start: '2:00 PM',
        end: '4:00 PM'
      },
      {
        day: 'Wednesday',
        start: '10:00 AM',
        end: '12:00 PM'
      },
      {
        day: 'Friday',
        start: '8:00 AM',
        end: '10:00 AM'
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
        end: '4:00 PM' // Should overlap with Alice's Monday 9-11 AM (2 PM London = 9 AM NY)
      },
      {
        day: 'Tuesday',
        start: '7:00 PM',
        end: '9:00 PM' // Should overlap with Alice's Tuesday 2-4 PM (7 PM London = 2 PM NY)
      },
      {
        day: 'Thursday',
        start: '3:00 PM',
        end: '5:00 PM' // No overlap with Alice
      },
      {
        day: 'Friday',
        start: '1:00 PM',
        end: '3:00 PM' // Should overlap with Alice's Friday 8-10 AM (1 PM London = 8 AM NY)
      }
    ]
  },
  {
    name: 'Chen',
    city: 'Beijing',
    timezone: 'Asia/Shanghai',
    timezone_offset: 8,
    offset: 8,
    timeslots: [
      {
        day: 'Monday',
        start: '9:00 PM',
        end: '11:00 PM' // Should overlap with Alice's Monday 9-11 AM (9 PM Beijing = 9 AM NY)
      },
      {
        day: 'Wednesday',
        start: '6:00 PM',
        end: '8:00 PM' // Should overlap with Alice's Wednesday 10 AM-12 PM (6 PM Beijing = 6 AM NY - no overlap)
      },
      {
        day: 'Thursday',
        start: '10:00 PM',
        end: '11:00 PM' // No overlap with anyone
      },
      {
        day: 'Friday',
        start: '9:00 PM',
        end: '11:00 PM' // Should overlap with Alice's Friday 8-10 AM (9 PM Beijing = 9 AM NY)
      }
    ]
  },
  {
    name: 'Diana',
    city: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    timezone_offset: -8,
    offset: -8,
    timeslots: [
      {
        day: 'Monday',
        start: '6:00 AM',
        end: '8:00 AM' // Should overlap with Alice's Monday 9-11 AM (6 AM LA = 9 AM NY)
      },
      {
        day: 'Tuesday',
        start: '11:00 AM',
        end: '1:00 PM' // Should overlap with Alice's Tuesday 2-4 PM (11 AM LA = 2 PM NY)
      },
      {
        day: 'Wednesday',
        start: '7:00 AM',
        end: '9:00 AM' // Should overlap with Alice's Wednesday 10 AM-12 PM (7 AM LA = 10 AM NY)
      },
      {
        day: 'Friday',
        start: '5:00 AM',
        end: '7:00 AM' // Should overlap with Alice's Friday 8-10 AM (5 AM LA = 8 AM NY)
      }
    ]
  }
];

console.log('Participants:');
console.log('Alice (New York, UTC-5):');
complexParticipants[0].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nBob (London, UTC+0):');
complexParticipants[1].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nChen (Beijing, UTC+8):');
complexParticipants[2].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\nDiana (Los Angeles, UTC-8):');
complexParticipants[3].timeslots.forEach(slot => {
  console.log(`  ${slot.day} ${slot.start} - ${slot.end}`);
});

console.log('\n=== RUNNING MATCH ANALYSIS ===');

const matches = findMatches(complexParticipants);
console.log(`\nTotal matches found: ${matches.length}`);

// Analyze and display results
if (matches.length > 0) {
  matches.forEach((match, index) => {
    console.log(`\n--- MATCH ${index + 1} ---`);
    console.log(`Day: ${match.day}`);
    console.log(`Match Quality: ${match.matchCount}/${match.totalCount} participants available`);
    
    if (match.matchCount === match.totalCount) {
      console.log('🎯 PERFECT MATCH - All participants available!');
    } else {
      console.log(`⚠️  PARTIAL MATCH - ${match.matchCount} out of ${match.totalCount} available`);
    }
    
    console.log(`UTC Time: ${match.utcStart} - ${match.utcEnd}`);
    
    console.log('\nAvailable Participants:');
    match.available.forEach(person => {
      console.log(`  ✅ ${person.name} (${person.city})`);
      console.log(`     Original: ${person.originalStart} - ${person.originalEnd}`);
      console.log(`     Local overlap: ${person.localStartTime} - ${person.localEndTime}`);
    });
    
    if (match.unavailable.length > 0) {
      console.log('\nUnavailable Participants:');
      match.unavailable.forEach(person => {
        console.log(`  ❌ ${person.name} (${person.city}) - No overlapping slot`);
      });
    }
  });
} else {
  console.log('\nNo overlapping time slots found.');
}

// Summary analysis
console.log('\n=== SUMMARY ANALYSIS ===');

const validParticipants = complexParticipants.filter(p => 
  p.name && p.city && p.timeslots && p.timeslots.length > 0
);

console.log(`Total participants: ${validParticipants.length}`);
console.log(`Perfect matches (all participants): ${matches.filter(m => m.matchCount === m.totalCount).length}`);
console.log(`Partial matches: ${matches.filter(m => m.matchCount < m.totalCount).length}`);

// Day-by-day analysis
const dayStats = {};
matches.forEach(match => {
  if (!dayStats[match.day]) {
    dayStats[match.day] = { perfect: 0, partial: 0, totalParticipants: match.totalCount };
  }
  
  if (match.matchCount === match.totalCount) {
    dayStats[match.day].perfect++;
  } else {
    dayStats[match.day].partial++;
  }
});

console.log('\nDay-by-day match availability:');
Object.entries(dayStats).forEach(([day, stats]) => {
  console.log(`${day}: ${stats.perfect} perfect match(es), ${stats.partial} partial match(es)`);
});

// Best meeting recommendations
console.log('\n=== RECOMMENDATIONS ===');

const perfectMatches = matches.filter(m => m.matchCount === m.totalCount);
if (perfectMatches.length > 0) {
  console.log('🏆 BEST OPTIONS (Perfect matches with all participants):');
  perfectMatches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.day} at ${match.utcStart} - ${match.utcEnd} UTC`);
  });
} else {
  console.log('⚠️  No perfect matches found. Consider these partial options:');
  const bestPartial = matches.sort((a, b) => b.matchCount - a.matchCount)[0];
  if (bestPartial) {
    console.log(`Most inclusive: ${bestPartial.day} with ${bestPartial.matchCount}/${bestPartial.totalCount} participants`);
    console.log(`Time: ${bestPartial.utcStart} - ${bestPartial.utcEnd} UTC`);
  }
}

console.log('\n=== TEST COMPLETE ===');