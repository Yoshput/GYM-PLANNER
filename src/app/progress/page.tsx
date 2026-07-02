"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Camera, Scale, TrendingDown, Target, Activity, Ruler, Trash2, ChevronRight, Upload, Sparkles } from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { getLocalStorage, setLocalStorage } from "@/lib/store";

interface BodyMeasurementLog {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  armCm?: number;
  thighCm?: number;
}

interface ProgressPhotoLog {
  id: string;
  date: string;
  frontImage?: string; // base64
  sideImage?: string; // base64
  backImage?: string; // base64
}

export default function ProgressPage() {
  return (
    <AppShell>
      <ProgressContent />
    </AppShell>
  );
}

function ProgressContent() {
  const { profile } = useProfile();
  
  // Local state for measurements and photos
  const [logs, setLogs] = useState<BodyMeasurementLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhotoLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<"stats" | "photos">("stats");
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Form states for measurements
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");

  // Form states for photos upload
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [sideFile, setSideFile] = useState<string | null>(null);
  const [beforeAfterSliderValue, setBeforeAfterSliderValue] = useState(50);

  useEffect(() => {
    setLogs(getLocalStorage<BodyMeasurementLog[]>("gymplanner_body_logs", []));
    setPhotos(getLocalStorage<ProgressPhotoLog[]>("gymplanner_progress_photos", []));
  }, []);

  const handleSaveLogs = () => {
    if (!weight) return;
    const newLog: BodyMeasurementLog = {
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      weightKg: parseFloat(weight),
      bodyFatPct: bodyFat ? parseFloat(bodyFat) : undefined,
      chestCm: chest ? parseFloat(chest) : undefined,
      waistCm: waist ? parseFloat(waist) : undefined,
      armCm: arm ? parseFloat(arm) : undefined,
      thighCm: thigh ? parseFloat(thigh) : undefined,
    };
    
    const updated = [newLog, ...logs];
    setLogs(updated);
    setLocalStorage("gymplanner_body_logs", updated);
    setShowLogModal(false);
    
    // reset form
    setWeight("");
    setBodyFat("");
    setChest("");
    setWaist("");
    setArm("");
    setThigh("");
  };

  const handleSavePhoto = () => {
    if (!frontFile) return;
    const newPhoto: ProgressPhotoLog = {
      id: Math.random().toString(),
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      frontImage: frontFile,
      sideImage: sideFile || undefined,
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    setLocalStorage("gymplanner_progress_photos", updated);
    setShowPhotoModal(false);
    setFrontFile(null);
    setSideFile(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, position: "front" | "side") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (position === "front") setFrontFile(base64);
        if (position === "side") setSideFile(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Hapus foto progres ini?")) {
      const updated = photos.filter(p => p.id !== id);
      setPhotos(updated);
      setLocalStorage("gymplanner_progress_photos", updated);
    }
  };

  // Pure SVG/CSS chart drawing variables
  const chartPoints = useMemo(() => {
    if (logs.length === 0) return "";
    const list = [...logs].reverse().slice(-7); // last 7 measurements
    const maxVal = Math.max(...list.map(l => l.weightKg)) + 2;
    const minVal = Math.min(...list.map(l => l.weightKg)) - 2;
    const range = maxVal - minVal || 1;

    const width = 360;
    const height = 120;
    const points = list.map((l, index) => {
      const x = (index / (list.length - 1 || 1)) * (width - 40) + 20;
      const y = height - ((l.weightKg - minVal) / range) * (height - 30) - 15;
      return `${x},${y}`;
    });
    return points.join(" ");
  }, [logs]);

  return (
    <main className="px-5 pt-safe pt-8 pb-6 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="mb-6 animate-slide-down-fade">
        <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Body Changes</p>
        <h1 className="heading-brutal text-3xl">
          Pro<span className="text-gradient-lime">gress</span>
        </h1>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex gap-2 p-1 bg-base-raised/60 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "stats"
              ? "bg-lime text-black shadow-[0_0_12px_rgba(204,255,0,0.25)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Pengukuran Tubuh
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "photos"
              ? "bg-lime text-black shadow-[0_0_12px_rgba(204,255,0,0.25)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Foto Progres
        </button>
      </div>

      {/* ── STATS TAB ── */}
      {activeTab === "stats" && (
        <div className="space-y-5 animate-fade-in">
          {/* Sparkles motivator card */}
          {logs.length > 1 && (
            <div className="glass-card p-4 border-lime/20 bg-lime/3 flex items-center gap-3">
              <Sparkles className="text-lime shrink-0" size={18} />
              <p className="text-xs text-white/70 leading-normal">
                Beban badan Anda telah bergeser sebesar{" "}
                <strong className="text-lime">
                  {Math.abs(logs[0].weightKg - logs[logs.length - 1].weightKg).toFixed(1)} kg
                </strong>{" "}
                sejak pengukuran pertama. Konsistensi membuahkan hasil!
              </p>
            </div>
          )}

          {/* Weight graph */}
          <div className="glass-card p-5 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">Tren Berat Badan (7 Entri Terakhir)</p>
            {logs.length > 1 ? (
              <div className="relative pt-2">
                <svg viewBox="0 0 360 120" className="w-full overflow-visible">
                  {/* Fill Area beneath line chart */}
                  <path
                    d={`M 20,105 L ${chartPoints} L 340,105 Z`}
                    fill="url(#lime-glow)"
                    className="opacity-10"
                  />
                  {/* Line chart stroke */}
                  <polyline
                    fill="none"
                    stroke="#CCFF00"
                    strokeWidth="3.5"
                    points={chartPoints}
                    className="drop-shadow-[0_0_6px_rgba(204,255,0,0.4)]"
                  />
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="lime-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CCFF00" />
                      <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Labels row */}
                <div className="flex justify-between text-[10px] text-white/35 mt-2 font-bold px-4">
                  <span>Mulai</span>
                  <span>Terbaru ({logs[0].weightKg}kg)</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/35 text-xs">
                Grafik akan tampil setelah Anda memiliki minimal 2 log berat badan.
              </div>
            )}
          </div>

          {/* Quick Logs list */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 flex items-center gap-1">
                <Scale size={14} className="text-lime" /> Riwayat Ukuran
              </p>
              <button
                onClick={() => setShowLogModal(true)}
                className="bg-lime/10 border border-lime/25 text-lime hover:bg-lime/25 px-3.5 py-1.5 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus size={12} /> Log Ukuran
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-6 text-white/35 text-xs">
                Belum ada ukuran tubuh yang dicatat.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-base-raised/40 border border-base-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-white/30 font-bold uppercase">{log.date}</span>
                      <span className="font-display font-black text-sm text-lime">{log.weightKg} kg</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-white/60">
                      {log.bodyFatPct && <span>💧 BF: {log.bodyFatPct}%</span>}
                      {log.chestCm && <span>📏 Dada: {log.chestCm}cm</span>}
                      {log.waistCm && <span>📏 Pinggang: {log.waistCm}cm</span>}
                      {log.armCm && <span>📏 Lengan: {log.armCm}cm</span>}
                      {log.thighCm && <span>📏 Paha: {log.thighCm}cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PHOTOS TAB ── */}
      {activeTab === "photos" && (
        <div className="space-y-5 animate-fade-in">
          {/* Before After Interactive Slider */}
          {photos.length >= 2 ? (
            <div className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4 flex items-center justify-between">
                <span>Before vs After Slider</span>
                <span className="text-lime text-[10px] font-extrabold flex items-center gap-1"><Sparkles size={10} /> INTERAKTIF</span>
              </p>
              
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/60 border border-base-border">
                {/* Before Image (Left / Base) */}
                {photos[photos.length - 1].frontImage && (
                  <img
                    src={photos[photos.length - 1].frontImage}
                    alt="Before"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">
                  Before ({photos[photos.length - 1].date})
                </div>

                {/* After Image (Right / Sliding overlay) */}
                {photos[0].frontImage && (
                  <div
                    className="absolute inset-y-0 right-0 overflow-hidden"
                    style={{ left: `${beforeAfterSliderValue}%` }}
                  >
                    <img
                      src={photos[0].frontImage}
                      alt="After"
                      className="absolute top-0 right-0 h-full object-cover"
                      style={{ width: "360px", maxWidth: "none" }} // Ensure width aligns with standard card
                    />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-lime/10 border border-lime/25 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold text-lime uppercase tracking-wider">
                  After ({photos[0].date})
                </div>

                {/* Drag Slider line indicator */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-lime drop-shadow-[0_0_8px_rgba(204,255,0,0.8)] pointer-events-none"
                  style={{ left: `${beforeAfterSliderValue}%` }}
                />
                
                {/* Drag control slider overlay input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beforeAfterSliderValue}
                  onChange={(e) => setBeforeAfterSliderValue(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                />
              </div>
              <p className="text-[10px] text-white/35 text-center mt-2.5">Geser jari atau kursor Anda di atas foto untuk membandingkan</p>
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-white/35 text-xs">
              Upload minimal 2 foto progres untuk menggunakan Sebelum & Sesudah slider.
            </div>
          )}

          {/* Photo Gallery List */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 flex items-center gap-1">
                <Camera size={14} className="text-lime" /> Galeri Foto
              </p>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="bg-lime text-black hover:bg-lime-dim px-3.5 py-1.5 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(204,255,0,0.3)]"
              >
                <Upload size={12} /> Upload Foto
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-6 text-white/35 text-xs">
                Belum ada foto progres yang di-upload.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 max-h-[350px] overflow-y-auto scrollbar-none">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="relative rounded-xl overflow-hidden border border-base-border/70 group aspect-[4/5] bg-black/40">
                    {photo.frontImage && (
                      <img src={photo.frontImage} alt="Progress" className="h-full w-full object-cover" />
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex items-center justify-between">
                      <span className="text-[8px] font-extrabold text-white/70 uppercase tracking-widest">{photo.date}</span>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-ember hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Log Measure Modal ── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="glass-card w-full max-w-sm p-6 relative shimmer-border animate-scale-up">
            <h3 className="heading-brutal text-xl mb-1">Catat Ukuran Tubuh</h3>
            <p className="text-white/40 text-xs mb-5">Simpan data fisik terbaru Anda:</p>
            
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-1">Berat Badan (wajib)</label>
                <div className="flex items-center bg-black/40 rounded-xl border border-white/5 px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="65.0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent font-bold text-lime focus:outline-none placeholder-white/20"
                  />
                  <span className="text-xs text-white/45 ml-1">kg</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-1">Body Fat %</label>
                <input
                  type="number"
                  placeholder="15%"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-black/40 rounded-xl border border-white/5 px-3 py-2 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-1">Lingkar Dada</label>
                <input
                  type="number"
                  placeholder="95 cm"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full bg-black/40 rounded-xl border border-white/5 px-3 py-2 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-1">Lingkar Pinggang</label>
                <input
                  type="number"
                  placeholder="80 cm"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full bg-black/40 rounded-xl border border-white/5 px-3 py-2 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-1">Lingkar Lengan</label>
                <input
                  type="number"
                  placeholder="34 cm"
                  value={arm}
                  onChange={(e) => setArm(e.target.value)}
                  className="w-full bg-black/40 rounded-xl border border-white/5 px-3 py-2 text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white/70 rounded-xl py-2.5 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLogs}
                className="flex-1 bg-lime text-black rounded-xl py-2.5 font-bold text-xs shadow-[0_0_12px_rgba(204,255,0,0.3)]"
              >
                Simpan Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Photo Modal ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="glass-card w-full max-w-sm p-6 relative shimmer-border animate-scale-up">
            <h3 className="heading-brutal text-xl mb-1">Upload Foto Progres</h3>
            <p className="text-white/40 text-xs mb-5">Simpan potret visual bentuk tubuh Anda:</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-2">Foto Depan (Wajib)</label>
                <label className="border border-dashed border-white/20 hover:border-lime/45 cursor-pointer rounded-xl h-24 flex flex-col items-center justify-center bg-black/45 hover:bg-lime/3 text-white/45 transition-colors">
                  {frontFile ? (
                    <img src={frontFile} alt="Front preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Camera size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Pilih Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, "front")} />
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block mb-2">Foto Samping (Opsional)</label>
                <label className="border border-dashed border-white/20 hover:border-lime/45 cursor-pointer rounded-xl h-24 flex flex-col items-center justify-center bg-black/45 hover:bg-lime/3 text-white/45 transition-colors">
                  {sideFile ? (
                    <img src={sideFile} alt="Side preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Camera size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Pilih Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, "side")} />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white/70 rounded-xl py-2.5 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSavePhoto}
                disabled={!frontFile}
                className={`flex-1 rounded-xl py-2.5 font-bold text-xs transition-all ${
                  frontFile
                    ? "bg-lime text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                    : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                }`}
              >
                Simpan Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
