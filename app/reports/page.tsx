"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REPORTS, type SavedReport } from "@/lib/reports";
import type { Severity } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Filter,
  Search,
  Share2,
  Sparkles,
  FileEdit,
  Download,
} from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const STATUS_ICON: Record<SavedReport["status"], React.ReactNode> = {
  draft:    <FileEdit className="h-3 w-3" />,
  approved: <CheckCircle2 className="h-3 w-3" />,
  shared:   <Share2 className="h-3 w-3" />,
};

const STATUS_CLASS: Record<SavedReport["status"], string> = {
  draft:    "text-severity-medium border-severity-medium/40 bg-severity-medium/5",
  approved: "text-neon-green border-neon-green/40 bg-neon-green/5",
  shared:   "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5",
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState<"all" | SavedReport["audience"]>("all");
  const [status, setStatus] = useState<"all" | SavedReport["status"]>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REPORTS.filter((r) => {
      if (audience !== "all" && r.audience !== audience) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return [r.title, r.summary, r.incidentId, r.author, ...r.tags]
        .join(" ").toLowerCase().includes(q);
    });
  }, [search, audience, status]);

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
              <span className="text-foreground">reports</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI-generated reports</h1>
            <p className="text-sm text-muted-foreground">
              Executive briefs, technical post-mortems, regulatory disclosures, and remediation runbooks — produced by the agent workflow.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Total reports"   value={REPORTS.length}                                  icon={<FileText className="h-4 w-4" />}     accent="text-neon-cyan" />
            <KPI label="Awaiting review" value={REPORTS.filter((r) => r.status === "draft").length} icon={<FileEdit className="h-4 w-4" />} accent="text-severity-medium" />
            <KPI label="Approved"        value={REPORTS.filter((r) => r.status === "approved").length} icon={<CheckCircle2 className="h-4 w-4" />} accent="text-neon-green" />
            <KPI label="Shared"          value={REPORTS.filter((r) => r.status === "shared").length}  icon={<Share2 className="h-4 w-4" />}  accent="text-neon-purple" />
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
                    placeholder="Search title, tags, incident, author…"
                    className="w-full h-8 pl-8 pr-3 rounded-md bg-muted/40 border border-border/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <FilterChips<"all" | SavedReport["audience"]>
                  label="Audience" value={audience} onChange={setAudience}
                  options={["all", "exec", "technical", "regulatory", "internal"]} />
                <FilterChips<"all" | SavedReport["status"]>
                  label="Status" value={status} onChange={setStatus}
                  options={["all", "draft", "approved", "shared"]} />
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                  onClick={() => { setSearch(""); setAudience("all"); setStatus("all"); }}>
                  <Filter className="h-3 w-3" />
                  Clear
                </Button>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {filtered.length} of {REPORTS.length} reports
              </div>
            </CardContent>
          </Card>

          {/* Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((r) => (
              <Link key={r.id} href={`/reports/${r.id}`} className="block">
                <Card className="p-3 h-full hover:bg-accent/30 transition-colors cursor-pointer overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEV_VARIANT[r.severity]}>{r.severity}</Badge>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wider",
                          STATUS_CLASS[r.status]
                        )}>
                          {STATUS_ICON[r.status]}
                          {r.status}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.id}</span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold line-clamp-2 leading-snug">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {r.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-neon-purple" />
                      {r.author}
                    </span>
                    <span className="font-mono">
                      {r.pages}p · {r.wordCount}w · {formatRelativeTime(r.generatedAt)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                No reports match. Try different filters.
              </div>
            )}
          </section>
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
