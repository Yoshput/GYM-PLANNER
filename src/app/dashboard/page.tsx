"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Scale,
  Flame,
  Target,
  TrendingUp,
  Minus,
  Sprout,
  Zap,
  Crown,
  Dumbbell,
  Calendar,
  Camera,
  CheckCircle2,
  History,
  Activity,
  Award,
  Clock,
  Check,
  Droplets,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { generateWorkoutSplit, DAY_ORDER, DAY_LABELS } from "@/data/workouts";
import { calculateMacros, calculateBMI, bmiCategory } from "@/lib/calculations";
import { Day, ExperienceLevel, Goal } from "@/types";
import { getLogs, saveProfile } from "@/lib/storage";
import {
  useWorkoutLogs,
  useStreak,
  useDailyChecklist,
  useRecoveryLog,
  getLocalStorage,
  setLocalStorage
} from "@/lib/store";
import MusicPlayerCard from "@/components/music/MusicPlayerCard";

const GOAL_META: Record<Goal, { label: string; icon: React.ReactNode }> = {
  cutting: { label: "Cutting", icon: <Minus size={14} /> },
  bulking: { label: "Bulking", icon: <TrendingUp size={14} /> },
  maintenance: { label: "Maintenance", icon: <Flame size={14} /> },
  powerlifting: { label: "Powerlifting", icon: <Dumbbell size={14} /> },
};

const LEVEL_META: Record<ExperienceLevel, { label: string; icon: React.ReactNode }> = {
  beginner: { label: "Beginner", icon: <Sprout size={14} /> },
  intermediate: { label: "Intermediate", icon: <Zap size={14} /> },
  expert: { label: "Expert", icon: <Crown size={14} /> },
};

