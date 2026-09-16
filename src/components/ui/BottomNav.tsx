"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Dumbbell, UtensilsCrossed, LineChart, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 pb-safe lg:hidden"
        aria-label="Primary navigation"
      >
        <div className="mx-4 mb-3 rounded-3xl bg-base-card/80 backdrop-blur-[20px] border border-base-border/80 shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
          <div className="mx-auto max-w-md flex items-stretch">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] relative active:scale-95 transition-transform duration-100 touch-manipulation"
                >
                  {/* Active background glow pill */}
                  {active && (
                    <span className="absolute inset-x-3 inset-y-1.5 rounded-2xl bg-lime/10 border border-lime/15 animate-scale-in" />
                  )}

                  {/* Icon with conditional glow */}
                  <span className="relative flex items-center justify-center min-h-[24px]">
                    <Icon
                      size={24}
                      className={`relative z-10 transition-all duration-200 ${
                        active ? "text-lime drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]" : "text-white/40"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {/* Glow ring under active icon */}
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-lime/20 blur-md animate-glow-pulse-lime scale-150" />
                    )}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide relative z-10 transition-colors duration-200 ${
                      active ? "text-lime" : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Nav */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 sticky top-0 h-screen border-r border-base-border/50 bg-base/30 backdrop-blur-[20px] z-40 py-8 px-4">
        <div className="mb-12 flex items-center px-4">
          <div className="h-10 w-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center animate-glow-pulse-lime">
            <Dumbbell size={20} className="text-lime" />
          </div>
          <span className="ml-3 font-display font-bold text-xl tracking-wide uppercase">Gym Planner</span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl press-effect min-h-[44px] transition-all duration-200 ${
                  active ? "bg-lime/10 text-lime border border-lime/20 shadow-sm" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="relative flex items-center justify-center">
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]" : ""} />
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-lime/20 blur-md scale-150" />
                  )}
                </span>
                <span className="font-bold uppercase tracking-wide text-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
