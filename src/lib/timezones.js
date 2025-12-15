// Common timezones with major cities
export const timezones = [
  { tz: 'America/New_York', city: 'New York', country: 'USA', offset: -5, label: 'GMT-5' },
  { tz: 'America/Chicago', city: 'Chicago', country: 'USA', offset: -6, label: 'GMT-6' },
  { tz: 'America/Denver', city: 'Denver', country: 'USA', offset: -7, label: 'GMT-7' },
  { tz: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA', offset: -8, label: 'GMT-8' },
  { tz: 'Europe/London', city: 'London', country: 'UK', offset: 0, label: 'GMT+0' },
  { tz: 'Europe/Paris', city: 'Paris', country: 'France', offset: 1, label: 'GMT+1' },
  { tz: 'Europe/Berlin', city: 'Berlin', country: 'Germany', offset: 1, label: 'GMT+1' },
  { tz: 'Europe/Moscow', city: 'Moscow', country: 'Russia', offset: 3, label: 'GMT+3' },
  { tz: 'Asia/Dubai', city: 'Dubai', country: 'UAE', offset: 4, label: 'GMT+4' },
  { tz: 'Asia/Kolkata', city: 'Mumbai', country: 'India', offset: 5.5, label: 'GMT+5:30' },
  { tz: 'Asia/Shanghai', city: 'Shanghai', country: 'China', offset: 8, label: 'GMT+8' },
  { tz: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', offset: 9, label: 'GMT+9' },
  { tz: 'Australia/Sydney', city: 'Sydney', country: 'Australia', offset: 10, label: 'GMT+10' },
  { tz: 'Pacific/Auckland', city: 'Auckland', country: 'New Zealand', offset: 12, label: 'GMT+12' },
];

// City-country pairs for search
export const cities = [
  { city: 'New York', country: 'USA', tz: 'America/New_York', offset: -5 },
  { city: 'Chicago', country: 'USA', tz: 'America/Chicago', offset: -6 },
  { city: 'Los Angeles', country: 'USA', tz: 'America/Los_Angeles', offset: -8 },
  { city: 'London', country: 'UK', tz: 'Europe/London', offset: 0 },
  { city: 'Paris', country: 'France', tz: 'Europe/Paris', offset: 1 },
  { city: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', offset: 1 },
  { city: 'Moscow', country: 'Russia', tz: 'Europe/Moscow', offset: 3 },
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', offset: 4 },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', offset: 5.5 },
  { city: 'Shanghai', country: 'China', tz: 'Asia/Shanghai', offset: 8 },
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', offset: 9 },
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', offset: 10 },
  { city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', offset: 12 },
];

export function getOffsetLabel(offset) {
  if (offset === 0) return 'GMT+0';
  const sign = offset > 0 ? '+' : '';
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.abs(offset) % 1;
  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }
  return `GMT${sign}${hours}:${Math.floor(minutes * 60).toString().padStart(2, '0')}`;
}

export function convertTime(time, fromOffset, toOffset) {
  const [hours, minutes, period] = parseTime(time);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  const offsetDiff = (toOffset - fromOffset) * 60;
  totalMinutes += offsetDiff;
  
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  const newPeriod = newHours >= 12 ? 'PM' : 'AM';
  const displayHours = newHours === 0 ? 12 : newHours > 12 ? newHours - 12 : newHours;
  
  return `${displayHours}:${newMins.toString().padStart(2, '0')} ${newPeriod}`;
}

function parseTime(time) {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return [0, 0, 'AM'];
  return [parseInt(match[1]), parseInt(match[2]), match[3].toUpperCase()];
}

