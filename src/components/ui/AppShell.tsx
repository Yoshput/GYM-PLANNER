"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import BottomNav from "@/components/ui/BottomNav";
import YosBot from "@/components/ui/YosBot";
import { Dumbbell } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import IosInstallBanner from "@/components/ui/IosInstallBanner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isLoading, isAuthenticated } = useProfile();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          {/* iOS-style minimal spinner */}
          <div className="relative h-12 w-12">
            <div className="h-12 w-12 rounded-full border-[3px] border-white/10 border-t-lime animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell size={16} className="text-lime" />
            </div>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Loading</p>
        </motion.div>
      </div>
    );
  }

  // If user is logged in but hasn't completed onboarding
  if (isAuthenticated && !profile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen overflow-x-hidden bg-[#0A0A0E]"
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-dots opacity-45" />
          <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/15 blur-[120px]" />
        </div>
        <OnboardingModal onClose={() => {}} />
      </motion.div>
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

      {/* ── Flexbox layout: sidebar (desktop) + content ── */}
      <div className="relative flex min-h-screen">
        {/* BottomNav renders: fixed mobile nav + sticky desktop sidebar */}
        <BottomNav />

        {/* ── Main content column ── */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-8" style={{ minWidth: 0 }}>
          {/* Center content on desktop */}
          <div className="max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <YosBot />
      <IosInstallBanner />
    </div>
  );
}
