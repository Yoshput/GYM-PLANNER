"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, LogOut, Trash2, Save, User, Loader2, AlertCircle, Sparkles, Camera } from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { createClient } from "@/lib/supabase/client";
import { saveProfile } from "@/lib/storage";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile, isLoading, refresh, updateProfile } = useProfile();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [goal, setGoal] = useState<"cutting" | "bulking" | "maintenance" | "powerlifting">("maintenance");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "expert">("beginner");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync with profile data once loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setGender(profile.gender || "male");
      setWeightKg(profile.weightKg ? profile.weightKg.toString() : "");
      setHeightCm(profile.heightCm ? profile.heightCm.toString() : "");
      setBodyFatPct(profile.bodyFatPct ? profile.bodyFatPct.toString() : "");
      setGoal(profile.goal || "maintenance");
      setExperience(profile.experience || "beginner");
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (profile) {
          await updateProfile({
            ...profile,
            profileImage: base64
          });
          // Also save in local storage for instant sync
          saveProfile({ ...profile, profileImage: base64 });
          refresh();
          setSuccess("Foto profil berhasil diperbarui!");
          setTimeout(() => setSuccess(""), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const ok = await updateProfile({
        name: name.trim(),
        gender,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        bodyFatPct: Number(bodyFatPct),
        goal,
        experience,
      });

      if (!ok) throw new Error("Gagal memperbarui profil di database.");

      setSuccess("Profil Anda berhasil disimpan!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "PERINGATAN KRITIS: Menghapus akun akan menghapus seluruh data profil, riwayat latihan, dan log Anda secara permanen dari server. Tindakan ini tidak dapat dibatalkan.\n\nApakah Anda benar-benar yakin?"
      )
    ) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: deleteError } = await supabase.from("profiles").delete().eq("id", user.id);
        if (deleteError) throw deleteError;

        await supabase.auth.signOut();
        alert("Akun Anda telah berhasil dihapus.");
        router.push("/");
        router.refresh();
      } catch (err: any) {
        alert("Gagal menghapus akun: " + err.message);
      }
    }
  };

  return (
    <AppShell>
      <main className="pt-safe pt-8 pb-6 px-5 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-end animate-slide-down-fade">
          <div>
            <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Your Space</p>
            <h1 className="heading-brutal text-3xl">Pro<span className="text-gradient-lime">file</span></h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 mb-6 animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group shrink-0">
              <label className="block cursor-pointer">
                <div className="h-16 w-16 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime overflow-hidden relative" style={{ height: '64px', width: '64px', minWidth: '64px', minHeight: '64px' }}>
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="object-cover" style={{ height: '64px', width: '64px', display: 'block' }} />
                  ) : (
                    <User size={32} />
                  )}
                  {/* Overlay camera on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                    <Camera size={16} />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h2 className="heading-brutal text-xl text-white">{name || "Gym Member"}</h2>
              <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{profile?.experience} &middot; {profile?.goal}</p>
            </div>
          </div>

          {error && (
            <div className="bg-ember/10 border border-ember/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-ember shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-normal">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-lime/10 border border-lime/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <div className="h-4.5 w-4.5 rounded-full bg-lime text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
              <p className="text-xs text-lime leading-normal">{success}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 cursor-pointer"
                >
                  <option value="male" className="bg-[#111]">Pria</option>
                  <option value="female" className="bg-[#111]">Wanita</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Goal Fisik</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 cursor-pointer"
                >
                  <option value="maintenance" className="bg-[#111]">Maintenance</option>
                  <option value="cutting" className="bg-[#111]">Cutting</option>
                  <option value="bulking" className="bg-[#111]">Bulking</option>
                  <option value="powerlifting" className="bg-[#111]">Powerlifting</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Berat (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Tinggi (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Body Fat (%)</label>
                <input
                  type="number"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 text-center"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5 tracking-wider">Tingkat Pengalaman</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="w-full bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 cursor-pointer"
              >
                <option value="beginner" className="bg-[#111]">Beginner</option>
                <option value="intermediate" className="bg-[#111]">Intermediate</option>
                <option value="expert" className="bg-[#111]">Expert</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-3 text-xs font-extrabold hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 px-4 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <LogOut size={14} className="text-white/60" />
            Keluar dari Akun (Sign Out)
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-3.5 px-4 bg-ember/10 border border-ember/25 text-ember hover:bg-ember/20 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Trash2 size={14} />
            Hapus Akun Permanen
          </button>
        </div>
      </main>
    </AppShell>
  );
}
