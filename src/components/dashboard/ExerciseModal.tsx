"use client";

import { useState, useEffect, useRef } from "react";
import { X, Clock, Repeat, Layers, Zap, Check, Trophy, Play, Pause, RotateCcw, SkipForward, Flame, TrendingUp, AlertTriangle, Dumbbell } from "lucide-react";
import { Exercise } from "@/types";
import { addLogEntry, isExerciseCompletedToday, getLogs } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useProfile } from "@/lib/useProfile";
import { useExerciseGif } from "@/lib/useExerciseGif";

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
  const { gifUrl, source, loading } = useExerciseGif(exercise.name);

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
  const [isOverRest, setIsOverRest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const overRestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound generator using Web Audio API
  const playBeep = (freq = 880) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
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
      setIsOverRest(true);
      playBeep(880);
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

  // Over-Rest Repetitive Vibrator Alarm
  useEffect(() => {
    if (isOverRest) {
      overRestIntervalRef.current = setInterval(() => {
        playBeep(920); // slightly sharper alert sound
        triggerVibrate();
      }, 20000); // remind every 20 seconds
    } else {
      if (overRestIntervalRef.current) {
        clearInterval(overRestIntervalRef.current);
        overRestIntervalRef.current = null;
      }
    }

    return () => {
      if (overRestIntervalRef.current) clearInterval(overRestIntervalRef.current);
    };
  }, [isOverRest]);

  const startTimer = (seconds = exercise.restSeconds) => {
    setIsOverRest(false); // clear active alert warnings
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const handleSetCheckboxChange = (index: number) => {
    const updated = [...setsData];
    const targetState = !updated[index].completed;
    updated[index].completed = targetState;
    setSetsData(updated);

    // Stop alert warning when any checkbox is clicked
    setIsOverRest(false);

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
    setIsOverRest(false);
    
    showToast(`${exercise.name} Selesai! 🏆`, {
      sub: `${completedSetsCount || exercise.sets} set telah dicatat`,
      variant: "success",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" 
        onClick={() => {
          setIsOverRest(false);
          onClose();
        }} 
      />

      {/* Modal Container */}
      <div className="relative w-full sm:max-w-lg bg-base-card border border-base-border rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-slide-up sm:animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-base-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`chip text-[10px] font-extrabold uppercase py-0.5 px-2.5 rounded-md ${INTENSITY_COLOR[exercise.intensity]} ${INTENSITY_GLOW[exercise.intensity]}`}>
              {exercise.intensity}
            </span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{exercise.equipment}</span>
          </div>
          <button 
            onClick={() => {
              setIsOverRest(false);
              onClose();
            }} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-base-raised/80 text-white/50 hover:text-white hover:bg-base-raised transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto scrollbar-none flex-1">
          {/* Muscle and Exercise info */}
          <div className="mb-5">
            <h2 className="heading-brutal text-2xl uppercase tracking-tight text-white">{exercise.name}</h2>
            <p className="text-lime text-xs font-bold uppercase tracking-wider mt-1">{exercise.targetMuscle}</p>
          </div>

          {/* Visual Exercise Demonstration / Placeholder */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/45 border border-white/5 mb-5 relative flex items-center justify-center">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#15151b] animate-pulse">
                <div className="h-8 w-8 rounded-full border-2 border-transparent border-t-lime animate-spin mb-2" />
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Loading Demo...</p>
              </div>
            ) : gifUrl && source !== "none" ? (
              <img
                src={gifUrl}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                {/* SVG Animated Placeholder */}
                <div className="h-14 w-14 rounded-full bg-lime/10 border border-lime/25 flex items-center justify-center text-lime mb-3 animate-pulse">
                  <Dumbbell size={22} className="animate-bounce" />
                </div>
                <p className="text-white/60 text-xs font-semibold">{exercise.name}</p>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mt-1.5 max-w-[220px]">
                  Demo unavailable — showing animation preview
                </p>
              </div>
            )}
          </div>

          {/* Cue Teknik */}
          <div className="bg-lime/5 border border-lime/20 rounded-2xl p-4 mb-5">
            <p className="text-[9px] font-extrabold text-lime uppercase tracking-widest mb-1">CUE TEKNIK YOSFIT</p>
            <p className="text-white/70 text-xs leading-relaxed">{exercise.cue}</p>
          </div>

          {/* Overload Tip (Hidden in Simple Mode) */}
          {previousPerformance && !completed && !isSimpleMode && (
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-ember/15 text-ember flex items-center justify-center shrink-0">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest">Target Progres Hari Ini</p>
                <p className="text-white/80 text-xs mt-0.5 leading-relaxed">
                  Latihan lalu: <strong className="text-white">{previousPerformance.weight}kg</strong> &middot; {previousPerformance.sets} set.
                </p>
                <p className="text-lime text-[11px] font-bold mt-1">Saran: Angkat {recommendation.weight}kg sebanyak {recommendation.reps} reps.</p>
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

          {/* Over-Rest Loud Alert Warn Banner */}
          {isOverRest && (
            <div className="bg-ember/15 border-2 border-ember rounded-2xl p-3.5 mb-4 text-center animate-pulse flex items-center justify-center gap-2">
              <AlertTriangle size={15} className="text-ember" />
              <p className="text-xs font-black text-white uppercase tracking-wider">
                Istirahat Selesai! Mulai Set Berikutnya Sekarang!
              </p>
              <AlertTriangle size={15} className="text-ember" />
            </div>
          )}

          {/* Interactive Rest Timer Section */}
          <div className={`glass-card p-4 mb-5 transition-all duration-300 border ${
            isOverRest 
              ? "border-ember bg-ember/10 shadow-[0_0_20px_rgba(255,69,0,0.25)]"
              : timerActive && timeLeft <= 10 
              ? "border-ember/45 bg-ember/10 animate-pulse shadow-[0_0_15px_rgba(255,69,0,0.15)]" 
              : "border-lime/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className={isOverRest || (timerActive && timeLeft <= 10) ? "text-ember" : "text-lime"} />
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  {isOverRest ? "OVER-RESTING" : timerActive ? "Waktu Istirahat" : "Target Istirahat"}
                </span>
              </div>
              <span className={`font-mono font-extrabold text-xl ${
                isOverRest || (timerActive && timeLeft <= 10) ? "text-ember" : "text-lime"
              }`}>
                {timeLeft}s
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setIsOverRest(false);
                  setTimerActive(!timerActive);
                }}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 text-white/80"
                title={timerActive ? "Pause" : "Play"}
              >
                {timerActive ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={() => {
                  setIsOverRest(false);
                  setTimeLeft(exercise.restSeconds);
                }}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 text-white/80"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setIsOverRest(false);
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
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-base-border/50 bg-base-card/95 flex gap-3">
          <button 
            onClick={() => {
              setIsOverRest(false);
              onClose();
            }} 
            className="btn-secondary flex-1"
          >
            Tutup
          </button>
          
          <button
            onClick={handleMarkComplete}
            disabled={completed}
            className={`btn-primary flex-[2] ${completed ? "bg-lime/20 border-lime/10 text-lime/50 cursor-default" : "animate-glow-pulse-lime"}`}
          >
            {completed ? (
              <span className="flex items-center gap-1.5 justify-center"><Check size={16} /> Latihan Selesai</span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center"><Trophy size={15} /> Selesaikan Latihan</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
