import type { CooldownUnit } from '../types';

/**
 * Calculates the exact timestamp when an activity becomes available again.
 * If the unit is days or weeks, it will snap to the NEXT midnight (start of the day)
 * after the exact calculated duration.
 */
export function getNextResetTime(triggeredAt: number, value: number, unit: CooldownUnit): number {
  const date = new Date(triggeredAt);

  switch (unit) {
    case 'minutes':
      return date.getTime() + value * 60 * 1000;
    case 'hours':
      return date.getTime() + value * 60 * 60 * 1000;
    case 'days': {
      date.setDate(date.getDate() + value);
      date.setHours(0, 0, 0, 0); // Snap to midnight
      return date.getTime();
    }
    case 'weeks': {
      date.setDate(date.getDate() + value * 7);
      date.setHours(0, 0, 0, 0); // Snap to midnight
      return date.getTime();
    }
    default:
      return date.getTime();
  }
}

/**
 * Checks if the current time has passed the reset timestamp
 */
export function isAvailable(resetTimestamp: number): boolean {
  return Date.now() >= resetTimestamp;
}

/**
 * Formats the remaining time into a human readable string with adaptive units.
 * Respects singular/plural nouns (no 's' if the number is one).
 */
export function formatTimeRemaining(resetTimestamp: number): string {
  const now = Date.now();
  const diffMs = resetTimestamp - now;

  if (diffMs <= 0) return 'Ready';

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const formatUnit = (val: number, unit: string) => {
    return `${val} ${unit}${val !== 1 ? 's' : ''}`;
  };

  if (days > 0) {
    const daysStr = formatUnit(days, 'day');
    const hoursStr = hours > 0 ? `, ${formatUnit(hours, 'hour')}` : '';
    return `${daysStr}${hoursStr} left`;
  }

  if (hours > 0) {
    const hoursStr = formatUnit(hours, 'hour');
    const minutesStr = minutes > 0 ? `, ${formatUnit(minutes, 'minute')}` : '';
    return `${hoursStr}${minutesStr} left`;
  }

  if (minutes > 0) {
    const minutesStr = formatUnit(minutes, 'minute');
    const secondsStr = seconds > 0 ? `, ${formatUnit(seconds, 'second')}` : '';
    return `${minutesStr}${secondsStr} left`;
  }

  return `${formatUnit(seconds, 'second')} left`;
}

export function formatCooldown(value: number, unit: CooldownUnit): string {
  if (value === 1) {
    return `1 ${unit.slice(0, -1)}`; // Singular form (strip trailing 's')
  }
  return `${value} ${unit}`;
}
