"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, Flame, Salad, CalendarCheck, Zap, Users, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// ─── Animation Variants ───────────────────────────────────────────────────────
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ─── Scroll-aware section wrapper ────────────────────────────────────────────
function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#0A0A0E]">
      {/* ── Background Elements ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <motion.div style={{ y: parallaxY }} className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/15 blur-[120px] animate-float" />
        <div className="absolute top-1/4 -left-32 h-80 w-80 rounded-full bg-ember/10 blur-[100px] animate-float-reverse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Indonesia Pride Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative w-full bg-gradient-to-r from-red-600/20 via-white/5 to-red-600/20 border-b border-red-500/10 py-2.5 px-4 text-center z-10"
      >
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-red-100 uppercase flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-lime animate-pulse" />
          100% Buatan Anak Bangsa 🇮🇩 &middot; Tanpa Login &middot; 100% Data Disimpan di HP Anda!
        </p>
      </motion.div>

      {/* ── Main Hero Content ── */}
      <section className="relative flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-8 pt-12 lg:pt-20 pb-16 max-w-5xl mx-auto w-full">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="inline-flex items-center gap-2 bg-lime/10 border border-lime/20 px-3 py-1.5 rounded-full text-lime text-[10px] font-extrabold uppercase tracking-wider mb-5"
          >
            <Zap size={11} className="fill-lime" /> AI-Powered &middot; PWA Ready
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="heading-brutal text-[clamp(2.5rem,9vw,5rem)] leading-[0.9] text-white mb-5"
          >
            Gym Smarter,<br />
            <span className="text-gradient-lime">Not Harder</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="text-white/55 text-base sm:text-lg leading-relaxed max-w-md mb-8"
          >
            Planner gym bertenaga AI. Program latihan 7 hari, TDEE otomatis, dan tracking nutrisi — semua tersimpan 100% di HP kamu.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center lg:justify-start"
          >
            <Link
              href="/signup"
              className="btn-primary text-sm lg:text-base lg:px-8 lg:py-4 press-effect"
            >
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-sm lg:text-base press-effect"
            >
              <Users size={16} /> Gabung Komunitas
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 flex items-start gap-2.5 bg-white/3 border border-white/8 rounded-xl px-4 py-3 max-w-sm text-left"
          >
            <ShieldAlert size={15} className="text-lime shrink-0 mt-0.5" />
            <p className="text-white/45 text-xs leading-relaxed">
              Aplikasi ini mendukung mode <strong className="text-white/70">PWA Offline</strong>. Sekali dibuka, Anda bisa mengakses program latihan kapan saja di gym tanpa kuota internet!
            </p>
          </motion.div>
        </div>

        {/* Right: Visual (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col items-center justify-center relative"
        >
          <div className="relative h-80 w-80 rounded-3xl border border-lime/20 bg-base-card/60 backdrop-blur-xl flex items-center justify-center shadow-[0_0_80px_rgba(204,255,0,0.12)]">
            <Dumbbell size={96} className="text-lime/20" strokeWidth={1} />
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-lime/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-ember/10 blur-3xl" />
            </div>
            {/* Floating stat pills */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-8 bg-lime text-black text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg"
            >
              💪 TDEE: 2,450 kcal
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-8 bg-base-card border border-lime/30 text-lime text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
            >
              🔥 Streak: 14 hari
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="relative max-w-5xl mx-auto w-full px-6 lg:px-8 pb-12 lg:pb-24">
        <ScrollReveal className="text-center mb-8">
          <h2 className="font-display font-extrabold text-sm uppercase tracking-widest text-white/40 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-lime" /> Fitur Unggulan Program <Sparkles size={14} className="text-lime" />
          </h2>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {[
            {
              image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
              icon: <CalendarCheck size={20} />,
              title: "7-Day Custom Split",
              desc: "Program latihan mingguan yang disusun sesuai tingkat pengalaman Anda.",
              tag: "STRENGTH",
            },
            {
              image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80",
              icon: <Flame size={20} />,
              title: "Kalkulator TDEE Pintar",
              desc: "Hitung metabolisme harian dan kebutuhan kalori dengan presisi tinggi.",
              tag: "METABOLISME",
            },
            {
              image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
              icon: <Salad size={20} />,
              title: "Target Nutrisi Harian",
              desc: "Dapatkan rekomendasi porsi protein, karbohidrat, dan lemak ideal.",
              tag: "NUTRISI",
            },
          ].map((card) => (
            <motion.div key={card.title} variants={cardVariant}>
              <InteractiveFeatureCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Professional Footer ── */}
      <footer className="relative border-t border-base-border/30 mt-auto">
        {/* Product by bar */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-5 px-6 border-b border-base-border/20">
            {/* Product by pill */}
            <a
              href="https://yossikaputra.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 bg-white/4 hover:bg-white/8 border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all duration-200 press-effect"
            >
              <span className="text-white/40 text-xs font-medium">Product by</span>
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="h-7 w-7 rounded-full overflow-hidden border border-white/20 shrink-0" style={{ height: 28, width: 28, minWidth: 28 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://yossikaputra.my.id/assets/img/foto-jas-fresh.webp"
                    alt="Yossika Putra Erlangga"
                    style={{ height: 28, width: 28, display: "block", objectFit: "cover" }}
                  />
                </div>
                <span className="text-white font-bold text-sm">Yossika Putra</span>
                <ExternalLink size={11} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
            </a>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Yoshput"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-white/50 hover:text-white text-xs font-medium transition-all press-effect"
              >
                {/* GitHub SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <a
                href="https://www.instagram.com/yossika_pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/20 px-3 py-1.5 rounded-full text-white/50 hover:text-pink-400 text-xs font-medium transition-all press-effect"
              >
                {/* Instagram SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Professional copyright line */}
        <ScrollReveal>
          <div className="py-5 px-6 text-center">
            <p className="text-white/25 text-xs leading-relaxed max-w-2xl mx-auto">
              © {new Date().getFullYear()} Yossika Putra Erlangga &middot; Software Engineer &amp; Jasa Pembuatan Website Purwokerto, Banyumas, Jawa Tengah &middot; Built with performance, simplicity &amp; purpose.
            </p>
          </div>
        </ScrollReveal>
      </footer>
    </main>
  );
}

// ─── Feature Card Component ───────────────────────────────────────────────────
interface InteractiveFeatureCardProps {
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
}

function InteractiveFeatureCard({ image, icon, title, desc, tag }: InteractiveFeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden bg-base-card/45 border border-base-border/70 hover:border-lime/25 shadow-lg cursor-pointer h-full"
    >
      {/* Background Image overlay */}
      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Glow backlight */}
      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-lime/5 blur-2xl group-hover:bg-lime/15 transition-colors duration-300" />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              className="h-10 w-10 rounded-xl bg-base-raised border border-base-border flex items-center justify-center text-lime"
            >
              {icon}
            </motion.div>
            <span className="text-[9px] font-extrabold tracking-wider bg-lime/10 text-lime px-2.5 py-1 rounded-md border border-lime/20 uppercase">
              {tag}
            </span>
          </div>
          <h3 className="font-display font-extrabold text-white text-lg uppercase mb-2 group-hover:text-lime transition-colors duration-200">
            {title}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
