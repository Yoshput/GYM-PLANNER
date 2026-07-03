import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client that bypasses RLS to write reference data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseName = searchParams.get("name")?.trim();

    if (!exerciseName) {
      return NextResponse.json({ error: "Missing exercise name" }, { status: 400 });
    }

    // 1. Check cache in Supabase (case-insensitive check)
    const { data: cached, error: cacheError } = await supabaseAdmin
      .from("exercise_gif_cache")
      .select("*")
      .ilike("exercise_name", exerciseName)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({
        gifUrl: cached.gif_url,
        source: cached.source,
      });
    }

    // 2. If not found in cache, call WorkoutX API
    const workoutxApiKey = process.env.WORKOUTX_API_KEY;
    let gifUrl: string | null = null;
    let source: "workoutx" | "free-exercise-db" | "none" = "none";

    if (workoutxApiKey) {
      try {
        const response = await fetch(
          `https://api.workoutxapp.com/v1/exercises?name=${encodeURIComponent(exerciseName)}`,
          {
            headers: {
              "X-WorkoutX-Key": workoutxApiKey,
            },
            next: { revalidate: 86400 }, // Cache response
          }
        );

        if (response.ok) {
          const data = await response.json();
          // WorkoutX can return array or single object
          const item = Array.isArray(data) ? data[0] : data;
          gifUrl = item?.gifUrl || item?.gif_url || item?.url || null;
          if (gifUrl) {
            source = "workoutx";
          }
        }
      } catch (err) {
        console.error("WorkoutX API call failed, falling back:", err);
      }
    }

    // 3. Fallback to free-exercise-db if WorkoutX failed or had no result
    if (!gifUrl) {
      try {
        // Format name to match yuhonas/free-exercise-db format:
        // Capitalize each word and replace spaces with underscore
        const formattedName = exerciseName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("_");

        const fallbackUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${formattedName}/0.jpg`;
        
        // Verify if image exists by checking HEAD
        const checkRes = await fetch(fallbackUrl, { method: "HEAD" });
        if (checkRes.ok) {
          gifUrl = fallbackUrl;
          source = "free-exercise-db";
        }
      } catch (err) {
        console.error("Free Exercise DB fallback check failed:", err);
      }
    }

    // 4. Save result to cache table (including "none" if we found absolutely no demo)
    const { error: upsertError } = await supabaseAdmin.from("exercise_gif_cache").upsert({
      exercise_name: exerciseName,
      gif_url: gifUrl,
      source: source,
      cached_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Error upserting exercise gif cache:", upsertError);
    }

    return NextResponse.json({
      gifUrl,
      source,
    });
  } catch (error: any) {
    console.error("Error in exercise-gif API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
