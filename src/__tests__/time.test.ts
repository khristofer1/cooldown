import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getNextResetTime, formatTimeRemaining, isAvailable } from '../utils/time';

describe('Time Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getNextResetTime calculates minutes correctly', () => {
    const baseTime = new Date('2024-01-01T12:00:00Z').getTime();
    const result = getNextResetTime(baseTime, 5, 'minutes');
    expect(result).toBe(baseTime + 5 * 60 * 1000);
  });

  it('getNextResetTime calculates hours correctly', () => {
    const baseTime = new Date('2024-01-01T12:00:00Z').getTime();
    const result = getNextResetTime(baseTime, 2, 'hours');
    expect(result).toBe(baseTime + 2 * 60 * 60 * 1000);
  });

  it('getNextResetTime snaps to midnight for days', () => {
    const baseTime = new Date('2024-01-01T15:30:00').getTime(); // 3:30 PM local
    const result = getNextResetTime(baseTime, 1, 'days');
    
    const resultDate = new Date(result);
    expect(resultDate.getDate()).toBe(2);
    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
  });

  it('getNextResetTime snaps to midnight for weeks', () => {
    const baseTime = new Date('2024-01-01T15:30:00').getTime(); // 3:30 PM local
    const result = getNextResetTime(baseTime, 1, 'weeks');
    
    const resultDate = new Date(result);
    expect(resultDate.getDate()).toBe(8);
    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
  });

  it('formatTimeRemaining formats correctly < 24h', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const resetTime = new Date('2024-01-01T14:30:15Z').getTime(); // +2h 30m 15s
    expect(formatTimeRemaining(resetTime)).toBe('02:30:15');
  });

  it('formatTimeRemaining formats correctly > 24h', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const resetTime = new Date('2024-01-03T14:00:00Z').getTime(); // +2 days, 2 hours
    expect(formatTimeRemaining(resetTime)).toBe('2 days, 2 hrs left');
  });

  it('isAvailable returns true when past reset time', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const resetTime = new Date('2024-01-01T11:00:00Z').getTime();
    expect(isAvailable(resetTime)).toBe(true);
  });

  it('isAvailable returns false when before reset time', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const resetTime = new Date('2024-01-01T13:00:00Z').getTime();
    expect(isAvailable(resetTime)).toBe(false);
  });
});
