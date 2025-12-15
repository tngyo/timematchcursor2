import { convertTime } from './timezones.js';

// Convert time to minutes from midnight in UTC
function timeToUTCMinutes(time, offset, day) {
  const [hours, minutes, period] = parseTime(time);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  // Convert to UTC by subtracting offset
  totalMinutes -= offset * 60;
  
  // Normalize to 0-1440 range (24 hours)
  while (totalMinutes < 0) totalMinutes += 24 * 60;
  while (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
  
  return { minutes: totalMinutes, day };
}

// Convert UTC minutes back to local time string
function utcMinutesToTime(utcMinutes, offset) {
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
  const utc1 = timeToUTCMinutes(slot1.start, offset1, slot1.day);
  const utc2 = timeToUTCMinutes(slot2.start, offset2, slot2.day);
  
  // For now, match exact same UTC time (can be extended to check ranges)
  return utc1.minutes === utc2.minutes && utc1.day === utc2.day;
}

// Convert time range to UTC minutes (start and end)
function timeRangeToUTC(startTime, endTime, offset, day) {
  const startUTC = timeToUTCMinutes(startTime, offset, day);
  const endUTC = timeToUTCMinutes(endTime, offset, day);
  
  // Handle end time that wraps to next day
  if (endUTC.minutes < startUTC.minutes) {
    endUTC.minutes += 24 * 60;
  }
  
  return { start: startUTC.minutes, end: endUTC.minutes, day: startUTC.day };
}

// Check if two time ranges overlap in UTC
function rangesOverlap(range1, range2) {
  return range1.day === range2.day && 
         range1.start < range2.end && 
         range2.start < range1.end;
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
    participant.timeslots.forEach(slot => {
      const utcRange = timeRangeToUTC(slot.start, slot.end, participant.offset, slot.day);
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
    
    const firstItem = group[0];
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
          offset: participant.offset,
          localTime: item.slot.start
        });
      } else {
        unavailable.push({
          name: participant.name,
          city: participant.city,
          timezone: participant.timezone,
          offset: participant.offset
        });
      }
    });
    
    if (available.length > 0) {
      // Calculate the overlapping UTC time range
      let overlapStart = Math.max(...group.map(item => item.utcRange.start));
      let overlapEnd = Math.min(...group.map(item => item.utcRange.end));
      
      // Convert overlapping range to each participant's local time
      const overlappingRanges = available.map(person => {
        const participant = validParticipants.find(p => p.name === person.name);
        return {
          ...person,
          overlapStart: utcMinutesToTime(overlapStart, participant.offset),
          overlapEnd: utcMinutesToTime(overlapEnd, participant.offset)
        };
      });
      
      matches.push({
        day: firstItem.slot.day,
        start: firstItem.slot.start,
        end: firstItem.slot.end,
        available: overlappingRanges,
        unavailable,
        matchCount: available.length,
        totalCount: validParticipants.length,
        overlapStartUTC: overlapStart,
        overlapEndUTC: overlapEnd
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

