import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, updateDoc, writeBatch, onSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Activity } from '../types';

const STORAGE_KEY = 'cooldown_activities';

export function useActivities() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // 1. Sync from LocalStorage when offline/logged-out
  useEffect(() => {
    if (!currentUser) {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        setActivities(item ? JSON.parse(item) : []);
        setError(null);
      } catch (error) {
        console.error('Failed to parse activities from localStorage', error);
        setActivities([]);
      }
      return;
    }

    // 2. Sync from Firestore when logged-in
    const q = collection(db, 'users', currentUser.uid, 'activities');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const acts: Activity[] = [];
      snapshot.forEach((doc) => {
        acts.push(doc.data() as Activity);
      });
      // Keep activities sorted by creation date
      acts.sort((a, b) => a.createdAt - b.createdAt);
      setActivities(acts);
      setError(null); // Clear error on successful read
    }, (err: FirestoreError) => {
      console.error('Firestore subscription error', err);
      setError(`Sync failed: ${err.message || 'Permission denied or connection issue.'}`);
    });

    return unsubscribe;
  }, [currentUser]);

  // 3. Write to LocalStorage only when logged-out
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, currentUser]);

  // 4. Data migration on login
  useEffect(() => {
    if (!currentUser) return;

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const localActs: Activity[] = JSON.parse(localData);
        if (localActs.length > 0) {
          const batch = writeBatch(db);
          localActs.forEach((act) => {
            const docRef = doc(db, 'users', currentUser.uid, 'activities', act.id);
            batch.set(docRef, act);
          });
          batch.commit().then(() => {
            localStorage.removeItem(STORAGE_KEY);
            setError(null);
          }).catch((err: FirestoreError) => {
            console.error('Batch commit migration failed', err);
            setError(`Failed to migrate local data: ${err.message}`);
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err: any) {
        console.error('Failed to migrate local activities', err);
        setError('Failed to parse local activities for migration.');
      }
    }
  }, [currentUser]);

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'lastTriggeredAt'>) => {
    setError(null);
    const id = crypto.randomUUID();
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: Date.now(),
      lastTriggeredAt: null,
    };

    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
        await setDoc(docRef, newActivity);
      } catch (err: any) {
        console.error('Firestore addActivity error', err);
        setError(`Failed to save activity: ${err.message || 'Permission denied.'}`);
        throw err;
      }
    } else {
      setActivities((prev) => [...prev, newActivity]);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>) => {
    setError(null);
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
        await updateDoc(docRef, updates);
      } catch (err: any) {
        console.error('Firestore updateActivity error', err);
        setError(`Failed to update activity: ${err.message || 'Permission denied.'}`);
      }
    } else {
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, ...updates } : act))
      );
    }
  };

  const deleteActivity = async (id: string) => {
    setError(null);
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
        await deleteDoc(docRef);
      } catch (err: any) {
        console.error('Firestore deleteActivity error', err);
        setError(`Failed to delete activity: ${err.message || 'Permission denied.'}`);
      }
    } else {
      setActivities((prev) => prev.filter((act) => act.id !== id));
    }
  };

  const triggerActivity = async (id: string) => {
    setError(null);
    const timestamp = Date.now();
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
        await updateDoc(docRef, { lastTriggeredAt: timestamp });
      } catch (err: any) {
        console.error('Firestore triggerActivity error', err);
        setError(`Failed to trigger activity: ${err.message || 'Permission denied.'}`);
      }
    } else {
      setActivities((prev) =>
        prev.map((act) =>
          act.id === id ? { ...act, lastTriggeredAt: timestamp } : act
        )
      );
    }
  };

  const untriggerActivity = async (id: string, previousTimestamp: number | null) => {
    setError(null);
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
        await updateDoc(docRef, { lastTriggeredAt: previousTimestamp });
      } catch (err: any) {
        console.error('Firestore untriggerActivity error', err);
        setError(`Failed to undo activity trigger: ${err.message || 'Permission denied.'}`);
      }
    } else {
      setActivities((prev) =>
        prev.map((act) =>
          act.id === id ? { ...act, lastTriggeredAt: previousTimestamp } : act
        )
      );
    }
  };

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    triggerActivity,
    untriggerActivity,
    error,
    clearError,
  };
}
