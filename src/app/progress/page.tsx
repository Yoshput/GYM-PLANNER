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
    <main className="px-4 sm:px-6 lg:px-8 pt-safe pt-8 pb-10 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8 animate-slide-down-fade lg:mb-10 text-center sm:text-left">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1.5">Body Changes</p>
        <h1 className="heading-brutal text-3xl sm:text-4xl">
          Pro<span className="text-gradient-lime">gress</span>
        </h1>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex gap-2 p-1.5 bg-base-raised/60 rounded-[1.25rem] mb-8 max-w-sm mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === "stats"
              ? "bg-lime text-black shadow-[0_4px_16px_rgba(204,255,0,0.25)]"
              : "text-white/50 hover:text-white/80 active:scale-95"
          }`}
        >
          Pengukuran Tubuh
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === "photos"
              ? "bg-lime text-black shadow-[0_4px_16px_rgba(204,255,0,0.25)]"
              : "text-white/50 hover:text-white/80 active:scale-95"
          }`}
        >
          Foto Progres
        </button>
      </div>

      {/* ── STATS TAB ── */}
      {activeTab === "stats" && (
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Sparkles motivator card */}
          {logs.length > 1 && (
            <div className="glass-card p-5 border-lime/20 bg-lime/5 flex items-start gap-4 rounded-2xl">
              <Sparkles className="text-lime shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-white/80 leading-relaxed">
                Beban badan Anda telah bergeser sebesar{" "}
                <strong className="text-lime text-base mx-1">
                  {Math.abs(logs[0].weightKg - logs[logs.length - 1].weightKg).toFixed(1)} kg
                </strong>{" "}
                sejak pengukuran pertama. Konsistensi membuahkan hasil!
              </p>
            </div>
          )}

          {/* Weight graph */}
          <div className="glass-card p-6 lg:p-8 relative overflow-hidden rounded-[2rem]">
            <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Tren Berat Badan (7 Entri Terakhir)</p>
            {logs.length > 1 ? (
              <div className="relative pt-2 w-full max-w-full overflow-hidden">
                <svg viewBox="0 0 360 120" className="w-full h-auto overflow-visible transform translate-z-0">
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
                <div className="flex justify-between text-xs text-white/40 mt-4 font-bold px-2 sm:px-6">
                  <span>Mulai</span>
                  <span>Terbaru ({logs[0].weightKg}kg)</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-white/40 text-sm">
                Grafik akan tampil setelah Anda memiliki minimal 2 log berat badan.
              </div>
            )}
          </div>

          {/* Quick Logs list */}
          <div className="glass-card p-6 lg:p-8 rounded-[2rem]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Scale size={16} className="text-lime" /> Riwayat Ukuran
              </p>
              <button
                onClick={() => setShowLogModal(true)}
                className="bg-lime/10 border border-lime/25 text-lime hover:bg-lime/20 min-h-[44px] px-4 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Log Ukuran
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                Belum ada ukuran tubuh yang dicatat.
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-none pr-2">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-base-raised/40 border border-base-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">{log.date}</span>
                      <span className="font-display font-black text-lg text-lime">{log.weightKg} kg</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-white/60">
                      {log.bodyFatPct && <span className="bg-black/20 p-2 rounded-lg">💧 BF: <span className="text-white/90 font-bold">{log.bodyFatPct}%</span></span>}
                      {log.chestCm && <span className="bg-black/20 p-2 rounded-lg">📏 Dada: <span className="text-white/90 font-bold">{log.chestCm}cm</span></span>}
                      {log.waistCm && <span className="bg-black/20 p-2 rounded-lg">📏 Pinggang: <span className="text-white/90 font-bold">{log.waistCm}cm</span></span>}
                      {log.armCm && <span className="bg-black/20 p-2 rounded-lg">📏 Lengan: <span className="text-white/90 font-bold">{log.armCm}cm</span></span>}
                      {log.thighCm && <span className="bg-black/20 p-2 rounded-lg">📏 Paha: <span className="text-white/90 font-bold">{log.thighCm}cm</span></span>}
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
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Before After Interactive Slider */}
          {photos.length >= 2 ? (
            <div className="glass-card p-6 lg:p-8 rounded-[2rem]">
              <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>Before vs After Slider</span>
                <span className="text-lime text-[11px] font-extrabold flex items-center gap-1.5 bg-lime/10 px-3 py-1 rounded-full w-fit"><Sparkles size={12} /> INTERAKTIF</span>
              </p>
              
              <div className="relative aspect-[3/4] sm:aspect-square md:aspect-[4/3] lg:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-black/60 border border-base-border transform translate-z-0">
                {/* Before Image (Left / Base) */}
                {photos[photos.length - 1].frontImage && (
                  <img
                    src={photos[photos.length - 1].frontImage}
                    alt="Before"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
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
                      style={{ width: "100vw", maxWidth: "1000px" }} // Changed to allow scaling
                    />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-lime/10 border border-lime/25 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-lime uppercase tracking-wider">
                  After ({photos[0].date})
                </div>

                {/* Drag Slider line indicator */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-lime drop-shadow-[0_0_12px_rgba(204,255,0,0.8)] pointer-events-none"
                  style={{ left: `${beforeAfterSliderValue}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-lime rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                    <div className="w-1 h-4 bg-black rounded-full" />
                  </div>
                </div>
                
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
              <p className="text-xs text-white/40 text-center mt-4">Geser jari atau kursor Anda di atas foto untuk membandingkan</p>
            </div>
          ) : (
            <div className="glass-card p-8 lg:p-12 text-center text-white/40 text-sm rounded-[2rem]">
              Upload minimal 2 foto progres untuk menggunakan Sebelum & Sesudah slider.
            </div>
          )}

          {/* Photo Gallery List */}
          <div className="glass-card p-6 lg:p-8 rounded-[2rem]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Camera size={16} className="text-lime" /> Galeri Foto
              </p>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="bg-lime text-black hover:bg-lime-dim min-h-[44px] px-5 rounded-full font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(204,255,0,0.3)]"
              >
                <Upload size={16} /> Upload Foto
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-sm">
                Belum ada foto progres yang di-upload.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto scrollbar-none pb-2">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-base-border/70 group aspect-[4/5] bg-black/40">
                    {photo.frontImage && (
                      <img src={photo.frontImage} alt="Progress" className="h-full w-full object-cover transform transition-transform group-hover:scale-105" />
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-widest">{photo.date}</span>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-ember/70 hover:text-red-400 p-2 rounded-full hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 size={16} />
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 lg:p-8 relative shimmer-border animate-scale-up rounded-[2rem]">
            <h3 className="heading-brutal text-2xl mb-2">Catat Ukuran Tubuh</h3>
            <p className="text-white/50 text-sm mb-6">Simpan data fisik terbaru Anda:</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Berat Badan (wajib)</label>
                <div className="flex items-center bg-black/40 rounded-2xl border border-white/10 px-4 py-2 min-h-[52px]">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="65.0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent font-bold text-lg text-lime focus:outline-none placeholder-white/20"
                  />
                  <span className="text-sm font-bold text-white/40 ml-2">kg</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Body Fat %</label>
                <input
                  type="number"
                  placeholder="15%"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-black/40 rounded-2xl border border-white/10 px-4 py-3 min-h-[48px] text-white font-bold focus:outline-none focus:border-lime/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Lingkar Dada</label>
                <input
                  type="number"
                  placeholder="95 cm"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full bg-black/40 rounded-2xl border border-white/10 px-4 py-3 min-h-[48px] text-white font-bold focus:outline-none focus:border-lime/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Lingkar Pinggang</label>
                <input
                  type="number"
                  placeholder="80 cm"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full bg-black/40 rounded-2xl border border-white/10 px-4 py-3 min-h-[48px] text-white font-bold focus:outline-none focus:border-lime/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Lingkar Lengan</label>
                <input
                  type="number"
                  placeholder="34 cm"
                  value={arm}
                  onChange={(e) => setArm(e.target.value)}
                  className="w-full bg-black/40 rounded-2xl border border-white/10 px-4 py-3 min-h-[48px] text-white font-bold focus:outline-none focus:border-lime/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-full min-h-[52px] font-bold text-sm transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLogs}
                className="flex-1 bg-lime text-black rounded-full min-h-[52px] font-extrabold text-sm shadow-[0_4px_16px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Simpan Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Photo Modal ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 lg:p-8 relative shimmer-border animate-scale-up rounded-[2rem]">
            <h3 className="heading-brutal text-2xl mb-2">Upload Foto Progres</h3>
            <p className="text-white/50 text-sm mb-6">Simpan potret visual bentuk tubuh Anda:</p>

            <div className="space-y-5 mb-8">
              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Foto Depan (Wajib)</label>
                <label className="border-2 border-dashed border-white/20 hover:border-lime/50 cursor-pointer rounded-2xl h-32 flex flex-col items-center justify-center bg-black/40 hover:bg-lime/5 text-white/50 transition-all">
                  {frontFile ? (
                    <img src={frontFile} alt="Front preview" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Camera size={28} className="mb-2 text-white/40" />
                      <span className="text-xs font-bold uppercase tracking-wider">Pilih Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, "front")} />
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wide block mb-2 ml-1">Foto Samping (Opsional)</label>
                <label className="border-2 border-dashed border-white/20 hover:border-lime/50 cursor-pointer rounded-2xl h-32 flex flex-col items-center justify-center bg-black/40 hover:bg-lime/5 text-white/50 transition-all">
                  {sideFile ? (
                    <img src={sideFile} alt="Side preview" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Camera size={28} className="mb-2 text-white/40" />
                      <span className="text-xs font-bold uppercase tracking-wider">Pilih Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, "side")} />
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-full min-h-[52px] font-bold text-sm transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSavePhoto}
                disabled={!frontFile}
                className={`flex-1 rounded-full min-h-[52px] font-extrabold text-sm transition-all ${
                  frontFile
                    ? "bg-lime text-black shadow-[0_4px_16px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-95"
                    : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
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
