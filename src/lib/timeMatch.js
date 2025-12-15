import { convertTime } from './timezones.js';

// Convert time to UTC minutes (simple conversion without day boundaries)
function timeToUTCMinutes(time, offset, day) {
  // Handle invalid inputs
  if (!time || offset === null || offset === undefined || isNaN(offset)) {
    return { minutes: 0, day: day || 'Monday' };
  }
  
  const [hours, minutes, period] = parseTime(time);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  // Convert to UTC by subtracting offset (allow negative values)
  totalMinutes -= offset * 60;
  
  return { minutes: totalMinutes, day };
}

function getNextDay(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentIndex = days.indexOf(day);
  return days[(currentIndex + 1) % 7];
}

function getPreviousDay(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentIndex = days.indexOf(day);
  return days[(currentIndex - 1 + 7) % 7];
}

// Convert UTC minutes back to local time string
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

function parseTime(time) {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return [0, 0, 'AM'];
  return [parseInt(match[1]), parseInt(match[2]), match[3].toUpperCase()];
}

// Check if two time slots overlap (same moment in time)
function slotsOverlap(slot1, offset1, slot2, offset2) {
  const utc1 = timeRangeToUTC(slot1.start, slot1.end, offset1, slot1.day);
  const utc2 = timeRangeToUTC(slot2.start, slot2.end, offset2, slot2.day);
  
  // Check if ranges overlap
  return rangesOverlap(utc1, utc2);
}

export function timeRangeToUTC(startTime, endTime, offset, day) {
  const startUTC = timeToUTCMinutes(startTime, offset, day);
  const endUTC = timeToUTCMinutes(endTime, offset, day);
  
  // For simplicity, assume all times are on the same conceptual day
  // Handle end time that might be before start time (crosses midnight)
  let endMinutes = endUTC.minutes;
  let startMinutes = startUTC.minutes;
  
  if (endMinutes < startMinutes) {
    // End time is on the next day
    endMinutes += 24 * 60;
  }
  
  return { start: startMinutes, end: endMinutes, day: startUTC.day };
}

function isNextDay(day, referenceDay) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = days.indexOf(day);
  const refIndex = days.indexOf(referenceDay);
  return (dayIndex === (refIndex + 1) % 7);
}

export function rangesOverlap(range1, range2) {
  // Handle ranges that might have negative start times
  // Normalize ranges to handle cross-day scenarios
  
  // If both ranges have negative starts, adjust them
  let adjRange1 = { ...range1 };
  let adjRange2 = { ...range2 };
  
  // Handle negative start times by adding 24*60
  if (adjRange1.start < 0) {
    adjRange1.start += 24 * 60;
    adjRange1.end += 24 * 60;
  }
  if (adjRange2.start < 0) {
    adjRange2.start += 24 * 60;
    adjRange2.end += 24 * 60;
  }
  
  // Now check for overlap
  return adjRange1.start < adjRange2.end && adjRange2.start < adjRange1.end;
}

export function getDayIndex(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
}

export function calculateOverlap(range1, range2) {
  if (!rangesOverlap(range1, range2)) {
    return null;
  }
  
  // Handle ranges that might have negative start times
  let adjRange1 = { ...range1 };
  let adjRange2 = { ...range2 };
  
  // Handle negative start times by adding 24*60
  if (adjRange1.start < 0) {
    adjRange1.start += 24 * 60;
    adjRange1.end += 24 * 60;
  }
  if (adjRange2.start < 0) {
    adjRange2.start += 24 * 60;
    adjRange2.end += 24 * 60;
  }
  
  // Calculate intersection of adjusted ranges
  const overlapStart = Math.max(adjRange1.start, adjRange2.start);
  const overlapEnd = Math.min(adjRange1.end, adjRange2.end);
  
  if (overlapStart >= overlapEnd) {
    return null; // No actual overlap
  }
  
  return {
    start: overlapStart,
    end: overlapEnd,
    day: range1.day
  };
}

export function findMatches(participants) {
  const matches = [];
  const validParticipants = participants.filter(p =>
    p.name && p.city && p.timeslots && p.timeslots.length > 0
  );
  
  if (validParticipants.length < 1) return [];
  
  // Collect all time slots with their UTC ranges
  const allSlots = [];
  validParticipants.forEach(participant => {
    const offset = participant.offset || participant.timezone_offset || 0; // Handle both property names
    participant.timeslots.forEach(slot => {
      const utcRange = timeRangeToUTC(slot.start, slot.end, offset, slot.day);
      allSlots.push({
        slot,
        participant,
        utcRange
      });
    });
  });
  
  // Group slots by overlapping UTC time ranges
  const slotGroups = [];
  const processed = new Set();
  
  allSlots.forEach((item, index) => {
    if (processed.has(index)) return;
    
    const group = [item];
    processed.add(index);
    
    // Find all other slots that overlap with this one
    allSlots.forEach((otherItem, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;
      
      if (rangesOverlap(item.utcRange, otherItem.utcRange)) {
        group.push(otherItem);
        processed.add(otherIndex);
      }
    });
    
    if (group.length > 0) {
      slotGroups.push(group);
    }
  });
  
  // Create matches from groups
  slotGroups.forEach((group) => {
    if (group.length === 0) return;
    
    // Calculate the actual overlap time range
    let overlapRange = group[0].utcRange;
    for (let i = 1; i < group.length; i++) {
      overlapRange = calculateOverlap(overlapRange, group[i].utcRange);
      if (!overlapRange) break; // No overlap found
    }
    
    if (!overlapRange) return;
    
    const available = [];
    const unavailable = [];
    
    // Check each participant
    validParticipants.forEach(participant => {
      const hasSlot = group.some(item => item.participant.name === participant.name);
      
      if (hasSlot) {
        const item = group.find(i => i.participant.name === participant.name);
        available.push({
          name: participant.name,
          city: participant.city,
          timezone: participant.timezone,
          offset: participant.offset || participant.timezone_offset || 0,
          localStartTime: utcMinutesToTime(overlapRange.start, participant.offset || participant.timezone_offset || 0),
          localEndTime: utcMinutesToTime(overlapRange.end, participant.offset || participant.timezone_offset || 0),
          originalStart: item.slot.start,
          originalEnd: item.slot.end
        });
      } else {
        unavailable.push({
          name: participant.name,
          city: participant.city,
          timezone: participant.timezone,
          offset: participant.offset || participant.timezone_offset || 0
        });
      }
    });
    
    if (available.length > 0) {
      matches.push({
        day: group[0].slot.day,
        utcStart: utcMinutesToTime(overlapRange.start, 0), // UTC time
        utcEnd: utcMinutesToTime(overlapRange.end, 0), // UTC time
        start: utcMinutesToTime(overlapRange.start, group[0].participant.offset || group[0].participant.timezone_offset || 0),
        end: utcMinutesToTime(overlapRange.end, group[0].participant.offset || group[0].participant.timezone_offset || 0),
        available: available,
        unavailable,
        matchCount: available.length,
        totalCount: validParticipants.length
      });
    }
  });
  
  // Sort matches: perfect matches first, then by match count
  matches.sort((a, b) => {
    if (a.matchCount === a.totalCount && b.matchCount !== b.totalCount) return -1;
    if (a.matchCount !== a.totalCount && b.matchCount === b.totalCount) return 1;
    return b.matchCount - a.matchCount;
  });
  
  return matches;
}

