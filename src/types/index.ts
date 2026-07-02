export type Gender = "male" | "female";
export type Goal = "cutting" | "bulking" | "maintenance" | "powerlifting";
export type ExperienceLevel = "beginner" | "intermediate" | "expert";
export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ExperienceMode = "simple" | "advanced";
export type GymEquipment = "commercial" | "home" | "dumbbell" | "bodyweight" | "machine";
export type TrainingStyle = "ppl" | "upper_lower" | "arnold" | "full_body" | "bro" | "auto";

export interface UserProfile {
  name: string;
  profileImage?: string; // base64 string
  gender: Gender;
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
  goal: Goal;
  experience: ExperienceLevel;
  createdAt: string;
  experienceMode: ExperienceMode;
  equipment: GymEquipment;
  durationMinutes: number;
  trainingDays: number;
  trainingStyle: TrainingStyle;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string; // e.g. "12-15" or "6-8"
  intensity: "Low" | "Moderate" | "High" | "Max";
  restSeconds: number;
  cue: string; // short technique cue shown in the modal
  equipment: string;
  imageUrl?: string;
}

export interface DayPlan {
  day: Day;
  label: string; // e.g. "Push Day", "Rest & Recover"
  focus: string;
  isRestDay: boolean;
  exercises: Exercise[];
}

export type WorkoutSplit = Record<Day, DayPlan>;

export interface MacroTargets {
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
}

export interface MealSuggestion {
  name: string;
  description: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  kcal: number;
  tag: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface WorkoutLogEntry {
  date: string; // ISO date
  day: Day;
  exerciseId: string;
  completedSets: number;
  weightUsed?: number;
  notes?: string;
}

export interface SetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion
  rir?: number; // Reps in Reserve
  tempo?: string; // e.g., "3-0-1-0"
  completed: boolean;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  durationMinutes: number;
  exercises: {
    exerciseId: string;
    name: string;
    sets: SetLog[];
  }[];
  totalVolume: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface PRRecord {
  exerciseId: string;
  weightKg: number;
  reps: number;
  est1RM: number;
  date: string;
  type: "1RM" | "3RM" | "5RM" | "8RM" | "10RM";
}

export interface BodyEntry {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  bmi?: number;
  chestCm?: number;
  shoulderCm?: number;
  waistCm?: number;
  armCm?: number;
  forearmCm?: number;
  hipCm?: number;
  thighCm?: number;
  calfCm?: number;
  neckCm?: number;
}

export interface DailyChecklist {
  date: string;
  workout: boolean;
  protein: boolean;
  calories: boolean;
  water: boolean;
  sleep: boolean;
  steps: boolean;
  stretching: boolean;
}

export interface RecoveryEntry {
  date: string;
  sleepHours: number;
  stressLevel: number; // 1-10
  muscleSoreness: number; // 1-10
  energyLevel: number; // 1-10
  score: number; // 0-100
}

