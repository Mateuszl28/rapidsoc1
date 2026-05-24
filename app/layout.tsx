import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Notifications } from "@/components/dashboard/notifications";
import { ProductTour } from "@/components/dashboard/tour";
import { ShortcutsHelp } from "@/components/dashboard/shortcuts-help";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://sentinel.acme.io"),
  title: {
    default: "Sentinel AI — Autonomous SOC",
    template: "%s · Sentinel AI",
  },
  description:
    "Your enterprise SOC, on autopilot. Real-time threat detection, kill-chain reconstruction, and AI-generated remediation — multi-agent workflow built with the Vercel AI SDK.",
  applicationName: "Sentinel AI",
  keywords: [
    "SOC", "SIEM", "AI", "cybersecurity", "incident response",
    "threat detection", "remediation", "MITRE ATT&CK", "Next.js",
    "Vercel AI SDK",
  ],
  authors: [{ name: "Sentinel AI" }],
  openGraph: {
    type: "website",
    title: "Sentinel AI — Autonomous SOC",
    description:
      "Real-time threat detection, kill-chain reconstruction, and AI-generated remediation.",
    siteName: "Sentinel AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel AI — Autonomous SOC",
    description:
      "Real-time threat detection, kill-chain reconstruction, and AI-generated remediation.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans relative`}>
        <div className="relative z-10 min-h-screen">{children}</div>
        <CommandPalette />
        <Notifications />
        <ShortcutsHelp />
        <ProductTour />
      </body>
    </html>
  );
}
