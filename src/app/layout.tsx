import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import { ToastProvider } from "@/components/ui/Toast";

const interBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const interTightDisplay = Inter_Tight({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gym Planner — Sculpt Your Body, Elevate Your Spirit",
  description:
    "A fully local, no-signup gym workout and nutrition planner. Generates your 7-day split and macro targets instantly, with all data saved on your device.",
  manifest: "/manifest.json",
  applicationName: "GymPlanner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GymPlanner",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0B0F",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interBody.variable} ${interTightDisplay.variable}`}>
      <body className="font-body antialiased min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
