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
    <main className="px-4 sm:px-6 lg:px-8 pt-safe pt-8 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10 animate-slide-down-fade">
        <Link href="/dashboard" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Aplikasi</p>
          <h1 className="heading-brutal text-3xl sm:text-4xl">
            Peng<span className="text-gradient-lime">aturan</span>
          </h1>
        </div>
      </div>

      <div className="lg:max-w-xl mx-auto space-y-8">
        {/* Preferences Section */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Preferensi Latihan</p>
          <div className="glass-card p-2 rounded-3xl space-y-1">
            
            {/* Custom Theme */}
            <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div>
                <p className="text-[15px] font-bold text-white/90">Gaya Tema Kustom 🎨</p>
                <p className="text-xs text-white/40 mt-0.5">Ubah skema warna visual aplikasi</p>
              </div>
              <select
                value={customThemeStyle}
                onChange={(e) => handleCustomThemeChange(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-lime/50 cursor-pointer font-bold min-h-[44px]"
              >
                <option value="default" className="bg-[#111] text-white">Default (Zenith)</option>
                <option value="spiderman" className="bg-[#111] text-red-500">🕷️ Spiderman</option>
                <option value="davidlaid" className="bg-[#111] text-gray-400">🏋️ David Laid</option>
              </select>
            </div>
            <div className="h-px bg-white/5 mx-4" />

            {/* Metric vs Imperial */}
            <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div>
                <p className="text-[15px] font-bold text-white/90">Sistem Satuan</p>
                <p className="text-xs text-white/40 mt-0.5">Pilih Kilogram (Kg) atau Pound (Lbs)</p>
              </div>
              <button
                onClick={handleUnitToggle}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-bold border transition-all ${
                  metricUnit
                    ? "bg-lime/10 text-lime border-lime/20"
                    : "bg-white/5 text-white/60 border-white/10"
                }`}
              >
                {metricUnit ? "Metric (Kg)" : "Imperial (Lbs)"}
              </button>
            </div>
            <div className="h-px bg-white/5 mx-4" />

            {/* Experience Mode (Simple vs Advanced Live Toggle) */}
            {profile && (
              <>
                <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                  <div>
                    <p className="text-[15px] font-bold text-white/90">Tampilan Aplikasi</p>
                    <p className="text-xs text-white/40 mt-0.5">Mode Simpel atau Lanjut</p>
                  </div>
                  <button
                    onClick={handleExperienceModeToggle}
                    className={`flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-bold border transition-all ${
                      profile.experienceMode === "advanced"
                        ? "bg-lime/10 text-lime border-lime/20"
                        : "bg-white/5 text-white/60 border-white/10"
                    }`}
                  >
                    {profile.experienceMode === "advanced" ? (
                      <><SettingsIcon size={16} /> Advanced</>
                    ) : (
                      <><Eye size={16} /> Simple</>
                    )}
                  </button>
                </div>
                <div className="h-px bg-white/5 mx-4" />
              </>
            )}

            {/* Offline Mode Indicator */}
            <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div>
                <p className="text-[15px] font-bold text-white/90">Mode Offline (PWA)</p>
                <p className="text-xs text-white/40 mt-0.5">Data disimpan lokal aman</p>
              </div>
              <span className="chip bg-lime/10 text-lime border border-lime/20 text-[11px] py-1.5 px-3 rounded-full font-bold">Aktif</span>
            </div>
            <div className="h-px bg-white/5 mx-4" />

            {/* Gemini API Key */}
            <div className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[15px] font-bold text-white/90 flex items-center gap-2"><Key size={16} className="text-lime" /> Gemini API Key</p>
                  <p className="text-xs text-white/40 mt-0.5">API key kustom untuk AI Scan</p>
                </div>
                {customKey && (
                  <span className="chip bg-lime/10 text-lime border border-lime/20 text-[11px] py-1.5 px-3 rounded-full font-bold">Tersimpan</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Masukkan API Key Gemini Anda"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 min-h-[44px]"
                />
                <button
                  onClick={() => {
                    localStorage.setItem("gym-planner:gemini-key", customKey.trim());
                    showToast("Kunci Disimpan 🔑", {
                      sub: "Gemini API Key kustom telah disimpan.",
                      variant: "success",
                    });
                  }}
                  className="px-5 min-h-[44px] rounded-xl bg-lime text-black text-sm font-extrabold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Backup Management */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Backup & Sinkronisasi</p>
          <div className="glass-card p-2 rounded-3xl space-y-1">
            
            {/* Export Action */}
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-lime/10 text-left transition-colors active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 group-hover:bg-lime/20 flex items-center justify-center transition-colors">
                  <Download size={18} className="text-white/70 group-hover:text-lime" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white/90 group-hover:text-lime transition-colors">Ekspor Cadangan Data</p>
                  <p className="text-xs text-white/40 mt-0.5">Unduh riwayat & profil (JSON)</p>
                </div>
              </div>
            </button>
            <div className="h-px bg-white/5 mx-4" />

            {/* Import Action */}
            <label className="w-full flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-lime/10 text-left transition-colors active:scale-[0.98] group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 group-hover:bg-lime/20 flex items-center justify-center transition-colors">
                  <Upload size={18} className="text-white/70 group-hover:text-lime" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white/90 group-hover:text-lime transition-colors">Impor Cadangan Data</p>
                  <p className="text-xs text-white/40 mt-0.5">Pulihkan dari file JSON</p>
                </div>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
            </label>
            <div className="h-px bg-white/5 mx-4" />

            {/* Danger reset action */}
            <button
              onClick={handleFactoryReset}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-red-500/10 text-left transition-colors active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <Trash2 size={18} className="text-red-400 group-hover:text-red-500" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-red-400 group-hover:text-red-500 transition-colors">Hapus Seluruh Data</p>
                  <p className="text-xs text-white/40 mt-0.5">Reset aplikasi ke setelan pabrik</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Beta Mode & Feedback Form */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Bantuan & Masukan</p>
          <div className="glass-card p-5 rounded-3xl space-y-5">
            <div className="flex items-start gap-3 bg-lime/10 border border-lime/20 rounded-2xl p-4">
              <Info size={20} className="text-lime shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white uppercase tracking-wider">Aplikasi Dalam Pengembangan 🚀</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Gym Planner ini sedang dikembangkan secara aktif oleh <strong>Yossika dari Sokaraja</strong>. Jika Anda mengalami kendala atau punya saran, silakan kirimkan masukan.
                </p>
              </div>
            </div>

            {/* Suggestion / Feedback Form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama / Email (Opsional)"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 min-h-[48px]"
                />
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 min-h-[48px] cursor-pointer"
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
                rows={4}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 resize-none"
              />

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-3.5 rounded-full bg-lime text-black text-[15px] font-extrabold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[52px]"
              >
                {submittingFeedback ? (
                  <>Mengirim...</>
                ) : (
                  <>
                    <Send size={18} /> Kirim Masukan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Release Notes Changelog */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Tentang Aplikasi</p>
          <div className="glass-card p-2 rounded-3xl">
            <button
              onClick={() => setShowChangelog(!showChangelog)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-white/5 text-left transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Terminal size={18} className="text-white/70" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white/90">Versi & Catatan Rilis</p>
                  <p className="text-xs text-lime font-medium mt-0.5">v1.5.0 PWA</p>
                </div>
              </div>
              <span className="text-xs text-white/40 underline">Lihat</span>
            </button>

            {showChangelog && (
              <div className="p-4 mx-2 mb-2 border-t border-white/5 text-xs leading-relaxed text-white/70 animate-fade-in space-y-4">
                <div className="space-y-1.5 bg-black/20 p-4 rounded-xl">
                  <p className="font-bold text-lime">Update Terbaru v1.5.0 (PWA & Musik):</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-white/60">
                    <li>Integrasi pemutar musik YouTube IFrame kustom.</li>
                    <li>Banner petunjuk instalasi PWA interaktif.</li>
                    <li>Dukungan cross-platform dynamic viewport (100dvh).</li>
                    <li>Tampilan Light Mode baru bertema gradasi ambient.</li>
                  </ul>
                </div>
                <div className="space-y-1.5 p-2">
                  <p className="font-bold text-white/90">Versi v1.4.0 (Gemini AI Key):</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-white/50">
                    <li>Input Gemini API key kustom untuk YosBot & AI Scan.</li>
                    <li>Konsistensi widget split latihan mingguan.</li>
                    <li>Penghitungan streak latihan dinamis bebas rest day.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-white/30 font-bold uppercase tracking-wider space-y-1.5 pt-4">
          <p>Gym Planner v1.5.0 PWA</p>
          <p>100% Local Storage Encryption Ready</p>
        </div>
      </div>
    </main>
  );
}
