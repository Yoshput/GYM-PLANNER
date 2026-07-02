import { Day, DayPlan, Exercise, ExperienceLevel, Goal, WorkoutSplit } from "@/types";

/**
 * ============================================================
 * EXERCISE LIBRARY
 * The static "source of truth" for every movement the generator
 * can slot into a day plan. Grouped by training pattern so the
 * split templates below can reference them by key.
 * ============================================================
 */
const EX = {
  // Full body / compound staples
  squat: (): Omit<Exercise, "sets" | "reps" | "intensity" | "restSeconds"> => ({
    id: "back-squat",
    name: "Barbell Back Squat",
    targetMuscle: "Paha Depan (Quads), Bokong (Glutes), Otot Inti (Core)",
    cue: "Kencangkan perut, turunkan pinggul dan lutut bersamaan seperti mau duduk, dorong dari telapak kaki tengah.",
    equipment: "Barbell + Rak",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
  }),
  goblet: () => ({
    id: "goblet-squat",
    name: "Goblet Squat",
    targetMuscle: "Paha Depan (Quads), Bokong (Glutes)",
    cue: "Pegang dumbbell di depan dada, turunkan badan hingga siku menyentuh bagian dalam lutut.",
    equipment: "Dumbbell",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
  }),
  deadlift: () => ({
    id: "deadlift",
    name: "Conventional Deadlift",
    targetMuscle: "Paha Belakang (Hamstring), Bokong (Glutes), Punggung",
    cue: "Jaga punggung tetap rata, posisikan besi barbell dekat tulang kering, dorong lantai dengan kaki untuk berdiri.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  rdl: () => ({
    id: "romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    targetMuscle: "Paha Belakang (Hamstring), Bokong (Glutes)",
    cue: "Tekuk lutut sedikit saja, dorong pinggul ke belakang, rasakan tarikan di paha belakang.",
    equipment: "Barbell / Dumbbell",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  bench: () => ({
    id: "bench-press",
    name: "Barbell Bench Press",
    targetMuscle: "Dada, Tricep, Bahu Depan",
    cue: "Kunci belikat menempel ke bangku, turunkan barbell perlahan ke dada bawah lalu dorong lurus ke atas.",
    equipment: "Barbell + Bangku (Bench)",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  dbBench: () => ({
    id: "db-bench-press",
    name: "Dumbbell Bench Press",
    targetMuscle: "Dada, Tricep",
    cue: "Kendalikan gerakan saat turun, dorong dumbbell ke atas dan agak merapat di posisi puncak.",
    equipment: "Dumbbell + Bangku (Bench)",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
  }),
  ohp: () => ({
    id: "overhead-press",
    name: "Overhead Press (OHP)",
    targetMuscle: "Bahu, Tricep, Otot Inti (Core)",
    cue: "Kencangkan bokong dan perut, dorong barbell lurus ke atas melewati depan wajah sampai lengan lurus.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80",
  }),
  row: () => ({
    id: "barbell-row",
    name: "Barbell Row",
    targetMuscle: "Punggung Tengah, Lats, Bicep",
    cue: "Bungkukkan badan 45 derajat, tarik barbell ke arah perut bawah, hindari menggunakan momentum tubuh.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  pullup: () => ({
    id: "pull-up",
    name: "Pull-Up",
    targetMuscle: "Sayap (Lats), Bicep",
    cue: "Mulai dari posisi menggantung penuh, tarik tubuh hingga dagu melewati tiang, jangan mengayunkan kaki.",
    equipment: "Tiang Pull-Up",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
  }),
  latPulldown: () => ({
    id: "lat-pulldown",
    name: "Lat Pulldown",
    targetMuscle: "Sayap (Lats), Bicep",
    cue: "Gunakan kekuatan siku untuk menarik palang ke dada bagian atas, kendalikan beban saat naik.",
    equipment: "Mesin Kabel (Lat Pulldown)",
    imageUrl: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=600&auto=format&fit=crop&q=80",
  }),
  legPress: () => ({
    id: "leg-press",
    name: "Leg Press",
    targetMuscle: "Paha Depan (Quads), Bokong (Glutes)",
    cue: "Buka kaki selebar bahu, turunkan platform secara terkontrol, jangan biarkan punggung bawah melengkung.",
    equipment: "Mesin Leg Press",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
  }),
  lunge: () => ({
    id: "walking-lunge",
    name: "Walking Lunge",
    targetMuscle: "Paha Depan (Quads), Bokong (Glutes)",
    cue: "Langkah maju ke depan, turunkan lutut belakang hampir menyentuh lantai, jaga tubuh tetap tegak.",
    equipment: "Dumbbell",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  legCurl: () => ({
    id: "leg-curl",
    name: "Seated Leg Curl",
    targetMuscle: "Paha Belakang (Hamstring)",
    cue: "Tarik bantalan ke bawah secara perlahan dan terkontrol, remas otot paha belakang di posisi bawah.",
    equipment: "Mesin Leg Curl",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  legExt: () => ({
    id: "leg-extension",
    name: "Leg Extension",
    targetMuscle: "Paha Depan (Quads)",
    cue: "Luruskan kaki ke atas, tahan sebentar di posisi puncak, hindari menghentak beban secara kasar.",
    equipment: "Mesin Leg Extension",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  hipThrust: () => ({
    id: "hip-thrust",
    name: "Barbell Hip Thrust",
    targetMuscle: "Bokong (Glutes)",
    cue: "Tekuk dagu, dorong melalui tumit kaki, kencangkan bokong sekuat mungkin di posisi atas.",
    equipment: "Barbell + Bangku (Bench)",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  incline: () => ({
    id: "incline-db-press",
    name: "Incline Dumbbell Press",
    targetMuscle: "Dada Bagian Atas, Bahu Depan",
    cue: "Atur kemiringan bangku 30-45 derajat, dorong dumbbell ke atas secara terkontrol.",
    equipment: "Dumbbell + Incline Bench",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
  }),
  dip: () => ({
    id: "dip",
    name: "Chest Dip",
    targetMuscle: "Dada Bawah, Tricep",
    cue: "Condongkan tubuh sedikit ke depan, turunkan badan hingga lengan membentuk sudut 90 derajat lalu dorong kembali.",
    equipment: "Tiang Dip / Parallel Bars",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
  }),
  lateralRaise: () => ({
    id: "lateral-raise",
    name: "Dumbbell Lateral Raise",
    targetMuscle: "Bahu Samping (Side Delts)",
    cue: "Angkat dumbbell ke samping dengan siku memimpin gerakan setinggi bahu, jangan mengayunkan badan.",
    equipment: "Dumbbell",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
  }),
  facePull: () => ({
    id: "face-pull",
    name: "Cable Face Pull",
    targetMuscle: "Bahu Belakang (Rear Delts), Punggung Atas",
    cue: "Tarik tali ke arah mata, arahkan tangan keluar, remas belikat di posisi belakang.",
    equipment: "Mesin Kabel + Tali",
    imageUrl: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=600&auto=format&fit=crop&q=80",
  }),
  curl: () => ({
    id: "barbell-curl",
    name: "Barbell Curl",
    targetMuscle: "Bicep",
    cue: "Tempelkan siku di samping badan, tekuk lengan ke atas tanpa mengayunkan pinggul, remas bicep di atas.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
  }),
  hammerCurl: () => ({
    id: "hammer-curl",
    name: "Hammer Curl",
    targetMuscle: "Bicep, Lengan Bawah (Forearms)",
    cue: "Pegang dumbbell dengan posisi genggaman netral (seperti memegang palu), kontrol gerakan saat turun.",
    equipment: "Dumbbell",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
  }),
  tricepPushdown: () => ({
    id: "tricep-pushdown",
    name: "Cable Tricep Pushdown",
    targetMuscle: "Tricep",
    cue: "Kunci siku di samping badan, dorong tali/stang ke bawah sampai lengan lurus sepenuhnya.",
    equipment: "Mesin Kabel",
    imageUrl: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=600&auto=format&fit=crop&q=80",
  }),
  skullcrusher: () => ({
    id: "skullcrusher",
    name: "EZ-Bar Skullcrusher",
    targetMuscle: "Tricep",
    cue: "Turunkan stang EZ-bar secara terkontrol ke arah dahi, jaga siku tetap sejajar menghadap ke atas.",
    equipment: "Stang EZ-Bar + Bangku",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
  }),
  plank: () => ({
    id: "plank",
    name: "Front Plank",
    targetMuscle: "Otot Perut (Core / Abs)",
    cue: "Jaga posisi tubuh lurus dari kepala hingga tumit, kencangkan perut dan bokong.",
    equipment: "Berat Badan",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
  }),
  hangingLegRaise: () => ({
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    targetMuscle: "Perut Bawah, Fleksor Pinggul",
    cue: "Gantungkan tubuh di tiang, angkat kaki ke atas secara terkontrol tanpa mengayunkan tubuh.",
    equipment: "Tiang Pull-Up",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
  }),
  cableCrunch: () => ({
    id: "cable-crunch",
    name: "Cable Crunch",
    targetMuscle: "Otot Perut (Sixpack)",
    cue: "Tekuk punggung menggunakan otot perut untuk menarik beban ke bawah, bukan menarik dengan tangan.",
    equipment: "Mesin Kabel",
    imageUrl: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=600&auto=format&fit=crop&q=80",
  }),
  farmerCarry: () => ({
    id: "farmer-carry",
    name: "Farmer's Carry",
    targetMuscle: "Kekuatan Genggaman, Bahu Atas, Otot Inti",
    cue: "Jaga postur tetap tegak, berjalan dengan langkah pendek yang terkontrol sambil memegang beban berat.",
    equipment: "Dumbbell Berat / Kettlebell",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
  }),
  inclineWalk: () => ({
    id: "incline-walk",
    name: "Jalan Kaki Incline (Treadmill)",
    targetMuscle: "Kardio / Ketahanan",
    cue: "Atur tanjakan treadmill, berjalan dengan postur tegak, jangan berpegangan pada tiang.",
    equipment: "Treadmill",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  bikeSprint: () => ({
    id: "bike-sprint",
    name: "Sprint Sepeda Statis",
    targetMuscle: "Kardio / Pembakaran Lemak",
    cue: "Selang-seling 30 detik kayuhan maksimal (sprint) dengan 60 detik kayuhan santai.",
    equipment: "Sepeda Statis",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
  }),
  mobility: () => ({
    id: "mobility-flow",
    name: "Gerakan Mobilitas Sendi",
    targetMuscle: "Pemulihan / Kelenturan",
    cue: "Lakukan gerakan peregangan terkontrol untuk pinggul, punggung, dan bahu secara perlahan.",
    equipment: "Berat Badan / Matras",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
  }),
  jumpRope: () => ({
    id: "jump-rope",
    name: "Lompat Tali (Conditioning)",
    targetMuscle: "Kardio / Otot Betis",
    cue: "Melompat tipis-tipis menggunakan ujung kaki depan secara konsisten, jaga putaran tali tetap stabil.",
    equipment: "Tali Skipping",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
  }),
  // ── Powerlifting-specific exercises ──
  pauseSquat: () => ({
    id: "pause-squat",
    name: "Pause Squat",
    targetMuscle: "Paha Depan (Quads), Bokong (Glutes), Otot Inti",
    cue: "Turunkan ke posisi bawah, tahan 2-3 detik tanpa memantul, lalu dorong kembali ke atas dengan kuat. Melatih kekuatan dari titik terendah.",
    equipment: "Barbell + Rak",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
  }),
  frontSquat: () => ({
    id: "front-squat",
    name: "Front Squat",
    targetMuscle: "Paha Depan (Quads), Otot Inti, Punggung Atas",
    cue: "Letakkan barbell di depan bahu (bukan tengkuk), siku sejajar lantai, jaga punggung tegak saat turun.",
    equipment: "Barbell + Rak",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
  }),
  cgBench: () => ({
    id: "close-grip-bench",
    name: "Close-Grip Bench Press",
    targetMuscle: "Tricep, Dada Tengah",
    cue: "Pegang barbell selebar bahu (lebih sempit dari bench press biasa), tekuk siku ke arah samping badan. Sangat efektif melatih kekuatan lockout tricep.",
    equipment: "Barbell + Bangku (Bench)",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  pauseBench: () => ({
    id: "pause-bench",
    name: "Pause Bench Press",
    targetMuscle: "Dada, Tricep, Bahu Depan",
    cue: "Turunkan barbell ke dada, tahan 1-2 detik tanpa memantul, lalu dorong penuh. Melatih kekuatan off the chest yang penting di kompetisi.",
    equipment: "Barbell + Bangku (Bench)",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  sumoDeadlift: () => ({
    id: "sumo-deadlift",
    name: "Sumo Deadlift",
    targetMuscle: "Paha Dalam (Adductor), Bokong (Glutes), Punggung",
    cue: "Buka kaki lebar, arahkan jari kaki ke luar 45°, genggam barbell antara kedua kaki. Dorong lantai menjauhi tubuh, bukan angkat beban ke atas.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  blockPull: () => ({
    id: "block-pull",
    name: "Block Pull / Rack Pull",
    targetMuscle: "Punggung Atas, Trap, Bokong (Glutes)",
    cue: "Mulai dari posisi setengah (barbell di atas lutut menggunakan blok/rack pin). Fokus melatih lockout dan kekuatan punggung atas.",
    equipment: "Barbell + Blok / Power Rack",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  goodMorning: () => ({
    id: "good-morning",
    name: "Good Morning",
    targetMuscle: "Paha Belakang (Hamstring), Punggung Bawah (Erector)",
    cue: "Taruh barbell di tengkuk, tekuk pinggul ke depan hingga badan hampir sejajar lantai, lalu tegakkan kembali. Melatih kekuatan hip hinge untuk deadlift.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  }),
  bentOverRow: () => ({
    id: "bent-over-row-pl",
    name: "Pendlay Row",
    targetMuscle: "Punggung Tengah, Lats, Bahu Belakang",
    cue: "Mulai setiap rep dari lantai (bukan menggantung), badan sejajar lantai, tarik barbell eksplosif ke perut. Membangun kekuatan punggung untuk deadlift.",
    equipment: "Barbell",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  }),
  beltSquat: () => ({
    id: "belt-squat",
    name: "Belt Squat / Sissy Squat",
    targetMuscle: "Paha Depan (Quads)",
    cue: "Aksesori squat tanpa beban di punggung. Fokuskan tekanan murni pada otot kaki tanpa melelahkan punggung yang sudah berat bekerja.",
    equipment: "Mesin Belt Squat / Sissy Squat",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
  }),
  tricepDip: () => ({
    id: "tricep-dip-pl",
    name: "Weighted Tricep Dip",
    targetMuscle: "Tricep Longhead, Dada Bawah",
    cue: "Tambahkan beban menggunakan dip belt. Tubuh tetap tegak (tidak condong) agar fokus pada tricep sebagai otot utama lockout bench press.",
    equipment: "Tiang Dip + Dip Belt",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
  }),
} as const;

type ExKey = keyof typeof EX;

/**
 * Volume/intensity rule-set. This is the core matrix the brief asks for:
 * every (experience x goal) combination resolves to a concrete
 * sets/reps/intensity/rest prescription applied on top of the exercise list.
 */
interface Prescription {
  sets: number;
  reps: string;
  intensity: Exercise["intensity"];
  restSeconds: number;
}

const PRESCRIPTION_MATRIX: Record<ExperienceLevel, Record<Goal, Prescription>> = {
  beginner: {
    cutting: { sets: 3, reps: "12-15", intensity: "Low", restSeconds: 45 },
    maintenance: { sets: 3, reps: "10-12", intensity: "Moderate", restSeconds: 60 },
    bulking: { sets: 4, reps: "10-12", intensity: "Moderate", restSeconds: 75 },
    powerlifting: { sets: 5, reps: "5", intensity: "High", restSeconds: 180 },
  },
  intermediate: {
    cutting: { sets: 4, reps: "12-15", intensity: "Moderate", restSeconds: 60 },
    maintenance: { sets: 4, reps: "8-12", intensity: "Moderate", restSeconds: 75 },
    bulking: { sets: 4, reps: "8-10", intensity: "High", restSeconds: 90 },
    powerlifting: { sets: 5, reps: "3-5", intensity: "Max", restSeconds: 240 },
  },
  expert: {
    cutting: { sets: 4, reps: "10-12", intensity: "High", restSeconds: 60 },
    maintenance: { sets: 5, reps: "6-10", intensity: "High", restSeconds: 90 },
    bulking: { sets: 5, reps: "6-8", intensity: "Max", restSeconds: 120 },
    powerlifting: { sets: 5, reps: "1-3", intensity: "Max", restSeconds: 300 },
  },
};

function buildExercise(key: ExKey, p: Prescription): Exercise {
  const base = EX[key]();
  return { ...base, sets: p.sets, reps: p.reps, intensity: p.intensity, restSeconds: p.restSeconds };
}

/** Conditioning finisher added for cutting goals to raise weekly energy expenditure. */
function cardioFinisher(goal: Goal): Exercise[] {
  if (goal !== "cutting") return [];
  return [
    {
      ...EX.bikeSprint(),
      sets: 6,
      reps: "30s on / 60s off",
      intensity: "High",
      restSeconds: 60,
    },
  ];
}

/**
 * ============================================================
 * SPLIT TEMPLATES
 * Defines which exercise keys appear on which day for each
 * experience level. Beginner = Full Body, Intermediate = Upper/Lower,
 * Expert = Push/Pull/Legs (2 rotations across the week).
 * ============================================================
 */
type SplitTemplate = Record<Day, { label: string; focus: string; isRestDay: boolean; keys: ExKey[] }>;

const BEGINNER_TEMPLATE: SplitTemplate = {
  monday: { label: "Full Body A", focus: "Whole-Body Strength", isRestDay: false, keys: ["goblet", "row", "dbBench", "legCurl", "plank"] },
  tuesday: { label: "Active Recovery", focus: "Mobility & Light Cardio", isRestDay: false, keys: ["mobility", "inclineWalk"] },
  wednesday: { label: "Full Body B", focus: "Whole-Body Strength", isRestDay: false, keys: ["legPress", "latPulldown", "ohp", "hipThrust", "cableCrunch"] },
  thursday: { label: "Rest Day", focus: "Recovery", isRestDay: true, keys: [] },
  friday: { label: "Full Body C", focus: "Whole-Body Strength", isRestDay: false, keys: ["goblet", "dbBench", "row", "lunge", "hangingLegRaise"] },
  saturday: { label: "Cardio & Core", focus: "Conditioning", isRestDay: false, keys: ["jumpRope", "plank", "mobility"] },
  sunday: { label: "Rest Day", focus: "Recovery", isRestDay: true, keys: [] },
};

const INTERMEDIATE_TEMPLATE: SplitTemplate = {
  monday: { label: "Upper Body", focus: "Push & Pull Strength", isRestDay: false, keys: ["bench", "row", "ohp", "latPulldown", "curl", "tricepPushdown"] },
  tuesday: { label: "Lower Body", focus: "Legs & Glutes", isRestDay: false, keys: ["squat", "rdl", "legPress", "legCurl", "hipThrust"] },
  wednesday: { label: "Rest Day", focus: "Recovery", isRestDay: true, keys: [] },
  thursday: { label: "Upper Body", focus: "Hypertrophy Focus", isRestDay: false, keys: ["incline", "pullup", "lateralRaise", "facePull", "hammerCurl", "skullcrusher"] },
  friday: { label: "Lower Body", focus: "Legs & Posterior Chain", isRestDay: false, keys: ["deadlift", "legExt", "lunge", "legCurl", "plank"] },
  saturday: { label: "Conditioning", focus: "Cardio & Core", isRestDay: false, keys: ["bikeSprint", "farmerCarry", "hangingLegRaise"] },
  sunday: { label: "Rest Day", focus: "Recovery", isRestDay: true, keys: [] },
};

const EXPERT_TEMPLATE: SplitTemplate = {
  monday: { label: "Push", focus: "Chest, Shoulders, Triceps", isRestDay: false, keys: ["bench", "ohp", "incline", "lateralRaise", "dip", "tricepPushdown"] },
  tuesday: { label: "Pull", focus: "Back & Biceps", isRestDay: false, keys: ["deadlift", "pullup", "row", "facePull", "curl", "hammerCurl"] },
  wednesday: { label: "Legs", focus: "Quads, Hams, Glutes", isRestDay: false, keys: ["squat", "legPress", "rdl", "legExt", "legCurl", "hipThrust"] },
  thursday: { label: "Push", focus: "Chest, Shoulders, Triceps", isRestDay: false, keys: ["incline", "dip", "ohp", "lateralRaise", "skullcrusher"] },
  friday: { label: "Pull", focus: "Back & Biceps", isRestDay: false, keys: ["row", "pullup", "latPulldown", "facePull", "hammerCurl"] },
  saturday: { label: "Legs", focus: "Posterior Chain & Core", isRestDay: false, keys: ["deadlift", "lunge", "legExt", "hangingLegRaise", "farmerCarry"] },
  sunday: { label: "Rest Day", focus: "Full Recovery", isRestDay: true, keys: [] },
};

/**
 * POWERLIFTING TEMPLATE — 4-Day Frequency Block
 * Squat Day / Bench Day / Rest / Deadlift Day / Accessories / Rest / Rest
 * Focuses on the Big 3 competition lifts + targeted accessories.
 */
const POWERLIFTING_TEMPLATE: SplitTemplate = {
  monday: { label: "Squat Day", focus: "Back Squat — Strength & Technique", isRestDay: false, keys: ["squat", "pauseSquat", "frontSquat", "legCurl", "plank"] },
  tuesday: { label: "Bench Day", focus: "Bench Press — Off the Chest Power", isRestDay: false, keys: ["bench", "pauseBench", "cgBench", "tricepDip", "facePull"] },
  wednesday: { label: "Rest & Recovery", focus: "Active Mobility", isRestDay: false, keys: ["mobility"] },
  thursday: { label: "Deadlift Day", focus: "Conventional & Sumo Deadlift", isRestDay: false, keys: ["deadlift", "sumoDeadlift", "blockPull", "goodMorning", "bentOverRow"] },
  friday: { label: "Accessory Day", focus: "Weak Point & GPP Training", isRestDay: false, keys: ["beltSquat", "rdl", "latPulldown", "cgBench", "farmerCarry"] },
  saturday: { label: "Rest Day", focus: "Full Recovery", isRestDay: true, keys: [] },
  sunday: { label: "Rest Day", focus: "Full Recovery", isRestDay: true, keys: [] },
};

const TEMPLATES: Record<ExperienceLevel, SplitTemplate> = {
  beginner: BEGINNER_TEMPLATE,
  intermediate: INTERMEDIATE_TEMPLATE,
  expert: EXPERT_TEMPLATE,
};

export const DAY_ORDER: Day[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Generates a complete 7-day split by combining:
 *  1. The split template for the user's experience level (which exercises, which days)
 *  2. The prescription matrix for experience x goal (sets/reps/intensity/rest)
 *  3. A cardio finisher on lifting days when the goal is cutting
 */
export function generateWorkoutSplit(experience: ExperienceLevel, goal: Goal): WorkoutSplit {
  // Powerlifting uses its own dedicated template regardless of experience level
  const template = goal === "powerlifting" ? POWERLIFTING_TEMPLATE : TEMPLATES[experience];
  const prescription = PRESCRIPTION_MATRIX[experience][goal];

  const split = {} as WorkoutSplit;

  // Keys that always use fixed light/mobility prescriptions
  const LIGHT_KEYS = ["mobility", "inclineWalk", "jumpRope", "bikeSprint", "farmerCarry"];
  // Powerlifting accessory keys use slightly lighter volume than the main lifts
  const PL_ACCESSORY_KEYS = ["pauseSquat", "frontSquat", "pauseBench", "cgBench", "beltSquat", "blockPull", "goodMorning", "sumoDeadlift", "bentOverRow", "tricepDip"];

  for (const day of DAY_ORDER) {
    const dayTemplate = template[day];
    const exercises: Exercise[] = dayTemplate.isRestDay
      ? []
      : dayTemplate.keys.map((key) => {
          if (LIGHT_KEYS.includes(key)) {
            return buildExercise(key, { sets: 3, reps: "10-12 min", intensity: "Moderate", restSeconds: 45 });
          }
          // Powerlifting accessories: 1 set fewer, slightly higher reps for hypertrophy support
          if (goal === "powerlifting" && PL_ACCESSORY_KEYS.includes(key)) {
            return buildExercise(key, {
              sets: Math.max(3, prescription.sets - 1),
              reps: "6-8",
              intensity: "High",
              restSeconds: 120,
            });
          }
          return buildExercise(key, prescription);
        });

    // No cardio finisher for powerlifting — recovery is paramount
    if (goal !== "powerlifting" && !dayTemplate.isRestDay && dayTemplate.label !== "Cardio & Core" && dayTemplate.label !== "Conditioning") {
      exercises.push(...cardioFinisher(goal));
    }

    const dayPlan: DayPlan = {
      day,
      label: dayTemplate.label,
      focus: dayTemplate.focus,
      isRestDay: dayTemplate.isRestDay,
      exercises,
    };

    split[day] = dayPlan;
  }

  return split;
}

export const DAY_LABELS: Record<Day, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
