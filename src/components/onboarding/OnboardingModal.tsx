"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Scale,
  Ruler,
  Percent,
  Flame,
  TrendingUp,
  Minus,
  Sprout,
  Zap,
  Crown,
  Check,
  Smartphone,
  Eye,
  Settings,
  Dumbbell,
  Target,
  Clock,
  Calendar,
  Sparkles
} from "lucide-react";
import { ExperienceLevel, Gender, Goal, UserProfile, ExperienceMode, GymEquipment, TrainingStyle } from "@/types";
import { saveProfile } from "@/lib/storage";

interface OnboardingModalProps {
  onClose: () => void;
}

const TOTAL_STEPS = 8;

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>("male");
  const [weightKg, setWeightKg] = useState<string>("70");
  const [heightCm, setHeightCm] = useState<string>("170");
  const [bodyFatPct, setBodyFatPct] = useState<string>("20");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  
  // New Adaptive States
  const [experienceMode, setExperienceMode] = useState<ExperienceMode | null>(null);
  const [equipment, setEquipment] = useState<GymEquipment | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [trainingDays, setTrainingDays] = useState<number>(4);
  const [trainingStyle, setTrainingStyle] = useState<TrainingStyle>("auto");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: // Welcome screen
        return true;
      case 2: // Name Input
        return name.trim().length > 0;
      case 3: // Goal Selection
        return goal !== null;
      case 4: // Experience Mode Selection
        return experienceMode !== null;
      case 5: // Physical Stats
        return Number(weightKg) > 0 && Number(heightCm) > 0 && Number(bodyFatPct) >= 0;
      case 6: // Gym Equipment
        return equipment !== null;
      case 7: // Preferences (Days, Duration, Style)
        return trainingDays >= 3 && durationMinutes > 0;
      case 8: // Experience Level (Beginner/Inter/Expert)
        return experience !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    handleSubmit();
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
      return;
    }
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!name || !gender || !goal || !experience || !experienceMode || !equipment) return;
    setIsSubmitting(true);

    const profile: UserProfile = {
      name: name.trim(),
      gender,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bodyFatPct: Number(bodyFatPct),
      goal,
      experience,
      experienceMode,
      equipment,
      durationMinutes,
      trainingDays,
      trainingStyle,
      createdAt: new Date().toISOString(),
    };

    saveProfile(profile);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-lg sm:mx-4 bg-base-card border border-base-border/90 rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[94vh] flex flex-col animate-slide-up sm:animate-scale-in overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-base-border/50">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-lime mb-2">
              Langkah {step} dari {TOTAL_STEPS}
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-lime" : "bg-base-border/50"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close onboarding"
            className="ml-4 h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-base-raised/70 text-white/70 active:scale-90 transition-transform"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto scrollbar-none flex-1">
          {step === 1 && <StepWelcome />}
          {step === 2 && <StepName name={name} setName={setName} gender={gender} setGender={setGender} />}
          {step === 3 && <StepGoal goal={goal} setGoal={setGoal} />}
          {step === 4 && <StepExperienceMode mode={experienceMode} setMode={setExperienceMode} />}
          {step === 5 && (
            <StepPhysical
              weightKg={weightKg}
              setWeightKg={setWeightKg}
              heightCm={heightCm}
              setHeightCm={setHeightCm}
              bodyFatPct={bodyFatPct}
              setBodyFatPct={setBodyFatPct}
            />
          )}
          {step === 6 && <StepEquipment equipment={equipment} setEquipment={setEquipment} />}
          {step === 7 && (
            <StepPreferences
              durationMinutes={durationMinutes}
              setDurationMinutes={setDurationMinutes}
              trainingDays={trainingDays}
              setTrainingDays={setTrainingDays}
              trainingStyle={trainingStyle}
              setTrainingStyle={setTrainingStyle}
            />
          )}
          {step === 8 && <StepExperience experience={experience} setExperience={setExperience} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-base-border/50 bg-base-card/95 flex gap-3">
          <button onClick={handleBack} className="btn-secondary flex-1" disabled={isSubmitting}>
            <ChevronLeft size={18} />
            {step === 1 ? "Batal" : "Kembali"}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="btn-primary flex-[2]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="animate-spin" /> Merancang Program Latihanmu...
              </span>
            ) : step === TOTAL_STEPS ? (
              <>
                Selesai & Mulai
                <Check size={18} />
              </>
            ) : (
              <>
                Lanjut
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Step 1: Welcome */
function StepWelcome() {
  return (
    <div className="animate-slide-in-right space-y-5 text-center py-6">
      <div className="h-16 w-16 mx-auto rounded-full bg-lime/10 border-2 border-lime/30 flex items-center justify-center text-lime animate-pulse">
        <Dumbbell size={32} />
      </div>
      <h2 className="heading-brutal text-3xl">Selamat Datang di YosFit AI!</h2>
      <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
        Mari rancang asisten latihan pintar yang sepenuhnya disesuaikan dengan kebutuhan fisik, target, dan peralatan olahraga Anda.
      </p>
    </div>
  );
}

/* Step 2: Name & Gender */
function StepName({
  name,
  setName,
  gender,
  setGender,
}: {
  name: string;
  setName: (n: string) => void;
  gender: Gender | null;
  setGender: (g: Gender) => void;
}) {
  return (
    <div className="animate-slide-in-right space-y-5">
      <h2 className="heading-brutal text-3xl">Profil Singkatmu</h2>
      <p className="text-white/50 text-sm">Nama panggilan digunakan untuk sapaan personal di aplikasi.</p>
      
      <div className="glass-card p-4 border-lime/10">
        <label className="block text-[10px] font-bold uppercase tracking-wide text-white/40 mb-2">Nama Panggilan</label>
        <input
          type="text"
          placeholder="Contoh: Yossi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={15}
          className="w-full bg-base-raised border border-base-border/80 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-lime/45 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {(["male", "female"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
              gender === g
                ? "bg-lime/10 border-lime text-lime font-bold shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                : "bg-base-raised/30 border-base-border/50 text-white/50"
            }`}
          >
            <User size={14} />
            <span className="text-xs uppercase font-extrabold tracking-wider">{g === "male" ? "Pria" : "Wanita"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Step 3: Goal */
const GOAL_OPTIONS: { value: Goal; label: string; desc: string; emoji: string }[] = [
  { value: "cutting", label: "Fat Loss (Cutting)", desc: "Menurunkan kadar lemak tubuh dan mengencangkan otot.", emoji: "🔥" },
  { value: "bulking", label: "Muscle Gain (Bulking)", desc: "Menambah ukuran otot dan kekuatan fisik secara progresif.", emoji: "💪" },
  { value: "maintenance", label: "General Fitness", desc: "Menjaga stamina, kebugaran, dan mobilitas sendi.", emoji: "⚡" },
];

function StepGoal({ goal, setGoal }: { goal: Goal | null; setGoal: (g: Goal) => void }) {
  return (
    <div className="animate-slide-in-right">
      <h2 className="heading-brutal text-3xl mb-1">Target Utama Latihan</h2>
      <p className="text-white/50 text-sm mb-5">Setiap target melahirkan program gerakan yang disesuaikan.</p>
      
      <div className="space-y-3.5">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g.value}
            onClick={() => setGoal(g.value)}
            className={`w-full flex items-center gap-4 rounded-2xl border-2 px-4.5 py-4 text-left transition-all ${
              goal === g.value
                ? "border-lime bg-lime/10 shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                : "border-base-border bg-base-raised/30 active:scale-[0.98]"
            }`}
          >
            <span className="text-3xl shrink-0">{g.emoji}</span>
            <div>
              <p className="font-display font-bold uppercase tracking-wide text-sm">{g.label}</p>
              <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Step 4: Experience Mode (Simple vs Advanced) */
function StepExperienceMode({ mode, setMode }: { mode: ExperienceMode | null; setMode: (m: ExperienceMode) => void }) {
  return (
    <div className="animate-slide-in-right">
      <h2 className="heading-brutal text-3xl mb-1">Pilih Mode Tampilan</h2>
      <p className="text-white/50 text-sm mb-5">Pilih antarmuka aplikasi sesuai dengan preferensi kenyamanan Anda.</p>

      <div className="space-y-4">
        <button
          onClick={() => setMode("simple")}
          className={`w-full flex items-start gap-4 rounded-2xl border-2 px-4.5 py-4.5 text-left transition-all ${
            mode === "simple"
              ? "border-lime bg-lime/10 shadow-[0_0_12px_rgba(204,255,0,0.15)]"
              : "border-base-border bg-base-raised/30 active:scale-[0.98]"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-base-border flex items-center justify-center shrink-0 text-white/70">
            <Eye size={20} />
          </div>
          <div>
            <p className="font-display font-extrabold uppercase tracking-wide text-sm">Mode Simpel (Simple)</p>
            <p className="text-white/45 text-xs mt-0.5 leading-relaxed">
              Sangat praktis. Hanya menampilkan menu gerakan utama, set, reps, demo, dan timer. Tanpa input beban berat yang rumit.
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode("advanced")}
          className={`w-full flex items-start gap-4 rounded-2xl border-2 px-4.5 py-4.5 text-left transition-all ${
            mode === "advanced"
              ? "border-lime bg-lime/10 shadow-[0_0_12px_rgba(204,255,0,0.15)]"
              : "border-base-border bg-base-raised/30 active:scale-[0.98]"
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0 text-lime">
            <Settings size={20} />
          </div>
          <div>
            <p className="font-display font-extrabold uppercase tracking-wide text-sm text-lime">Mode Lanjut (Advanced)</p>
            <p className="text-white/45 text-xs mt-0.5 leading-relaxed">
              Mencatat detail beban secara presisi, menyertakan target RPE/RIR, warmup generator, catatan latihan, dan grafik overload.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

/* Step 5: Physical Stats */
function StepPhysical({
  weightKg,
  setWeightKg,
  heightCm,
  setHeightCm,
  bodyFatPct,
  setBodyFatPct,
}: {
  weightKg: string;
  setWeightKg: (v: string) => void;
  heightCm: string;
  setHeightCm: (v: string) => void;
  bodyFatPct: string;
  setBodyFatPct: (v: string) => void;
}) {
  return (
    <div className="animate-slide-in-right space-y-5">
      <div>
        <h2 className="heading-brutal text-3xl mb-1">Informasi Fisik</h2>
        <p className="text-white/50 text-sm">Digunakan untuk melacak BMI dan target harian secara akurat.</p>
      </div>

      <InputField icon={<Scale size={16} />} label="Berat Badan (kg)" value={weightKg} onChange={setWeightKg} min={35} max={180} unit="kg" />
      <InputField icon={<Ruler size={16} />} label="Tinggi Badan (cm)" value={heightCm} onChange={setHeightCm} min={110} max={220} unit="cm" />
      <InputField icon={<Percent size={16} />} label="Estimasi Kadar Lemak (Body Fat %)" value={bodyFatPct} onChange={setBodyFatPct} min={5} max={50} unit="%" />
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  unit: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-white/55 text-xs font-bold uppercase tracking-wide mb-2.5">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 accent-lime h-2"
        />
        <div className="flex items-baseline gap-1 min-w-[70px] justify-end">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 bg-transparent text-right font-display font-extrabold text-lg text-lime focus:outline-none"
          />
          <span className="text-white/35 text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* Step 6: Gym Equipment */
const EQUIP_OPTIONS: { value: GymEquipment; label: string; desc: string; icon: string }[] = [
  { value: "commercial", label: "Commercial Gym", desc: "Akses lengkap ke mesin kabel, smith machine, barbell, dan dumbbells.", icon: "🏢" },
  { value: "home", label: "Home Gym", desc: "Peralatan rumahan standar (barbell dasar, bangku, rack, pull-up bar).", icon: "🏠" },
  { value: "dumbbell", label: "Dumbbell Only", desc: "Pola latihan hanya menggunakan dumbbells dengan berbagai variasi beban.", icon: "💪" },
  { value: "bodyweight", label: "Bodyweight Only", desc: "Latihan kalistenik murni menggunakan berat badan Anda sendiri.", icon: "🤸" },
  { value: "machine", label: "Machine Focused", desc: "Mengutamakan mesin kabel agar aman bagi persendian Anda.", icon: "⚙️" },
];

function StepEquipment({ equipment, setEquipment }: { equipment: GymEquipment | null; setEquipment: (e: GymEquipment) => void }) {
  return (
    <div className="animate-slide-in-right">
      <h2 className="heading-brutal text-3xl mb-1">Peralatan Olahraga</h2>
      <p className="text-white/50 text-sm mb-5">Program split latihan akan disesuaikan dengan ketersediaan alat.</p>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
        {EQUIP_OPTIONS.map((e) => (
          <button
            key={e.value}
            onClick={() => setEquipment(e.value)}
            className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all ${
              equipment === e.value
                ? "border-lime bg-lime/10 shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                : "border-base-border bg-base-raised/30 active:scale-[0.98]"
            }`}
          >
            <span className="text-2xl shrink-0">{e.icon}</span>
            <div>
              <p className="font-display font-bold uppercase tracking-wide text-xs">{e.label}</p>
              <p className="text-white/45 text-[10px] mt-0.5 leading-relaxed">{e.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Step 7: Preferences */
function StepPreferences({
  durationMinutes,
  setDurationMinutes,
  trainingDays,
  setTrainingDays,
  trainingStyle,
  setTrainingStyle,
}: {
  durationMinutes: number;
  setDurationMinutes: (d: number) => void;
  trainingDays: number;
  setTrainingDays: (d: number) => void;
  trainingStyle: TrainingStyle;
  setTrainingStyle: (t: TrainingStyle) => void;
}) {
  return (
    <div className="animate-slide-in-right space-y-5">
      <h2 className="heading-brutal text-3xl">Preferensi Latihan</h2>
      <p className="text-white/50 text-sm">Sesuaikan durasi, frekuensi, dan metode split latihan Anda.</p>

      {/* Days Count */}
      <div className="glass-card p-4">
        <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-2.5 flex items-center gap-1">
          <Calendar size={13} /> Frekuensi Hari Aktif
        </label>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((day) => (
            <button
              key={day}
              onClick={() => setTrainingDays(day)}
              className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                trainingDays === day
                  ? "bg-lime/10 border-lime text-lime shadow-[0_0_8px_rgba(204,255,0,0.15)]"
                  : "bg-base-raised/35 border-base-border/50 text-white/55"
              }`}
            >
              {day} Hari / Minggu
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="glass-card p-4">
        <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-2.5 flex items-center gap-1">
          <Clock size={13} /> Target Durasi Per Sesi
        </label>
        <div className="flex gap-2">
          {[45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => setDurationMinutes(mins)}
              className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                durationMinutes === mins
                  ? "bg-lime/10 border-lime text-lime shadow-[0_0_8px_rgba(204,255,0,0.15)]"
                  : "bg-base-raised/35 border-base-border/50 text-white/55"
              }`}
            >
              {mins} Menit
            </button>
          ))}
        </div>
      </div>

      {/* Training Style */}
      <div className="glass-card p-4">
        <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-2.5">Pola Split Program</label>
        <select
          value={trainingStyle}
          onChange={(e) => setTrainingStyle(e.target.value as TrainingStyle)}
          className="w-full bg-base-raised border border-base-border/60 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-lime/45 cursor-pointer"
        >
          <option value="auto">Rekomendasi Otomatis (Sesuai Goal)</option>
          <option value="ppl">Push-Pull-Legs (3-6 Hari)</option>
          <option value="upper_lower">Upper-Lower Split (4 Hari)</option>
          <option value="full_body">Full Body Workout (3 Hari)</option>
        </select>
      </div>
    </div>
  );
}

