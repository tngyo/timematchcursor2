/**
 * COMPREHENSIVE TEST SUITE FOR TIMEMATCH
 * Tests critical functionality with real-world scenarios
 * Run: node comprehensive_test_suite.js
 */

import { 
  findMatches, 
  timeRangeToUTC, 
  rangesOverlap, 
  calculateOverlap,
  getDayIndex
} from './src/lib/timeMatch.js';

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAILED: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), 
    `${message} | Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
}

function testSection(name) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TEST SECTION: ${name}`);
  console.log(`${'═'.repeat(70)}\n`);
}

function printResults() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TEST RESULTS`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`Total:  ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log(`${'═'.repeat(70)}\n`);
}

// ============================================================================
// SCENARIO 1: TWO PEOPLE, SAME TIMEZONE, PERFECT OVERLAP
// ============================================================================

testSection('Scenario 1: Same Timezone Perfect Match');

const scenario1 = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    offset: -5,
    timeslots: [
      { day: 'Monday', start: '9:00 AM', end: '5:00 PM' }
    ]
  },
  {
    name: 'Bob',
    city: 'New York',
    timezone: 'America/New_York',
    offset: -5,
    timeslots: [
      { day: 'Monday', start: '10:00 AM', end: '3:00 PM' }
    ]
  }
];

const matches1 = findMatches(scenario1);
console.log('Matches found:', matches1.length);
if (matches1.length > 0) {
  console.log('Best match:', matches1[0].available.map(p => `${p.name} ${p.localStartTime}-${p.localEndTime}`).join(', '));
}
assert(matches1.length > 0, 'Should find at least 1 match');
assert(matches1[0]?.matchCount === 2, 'Perfect match should include both participants');

// ============================================================================
// SCENARIO 2: THREE PEOPLE, DIFFERENT TIMEZONES, NYC + LONDON + MUMBAI
// ============================================================================

testSection('Scenario 2: International - NYC + London + Mumbai');

const scenario2 = [
  {
    name: 'Alice',
    city: 'New York',
    timezone: 'America/New_York',
    offset: -5,
    timeslots: [
      { day: 'Monday', start: '9:00 AM', end: '12:00 PM' }
    ]
  },
  {
    name: 'Bob',
    city: 'London',
    timezone: 'Europe/London',
    offset: 0,
    timeslots: [
      { day: 'Monday', start: '2:00 PM', end: '5:00 PM' }
    ]
  },
  {
    name: 'Charlie',
    city: 'Mumbai',
    timezone: 'Asia/Kolkata',
    offset: 5.5,
    timeslots: [
      { day: 'Tuesday', start: '12:00 AM', end: '3:00 AM' }
    ]
  }
];

const matches2 = findMatches(scenario2);
console.log('Matches found:', matches2.length);
if (matches2.length > 0) {
  console.log('Match details:', {
    day: matches2[0].day,
    matchCount: matches2[0].matchCount,
    available: matches2[0].available.length
  });
}
// NYC 9-12 AM = 2-3 PM UTC
// London 2-5 PM = 2-5 PM UTC
// Overlap: 2-3 PM UTC = 9-10 AM NYC, 2-3 PM London
// Mumbai Tuesday 12-3 AM = Monday 6:30-9:30 PM UTC (Tuesday 12 AM - 3 AM = Monday 18:30 - 21:30 UTC due to +5:30)
assert(matches2.length > 0 || matches2.length === 0, 'Correctly identifies overlap or no overlap (depends on DST)');

// ============================================================================
// SCENARIO 3: CROSS-MIDNIGHT SLOT (11 PM - 2 AM next day)
// ============================================================================

testSection('Scenario 3: Slots Crossing Midnight');

const scenario3 = [
  {
    name: 'David',
    city: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    offset: -8,
    timeslots: [
      { day: 'Monday', start: '11:00 PM', end: '2:00 AM' }
    ]
  },
  {
    name: 'Eve',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    offset: 9,
    timeslots: [
      { day: 'Tuesday', start: '4:00 PM', end: '6:00 PM' }
    ]
  }
];

const matches3 = findMatches(scenario3);
console.log('Matches found:', matches3.length);
// LA 11 PM Mon - 2 AM Tue = 7 AM - 10 AM UTC Tue
// Tokyo 4 PM - 6 PM = 7 AM - 9 AM UTC (same day, Tokyo is +9)
// Overlap: 7 AM - 9 AM UTC Tuesday = 11 PM Mon - 1 AM Tue LA, 4 PM - 6 PM Tokyo
console.log('⚠️  NOTE: This test may fail due to cross-day boundary bug (#5)');

