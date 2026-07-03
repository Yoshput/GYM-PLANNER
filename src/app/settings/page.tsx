"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Trash2, ArrowLeft, RefreshCw, Smartphone, Key, ToggleLeft, Globe, Eye, Settings as SettingsIcon, MessageSquare, Info, Send, Terminal } from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/ui/AppShell";
import { useToast } from "@/components/ui/Toast";
import { useProfile } from "@/lib/useProfile";
import { saveProfile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { showToast } = useToast();
  const { profile, refresh } = useProfile();
  const [metricUnit, setMetricUnit] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [customKey, setCustomKey] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackType, setFeedbackType] = useState("saran");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const [customThemeStyle, setCustomThemeStyle] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMetricUnit(localStorage.getItem("gym-planner:unit") !== "imperial");
      setCustomKey(localStorage.getItem("gym-planner:gemini-key") || "");
      setCustomThemeStyle(localStorage.getItem("gym-planner:custom-theme-style") || "default");
    }
  }, []);

  const handleCustomThemeChange = (newTheme: string) => {
    setCustomThemeStyle(newTheme);
    if (typeof window !== "undefined") {
      // Clear old theme classes
      document.documentElement.classList.remove("theme-spiderman", "theme-davidlaid");
      
      if (newTheme === "default") {
        localStorage.removeItem("gym-planner:custom-theme-style");
      } else {
        localStorage.setItem("gym-planner:custom-theme-style", newTheme);
        document.documentElement.classList.add("theme-" + newTheme);
      }
      showToast("Tema Diubah 🎨", {
        sub: "Memuat ulang aplikasi untuk menerapkan tema...",
        variant: "success",
      });
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("feedbacks").insert([
        {
          contact: feedbackContact || "Anonim",
          content: feedbackText,
          type: feedbackType,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) throw error;

      showToast("Saran Terkirim 🚀", {
        sub: "Terima kasih! Masukan Anda sangat berharga bagi pengembangan.",
        variant: "success",
      });
      setFeedbackText("");
      setFeedbackContact("");
    } catch (err: any) {
      console.warn("Saving feedback to local fallback:", err);
      const savedFeedbacks = JSON.parse(localStorage.getItem("gym-planner:pending-feedback") || "[]");
      savedFeedbacks.push({
        contact: feedbackContact || "Anonim",
        content: feedbackText,
        type: feedbackType,
        date: new Date().toISOString(),
      });
      localStorage.setItem("gym-planner:pending-feedback", JSON.stringify(savedFeedbacks));

      showToast("Tersimpan Lokal 💾", {
        sub: "Terkirim & disimpan lokal untuk sinkronisasi berikutnya.",
        variant: "success",
      });
      setFeedbackText("");
      setFeedbackContact("");
    } finally {
      setSubmittingFeedback(false);
    }
  };


  const handleUnitToggle = () => {
    const newVal = !metricUnit;
    setMetricUnit(newVal);
    localStorage.setItem("gym-planner:unit", newVal ? "metric" : "imperial");
    showToast("Pengaturan Disimpan ⚙️", {
      sub: `Unit diubah menjadi ${newVal ? "Metric (Kg)" : "Imperial (Lbs)"}`,
      variant: "info",
    });
  };

  const handleExperienceModeToggle = () => {
    if (!profile) return;
    const nextMode: "simple" | "advanced" = profile.experienceMode === "simple" ? "advanced" : "simple";
    const updatedProfile = { ...profile, experienceMode: nextMode };
    saveProfile(updatedProfile);
    refresh();
    
    showToast("Tampilan Diubah 📱", {
      sub: `Sekarang menggunakan Mode ${nextMode === "simple" ? "Simpel (Simple)" : "Lanjut (Advanced)"}`,
      variant: "success",
    });
  };

  const handleExportData = () => {
    const keys = [
      "gym-planner:profile",
      "gym-planner_workout_logs",
      "gymplanner_body_logs",
      "gymplanner_progress_photos",
      "gymplanner_daily_checklist",
      "gymplanner_recovery_logs",
      "gymplanner_streak"
    ];
    
    const exportObj: Record<string, any> = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) exportObj[k] = JSON.parse(val);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gymplanner_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Ekspor Sukses 📥", {
      sub: "File backup data kebugaran Anda berhasil diunduh.",
      variant: "success",
    });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        Object.keys(importedData).forEach(key => {
          localStorage.setItem(key, JSON.stringify(importedData[key]));
        });
        showToast("Impor Berhasil 📤", {
          sub: "Semua riwayat latihan dan profil berhasil dipulihkan!",
          variant: "success",
        });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast("Gagal Impor ❌", {
          sub: "Format file JSON tidak valid.",
          variant: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    if (confirm("⚠️ PERINGATAN: Tindakan ini akan menghapus SELURUH profil, riwayat latihan, foto progres, dan data hidrasi Anda secara permanen. Lanjutkan?")) {
      try {
        // Hapus profil dari Supabase DB agar onboarding muncul lagi
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("profiles").delete().eq("id", session.user.id);
        }
      } catch (e) {
        console.error("Gagal hapus profil dari DB:", e);
      }
      // Hapus semua data lokal
      localStorage.clear();
      showToast("Reset Berhasil 🗑️", {
        sub: "Semua data telah dihapus bersih.",
        variant: "success",
      });
      // Kembali ke dashboard → onboarding akan muncul karena profil sudah dihapus
      setTimeout(() => window.location.href = "/dashboard", 1500);
    }
  };

  return (
    <main className="px-5 pt-safe pt-8 pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-slide-down-fade">
        <Link href="/dashboard" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest">Aplikasi</p>
          <h1 className="heading-brutal text-2xl">
            Peng<span className="text-gradient-lime">aturan</span>
          </h1>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glass-card p-5 mb-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35">Preferensi Latihan</p>
        
        {/* Metric vs Imperial */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-bold text-white/90">Gaya Tema Kustom 🎨</p>
            <p className="text-[10px] text-white/35">Ubah skema warna visual aplikasi</p>
          </div>
          <select
            value={customThemeStyle}
            onChange={(e) => handleCustomThemeChange(e.target.value)}
            className="bg-black/40 border border-base-border rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 cursor-pointer font-bold"
          >
            <option value="default" className="bg-[#111] text-white">Default (Zenith Glow)</option>
            <option value="spiderman" className="bg-[#111] text-red-500">🕷️ Spiderman Style</option>
            <option value="davidlaid" className="bg-[#111] text-gray-400">🏋️ David Laid Gym</option>
          </select>
        </div>

        {/* Metric vs Imperial */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-bold text-white/90">Sistem Satuan</p>
            <p className="text-[10px] text-white/35">Pilih Kilogram (Kg) atau Pound (Lbs)</p>
          </div>
          <button
            onClick={handleUnitToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              metricUnit
                ? "bg-lime/10 text-lime border-lime/20"
                : "bg-white/5 text-white/60 border-white/10"
            }`}
          >
            {metricUnit ? "Metric (Kg)" : "Imperial (Lbs)"}
          </button>
        </div>

        {/* Experience Mode (Simple vs Advanced Live Toggle) */}
        {profile && (
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm font-bold text-white/90">Tampilan Aplikasi</p>
              <p className="text-[10px] text-white/35">Ubah antarmuka ke Mode Simpel atau Lanjut</p>
            </div>
            <button
              onClick={handleExperienceModeToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                profile.experienceMode === "advanced"
                  ? "bg-lime/10 text-lime border-lime/20"
                  : "bg-white/5 text-white/60 border-white/10"
              }`}
            >
              {profile.experienceMode === "advanced" ? (
                <><SettingsIcon size={12} /> Advanced</>
              ) : (
                <><Eye size={12} /> Simple</>
              )}
            </button>
          </div>
        )}

        {/* Offline Mode Indicator */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-bold text-white/90">Mode Offline (PWA Cache)</p>
            <p className="text-[10px] text-white/35">Data disimpan lokal tanpa cloud tracker</p>
          </div>
          <span className="chip bg-lime/10 text-lime border border-lime/20 text-[9px] py-1">Aktif</span>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-bold text-white/90">Bahasa Aplikasi</p>
            <p className="text-[10px] text-white/35">Bahasa default sistem</p>
          </div>
          <span className="text-xs text-white/50 font-bold uppercase">Bahasa Indonesia</span>
        </div>

        {/* Gemini API Key */}
        <div className="py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white/90 flex items-center gap-1"><Key size={14} className="text-lime" /> Gemini API Key</p>
              <p className="text-[10px] text-white/35">API key kustom untuk YosBot & AI Scan</p>
            </div>
            {customKey && (
              <span className="chip bg-lime/10 text-lime border border-lime/20 text-[9px] py-1">Tersimpan</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Masukkan API Key Gemini Anda"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
            />
            <button
              onClick={() => {
                localStorage.setItem("gym-planner:gemini-key", customKey.trim());
                showToast("Kunci Disimpan 🔑", {
                  sub: "Gemini API Key kustom telah disimpan.",
                  variant: "success",
                });
              }}
              className="px-4 py-2 rounded-xl bg-lime text-black text-xs font-bold hover:scale-98 active:scale-95 transition-transform"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup Management */}
      <div className="glass-card p-5 mb-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35">Backup & Sinkronisasi</p>
        
        {/* Export Action */}
        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/3 hover:bg-lime/5 border border-white/5 hover:border-lime/25 text-left text-white/80 hover:text-lime transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Download size={16} />
            <div>
              <p className="text-xs font-bold">Ekspor Cadangan Data</p>
              <p className="text-[9px] opacity-50">Unduh riwayat & profil dalam file JSON</p>
            </div>
          </div>
        </button>

        {/* Import Action */}
        <label className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/3 hover:bg-lime/5 border border-white/5 hover:border-lime/25 text-left text-white/80 hover:text-lime transition-all active:scale-[0.98] cursor-pointer">
          <div className="flex items-center gap-3">
            <Upload size={16} />
            <div>
              <p className="text-xs font-bold">Impor Cadangan Data</p>
              <p className="text-[9px] opacity-50">Puluhkan profil & logs dari file JSON</p>
            </div>
          </div>
          <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
        </label>

        {/* Danger reset action */}
        <button
          onClick={handleFactoryReset}
          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 text-left text-red-400 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={16} />
            <div>
              <p className="text-xs font-bold">Hapus Seluruh Data</p>
              <p className="text-[9px] opacity-50">Reset aplikasi ke setelan pabrik</p>
            </div>
          </div>
        </button>
      </div>

      {/* Beta Mode & Feedback Form */}
      <div className="glass-card p-5 mb-5 space-y-4">
        <div className="flex items-start gap-2.5 bg-lime/10 border border-lime/25 rounded-xl p-3">
          <Info size={16} className="text-lime shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Aplikasi Dalam Pengembangan 🚀</p>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Gym Planner ini sedang dikembangkan secara aktif oleh <strong>Yossika dari Sokaraja</strong>. Jika Anda mengalami kendala, error, atau memiliki saran fitur baru, silakan kirimkan masukan di formulir bawah ini.
            </p>
          </div>
        </div>

        {/* Suggestion / Feedback Form */}
        <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35">Kirim Saran & Masukan</p>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nama atau Email (Opsional)"
              value={feedbackContact}
              onChange={(e) => setFeedbackContact(e.target.value)}
              className="bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
            />
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
            >
              <option value="saran">💡 Saran Fitur</option>
              <option value="bug">🐛 Laporan Error</option>
              <option value="tanya">❓ Pertanyaan</option>
            </select>
          </div>

          <textarea
            placeholder="Tuliskan saran atau deskripsi error yang Anda alami..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            rows={3}
            className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45 resize-none"
          />

          <button
            type="submit"
            disabled={submittingFeedback}
            className="w-full py-2.5 rounded-xl bg-lime text-black text-xs font-bold hover:scale-98 active:scale-95 transition-transform flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submittingFeedback ? (
              <>Mengirim...</>
            ) : (
              <>
                <Send size={12} /> Kirim Masukan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Release Notes Changelog */}
      <div className="glass-card p-5 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35">Informasi Versi & Rilis</p>
          <span className="chip bg-lime/10 text-lime border border-lime/20 text-[9px] py-1">v1.5.0 PWA</span>
        </div>
        <button
          onClick={() => setShowChangelog(!showChangelog)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/3 hover:bg-lime/5 border border-white/5 hover:border-lime/25 text-left text-white/80 hover:text-lime transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span className="text-xs font-bold">Lihat Catatan Rilis & Log Update</span>
          </div>
          <span className="text-[10px] text-white/40 underline">Lihat</span>
        </button>

        {showChangelog && (
          <div className="space-y-3 pt-3 border-t border-white/5 text-[11px] leading-relaxed text-white/70 animate-fade-in">
            <div className="space-y-1">
              <p className="font-bold text-lime">Update Terbaru v1.5.0 (PWA & Musik):</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[10px] text-white/60">
                <li>Integrasi pemutar musik YouTube IFrame kustom di dashboard.</li>
                <li>Banner petunjuk instalasi PWA interaktif untuk iOS Safari.</li>
                <li>Dukungan cross-platform dynamic viewport dynamic height (100dvh).</li>
                <li>Tampilan Light Mode baru bertema gradasi ambient premium.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white/90">Versi v1.4.0 (Gemini AI Key):</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[10px] text-white/55">
                <li>Input Gemini API key kustom di Pengaturan untuk YosBot & AI Scan.</li>
                <li>Konsistensi widget split latihan mingguan dengan legend status lengkap.</li>
                <li>Penghitungan streak latihan dinamis bebas rest day.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-wider space-y-1">
        <p>Gym Planner v1.5.0 PWA</p>
        <p>100% Local Storage Encryption Ready</p>
      </div>
    </main>
  );
}
