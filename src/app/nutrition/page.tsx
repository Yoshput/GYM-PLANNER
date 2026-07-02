"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Flame, Coffee, Sun, Moon, Apple, Dumbbell, Droplets, Plus, Check, TrendingUp, Search, Utensils, Heart, History, Trash2, X, Scale } from "lucide-react";
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

// Mock Food Database for Indonesian & Fitness Foods (Base per 100g)
const FOOD_DATABASE = [
  { name: "Nasi Putih", kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3, fiberG: 0.4, sugarG: 0.1, sodiumMg: 1, baseGram: 100 },
  { name: "Dada Ayam Panggang", kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fiberG: 0, sugarG: 0, sodiumMg: 74, baseGram: 100 },
  { name: "Tempe Goreng / Panggang", kcal: 193, proteinG: 19, carbsG: 9, fatG: 11, fiberG: 4.0, sugarG: 1.0, sodiumMg: 9, baseGram: 100 },
  { name: "Tahu Kukus / Rebus", kcal: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8, fiberG: 1.0, sugarG: 0.2, sodiumMg: 7, baseGram: 100 },
  { name: "Telur Rebus Utuh", kcal: 155, proteinG: 13, carbsG: 1.1, fatG: 11, fiberG: 0, sugarG: 0.3, sodiumMg: 124, baseGram: 100 },
  { name: "Whey Protein Shake", kcal: 390, proteinG: 80, carbsG: 10, fatG: 5, fiberG: 0, sugarG: 3, sodiumMg: 160, baseGram: 100 },
  { name: "Pisang Ambon", kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6, sugarG: 12, sodiumMg: 1, baseGram: 100 },
  { name: "Susu Sapi Low Fat", kcal: 42, proteinG: 3.4, carbsG: 5, fatG: 1.0, fiberG: 0, sugarG: 4.8, sodiumMg: 44, baseGram: 100 },
  { name: "Oatmeal Kering", kcal: 389, proteinG: 16.9, carbsG: 66, fatG: 6.9, fiberG: 10.6, sugarG: 1.0, sodiumMg: 2, baseGram: 100 },
  { name: "Kacang Almond Panggang", kcal: 579, proteinG: 21, carbsG: 22, fatG: 49, fiberG: 12.5, sugarG: 4.3, sodiumMg: 1, baseGram: 100 },
];