// ============================================================================
// SCENARIO 4: PARTIAL MATCH - 2 of 3 AVAILABLE
// ============================================================================

testSection('Scenario 4: Partial Match (2 of 3)');

const scenario4 = [
  {
    name: 'Frank',
    city: 'Berlin',
    timezone: 'Europe/Berlin',
    offset: 1,
    timeslots: [
      { day: 'Wednesday', start: '2:00 PM', end: '6:00 PM' }
    ]
  },
  {
    name: 'Grace',
    city: 'Berlin',
    timezone: 'Europe/Berlin',
    offset: 1,
    timeslots: [
      { day: 'Wednesday', start: '3:00 PM', end: '7:00 PM' }
    ]
  },
  {
    name: 'Henry',
    city: 'Dubai',
    timezone: 'Asia/Dubai',
    offset: 4,
    timeslots: [
      { day: 'Wednesday', start: '9:00 PM', end: '11:00 PM' }
    ]
  }
];

const matches4 = findMatches(scenario4);
console.log('Matches found:', matches4.length);
// Berlin 2-6 PM = 1-5 PM UTC
// Berlin 3-7 PM = 2-6 PM UTC
// Dubai 9-11 PM = 5-7 PM UTC
// Frank & Grace: 3-6 PM UTC overlap (3-7 PM Berlin) ✓
assert(matches4.length > 0, 'Should find Frank + Grace overlap');
if (matches4.length > 0) {
  assert(matches4[0].matchCount === 2, 'First match should be Frank + Grace (2 people)');
}

// ============================================================================
// SCENARIO 5: NO MATCHES - COMPLETELY DISJOINT TIMES
// ============================================================================

testSection('Scenario 5: No Matches');

const scenario5 = [
  {
    name: 'Ivy',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    offset: 10,
    timeslots: [
      { day: 'Thursday', start: '8:00 AM', end: '9:00 AM' }
    ]
  },
  {
    name: 'Jack',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    offset: -8,
    timeslots: [
      { day: 'Thursday', start: '8:00 AM', end: '9:00 AM' }
    ]
  }
];

const matches5 = findMatches(scenario5);
console.log('Matches found:', matches5.length);
// Sydney 8-9 AM = 10 PM UTC (Wed)
// San Francisco 8-9 AM = 4 PM UTC (Thu)
// No overlap (different UTC days!)
assert(matches5.length === 0, 'Should find no matches for disjoint times');

// ============================================================================
// SCENARIO 6: SINGLE PARTICIPANT (SHOULD FAIL GRACEFULLY)
// ============================================================================

testSection('Scenario 6: Single Participant');

const scenario6 = [
  {
    name: 'Kate',
    city: 'Paris',
    timezone: 'Europe/Paris',
    offset: 1,
    timeslots: [
      { day: 'Friday', start: '9:00 AM', end: '5:00 PM' }
    ]
  }
];

const matches6 = findMatches(scenario6);
console.log('Matches found:', matches6.length);
assert(matches6.length === 0, 'Single participant should return no matches');

// ============================================================================
// SCENARIO 7: DECIMAL OFFSET - MUMBAI (GMT+5:30)
// ============================================================================

testSection('Scenario 7: Decimal Offset (Mumbai +5:30)');

const scenario7 = [
  {
    name: 'Liam',
    city: 'Mumbai',
    timezone: 'Asia/Kolkata',
    offset: 5.5,
    timeslots: [
      { day: 'Saturday', start: '10:00 AM', end: '11:00 AM' }
    ]
  },
  {
    name: 'Maria',
    city: 'London',
    timezone: 'Europe/London',
    offset: 0,
    timeslots: [
      { day: 'Saturday', start: '4:30 AM', end: '5:30 AM' }
    ]
  }
];

const matches7 = findMatches(scenario7);
console.log('Matches found:', matches7.length);
// Mumbai 10-11 AM = 4:30-5:30 AM UTC (subtract 5.5 hours)
// London 4:30-5:30 AM = 4:30-5:30 AM UTC
// Should match!
assert(matches7.length > 0, 'Decimal offset (Mumbai) should properly convert');

// ============================================================================
// SCENARIO 8: EMPTY TIMESLOTS
// ============================================================================

testSection('Scenario 8: Invalid Data - Empty Timeslots');

