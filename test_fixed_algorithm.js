// Test the fix for the day assignment issue
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== TESTING THE FIX ===');

// Create a simple test that exposes the day assignment bug
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
        day: 'Tuesday',
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
        end: '4:00 PM'
      },
      {
        day: 'Tuesday',
        start: '7:00 PM',
        end: '9:00 PM'
      }
    ]
  }
];

console.log('Test participants:');
console.log('Alice: Monday 9-11 AM NY, Tuesday 2-4 PM NY');
console.log('Bob: Monday 2-4 PM London, Tuesday 7-9 PM London');
console.log('Expected: 2 matches (Monday + Tuesday)');

const matches = findMatches(testParticipants);
console.log(`\nMatches found: ${matches.length}`);

matches.forEach((match, index) => {
  console.log(`\nMatch ${index + 1}:`);
  console.log(`  Day: ${match.day}`);
  console.log(`  UTC: ${match.utcStart} - ${match.utcEnd}`);
  console.log(`  Available: ${match.available.length}/${match.totalCount}`);
  match.available.forEach(person => {
    console.log(`    ${person.name}: ${person.originalStart} - ${person.originalEnd} (${person.city})`);
  });
});

// Now test the complex scenario
console.log('\n=== COMPLEX SCENARIO RETEST ===');

const complexParticipants = [
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

console.log('\nComplex scenario results:');
const complexMatches = findMatches(complexParticipants);
console.log(`Total matches found: ${complexMatches.length}`);

complexMatches.forEach((match, index) => {
  console.log(`\nMatch ${index + 1}:`);
  console.log(`  Day: ${match.day}`);
  console.log(`  Match Quality: ${match.matchCount}/${match.totalCount}`);
  console.log(`  UTC Time: ${match.utcStart} - ${match.utcEnd}`);
  
  if (match.matchCount === match.totalCount) {
    console.log('  🎯 PERFECT MATCH!');
  } else {
    console.log('  ⚠️  PARTIAL MATCH');
  }
  
  console.log('  Available:');
  match.available.forEach(person => {
    console.log(`    ✅ ${person.name} (${person.city}): ${person.originalStart} - ${person.originalEnd}`);
  });
  
  if (match.unavailable.length > 0) {
    console.log('  Unavailable:');
    match.unavailable.forEach(person => {
      console.log(`    ❌ ${person.name} (${person.city})`);
    });
  }
});

// Summary
console.log('\n=== SUMMARY ===');
const perfectMatches = complexMatches.filter(m => m.matchCount === m.totalCount);
const partialMatches = complexMatches.filter(m => m.matchCount < m.totalCount);

console.log(`Perfect matches: ${perfectMatches.length}`);
console.log(`Partial matches: ${partialMatches.length}`);

if (perfectMatches.length > 0) {
  console.log('\n🏆 Perfect match days:');
  perfectMatches.forEach(match => {
    console.log(`  ${match.day} at ${match.utcStart} - ${match.utcEnd} UTC`);
  });
}

if (partialMatches.length > 0) {
  console.log('\n⚠️  Best partial match:');
  const bestPartial = partialMatches.sort((a, b) => b.matchCount - a.matchCount)[0];
  console.log(`  ${bestPartial.day} with ${bestPartial.matchCount}/${bestPartial.totalCount} participants`);
  console.log(`  Time: ${bestPartial.utcStart} - ${bestPartial.utcEnd} UTC`);
}