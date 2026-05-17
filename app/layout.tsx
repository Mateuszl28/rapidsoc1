import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sentinel AI — Autonomous SOC",
  description:
    "AI-powered Security Operations Center. Real-time threat detection, multi-agent triage, and remediation powered by Claude.",
  applicationName: "Sentinel AI",
  keywords: ["SOC", "SIEM", "AI", "cybersecurity", "Claude", "incident response"],
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
      </body>
    </html>
  );
}