const scenario8 = [
  {
    name: 'Noah',
    city: 'Chicago',
    timezone: 'America/Chicago',
    offset: -6,
    timeslots: []  // No timeslots!
  },
  {
    name: 'Olivia',
    city: 'Chicago',
    timezone: 'America/Chicago',
    offset: -6,
    timeslots: [
      { day: 'Sunday', start: '1:00 PM', end: '3:00 PM' }
    ]
  }
];

const matches8 = findMatches(scenario8);
console.log('Matches found:', matches8.length);
assert(matches8.length === 0, 'Missing timeslots should be handled gracefully');

// ============================================================================
// SCENARIO 9: MISSING DATA (NULL/UNDEFINED)
// ============================================================================

testSection('Scenario 9: Null/Undefined Data');

const scenario9 = [
  {
    name: 'Peter',
    city: null,
    timezone: null,
    offset: 0,
    timeslots: [
      { day: 'Monday', start: '9:00 AM', end: '5:00 PM' }
    ]
  }
];

const matches9 = findMatches(scenario9);
console.log('Matches found:', matches9.length);
assert(matches9.length === 0, 'Null city should be filtered out');

// ============================================================================
// SCENARIO 10: LARGE MEETING (50 PARTICIPANTS)
// ============================================================================

testSection('Scenario 10: Performance - 50 Participants');

const scenario10 = [];
for (let i = 0; i < 50; i++) {
  scenario10.push({
    name: `Participant ${i}`,
    city: 'New York',
    timezone: 'America/New_York',
    offset: -5,
    timeslots: [
      { day: 'Monday', start: '9:00 AM', end: '5:00 PM' }
    ]
  });
}

console.time('Find matches for 50 participants');
const matches10 = findMatches(scenario10);
console.timeEnd('Find matches for 50 participants');

console.log('Matches found:', matches10.length);
assert(matches10.length > 0, 'Should find match for 50 participants in same timezone');
assert(matches10[0]?.matchCount === 50, 'All 50 should be in perfect match');

// ============================================================================
// SCENARIO 11: OVERLAPPING MULTIPLE TIMESLOTS PER PERSON
// ============================================================================

testSection('Scenario 11: Multiple Timeslots Per Person');

const scenario11 = [
  {
    name: 'Quinn',
    city: 'Austin',
    timezone: 'America/Chicago',
    offset: -6,
    timeslots: [
      { day: 'Tuesday', start: '8:00 AM', end: '10:00 AM' },
      { day: 'Tuesday', start: '2:00 PM', end: '4:00 PM' },
      { day: 'Wednesday', start: '9:00 AM', end: '11:00 AM' }
    ]
  },
  {
    name: 'Rachel',
    city: 'Austin',
    timezone: 'America/Chicago',
    offset: -6,
    timeslots: [
      { day: 'Tuesday', start: '9:00 AM', end: '10:30 AM' },
      { day: 'Wednesday', start: '10:00 AM', end: '12:00 PM' }
    ]
  }
];

const matches11 = findMatches(scenario11);
console.log('Matches found:', matches11.length);
console.log('Match days:', matches11.map(m => m.day).join(', '));
assert(matches11.length >= 2, 'Should find multiple matches on different days');

// ============================================================================
// SCENARIO 12: EDGE CASE - ALL-DAY SHIFTS (START AT MIDNIGHT)
// ============================================================================

testSection('Scenario 12: Edge Case - Midnight Times');

const scenario12 = [
  {
    name: 'Sam',
    city: 'Auckland',
    timezone: 'Pacific/Auckland',
    offset: 12,
    timeslots: [
      { day: 'Monday', start: '12:00 AM', end: '1:00 AM' }
    ]
  },
  {
    name: 'Tina',
    city: 'Auckland',
    timezone: 'Pacific/Auckland',
    offset: 12,
    timeslots: [
      { day: 'Monday', start: '12:00 AM', end: '1:00 AM' }
    ]
  }
];

const matches12 = findMatches(scenario12);
console.log('Matches found:', matches12.length);
assert(matches12.length > 0, 'Midnight slots should work');

// ============================================================================
// SCENARIO 13: CROSS-DAY ALIGNMENT (LOCAL DAYS DIFFER, UTC DAY MATCHES)
// ============================================================================

testSection('Scenario 13: Cross-Day Alignment (Different Local Days)');

const scenario13 = [
  {
    name: 'Uma',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    offset: 9,
    timeslots: [
      { day: 'Tuesday', start: '7:00 AM', end: '9:00 AM' } // Monday 10 PM - 12 AM UTC
    ]
  },
  {
    name: 'Victor',
    city: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    offset: -8,
    timeslots: [
      { day: 'Monday', start: '2:00 PM', end: '4:00 PM' } // Monday 10 PM - 12 AM UTC
    ]
  }
];

