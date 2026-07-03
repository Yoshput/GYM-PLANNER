"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X, Smartphone, ArrowDown } from "lucide-react";

export default function IosInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;

      // Only show banner on iOS when NOT installed yet, and not closed recently
      const hasClosed = localStorage.getItem("gym-planner:ios-banner-closed") === "true";

      if (isIos && !isStandalone && !hasClosed) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem("gym-planner:ios-banner-closed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up-fade">
      <div className="glass-card p-4 border border-lime/25 shadow-2xl relative bg-base-card/95 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-white/40 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Banner Content */}
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-xl bg-lime/10 border border-lime/25 flex items-center justify-center text-lime shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="space-y-1 pr-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tambahkan ke Layar Utama 📱</h4>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Jadikan aplikasi ini PWA di iPhone Anda agar dapat berjalan lancar tanpa browser:
            </p>
            <ol className="text-[10px] text-white/50 space-y-1 list-decimal list-inside pl-1 pt-1 font-medium">
              <li>
                Ketuk tombol <strong className="text-white inline-flex items-center gap-0.5">Share <Share size={10} className="text-lime inline" /></strong> di bagian bawah Safari.
              </li>
              <li>
                Pilih menu <strong className="text-white">Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
              </li>
              <li>
                Ketuk <strong className="text-white inline-flex items-center gap-0.5">Tambah <Plus size={10} className="text-lime inline" /></strong> di pojok kanan atas.
              </li>
            </ol>
          </div>
        </div>

        {/* Decorative Down Arrow suggesting placement */}
        <div className="flex justify-center mt-2.5 text-lime/40 animate-bounce">
          <ArrowDown size={14} />
        </div>
      </div>
    </div>
  );
}
