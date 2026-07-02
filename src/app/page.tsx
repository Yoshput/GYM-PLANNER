"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, Flame, Salad, CalendarCheck, Zap, Users, ShieldAlert, Sparkles, Heart } from "lucide-react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { getProfile } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      router.replace("/dashboard");
      return;
    }
    setCheckingProfile(false);
  }, [router]);

  if (checkingProfile) {
    return <div className="min-h-screen bg-base" />;
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#0A0A0E]">
      {/* ── Background Elements ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Grid dot pattern */}
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        
        {/* Floating gradient backlights */}
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/15 blur-[120px] animate-float" />
        <div className="absolute top-1/4 -left-32 h-80 w-80 rounded-full bg-ember/10 blur-[100px] animate-float-reverse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Indonesia Pride Banner ── */}
      <div className="relative w-full bg-gradient-to-r from-red-600/20 via-white/5 to-red-600/20 border-b border-red-500/10 py-2.5 px-4 text-center z-10">
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-red-100 uppercase flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-lime animate-pulse" />
          100% Buatan Anak Bangsa 🇮🇩 &middot; Tanpa Login &middot; 100% Data Disimpan di HP Anda!
        </p>
      </div>

      {/* ── Main Hero Content ── */}
      <section className="relative flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 pt-12 pb-16 max-w-6xl mx-auto w-full">
        {/* Left column: Headings and CTAs */}
        <div className="flex-1 text-left relative z-10 max-w-xl animate-fade-in">
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-lime flex items-center justify-center shadow-[0_0_25px_rgba(204,255,0,0.5)] transform hover:rotate-6 transition-transform">
              <Dumbbell size={22} className="text-base" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-extrabold uppercase tracking-widest text-sm block text-white">
                GYM PLANNER
              </span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest block font-medium">
                Created by Yossika &middot; Sokaraja
              </span>
            </div>
          </div>

          {/* Badge */}
          <span className="chip bg-ember/15 text-ember border border-ember/20 mb-6 py-1.5 px-3.5 animate-slide-down-fade flex items-center gap-1.5 w-fit">
            <Zap size={13} className="text-ember animate-bounce" />
            <span className="font-bold">GARUDA FITNESS EDITION</span>
          </span>

          {/* Main Headline */}
          <h1 className="heading-brutal text-[10vw] sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Pahat Tubuh <span className="text-gradient-lime">Impian</span>,<br />
            Bakar Semangat <span className="text-gradient-fire">Juara</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-8 leading-relaxed">
            Dapatkan program latihan 7-hari yang dirancang presisi sesuai target fisik Anda. 
            Tanpa ribet daftar, tanpa iklan mengganggu, sepenuhnya privat dan gratis selamanya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setShowOnboarding(true)}
              id="get-started-btn"
              className="btn-primary text-base px-8 py-4 animate-glow-pulse-lime w-full sm:w-auto font-extrabold hover:scale-105 active:scale-95 transition-transform"
            >
              Mulai Sekarang
              <ArrowRight size={20} />
            </button>
            <a
              href="#placefoto"
              onClick={(e) => {
                e.preventDefault();
                setShowOnboarding(true);
              }}
              className="btn-secondary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-white/5"
            >
              <Users size={18} className="text-white/60" />
              Gabung Komunitas
            </a>
          </div>

          {/* PWA offline-ready floating indicator */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-base-raised/60 border border-base-border/50 max-w-sm">
            <div className="h-8 w-8 rounded-lg bg-lime/10 flex items-center justify-center text-lime shrink-0">
              <ShieldAlert size={16} />
            </div>
            <p className="text-xs text-white/50 leading-normal">
              Aplikasi ini mendukung mode <strong>PWA Offline</strong>. Sekali dibuka, Anda bisa mengakses program latihan kapan saja di gym tanpa kuota internet!
            </p>
          </div>
        </div>

        {/* Right column: Beautiful image representation */}
        <div className="flex-1 w-full max-w-md relative flex items-center justify-center">
          {/* Ambient glow underneath the photo */}
          <div className="absolute inset-0 bg-lime/10 blur-[80px] rounded-full scale-75 animate-pulse" />

          {/* Floating Image Card */}
          <div className="relative w-full aspect-[4/3] rounded-[2.5rem] p-3 bg-base-card/65 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float-water">
            <div className="relative w-full h-full overflow-hidden rounded-[2rem] border border-white/5">
              <img
                src="/img/landing-page/placefotobersama.jpeg"
                alt="Tim Gym Planner"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-lime animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Latihan Bersama Sokaraja Gym</span>
                </div>
                <span className="text-[10px] text-white/40 font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">EST. 2026</span>
              </div>
            </div>

            {/* Small floating stat cards for Fitup-like interactivity */}
            <div className="absolute -top-6 -right-6 bg-base-card/90 backdrop-blur-lg border border-lime/30 rounded-xl p-3 shadow-xl animate-float flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-lime flex items-center justify-center text-base font-bold text-xs">💪</div>
              <div>
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Total Anggota</p>
                <p className="text-xs font-bold text-lime">500+ Member</p>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-base-card/90 backdrop-blur-lg border border-white/10 rounded-xl p-3.5 shadow-xl animate-float-reverse flex items-center gap-2.5" style={{ animationDelay: "2s" }}>
              <div className="h-8 w-8 rounded-lg bg-ember/15 flex items-center justify-center text-ember font-bold text-xs">🔥</div>
              <div>
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Kalori Rata-rata</p>
                <p className="text-xs font-bold text-white">2.4K kCal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature strip using Unsplash previews ── */}
      <section className="relative max-w-6xl mx-auto w-full px-6 pb-12">
        <h2 className="text-center font-display font-extrabold text-sm uppercase tracking-widest text-white/40 mb-6 flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-lime" /> Fitur Unggulan Program <Sparkles size={14} className="text-lime" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InteractiveFeatureCard
            image="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
            icon={<CalendarCheck size={20} />}
            title="7-Day Custom Split"
            desc="Program latihan mingguan yang disusun sesuai tingkat pengalaman Anda."
            tag="STRENGTH"
          />
          <InteractiveFeatureCard
            image="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80"
            icon={<Flame size={20} />}
            title="Kalkulator TDEE Pintar"
            desc="Hitung metabolisme harian dan kebutuhan kalori dengan presisi tinggi."
            tag="METABOLISME"
          />
          <InteractiveFeatureCard
            image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
            icon={<Salad size={20} />}
            title="Target Nutrisi Harian"
            desc="Dapatkan rekomendasi porsi protein, karbohidrat, dan lemak ideal."
            tag="NUTRISI"
          />
        </div>
      </section>

      {/* ── Footer branding ── */}
      <footer className="relative px-6 pb-10 flex flex-col items-center gap-3 border-t border-base-border/30 pt-8 mt-auto">
        <p className="text-white/30 text-xs text-center max-w-md leading-relaxed">
          Privasi Anda adalah prioritas utama kami. Seluruh data tubuh, statistik, dan riwayat latihan Anda disimpan 100% secara lokal di browser smartphone Anda.
        </p>
        <div className="flex items-center gap-2.5">
          <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Didesain dengan Cinta oleh <span className="text-lime/60">Yossika</span> &middot; Sokaraja 🇮🇩
          </p>
          <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
        </div>
      </footer>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}

interface InteractiveFeatureCardProps {
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
}

function InteractiveFeatureCard({ image, icon, title, desc, tag }: InteractiveFeatureCardProps) {
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-base-card/45 border border-base-border/70 hover:border-lime/20 shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Background Image overlay */}
      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      
      {/* Glow backlight inside card */}
      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-lime/5 blur-2xl group-hover:bg-lime/10 transition-colors" />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-base-raised border border-base-border flex items-center justify-center text-lime group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <span className="text-[9px] font-extrabold tracking-wider bg-lime/10 text-lime px-2.5 py-1 rounded-md border border-lime/20 uppercase">
              {tag}
            </span>
          </div>
          <h3 className="font-display font-extrabold text-white text-lg uppercase mb-2 group-hover:text-lime transition-colors">
            {title}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}
