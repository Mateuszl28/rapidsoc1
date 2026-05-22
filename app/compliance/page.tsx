"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CONTROLS,
  FRAMEWORKS,
  FRAMEWORK_SCORE,
  type ControlStatus,
  type FrameworkId,
} from "@/lib/compliance";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from "lucide-react";

const STATUS_COLOR: Record<ControlStatus, string> = {
  passing:        "text-neon-green",
  warning:        "text-severity-medium",
  failing:        "text-severity-critical",
  "not-applicable": "text-muted-foreground",
};

const STATUS_ICON: Record<ControlStatus, React.ReactNode> = {
  passing:          <CheckCircle2 className="h-3 w-3" />,
  warning:          <AlertTriangle className="h-3 w-3" />,
  failing:          <XCircle className="h-3 w-3" />,
  "not-applicable": <span className="h-3 w-3 inline-block" />,
};

export default function CompliancePage() {
  const [active, setActive] = useState<FrameworkId>(FRAMEWORKS[0].id);

  const controlsForActive = useMemo(
    () => CONTROLS.filter((c) => c.framework === active),
    [active]
  );

  const totalControls = CONTROLS.length;
  const totalPass = CONTROLS.filter((c) => c.status === "passing").length;
  const totalWarn = CONTROLS.filter((c) => c.status === "warning").length;
  const totalFail = CONTROLS.filter((c) => c.status === "failing").length;

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
              <span className="text-foreground">compliance</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Compliance posture</h1>
            <p className="text-sm text-muted-foreground">
              Live status across the regulatory frameworks Sentinel covers. Controls are scored from telemetry — not self-attestation.
            </p>
          </div>

          {/* Aggregate KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Controls monitored" value={totalControls} icon={<ShieldCheck className="h-4 w-4" />} accent="text-neon-cyan" />
            <KPI label="Passing"            value={totalPass}     icon={<CheckCircle2 className="h-4 w-4" />} accent="text-neon-green" />
            <KPI label="Warnings"           value={totalWarn}     icon={<AlertTriangle className="h-4 w-4" />} accent="text-severity-medium" />
            <KPI label="Failing"            value={totalFail}     icon={<XCircle className="h-4 w-4" />} accent="text-severity-critical" />
          </div>

          {/* Framework cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {FRAMEWORKS.map((f) => {
              const score = FRAMEWORK_SCORE[f.id];
              const isActive = active === f.id;
              return (
                <button key={f.id} onClick={() => setActive(f.id)} className="text-left">
                  <Card className={cn(
                    "p-3 transition-colors h-full",
                    isActive ? "border-neon-cyan/50 glow-cyan" : "hover:bg-accent/30"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{f.name}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-2">{f.summary}</div>
                      </div>
                      <ScoreRing score={score} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{f.reviewedControls}/{f.totalControls} controls</span>
                      <span>{f.scope}</span>
                    </div>
                  </Card>
                </button>
              );
            })}
          </section>

          {/* Active framework controls */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                {FRAMEWORKS.find((f) => f.id === active)?.name} controls
              </CardTitle>
              <span className="text-[10px] font-mono text-muted-foreground">
                {controlsForActive.length} monitored
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                      <th className="text-left px-3 py-2 font-medium">Ref</th>
                      <th className="text-left px-3 py-2 font-medium">Control</th>
                      <th className="text-left px-3 py-2 font-medium">Owner</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Last review</th>
                      <th className="text-right px-3 py-2 font-medium">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlsForActive.map((c) => (
                      <tr key={c.id} className="border-t border-border/40 hover:bg-accent/30 align-top">
                        <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{c.ref}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{c.title}</div>
                          {c.note && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {c.note}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{c.owner}</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold",
                            STATUS_COLOR[c.status]
                          )}>
                            {STATUS_ICON[c.status]}
                            {c.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{formatRelativeTime(c.lastReviewed)}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            {c.evidenceCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {controlsForActive.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-12 text-center text-muted-foreground">
                        No controls mapped to this framework yet.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                Posture computed from telemetry within the last 24h · evidence rollups tagged in <Badge variant="outline">Reports</Badge>
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

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 85 ? "hsl(140 100% 55%)" : score >= 70 ? "hsl(40 95% 55%)" : "hsl(0 84% 60%)";
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222 22% 18%)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(score / 100) * 264} 264`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}
