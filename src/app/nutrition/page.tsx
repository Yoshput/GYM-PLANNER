"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Flame, Coffee, Sun, Moon, Apple, Dumbbell, Droplets, Plus, Check,
  Search, Utensils, History, Trash2, X, Scale, Camera, Sparkles,
  Loader2, AlertCircle,
} from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useProfile } from "@/lib/useProfile";
import { calculateMacros } from "@/lib/calculations";
import { MEALS_BY_GOAL } from "@/data/meals";
import { MealSuggestion } from "@/types";

const TAG_META: Record<MealSuggestion["tag"], { label: string; icon: React.ReactNode; color: string }> = {
  breakfast: { label: "Breakfast", icon: <Coffee size={14} />, color: "text-amber-400" },
  lunch:     { label: "Lunch",     icon: <Sun size={14} />,    color: "text-yellow-400" },
  dinner:    { label: "Dinner",    icon: <Moon size={14} />,   color: "text-indigo-400" },
  snack:     { label: "Snack",     icon: <Apple size={14} />,  color: "text-lime" },
};

const FOOD_DATABASE = [
  { name: "Nasi Putih", kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3, fiberG: 0.4, sugarG: 0.1, sodiumMg: 1, baseGram: 100 },
  { name: "Dada Ayam Panggang", kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fiberG: 0, sugarG: 0, sodiumMg: 74, baseGram: 100 },
  { name: "Tempe Goreng", kcal: 193, proteinG: 19, carbsG: 9, fatG: 11, fiberG: 4.0, sugarG: 1.0, sodiumMg: 9, baseGram: 100 },
  { name: "Tahu Kukus", kcal: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8, fiberG: 1.0, sugarG: 0.2, sodiumMg: 7, baseGram: 100 },
  { name: "Telur Rebus", kcal: 155, proteinG: 13, carbsG: 1.1, fatG: 11, fiberG: 0, sugarG: 0.3, sodiumMg: 124, baseGram: 100 },
  { name: "Whey Protein Shake", kcal: 390, proteinG: 80, carbsG: 10, fatG: 5, fiberG: 0, sugarG: 3, sodiumMg: 160, baseGram: 100 },
  { name: "Pisang Ambon", kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6, sugarG: 12, sodiumMg: 1, baseGram: 100 },
  { name: "Oatmeal", kcal: 389, proteinG: 16.9, carbsG: 66, fatG: 6.9, fiberG: 10.6, sugarG: 1.0, sodiumMg: 2, baseGram: 100 },
  { name: "Susu Low Fat", kcal: 42, proteinG: 3.4, carbsG: 5, fatG: 1.0, fiberG: 0, sugarG: 4.8, sodiumMg: 44, baseGram: 100 },
  { name: "Kacang Almond", kcal: 579, proteinG: 21, carbsG: 22, fatG: 49, fiberG: 12.5, sugarG: 4.3, sodiumMg: 1, baseGram: 100 },
];

function MacroBar({ pct, loggedPct, color, isOver }: { pct: number; loggedPct: number; color: string; isOver: boolean }) {
  const [targetW, setTargetW] = useState(0);
  const [loggedW, setLoggedW] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setTargetW(Math.min(pct, 100));
      setLoggedW(Math.min(loggedPct, 100));
    }, 80);
    return () => clearTimeout(t);
  }, [pct, loggedPct]);

  const loggedColor = isOver ? "#FF4500" : loggedPct >= 90 ? "#CCFF00" : color;

  return (
    <div className="relative h-2.5 rounded-full bg-base-border/80 overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full opacity-20 transition-all duration-1000 ease-out" style={{ width: `${targetW}%`, backgroundColor: color }} />
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out" style={{ width: `${loggedW}%`, backgroundColor: loggedColor }} />
    </div>
  );
}

export default function NutritionPage() {
  return (
    <AppShell>
      <NutritionContent />
    </AppShell>
  );
}

