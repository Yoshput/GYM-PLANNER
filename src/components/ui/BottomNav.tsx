"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Dumbbell, UtensilsCrossed, LineChart } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/progress", label: "Progress", icon: LineChart },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      aria-label="Primary navigation"
    >
      {/* Glassmorphism bar */}
      <div className="mx-4 mb-3 rounded-2xl bg-base-card/80 backdrop-blur-xl border border-base-border/80 shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
        <div className="mx-auto max-w-md flex items-stretch">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] relative active:scale-95 transition-transform duration-100"
              >
                {/* Active background glow pill */}
                {active && (
                  <span className="absolute inset-x-3 inset-y-1.5 rounded-xl bg-lime/10 border border-lime/15 animate-scale-in" />
                )}

                {/* Icon with conditional glow */}
                <span className="relative flex items-center justify-center">
                  <Icon
                    size={22}
                    className={`relative z-10 transition-all duration-200 ${
                      active ? "text-lime drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]" : "text-white/35"
                    }`}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {/* Glow ring under active icon */}
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-lime/20 blur-md animate-glow-pulse-lime scale-150" />
                  )}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wide relative z-10 transition-colors duration-200 ${
                    active ? "text-lime" : "text-white/35"
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
  );
}
