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
  CloudOff,
  AlertCircle
} from 'lucide-react';
import { isAvailable, getNextResetTime } from '../utils/time';
import type { Activity } from '../types';

type FilterType = 'All' | 'Available' | 'On Cooldown';

export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { activities, addActivity, updateActivity, deleteActivity, triggerActivity, untriggerActivity, error: firestoreError, clearError } = useActivities();
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
    <div className="mx-auto max-w-5xl px-4 py-5 sm:py-8">
      {firestoreError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 shadow-sm relative animate-slide-up">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">Cloud Sync Alert</h4>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              {firestoreError}
            </p>
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Important: Please check your Firebase Console Firestore Database rules. If they are in locked mode or have expired, writes/reads will fail.
            </p>
          </div>
          <button
            onClick={clearError}
            className="text-amber-600 hover:text-amber-800 transition-colors text-xs font-semibold px-2 py-1 rounded-lg hover:bg-amber-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <header className="mb-5 sm:mb-10 flex flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-1.5 sm:gap-3">
            <img src="/logo.png" alt="Cooldown Logo" className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg object-cover shadow-sm" />
            Cooldown
            {currentUser ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-green-100 font-medium">
                <Cloud className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Synced</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] text-zinc-500 bg-zinc-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-zinc-200 font-medium">
                <CloudOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Local</span>
              </span>
            )}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm hidden sm:block">
            Manage your activities and habits.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 sm:p-2 hover:bg-zinc-50 transition-colors shadow-sm"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Profile'}
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-zinc-100 text-[10px] sm:text-xs font-semibold text-zinc-700">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-700 hidden sm:inline-block max-w-30 truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl animate-slide-up text-left">
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
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98]"
            >
              <LogIn className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span>Sign In</span>
              <span className="hidden sm:inline"> to Sync</span>
            </button>
          )}

          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-zinc-200 bg-white p-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Plus className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Add Activity</span>
          </button>
        </div>
      </header>

      <div className="mb-5 sm:mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
