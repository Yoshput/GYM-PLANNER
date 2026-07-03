"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import BottomNav from "@/components/ui/BottomNav";
import YosBot from "@/components/ui/YosBot";
import { Dumbbell } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isLoading, isAuthenticated } = useProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center animate-glow-pulse-lime">
              <Dumbbell size={24} className="text-lime" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-lime/50 animate-spin" style={{ borderRadius: "1rem" }} />
          </div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );
  }

  // If user is logged in but hasn't completed onboarding, force show the OnboardingModal
  if (isAuthenticated && !profile) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0E]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-dots opacity-45" />
          <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/15 blur-[120px]" />
        </div>
        <OnboardingModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden">
      {/* ── Animated background layer ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Grid dot pattern */}
        <div className="absolute inset-0 bg-grid-dots opacity-60" />
        {/* Floating orb — lime top-left */}
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-lime/8 blur-[80px] animate-float" />
        {/* Floating orb — ember top-right */}
        <div className="absolute -top-16 -right-24 h-64 w-64 rounded-full bg-ember/7 blur-[70px] animate-float-reverse" />
        {/* Floating orb — lime bottom-right */}
        <div className="absolute bottom-24 -right-20 h-56 w-56 rounded-full bg-lime/5 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-lime/3 blur-[120px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative animate-fade-in">
        {children}
      </div>

      <BottomNav />
      <YosBot />
    </div>
  );
}
