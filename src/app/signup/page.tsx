"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2, AtSign, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateUsername = (val: string) =>
    /^[a-zA-Z0-9._]{3,20}$/.test(val);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateUsername(username)) {
      setError("Username harus 3–20 karakter, hanya huruf, angka, titik, atau underscore.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      // 1. Register user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { username: username.trim() },
        },
      });

      if (authError) {
        const code = (authError as any)?.code || "";
        const status = (authError as any)?.status;
        if (code === "user_already_exists" || status === 422) {
          throw new Error("Email ini sudah terdaftar. Gunakan email lain atau masuk.");
        }
        throw new Error(authError.message || "Gagal mendaftar.");
      }

      if (data?.user && data.user.identities?.length === 0) {
        throw new Error("Email ini sudah terdaftar. Gunakan email lain atau masuk.");
      }

      // 2. Save username + email to profiles table
      if (data?.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          updated_at: new Date().toISOString(),
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && err.message.trim() && err.message !== "{}"
          ? err.message
          : "Gagal mendaftar. Periksa koneksi dan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden bg-[#0A0A0E] sm:py-0">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/10 blur-[120px]" />
        <div className="absolute bottom-20 -left-20 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm lg:max-w-md relative z-10 animate-scale-in">
        {/* Back */}
        <div className="mb-6 lg:mb-8 mt-4 sm:mt-0">
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
          <p className="text-white/40 text-xs lg:text-sm uppercase tracking-widest mt-2">Daftar Akun Baru</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem]">
          {/* Success State */}
          {success && (
            <div className="flex flex-col items-center text-center py-6 gap-5">
              <div className="h-20 w-20 rounded-full bg-lime/15 border-2 border-lime/40 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-lime" />
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-2">Akun Berhasil Dibuat! 🎉</p>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Silakan login menggunakan <span className="text-lime font-bold">@{username}</span> dan password Anda.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/40 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Mengalihkan ke halaman login...
              </div>
            </div>
          )}

          {!success && (
            <>
              {error && (
                <div className="bg-ember/10 border border-ember/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle size={18} className="text-ember shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80 leading-normal">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">
                    Username <span className="text-white/20 normal-case font-normal">(untuk login)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="contoh: yossika98"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                      className="w-full bg-black/40 border border-base-border rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-lime/50 transition-colors placeholder-white/20 min-h-[48px]"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                  <p className="text-[10px] text-white/30 mt-1.5 ml-2">3–20 karakter. Huruf, angka, titik, underscore.</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">
                    Email <span className="text-white/20 normal-case font-normal">(untuk pemulihan)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <AtSign size={16} />
                    </span>
                    <input
                      type="email"
                      placeholder="contoh: yossika@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-base-border rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-lime/50 transition-colors placeholder-white/20 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/40 mb-2 tracking-wider ml-1">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan ulang password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 transition-colors placeholder-white/20 min-h-[48px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary min-h-[52px] rounded-full text-[15px] font-extrabold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    "Daftar Akun Baru"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-white/10 pt-6">
                <p className="text-sm text-white/40">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-lime font-bold hover:underline p-1">
                    Masuk Disini
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
