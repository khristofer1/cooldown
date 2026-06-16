import React, { useState } from 'react';
import { ActivityCard } from './ActivityCard';
import { ActivityForm } from './ActivityForm';
import { useActivities } from '../hooks/useActivities';
import { Plus, LayoutGrid, Timer, CheckCircle2 } from 'lucide-react';
import { isAvailable, getNextResetTime } from '../utils/time';
import type { Activity } from '../types';

type FilterType = 'All' | 'Available' | 'On Cooldown';

export function Dashboard() {
  const { activities, addActivity, updateActivity, deleteActivity, triggerActivity } = useActivities();
  const [filter, setFilter] = useState<FilterType>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'All') return true;
    
    const isAvail = !activity.lastTriggeredAt || isAvailable(getNextResetTime(activity.lastTriggeredAt, activity.cooldownValue, activity.cooldownUnit));
    
    if (filter === 'Available') return isAvail;
    if (filter === 'On Cooldown') return !isAvail;
    
    return true;
  });

  const handleOpenNewForm = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Timer className="text-zinc-500 dark:text-zinc-400" />
            Cooldown
          </h1>
          <p className="text-zinc-500 mt-1">Manage your activities and habits.</p>
        </div>
        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <Plus size={20} />
          Add Activity
        </button>
      </header>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['All', 'Available', 'On Cooldown'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-colors ${
              filter === f
                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            {f === 'All' && <LayoutGrid size={16} className="inline mr-2" />}
            {f === 'Available' && <CheckCircle2 size={16} className="inline mr-2" />}
            {f === 'On Cooldown' && <Timer size={16} className="inline mr-2" />}
            {f}
          </button>
        ))}
      </div>

      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 py-20 text-center dark:border-zinc-800">
          <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900/50">
            <Timer size={32} className="text-zinc-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">No activities found</h3>
          <p className="mb-6 max-w-sm text-zinc-500 dark:text-zinc-400">
            {filter === 'All'
              ? "You haven't added any activities yet. Start tracking your cooldowns now."
              : `You don't have any activities currently ${filter.toLowerCase()}.`}
          </p>
          {filter === 'All' && (
            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Plus size={20} />
              Add First Activity
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onTrigger={triggerActivity}
              onDelete={deleteActivity}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ActivityForm
          initialData={editingActivity}
          onSubmit={(data) => {
            if (editingActivity) {
              updateActivity(editingActivity.id, data);
            } else {
              addActivity(data);
            }
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
