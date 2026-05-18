import { ASSETS } from "./mock-data";
import type { Asset, Severity } from "./types";

// Extra fields for the inventory view; we synthesize from the asset.
export interface AssetMeta {
  cves: number;             // open CVEs
  edrCovered: boolean;
  patchAgeDays: number;
  lastSeen: number;
  exposure: "public" | "internal" | "isolated";
  team: string;
  riskTrend: number[];      // 14-day sparkline 0-100
}

const TEAMS = ["finance-ops", "platform", "secops", "people-ops", "exec", "data-eng", "infra"];

function pseudo(seed: string, max: number, salt = 0): number {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % max;
}

export function inventoryAsset(a: Asset): AssetMeta {
  const cves =
    a.criticality === "critical" ? 4 + pseudo(a.id, 5, 1)
    : a.criticality === "high"    ? 1 + pseudo(a.id, 4, 2)
    :                                 pseudo(a.id, 3, 3);
  const edrCovered = a.os !== "linux" || a.hostname.startsWith("win") || pseudo(a.id, 100, 5) > 35;
  const patchAgeDays = 1 + pseudo(a.id, 60, 7);
  const lastSeen = Date.now() - pseudo(a.id, 1000 * 60 * 30, 11);
  const exposure: AssetMeta["exposure"] =
    a.hostname.includes("edge") || a.hostname.includes("github") ? "public"
    : a.hostname.includes("isolated") ? "isolated"
    : "internal";
  const team = TEAMS[pseudo(a.id, TEAMS.length, 13)];
  // Build a 14-day trend that ends at the asset's current riskScore
  const trend: number[] = [];
  let cur = Math.max(10, a.riskScore - pseudo(a.id, 25, 17));
  for (let i = 0; i < 14; i++) {
    const drift = pseudo(a.id + i, 11, i) - 5;
    cur = Math.max(5, Math.min(99, cur + drift));
    trend.push(cur);
  }
  trend[trend.length - 1] = a.riskScore;
  return { cves, edrCovered, patchAgeDays, lastSeen, exposure, team, riskTrend: trend };
}

export function findAssetByHostname(hostname: string): Asset | undefined {
  return ASSETS.find((a) => a.hostname === hostname);
}

export function inventoryAll(): { asset: Asset; meta: AssetMeta }[] {
  return ASSETS.map((a) => ({ asset: a, meta: inventoryAsset(a) }));
}

// Synthetic per-asset event/risk timeline for the drill-down chart
export function assetRiskSeries(a: Asset): { t: number; score: number; events: number }[] {
  const meta = inventoryAsset(a);
  return meta.riskTrend.map((s, i) => {
    const t = Date.now() - (meta.riskTrend.length - 1 - i) * 1000 * 60 * 60 * 24;
    return {
      t,
      score: s,
      events: pseudo(a.id + "e" + i, 28, i),
    };
  });
}

export function assetNeighbors(a: Asset): { hostname: string; reason: string; severity: Severity }[] {
  // For demo realism, pick neighbors deterministically
  const others = ASSETS.filter((x) => x.hostname !== a.hostname);
  return others.slice(0, 5).map((n, i) => ({
    hostname: n.hostname,
    reason: ["recent RDP session", "SMB share access", "shared subnet", "common SSO admin", "CI dependency"][i],
    severity: (["low", "medium", "high", "info", "medium"] as Severity[])[i],
  }));
}
