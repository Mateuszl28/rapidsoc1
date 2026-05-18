"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assetNeighbors,
  assetRiskSeries,
  findAssetByHostname,
  inventoryAsset,
} from "@/lib/inventory";
import { SEED_EVENTS } from "@/lib/mock-data";
import type { Severity } from "@/lib/types";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Server,
  ShieldAlert,
  Shield,
  XCircle,
} from "lucide-react";

const CRIT_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

function chartTooltipStyle() {
  return {
    background: "hsl(222 30% 7%)",
    border: "1px solid hsl(222 22% 18%)",
    borderRadius: 6,
    fontSize: 11,
    color: "hsl(210 25% 92%)",
  };
}

export default function AssetDetailPage() {
  const params = useParams<{ hostname: string }>();
  const hostname = decodeURIComponent(params.hostname ?? "");

  const asset = useMemo(() => findAssetByHostname(hostname), [hostname]);
  if (!asset) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Asset not found.</div>
              <Link href="/assets" className="text-xs text-neon-cyan underline mt-2 inline-block">
                Back to inventory
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const meta = inventoryAsset(asset);
  const series = assetRiskSeries(asset);
  const neighbors = assetNeighbors(asset);
  const relatedEvents = SEED_EVENTS.filter(
    (e) => e.host === asset.hostname || e.sourceIp === asset.ip
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <Link href="/" className="hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> overview
            </Link>
            <span className="text-border">/</span>
            <Link href="/assets" className="hover:text-foreground">assets</Link>
            <span className="text-border">/</span>
            <span className="text-foreground">{asset.hostname}</span>
          </div>

          {/* Header */}
          <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-4">
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-neon-cyan/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <Server className="h-6 w-6 text-background" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={CRIT_VARIANT[asset.criticality]}>{asset.criticality}</Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{asset.id}</span>
                  </div>
                  <h1 className="mt-1 text-xl font-bold font-mono tracking-tight">{asset.hostname}</h1>
                  <div className="mt-1 text-xs text-muted-foreground font-mono">
                    {asset.ip} · {asset.os} · owner: {asset.owner} · team: {meta.team}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill icon={<Globe className="h-3 w-3" />} tone={meta.exposure === "public" ? "warn" : "neutral"}>
                      {meta.exposure}
                    </Pill>
                    <Pill icon={meta.edrCovered ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          tone={meta.edrCovered ? "ok" : "crit"}>
                      EDR {meta.edrCovered ? "active" : "missing"}
                    </Pill>
                    <Pill icon={<Shield className="h-3 w-3" />}>
                      {meta.cves} open CVEs
                    </Pill>
                    <Pill icon={<AlertTriangle className="h-3 w-3" />}>
                      last patch {meta.patchAgeDays}d ago
                    </Pill>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <RiskOrb score={asset.riskScore} />
              </div>
            </div>
            <div className="relative mt-3 flex gap-2">
              <Button variant="neon" size="sm" className="text-xs">Isolate host</Button>
              <Button variant="outline" size="sm" className="text-xs">Snapshot</Button>
              <Button variant="outline" size="sm" className="text-xs">Acknowledge alerts</Button>
              <Button variant="ghost" size="sm" className="text-xs">Open ticket</Button>
            </div>
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Risk score · last 14 days</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g-risk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 22% 18%)" />
                      <XAxis dataKey="t" tickFormatter={(v: number) => formatDate(v)} tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
                      <Tooltip contentStyle={chartTooltipStyle()} labelFormatter={(v) => formatDate(v as number)} />
                      <Area type="monotone" dataKey="score" stroke="hsl(0 84% 60%)" fill="url(#g-risk)" strokeWidth={1.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Events on this host · 14d</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 22% 18%)" vertical={false} />
                      <XAxis dataKey="t" tickFormatter={(v: number) => formatDate(v)} tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip contentStyle={chartTooltipStyle()} cursor={{ fill: "hsl(222 25% 12% / 0.5)" }} labelFormatter={(v) => formatDate(v as number)} />
                      <Bar dataKey="events" fill="hsl(180 100% 55%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Events + neighbors */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Recent events on {asset.hostname}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {relatedEvents.length === 0 && (
                  <div className="text-xs text-muted-foreground py-8 text-center">
                    No correlated events in the seed pool. Try the Threat Hunting console for ad-hoc searches.
                  </div>
                )}
                {relatedEvents.length > 0 && (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                        <th className="text-left px-3 py-2 font-medium">When</th>
                        <th className="text-left px-3 py-2 font-medium">Sev</th>
                        <th className="text-left px-3 py-2 font-medium">Description</th>
                        <th className="text-left px-3 py-2 font-medium">Technique</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {relatedEvents.map((e) => (
                        <tr key={e.id} className="border-t border-border/40">
                          <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(e.timestamp)}
                          </td>
                          <td className="px-3 py-1.5"><Badge variant={CRIT_VARIANT[e.severity]}>{e.severity}</Badge></td>
                          <td className="px-3 py-1.5 text-foreground/90">{e.description}</td>
                          <td className="px-3 py-1.5 text-severity-high">{e.technique ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network neighbors</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {neighbors.map((n) => (
                  <Link
                    key={n.hostname}
                    href={`/assets/${encodeURIComponent(n.hostname)}`}
                    className="flex items-center gap-2 p-2 rounded-md border border-border/40 hover:bg-accent/30"
                  >
                    <div className="h-7 w-7 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center">
                      <Server className="h-3.5 w-3.5 text-neon-cyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono truncate">{n.hostname}</div>
                      <div className="text-[10px] text-muted-foreground">{n.reason}</div>
                    </div>
                    <Badge variant={CRIT_VARIANT[n.severity]}>{n.severity}</Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function RiskOrb({ score }: { score: number }) {
  const color =
    score >= 80 ? "hsl(0 84% 60%)" : score >= 60 ? "hsl(20 90% 55%)" : score >= 40 ? "hsl(40 95% 55%)" : "hsl(140 100% 55%)";
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222 22% 18%)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${(score / 100) * 264} 264`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold font-mono" style={{ color }}>{score}</div>
        <div className="text-[8px] uppercase tracking-widest text-muted-foreground">risk</div>
      </div>
    </div>
  );
}

function Pill({
  icon, children, tone = "neutral",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "ok" | "warn" | "crit" | "neutral";
}) {
  const cls =
    tone === "ok"   ? "text-neon-green border-neon-green/40 bg-neon-green/5"
    : tone === "warn" ? "text-severity-high border-severity-high/40 bg-severity-high/5"
    : tone === "crit" ? "text-severity-critical border-severity-critical/40 bg-severity-critical/5"
    : "text-foreground/80 border-border/50 bg-muted/30";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider",
      cls
    )}>
      {icon}{children}
    </span>
  );
}
