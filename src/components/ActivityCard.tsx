import React, { useState, useEffect } from 'react';
import type { Activity } from '../types';
import { getNextResetTime, formatTimeRemaining, isAvailable, formatCooldown } from '../utils/time';
import { Clock, CheckCircle, Lock, Edit3, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onTrigger: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onTrigger, onDelete, onEdit }: ActivityCardProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!activity.lastTriggeredAt) {
      setAvailable(true);
      setProgress(100);
      return;
    }

    const resetTime = getNextResetTime(activity.lastTriggeredAt, activity.cooldownValue, activity.cooldownUnit);
    const totalDuration = resetTime - activity.lastTriggeredAt;

    const updateStatus = () => {
      const isAvail = isAvailable(resetTime);
      setAvailable(isAvail);
      if (isAvail) {
        setProgress(100);
      } else {
        setTimeLeftStr(formatTimeRemaining(resetTime));
        const elapsed = Date.now() - activity.lastTriggeredAt!;
        const pct = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
        setProgress(Math.min(100, Math.max(0, pct)));
      }
    };

    updateStatus();

    // Only set interval if it's not available
    let intervalId: ReturnType<typeof setInterval>;
    if (!isAvailable(resetTime)) {
      intervalId = setInterval(updateStatus, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activity.lastTriggeredAt, activity.cooldownValue, activity.cooldownUnit]);

  // Determine Icon component
  // @ts-expect-error - LucideIcons is a module with many exports
  const IconComponent = activity.icon && LucideIcons[activity.icon] ? LucideIcons[activity.icon] : Clock;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${available ? 'border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 hover:shadow-md' : 'border-zinc-100 bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-900/20'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${available ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-500'}`}>
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${available ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{activity.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cooldown: {formatCooldown(activity.cooldownValue, activity.cooldownUnit)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <button onClick={() => onEdit(activity)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" aria-label="Edit">
              <Edit3 size={18} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(activity.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" aria-label="Delete">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {/* Readiness Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Readiness</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-850">
            <div 
              className={`h-full transition-all duration-300 ${
                progress <= 20 ? 'bg-red-500' : progress <= 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {available ? (
          <button
            onClick={() => onTrigger(activity.id)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Trigger Activity
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-xl bg-zinc-100 py-3 font-medium text-zinc-400 flex items-center justify-center gap-2 cursor-not-allowed dark:bg-zinc-800/50 dark:text-zinc-500"
          >
            <Lock size={20} />
            {timeLeftStr}
          </button>
        )}
      </div>
    </div>
  );
}
