"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────── */
type ToastVariant = "success" | "info" | "error";

interface Toast {
  id: string;
  message: string;
  sub?: string;
  variant: ToastVariant;
  leaving?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, options?: { sub?: string; variant?: ToastVariant }) => void;
}

/* ─── Context ────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ─── Provider ───────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Mark as leaving first (triggers exit animation)
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  const showToast = useCallback(
    (message: string, options?: { sub?: string; variant?: ToastVariant }) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = {
        id,
        message,
        sub: options?.sub,
        variant: options?.variant ?? "success",
      };
      setToasts((prev) => [...prev.slice(-2), toast]); // keep max 3
      const timer = setTimeout(() => removeToast(id), 3000);
      timerRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    const timers = timerRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — above bottom nav (96px) */}
      <div
        className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Single Toast ───────────────────────────────────────────────────── */
const VARIANT_STYLES: Record<ToastVariant, { icon: React.ReactNode; border: string; glow: string }> = {
  success: {
    icon: <CheckCircle2 size={18} className="text-lime shrink-0" />,
    border: "border-lime/30",
    glow: "shadow-[0_0_20px_rgba(204,255,0,0.15)]",
  },
  info: {
    icon: <Info size={18} className="text-white/60 shrink-0" />,
    border: "border-base-border",
    glow: "shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
  },
  error: {
    icon: <AlertCircle size={18} className="text-ember shrink-0" />,
    border: "border-ember/30",
    glow: "shadow-[0_0_20px_rgba(255,69,0,0.15)]",
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const style = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl bg-base-card/95 backdrop-blur-xl border ${style.border} ${style.glow} ${
        toast.leaving ? "animate-toast-out" : "animate-toast-in"
      }`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm text-white">{toast.message}</p>
        {toast.sub && <p className="text-white/50 text-xs mt-0.5">{toast.sub}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 h-6 w-6 flex items-center justify-center rounded-full text-white/30 hover:text-white/60 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
