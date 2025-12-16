// Debug the findMatches algorithm step by step
import { findMatches, timeRangeToUTC, rangesOverlap } from './src/lib/timeMatch.js';

console.log('=== DEBUGGING findMatches ALGORITHM ===');

// Use a simplified version to isolate the issue
const debugParticipants = [
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
        end: '4:00 PM'
      }
    ]
  }
];

console.log('Simple 2-participant Monday test:');
console.log('Alice: Monday 9:00 AM - 11:00 AM NY (UTC-5)');
console.log('Bob: Monday 2:00 PM - 4:00 PM London (UTC+0)');
console.log('Expected: Perfect match');

const simpleMatches = findMatches(debugParticipants);
console.log(`\nMatches found: ${simpleMatches.length}`);

if (simpleMatches.length > 0) {
  simpleMatches.forEach((match, index) => {
    console.log(`\nMatch ${index + 1}:`);
    console.log(`  Day: ${match.day}`);
    console.log(`  UTC: ${match.utcStart} - ${match.utcEnd}`);
    console.log(`  Available: ${match.available.length}/${match.totalCount}`);
  });
}

// Now test the problematic Monday scenario step by step
console.log('\n=== STEP-BY-STEP MONDAY ANALYSIS ===');

const mondayParticipants = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [{ day: 'Monday', start: '9:00 AM', end: '11:00 AM' }]
  },
  {
    name: 'Bob',
    city: 'London',
    timezone: 'Europe/London',
    timezone_offset: 0,
    offset: 0,
    timeslots: [{ day: 'Monday', start: '2:00 PM', end: '4:00 PM' }]
  },
  {
    name: 'Chen',
    city: 'Beijing',
    timezone: 'Asia/Shanghai',
    timezone_offset: 8,
    offset: 8,
    timeslots: [{ day: 'Monday', start: '9:00 PM', end: '11:00 PM' }]
  }
];

console.log('\nStep 1: Convert all times to UTC');
const allSlots = [];
mondayParticipants.forEach(participant => {
  const offset = participant.offset || participant.timezone_offset || 0;
  participant.timeslots.forEach(slot => {
    const utcRange = timeRangeToUTC(slot.start, slot.end, offset, slot.day);
    allSlots.push({
      slot,
      participant,
      utcRange
    });
    console.log(`${participant.name}: ${slot.start}-${slot.end} -> UTC ${utcRange.start}-${utcRange.end}`);
  });
});

console.log('\nStep 2: Check pairwise overlaps');
for (let i = 0; i < allSlots.length; i++) {
  for (let j = i + 1; j < allSlots.length; j++) {
    const overlap = rangesOverlap(allSlots[i].utcRange, allSlots[j].utcRange);
    console.log(`${allSlots[i].participant.name} vs ${allSlots[j].participant.name}: ${overlap}`);
  }
}

console.log('\nStep 3: Run findMatches on Monday participants');
const mondayMatches = findMatches(mondayParticipants);
console.log(`Matches found: ${mondayMatches.length}`);

mondayMatches.forEach((match, index) => {
  console.log(`\nMatch ${index + 1}:`);
  console.log(`  Day: ${match.day}`);
  console.log(`  UTC: ${match.utcStart} - ${match.utcEnd}`);
  console.log(`  Available: ${match.available.length}/${match.totalCount}`);
  match.available.forEach(person => {
    console.log(`    ${person.name}: ${person.originalStart} - ${person.originalEnd}`);
  });
});

console.log('\n=== COMPARISON: FULL COMPLEX SCENARIO ===');
const fullComplex = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    timezone_offset: -5,
    offset: -5,
    timeslots: [
      { day: 'Monday', start: '9:00 AM', end: '11:00 AM' },
      { day: 'Tuesday', start: '2:00 PM', end: '4:00 PM' },
      { day: 'Wednesday', start: '10:00 AM', end: '12:00 PM' },
      { day: 'Friday', start: '8:00 AM', end: '10:00 AM' }
    ]
  },
  {
    name: 'Bob',
    city: 'London',
    timezone: 'Europe/London',
    timezone_offset: 0,
    offset: 0,
    timeslots: [
      { day: 'Monday', start: '2:00 PM', end: '4:00 PM' },
      { day: 'Tuesday', start: '7:00 PM', end: '9:00 PM' },
      { day: 'Thursday', start: '3:00 PM', end: '5:00 PM' },
      { day: 'Friday', start: '1:00 PM', end: '3:00 PM' }
    ]
  },
  {
    name: 'Chen',
    city: 'Beijing',
    timezone: 'Asia/Shanghai',
    timezone_offset: 8,
    offset: 8,
    timeslots: [
      { day: 'Monday', start: '9:00 PM', end: '11:00 PM' },
      { day: 'Wednesday', start: '6:00 PM', end: '8:00 PM' },
      { day: 'Thursday', start: '10:00 PM', end: '11:00 PM' },
      { day: 'Friday', start: '9:00 PM', end: '11:00 PM' }
    ]
  },
  {
    name: 'Diana',
    city: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    timezone_offset: -8,
    offset: -8,
    timeslots: [
      { day: 'Monday', start: '6:00 AM', end: '8:00 AM' },
      { day: 'Tuesday', start: '11:00 AM', end: '1:00 PM' },
      { day: 'Wednesday', start: '7:00 AM', end: '9:00 AM' },
      { day: 'Friday', start: '5:00 AM', end: '7:00 AM' }
    ]
  }
];

const fullMatches = findMatches(fullComplex);
console.log(`Full complex scenario matches: ${fullMatches.length}`);

fullMatches.forEach((match, index) => {
  console.log(`\nMatch ${index + 1}:`);
  console.log(`  Day: ${match.day}`);
  console.log(`  Available: ${match.available.length}/${match.totalCount}`);
  console.log(`  UTC: ${match.utcStart} - ${match.utcEnd}`);
});