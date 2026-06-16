import { useState, useEffect } from 'react';
import type { Activity } from '../types';

const STORAGE_KEY = 'cooldown_activities';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Failed to parse activities from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt' | 'lastTriggeredAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastTriggeredAt: null,
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, ...updates } : act))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  };

  const triggerActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, lastTriggeredAt: Date.now() } : act
      )
    );
  };

  const untriggerActivity = (id: string, previousTimestamp: number | null) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, lastTriggeredAt: previousTimestamp } : act
      )
    );
  };

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    triggerActivity,
    untriggerActivity,
  };
}
