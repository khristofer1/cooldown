import React, { useState } from 'react';
import type { Activity, CooldownUnit } from '../types';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ActivityFormProps {
  initialData?: Activity | null;
  onSubmit: (data: Omit<Activity, 'id' | 'createdAt' | 'lastTriggeredAt'>) => void;
  onCancel: () => void;
}

const COMMON_ICONS = [
  'Coffee', 'Book', 'Monitor', 'Gamepad2', 'Tv', 'Utensils', 'Pizza',
  'ShoppingBag', 'Smartphone', 'Cigarette', 'GlassWater', 'Beer',
  'Code', 'Headphones', 'Music', 'Youtube'
];

export function ActivityForm({ initialData, onSubmit, onCancel }: ActivityFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [cooldownValue, setCooldownValue] = useState(initialData?.cooldownValue || 1);
  const [cooldownUnit, setCooldownUnit] = useState<CooldownUnit>(initialData?.cooldownUnit || 'days');
  const [icon, setIcon] = useState(initialData?.icon || 'Coffee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cooldownValue <= 0) return;

    onSubmit({
      name: name.trim(),
      cooldownValue,
      cooldownUnit,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm dark:bg-black/60 transition-opacity">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {initialData ? 'Edit Activity' : 'New Activity'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Activity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eating instant noodles"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Cooldown Duration
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={cooldownValue}
                onChange={(e) => setCooldownValue(Number(e.target.value))}
                className="w-1/3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 transition-colors"
                required
              />
              <select
                value={cooldownUnit}
                onChange={(e) => setCooldownUnit(e.target.value as CooldownUnit)}
                className="w-2/3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 transition-colors"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
            {(cooldownUnit === 'days' || cooldownUnit === 'weeks') && (
              <p className="mt-2 text-xs text-zinc-500">
                Note: Day/Week cooldowns reset at exactly midnight (00:00).
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COMMON_ICONS.map((iconName) => {
                // @ts-expect-error dynamic icon mapping
                const IconComponent = LucideIcons[iconName];
                if (!IconComponent) return null;
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex aspect-square items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-zinc-100 py-3 font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-zinc-900 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
