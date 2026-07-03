"use client";

import { useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<boolean>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setProfile(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: dbProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Check localStorage - but ONLY if it belongs to the current user
      let localProfile: any = null;
      try {
        const raw = window.localStorage.getItem("gym-planner:profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          // Only use localStorage if it matches current user (has userId field matching)
          // or if there's no userId field stored (legacy - first time migration only)
          const storedUserId = window.localStorage.getItem("gym-planner:userId");
          if (!storedUserId || storedUserId === session.user.id) {
            localProfile = parsed;
          } else {
            // Different user's data - clear all localStorage to prevent contamination
            console.log("[useProfile] Clearing stale localStorage from different user");
            window.localStorage.clear();
          }
        }
      } catch {}

      if (error || !dbProfile || !dbProfile.goal) {
        // New user with no DB profile → show onboarding (do NOT sync stale local data)
        setProfile(null);
      } else {
        // Map database fields to UserProfile
        // Also store current userId in localStorage to detect user switches
        try {
          window.localStorage.setItem("gym-planner:userId", session.user.id);
        } catch {}

        const mappedProfile: UserProfile = {
          name: dbProfile.name || session.user.email?.split("@")[0] || "User",
          profileImage: dbProfile.profile_image || undefined,
          gender: dbProfile.gender || "male",
          weightKg: dbProfile.weight_kg ? Number(dbProfile.weight_kg) : 70,
          heightCm: dbProfile.height_cm ? Number(dbProfile.height_cm) : 170,
          bodyFatPct: dbProfile.body_fat_pct ? Number(dbProfile.body_fat_pct) : 15,
          goal: dbProfile.goal || "maintenance",
          experience: dbProfile.experience || "beginner",
          createdAt: dbProfile.created_at || new Date().toISOString(),
          experienceMode: (dbProfile.experience_mode as any) || "simple",
          equipment: (dbProfile.equipment as any) || "dumbbell",
          durationMinutes: dbProfile.duration_minutes ? Number(dbProfile.duration_minutes) : 60,
          trainingDays: dbProfile.training_days ? Number(dbProfile.training_days) : 3,
          trainingStyle: (dbProfile.training_style as any) || "auto",
        };
        
        setProfile(mappedProfile);
      }
    } catch {
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return false;

      // Map back to database columns
      const dbData: any = {};
      if (updated.name !== undefined) dbData.name = updated.name;
      if (updated.profileImage !== undefined) dbData.profile_image = updated.profileImage;
      if (updated.gender !== undefined) dbData.gender = updated.gender;
      if (updated.weightKg !== undefined) dbData.weight_kg = updated.weightKg;
      if (updated.heightCm !== undefined) dbData.height_cm = updated.heightCm;
      if (updated.bodyFatPct !== undefined) dbData.body_fat_pct = updated.bodyFatPct;
      if (updated.goal !== undefined) dbData.goal = updated.goal;
      if (updated.experience !== undefined) dbData.experience = updated.experience;
      if (updated.experienceMode !== undefined) dbData.experience_mode = updated.experienceMode;
      if (updated.equipment !== undefined) dbData.equipment = updated.equipment;
      if (updated.durationMinutes !== undefined) dbData.duration_minutes = updated.durationMinutes;
      if (updated.trainingDays !== undefined) dbData.training_days = updated.trainingDays;
      if (updated.trainingStyle !== undefined) dbData.training_style = updated.trainingStyle;

      dbData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          ...dbData,
        });

      if (error) throw error;
      await refresh();
      return true;
    } catch (e) {
      console.error("Error updating profile:", e);
      return false;
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, isLoading, isAuthenticated, refresh, updateProfile };
}
