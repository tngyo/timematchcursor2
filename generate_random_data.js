// Generate random test data for time matching
import { findMatches } from './src/lib/timeMatch.js';

console.log('=== GENERATING RANDOM TEST DATA ===\n');

// Sample cities and their timezone data
const cities = [
  { city: 'New York', country: 'USA', tz: 'America/New_York', offset: -5 },
  { city: 'Los Angeles', country: 'USA', tz: 'America/Los_Angeles', offset: -8 },
  { city: 'London', country: 'UK', tz: 'Europe/London', offset: 0 },
  { city: 'Paris', country: 'France', tz: 'Europe/Paris', offset: 1 },
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', offset: 9 },
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', offset: 10 },
  { city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', offset: 12 },
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', offset: 4 },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', offset: 5.5 },
  { city: 'Shanghai', country: 'China', tz: 'Asia/Shanghai', offset: 8 }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Generate random time in 24-hour format
function generateRandomTime() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 4) * 15; // 15-minute intervals
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Generate a random timeslot (1-4 hours duration)
function generateRandomTimeslot() {
  const startTime = generateRandomTime();
  const startHour = parseInt(startTime.split(':')[0]);
  const startMinutes = parseInt(startTime.split(':')[1].split(' ')[0]);
  const isPM = startTime.includes('PM');
  
  let totalStartMinutes = (isPM && startHour !== 12 ? startHour + 12 : startHour) * 60 + startMinutes;
  if (startHour === 12 && !isPM) totalStartMinutes = startMinutes; // 12 AM
  
  const duration = (Math.floor(Math.random() * 4) + 1) * 60; // 1-4 hours in minutes
  let endTotalMinutes = totalStartMinutes + duration;
  
  // Convert back to 12-hour format
  let endHour = Math.floor(endTotalMinutes / 60) % 24;
  let endMinutes = endTotalMinutes % 60;
  const endPeriod = endHour >= 12 ? 'PM' : 'AM';
  const endDisplayHours = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
  
  // Handle day overflow
  let endDay = 'Monday';
  if (endTotalMinutes >= 24 * 60) {
    const dayIndex = Math.floor((endTotalMinutes - 24 * 60) / (24 * 60));
    endDay = days[dayIndex % 7];
    endTotalMinutes = endTotalMinutes % (24 * 60);
    endHour = Math.floor(endTotalMinutes / 60) % 24;
    endMinutes = endTotalMinutes % 60;
  }
  
  return {
    day: endDay,
    start: startTime,
    end: `${endDisplayHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`
  };
}

// Generate random participant
function generateRandomParticipant(id) {
  const city = cities[Math.floor(Math.random() * cities.length)];
  const numTimeslots = Math.floor(Math.random() * 3) + 1; // 1-3 timeslots
  
  return {
    name: `User ${id}`,
    city: city.city,
    timezone: city.tz,
    timezone_offset: city.offset,
    timeslots: Array.from({ length: numTimeslots }, () => generateRandomTimeslot())
  };
}

// Generate test scenarios
function generateTestScenarios() {
  const scenarios = [];
  
  // Scenario 1: Simple overlap (2 participants, 1 timeslot each)
  const scenario1 = [
    generateRandomParticipant(1),
    generateRandomParticipant(2)
  ];
  scenarios.push({
    name: 'Simple Overlap (2 participants)',
    participants: scenario1
  });
  
  // Scenario 2: Complex overlap (3 participants, multiple timeslots)
  const scenario2 = [
    generateRandomParticipant(1),
    generateRandomParticipant(2),
    generateRandomParticipant(3)
  ];
  scenarios.push({
    name: 'Complex Multi-Participant',
    participants: scenario2
  });
  
  // Scenario 3: Different timezones with overlap
  const scenario3 = [
    {
      name: 'Alice',
      city: 'New York',
      timezone: 'America/New_York',
      timezone_offset: -5,
      timeslots: [
        { day: 'Monday', start: '9:00 AM', end: '5:00 PM' }
      ]
    },
    {
      name: 'Bob',
      city: 'London',
      timezone: 'Europe/London', 
      timezone_offset: 0,
      timeslots: [
        { day: 'Monday', start: '2:00 PM', end: '10:00 PM' }
      ]
    },
    {
      name: 'Chen',
      city: 'Tokyo',
      timezone: 'Asia/Tokyo',
      timezone_offset: 9,
      timeslots: [
        { day: 'Monday', start: '11:00 PM', end: '7:00 AM' }
      ]
    }
  ];
  scenarios.push({
    name: 'Global Timezone Test',
    participants: scenario3
  });
  
  // Scenario 4: Same timezone overlap
  const scenario4 = [
    {
      name: 'Mike',
      city: 'Auckland',
      timezone: 'Pacific/Auckland',
      timezone_offset: 12,
      timeslots: [
        { day: 'Wednesday', start: '10:00 AM', end: '2:00 PM' },
        { day: 'Friday', start: '9:00 AM', end: '1:00 PM' }
      ]
    },
    {
      name: 'Sarah',
      city: 'Auckland',
      timezone: 'Pacific/Auckland',
      timezone_offset: 12,
      timeslots: [
        { day: 'Wednesday', start: '12:00 PM', end: '6:00 PM' },
        { day: 'Saturday', start: '8:00 AM', end: '12:00 PM' }
      ]
    }
  ];
  scenarios.push({
    name: 'Same Timezone Multiple Days',
    participants: scenario4
  });
  
  return scenarios;
}