function getTodayKey(): Day {
  const idx = new Date().getDay();
  const map: Day[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[idx];
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let raf: number;
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { profile, refresh } = useProfile();
  const todayKey = getTodayKey();
  const { logs, addLog, clearLogs } = useWorkoutLogs();
  const streak = useStreak();
  const { checklist, toggleItem } = useDailyChecklist();
  const { todayLog, saveRecovery } = useRecoveryLog();

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [sleepInput, setSleepInput] = useState(7);
  const [stressInput, setStressInput] = useState(5);
  const [sorenessInput, setSorenessInput] = useState(3);
  const [energyInput, setEnergyInput] = useState(7);

  const split = useMemo(
    () => (profile ? generateWorkoutSplit(profile.experience, profile.goal) : null),
    [profile]
  );
  const macros = useMemo(() => (profile ? calculateMacros(profile) : null), [profile]);
  const bmi = useMemo(
    () => (profile ? calculateBMI(profile.weightKg, profile.heightCm) : null),
    [profile]
  );

  const completedThisWeek = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    return logs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek;
    }).length;
  }, [logs]);

  // Calculate volume weekly target helper
  const totalVolumeThisWeek = useMemo(() => {
    let vol = 0;
    logs.forEach((log: any) => {
      if (log.sets && Array.isArray(log.sets)) {
        log.sets.forEach((s: any) => {
          if (s.completed) vol += (s.weightKg || 0) * (s.reps || 0);
        });
      } else if (log.weightUsed) {
        vol += (log.weightUsed || 0) * (log.completedSets * 10);
      }
    });
    return vol;
  }, [logs]);

  // Calendar mapping (last 7 days of activity)
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isCompleted = logs.some((l: any) => new Date(l.date).toDateString() === d.toDateString());
      days.push({
        date: d,
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        dayNum: d.getDate(),
        completed: isCompleted,
      });
    }
    return days;
  }, [logs]);

  // ── MOTIVATION SYSTEM: Large collection of fitness quotes ──
  const MOTIVATION_QUOTES = [
    "Disiplin mengalahkan motivasi saat Anda malas bergerak. Mulailah saja!",
    "Satu repetisi lagi. Di sanalah letak pertumbuhan yang sesungguhnya.",
    "Progres sekecil apa pun tetaplah sebuah kemajuan. Teruskan melangkah!",
    "Latihan hari ini membangun kekuatan tubuh Anda esok hari. Angkat sekarang!",
    "Setiap set itu berharga. Jangan biarkan usaha Anda hari ini sia-sia.",
    "Konsistensi melahirkan juara. Tunjukkan dedikasi terbaik Anda hari ini!",
    "Tubuh Anda mampu menghadapi segalanya. Pikiran Andalah yang harus diyakinkan.",
    "Rasa lelah setelah berlatih itu sementara, namun rasa bangganya bertahan selamanya.",
    "Jangan bandingkan awal perjalanan Anda dengan pertengahan perjalanan orang lain.",
    "Kekuatan tidak datang dari kemampuan fisik, melainkan dari kemauan yang gigih.",
    "Anda tidak akan pernah menyesal setelah menyelesaikan satu sesi latihan keras.",
    "Lawan rasa malas itu. Otot Anda tumbuh ketika Anda melampaui batas zona nyaman."
  ];

  // Daily unique index using date hashing to change quote exactly once a day
  const dailyQuote = useMemo(() => {
    const todayNum = new Date().getDate() + new Date().getMonth();
    return MOTIVATION_QUOTES[todayNum % MOTIVATION_QUOTES.length];
  }, []);

  if (!profile || !split || !macros || bmi === null) return null;

  const today = split[todayKey];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = { ...profile, profileImage: base64 };
        saveProfile(updated);
        refresh();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat latihan?")) {
      clearLogs();
    }
  };

  const handleSaveRecovery = () => {
    saveRecovery(sleepInput, stressInput, sorenessInput, energyInput);
    setShowRecoveryModal(false);
  };

  const findExerciseName = (id: string) => {
    for (const day of Object.values(split)) {
      const ex = day.exercises.find((e) => e.id === id);
      if (ex) return ex.name;
    }
    return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Recovery recommendation engine
  const recoveryRecommendation = (score: number) => {
    if (score >= 80) return { text: "Heavy Training Day 💪", desc: "Tubuh prima! Waktunya progressive overload berat.", color: "text-lime" };
    if (score >= 50) return { text: "Moderate Training Day ⚡", desc: "Kondisi baik, fokus pada form dan volume sedang.", color: "text-amber-400" };
    return { text: "Rest & Active Recovery 🧘", desc: "Prioritaskan tidur, stretching, dan berjalan santai.", color: "text-ember" };
  };

  return (
    <main className="px-5 pt-safe pt-8 pb-6 max-w-md mx-auto">
      {/* ── Personalized Header ── */}
      <div className="flex items-center justify-between mb-4 animate-slide-down-fade">
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
            <Calendar size={12} className="text-lime" />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="heading-brutal text-3xl">
            Halo, <span className="text-gradient-lime">{profile.name}</span>! 🔥
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          {streak.count > 0 && (
            <div className="flex items-center gap-1 bg-ember/15 border border-ember/25 px-2.5 py-1 rounded-xl text-ember font-bold text-xs">
              <span>🔥</span> {streak.count} Hari
            </div>
          )}
          <span className="chip bg-lime/15 text-lime border border-lime/20 font-extrabold">
            {GOAL_META[profile.goal].icon}&nbsp;{GOAL_META[profile.goal].label}
          </span>
          <ThemeToggleButton />
          <Link
            href="/settings"
            className="h-8.5 w-8.5 rounded-xl bg-white/5 border border-white/10 hover:border-lime/20 text-white/60 hover:text-lime flex items-center justify-center transition-all active:scale-90"
            title="Pengaturan Aplikasi"
          >
            <Settings size={15} />
          </Link>
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <div className="glass-card px-4 py-3 mb-5 border-white/5 bg-white/1 flex items-center gap-2.5 rounded-xl animate-fade-in">
        <Sparkles size={14} className="text-lime shrink-0 animate-pulse" />
        <p className="text-[11px] text-white/60 italic leading-relaxed font-medium">
          &ldquo;{dailyQuote}&rdquo;
        </p>
      </div>

      {/* ── Today's focus card — shimmer border ── */}
      <Link
        href="/workout"
        className="shimmer-border glass-card block p-5 mb-5 relative overflow-hidden active:scale-[0.98] transition-transform animate-stagger-in stagger-1"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-lime/12 blur-2xl" aria-hidden="true" />
        <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-ember/8 blur-xl" aria-hidden="true" />
        <p className="text-lime text-xs font-bold uppercase tracking-widest mb-2">
          Jadwal Hari Ini &middot; {DAY_LABELS[todayKey]}
        </p>
        <h2 className="heading-brutal text-2xl mb-2">{today.label}</h2>
        <p className="text-white/50 text-sm mb-4">{today.focus}</p>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">
            {today.isRestDay ? "Recovery day — istirahat" : `${today.exercises.length} gerakan`}
          </span>
          <span className="inline-flex items-center gap-1 text-lime text-sm font-bold">
            Mulai Latihan <ArrowRight size={16} />
          </span>
        </div>
      </Link>

      {/* Recommended Music Playlist Card */}
      <MusicPlayerCard dayPlan={today} goal={profile.goal} />

      {/* ── PWA Daily Checklist Widget ── */}
      <div className="glass-card p-5 mb-5 animate-stagger-in stagger-2">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4 flex items-center justify-between">
          <span>Target Checklist Harian</span>
          <span className="text-lime text-[10px] font-extrabold">PROGRESS KONSISTENSI</span>
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: "workout", label: "Latihan Fisik", icon: <Dumbbell size={14} /> },
            { key: "protein", label: "Cukup Protein", icon: <Award size={14} /> },
            { key: "calories", label: "Target Kalori", icon: <Flame size={14} /> },
            { key: "water", label: "Cukup Air", icon: <Droplets size={14} /> },
            { key: "sleep", label: "Tidur 7-8 Jam", icon: <Clock size={14} /> },
            { key: "stretching", label: "Stretching/Yoga", icon: <Activity size={14} /> },
          ].map((item) => {
            const checked = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all active:scale-[0.97] ${
                  checked
                    ? "bg-lime/10 border-lime/30 text-lime"
                    : "bg-base-raised/30 border-base-border/50 text-white/60 hover:border-white/10"
                }`}
              >
                <div
                  className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                    checked ? "bg-lime border-lime text-black" : "border-white/30 text-transparent"
                  }`}
                >
                  <Check size={10} strokeWidth={4} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase truncate leading-none mb-0.5">{item.label}</p>
                  <span className="text-[9px] opacity-55 flex items-center gap-0.5">{item.icon} Log</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recovery Score Widget ── */}
      <div className="glass-card p-5 mb-5 animate-stagger-in stagger-2 relative overflow-hidden">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">Skor Pemulihan Harian</p>
        {todayLog ? (
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full border-4 border-lime/20 flex flex-col items-center justify-center relative shrink-0">
              <span className="text-xl font-display font-extrabold text-lime">{todayLog.score}%</span>
              <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">Score</span>
            </div>
            <div>
              <p className={`font-display font-extrabold text-sm uppercase tracking-wide ${recoveryRecommendation(todayLog.score).color}`}>
                {recoveryRecommendation(todayLog.score).text}
              </p>
              <p className="text-xs text-white/55 mt-1 leading-relaxed">
                {recoveryRecommendation(todayLog.score).desc}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/55 font-semibold">Tentukan intensitas latihan optimal Anda hari ini.</p>
              <p className="text-[10px] text-white/35 mt-0.5">Isi survei recovery singkat pagi ini.</p>
            </div>
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="bg-lime/10 hover:bg-lime/25 text-lime border border-lime/25 px-3.5 py-1.5 rounded-xl font-bold text-xs active:scale-95 transition-all"
            >
              Cek Recovery
            </button>
          </div>
        )}
      </div>

      {/* ── Recovery Tracker Popup Modal ── */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="glass-card w-full max-w-sm p-6 relative shimmer-border animate-scale-up">
            <h3 className="heading-brutal text-xl mb-1">Cek Pemulihan Harian</h3>
            <p className="text-white/40 text-xs mb-5">Masukkan data fisik Anda pagi ini:</p>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span>TIDUR (JAM)</span>
                  <span className="text-lime">{sleepInput} jam</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(Number(e.target.value))}
                  className="w-full accent-lime"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span>TINGKAT STRESS</span>
                  <span className="text-lime">{stressInput}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressInput}
                  onChange={(e) => setStressInput(Number(e.target.value))}
                  className="w-full accent-lime"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span>KEKAKUAN OTOT (DOMS)</span>
                  <span className="text-lime">{sorenessInput}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sorenessInput}
                  onChange={(e) => setSorenessInput(Number(e.target.value))}
                  className="w-full accent-lime"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span>TINGKAT ENERGI</span>
                  <span className="text-lime">{energyInput}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyInput}
                  onChange={(e) => setEnergyInput(Number(e.target.value))}
                  className="w-full accent-lime"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white/70 rounded-xl py-2 font-bold text-xs active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRecovery}
                className="flex-1 bg-lime text-black rounded-xl py-2 font-bold text-xs active:scale-95 shadow-[0_0_12px_rgba(204,255,0,0.4)]"
              >
                Hitung Skor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-5 animate-stagger-in stagger-2">
        <AnimatedStatCard icon={<Scale size={18} />} label="BMI" value={bmi.toFixed(1)} sub={bmiCategory(bmi)} />
        <AnimatedStatCard icon={<Flame size={18} />} label="TDEE" value={macros.tdee} sub="kcal/hari" />
        <AnimatedStatCard icon={<Target size={18} />} label="Volume" value={totalVolumeThisWeek} sub="kg minggu ini" />
      </div>

      {/* ── Workout Calendar dot grid ── */}
      <div className="glass-card p-4 mb-5 animate-stagger-in stagger-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center justify-between">
          <span>Aktivitas 7 Hari Terakhir</span>
          <span className="text-[10px] text-white/20">RIWAYAT AKTIF</span>
        </p>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                day.completed
                  ? "bg-lime/10 border-lime/30 text-lime"
                  : "bg-base-raised/20 border-base-border/50 text-white/35"
              }`}
            >
              <span className="text-[9px] uppercase tracking-wide font-extrabold leading-none">{day.label}</span>
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-display font-extrabold text-[11px] ${
                  day.completed ? "bg-lime text-black" : "bg-white/5 border border-white/10"
                }`}
              >
                {day.dayNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profile Summary ── */}
      <div className="glass-card p-5 mb-6 animate-stagger-in stagger-3 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35">Profil Saya</p>
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar dan membuat program latihan baru?")) {
                import("@/lib/storage").then((m) => m.clearProfile());
                window.location.href = "/";
              }
            }}
            className="text-[10px] font-bold text-ember hover:text-ember-dim transition-colors uppercase tracking-wider flex items-center gap-1 active:scale-95"
          >
            Reset Profil
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer block relative rounded-2xl overflow-hidden h-16 w-16 bg-lime/10 border-2 border-lime/30 flex items-center justify-center text-white hover:border-lime transition-all"
            >
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-lime font-display">{profile.name.slice(0, 2).toUpperCase()}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={18} className="text-lime" />
              </div>
            </label>
            <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex-1">
            <h3 className="font-display font-extrabold uppercase text-white tracking-wide text-sm">{profile.name}</h3>
            <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5 uppercase font-bold tracking-wider">
              {LEVEL_META[profile.experience].icon}
              {LEVEL_META[profile.experience].label} Level
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="chip bg-base-raised text-white/70 border border-base-border/50 text-[10px] py-0.5 px-2">
                {profile.weightKg} kg
              </span>
              <span className="chip bg-base-raised text-white/70 border border-base-border/50 text-[10px] py-0.5 px-2">
                {profile.heightCm} cm
              </span>
              <span className="chip bg-base-raised text-white/70 border border-base-border/50 text-[10px] py-0.5 px-2">
                {profile.bodyFatPct}% BF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dynamic Achievement Badges Widget ── */}
      <div className="glass-card p-5 mb-6 animate-stagger-in stagger-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4 flex items-center justify-between">
          <span>Lencana Pencapaian (Badges)</span>
          <span className="text-[10px] text-lime font-extrabold flex items-center gap-1"><Award size={11} /> PRESTASI</span>
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "first", label: "First Lift", desc: "1+ latihan dicatat", unlocked: logs.length >= 1, emoji: "🏆" },
            { id: "streak", label: "Consistency", desc: "Streak aktif", unlocked: streak.count >= 2, emoji: "🔥" },
            { id: "volume", label: "Heavy Load", desc: "Volume > 0 kg", unlocked: totalVolumeThisWeek > 0, emoji: "💪" },
            { id: "water", label: "Hydrated", desc: "Checklist air log", unlocked: checklist.water === true, emoji: "💧" },
          ].map((b) => (
            <div
              key={b.id}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                b.unlocked
                  ? "bg-lime/10 border-lime/30 text-white"
                  : "bg-base-raised/10 border-base-border/40 text-white/20 select-none opacity-40"
              }`}
              title={b.desc}
            >
              <span className={`text-2xl mb-1.5 block ${b.unlocked ? "animate-pulse" : ""}`}>{b.emoji}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide truncate max-w-full leading-none">{b.label}</span>
              <span className="text-[8px] opacity-40 mt-1 block truncate max-w-full leading-none">{b.unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly split ── */}
      <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">Jadwal Split Mingguan</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3 animate-stagger-in stagger-4">
        {DAY_ORDER.map((day) => {
          const plan = split[day];
          const isToday = day === todayKey;
          
          // Check if user completed any exercises for this specific day of the split
          // We look for logs corresponding to this day in the current week cycle
          const hasLoggedToday = logs.some((log: any) => {
            // Match logs with the target day of the week
            const logDay = new Date(log.date).getDay();
            const targetDayIdx = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(day);
            return logDay === targetDayIdx;
          });

          let dotClass = "bg-white/10"; // Default Rest
          if (hasLoggedToday) {
            dotClass = "bg-lime shadow-[0_0_8px_rgba(204,255,0,0.6)]"; // Completed
          } else if (isToday && !plan.isRestDay) {
            dotClass = "bg-ember animate-pulse shadow-[0_0_8px_rgba(255,69,0,0.6)]"; // Today active (not completed)
          } else if (!plan.isRestDay) {
            dotClass = "bg-white/30 border border-white/10"; // Upcoming/scheduled
          }

          return (
            <Link
              key={day}
              href="/workout"
              className={`shrink-0 w-20 flex flex-col items-center gap-2 rounded-2xl py-4 border transition-all duration-200 ${
                isToday
                  ? "border-lime/50 bg-lime/10 shadow-[0_0_16px_rgba(204,255,0,0.12)]"
                  : "border-base-border/50 bg-base-raised/30 hover:border-base-border"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase ${isToday ? "text-lime" : "text-white/35"}`}>
                {DAY_LABELS[day].slice(0, 3)}
              </span>
              <span className={`h-2.5 w-2.5 rounded-full transition-all ${dotClass}`} />
              <span className="text-[10px] text-white/45 text-center leading-tight px-1">
                {plan.isRestDay ? "Rest" : plan.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Legend for Split Colors */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 px-1 animate-stagger-in stagger-4 text-[10px] uppercase tracking-wider font-bold text-white/35">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_6px_rgba(204,255,0,0.4)]" />
          <span>Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ember animate-pulse shadow-[0_0_6px_rgba(255,69,0,0.4)]" />
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/30" />
          <span>Terjadwal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span>Istirahat</span>
        </div>
      </div>

      {/* ── Workout history logs logger ── */}
      <div className="glass-card p-5 mb-6 animate-stagger-in stagger-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35 flex items-center gap-1.5">
            <History size={13} className="text-lime" /> Riwayat Latihan Terakhir
          </p>
          {logs.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-bold text-ember/70 hover:text-ember transition-colors uppercase tracking-wider flex items-center gap-1 active:scale-95"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-6 text-white/35 text-xs">
            <p>Belum ada latihan yang dicatat.</p>
            <p className="mt-1">Pilih latihan hari ini di tab Workout dan selesaikan!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[160px] overflow-y-auto scrollbar-none">
            {logs
              .slice()
              .reverse()
              .slice(0, 4)
              .map((log: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-xl bg-base-raised/40 border border-base-border/50 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{findExerciseName(log.exerciseId)}</p>
                    <p className="text-white/45 text-[10px] mt-0.5">
                      {log.date} &middot; {log.completedSets} Sets
                    </p>
                  </div>
                  <span className="chip bg-lime/10 text-lime border border-lime/20 text-[9px] py-0.5 px-2">Selesai 💪</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Branding footer ── */}
      <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-base-border/30">
        <Dumbbell size={12} className="text-lime/40" />
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">
          Made by <span className="text-lime/50">Yossika</span> from Sokaraja
        </p>
        <Dumbbell size={12} className="text-lime/40" />
      </div>
    </main>
  );
}

function AnimatedStatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
}) {
  const numericTarget = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  const isDecimal = typeof value === "string" && value.includes(".");
  const counted = useCountUp(numericTarget);
  const display = isDecimal ? value : counted.toLocaleString();

  return (
    <div className="glass-card flex flex-col gap-1 p-4 hover:border-lime/15 transition-colors duration-300">
      <div className="text-lime mb-1">{icon}</div>
      <span className="font-display font-extrabold text-lg leading-none animate-count-up">{display}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/35">{label}</span>
      <span className="text-[10px] text-white/25">{sub}</span>
    </div>
  );
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8.5 w-8.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-8.5 w-8.5 rounded-xl bg-white/5 border border-white/10 hover:border-lime/20 text-white/60 hover:text-lime flex items-center justify-center transition-all active:scale-90"
      title="Ganti Tema"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

