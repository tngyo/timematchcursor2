// Debug the complex scenario to understand why some matches were missed
import { timeRangeToUTC, rangesOverlap } from './src/lib/timeMatch.js';

console.log('=== DEBUGGING COMPLEX SCENARIO MATCHES ===');

// Let's manually check some expected overlaps
console.log('\n--- MANUAL OVERLAP CHECK ---');

// Monday overlaps (should be perfect match)
console.log('\nMonday Analysis:');
console.log('Alice: 9:00 AM - 11:00 AM NY (UTC-5)');
const aliceMonUTC = timeRangeToUTC('9:00 AM', '11:00 AM', -5, 'Monday');
console.log(`  UTC: ${aliceMonUTC.start} - ${aliceMonUTC.end}`);

console.log('Bob: 2:00 PM - 4:00 PM London (UTC+0)');
const bobMonUTC = timeRangeToUTC('2:00 PM', '4:00 PM', 0, 'Monday');
console.log(`  UTC: ${bobMonUTC.start} - ${bobMonUTC.end}`);

console.log('Diana: 6:00 AM - 8:00 AM LA (UTC-8)');
const dianaMonUTC = timeRangeToUTC('6:00 AM', '8:00 AM', -8, 'Monday');
console.log(`  UTC: ${dianaMonUTC.start} - ${dianaMonUTC.end}`);

console.log('Chen: 9:00 PM - 11:00 PM Beijing (UTC+8)');
const chenMonUTC = timeRangeToUTC('9:00 PM', '11:00 PM', 8, 'Monday');
console.log(`  UTC: ${chenMonUTC.start} - ${chenMonUTC.end}`);

// Check overlaps
console.log('\nMonday Overlap Check:');
console.log(`Alice vs Bob: ${rangesOverlap(aliceMonUTC, bobMonUTC)}`);
console.log(`Alice vs Diana: ${rangesOverlap(aliceMonUTC, dianaMonUTC)}`);
console.log(`Alice vs Chen: ${rangesOverlap(aliceMonUTC, chenMonUTC)}`);
console.log(`Bob vs Diana: ${rangesOverlap(bobMonUTC, dianaMonUTC)}`);
console.log(`Bob vs Chen: ${rangesOverlap(bobMonUTC, chenMonUTC)}`);
console.log(`Diana vs Chen: ${rangesOverlap(dianaMonUTC, chenMonUTC)}`);

// Friday overlaps (should be 3/4 match)
console.log('\nFriday Analysis:');
console.log('Alice: 8:00 AM - 10:00 AM NY (UTC-5)');
const aliceFriUTC = timeRangeToUTC('8:00 AM', '10:00 AM', -5, 'Friday');
console.log(`  UTC: ${aliceFriUTC.start} - ${aliceFriUTC.end}`);

console.log('Bob: 1:00 PM - 3:00 PM London (UTC+0)');
const bobFriUTC = timeRangeToUTC('1:00 PM', '3:00 PM', 0, 'Friday');
console.log(`  UTC: ${bobFriUTC.start} - ${bobFriUTC.end}`);

console.log('Diana: 5:00 AM - 7:00 AM LA (UTC-8)');
const dianaFriUTC = timeRangeToUTC('5:00 AM', '7:00 AM', -8, 'Friday');
console.log(`  UTC: ${dianaFriUTC.start} - ${dianaFriUTC.end}`);

console.log('Chen: 9:00 PM - 11:00 PM Beijing (UTC+8)');
const chenFriUTC = timeRangeToUTC('9:00 PM', '11:00 PM', 8, 'Friday');
console.log(`  UTC: ${chenFriUTC.start} - ${chenFriUTC.end}`);

// Check overlaps
console.log('\nFriday Overlap Check:');
console.log(`Alice vs Bob: ${rangesOverlap(aliceFriUTC, bobFriUTC)}`);
console.log(`Alice vs Diana: ${rangesOverlap(aliceFriUTC, dianaFriUTC)}`);
console.log(`Alice vs Chen: ${rangesOverlap(aliceFriUTC, chenFriUTC)}`);
console.log(`Bob vs Diana: ${rangesOverlap(bobFriUTC, dianaFriUTC)}`);
console.log(`Bob vs Chen: ${rangesOverlap(bobFriUTC, chenFriUTC)}`);
console.log(`Diana vs Chen: ${rangesOverlap(dianaFriUTC, chenFriUTC)}`);

// Let's also check what time conversion function returns
console.log('\n--- TIME CONVERSION DEBUG ---');

function parseTime(time) {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return [0, 0, 'AM'];
  return [parseInt(match[1]), parseInt(match[2]), match[3].toUpperCase()];
}

function timeToUTCMinutes(time, offset, day) {
  const [hours, minutes, period] = parseTime(time);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  // Convert to UTC by subtracting offset
  totalMinutes -= offset * 60;
  
  return { minutes: totalMinutes, day };
}

console.log('Manual time conversion check:');
console.log('9:00 AM with offset -5 (NY to UTC):');
const manual1 = timeToUTCMinutes('9:00 AM', -5, 'Monday');
console.log(`  Result: ${manual1.minutes} minutes (should be 14:00 = 840 minutes)`);

console.log('2:00 PM with offset 0 (London to UTC):');
const manual2 = timeToUTCMinutes('2:00 PM', 0, 'Monday');
console.log(`  Result: ${manual2.minutes} minutes (should be 14:00 = 840 minutes)`);

console.log('6:00 AM with offset -8 (LA to UTC):');
const manual3 = timeToUTCMinutes('6:00 AM', -8, 'Monday');
console.log(`  Result: ${manual3.minutes} minutes (should be 14:00 = 840 minutes)`);

console.log('9:00 PM with offset +8 (Beijing to UTC):');
const manual4 = timeToUTCMinutes('9:00 PM', 8, 'Monday');
console.log(`  Result: ${manual4.minutes} minutes (should be 13:00 = 780 minutes)`);