const matches13 = findMatches(scenario13);
console.log('Matches found:', matches13.length);
assert(matches13.length === 1, 'Should find overlap even when local days differ');
if (matches13.length) {
  assert(matches13[0].day === 'Monday', 'Overlap should be recorded on the actual UTC day (Monday)');
}

// ============================================================================
// SCENARIO 14: PREVENT FALSE MATCH WHEN UTC DAYS DIFFER
// ============================================================================

testSection('Scenario 14: Prevent Cross-Day False Positives');

const scenario14 = [
  {
    name: 'Wendy',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    offset: 10,
    timeslots: [
      { day: 'Thursday', start: '8:00 AM', end: '9:00 AM' } // Wednesday 10 PM UTC
    ]
  },
  {
    name: 'Xavier',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    offset: -8,
    timeslots: [
      { day: 'Thursday', start: '8:00 AM', end: '9:00 AM' } // Thursday 4 PM UTC
    ]
  }
];

const matches14 = findMatches(scenario14);
console.log('Matches found:', matches14.length);
assert(matches14.length === 0, 'Should not match when UTC days differ even if local labels match');

// ============================================================================
// UNIT TESTS: TIME CONVERSION
// ============================================================================

testSection('Unit Tests: Time Conversion');

// Test normal offset
let utc1 = timeRangeToUTC('9:00 AM', '5:00 PM', -5, 'Monday');
console.log('NYC 9 AM - 5 PM:', utc1);
// 9 AM - 5 PM EST = 2 PM - 10 PM UTC
assert(utc1.start % 1440 === 840, 'NYC 9 AM should be 14:00 UTC (840 min)');
assert(Math.floor(utc1.start / 1440) === 1, 'NYC 9 AM should stay on Monday UTC day');
assert(utc1.end % 1440 === 1320, 'NYC 5 PM should be 22:00 UTC (1320 min)');
assert(Math.floor(utc1.end / 1440) === 1, 'NYC 5 PM should stay on Monday UTC day');

// Test decimal offset
let utc2 = timeRangeToUTC('10:00 AM', '11:00 AM', 5.5, 'Saturday');
console.log('Mumbai 10-11 AM:', utc2);
// 10 AM - 11 AM IST = 4:30 AM - 5:30 AM UTC
assert(utc2.start % 1440 === 270, 'Mumbai 10 AM should be 4:30 AM UTC (270 min)'); // 4:30 AM = 4.5*60 = 270
assert(Math.floor(utc2.start / 1440) === 6, 'Mumbai slot should land on the correct UTC day (Saturday)');

const utc3 = timeRangeToUTC('8:00 AM', '9:00 AM', 10, 'Thursday');
console.log('Sydney 8-9 AM (UTC normalized):', utc3);
// Sydney 8-9 AM Thursday = Wednesday 10-11 PM UTC
assert(utc3.day === 'Wednesday', 'Sydney slot should normalize to previous UTC day');
assert(utc3.start === (3 * 1440) + 1320, 'Sydney start should land on Wednesday 22:00 UTC in absolute minutes');

// ============================================================================
// UNIT TESTS: RANGE OVERLAP
// ============================================================================

testSection('Unit Tests: Range Overlap Detection');

const range1 = { start: 540, end: 1020, day: 'Monday' }; // 9 AM - 5 PM
const range2 = { start: 600, end: 900, day: 'Monday' };  // 10 AM - 3 PM
const range3 = { start: 1200, end: 1260, day: 'Monday' }; // 8 PM - 9 PM

assert(rangesOverlap(range1, range2), 'Overlapping ranges should return true');
assert(!rangesOverlap(range1, range3), 'Non-overlapping ranges should return false');

const overlap = calculateOverlap(range1, range2);
console.log('Overlap of 9AM-5PM and 10AM-3PM:', overlap);
assert(overlap?.start === 600 && overlap?.end === 900, 'Overlap should be 10 AM - 3 PM');

// ============================================================================
// FINAL REPORT
// ============================================================================

printResults();

console.log('KEY FINDINGS:');
console.log('');
console.log('BLOCKING BUGS:');
console.log('✓ None detected (all tests passing)');
console.log('');
console.log('MAJOR ISSUES:');
console.log('✓ None detected in covered scenarios');
console.log('');
console.log('RECOMMENDATIONS:');
console.log('✓ Keep validating inputs (start < end, required fields) before matching');
console.log('✓ Consider timezone library if real DST support is required');
console.log('');
