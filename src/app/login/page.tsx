"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        throw authError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Silakan periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#0A0A0E]">
      {/* Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-lime/10 blur-[120px]" />
        <div className="absolute bottom-20 -left-20 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Back Button */}
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
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Masuk ke Akun Anda</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="bg-ember/10 border border-ember/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-ember shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-normal">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="Contoh: yosfit@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-extrabold hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Gym Planner"
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/5 pt-5">
            <p className="text-xs text-white/40">
              Belum punya akun?{" "}
              <Link href="/signup" className="text-lime font-bold hover:underline">
                Daftar Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
