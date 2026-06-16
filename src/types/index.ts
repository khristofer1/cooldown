export type CooldownUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface Activity {
  id: string;
  name: string;
  cooldownValue: number;
  cooldownUnit: CooldownUnit;
  icon?: string; // Optional lucide icon name
  lastTriggeredAt: number | null; // epoch timestamp
  createdAt: number;
}
