import { Gender, Goal, MacroTargets, UserProfile } from "@/types";

/**
 * Estimates age-independent BMR using the Mifflin-St Jeor equation,
 * adjusted with a fixed assumed age band (25) since the onboarding
 * flow intentionally keeps inputs minimal (no login, no age field).
 * Body fat % is used to lean the estimate toward lean body mass via
 * the Katch-McArdle formula when available, which is more accurate
 * for people who know their body fat percentage.
 */
function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, gender, bodyFatPct } = profile;

  if (bodyFatPct > 0) {
    const leanBodyMass = weightKg * (1 - bodyFatPct / 100);
    // Katch-McArdle
    return 370 + 21.6 * leanBodyMass;
  }

  // Mifflin-St Jeor fallback (assumes age 25)
  const base = 10 * weightKg + 6.25 * heightCm - 5 * 25;
  return gender === "male" ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIER = 1.55; // "moderately active" baseline for someone following a structured 7-day plan

function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * ACTIVITY_MULTIPLIER;
}

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  cutting: -0.2, // 20% deficit
  bulking: 0.15, // 15% surplus
  maintenance: 0,
};

const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  cutting: 2.2, // higher protein to preserve lean mass in a deficit
  bulking: 1.8,
  maintenance: 2.0,
};

const GOAL_FAT_PCT_OF_CALORIES: Record<Goal, number> = {
  cutting: 0.25,
  bulking: 0.25,
  maintenance: 0.28,
};

export function calculateMacros(profile: UserProfile): MacroTargets {
  const tdee = calculateTDEE(profile);
  const calorieTarget = Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENT[profile.goal]));

  const proteinG = Math.round(profile.weightKg * GOAL_PROTEIN_PER_KG[profile.goal]);
  const proteinKcal = proteinG * 4;

  const fatKcal = Math.round(calorieTarget * GOAL_FAT_PCT_OF_CALORIES[profile.goal]);
  const fatG = Math.round(fatKcal / 9);

  const carbsKcal = Math.max(calorieTarget - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbsKcal / 4);

  return {
    tdee: Math.round(tdee),
    calorieTarget,
    proteinG,
    carbsG,
    fatG,
    proteinKcal,
    carbsKcal,
    fatKcal,
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
