// Detailed debugging of time conversion and overlap logic
import { timeRangeToUTC, rangesOverlap } from './src/lib/timeMatch.js';

// Copy the utcMinutesToTime function locally for debugging
function utcMinutesToTime(utcMinutes, offset) {
  // Handle invalid inputs
  if (utcMinutes === null || utcMinutes === undefined || isNaN(utcMinutes) ||
      offset === null || offset === undefined || isNaN(offset)) {
    return '12:00 AM'; // Default to midnight
  }
  
  // Convert UTC to local by adding offset
  let localMinutes = utcMinutes + (offset * 60);
  
  // Normalize to 0-1440 range
  while (localMinutes < 0) localMinutes += 24 * 60;
  while (localMinutes >= 24 * 60) localMinutes -= 24 * 60;
  
  const hours = Math.floor(localMinutes / 60) % 24;
  const mins = Math.floor(localMinutes % 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

console.log('=== DETAILED TIME CONVERSION DEBUGGING ===');

// Test case 1: Alice 6-8 AM New York, Bob 6-8 PM London
console.log('\nTest Case 1: Alice 6-8 AM NY, Bob 6-8 PM London');
console.log('Expected: No overlap (1 PM vs 6 PM)');

// Alice's slot
const aliceSlot = { start: '6:00 AM', end: '8:00 AM', day: 'Monday' };
const aliceOffset = -5; // New York is UTC-5
const aliceUTC = timeRangeToUTC(aliceSlot.start, aliceSlot.end, aliceOffset, aliceSlot.day);
console.log(`Alice: ${aliceSlot.start} ${aliceSlot.end} (UTC${aliceOffset >= 0 ? '+' : ''}${aliceOffset})`);
console.log(`  UTC Range: ${aliceUTC.start} to ${aliceUTC.end} minutes`);
console.log(`  Local time interpretation: ${utcMinutesToTime(aliceUTC.start, aliceOffset)} to ${utcMinutesToTime(aliceUTC.end, aliceOffset)}`);

// Bob's slot
const bobSlot = { start: '6:00 PM', end: '8:00 PM', day: 'Monday' };
const bobOffset = 0; // London is UTC+0
const bobUTC = timeRangeToUTC(bobSlot.start, bobSlot.end, bobOffset, bobSlot.day);
console.log(`Bob: ${bobSlot.start} ${bobSlot.end} (UTC${bobOffset >= 0 ? '+' : ''}${bobOffset})`);
console.log(`  UTC Range: ${bobUTC.start} to ${bobUTC.end} minutes`);
console.log(`  Local time interpretation: ${utcMinutesToTime(bobUTC.start, bobOffset)} to ${utcMinutesToTime(bobUTC.end, bobOffset)}`);

// Check overlap
const overlap = rangesOverlap(aliceUTC, bobUTC);
console.log(`Overlap detected: ${overlap}`);

if (overlap) {
  const startOverlap = Math.max(aliceUTC.start, bobUTC.start);
  const endOverlap = Math.min(aliceUTC.end, bobUTC.end);
  console.log(`Overlap range: ${startOverlap} to ${endOverlap} UTC minutes`);
  console.log(`Alice local: ${utcMinutesToTime(startOverlap, aliceOffset)} to ${utcMinutesToTime(endOverlap, aliceOffset)}`);
  console.log(`Bob local: ${utcMinutesToTime(startOverlap, bobOffset)} to ${utcMinutesToTime(endOverlap, bobOffset)}`);
}

// Test case 2: Alice 6-8 AM NY, Bob 11 AM-1 PM London  
console.log('\nTest Case 2: Alice 6-8 AM NY, Bob 11 AM-1 PM London');
console.log('Expected: Should overlap (6 AM NY = 11 AM London)');

// Reset Alice
const aliceUTC2 = timeRangeToUTC(aliceSlot.start, aliceSlot.end, aliceOffset, aliceSlot.day);

// Bob's slot
const bobSlot2 = { start: '11:00 AM', end: '1:00 PM', day: 'Monday' };
const bobUTC2 = timeRangeToUTC(bobSlot2.start, bobSlot2.end, bobOffset, bobSlot2.day);
console.log(`Bob: ${bobSlot2.start} ${bobSlot2.end} (UTC${bobOffset >= 0 ? '+' : ''}${bobOffset})`);
console.log(`  UTC Range: ${bobUTC2.start} to ${bobUTC2.end} minutes`);
console.log(`  Local time interpretation: ${utcMinutesToTime(bobUTC2.start, bobOffset)} to ${utcMinutesToTime(bobUTC2.end, bobOffset)}`);

// Check overlap
const overlap2 = rangesOverlap(aliceUTC2, bobUTC2);
console.log(`Overlap detected: ${overlap2}`);

if (overlap2) {
  const startOverlap = Math.max(aliceUTC2.start, bobUTC2.start);
  const endOverlap = Math.min(aliceUTC2.end, bobUTC2.end);
  console.log(`Overlap range: ${startOverlap} to ${endOverlap} UTC minutes`);
  console.log(`Alice local: ${utcMinutesToTime(startOverlap, aliceOffset)} to ${utcMinutesToTime(endOverlap, aliceOffset)}`);
  console.log(`Bob local: ${utcMinutesToTime(startOverlap, bobOffset)} to ${utcMinutesToTime(endOverlap, bobOffset)}`);
}

// Manual calculation check for Case 1
console.log('\n=== MANUAL CALCULATION CHECK ===');
console.log('Case 1 manual: Alice 6-8 AM NY should be 11 AM-1 PM London');
console.log('6 AM NY = 11 AM London (NY is 5 hours behind London)');
console.log('8 AM NY = 1 PM London');
console.log('Bob 6-8 PM London should be 1-3 PM New York');
console.log('6 PM London = 1 PM New York');
console.log('8 PM London = 3 PM New York');
console.log('So Alice 11 AM-1 PM London vs Bob 6-8 PM London should NOT overlap');

// Let's check the time conversion function
console.log('\n=== TIME CONVERSION FUNCTION TEST ===');
console.log('Testing utcMinutesToTime function:');
console.log(`360 minutes (6 AM) in NY (UTC-5): ${utcMinutesToTime(360, -5)}`);
console.log(`660 minutes (11 AM) in London (UTC+0): ${utcMinutesToTime(660, 0)}`);
console.log(`780 minutes (1 PM) in London (UTC+0): ${utcMinutesToTime(780, 0)}`);
console.log(`1080 minutes (6 PM) in London (UTC+0): ${utcMinutesToTime(1080, 0)}`);