"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Flame, Coffee, Sun, Moon, Apple, Dumbbell, Droplets, Plus, Check, TrendingUp, Search, Utensils, Heart, History, Trash2 } from "lucide-react";
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

// Mock Food Database for Indonesian & Fitness Foods
const FOOD_DATABASE = [
  { name: "Nasi Putih (1 Piring / 150g)", kcal: 200, proteinG: 4, carbsG: 45, fatG: 0.5, fiberG: 1, sugarG: 0.1, sodiumMg: 2 },
  { name: "Dada Ayam Panggang (100g)", kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fiberG: 0, sugarG: 0, sodiumMg: 74 },
  { name: "Tempe Bacem / Panggang (2 Potong / 50g)", kcal: 110, proteinG: 9, carbsG: 8, fatG: 5, fiberG: 3.5, sugarG: 1.2, sodiumMg: 120 },
  { name: "Tahu Goreng / Kukus (2 Potong / 80g)", kcal: 70, proteinG: 7, carbsG: 2.2, fatG: 4, fiberG: 1.2, sugarG: 0.2, sodiumMg: 8 },
  { name: "Telur Rebus Utuh (1 Butir)", kcal: 78, proteinG: 6.5, carbsG: 0.6, fatG: 5.3, fiberG: 0, sugarG: 0.2, sodiumMg: 62 },
  { name: "Whey Protein Shake (1 Scoop)", kcal: 120, proteinG: 24, carbsG: 3, fatG: 1.5, fiberG: 0, sugarG: 1, sodiumMg: 50 },
  { name: "Pisang Ambon (1 Buah)", kcal: 105, proteinG: 1.3, carbsG: 27, fatG: 0.3, fiberG: 3, sugarG: 14, sodiumMg: 1 },
  { name: "Susu Low Fat (250ml)", kcal: 110, proteinG: 8, carbsG: 12, fatG: 2.5, fiberG: 0, sugarG: 11, sodiumMg: 115 },
  { name: "Oatmeal Instan (50g)", kcal: 190, proteinG: 7, carbsG: 33, fatG: 3.5, fiberG: 5, sugarG: 0.5, sodiumMg: 1 },
  { name: "Almond Panggang (1 Genggam / 28g)", kcal: 164, proteinG: 6, carbsG: 6, fatG: 14, fiberG: 3.5, sugarG: 1.2, sodiumMg: 1 },
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

  // Search logic trigger
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(query));
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleLogMeal = useCallback((meal: MealSuggestion) => {
    if (loggedMeals.has(meal.name)) return; // prevent duplicate clicks on suggestions
    setLoggedKcal   ((p) => p + meal.kcal);
    setLoggedProtein((p) => p + meal.proteinG);
    setLoggedCarbs  ((p) => p + meal.carbsG);
    setLoggedFat    ((p) => p + meal.fatG);
    setLoggedMeals  ((p) => new Set([...p, meal.name]));
    
    setRecentLogs(prev => [
      { name: meal.name, kcal: meal.kcal, p: meal.proteinG, c: meal.carbsG, f: meal.fatG },
      ...prev
    ]);
  }, [loggedMeals]);

  const handleLogFromDB = (food: any) => {
    setLoggedKcal   ((p) => p + food.kcal);
    setLoggedProtein((p) => p + food.proteinG);
    setLoggedCarbs  ((p) => p + food.carbsG);
    setLoggedFat    ((p) => p + food.fatG);
    setLoggedFiber  ((p) => p + (food.fiberG || 0));
    setLoggedSugar  ((p) => p + (food.sugarG || 0));
    setLoggedSodium ((p) => p + (food.sodiumMg || 0));
    
    setRecentLogs(prev => [
      { name: food.name, kcal: food.kcal, p: food.proteinG, c: food.carbsG, f: food.fatG },
      ...prev
    ]);

    setSearchQuery("");
  };

  const handleRemoveLog = (index: number) => {
    const target = recentLogs[index];
    if (!target) return;
    
    setLoggedKcal   ((p) => Math.max(0, p - target.kcal));
    setLoggedProtein((p) => Math.max(0, p - target.p));
    setLoggedCarbs  ((p) => Math.max(0, p - target.c));
    setLoggedFat    ((p) => Math.max(0, p - target.f));
    
    // remove from suggestion sets
    const updatedMeals = new Set(loggedMeals);
    updatedMeals.delete(target.name);
    setLoggedMeals(updatedMeals);

    setRecentLogs(prev => prev.filter((_, i) => i !== index));
  };

  if (!profile || !macros) return null;

  const meals       = MEALS_BY_GOAL[profile.goal];
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
      loggedG: loggedProtein, loggedKcal: loggedProteinKcal,
    },
    {
      label: "Carbs", grams: macros.carbsG, kcal: macros.carbsKcal, color: "#FF8C00",
      loggedG: loggedCarbs, loggedKcal: loggedCarbsKcal,
    },
    {
      label: "Fat", grams: macros.fatG, kcal: macros.fatKcal, color: "#A78BFA",
      loggedG: loggedFat, loggedKcal: loggedFatKcal,
    },
  ];

  const kcalPct    = macros.calorieTarget > 0 ? Math.round((loggedKcal / macros.calorieTarget) * 100) : 0;
  const isOverKcal = loggedKcal > macros.calorieTarget;
  const remainingKcal = Math.max(0, macros.calorieTarget - loggedKcal);

  return (
    <main className="pt-safe pt-8 pb-6 px-5 max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="mb-6 animate-slide-down-fade">
        <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Fuel The Machine</p>
        <h1 className="heading-brutal text-3xl">
          Nutri<span className="text-gradient-lime">tion</span>
        </h1>
      </div>

      {/* ── Calorie Hero (Remaining Live Calculator) ── */}
      <div className="glass-card p-6 mb-5 flex flex-col items-center text-center relative overflow-hidden shimmer-border animate-stagger-in stagger-1">
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-lime/12 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-ember/8 blur-3xl" aria-hidden="true" />
        <div className="relative w-full">
          <div className="flex items-center justify-center gap-2 text-lime text-xs font-bold uppercase tracking-widest mb-3">
            <Flame size={14} className="animate-pulse" />
            Live Calorie Counter
          </div>

          {/* Calorie breakdown: Target - Intake = Remaining */}
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

          {/* Live budget bar */}
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
              <p className="text-ember text-[10px] mt-1.5 font-bold">⚠ Melebihi target harian sebanyak {loggedKcal - macros.calorieTarget} kcal!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Food Search Database widget ── */}
      <div className="glass-card p-4.5 mb-5 animate-stagger-in stagger-1">
        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-1.5">
          <Search size={14} className="text-lime" /> Cari & Log Makanan
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nasi putih, dada ayam, tempe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-base-border/75 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-lime/45 transition-colors placeholder-white/20"
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-11 z-20 bg-base-card border border-base-border rounded-xl shadow-xl max-h-52 overflow-y-auto scrollbar-none divide-y divide-white/5">
              {searchResults.length > 0 ? (
                searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLogFromDB(food)}
                    className="w-full text-left p-3 hover:bg-lime/5 transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-white/90">{food.name}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">P {food.proteinG}g &middot; C {food.carbsG}g &middot; F {food.fatG}g</p>
                    </div>
                    <span className="font-display font-black text-lime">{food.kcal} Kcal +</span>
                  </button>
                ))
              ) : (
                <div className="p-3.5 text-center text-white/35 text-xs">
                  Tidak ditemukan. Log makanan kustom?
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Water Tracker (Interactive) ── */}
      <div className="glass-card p-4 mb-5 animate-stagger-in stagger-1">
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
      <div className="glass-card p-5 mb-5 animate-stagger-in stagger-2">
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
          <div className="space-y-2.5 max-h-32 overflow-y-auto scrollbar-none pr-1">
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
        Sample Meals &middot;{" "}
        {profile.goal === "cutting" ? "Cutting" : profile.goal === "bulking" ? "Bulking" : "Maintenance"}
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
                <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${TAG_META[meal.tag].color}`}>
                  {TAG_META[meal.tag].icon}
                  {TAG_META[meal.tag].label}
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
                  disabled={isLogged}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200 active:scale-95 shrink-0 ${
                    isLogged
                      ? "bg-lime/8 text-lime/50 border-lime/15 cursor-default"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-lime/10 hover:text-lime hover:border-lime/20"
                  }`}
                >
                  {isLogged ? (
                    <><Check size={11} /> Dicatat</>
                  ) : (
                    <><Plus size={11} /> Makan Ini</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
