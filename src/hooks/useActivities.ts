import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { Activity } from '../types';

const STORAGE_KEY = 'cooldown_activities';

export function useActivities() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  // 1. Sync from LocalStorage when offline/logged-out
  useEffect(() => {
    if (!currentUser) {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        setActivities(item ? JSON.parse(item) : []);
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
    }, (error) => {
      console.error('Firestore subscription error', error);
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
          }).catch((err) => {
            console.error('Batch commit migration failed', err);
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        console.error('Failed to migrate local activities', err);
      }
    }
  }, [currentUser]);

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'lastTriggeredAt'>) => {
    const id = crypto.randomUUID();
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: Date.now(),
      lastTriggeredAt: null,
    };

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
      await setDoc(docRef, newActivity);
    } else {
      setActivities((prev) => [...prev, newActivity]);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
      await updateDoc(docRef, updates);
    } else {
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, ...updates } : act))
      );
    }
  };

  const deleteActivity = async (id: string) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
      await deleteDoc(docRef);
    } else {
      setActivities((prev) => prev.filter((act) => act.id !== id));
    }
  };

  const triggerActivity = async (id: string) => {
    const timestamp = Date.now();
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
      await updateDoc(docRef, { lastTriggeredAt: timestamp });
    } else {
      setActivities((prev) =>
        prev.map((act) =>
          act.id === id ? { ...act, lastTriggeredAt: timestamp } : act
        )
      );
    }
  };

  const untriggerActivity = async (id: string, previousTimestamp: number | null) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'activities', id);
      await updateDoc(docRef, { lastTriggeredAt: previousTimestamp });
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
  };
}