function MacroBar({
  pct,
  loggedPct,
  color,
  isOver,
}: {
  pct: number;
  loggedPct: number;
  color: string;
  isOver: boolean;
}) {
  const [targetW, setTargetW] = useState(0);
  const [loggedW, setLoggedW] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setTargetW(Math.min(pct, 100));
      setLoggedW(Math.min(loggedPct, 100));
    }, 80);
    return () => clearTimeout(t);
  }, [pct, loggedPct]);

  const loggedColor = isOver
    ? "#FF4500"
    : loggedPct >= 90
    ? "#CCFF00"
    : color;

  return (
    <div className="relative h-2.5 rounded-full bg-base-border/80 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full opacity-20 transition-all duration-1000 ease-out"
        style={{ width: `${targetW}%`, backgroundColor: color }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${loggedW}%`, backgroundColor: loggedColor }}
      />
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

  // ── Water Tracker State ──
  const ML_PER_CUP = 250;
  const [cupsLogged, setCupsLogged] = useState(0);
  const [waterBump, setWaterBump] = useState(false);

  const handleAddCup = useCallback(() => {
    setCupsLogged((prev) => prev + 1);
    setWaterBump(true);
    setTimeout(() => setWaterBump(false), 350);
  }, []);

  // ── Quick Log Macro Accumulator State ──
  const [loggedKcal,    setLoggedKcal]    = useState(0);
  const [loggedProtein, setLoggedProtein] = useState(0);
  const [loggedCarbs,   setLoggedCarbs]   = useState(0);
  const [loggedFat,     setLoggedFat]     = useState(0);
  const [loggedFiber,   setLoggedFiber]   = useState(0);
  const [loggedSugar,   setLoggedSugar]   = useState(0);
  const [loggedSodium,  setLoggedSodium]  = useState(0);

  const [loggedMeals,   setLoggedMeals]   = useState<Set<string>>(new Set());
  const [recentLogs,    setRecentLogs]    = useState<any[]>([]);

  // Search Food DB state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Portion Modal state
  const [activePortionFood, setActivePortionFood] = useState<any | null>(null);
  const [foodGramInput, setFoodGramInput] = useState<number>(100);

  // Custom Food Form State
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodKcal, setCustomFoodKcal] = useState("");
  const [customFoodP, setCustomFoodP] = useState("");
  const [customFoodC, setCustomFoodC] = useState("");
  const [customFoodF, setCustomFoodF] = useState("");

  // Search logic trigger
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(query));
    setSearchResults(filtered);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogMeal = useCallback((meal: MealSuggestion) => {
    // Open portion modal for meal suggestions as well (converted as standard DB format)
    setActivePortionFood({
      name: meal.name,
      kcal: meal.kcal,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      baseGram: 100
    });
    setFoodGramInput(100);
  }, []);

  const handleOpenPortionModal = (food: any) => {
    setActivePortionFood(food);
    setFoodGramInput(100);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleLogWithPortion = () => {
    if (!activePortionFood) return;
    
    const factor = foodGramInput / activePortionFood.baseGram;
    const scaledKcal = Math.round(activePortionFood.kcal * factor);
    const scaledP = Math.round(activePortionFood.proteinG * factor * 10) / 10;
    const scaledC = Math.round(activePortionFood.carbsG * factor * 10) / 10;
    const scaledF = Math.round(activePortionFood.fatG * factor * 10) / 10;
    const scaledFiber = Math.round((activePortionFood.fiberG || 0) * factor * 10) / 10;
    const scaledSugar = Math.round((activePortionFood.sugarG || 0) * factor * 10) / 10;
    const scaledSodium = Math.round((activePortionFood.sodiumMg || 0) * factor);

    setLoggedKcal   ((p) => p + scaledKcal);
    setLoggedProtein((p) => p + scaledP);
    setLoggedCarbs  ((p) => p + scaledC);
    setLoggedFat    ((p) => p + scaledF);
    setLoggedFiber  ((p) => p + scaledFiber);
    setLoggedSugar  ((p) => p + scaledSugar);
    setLoggedSodium ((p) => p + scaledSodium);
    
    setLoggedMeals((p) => new Set([...p, activePortionFood.name]));
    
    setRecentLogs(prev => [
      { name: `${activePortionFood.name} (${foodGramInput}g)`, kcal: scaledKcal, p: scaledP, c: scaledC, f: scaledF },
      ...prev
    ]);

    setActivePortionFood(null);
  };

  const handleLogCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;

    const kcal = Number(customFoodKcal) || 0;
    const protein = Number(customFoodP) || 0;
    const carbs = Number(customFoodC) || 0;
    const fat = Number(customFoodF) || 0;

    setLoggedKcal   ((p) => p + kcal);
    setLoggedProtein((p) => p + protein);
    setLoggedCarbs  ((p) => p + carbs);
    setLoggedFat    ((p) => p + fat);
    
    setRecentLogs(prev => [
      { name: customFoodName.trim(), kcal, p: protein, c: carbs, f: fat },
      ...prev
    ]);

    setCustomFoodName("");
    setCustomFoodKcal("");
    setCustomFoodP("");
    setCustomFoodC("");
    setCustomFoodF("");
    setShowCustomFoodForm(false);
  };

  const handleRemoveLog = (index: number) => {
    const target = recentLogs[index];
    if (!target) return;
    
    setLoggedKcal   ((p) => Math.max(0, p - target.kcal));
    setLoggedProtein((p) => Math.max(0, p - target.p));
    setLoggedCarbs  ((p) => Math.max(0, p - target.c));
    setLoggedFat    ((p) => Math.max(0, p - target.f));
    
    const updatedMeals = new Set(loggedMeals);
    // strip the trailing weight suffix to match suggestions if necessary
    const rawName = target.name.split(" (")[0];
    updatedMeals.delete(rawName);
    setLoggedMeals(updatedMeals);

    setRecentLogs(prev => prev.filter((_, i) => i !== index));
  };

  if (!profile || !macros) return null;

  const meals       = MEALS_BY_GOAL[profile.goal] || [];
  const waterLiters = (profile.weightKg * 0.033).toFixed(1);
  const targetCups  = Math.round(Number(waterLiters) * 4);
  const waterMlLogged  = cupsLogged * ML_PER_CUP;
  const waterLitresLog = (waterMlLogged / 1000).toFixed(2);
  const waterPct    = Math.min((cupsLogged / targetCups) * 100, 100);

  const loggedProteinKcal = loggedProtein * 4;
  const loggedCarbsKcal   = loggedCarbs   * 4;
  const loggedFatKcal     = loggedFat     * 9;

  const macroRows = [
    {
      label: "Protein", grams: macros.proteinG, kcal: macros.proteinKcal, color: "#CCFF00",
      loggedG: Math.round(loggedProtein), loggedKcal: loggedProteinKcal,
    },
    {
      label: "Carbs", grams: macros.carbsG, kcal: macros.carbsKcal, color: "#FF8C00",
      loggedG: Math.round(loggedCarbs), loggedKcal: loggedCarbsKcal,
    },
    {
      label: "Fat", grams: macros.fatG, kcal: macros.fatKcal, color: "#A78BFA",
      loggedG: Math.round(loggedFat), loggedKcal: loggedFatKcal,
    },
  ];

  const kcalPct    = macros.calorieTarget > 0 ? Math.round((loggedKcal / macros.calorieTarget) * 100) : 0;
  const isOverKcal = loggedKcal > macros.calorieTarget;
  const remainingKcal = Math.max(0, macros.calorieTarget - loggedKcal);

  // Scaled live values for Portion Modal
  const liveScaledKcal = activePortionFood
    ? Math.round(activePortionFood.kcal * (foodGramInput / activePortionFood.baseGram))
    : 0;
  const liveScaledP = activePortionFood
    ? Math.round(activePortionFood.proteinG * (foodGramInput / activePortionFood.baseGram) * 10) / 10
    : 0;
  const liveScaledC = activePortionFood
    ? Math.round(activePortionFood.carbsG * (foodGramInput / activePortionFood.baseGram) * 10) / 10
    : 0;
  const liveScaledF = activePortionFood
    ? Math.round(activePortionFood.fatG * (foodGramInput / activePortionFood.baseGram) * 10) / 10
    : 0;

  return (
    <main className="pt-safe pt-8 pb-6 px-5 max-w-md mx-auto relative">
      {/* ── Header ── */}
      <div className="mb-6 flex justify-between items-end animate-slide-down-fade">
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Fuel The Machine</p>
          <h1 className="heading-brutal text-3xl">
            Nutri<span className="text-gradient-lime">tion</span>
          </h1>
        </div>
        <button
          onClick={() => setShowCustomFoodForm(true)}
          className="h-8 px-3 rounded-lg bg-base-raised/70 border border-base-border/55 flex items-center justify-center text-lime hover:text-white hover:bg-lime/10 transition-all text-[10px] font-bold uppercase tracking-wider active:scale-95"
        >
          <Plus size={11} className="mr-1" /> Custom Food
        </button>
      </div>

      {/* ── Calorie Hero (Remaining Live Calculator) ── */}
      <div className="glass-card p-6 mb-5 flex flex-col items-center text-center relative overflow-hidden shimmer-border animate-stagger-in">
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-lime/12 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-ember/8 blur-3xl" aria-hidden="true" />
        <div className="relative w-full">
          <div className="flex items-center justify-center gap-2 text-lime text-xs font-bold uppercase tracking-widest mb-3">
            <Flame size={14} className="animate-pulse" />
            Live Calorie Counter
          </div>

          <div className="flex justify-around items-center mb-2">
            <div>
              <p className="text-[10px] text-white/30 font-bold uppercase">Target</p>
              <p className="font-display font-black text-lg text-white/80">{macros.calorieTarget}</p>
            </div>
            <div className="h-8 w-px bg-base-border/50" />
            <div>
              <p className="text-[10px] text-white/30 font-bold uppercase">Makanan</p>
              <p className="font-display font-black text-xl text-white">{loggedKcal}</p>
            </div>
            <div className="h-8 w-px bg-base-border/50" />
            <div>
              <p className="text-[10px] text-lime font-bold uppercase">Sisa</p>
              <p className="font-display font-black text-2xl text-lime leading-none">{remainingKcal}</p>
            </div>
          </div>

          <div className="w-full mt-3">
            <div className="h-2 rounded-full bg-base-border/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(kcalPct, 100)}%`,
                  backgroundColor: isOverKcal ? "#FF4500" : "#CCFF00",
                }}
              />
            </div>
            {isOverKcal && (
              <p className="text-ember text-[10px] mt-1.5 font-bold animate-pulse">⚠ Melebihi target harian sebanyak {loggedKcal - macros.calorieTarget} kcal!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Food Search Database widget ── */}
      <div className="glass-card p-4.5 mb-5 relative animate-stagger-in" ref={dropdownRef}>
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-1.5">
          <Search size={14} className="text-lime" /> Cari & Log Makanan
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nasi putih, dada ayam, tempe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-base-border/75 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-12 z-30 bg-base-card border border-base-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-h-56 overflow-y-auto scrollbar-none divide-y divide-white/5 animate-scale-in">
              {searchResults.length > 0 ? (
                searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOpenPortionModal(food)}
                    className="w-full text-left p-3.5 hover:bg-lime/5 transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-white/90">{food.name}</p>
                      <p className="text-white/45 text-[10px] mt-0.5">P {food.proteinG}g &middot; C {food.carbsG}g &middot; F {food.fatG}g (per {food.baseGram}g)</p>
                    </div>
                    <span className="font-display font-black text-lime">{food.kcal} Kcal +</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-white/35 text-xs mb-2">Tidak ditemukan di database.</p>
                  <button
                    onClick={() => {
                      setCustomFoodName(searchQuery);
                      setShowCustomFoodForm(true);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-lime bg-lime/10 px-3 py-1.5 rounded-lg border border-lime/20"
                  >
                    + Buat Makanan Kustom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Water Tracker (Interactive) ── */}
      <div className="glass-card p-4 mb-5 animate-stagger-in">
        <div className="flex items-center gap-4">
          <div
            className={`h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 ${waterBump ? "scale-125" : "scale-100"}`}
          >
            <Droplets size={18} className={`transition-colors duration-300 ${waterPct >= 100 ? "text-lime" : "text-blue-400"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-white/35 mb-0.5">Daily Water</p>
            <p
              className={`font-display font-extrabold text-lg transition-all duration-200 ${waterBump ? "scale-110 text-blue-300" : "scale-100"}`}
              style={{ display: "inline-block", transformOrigin: "left center" }}
            >
              {cupsLogged > 0 ? `${waterLitresLog}` : waterLiters}{" "}
              <span className="text-white/40 text-sm font-normal">
                litres {cupsLogged > 0 ? `(${cupsLogged}/${targetCups} cups)` : ""}
              </span>
            </p>
          </div>
          <button
            onClick={handleAddCup}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all duration-150 active:scale-95 ${
              waterPct >= 100
                ? "bg-lime/15 text-lime border-lime/25"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
            }`}
          >
            <Plus size={12} />
            {waterPct >= 100 ? "Done!" : "+1 Cup"}
          </button>
        </div>

        {cupsLogged > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-base-border/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${waterPct}%`,
                  backgroundColor: waterPct >= 100 ? "#CCFF00" : "#3B82F6",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Macro Breakdown (Reactive) ── */}
      <div className="glass-card p-5 mb-5 animate-stagger-in">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">Macro Targets</p>
        <div className="space-y-4">
          {macroRows.map((row) => {
            const targetPct = Math.round((row.kcal / macros.calorieTarget) * 100);
            const loggedPct = macros.calorieTarget > 0
              ? Math.round((row.loggedKcal / macros.calorieTarget) * 100)
              : 0;
            const isOver    = row.loggedG > row.grams;
            const nearTarget = !isOver && row.loggedG > 0 && (row.loggedG / row.grams) >= 0.9;

            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-display font-bold uppercase tracking-wide">{row.label}</span>
                  </div>
                  <span className="text-white/60 text-xs">
                    {row.loggedG > 0 ? (
                      <span className={isOver ? "text-ember font-bold" : nearTarget ? "text-lime font-bold" : ""}>
                        {row.loggedG}g logged /&nbsp;
                      </span>
                    ) : null}
                    {row.grams}g{" "}
                    <span className="text-white/25">&middot; {targetPct}%</span>
                    {isOver && <span className="text-ember text-[10px] ml-1">↑ Over</span>}
                    {nearTarget && <span className="text-lime text-[10px] ml-1">✓ Near</span>}
                  </span>
                </div>
                <MacroBar
                  pct={targetPct}
                  loggedPct={loggedPct}
                  color={row.color}
                  isOver={isOver}
                />
              </div>
            );
          })}
        </div>

        {/* Micronutrients checklist (Fiber, Sugar, Sodium) */}
        <div className="mt-5 pt-4 border-t border-base-border/30 grid grid-cols-3 gap-2.5">
          <div className="bg-base-raised/35 p-2 rounded-xl text-center">
            <span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Fiber (Serat)</span>
            <span className="text-xs font-black text-lime">{loggedFiber.toFixed(1)} g</span>
          </div>
          <div className="bg-base-raised/35 p-2 rounded-xl text-center">
            <span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Sugar (Gula)</span>
            <span className="text-xs font-black text-amber-400">{loggedSugar.toFixed(1)} g</span>
          </div>
          <div className="bg-base-raised/35 p-2 rounded-xl text-center">
            <span className="text-[9px] text-white/35 font-bold uppercase block mb-0.5">Sodium (Garam)</span>
            <span className="text-xs font-black text-indigo-300">{loggedSodium} mg</span>
          </div>
        </div>
      </div>

      {/* ── Live logged meals history logger ── */}
      {recentLogs.length > 0 && (
        <div className="glass-card p-4.5 mb-5 animate-stagger-in">
          <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-1.5">
            <History size={13} className="text-lime" /> Makanan Hari Ini ({recentLogs.length})
          </p>
          <div className="space-y-2.5 max-h-44 overflow-y-auto scrollbar-none pr-1">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-base-raised/40 border border-base-border/50 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{log.name}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">P {log.p}g &middot; C {log.c}g &middot; F {log.f}g</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lime">{log.kcal} kcal</span>
                  <button onClick={() => handleRemoveLog(idx)} className="text-ember hover:text-red-400 p-1 active:scale-90 transition-transform">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Meal Suggestions with Quick Log ── */}
      <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">
        Rekomendasi Makanan &middot;{" "}
        {profile.goal === "cutting" ? "Cutting" : profile.goal === "bulking" ? "Bulking" : profile.goal === "powerlifting" ? "Powerlifting" : "Maintenance"}
      </p>

      <div className="space-y-3">
        {meals.map((meal, idx) => {
          const isLogged = loggedMeals.has(meal.name);

          return (
            <div
              key={meal.name}
              className={`glass-card p-4 transition-colors duration-200 animate-stagger-in ${
                isLogged ? "border-lime/20 bg-lime/3" : "hover:border-white/10"
              }`}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${TAG_META[meal.tag]?.color || "text-white"}`}>
                  {TAG_META[meal.tag]?.icon || <Utensils size={14} />}
                  {TAG_META[meal.tag]?.label || meal.tag}
                </div>
                <span className="chip bg-lime/12 text-lime shrink-0 border border-lime/15">{meal.kcal} kcal</span>
              </div>

              <p className="font-display font-bold uppercase tracking-wide text-sm mb-1">{meal.name}</p>
              <p className="text-white/45 text-sm mb-3 leading-relaxed">{meal.description}</p>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">P {meal.proteinG}g</span>
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">C {meal.carbsG}g</span>
                  <span className="chip bg-base-raised text-white/55 border border-base-border/40 text-[10px]">F {meal.fatG}g</span>
                </div>

                <button
                  onClick={() => handleLogMeal(meal)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200 active:scale-95 shrink-0 bg-white/5 text-white/70 border-white/10 hover:bg-lime/10 hover:text-lime hover:border-lime/20"
                >
                  <Plus size={11} /> Makan Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Portion Customizer Modal ── */}
      {activePortionFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setActivePortionFood(null)} />
          <div className="relative w-full max-w-sm bg-base-card border border-base-border rounded-[2.5rem] p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-xs text-lime flex items-center gap-1.5">
                <Scale size={14} /> Tentukan Porsi Makanan
              </h3>
              <button onClick={() => setActivePortionFood(null)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-base-raised/30 border border-base-border/50 p-4 rounded-2xl mb-4 text-center">
              <p className="font-display font-bold text-base text-white uppercase mb-1">{activePortionFood.name}</p>
              <p className="text-white/40 text-[10px]">Nutrisi per {activePortionFood.baseGram}g: P {activePortionFood.proteinG}g &middot; C {activePortionFood.carbsG}g &middot; F {activePortionFood.fatG}g</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-white/40 mb-2 text-center">Berapa gram yang Anda makan?</label>
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="number"
                    value={foodGramInput || ""}
                    onChange={(e) => setFoodGramInput(Number(e.target.value))}
                    className="w-24 bg-black/50 border-2 border-lime/45 rounded-xl py-2 px-3 text-center text-lg font-black text-lime focus:outline-none"
                    min={1}
                    max={2000}
                  />
                  <span className="text-white/60 font-bold text-sm">gram</span>
                </div>
              </div>

              {/* Dynamic Live Nutrients Indicator */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-base-border/30">
                <div className="text-center bg-base-raised/40 p-2 rounded-xl">
                  <span className="text-[8px] text-white/30 font-bold block mb-0.5">KALORI</span>
                  <span className="text-xs font-black text-white">{liveScaledKcal} kcal</span>
                </div>
                <div className="text-center bg-base-raised/40 p-2 rounded-xl">
                  <span className="text-[8px] text-white/30 font-bold block mb-0.5">PROTEIN</span>
                  <span className="text-xs font-black text-lime">{liveScaledP} g</span>
                </div>
                <div className="text-center bg-base-raised/40 p-2 rounded-xl">
                  <span className="text-[8px] text-white/30 font-bold block mb-0.5">CARBS</span>
                  <span className="text-xs font-black text-amber-400">{liveScaledC} g</span>
                </div>
                <div className="text-center bg-base-raised/40 p-2 rounded-xl">
                  <span className="text-[8px] text-white/30 font-bold block mb-0.5">FAT</span>
                  <span className="text-xs font-black text-indigo-300">{liveScaledF} g</span>
                </div>
              </div>

              <button
                onClick={handleLogWithPortion}
                className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(204,255,0,0.2)]"
              >
                Log Makanan ({foodGramInput}g)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Food Form Modal ── */}
      {showCustomFoodForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCustomFoodForm(false)} />
          <div className="relative w-full max-w-sm bg-base-card border border-base-border rounded-[2rem] p-5 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold uppercase tracking-wide text-xs text-lime flex items-center gap-1">
                <Utensils size={14} /> Log Makanan Kustom Anda
              </h3>
              <button onClick={() => setShowCustomFoodForm(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLogCustomFood} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Nama Makanan / Minuman</label>
                <input
                  type="text"
                  placeholder="Contoh: Ayam Geprek Sambal Korek"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Kalori (kcal)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 450"
                    value={customFoodKcal}
                    onChange={(e) => setCustomFoodKcal(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 25"
                    value={customFoodP}
                    onChange={(e) => setCustomFoodP(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Karbohidrat (g)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 40"
                    value={customFoodC}
                    onChange={(e) => setCustomFoodC(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-white/40 mb-1">Lemak (g)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 12"
                    value={customFoodF}
                    onChange={(e) => setCustomFoodF(e.target.value)}
                    className="w-full bg-black/40 border border-base-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-lime/45"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Catat Makanan Ini
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Branding footer ── */}
      <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-base-border/30">
        <Dumbbell size={12} className="text-lime/40" />
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">
          Made by <span className="text-lime/50">Yossika</span> from Sokaraja
        </p>
        <Dumbbell size={12} className="text-lime/40" />
      </div>
    </main>
  );
}
