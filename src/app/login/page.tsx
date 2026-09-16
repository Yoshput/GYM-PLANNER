"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmail = (val: string) => val.includes("@");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    setError("");

    try {
      let emailToUse = identifier.trim();

      // If input is username (no @), look up the email
      if (!isEmail(identifier)) {
        const res = await fetch("/api/auth/find-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier.trim() }),
        });
        const data = await res.json();
        if (!res.ok || !data.email) {
          throw new Error("Username tidak ditemukan. Coba gunakan email.");
        }
        emailToUse = data.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password.trim(),
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Username/Email atau password salah.");
        }
        throw new Error(authError.message || "Gagal masuk. Silakan coba lagi.");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Gagal masuk. Periksa username/email dan password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#0A0A0E]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/10 blur-[120px]" />
        <div className="absolute bottom-20 -left-20 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm lg:max-w-md relative z-10 animate-scale-in">
        {/* Back */}
        <div className="mb-6 lg:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-xs uppercase tracking-widest font-bold transition-colors group p-2 -ml-2"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Brand */}
        <div className="flex flex-col items-center mb-8 lg:mb-10">
          <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-3xl bg-lime flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.4)] mb-5">
            <Dumbbell size={28} className="text-base lg:scale-110" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-black text-3xl lg:text-4xl uppercase tracking-wider text-white">
            YosFit <span className="text-gradient-lime">AI</span>
          </h1>
          <p className="text-white/40 text-xs lg:text-sm uppercase tracking-widest mt-2">Masuk ke Akun Anda</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem]">
          {error && (
            <div className="bg-ember/10 border border-ember/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="text-ember shrink-0 mt-0.5" />
              <p className="text-sm text-white/80 leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">
                Username atau Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="username atau email@contoh.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-lime/50 transition-colors placeholder-white/20 min-h-[48px]"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-lime/50 transition-colors placeholder-white/20 min-h-[48px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary min-h-[52px] rounded-full text-[15px] font-extrabold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEmail(identifier) ? "Memproses..." : "Mencari akun..."}
                </>
              ) : (
                "Masuk ke Gym Planner"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-white/40">
              Belum punya akun?{" "}
              <Link href="/signup" className="text-lime font-bold hover:underline p-1">
                Daftar Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
