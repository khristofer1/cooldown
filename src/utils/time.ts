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
 * Formats the remaining time into a human readable string.
 * Uses "X days, Y hours left" for >24h, or "HH:MM:SS" for <24h.
 */
export function formatTimeRemaining(resetTimestamp: number): string {
  const now = Date.now();
  const diffMs = resetTimestamp - now;

  if (diffMs <= 0) return 'Ready';

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hr${hours !== 1 ? 's' : ''} left`;
  }

  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${h}:${m}:${s}`;
  }

  return `${m}:${s}`;
}

export function formatCooldown(value: number, unit: CooldownUnit): string {
  return `${value} ${unit}`;
}
