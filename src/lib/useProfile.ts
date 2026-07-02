"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { getProfile } from "@/lib/storage";

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    setProfile(getProfile());
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { profile, isLoading, refresh };
}
