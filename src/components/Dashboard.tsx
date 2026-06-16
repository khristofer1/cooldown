import { useState, useRef, useEffect } from 'react';
import { ActivityCard } from './ActivityCard';
import { ActivityForm } from './ActivityForm';
import { LoginModal } from './LoginModal';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  LayoutGrid, 
  Timer, 
  CheckCircle2, 
  Undo2, 
  LogIn, 
  LogOut, 
  Cloud, 
  CloudOff 
} from 'lucide-react';
import { isAvailable, getNextResetTime } from '../utils/time';
import type { Activity } from '../types';

type FilterType = 'All' | 'Available' | 'On Cooldown';

export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { activities, addActivity, updateActivity, deleteActivity, triggerActivity, untriggerActivity } = useActivities();
  const [filter, setFilter] = useState<FilterType>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [toast, setToast] = useState<{
    activityId: string;
    activityName: string;
    previousTimestamp: number | null;
  } | null>(null);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTrigger = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    setToast({
      activityId: id,
      activityName: activity.name,
      previousTimestamp: activity.lastTriggeredAt,
    });

    triggerActivity(id);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (!toast) return;
    untriggerActivity(toast.activityId, toast.previousTimestamp);
    setToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
            <Timer className="text-zinc-500" />
            Cooldown
          </h1>
          <p className="text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5">
            Manage your activities and habits.
            {currentUser ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-medium">
                <Cloud size={10} />
                Cloud Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200 font-medium">
                <CloudOff size={10} />
                Local Only
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 transition-colors shadow-sm"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Profile'}
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-700 hidden sm:inline-block max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl animate-slide-up">
                    <div className="px-3 py-2 border-b border-zinc-100 text-[11px] text-zinc-400 truncate">
                      {currentUser.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-650 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98]"
            >
              <LogIn size={18} />
              Sign In to Sync
            </button>
          )}

          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Plus size={20} />
            Add Activity
          </button>
        </div>
      </header>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['All', 'Available', 'On Cooldown'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-colors ${
              filter === f
                ? 'bg-zinc-200 text-zinc-900'
                : 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-100 p-4">
            <Timer size={32} className="text-zinc-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-zinc-900">No activities found</h3>
          <p className="mb-6 max-w-sm text-zinc-500">
            {filter === 'All'
              ? "You haven't added any activities yet. Start tracking your cooldowns now."
              : `You don't have any activities currently ${filter.toLowerCase()}.`}
          </p>
          {filter === 'All' && (
            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
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
              onTrigger={handleTrigger}
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

      {isLoginOpen && (
        <LoginModal onClose={() => setIsLoginOpen(false)} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
            <p className="text-sm font-medium text-zinc-950">
              Triggered <strong>{toast.activityName}</strong>
            </p>
          </div>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <Undo2 size={12} />
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
