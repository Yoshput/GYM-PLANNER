"use client";

import { useState, useEffect } from "react";

// Helper keys
const KEYS = {
  WORKOUT_LOGS: "gymplanner_workout_logs",
  BODY_LOGS: "gymplanner_body_logs",
  PR_RECORDS: "gymplanner_pr_records",
  CHECKLIST: "gymplanner_daily_checklist",
  RECOVERY: "gymplanner_recovery_logs",
  STREAK: "gymplanner_streak",
};

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage key", key, error);
  }
}

// 1. WORKOUT LOGS
export function useWorkoutLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(getLocalStorage(KEYS.WORKOUT_LOGS, []));
  }, []);

  const addLog = (log: any) => {
    const updated = [log, ...logs];
    setLogs(updated);
    setLocalStorage(KEYS.WORKOUT_LOGS, updated);
    
    // Update streak on success
    updateStreakOnWorkout();
  };

  const clearLogs = () => {
    setLogs([]);
    setLocalStorage(KEYS.WORKOUT_LOGS, []);
  };

  return { logs, addLog, clearLogs };
}

// 2. STREAK TRACKER
export function useStreak() {
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });

  useEffect(() => {
    setStreak(getLocalStorage(KEYS.STREAK, { count: 0, lastDate: "" }));
  }, []);

  return streak;
}

function updateStreakOnWorkout() {
  if (typeof window === "undefined") return;
  const todayStr = new Date().toDateString();
  const streak = getLocalStorage(KEYS.STREAK, { count: 0, lastDate: "" });
  
  if (streak.lastDate === todayStr) return; // already counted today

  let newCount = 1;
  if (streak.lastDate) {
    const lastDate = new Date(streak.lastDate);
    const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newCount = streak.count + 1;
    } else {
      newCount = 1; // reset streak if missed a day
    }
  }
  
  setLocalStorage(KEYS.STREAK, { count: newCount, lastDate: todayStr });
}

// 3. DAILY CHECKLIST
export function useDailyChecklist() {
  const todayStr = new Date().toDateString();
  const [checklist, setChecklist] = useState<any>({
    date: todayStr,
    workout: false,
    protein: false,
    calories: false,
    water: false,
    sleep: false,
    steps: false,
    stretching: false,
  });

  useEffect(() => {
    const stored = getLocalStorage<any>(KEYS.CHECKLIST, null);
    if (stored && stored.date === todayStr) {
      setChecklist(stored);
    } else {
      const fresh = {
        date: todayStr,
        workout: false,
        protein: false,
        calories: false,
        water: false,
        sleep: false,
        steps: false,
        stretching: false,
      };
      setChecklist(fresh);
      setLocalStorage(KEYS.CHECKLIST, fresh);
    }
  }, [todayStr]);

  const toggleItem = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    setLocalStorage(KEYS.CHECKLIST, updated);
  };

  return { checklist, toggleItem };
}

// 4. RECOVERY SCORE
export function useRecoveryLog() {
  const todayStr = new Date().toDateString();
  const [todayLog, setTodayLog] = useState<any | null>(null);

  useEffect(() => {
    const logs = getLocalStorage<any[]>(KEYS.RECOVERY, []);
    const found = logs.find((l) => l.date === todayStr);
    if (found) setTodayLog(found);
  }, [todayStr]);

  const saveRecovery = (sleep: number, stress: number, soreness: number, energy: number) => {
    // Score calculation algorithm
    const sleepScore = (sleep / 9) * 100; // ideal 9 hours
    const stressScore = ((10 - stress) / 10) * 100;
    const sorenessScore = ((10 - soreness) / 10) * 100;
    const energyScore = (energy / 10) * 100;
    
    const overallScore = Math.min(
      100,
      Math.round(sleepScore * 0.35 + energyScore * 0.3 + sorenessScore * 0.2 + stressScore * 0.15)
    );

    const logs = getLocalStorage<any[]>(KEYS.RECOVERY, []);
    const filtered = logs.filter((l) => l.date !== todayStr);
    const newLog = {
      date: todayStr,
      sleep,
      stress,
      soreness,
      energy,
      score: overallScore,
    };
    
    const updated = [newLog, ...filtered];
    setLocalStorage(KEYS.RECOVERY, updated);
    setTodayLog(newLog);
  };

  return { todayLog, saveRecovery };
}
