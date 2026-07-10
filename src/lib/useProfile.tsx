"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<boolean>;
}

const ProfileContext = createContext<UseProfileResult | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const supabase = createClient();

  // Load from localStorage immediately on mount to prevent loading flickers
  useEffect(() => {
    try {
      const cachedProfile = window.localStorage.getItem("gym-planner:profile");
      const cachedUserId = window.localStorage.getItem("gym-planner:userId");
      
      if (cachedProfile && cachedUserId) {
        setProfile(JSON.parse(cachedProfile));
        setIsAuthenticated(true);
        setIsLoading(false); // Stop loading immediately since we have cached data!
      }
    } catch (e) {
      console.error("[ProfileProvider] Error loading initial cache:", e);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setProfile(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setHasLoadedInitial(true);
        // Clear local storage if session is lost
        try {
          window.localStorage.removeItem("gym-planner:profile");
          window.localStorage.removeItem("gym-planner:userId");
        } catch {}
        return;
      }

      setIsAuthenticated(true);

      const { data: dbProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !dbProfile || !dbProfile.goal) {
        // No profile in DB, onboarding required
        setProfile(null);
        try {
          window.localStorage.removeItem("gym-planner:profile");
          window.localStorage.removeItem("gym-planner:userId");
        } catch {}
      } else {
        // Save current userId and profile to localStorage
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
        try {
          window.localStorage.setItem("gym-planner:profile", JSON.stringify(mappedProfile));
        } catch {}
      }
    } catch (e) {
      console.error("[ProfileProvider] Error refreshing profile:", e);
    } finally {
      setIsLoading(false);
      setHasLoadedInitial(true);
    }
  }, [supabase]);

  const updateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return false;

      // Optimistically update local state & cache first to make it instant
      let newProfile: UserProfile | null = null;
      setProfile((prev) => {
        if (!prev) return null;
        newProfile = { ...prev, ...updated };
        try {
          window.localStorage.setItem("gym-planner:profile", JSON.stringify(newProfile));
        } catch {}
        return newProfile;
      });

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
      
      // Background re-fetch to ensure sync
      refresh();
      return true;
    } catch (e) {
      console.error("Error updating profile:", e);
      return false;
    }
  };

  // Run initial refresh in background on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // To prevent the onboarding modal from showing during the split-second initial load,
  // we keep isLoading true until we have completed at least the first background check OR loaded from cache.
  const resolvedLoading = isLoading && !profile && !hasLoadedInitial;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading: resolvedLoading,
        isAuthenticated,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): UseProfileResult {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
