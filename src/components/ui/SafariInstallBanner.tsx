"use client";
import { useState, useEffect } from "react";

export default function SafariInstallBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detect Safari iOS — not already installed as PWA
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    const wasDismissed = localStorage.getItem("gym-planner:safari-banner-dismissed") === "1";

    if (isSafari && isIOS && !isStandalone && !wasDismissed) {
      // Show after 3 seconds
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("gym-planner:safari-banner-dismissed", "1");
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      left: 16,
      right: 16,
      zIndex: 9999,
      background: "linear-gradient(135deg, #1a1a1a, #111)",
      border: "1px solid rgba(204,255,0,0.4)",
      borderRadius: 16,
      padding: "16px 18px",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      animation: "slideUp 0.4s ease",
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, overflow: "hidden",
        flexShrink: 0, background: "#CCFF00", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22 }}>💪</span>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>
          Install YosFit AI ke Home Screen
        </p>
        <p style={{ color: "#aaa", fontSize: 12, margin: "4px 0 0", lineHeight: 1.5 }}>
          Ketuk <strong style={{ color: "#CCFF00" }}>
            <svg width="12" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", marginBottom: -2 }}>
              <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
            </svg>
          </strong> lalu pilih <strong style={{ color: "#CCFF00" }}>&ldquo;Add to Home Screen&rdquo;</strong> agar data tersimpan permanen.
        </p>
      </div>

      {/* Close */}
      <button
        onClick={dismiss}
        style={{
          background: "none", border: "none", color: "#666",
          fontSize: 20, cursor: "pointer", padding: 0, flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
