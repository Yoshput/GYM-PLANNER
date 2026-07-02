import { UserProfile, WorkoutLogEntry } from "@/types";

const KEYS = {
  profile: "gym-planner:profile",
  logs: "gym-planner:logs",
  split: "gym-planner:custom-split",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(KEYS.profile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.profile);
  window.localStorage.removeItem(KEYS.logs);
  window.localStorage.removeItem(KEYS.split);
}

export function getCustomSplit(): any | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(KEYS.split);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomSplit(split: any): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEYS.split, JSON.stringify(split));
}

export function getLogs(): WorkoutLogEntry[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(KEYS.logs);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutLogEntry[];
  } catch {
    return [];
  }
}

export function addLogEntry(entry: WorkoutLogEntry): void {
  if (!isBrowser()) return;
  const logs = getLogs();
  logs.push(entry);
  window.localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function isExerciseCompletedToday(exerciseId: string, dateISO: string): boolean {
  const logs = getLogs();
  return logs.some((l) => l.exerciseId === exerciseId && l.date === dateISO);
}
