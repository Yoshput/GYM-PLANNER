import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

import { generateWorkoutSplit } from "../src/data/workouts";
import { ExperienceLevel, Goal } from "../src/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const workoutxApiKey = process.env.WORKOUTX_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Kredensial Supabase tidak ditemukan di .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("=== MEMULAI SEEDING EXERCISE GIF CACHE ===");

  // 1. Ekstrak seluruh exercise unik dari generator
  const levels: ExperienceLevel[] = ["beginner", "intermediate", "expert"];
  const goals: Goal[] = ["cutting", "bulking", "maintenance", "powerlifting"];
  const exerciseNames = new Set<string>();

  for (const level of levels) {
    for (const goal of goals) {
      const split = generateWorkoutSplit(level, goal);
      for (const day of Object.values(split)) {
        if (day.exercises) {
          for (const ex of day.exercises) {
            if (ex.name) {
              exerciseNames.add(ex.name.trim());
            }
          }
        }
      }
    }
  }

  const uniqueExercises = Array.from(exerciseNames);
  console.log(`Ditemukan ${uniqueExercises.length} nama latihan unik dari program generator.`);

  // 2. Cek mana yang sudah ada di cache
  const { data: cachedRows, error: fetchError } = await supabaseAdmin
    .from("exercise_gif_cache")
    .select("exercise_name");

  if (fetchError) {
    console.error("Gagal mengambil cache latihan dari Supabase:", fetchError);
    process.exit(1);
  }

  const cachedNames = new Set((cachedRows || []).map(r => r.exercise_name.toLowerCase()));
  const toFetch = uniqueExercises.filter(name => !cachedNames.has(name.toLowerCase()));

  console.log(`${uniqueExercises.length - toFetch.length} latihan sudah dicache.`);
  console.log(`${toFetch.length} latihan perlu dicari gif/gambarnya.`);

  if (toFetch.length === 0) {
    console.log("Semua latihan sudah tersimpan di cache. Seeding selesai.");
    return;
  }

  // 3. Batasan kuota & safety buffer
  // WorkoutX memiliki kuota seumur hidup 500 request. Kita set safety buffer 50.
  // Estimasi penggunaan kuota saat ini: kita asumsikan tersisa 400.
  // Untuk melacak kuota asli dari header atau response, kita bisa print response headers WorkoutX
  let workoutXRequestsSpent = 0;
  let freeDbRequestsSpent = 0;
  let noneRequestsSpent = 0;
  
  // Batasi panggilan WorkoutX API agar sangat aman (maksimal 15 per eksekusi script)
  const MAX_WORKOUTX_CALLS_THIS_RUN = 15;

  for (let i = 0; i < toFetch.length; i++) {
    const exerciseName = toFetch[i];

    console.log(`\n[${i + 1}/${toFetch.length}] Memproses: "${exerciseName}"`);

    let gifUrl: string | null = null;
    let source: "workoutx" | "free-exercise-db" | "none" = "none";

    // A. Cari di WorkoutX (hanya jika belum mencapai batas aman run ini)
    if (workoutxApiKey && workoutXRequestsSpent < MAX_WORKOUTX_CALLS_THIS_RUN) {
      try {
        console.log(`Memanggil WorkoutX API untuk "${exerciseName}"...`);
        const response = await fetch(
          `https://api.workoutxapp.com/v1/exercises?name=${encodeURIComponent(exerciseName)}`,
          {
            headers: {
              "X-WorkoutX-Key": workoutxApiKey,
            }
          }
        );

        workoutXRequestsSpent++;

        if (response.ok) {
          const data = await response.json();
          const item = Array.isArray(data) ? data[0] : data;
          gifUrl = item?.gifUrl || item?.gif_url || item?.url || null;
          if (gifUrl) {
            source = "workoutx";
            console.log(`-> Berhasil mendapat GIF dari WorkoutX: ${gifUrl}`);
          }
        } else {
          console.log(`-> Respon WorkoutX tidak sukses (status: ${response.status})`);
        }
      } catch (err) {
        console.error(`-> Error memanggil WorkoutX API:`, err);
      }
    } else if (workoutxApiKey) {
      console.log(`[Batas Panggilan Tercapai] Skip WorkoutX API, langsung pakai fallback untuk "${exerciseName}"`);
    }

    // B. Fallback ke free-exercise-db
    if (!gifUrl) {
      try {
        console.log(`Mencoba fallback free-exercise-db untuk "${exerciseName}"...`);
        const formattedName = exerciseName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("_");

        const fallbackUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${formattedName}/0.jpg`;
        
        const checkRes = await fetch(fallbackUrl, { method: "HEAD" });
        if (checkRes.ok) {
          gifUrl = fallbackUrl;
          source = "free-exercise-db";
          freeDbRequestsSpent++;
          console.log(`-> Berhasil mendapat gambar dari free-exercise-db: ${gifUrl}`);
        } else {
          console.log(`-> Free-exercise-db tidak memiliki gambar untuk "${formattedName}"`);
        }
      } catch (err) {
        console.error(`-> Fallback free-exercise-db gagal:`, err);
      }
    }

    if (!gifUrl) {
      noneRequestsSpent++;
      console.log(`-> Tidak ditemukan demo untuk "${exerciseName}". Disimpan sebagai preview SVG.`);
    }

    // C. Simpan ke database
    const { error: upsertError } = await supabaseAdmin.from("exercise_gif_cache").upsert({
      exercise_name: exerciseName,
      gif_url: gifUrl,
      source: source,
      cached_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Gagal menyimpan ke database Supabase:", upsertError);
    }

    // Berikan jeda 2 detik untuk menghindari rate limit 30 RPM
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n=== SEEDING SELESAI ===");
  console.log(`- Total latihan dicache di run ini: ${workoutXRequestsSpent + freeDbRequestsSpent + noneRequestsSpent}`);
  console.log(`- Dari WorkoutX API: ${workoutXRequestsSpent}`);
  console.log(`- Dari free-exercise-db: ${freeDbRequestsSpent}`);
  console.log(`- Tanpa match (None): ${noneRequestsSpent}`);
}

seed().catch(err => {
  console.error("Terjadi error tak terduga selama seeding:", err);
  process.exit(1);
});
