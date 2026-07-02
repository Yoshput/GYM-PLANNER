"use client";

import { useState, useEffect, useRef } from "react";
import { X, Clock, Repeat, Layers, Zap, Check, Trophy, Play, Pause, RotateCcw, SkipForward, Flame, TrendingUp } from "lucide-react";
import { Exercise } from "@/types";
import { addLogEntry, isExerciseCompletedToday, getLogs } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useProfile } from "@/lib/useProfile";

interface ExerciseModalProps {
  exercise: Exercise;
  dayKey: string;
  onClose: () => void;
}

const INTENSITY_COLOR: Record<Exercise["intensity"], string> = {
  Low: "bg-white/10 text-white/70",
  Moderate: "bg-lime/15 text-lime",
  High: "bg-ember/15 text-ember",
  Max: "bg-ember text-white",
};

const INTENSITY_GLOW: Record<Exercise["intensity"], string> = {
  Low: "",
  Moderate: "shadow-[0_0_12px_rgba(204,255,0,0.2)]",
  High: "shadow-[0_0_12px_rgba(255,69,0,0.2)]",
  Max: "shadow-[0_0_20px_rgba(255,69,0,0.4)]",
};

interface SetData {
  weight: string;
  reps: string;
  rpe?: string; // 1-10 scale
  rir?: string; // Reps in reserve
  completed: boolean;
  isWarmup?: boolean;
}

