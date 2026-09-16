"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import BottomNav from "@/components/ui/BottomNav";
import YosBot from "@/components/ui/YosBot";
import { Dumbbell } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import IosInstallBanner from "@/components/ui/IosInstallBanner";

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
          {/* iOS-style minimal spinner */}
          <div className="relative h-12 w-12">
            <div className="h-12 w-12 rounded-full border-[3px] border-white/10 border-t-lime animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell size={16} className="text-lime" />
            </div>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Loading</p>
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
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Animated background layer (fixed, out of flow) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-60" />
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-lime/8 blur-[80px] animate-float" />
        <div className="absolute -top-16 -right-24 h-64 w-64 rounded-full bg-ember/7 blur-[70px] animate-float-reverse" />
        <div className="absolute bottom-24 -right-20 h-56 w-56 rounded-full bg-lime/5 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-lime/3 blur-[120px]" />
      </div>

      {/* ── Layout: flexbox for sidebar + content ── */}
      {/*
        BottomNav renders a React Fragment containing:
        1. <nav> — mobile bottom nav (hidden on lg)
        2. <aside> — desktop sidebar (hidden on mobile, flex on lg)

        On desktop: the <aside> acts as the sidebar column (w-[280px] sticky).
        The content div takes flex-1 and shifts right accordingly.
      */}
      <div className="relative flex min-h-screen">
        {/* Sidebar lives here (BottomNav renders it as the <aside> on lg) */}
        <BottomNav />

        {/* ── Main content column ── */}
        <main
          className="flex-1 min-w-0 pb-28 lg:pb-8 animate-fade-in"
          style={{ minWidth: 0 }}
        >
          {/* Center content on desktop, full-width on mobile */}
          <div className="max-w-2xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      <YosBot />
      <IosInstallBanner />
    </div>
  );
}