function NutritionContent() {
  const { profile } = useProfile();
  const macros = useMemo(() => (profile ? calculateMacros(profile) : null), [profile]);

  const ML_PER_CUP = 250;
  const [cupsLogged, setCupsLogged] = useState(0);
  const [waterBump, setWaterBump] = useState(false);

  const handleAddCup = useCallback(() => {
    setCupsLogged((prev) => prev + 1);
    setWaterBump(true);
    setTimeout(() => setWaterBump(false), 350);
  }, []);

  const [loggedKcal,    setLoggedKcal]    = useState(0);
  const [loggedProtein, setLoggedProtein] = useState(0);
  const [loggedCarbs,   setLoggedCarbs]   = useState(0);
  const [loggedFat,     setLoggedFat]     = useState(0);
  const [loggedFiber,   setLoggedFiber]   = useState(0);
  const [loggedSugar,   setLoggedSugar]   = useState(0);
  const [loggedSodium,  setLoggedSodium]  = useState(0);
  const [loggedMeals,   setLoggedMeals]   = useState<Set<string>>(new Set());
  const [recentLogs,    setRecentLogs]    = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Modals
  const [activePortionFood, setActivePortionFood] = useState<any | null>(null);
  const [foodGramInput, setFoodGramInput] = useState<number>(100);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodKcal, setCustomFoodKcal] = useState("");
  const [customFoodP, setCustomFoodP] = useState("");
  const [customFoodC, setCustomFoodC] = useState("");
  const [customFoodF, setCustomFoodF] = useState("");

  // AI Scanner states
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<any | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q)));
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenPortionModal = (food: any) => {
    setActivePortionFood(food);
    setFoodGramInput(food.baseGram || 100);
    setSearchQuery("");
    setSearchResults([]);
    setSearchFocused(false);
  };

  const handleLogWithPortion = () => {
    if (!activePortionFood) return;
    const factor = foodGramInput / (activePortionFood.baseGram || 100);
    const k = Math.round(activePortionFood.kcal * factor);
    const p = Math.round(activePortionFood.proteinG * factor * 10) / 10;
    const c = Math.round(activePortionFood.carbsG * factor * 10) / 10;
    const f = Math.round(activePortionFood.fatG * factor * 10) / 10;
    const fi = Math.round((activePortionFood.fiberG || 0) * factor * 10) / 10;
    const s = Math.round((activePortionFood.sugarG || 0) * factor * 10) / 10;
    const na = Math.round((activePortionFood.sodiumMg || 0) * factor);

    setLoggedKcal(prev => prev + k);
    setLoggedProtein(prev => prev + p);
    setLoggedCarbs(prev => prev + c);
    setLoggedFat(prev => prev + f);
    setLoggedFiber(prev => prev + fi);
    setLoggedSugar(prev => prev + s);
    setLoggedSodium(prev => prev + na);
    setLoggedMeals(prev => new Set([...prev, activePortionFood.name]));
    setRecentLogs(prev => [{ name: `${activePortionFood.name} (${foodGramInput}g)`, kcal: k, p, c, f }, ...prev]);
    setActivePortionFood(null);
  };

  const handleLogMeal = useCallback((meal: MealSuggestion) => {
    setActivePortionFood({ name: meal.name, kcal: meal.kcal, proteinG: meal.proteinG, carbsG: meal.carbsG, fatG: meal.fatG, fiberG: 0, sugarG: 0, sodiumMg: 0, baseGram: 100 });
    setFoodGramInput(100);
  }, []);

  const handleLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;
    const k = Number(customFoodKcal) || 0, p = Number(customFoodP) || 0, c = Number(customFoodC) || 0, f = Number(customFoodF) || 0;
    setLoggedKcal(prev => prev + k); setLoggedProtein(prev => prev + p);
    setLoggedCarbs(prev => prev + c); setLoggedFat(prev => prev + f);
    setRecentLogs(prev => [{ name: customFoodName.trim(), kcal: k, p, c, f }, ...prev]);
    setCustomFoodName(""); setCustomFoodKcal(""); setCustomFoodP(""); setCustomFoodC(""); setCustomFoodF("");
    setShowCustomForm(false);
  };

  const handleRemoveLog = (index: number) => {
    const t = recentLogs[index];
    if (!t) return;
    setLoggedKcal(prev => Math.max(0, prev - t.kcal));
    setLoggedProtein(prev => Math.max(0, prev - t.p));
    setLoggedCarbs(prev => Math.max(0, prev - t.c));
    setLoggedFat(prev => Math.max(0, prev - t.f));
    setLoggedMeals(prev => { const s = new Set(prev); s.delete(t.name.split(" (")[0]); return s; });
    setRecentLogs(prev => prev.filter((_, i) => i !== index));
  };

  // ── AI Nutrition Scanner ──
  const getUserApiKey = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("yosbot-api-key") || localStorage.getItem("gemini-api-key") || "";
    }
    return "";
  };

  const runAIScan = async (query?: string, imageBase64?: string, mimeType?: string) => {
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const body: any = { userApiKey: getUserApiKey() };
      if (query) body.query = query;
      if (imageBase64) { body.imageBase64 = imageBase64; body.mimeType = mimeType; }

      const res = await fetch("/api/nutrition-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Gagal mendapatkan data nutrisi.");
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAITextScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    runAIScan(aiQuery);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type;
      setShowAIScanner(true);
      setAiQuery("");
      runAIScan(undefined, base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleLogAIResult = () => {
    if (!aiResult) return;
    const k = Math.round(aiResult.kcal || 0);
    const p = Math.round((aiResult.proteinG || 0) * 10) / 10;
    const c = Math.round((aiResult.carbsG || 0) * 10) / 10;
    const f = Math.round((aiResult.fatG || 0) * 10) / 10;
    const fi = Math.round((aiResult.fiberG || 0) * 10) / 10;
    setLoggedKcal(prev => prev + k);
    setLoggedProtein(prev => prev + p);
    setLoggedCarbs(prev => prev + c);
    setLoggedFat(prev => prev + f);
    setLoggedFiber(prev => prev + fi);
    const label = `${aiResult.name} (${aiResult.estimatedGram}g) [AI]`;
    setRecentLogs(prev => [{ name: label, kcal: k, p, c, f }, ...prev]);
    setAiResult(null);
    setAiQuery("");
    setShowAIScanner(false);
  };

  if (!profile || !macros) return null;

  const meals = MEALS_BY_GOAL[profile.goal] || [];
  const waterLiters = (profile.weightKg * 0.033).toFixed(1);
  const targetCups = Math.round(Number(waterLiters) * 4);
  const waterLitresLog = ((cupsLogged * ML_PER_CUP) / 1000).toFixed(2);
  const waterPct = Math.min((cupsLogged / targetCups) * 100, 100);

  const macroRows = [
    { label: "Protein", grams: macros.proteinG, kcal: macros.proteinKcal, color: "#CCFF00", loggedG: Math.round(loggedProtein), loggedKcal: loggedProtein * 4 },
    { label: "Carbs",   grams: macros.carbsG,   kcal: macros.carbsKcal,   color: "#FF8C00", loggedG: Math.round(loggedCarbs),   loggedKcal: loggedCarbs * 4 },
    { label: "Fat",     grams: macros.fatG,     kcal: macros.fatKcal,     color: "#A78BFA", loggedG: Math.round(loggedFat),     loggedKcal: loggedFat * 9 },
  ];

  const kcalPct = macros.calorieTarget > 0 ? Math.round((loggedKcal / macros.calorieTarget) * 100) : 0;
  const isOverKcal = loggedKcal > macros.calorieTarget;
  const remainingKcal = Math.max(0, macros.calorieTarget - loggedKcal);

  // Portion modal live calc
  const liveK  = activePortionFood ? Math.round(activePortionFood.kcal * (foodGramInput / (activePortionFood.baseGram || 100))) : 0;
  const liveP  = activePortionFood ? Math.round(activePortionFood.proteinG * (foodGramInput / (activePortionFood.baseGram || 100)) * 10) / 10 : 0;
  const liveC  = activePortionFood ? Math.round(activePortionFood.carbsG * (foodGramInput / (activePortionFood.baseGram || 100)) * 10) / 10 : 0;
  const liveF  = activePortionFood ? Math.round(activePortionFood.fatG * (foodGramInput / (activePortionFood.baseGram || 100)) * 10) / 10 : 0;

  return (
    <main className="pt-safe pt-8 pb-6 px-5 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="mb-6 flex justify-between items-end animate-slide-down-fade">
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Fuel The Machine</p>
          <h1 className="heading-brutal text-3xl">Nutri<span className="text-gradient-lime">tion</span></h1>
        </div>
        <div className="flex gap-2">
          {/* Camera Scan Button */}
          <label className="h-8 px-3 rounded-lg bg-base-raised/70 border border-base-border/55 flex items-center justify-center text-lime hover:bg-lime/10 cursor-pointer transition-all text-[10px] font-bold uppercase tracking-wider active:scale-95 gap-1">
            <Camera size={12} /> Scan
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} onClick={() => setShowAIScanner(true)} />
          </label>
          {/* AI Scanner Button */}
          <button
            onClick={() => { setShowAIScanner(true); setAiResult(null); setAiError(""); }}
            className="h-8 px-3 rounded-lg bg-lime/15 border border-lime/30 flex items-center justify-center text-lime hover:bg-lime/20 transition-all text-[10px] font-bold uppercase tracking-wider active:scale-95 gap-1"
          >
            <Sparkles size={12} /> AI Scan
          </button>
        </div>
      </div>

      {/* ── Calorie Hero ── */}
      <div className="glass-card p-6 mb-5 flex flex-col items-center text-center relative overflow-hidden shimmer-border animate-stagger-in">
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-lime/12 blur-3xl" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-ember/8 blur-3xl" />
        <div className="relative w-full">
          <div className="flex items-center justify-center gap-2 text-lime text-xs font-bold uppercase tracking-widest mb-3">
            <Flame size={14} className="animate-pulse" /> Live Calorie Counter
          </div>
          <div className="flex justify-around items-center mb-2">
            <div><p className="text-[10px] text-white/30 font-bold uppercase">Target</p><p className="font-display font-black text-lg text-white/80">{macros.calorieTarget}</p></div>
            <div className="h-8 w-px bg-base-border/50" />
            <div><p className="text-[10px] text-white/30 font-bold uppercase">Makanan</p><p className="font-display font-black text-xl text-white">{loggedKcal}</p></div>
            <div className="h-8 w-px bg-base-border/50" />
            <div><p className="text-[10px] text-lime font-bold uppercase">Sisa</p><p className="font-display font-black text-2xl text-lime leading-none">{remainingKcal}</p></div>
          </div>
          <div className="w-full mt-3">
            <div className="h-2 rounded-full bg-base-border/60 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(kcalPct, 100)}%`, backgroundColor: isOverKcal ? "#FF4500" : "#CCFF00" }} />
            </div>
            {isOverKcal && <p className="text-ember text-[10px] mt-1.5 font-bold animate-pulse">⚠ Melebihi target sebanyak {loggedKcal - macros.calorieTarget} kcal!</p>}
          </div>
        </div>
      </div>

      {/* ── Food Search (No overlay/containment issues because of clean markup structure) ── */}
      <div className="bg-base-raised/30 border border-base-border/70 rounded-2xl p-4 mb-5 animate-stagger-in relative" ref={searchContainerRef}>
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-1.5">
          <Search size={14} className="text-lime" /> Cari & Log Makanan
        </p>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cari nasi putih, dada ayam, tempe..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          className="w-full bg-black/40 border border-base-border/75 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
        />
        
        {/* Dropdown Hasil Pencarian - nempel di container relative, 100% responsif & aman di HP */}
        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-4 right-4 top-[84px] z-50 bg-[#111] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-56 overflow-y-auto scrollbar-none divide-y divide-white/5 animate-scale-in">
            {searchResults.length > 0 ? (
              searchResults.map((food, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenPortionModal(food)}
                  className="w-full text-left p-3.5 hover:bg-lime/5 transition-colors flex justify-between items-center text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white/90 truncate">{food.name}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">P {food.proteinG}g · C {food.carbsG}g · F {food.fatG}g (per {food.baseGram}g)</p>
                  </div>
                  <span className="font-display font-black text-lime shrink-0 ml-2">{food.kcal} kcal +</span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-white/35 text-xs mb-2">Tidak ditemukan di database lokal.</p>
                <button
                  onClick={() => { setCustomFoodName(searchQuery); setSearchQuery(""); setShowCustomForm(true); }}
                  className="text-[10px] font-bold uppercase tracking-wider text-lime bg-lime/10 px-3 py-1.5 rounded-lg border border-lime/20"
                >
                  + Input Manual / Custom
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Water Tracker ── */}
      <div className="glass-card p-4 mb-5 animate-stagger-in">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 ${waterBump ? "scale-125" : "scale-100"}`}>
            <Droplets size={18} className={waterPct >= 100 ? "text-lime" : "text-blue-400"} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-white/35 mb-0.5">Daily Water</p>
            <p className={`font-display font-extrabold text-lg transition-all duration-200 ${waterBump ? "scale-110 text-blue-300" : "scale-100"}`} style={{ display: "inline-block", transformOrigin: "left center" }}>
              {cupsLogged > 0 ? waterLitresLog : waterLiters} <span className="text-white/40 text-sm font-normal">litres {cupsLogged > 0 ? `(${cupsLogged}/${targetCups})` : ""}</span>
            </p>
          </div>
          <button onClick={handleAddCup} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all duration-150 active:scale-95 ${waterPct >= 100 ? "bg-lime/15 text-lime border-lime/25" : "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"}`}>
            <Plus size={12} /> {waterPct >= 100 ? "Done!" : "+1 Cup"}
          </button>
        </div>
        {cupsLogged > 0 && <div className="mt-3 h-2 rounded-full bg-base-border/60 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${waterPct}%`, backgroundColor: waterPct >= 100 ? "#CCFF00" : "#3B82F6" }} /></div>}
      </div>

      {/* ── Macro Breakdown ── */}
      <div className="glass-card p-5 mb-5 animate-stagger-in">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">Macro Targets</p>
        <div className="space-y-4">
          {macroRows.map((row) => {
            const targetPct = Math.round((row.kcal / macros.calorieTarget) * 100);
            const loggedPct = macros.calorieTarget > 0 ? Math.round((row.loggedKcal / macros.calorieTarget) * 100) : 0;
            const isOver = row.loggedG > row.grams;
            const near = !isOver && row.loggedG > 0 && row.loggedG / row.grams >= 0.9;
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} /><span className="font-display font-bold uppercase tracking-wide">{row.label}</span></div>
                  <span className="text-white/60 text-xs">
                    {row.loggedG > 0 ? <span className={isOver ? "text-ember font-bold" : near ? "text-lime font-bold" : ""}>{row.loggedG}g / </span> : null}
                    {row.grams}g <span className="text-white/25">· {targetPct}%</span>
                    {isOver && <span className="text-ember text-[10px] ml-1">↑ Over</span>}
                    {near && <span className="text-lime text-[10px] ml-1">✓ Near</span>}
                  </span>
                </div>
                <MacroBar pct={targetPct} loggedPct={loggedPct} color={row.color} isOver={isOver} />
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-base-border/30 grid grid-cols-3 gap-2.5">
          <div className="bg-base-raised/35 p-2 rounded-xl text-center"><span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Fiber</span><span className="text-xs font-black text-lime">{loggedFiber.toFixed(1)} g</span></div>
          <div className="bg-base-raised/35 p-2 rounded-xl text-center"><span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Sugar</span><span className="text-xs font-black text-amber-400">{loggedSugar.toFixed(1)} g</span></div>
          <div className="bg-base-raised/35 p-2 rounded-xl text-center"><span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Sodium</span><span className="text-xs font-black text-indigo-300">{loggedSodium} mg</span></div>
        </div>
      </div>

      {/* ── Recent Logs ── */}
      {recentLogs.length > 0 && (
        <div className="glass-card p-4.5 mb-5 animate-stagger-in">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-1.5"><History size={13} className="text-lime" /> Makanan Hari Ini ({recentLogs.length})</p>
          <div className="space-y-2.5 max-h-44 overflow-y-auto scrollbar-none">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-base-raised/40 border border-base-border/50 text-xs">
                <div className="min-w-0 flex-1"><p className="font-bold text-white truncate">{log.name}</p><p className="text-white/40 text-[10px] mt-0.5">P {log.p}g · C {log.c}g · F {log.f}g</p></div>
                <div className="flex items-center gap-2"><span className="font-display font-black text-lime">{log.kcal} kcal</span><button onClick={() => handleRemoveLog(idx)} className="text-ember p-1 active:scale-90"><Trash2 size={12} /></button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sample Meals ── */}
      <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">
        Rekomendasi · {profile.goal === "cutting" ? "Cutting" : profile.goal === "bulking" ? "Bulking" : profile.goal === "powerlifting" ? "Powerlifting" : "Maintenance"}
      </p>
      <div className="space-y-3 mb-8">
        {meals.map((meal, idx) => {
          const isLogged = loggedMeals.has(meal.name);
          return (
            <div key={meal.name} className={`glass-card p-4 transition-colors animate-stagger-in ${isLogged ? "border-lime/20" : "hover:border-white/10"}`} style={{ animationDelay: `${idx * 0.06}s` }}>
              <div className="flex items-start justify-between mb-2">
                <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${TAG_META[meal.tag]?.color || "text-white"}`}>{TAG_META[meal.tag]?.icon}<span>{TAG_META[meal.tag]?.label}</span></div>
                <span className="chip bg-lime/12 text-lime shrink-0 border border-lime/15">{meal.kcal} kcal</span>
              </div>
              <p className="font-display font-bold uppercase tracking-wide text-sm mb-1">{meal.name}</p>
              <p className="text-white/45 text-xs mb-3 leading-relaxed">{meal.description}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">P {meal.proteinG}g</span>
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">C {meal.carbsG}g</span>
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">F {meal.fatG}g</span>
                </div>
                <button onClick={() => handleLogMeal(meal)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 shrink-0 bg-white/5 text-white/70 border-white/10 hover:bg-lime/10 hover:text-lime hover:border-lime/20">
                  <Plus size={11} /> Makan Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Branding footer ── */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-base-border/30">
        <Dumbbell size={12} className="text-lime/40" />
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">Made by <span className="text-lime/50">Yossika</span> from Sokaraja</p>
        <Dumbbell size={12} className="text-lime/40" />
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ── MODALS ────────────────────────────────── */}

      {/* ── Portion Input Modal ── */}
      {activePortionFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setActivePortionFood(null)} />
          <div className="relative w-full max-w-sm bg-base-card border border-base-border rounded-[2.5rem] p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-xs text-lime flex items-center gap-1.5"><Scale size={14} /> Tentukan Porsi</h3>
              <button onClick={() => setActivePortionFood(null)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <div className="bg-base-raised/30 border border-base-border/50 p-4 rounded-2xl mb-4 text-center">
              <p className="font-display font-bold text-base text-white uppercase mb-1">{activePortionFood.name}</p>
              <p className="text-white/40 text-[10px]">Basis per {activePortionFood.baseGram}g: P {activePortionFood.proteinG}g · C {activePortionFood.carbsG}g · F {activePortionFood.fatG}g</p>
            </div>
            <label className="block text-[9px] font-bold uppercase text-white/40 mb-2 text-center">Berapa gram yang Anda makan?</label>
            <div className="flex items-center justify-center gap-3 mb-4">
              <input type="number" value={foodGramInput || ""} onChange={(e) => setFoodGramInput(Number(e.target.value))} className="w-24 bg-black/50 border-2 border-lime/45 rounded-xl py-2 px-3 text-center text-lg font-black text-lime focus:outline-none" min={1} max={2000} />
              <span className="text-white/60 font-bold text-sm">gram</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[{ l: "Kalori", v: `${liveK} kcal`, c: "text-white" }, { l: "Protein", v: `${liveP}g`, c: "text-lime" }, { l: "Carbs", v: `${liveC}g`, c: "text-amber-400" }, { l: "Fat", v: `${liveF}g`, c: "text-indigo-300" }].map(x => (
                <div key={x.l} className="text-center bg-base-raised/40 p-2 rounded-xl">
                  <span className="text-[8px] text-white/30 font-bold block mb-0.5">{x.l.toUpperCase()}</span>
                  <span className={`text-xs font-black ${x.c}`}>{x.v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLogWithPortion} className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider">Log Makanan ({foodGramInput}g)</button>
          </div>
        </div>
      )}

      {/* ── AI Scanner Modal ── */}
      {showAIScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => { if (!aiLoading) { setShowAIScanner(false); setAiResult(null); setAiError(""); }}} />
          <div className="relative w-full max-w-sm bg-base-card border border-lime/20 rounded-[2.5rem] p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-sm text-lime flex items-center gap-2"><Sparkles size={16} /> AI Nutrition Scanner</h3>
              {!aiLoading && <button onClick={() => { setShowAIScanner(false); setAiResult(null); setAiError(""); }} className="text-white/40 hover:text-white"><X size={16} /></button>}
            </div>

            {/* Loading State */}
            {aiLoading && (
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 size={32} className="text-lime animate-spin" />
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">AI sedang menganalisis nutrisi...</p>
              </div>
            )}

            {/* Error State */}
            {aiError && !aiLoading && (
              <div className="bg-ember/10 border border-ember/30 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-ember shrink-0 mt-0.5" />
                <p className="text-xs text-white/80">{aiError}</p>
              </div>
            )}

            {/* AI Result */}
            {aiResult && !aiLoading && (
              <div className="mb-4">
                <div className="bg-lime/5 border border-lime/20 rounded-2xl p-4 mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-display font-black text-white text-base uppercase">{aiResult.name}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">~{aiResult.estimatedGram}g · Akurasi: <span className={aiResult.confidence === "high" ? "text-lime" : aiResult.confidence === "medium" ? "text-amber-400" : "text-ember"}>{aiResult.confidence}</span></p>
                    </div>
                    <span className="font-display font-black text-xl text-lime">{Math.round(aiResult.kcal)} kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ l: "Protein", v: `${Math.round(aiResult.proteinG * 10) / 10}g`, c: "text-lime" }, { l: "Carbs", v: `${Math.round(aiResult.carbsG * 10) / 10}g`, c: "text-amber-400" }, { l: "Fat", v: `${Math.round(aiResult.fatG * 10) / 10}g`, c: "text-indigo-300" }].map(x => (
                      <div key={x.l} className="bg-base-raised/50 p-2 rounded-xl text-center">
                        <span className="text-[9px] text-white/35 font-bold block">{x.l}</span>
                        <span className={`text-sm font-black ${x.c}`}>{x.v}</span>
                      </div>
                    ))}
                  </div>
                  {aiResult.notes && <p className="text-white/30 text-[10px] mt-3 italic">*{aiResult.notes}</p>}
                </div>
                <button onClick={handleLogAIResult} className="w-full btn-primary py-2.5 text-xs font-bold uppercase tracking-wider">
                  Catat ke Harian
                </button>
              </div>
            )}

            {/* Input Form (shown when no result yet) */}
            {!aiLoading && !aiResult && (
              <>
                <form onSubmit={handleAITextScan} className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-white/40 mb-2">Ketik Makanan + Gram (AI Kalkulasi Otomatis)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder='Contoh: "Ayam rebus 150 gram"'
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="flex-1 bg-black/40 border border-base-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 placeholder-white/25"
                        autoFocus
                      />
                      <button type="submit" disabled={!aiQuery.trim()} className="px-3 py-2 rounded-xl bg-lime/20 border border-lime/30 text-lime hover:bg-lime/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold">
                        Cari
                      </button>
                    </div>
                    <p className="text-white/25 text-[10px] mt-1.5">Bisa juga: &ldquo;Nasi padang 1 piring&rdquo;, &ldquo;Roti gandum 2 lembar&rdquo;, dsb.</p>
                  </div>
                </form>

                <div className="relative flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-base-border/40" />
                  <span className="text-[9px] font-bold uppercase text-white/25">atau</span>
                  <div className="flex-1 h-px bg-base-border/40" />
                </div>

                <label className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-lime/30 rounded-2xl text-lime/80 hover:text-lime hover:bg-lime/5 cursor-pointer transition-all text-xs font-bold uppercase tracking-wider">
                  <Camera size={15} /> Foto Makanan Anda
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
                </label>
                <p className="text-center text-white/25 text-[9px] mt-2">AI akan langsung identifikasi & hitung nutrisinya</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Custom Food Manual Input Modal ── */}
      {showCustomForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCustomForm(false)} />
          <div className="relative w-full max-w-sm bg-base-card border border-base-border rounded-[2rem] p-5 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-xs text-lime flex items-center gap-1"><Utensils size={14} /> Log Makanan Kustom</h3>
              <button onClick={() => setShowCustomForm(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleLogCustom} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Nama Makanan</label>
                <input type="text" placeholder="Ayam Geprek Sambal Korek" value={customFoodName} onChange={(e) => setCustomFoodName(e.target.value)} className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Kalori (kcal)</label><input type="number" placeholder="450" value={customFoodKcal} onChange={(e) => setCustomFoodKcal(e.target.value)} className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45" required /></div>
                <div><label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Protein (g)</label><input type="number" placeholder="25" value={customFoodP} onChange={(e) => setCustomFoodP(e.target.value)} className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Karbohidrat (g)</label><input type="number" placeholder="40" value={customFoodC} onChange={(e) => setCustomFoodC(e.target.value)} className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45" /></div>
                <div><label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Lemak (g)</label><input type="number" placeholder="12" value={customFoodF} onChange={(e) => setCustomFoodF(e.target.value)} className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45" /></div>
              </div>
              <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold uppercase tracking-wider">Catat Makanan</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
