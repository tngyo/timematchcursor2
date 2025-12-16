import { convertTime } from './timezones.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Convert time to UTC minutes with normalized day index to preserve actual UTC day.
function timeToUTCMinutes(time, offset, dayIndex) {
  if (!time || offset === null || offset === undefined || isNaN(offset)) {
    return { minutes: 0, dayIndex: Number.isInteger(dayIndex) ? dayIndex % 7 : 0 };
  }
  
  const [hours, minutes, period] = parseTime(time);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  totalMinutes -= offset * 60;
  
  let normalizedDayIndex = Number.isInteger(dayIndex) ? dayIndex : 0;
  while (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    normalizedDayIndex = (normalizedDayIndex + 6) % 7;
  }
  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    normalizedDayIndex = (normalizedDayIndex + 1) % 7;
  }
  
  return { minutes: totalMinutes, dayIndex: normalizedDayIndex };
}

function getNextDay(day) {
  const currentIndex = DAYS.indexOf(day);
  return DAYS[(currentIndex + 1) % 7];
}

function getPreviousDay(day) {
  const currentIndex = DAYS.indexOf(day);
  return DAYS[(currentIndex - 1 + 7) % 7];
}

// Convert UTC minutes back to local time string
function utcMinutesToTime(utcMinutes, offset) {
  // Handle invalid inputs
  if (utcMinutes === null || utcMinutes === undefined || isNaN(utcMinutes) ||
      offset === null || offset === undefined || isNaN(offset)) {
    return '12:00 AM'; // Default to midnight
  }
  
  // Convert UTC to local by adding offset (handle decimal offsets)
  let localMinutes = utcMinutes + (offset * 60);
  
  // Normalize to 0-1440 range
  while (localMinutes < 0) localMinutes += 24 * 60;
  while (localMinutes >= 24 * 60) localMinutes -= 24 * 60;
  
  const hours = Math.floor(localMinutes / 60) % 24;
  const mins = Math.round(localMinutes % 60); // Round to nearest minute for decimal offsets
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
  const dayIndex = getDayIndex(day);
  const startUTC = timeToUTCMinutes(startTime, offset, dayIndex);
  const endUTC = timeToUTCMinutes(endTime, offset, dayIndex);
  
  let startAbs = startUTC.dayIndex * 24 * 60 + startUTC.minutes;
  let endAbs = endUTC.dayIndex * 24 * 60 + endUTC.minutes;
  
  if (endAbs <= startAbs) {
    endAbs += 24 * 60;
  }
  
  return { start: startAbs, end: endAbs, dayIndex: startUTC.dayIndex, day: DAYS[startUTC.dayIndex] };
}

function isNextDay(day, referenceDay) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = days.indexOf(day);
  const refIndex = days.indexOf(referenceDay);
  return (dayIndex === (refIndex + 1) % 7);
}

export function rangesOverlap(range1, range2) {
  return range1.start < range2.end && range2.start < range1.end;
}

export function getDayIndex(day) {
  return DAYS.indexOf(day);
}

export function calculateOverlap(range1, range2) {
  if (!rangesOverlap(range1, range2)) {
    return null;
  }
  
  const overlapStart = Math.max(range1.start, range2.start);
  const overlapEnd = Math.min(range1.end, range2.end);
  
  if (overlapStart >= overlapEnd) {
    return null;
  }
  
  const dayIndex = Math.floor(overlapStart / (24 * 60)) % 7;
  
  return {
    start: overlapStart,
    end: overlapEnd,
    dayIndex,
    day: DAYS[dayIndex]
  };
}

export function findMatches(participants) {
  const matches = [];
  const validParticipants = participants.filter(p =>
    p.name && p.city && p.timeslots && p.timeslots.length > 0
  );
  
  // Need at least 2 participants for a meaningful match
  if (validParticipants.length < 2) return [];
  
  const slotsByUtcDay = new Map();
  
  validParticipants.forEach(participant => {
    const offset = participant.offset || participant.timezone_offset || 0;
    participant.timeslots.forEach(slot => {
      if (!slot?.day || !slot?.start || !slot?.end) return;
      if (slot.start === slot.end) return;
      
      const utcRange = timeRangeToUTC(slot.start, slot.end, offset, slot.day);
      const dayKey = Math.floor(utcRange.start / (24 * 60));
      const entry = { slot, participant, offset, utcRange };
      
      if (!slotsByUtcDay.has(dayKey)) {
        slotsByUtcDay.set(dayKey, []);
      }
      slotsByUtcDay.get(dayKey).push(entry);
    });
  });
  
  slotsByUtcDay.forEach((daySlots) => {
    if (daySlots.length === 0) return;
    
    const allSlots = daySlots.map(item => ({ ...item }));
    const slotGroups = [];
    const processed = new Set();
    
    allSlots.forEach((item, index) => {
      if (processed.has(index)) return;
      
      const group = [item];
      processed.add(index);
      
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
    
    slotGroups.forEach((group) => {
      if (group.length === 0) return;
      
      let overlapRange = group[0].utcRange;
      for (let i = 1; i < group.length; i++) {
        overlapRange = calculateOverlap(overlapRange, group[i].utcRange);
        if (!overlapRange) break;
      }
      
      if (!overlapRange) return;
      
      const available = [];
      const unavailable = [];
      const overlapDayIndex = Math.floor(overlapRange.start / (24 * 60)) % 7;
      const overlapDayName = DAYS[overlapDayIndex];
      const overlapStartMod = overlapRange.start % (24 * 60);
      const overlapEndMod = overlapRange.end % (24 * 60);
      
      validParticipants.forEach(participant => {
        const hasSlot = group.some(item => item.participant.name === participant.name);
        const participantOffset = participant.offset || participant.timezone_offset || 0;
        
        if (hasSlot) {
          const item = group.find(i => i.participant.name === participant.name);
          const personData = {
            name: participant.name,
            city: participant.city,
            timezone: participant.timezone,
            offset: participantOffset,
            localStartTime: utcMinutesToTime(overlapStartMod, participantOffset),
            localEndTime: utcMinutesToTime(overlapEndMod, participantOffset),
            originalStart: item.slot.start,
            originalEnd: item.slot.end,
            allSlots: participant.timeslots ? Array.from(participant.timeslots) : []
          };
          available.push(personData);
        } else {
          unavailable.push({
            name: participant.name,
            city: participant.city,
            timezone: participant.timezone,
            offset: participantOffset
          });
        }
      });
      
      if (available.length >= 2) {
        matches.push({
          day: overlapDayName,
          utcStart: utcMinutesToTime(overlapStartMod, 0),
          utcEnd: utcMinutesToTime(overlapEndMod, 0),
          start: utcMinutesToTime(overlapStartMod, group[0].participant.offset || group[0].participant.timezone_offset || 0),
          end: utcMinutesToTime(overlapEndMod, group[0].participant.offset || group[0].participant.timezone_offset || 0),
          available,
          unavailable,
          matchCount: available.length,
          totalCount: validParticipants.length
        });
      }
    });
  });
  
  // Sort matches: perfect matches first, then by match count
  matches.sort((a, b) => {
    if (a.matchCount === a.totalCount && b.matchCount !== b.totalCount) return -1;
    if (a.matchCount !== a.totalCount && b.matchCount === b.totalCount) return 1;
    return b.matchCount - a.matchCount;
  });
  
  return matches;
}
