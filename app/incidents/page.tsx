"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SEED_INCIDENTS } from "@/lib/mock-data";
import type { EventStatus, Severity } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Users,
  Filter,
} from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const SCORE_BAR: Record<Severity, string> = {
  critical: "!bg-severity-critical",
  high: "!bg-severity-high",
  medium: "!bg-severity-medium",
  low: "!bg-severity-low",
  info: "!bg-severity-info",
};

type SevFilter = Severity | "all";
type StatusFilter = EventStatus | "all";

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [sev, setSev] = useState<SevFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SEED_INCIDENTS.filter((i) => {
      if (sev !== "all" && i.severity !== sev) return false;
      if (status !== "all" && i.status !== status) return false;
      if (!q) return true;
      return [i.id, i.title, i.summary, ...(i.affectedAssets ?? []), i.assignee ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [search, sev, status]);

  const stats = {
    open: SEED_INCIDENTS.filter((i) => i.status === "investigating" || i.status === "new").length,
    critical: SEED_INCIDENTS.filter((i) => i.severity === "critical").length,
    resolvedToday: SEED_INCIDENTS.filter((i) => i.status === "resolved").length,
    avgScore: Math.round(SEED_INCIDENTS.reduce((a, b) => a + b.score, 0) / SEED_INCIDENTS.length),
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
              <span className="text-foreground">incidents</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Incidents</h1>
            <p className="text-sm text-muted-foreground">
              Triaged events grouped into actionable incidents. Click one to open the
              full workspace.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI icon={<AlertTriangle className="h-4 w-4" />} label="Open"           value={stats.open}          accent="text-severity-high" />
            <KPI icon={<ShieldAlert  className="h-4 w-4" />} label="Critical"        value={stats.critical}      accent="text-severity-critical" />
            <KPI icon={<CheckCircle2 className="h-4 w-4" />} label="Resolved (24h)"  value={stats.resolvedToday} accent="text-neon-green" />
            <KPI icon={<Users        className="h-4 w-4" />} label="Avg. risk score" value={stats.avgScore}      accent="text-neon-cyan" />
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
                    placeholder="Search title, asset, summary, ID…"
                    className="w-full h-8 pl-8 pr-3 rounded-md bg-muted/40 border border-border/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <FilterChips label="Severity" value={sev} onChange={(v) => setSev(v as SevFilter)}
                  options={["all", "critical", "high", "medium", "low", "info"] as const} />

                <FilterChips label="Status" value={status} onChange={(v) => setStatus(v as StatusFilter)}
                  options={["all", "new", "investigating", "contained", "resolved", "false-positive"] as const} />

                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                  onClick={() => { setSearch(""); setSev("all"); setStatus("all"); }}>
                  <Filter className="h-3 w-3" />
                  Clear
                </Button>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {filtered.length} of {SEED_INCIDENTS.length} incidents
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All incidents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                      <th className="text-left  px-3 py-2 font-medium">ID</th>
                      <th className="text-left  px-3 py-2 font-medium">Sev</th>
                      <th className="text-left  px-3 py-2 font-medium">Title</th>
                      <th className="text-left  px-3 py-2 font-medium">Status</th>
                      <th className="text-left  px-3 py-2 font-medium">Assignee</th>
                      <th className="text-left  px-3 py-2 font-medium">Opened</th>
                      <th className="text-right px-3 py-2 font-medium">Score</th>
                      <th className="px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inc) => (
                      <tr key={inc.id} className="border-t border-border/40 hover:bg-accent/30">
                        <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{inc.id}</td>
                        <td className="px-3 py-2"><Badge variant={SEV_VARIANT[inc.severity]}>{inc.severity}</Badge></td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{inc.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">
                            {inc.summary}
                          </div>
                        </td>
                        <td className="px-3 py-2 uppercase tracking-wider font-mono text-[10px]">
                          <span className={cn(
                            inc.status === "investigating" && "text-severity-high",
                            inc.status === "contained" && "text-neon-cyan",
                            inc.status === "resolved" && "text-neon-green",
                          )}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{inc.assignee ?? "unassigned"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatRelativeTime(inc.openedAt)}</td>
                        <td className="px-3 py-2 w-[160px]">
                          <div className="flex items-center gap-2">
                            <Progress value={inc.score} className="h-1.5"
                              indicatorClassName={SCORE_BAR[inc.severity]} />
                            <span className="font-mono w-7 text-right">{inc.score}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link href={`/incidents/${inc.id}`}
                                className="text-[10px] uppercase tracking-wider text-neon-cyan hover:underline">
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-12 text-center text-muted-foreground">
                        No incidents match the current filters.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
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
