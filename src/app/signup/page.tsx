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
    <main className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#0A0A0E]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/10 blur-[120px]" />
        <div className="absolute bottom-20 -left-20 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-xs uppercase tracking-widest font-bold transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-lime flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.4)] mb-4">
            <Dumbbell size={24} className="text-base" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white">
            YosFit <span className="text-gradient-lime">AI</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Daftar Akun Baru</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Success State */}
          {success && (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="h-16 w-16 rounded-full bg-lime/15 border-2 border-lime/40 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-lime" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Akun Berhasil Dibuat! 🎉</p>
                <p className="text-white/50 text-sm mt-1">
                  Silakan login menggunakan <span className="text-lime font-bold">@{username}</span> dan password Anda.
                </p>
              </div>
              <p className="text-white/30 text-xs">Mengalihkan ke halaman login...</p>
            </div>
          )}

          {!success && (
            <>
              {error && (
                <div className="bg-ember/10 border border-ember/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-ember shrink-0 mt-0.5" />
                  <p className="text-xs text-white/80 leading-normal">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">
                    Username <span className="text-white/20">(untuk login)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="contoh: yossika98"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                  <p className="text-[9px] text-white/25 mt-1">3–20 karakter. Huruf, angka, titik, underscore.</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">
                    Email <span className="text-white/20">(untuk pemulihan akun)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                      <AtSign size={14} />
                    </span>
                    <input
                      type="email"
                      placeholder="contoh: yossika@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan ulang password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-sm font-extrabold hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    "Daftar Akun Baru"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-white/5 pt-5">
                <p className="text-xs text-white/40">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-lime font-bold hover:underline">
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