/* Step 8: Experience Level */
const LEVELS: { value: ExperienceLevel; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "beginner", label: "Pemula (Beginner)", desc: "Kurang dari 6 bulan latihan konsisten.", icon: <Sprout size={20} /> },
  { value: "intermediate", label: "Menengah (Intermediate)", desc: "6 - 24 bulan latihan konsisten.", icon: <Zap size={20} /> },
  { value: "expert", label: "Lanjut (Expert)", desc: "Lebih dari 2 tahun latihan kekuatan terprogram.", icon: <Crown size={20} /> },
];

function StepExperience({
  experience,
  setExperience,
}: {
  experience: ExperienceLevel | null;
  setExperience: (e: ExperienceLevel) => void;
}) {
  return (
    <div className="animate-slide-in-right">
      <h2 className="heading-brutal text-3xl mb-1">Tingkat Pengalaman</h2>
      <p className="text-white/50 text-sm mb-5">Membantu memperhitungkan volume set awal agar otot tidak mudah cedera.</p>
      
      <div className="space-y-3.5">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => setExperience(l.value)}
            className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
              experience === l.value
                ? "border-lime bg-lime/10 shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                : "border-base-border bg-base-raised/30 active:scale-[0.98]"
            }`}
          >
            <div
              className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                experience === l.value ? "bg-lime text-black" : "bg-base-border text-white/55"
              }`}
            >
              {l.icon}
            </div>
            <div>
              <p className="font-display font-bold uppercase tracking-wide text-xs">{l.label}</p>
              <p className="text-white/45 text-[10px] mt-0.5">{l.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
