import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import { ToastProvider } from "@/components/ui/Toast";
import SafariInstallBanner from "@/components/ui/SafariInstallBanner";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ProfileProvider } from "@/lib/useProfile";

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
    <html lang="en" className={`${interBody.variable} ${interTightDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const style = localStorage.getItem('gym-planner:custom-theme-style');
                  if (style) {
                    document.documentElement.classList.add('theme-' + style);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ToastProvider>
            <ProfileProvider>
              {children}
            </ProfileProvider>
          </ToastProvider>
          <SafariInstallBanner />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