export default function ExerciseModal({ exercise, dayKey, onClose }: ExerciseModalProps) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const { showToast } = useToast();
  const { profile } = useProfile();

  const isSimpleMode = profile?.experienceMode === "simple";

  const [completed, setCompleted] = useState(() => isExerciseCompletedToday(exercise.id, todayISO));
  const [justCompleted, setJustCompleted] = useState(false);

  // Retrieve last workout logs to get previous weight & reps for progressive overload recommendation
  const previousPerformance = (() => {
    if (typeof window === "undefined") return null;
    const history = getLogs();
    const match = history
      .slice()
      .reverse()
      .find((log: any) => log.exerciseId === exercise.id && log.date !== todayISO);
    
    if (match) {
      return {
        weight: match.weightUsed || 0,
        sets: match.completedSets || 0,
        notes: match.notes || "",
      };
    }
    return null;
  })();

  // Progressive Overload Logic Recommendation
  const recommendation = (() => {
    if (previousPerformance && previousPerformance.weight > 0) {
      const nextWeight = previousPerformance.weight + 2.5;
      const targetReps = exercise.reps.split("-")[0] || "10";
      return {
        weight: nextWeight,
        reps: targetReps,
        reason: `+2.5kg dari beban latihan lalu (${previousPerformance.weight}kg) untuk progressive overload`,
      };
    }
    return {
      weight: 20,
      reps: exercise.reps.split("-")[0] || "10",
      reason: "Beban dasar disarankan untuk memulai program latihan",
    };
  })();

  // Progressive Overload Inputs State
  const [setsData, setSetsData] = useState<SetData[]>(() => {
    const defaultReps = exercise.reps.split("-")[0] || "10";
    const recommendedWeight = recommendation.weight.toString();
    return Array.from({ length: exercise.sets }, (_, i) => ({
      weight: recommendedWeight,
      reps: defaultReps,
      rpe: "8",
      rir: "2",
      completed: false,
      isWarmup: false,
    }));
  });

  // Rest Timer State
  const [timeLeft, setTimeLeft] = useState(exercise.restSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound generator using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  // Vibration helper
  const triggerVibrate = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Timer Countdown Logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      playBeep();
      triggerVibrate();
      showToast("Waktu Istirahat Selesai! 🔔", {
        sub: "Kembali ke set berikutnya!",
        variant: "info",
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const startTimer = (seconds = exercise.restSeconds) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const handleSetCheckboxChange = (index: number) => {
    const updated = [...setsData];
    const targetState = !updated[index].completed;
    updated[index].completed = targetState;
    setSetsData(updated);

    // Auto-trigger rest timer when a set is marked complete
    if (targetState) {
      startTimer(exercise.restSeconds);
      showToast(`Set ${index + 1} Selesai! 💪`, {
        sub: `Istirahat ${exercise.restSeconds} detik dimulai`,
        variant: "info",
      });
    }
  };

  const handleInputChange = (index: number, field: keyof SetData, value: any) => {
    const updated = [...setsData];
    (updated[index] as any)[field] = value;
    setSetsData(updated);
  };

  // Warmup Generator Logic
  const handleGenerateWarmup = () => {
    const workingWeight = parseFloat(setsData[0]?.weight) || recommendation.weight;
    
    const warmupSets: SetData[] = [
      { weight: "20", reps: "15", rpe: "5", rir: "5", completed: false, isWarmup: true },
      { weight: (Math.round((workingWeight * 0.5) / 2.5) * 2.5).toString(), reps: "8", rpe: "6", rir: "4", completed: false, isWarmup: true },
      { weight: (Math.round((workingWeight * 0.75) / 2.5) * 2.5).toString(), reps: "4", rpe: "7", rir: "3", completed: false, isWarmup: true },
    ];

    setSetsData([...warmupSets, ...setsData.map(s => ({ ...s, isWarmup: false }))]);
    showToast("Warm-up Sets Dibuat! 🚀", {
      sub: "3 set pemanasan bertahap telah ditambahkan ke atas.",
      variant: "info",
    });
  };

  const handleMarkComplete = () => {
    const completedSetsCount = setsData.filter(s => s.completed).length;
    const workingSets = setsData.filter(s => !s.isWarmup);
    const avgWeight = workingSets.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0) / (workingSets.length || 1);
    
    // Save to local storage log
    addLogEntry({
      date: todayISO,
      day: dayKey as never,
      exerciseId: exercise.id,
      completedSets: completedSetsCount > 0 ? completedSetsCount : exercise.sets,
      weightUsed: avgWeight > 0 ? Math.round(avgWeight) : undefined,
      notes: `Sets log: ${setsData.map((s, i) => `${s.isWarmup ? "W" : "S"}${i+1}: ${s.weight}kg x ${s.reps} (RPE ${s.rpe || "N/A"})`).join(", ")}`,
    });

    setJustCompleted(true);
    setCompleted(true);
    
    showToast(`${exercise.name} Selesai! 🏆`, {
      sub: `${completedSetsCount || exercise.sets} set telah dicatat`,
      variant: "success",
    });

    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-md sm:mx-4 bg-base-card border border-base-border/80 rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] overflow-y-auto scrollbar-none animate-slide-up sm:animate-scale-in shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close exercise details"
          className="absolute top-5 right-5 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-base-border text-white/60 active:scale-90 transition-transform hover:text-white hover:border-white/25"
        >
          <X size={18} />
        </button>

        {/* Hero area */}
        <div className={`relative h-44 bg-gradient-to-br from-base-raised via-base-card to-base overflow-hidden flex items-center justify-center rounded-t-[2rem] ${INTENSITY_GLOW[exercise.intensity]}`}>
          {exercise.imageUrl && (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-card/20 to-base-card" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-lime/8 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-ember/8 blur-3xl" />

          {justCompleted ? (
            <div className="relative z-10 flex flex-col items-center gap-2 animate-bounce-in">
              <div className="h-16 w-16 rounded-full bg-lime/20 border-2 border-lime/40 flex items-center justify-center">
                <Trophy size={32} className="text-lime" />
              </div>
              <p className="font-display font-extrabold text-lime uppercase tracking-widest text-xs">Selesai!</p>
            </div>
          ) : (
            !exercise.imageUrl && <TechniquePlaceholder />
          )}

          <span className="absolute bottom-3 left-5 chip bg-black/55 text-lime border border-lime/25 backdrop-blur-sm text-[10px] font-bold">
            {exercise.imageUrl ? "Preview Gerakan" : "Panduan Teknik"}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`chip ${INTENSITY_COLOR[exercise.intensity]}`}>
              Intensitas {exercise.intensity}
            </span>
          </div>

          <h2 className="heading-brutal text-2xl mb-1">{exercise.name}</h2>
          <p className="text-white/50 text-sm mb-4">{exercise.targetMuscle}</p>

          {/* Progressive Overload Recommendation Indicator (Hidden in Simple Mode) */}
          {!isSimpleMode && (
            <div className="glass-card p-4.5 mb-5 border-lime/15 bg-lime/3 flex items-start gap-3">
              <TrendingUp size={18} className="text-lime shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-lime uppercase tracking-wider leading-none mb-1">Rekomendasi Hari Ini</p>
                <p className="font-display font-black text-sm text-white">{recommendation.weight}kg x {recommendation.reps} reps</p>
                <p className="text-[10px] text-white/40 mt-1 leading-normal">{recommendation.reason}</p>
              </div>
            </div>
          )}

          {/* Warmup sets generator CTA (Hidden in Simple Mode) */}
          {!completed && !isSimpleMode && (
            <button
              onClick={handleGenerateWarmup}
              className="w-full mb-5 border border-white/10 hover:border-lime/20 bg-white/3 hover:bg-lime/5 text-white/70 hover:text-lime rounded-xl py-2.5 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Flame size={13} />
              Generate Warmup Sets (Pemanasan)
            </button>
          )}

          {/* Interactive Rest Timer Section */}
          <div className={`glass-card p-4 mb-5 transition-all duration-300 border ${
            timerActive && timeLeft <= 10 
              ? "border-ember/45 bg-ember/10 animate-pulse shadow-[0_0_15px_rgba(255,69,0,0.15)]" 
              : "border-lime/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className={timerActive && timeLeft <= 10 ? "text-ember" : "text-lime"} />
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  {timerActive ? "Waktu Istirahat" : "Target Istirahat"}
                </span>
              </div>
              <span className={`font-mono font-extrabold text-xl ${
                timerActive && timeLeft <= 10 ? "text-ember" : "text-lime"
              }`}>
                {timeLeft}s
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 text-white/80"
                title={timerActive ? "Pause" : "Play"}
              >
                {timerActive ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={() => setTimeLeft(exercise.restSeconds)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 text-white/80"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimeLeft(0);
                }}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 text-white/80"
                title="Skip"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>

          {/* Progressive Overload Inputs & Sets Tracker */}
          <div className="mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
              <Layers size={14} /> Catat Progres Tiap Set
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {setsData.map((setData, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col gap-2.5 p-3 rounded-xl border transition-colors ${
                    setData.completed 
                      ? "bg-lime/5 border-lime/25" 
                      : setData.isWarmup
                      ? "bg-amber-400/5 border-amber-400/20"
                      : "bg-white/3 border-base-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleSetCheckboxChange(index)}
                        className={`h-5.5 w-5.5 rounded-md flex items-center justify-center border transition-all ${
                          setData.completed
                            ? "bg-lime border-lime text-black"
                            : setData.isWarmup
                            ? "border-amber-400/40 text-transparent"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {setData.completed && <Check size={12} className="stroke-[3]" />}
                      </button>
                      <span className="font-display font-black text-sm text-white/85">
                        {setData.isWarmup ? `Warm-up Set ${index + 1}` : `Set ${setsData.filter((s, idx) => !s.isWarmup || idx < index).length + 1}`}
                      </span>
                    </div>

                    {/* Weight and Reps Inputs (Weight Hidden in Simple Mode) */}
                    <div className="flex items-center gap-2">
                      {!isSimpleMode && (
                        <div className="flex items-center bg-black/40 rounded-lg border border-white/5 px-2 py-1">
                          <input
                            type="number"
                            placeholder="0"
                            value={setData.weight === "0" ? "" : setData.weight}
                            onChange={(e) => handleInputChange(index, "weight", e.target.value)}
                            className="w-10 bg-transparent text-right font-bold text-sm text-lime focus:outline-none placeholder-white/20"
                          />
                          <span className="text-[10px] text-white/40 font-bold ml-1">kg</span>
                        </div>
                      )}

                      <div className="flex items-center bg-black/40 rounded-lg border border-white/5 px-2 py-1">
                        <input
                          type="number"
                          placeholder="0"
                          value={setData.reps}
                          onChange={(e) => handleInputChange(index, "reps", e.target.value)}
                          className="w-8 bg-transparent text-right font-bold text-sm text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-white/40 font-bold ml-1">reps</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced inputs for RPE and RIR (Hidden in Simple Mode) */}
                  {!isSimpleMode && (
                    <div className="flex gap-2 border-t border-white/5 pt-2">
                      <div className="flex-1 flex items-center justify-between bg-black/20 rounded-md px-2 py-1 text-[10px]">
                        <span className="text-white/40 font-bold">RPE</span>
                        <select 
                          value={setData.rpe || "8"} 
                          onChange={(e) => handleInputChange(index, "rpe", e.target.value)}
                          className="bg-transparent text-lime font-bold focus:outline-none cursor-pointer"
                        >
                          {Array.from({ length: 10 }, (_, i) => 10 - i).map(n => (
                            <option key={n} value={n.toString()} className="bg-base-card text-white">{n}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 flex items-center justify-between bg-black/20 rounded-md px-2 py-1 text-[10px]">
                        <span className="text-white/40 font-bold">RIR</span>
                        <select 
                          value={setData.rir || "2"} 
                          onChange={(e) => handleInputChange(index, "rir", e.target.value)}
                          className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                        >
                          {Array.from({ length: 6 }, (_, i) => i).map(n => (
                            <option key={n} value={n.toString()} className="bg-base-card text-white">{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technique cue */}
          <div className="glass-card p-4 mb-6 border-lime/10">
            <div className="flex items-center gap-2 text-lime text-xs font-bold uppercase tracking-wide mb-2">
              <Zap size={14} />
              Tips Teknik
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{exercise.cue}</p>
          </div>

          {/* Equipment info */}
          <div className="flex items-center justify-between mb-6 text-sm px-1">
            <span className="text-white/40">Peralatan</span>
            <span className="text-white/80 font-semibold">{exercise.equipment}</span>
          </div>

          {/* CTA Button */}
          {completed ? (
            <div className="w-full flex items-center justify-center gap-2 rounded-full py-4 min-h-[52px] bg-lime/10 border border-lime/30 text-lime font-display font-bold uppercase tracking-wide text-sm animate-bounce-in">
              <Check size={18} />
              Tercatat Hari Ini
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="btn-primary w-full animate-glow-pulse-lime text-sm py-4"
            >
              Catat Latihan Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TechniquePlaceholder() {
  return (
    <svg viewBox="0 0 200 140" className="h-32 w-32" aria-hidden="true">
      <circle cx="100" cy="70" r="55" fill="none" stroke="#CCFF00" strokeOpacity="0.08" strokeWidth="1.5" />
      <circle cx="100" cy="70" r="40" fill="none" stroke="#CCFF00" strokeOpacity="0.18" strokeWidth="1.5">
        <animate attributeName="r" values="40;47;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.18;0.04;0.18" dur="3s" repeatCount="indefinite" />
      </circle>
      <g stroke="#CCFF00" strokeWidth="5" strokeLinecap="round">
        <line x1="72" y1="70" x2="128" y2="70">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-10 100 70; 10 100 70; -10 100 70"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
      </g>
      <g fill="#FF4500">
        <rect x="58" y="54" width="14" height="32" rx="4">
          <animateTransform attributeName="transform" type="rotate" values="-10 100 70; 10 100 70; -10 100 70" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="128" y="54" width="14" height="32" rx="4">
          <animateTransform attributeName="transform" type="rotate" values="-10 100 70; 10 100 70; -10 100 70" dur="2s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
