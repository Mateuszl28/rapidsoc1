import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sentinel AI — Autonomous SOC",
    short_name: "Sentinel AI",
    description:
      "AI-powered Security Operations Center with real-time threat detection, multi-agent triage, and one-click remediation.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a14",
    theme_color: "#050a14",
    categories: ["security", "monitoring", "developer-tools"],
  };
}
