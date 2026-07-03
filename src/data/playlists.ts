import { DayPlan, Goal } from "@/types";

export interface CuratedPlaylist {
  id: string;
  title: string;
  mood: string;
  description: string;
  youtubePlaylistId: string;
  tags: string[];
}

export const CURATED_PLAYLISTS: CuratedPlaylist[] = [
  {
    id: "phonk-heavy",
    title: "Phonk Beast Mode 🏋️",
    mood: "Aggressive / Ultra Energy",
    description: "Bass kencang untuk set terberat dan latihan intensitas maksimal.",
    youtubePlaylistId: "PL4fGSI1pDJn6j12e4Bw4sX1p2a9fQGz9g", // Gym Phonk Playlist
    tags: ["bulking", "push", "pull", "legs", "high-intensity"],
  },
  {
    id: "edm-cardio",
    title: "EDM Shred Cardio ⚡",
    mood: "High Tempo / Upbeat",
    description: "Tempo tinggi untuk menjaga detak jantung stabil saat cutting/cardio.",
    youtubePlaylistId: "PL9c2H4x18D3V0iY6ZxF1kP737fBq1gK9k", // Gym EDM Workout Playlist
    tags: ["cutting", "cardio", "high-intensity", "full-body"],
  },
  {
    id: "metal-rock",
    title: "Gym Metal & Hard Rock 🎸",
    mood: "Raw Power / Aggressive",
    description: "Distorsi gitar berat untuk membakar semangat angkat besi berat.",
    youtubePlaylistId: "PL3oW2tjiIxvSpX-mN_fL2K-jM26y5i-L3", // Rock Workout
    tags: ["powerlifting", "legs", "push", "heavy"],
  },
  {
    id: "hiphop-beast",
    title: "Hip-Hop Training Camp 🎤",
    mood: "Focused / Confident",
    description: "Rhythm & beat solid untuk meningkatkan fokus latihan kekuatan.",
    youtubePlaylistId: "PLH22-48ciUxS_D1a1K3G74e-J_6b24H9k", // Hip Hop Gym
    tags: ["maintenance", "intermediate", "pull", "push"],
  },
  {
    id: "lofi-recovery",
    title: "Chill Lofi Recovery 🧘",
    mood: "Calm / Relaxed",
    description: "Melodi santai untuk hari istirahat, peregangan otot, dan meditasi.",
    youtubePlaylistId: "PLofmCdWRcJD1r841eZg39FpX_OQk9_X5s", // Lofi Girl / Chill
    tags: ["rest", "stretching", "recovery", "low-intensity"],
  },
];

export function getRecommendedPlaylist(dayPlan: DayPlan, goal: Goal): CuratedPlaylist {
  if (dayPlan.isRestDay) {
    return CURATED_PLAYLISTS.find(p => p.id === "lofi-recovery") || CURATED_PLAYLISTS[4];
  }

  if (goal === "cutting") {
    return CURATED_PLAYLISTS.find(p => p.id === "edm-cardio") || CURATED_PLAYLISTS[1];
  }

  if (goal === "powerlifting") {
    return CURATED_PLAYLISTS.find(p => p.id === "metal-rock") || CURATED_PLAYLISTS[2];
  }

  if (goal === "bulking") {
    return CURATED_PLAYLISTS.find(p => p.id === "phonk-heavy") || CURATED_PLAYLISTS[0];
  }

  return CURATED_PLAYLISTS.find(p => p.id === "hiphop-beast") || CURATED_PLAYLISTS[3];
}
