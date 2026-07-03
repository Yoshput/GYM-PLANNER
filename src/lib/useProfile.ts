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

      // Check if we need to sync from localStorage
      let localProfile: any = null;
      try {
        const raw = window.localStorage.getItem("gym-planner:profile");
        if (raw) localProfile = JSON.parse(raw);
      } catch {}

      if (error || !dbProfile || !dbProfile.goal) {
        // If DB has no profile details, but we have local profile, sync it
        if (localProfile && localProfile.goal) {
          const dbData: any = {
            id: session.user.id,
            name: localProfile.name || session.user.email?.split("@")[0] || "User",
            profile_image: localProfile.profileImage || null,
            gender: localProfile.gender || "male",
            weight_kg: localProfile.weightKg || 70,
            height_cm: localProfile.heightCm || 170,
            body_fat_pct: localProfile.bodyFatPct || 15,
            goal: localProfile.goal || "maintenance",
            experience: localProfile.experience || "beginner",
            experience_mode: localProfile.experienceMode || "simple",
            equipment: localProfile.equipment || "dumbbell",
            duration_minutes: localProfile.durationMinutes || 60,
            training_days: localProfile.trainingDays || 4,
            training_style: localProfile.trainingStyle || "auto",
            updated_at: new Date().toISOString(),
          };

          const { error: syncError } = await supabase.from("profiles").upsert(dbData);
          if (!syncError) {
            // Remove local profile once synced to keep it clean
            try {
              window.localStorage.removeItem("gym-planner:profile");
            } catch {}
            await refresh();
            return;
          }
        }
        setProfile(null);
      } else {
        // Map database fields to UserProfile
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
