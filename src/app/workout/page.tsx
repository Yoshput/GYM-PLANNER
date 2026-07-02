"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Layers, Repeat, Moon, Dumbbell } from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { generateWorkoutSplit, DAY_ORDER, DAY_LABELS } from "@/data/workouts";
import ExerciseModal from "@/components/dashboard/ExerciseModal";
import { Day, Exercise } from "@/types";

const INTENSITY_DOT: Record<Exercise["intensity"], string> = {
  Low: "bg-white/30",
  Moderate: "bg-lime shadow-[0_0_6px_rgba(204,255,0,0.7)]",
  High: "bg-ember shadow-[0_0_6px_rgba(255,69,0,0.7)]",
  Max: "bg-ember shadow-[0_0_10px_rgba(255,69,0,0.9)]",
};

const INTENSITY_BADGE: Record<Exercise["intensity"], string> = {
  Low: "bg-white/8 text-white/50",
  Moderate: "bg-lime/12 text-lime",
  High: "bg-ember/12 text-ember",
  Max: "bg-ember/20 text-ember",
};

function getTodayKey(): Day {
  const idx = new Date().getDay();
  const map: Day[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[idx];
}

export default function WorkoutPage() {
  return (
    <AppShell>
      <WorkoutContent />
    </AppShell>
  );
}

function WorkoutContent() {
  const { profile } = useProfile();
  const [activeDay, setActiveDay] = useState<Day>(getTodayKey());
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const split = useMemo(
    () => (profile ? generateWorkoutSplit(profile.experience, profile.goal) : null),
    [profile]
  );

  if (!profile || !split) return null;

  const dayPlan = split[activeDay];

  return (
    <main className="pt-safe pt-8 pb-6 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="px-5 mb-5 animate-slide-down-fade">
        <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Your Split</p>
        <h1 className="heading-brutal text-3xl">
          7-Day <span className="text-gradient-lime">Program</span>
        </h1>
      </div>

      {/* ── Day tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 pb-4 mb-2">
        {DAY_ORDER.map((day) => {
          const active = day === activeDay;
          const isToday = day === getTodayKey();
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-all duration-200 relative ${
                active
                  ? "bg-lime text-base border-lime shadow-[0_0_16px_rgba(204,255,0,0.35)]"
                  : "border-base-border/60 text-white/45 bg-base-raised/30 hover:border-base-border active:scale-95"
              }`}
            >
              {DAY_LABELS[day].slice(0, 3)}
              {isToday && !active && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ember border border-base" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5">
        {/* ── Day header card ── */}
        <div className="glass-card p-5 mb-4 relative overflow-hidden animate-scale-in">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-lime/8 blur-2xl" />
          <p className="text-lime text-xs font-bold uppercase tracking-widest mb-1">
            {DAY_LABELS[activeDay]}
          </p>
          <h2 className="heading-brutal text-2xl mb-1">{dayPlan.label}</h2>
          <p className="text-white/50 text-sm">{dayPlan.focus}</p>
          {!dayPlan.isRestDay && (
            <div className="mt-3 flex items-center gap-2">
              <span className="chip bg-base-raised text-white/50 text-[10px] border border-base-border/40">
                {dayPlan.exercises.length} exercises
              </span>
            </div>
          )}
        </div>

        {/* ── Exercise list / Rest ── */}
        {dayPlan.isRestDay ? (
          <div className="glass-card flex flex-col items-center justify-center gap-4 py-14 text-center animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-base-raised/80 border border-base-border flex items-center justify-center">
              <Moon size={26} className="text-white/35" />
            </div>
            <div>
              <p className="font-display font-bold uppercase tracking-wide mb-1">Recovery Day</p>
              <p className="text-white/40 text-sm max-w-[220px] leading-relaxed">
                Sleep, hydration, and light movement do the work today. No lifting scheduled.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dayPlan.exercises.map((exercise, idx) => (
              <button
                key={exercise.id}
                onClick={() => setActiveExercise(exercise)}
                className={`w-full glass-card flex items-center gap-4 p-4 text-left active:scale-[0.98] transition-all duration-150 hover:border-white/10 animate-stagger-in`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Number badge */}
                <div className="h-10 w-10 shrink-0 rounded-xl bg-base-raised border border-base-border/60 flex items-center justify-center font-display font-extrabold text-white/40 text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${INTENSITY_DOT[exercise.intensity]}`} />
                    <p className="font-display font-bold uppercase tracking-wide text-sm truncate">
                      {exercise.name}
                    </p>
                  </div>
                  <p className="text-white/35 text-xs truncate mb-1.5">{exercise.targetMuscle}</p>
                  <div className="flex items-center gap-3">
                    <span className={`chip text-[10px] py-0.5 px-2 ${INTENSITY_BADGE[exercise.intensity]}`}>
                      {exercise.intensity}
                    </span>
                    <span className="inline-flex items-center gap-1 text-white/40 text-xs">
                      <Layers size={10} /> {exercise.sets}s
                    </span>
                    <span className="inline-flex items-center gap-1 text-white/40 text-xs">
                      <Repeat size={10} /> {exercise.reps}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Branding footer ── */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-base-border/30">
          <Dumbbell size={12} className="text-lime/40" />
          <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">
            Made by <span className="text-lime/50">Yossika</span> from Sokaraja
          </p>
          <Dumbbell size={12} className="text-lime/40" />
        </div>
      </div>

      {activeExercise && (
        <ExerciseModal
          exercise={activeExercise}
          dayKey={activeDay}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </main>
  );
}
