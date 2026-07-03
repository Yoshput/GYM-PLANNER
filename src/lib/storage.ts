import { UserProfile, WorkoutLogEntry } from "@/types";

const KEYS = {
  profile: "gym-planner:profile",
  logs: "gym-planner:logs",
  split: "gym-planner:custom-split",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

// Safari-safe localStorage wrapper — handles Private Mode & ITP gracefully
function safeGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Safari Private Mode throws QuotaExceededError — silently ignore
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

export function saveProfile(profile: UserProfile): void {
  safeSet(KEYS.profile, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
  const raw = safeGet(KEYS.profile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  safeRemove(KEYS.profile);
  safeRemove(KEYS.logs);
  safeRemove(KEYS.split);
}

export function getCustomSplit(): any | null {
  const raw = safeGet(KEYS.split);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomSplit(split: any): void {
  safeSet(KEYS.split, JSON.stringify(split));
}

export function getLogs(): WorkoutLogEntry[] {
  const raw = safeGet(KEYS.logs);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutLogEntry[];
  } catch {
    return [];
  }
}

export function addLogEntry(entry: WorkoutLogEntry): void {
  const logs = getLogs();
  logs.push(entry);
  safeSet(KEYS.logs, JSON.stringify(logs));
}

export function isExerciseCompletedToday(exerciseId: string, dateISO: string): boolean {
  const logs = getLogs();
  return logs.some((l) => l.exerciseId === exerciseId && l.date === dateISO);
}
