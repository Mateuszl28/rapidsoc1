"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inventoryAll } from "@/lib/inventory";
import type { Severity } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  Server,
  ShieldAlert,
  XCircle,
} from "lucide-react";

const CRIT_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const OS_GLYPH: Record<string, string> = {
  windows: "🪟",
  linux: "🐧",
  macos: "🍎",
  cloud: "☁️",
};

export default function AssetsPage() {
  const all = useMemo(() => inventoryAll(), []);
  const [search, setSearch] = useState("");
  const [osFilter, setOsFilter] = useState<"all" | "windows" | "linux" | "macos" | "cloud">("all");
  const [critFilter, setCritFilter] = useState<"all" | Severity>("all");
  const [exposureFilter, setExposureFilter] = useState<"all" | "public" | "internal" | "isolated">("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(({ asset, meta }) => {
      if (osFilter !== "all" && asset.os !== osFilter) return false;
      if (critFilter !== "all" && asset.criticality !== critFilter) return false;
      if (exposureFilter !== "all" && meta.exposure !== exposureFilter) return false;
      if (!q) return true;
      return [asset.hostname, asset.ip, asset.owner, meta.team].join(" ").toLowerCase().includes(q);
    });
  }, [all, search, osFilter, critFilter, exposureFilter]);

  const kpis = {
    total: all.length,
    critical: all.filter((x) => x.asset.criticality === "critical").length,
    edrMissing: all.filter((x) => !x.meta.edrCovered).length,
    public: all.filter((x) => x.meta.exposure === "public").length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-1">
              <Link href="/" className="hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> overview
              </Link>
              <span className="text-border">/</span>
              <span className="text-foreground">assets</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Asset inventory</h1>
            <p className="text-sm text-muted-foreground">
              Hosts, identities, and cloud resources visible to Sentinel. Click a host for the drill-down view.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Total assets" value={kpis.total} icon={<Server className="h-4 w-4" />} accent="text-neon-cyan" />
            <KPI label="Crown jewels" value={kpis.critical} icon={<ShieldAlert className="h-4 w-4" />} accent="text-severity-critical" />
            <KPI label="EDR missing"  value={kpis.edrMissing} icon={<XCircle className="h-4 w-4" />} accent="text-severity-high" />
            <KPI label="Public-facing" value={kpis.public} icon={<CheckCircle2 className="h-4 w-4" />} accent="text-neon-purple" />
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search hostname, IP, owner, team…"
                    className="w-full h-8 pl-8 pr-3 rounded-md bg-muted/40 border border-border/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <FilterChips<"all" | "windows" | "linux" | "macos" | "cloud">
                  label="OS" value={osFilter} onChange={setOsFilter}
                  options={["all", "windows", "linux", "macos", "cloud"]} />
                <FilterChips<"all" | Severity>
                  label="Crit" value={critFilter} onChange={setCritFilter}
                  options={["all", "critical", "high", "medium", "low"]} />
                <FilterChips<"all" | "public" | "internal" | "isolated">
                  label="Exposure" value={exposureFilter} onChange={setExposureFilter}
                  options={["all", "public", "internal", "isolated"]} />
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                  onClick={() => { setSearch(""); setOsFilter("all"); setCritFilter("all"); setExposureFilter("all"); }}>
                  Clear
                </Button>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {rows.length} of {all.length} assets
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                      <th className="text-left px-3 py-2 font-medium">Host</th>
                      <th className="text-left px-3 py-2 font-medium">OS</th>
                      <th className="text-left px-3 py-2 font-medium">IP</th>
                      <th className="text-left px-3 py-2 font-medium">Owner</th>
                      <th className="text-left px-3 py-2 font-medium">Team</th>
                      <th className="text-left px-3 py-2 font-medium">Crit</th>
                      <th className="text-left px-3 py-2 font-medium">Exposure</th>
                      <th className="text-left px-3 py-2 font-medium">EDR</th>
                      <th className="text-right px-3 py-2 font-medium">CVEs</th>
                      <th className="text-right px-3 py-2 font-medium">Patch (d)</th>
                      <th className="text-right px-3 py-2 font-medium">Risk</th>
                      <th className="text-left px-3 py-2 font-medium">14d</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ asset, meta }) => (
                      <tr key={asset.id} className="border-t border-border/40 hover:bg-accent/30">
                        <td className="px-3 py-2 font-mono">{asset.hostname}</td>
                        <td className="px-3 py-2 text-muted-foreground">{OS_GLYPH[asset.os]} {asset.os}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{asset.ip}</td>
                        <td className="px-3 py-2 text-muted-foreground">{asset.owner}</td>
                        <td className="px-3 py-2 text-muted-foreground">{meta.team}</td>
                        <td className="px-3 py-2"><Badge variant={CRIT_VARIANT[asset.criticality]}>{asset.criticality}</Badge></td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "text-[10px] uppercase tracking-wider",
                            meta.exposure === "public"   && "text-severity-high",
                            meta.exposure === "isolated" && "text-neon-green",
                            meta.exposure === "internal" && "text-muted-foreground",
                          )}>
                            {meta.exposure}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {meta.edrCovered
                            ? <span className="text-neon-green inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />on</span>
                            : <span className="text-severity-critical inline-flex items-center gap-1"><XCircle className="h-3 w-3" />off</span>}
                        </td>
                        <td className="px-3 py-2 text-right">{meta.cves}</td>
                        <td className="px-3 py-2 text-right">{meta.patchAgeDays}</td>
                        <td className={cn(
                          "px-3 py-2 text-right font-mono font-semibold",
                          asset.riskScore >= 80 ? "text-severity-critical" : asset.riskScore >= 60 ? "text-severity-high" : "text-foreground/80"
                        )}>{asset.riskScore}</td>
                        <td className="px-3 py-2"><Sparkline points={meta.riskTrend} /></td>
                        <td className="px-3 py-2 text-right">
                          <Link href={`/assets/${encodeURIComponent(asset.hostname)}`}
                                className="text-[10px] uppercase tracking-wider text-neon-cyan hover:underline">
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr><td colSpan={13} className="px-3 py-10 text-center text-muted-foreground">No assets match.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-muted-foreground px-3 py-2 border-t border-border/40 font-mono">
                Last sync: {formatRelativeTime(Date.now() - 1000 * 60 * 2)} · agent build 2.18.4
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const w = 70, h = 18;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="text-neon-cyan">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function KPI({
  icon, label, value, accent,
}: {
  icon: React.ReactNode; label: string; value: number; accent: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold font-mono">{value}</div>
        </div>
        <div className={cn("rounded-md p-1.5 bg-muted/40", accent)}>{icon}</div>
      </div>
    </Card>
  );
}

function FilterChips<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded",
            value === o
              ? "bg-accent text-foreground border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
