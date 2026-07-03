"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronRight, Layers, Repeat, Moon, Dumbbell, Edit3, Trash2, PlusCircle, Check, X, Sparkles, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { generateWorkoutSplit, DAY_ORDER, DAY_LABELS } from "@/data/workouts";
import { getCustomSplit, saveCustomSplit } from "@/lib/storage";
import ExerciseModal from "@/components/dashboard/ExerciseModal";
import { Day, Exercise, WorkoutSplit } from "@/types";

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
  
  // Custom Split states
  const [customSplit, setCustomSplit] = useState<WorkoutSplit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Custom Add Exercise Form states
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("10-12");
  const [newExIntensity, setNewExIntensity] = useState<Exercise["intensity"]>("Moderate");
  const [newExRest, setNewExRest] = useState(60);
  const [newExCue, setNewExCue] = useState("");
  const [newExEquip, setNewExEquip] = useState("Dumbbell");

  // Load / Initialize Split
  useEffect(() => {
    if (!profile) return;
    const localSplit = getCustomSplit();
    if (localSplit) {
      setCustomSplit(localSplit);
    } else {
      const generated = generateWorkoutSplit(profile.experience, profile.goal);
      setCustomSplit(generated);
      saveCustomSplit(generated);
    }
  }, [profile]);

  const handleResetToDefault = () => {
    if (!profile) return;
    if (confirm("Apakah Anda yakin ingin menyetel ulang program latihan ke rekomendasi bawaan? Semua kustomisasi Anda akan hilang.")) {
      const generated = generateWorkoutSplit(profile.experience, profile.goal);
      setCustomSplit(generated);
      saveCustomSplit(generated);
    }
  };

  const handleUpdateExercise = (updated: Exercise) => {
    if (!customSplit) return;
    
    const dayPlan = customSplit[activeDay];
    const updatedExercises = dayPlan.exercises.map(ex => ex.id === updated.id ? updated : ex);
    
    const updatedSplit = {
      ...customSplit,
      [activeDay]: {
        ...dayPlan,
        exercises: updatedExercises
      }
    };
    
    setCustomSplit(updatedSplit);
    saveCustomSplit(updatedSplit);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exId: string) => {
    if (!customSplit) return;
    if (!window.confirm("Hapus latihan ini dari program hari ini?")) return;
    const dayPlan = customSplit[activeDay];
    const updatedExercises = dayPlan.exercises.filter(ex => ex.id !== exId);
    const updatedSplit = {
      ...customSplit,
      [activeDay]: { ...dayPlan, exercises: updatedExercises }
    };
    setCustomSplit(updatedSplit);
    saveCustomSplit(updatedSplit);
  };

  const handleMoveExercise = (exId: string, direction: "up" | "down") => {
    if (!customSplit) return;
    const dayPlan = customSplit[activeDay];
    const exercises = [...dayPlan.exercises];
    const idx = exercises.findIndex(ex => ex.id === exId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];
    const updatedSplit = {
      ...customSplit,
      [activeDay]: { ...dayPlan, exercises }
    };
    setCustomSplit(updatedSplit);
    saveCustomSplit(updatedSplit);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSplit || !newExName.trim()) return;

    const dayPlan = customSplit[activeDay];
    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: newExName.trim(),
      targetMuscle: newExMuscle.trim() || "Seluruh Tubuh",
      sets: newExSets,
      reps: newExReps.trim() || "10-12",
      intensity: newExIntensity,
      restSeconds: newExRest,
      cue: newExCue.trim() || "Lakukan gerakan secara terkontrol.",
      equipment: newExEquip.trim() || "Berat Badan"
    };

    const updatedSplit = {
      ...customSplit,
      [activeDay]: {
        ...dayPlan,
        isRestDay: false, // Auto-aktifkan hari latihan jika ditambah
        exercises: [...dayPlan.exercises, newEx]
      }
    };

    setCustomSplit(updatedSplit);
    saveCustomSplit(updatedSplit);

    // Reset Form
    setNewExName("");
    setNewExMuscle("");
    setNewExSets(3);
    setNewExReps("10-12");
    setNewExIntensity("Moderate");
    setNewExRest(60);
    setNewExCue("");
    setNewExEquip("Dumbbell");
    setShowAddForm(false);
  };

  const toggleRestDay = () => {
    if (!customSplit) return;
    const dayPlan = customSplit[activeDay];
    const updatedSplit = {
      ...customSplit,
      [activeDay]: {
        ...dayPlan,
        isRestDay: !dayPlan.isRestDay,
        label: !dayPlan.isRestDay ? "Recovery Day" : "Custom Workout Day",
        focus: !dayPlan.isRestDay ? "Recovery" : "Latihan kekuatan terprogram"
      }
    };
    setCustomSplit(updatedSplit);
    saveCustomSplit(updatedSplit);
  };

  if (!profile || !customSplit) return null;

  const dayPlan = customSplit[activeDay];

  return (
    <main className="pt-safe pt-8 pb-6 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="px-5 mb-5 flex justify-between items-end animate-slide-down-fade">
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Your Split</p>
          <h1 className="heading-brutal text-3xl">
            7-Day <span className="text-gradient-lime">Program</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleResetToDefault}
            className="h-8 px-3 rounded-lg bg-base-raised/70 border border-base-border/55 flex items-center justify-center text-white/50 hover:text-white/80 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            <RefreshCw size={11} className="mr-1" /> Reset
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`h-8 px-3 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all border ${
              isEditing 
                ? "bg-lime text-base border-lime shadow-[0_0_10px_rgba(204,255,0,0.2)]" 
                : "bg-base-raised/70 border-base-border/55 text-white/50 hover:text-white/80"
            }`}
          >
            <Edit3 size={11} className="mr-1" /> {isEditing ? "Selesai" : "Kustom"}
          </button>
        </div>
      </div>

      {/* ── Day tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 pb-4 mb-2">
        {DAY_ORDER.map((day) => {
          const active = day === activeDay;
          const isToday = day === getTodayKey();
          return (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setShowAddForm(false);
              }}
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
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lime text-xs font-bold uppercase tracking-widest mb-1">
                {DAY_LABELS[activeDay]}
              </p>
              <h2 className="heading-brutal text-2xl mb-1">{dayPlan.label}</h2>
              <p className="text-white/50 text-sm">{dayPlan.focus}</p>
            </div>
            {isEditing && (
              <button 
                onClick={toggleRestDay}
                className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 border border-white/10"
              >
                {dayPlan.isRestDay ? "Set Latihan" : "Set Istirahat"}
              </button>
            )}
          </div>
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
              <p className="text-white/40 text-sm max-w-[220px] leading-relaxed mb-4">
                Tidur, hidrasi, dan mobilitas ringan. Tidak ada latihan terprogram hari ini.
              </p>
              {isEditing && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary py-2 px-4 text-xs"
                >
                  <PlusCircle size={14} className="mr-1.5" /> Tambah Gerakan Kustom
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dayPlan.exercises.map((exercise, idx) => (
              <div 
                key={exercise.id} 
                className="relative group flex items-center gap-2"
              >
                {/* Reorder buttons — visible only in edit mode */}
                {isEditing && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onTouchEnd={(e) => { e.preventDefault(); handleMoveExercise(exercise.id, "up"); }}
                      onClick={() => handleMoveExercise(exercise.id, "up")}
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 disabled:opacity-20 active:bg-white/10 transition-all"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === dayPlan.exercises.length - 1}
                      onTouchEnd={(e) => { e.preventDefault(); handleMoveExercise(exercise.id, "down"); }}
                      onClick={() => handleMoveExercise(exercise.id, "down")}
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 disabled:opacity-20 active:bg-white/10 transition-all"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                )}

                {/* Exercise card — using div instead of nested button to fix iOS Safari tap bug */}
                <div
                  role="button"
                  tabIndex={0}
                  onTouchEnd={(e) => {
                    // Only trigger if not tapping action buttons
                    if ((e.target as HTMLElement).closest('[data-action]')) return;
                    if (isEditing) setEditingExercise(exercise);
                    else setActiveExercise(exercise);
                  }}
                  onClick={() => {
                    if (isEditing) setEditingExercise(exercise);
                    else setActiveExercise(exercise);
                  }}
                  className={`flex-1 glass-card flex items-center gap-4 p-4 text-left active:scale-[0.98] transition-all duration-150 hover:border-white/10 animate-stagger-in cursor-pointer`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Number / Action badge */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-base-raised border border-base-border/60 flex items-center justify-center font-display font-extrabold text-white/40 text-sm">
                    {isEditing ? <Edit3 size={14} className="text-lime" /> : idx + 1}
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
                  
                  {isEditing ? (
                    <button
                      data-action="delete"
                      type="button"
                      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteExercise(exercise.id); }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteExercise(exercise.id); }}
                      className="h-9 w-9 rounded-xl bg-ember/10 border border-ember/25 text-ember flex items-center justify-center active:bg-ember/20 transition-all shrink-0 touch-manipulation"
                      title="Hapus gerakan"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <ChevronRight size={16} className="text-white/20 shrink-0" />
                  )}
                </div>
              </div>
            ))}

            {/* ── Add custom movement button ── */}
            {isEditing && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border border-dashed border-lime/30 rounded-2xl flex items-center justify-center gap-2 text-lime/80 hover:text-lime hover:bg-lime/5 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <PlusCircle size={15} /> Tambah Gerakan Kustom
              </button>
            )}
          </div>
        )}

        {/* ── Custom Exercise Addition Form ── */}
        {showAddForm && (
          <div className="glass-card p-5 mt-4 border-lime/30 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-xs text-lime">Buat Gerakan Latihan Kustom</h3>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white"><X size={15} /></button>
            </div>
            <form onSubmit={handleAddExercise} className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Nama Latihan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Barbell Curl Kustom"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Otot Target</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Bicep"
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Peralatan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Barbell"
                    value={newExEquip}
                    onChange={(e) => setNewExEquip(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Set</label>
                  <input 
                    type="number" 
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    min={1}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Reps Preskripsi</label>
                  <input 
                    type="text" 
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Rest (detik)</label>
                  <input 
                    type="number" 
                    value={newExRest}
                    onChange={(e) => setNewExRest(Number(e.target.value))}
                    min={0}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Teknik & Petunjuk Eksekusi</label>
                <textarea 
                  placeholder="Contoh: Jaga siku tetap menempel, remas bicep di puncak..."
                  value={newExCue}
                  onChange={(e) => setNewExCue(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-base-border rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs"
              >
                Simpan & Tambahkan
              </button>
            </form>
          </div>
        )}

        {/* ── Modify Exercise Modal ── */}
        {editingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingExercise(null)} />
            <div className="relative w-full max-w-sm bg-base-card border border-base-border rounded-[2rem] p-5 shadow-2xl animate-scale-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-extrabold uppercase tracking-wide text-sm text-lime">Edit Detail Gerakan</h3>
                <button onClick={() => setEditingExercise(null)} className="text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Nama Latihan</label>
                  <input 
                    type="text" 
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Otot Target</label>
                  <input 
                    type="text" 
                    value={editingExercise.targetMuscle}
                    onChange={(e) => setEditingExercise({...editingExercise, targetMuscle: e.target.value})}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Set</label>
                    <input 
                      type="number" 
                      value={editingExercise.sets}
                      onChange={(e) => setEditingExercise({...editingExercise, sets: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Reps</label>
                    <input 
                      type="text" 
                      value={editingExercise.reps}
                      onChange={(e) => setEditingExercise({...editingExercise, reps: e.target.value})}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Rest (detik)</label>
                    <input 
                      type="number" 
                      value={editingExercise.restSeconds}
                      onChange={(e) => setEditingExercise({...editingExercise, restSeconds: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Petunjuk Latihan</label>
                  <textarea 
                    value={editingExercise.cue}
                    onChange={(e) => setEditingExercise({...editingExercise, cue: e.target.value})}
                    className="w-full h-16 bg-black/40 border border-base-border rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 resize-none text-left"
                  />
                </div>
                <button
                  onClick={() => handleUpdateExercise(editingExercise)}
                  className="w-full btn-primary py-2.5 text-xs"
                >
                  Terapkan Perubahan
                </button>
              </div>
            </div>
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
