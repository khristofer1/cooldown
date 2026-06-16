import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ActivityCard } from '../components/ActivityCard';
import { Activity } from '../types';

describe('ActivityCard Component', () => {
  const mockActivity: Activity = {
    id: '1',
    name: 'Test Activity',
    cooldownValue: 10,
    cooldownUnit: 'minutes',
    lastTriggeredAt: null,
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders available state correctly', () => {
    const onTrigger = vi.fn();
    render(<ActivityCard activity={mockActivity} onTrigger={onTrigger} />);

    expect(screen.getByText('Test Activity')).toBeDefined();
    expect(screen.getByText('Cooldown: 10 minutes')).toBeDefined();
    
    const triggerBtn = screen.getByText('Trigger Activity');
    expect(triggerBtn).toBeDefined();
    expect((triggerBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(triggerBtn);
    expect(onTrigger).toHaveBeenCalledWith('1');
  });

  it('renders cooldown state correctly and updates timer', () => {
    const onTrigger = vi.fn();
    const triggeredTime = new Date('2024-01-01T12:00:00Z').getTime();
    vi.setSystemTime(triggeredTime);

    const activeMock: Activity = {
      ...mockActivity,
      lastTriggeredAt: triggeredTime,
    };

    render(<ActivityCard activity={activeMock} onTrigger={onTrigger} />);

    // 10 minutes from triggeredTime, so 10:00 initially
    const lockBtn = screen.getByRole('button', { name: /10:00/i });
    expect(lockBtn).toBeDefined();
    expect((lockBtn as HTMLButtonElement).disabled).toBe(true);

    // Advance timer by 1 minute (60 seconds)
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByRole('button', { name: /09:00/i })).toBeDefined();
  });
});