// Additional specific test scenarios for timezone edge cases
function generateEdgeCaseScenarios() {
  const scenarios = [];
  
  // Edge Case 1: Extreme timezone differences (Auckland vs Los Angeles)
  scenarios.push({
    name: 'Extreme Timezone Difference (Auckland vs LA)',
    participants: [
      {
        name: 'Anna',
        city: 'Auckland',
        timezone: 'Pacific/Auckland',
        timezone_offset: 12,
        timeslots: [{ day: 'Monday', start: '6:00 AM', end: '10:00 AM' }]
      },
      {
        name: 'Ben',
        city: 'Los Angeles',
        timezone: 'America/Los_Angeles',
        timezone_offset: -8,
        timeslots: [{ day: 'Sunday', start: '2:00 PM', end: '6:00 PM' }]
      }
    ]
  });
  
  // Edge Case 2: Half-hour timezone offset (India)
  scenarios.push({
    name: 'Half-Hour Timezone Offset (India)',
    participants: [
      {
        name: 'Raj',
        city: 'Mumbai',
        timezone: 'Asia/Kolkata',
        timezone_offset: 5.5,
        timeslots: [{ day: 'Tuesday', start: '9:00 AM', end: '5:00 PM' }]
      },
      {
        name: 'Emma',
        city: 'London',
        timezone: 'Europe/London',
        timezone_offset: 0,
        timeslots: [{ day: 'Tuesday', start: '3:30 AM', end: '11:30 AM' }]
      }
    ]
  });
  
  // Edge Case 3: Cross-day overlap (Tokyo evening + New York morning)
  scenarios.push({
    name: 'Cross-Day Overlap (Tokyo Evening + NY Morning)',
    participants: [
      {
        name: 'Yuki',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        timezone_offset: 9,
        timeslots: [{ day: 'Monday', start: '11:00 PM', end: '6:00 AM' }]
      },
      {
        name: 'David',
        city: 'New York',
        timezone: 'America/New_York',
        timezone_offset: -5,
        timeslots: [{ day: 'Tuesday', start: '6:00 AM', end: '12:00 PM' }]
      }
    ]
  });
  
  // Edge Case 4: Perfect 24-hour spread
  scenarios.push({
    name: '24-Hour Global Spread',
    participants: [
      {
        name: 'Los_Angeles',
        city: 'Los Angeles',
        timezone: 'America/Los_Angeles',
        timezone_offset: -8,
        timeslots: [{ day: 'Monday', start: '8:00 AM', end: '12:00 PM' }]
      },
      {
        name: 'New_York',
        city: 'New York',
        timezone: 'America/New_York',
        timezone_offset: -5,
        timeslots: [{ day: 'Monday', start: '12:00 PM', end: '4:00 PM' }]
      },
      {
        name: 'London',
        city: 'London',
        timezone: 'Europe/London',
        timezone_offset: 0,
        timeslots: [{ day: 'Monday', start: '4:00 PM', end: '8:00 PM' }]
      },
      {
        name: 'Tokyo',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        timezone_offset: 9,
        timeslots: [{ day: 'Monday', start: '12:00 AM', end: '4:00 AM' }]
      }
    ]
  });
  
  return scenarios;
}

// Test all scenarios
function testScenarios() {
  console.log('=== REGULAR SCENARIOS ===');
  const scenarios = generateTestScenarios();
  testScenarioSet(scenarios, 'REGULAR');
  
  console.log('\n\n=== EDGE CASE SCENARIOS ===');
  const edgeCases = generateEdgeCaseScenarios();
  testScenarioSet(edgeCases, 'EDGE CASE');
}

function testScenarioSet(scenarios, type) {
  scenarios.forEach((scenario, index) => {
    console.log(`\n=== ${type} ${index + 1}: ${scenario.name} ===`);
    console.log('Participants:');
    
    scenario.participants.forEach(participant => {
      console.log(`\n${participant.name} (${participant.city}, GMT${participant.timezone_offset >= 0 ? '+' : ''}${participant.timezone_offset}):`);
      participant.timeslots.forEach(slot => {
        console.log(`  ${slot.day}: ${slot.start} - ${slot.end}`);
      });
    });
    
    console.log('\nMatch Results:');
    const matches = findMatches(scenario.participants);
    
    if (matches.length === 0) {
      console.log('❌ No matches found');
    } else {
      matches.forEach((match, matchIndex) => {
        console.log(`\nMatch ${matchIndex + 1}:`);
        console.log(`  Day: ${match.day}`);
        console.log(`  UTC Overlap: ${match.utcStart} - ${match.utcEnd}`);
        console.log(`  Display Overlap: ${match.start} - ${match.end}`);
        console.log(`  Available: ${match.available.map(p => p.name).join(', ')}`);
        console.log(`  Match count: ${match.matchCount}/${match.totalCount}`);
        
        // Detailed timezone verification
        console.log('\n  Individual Local Times:');
        match.available.forEach(participant => {
          console.log(`    ${participant.name.padEnd(8)} (${participant.city.padEnd(12)}): ${participant.localStartTime} - ${participant.localEndTime}`);
        });
        
        if (match.matchCount === match.totalCount) {
          console.log('  ✅ PERFECT MATCH');
        } else {
          console.log('  ⚠️ PARTIAL MATCH');
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
  });
}

// Generate and test
testScenarios();

// Also export the data generation functions for manual testing
export { generateRandomParticipant, generateRandomTimeslot, generateTestScenarios };