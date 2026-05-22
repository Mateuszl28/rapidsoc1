"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/dashboard/markdown";
import { findReport } from "@/lib/reports";
import { findIncident } from "@/lib/incident-helpers";
import type { Severity } from "@/lib/types";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Share2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export default function ReportViewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const report = useMemo(() => (id ? findReport(id) : undefined), [id]);

  if (!report) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Report not found.</div>
              <Link href="/reports" className="text-xs text-neon-cyan underline mt-2 inline-block">
                Back to reports
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const incident = findIncident(report.incidentId);

  const onCopy = () => {
    navigator.clipboard?.writeText(report.body);
  };
  const onDownload = () => {
    const blob = new Blob([report.body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
            <Link href="/reports" className="hover:text-foreground">reports</Link>
            <span className="text-border">/</span>
            <span className="text-foreground">{report.id}</span>
          </div>

          {/* Header */}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={SEV_VARIANT[report.severity]}>{report.severity}</Badge>
                    <Badge variant="outline">{report.audience}</Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{report.id}</span>
                    <span className="text-[10px] uppercase tracking-wider text-neon-cyan">{report.status}</span>
                  </div>
                  <h1 className="mt-2 text-xl font-bold tracking-tight">{report.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{report.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {report.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="text-xs" onClick={onCopy}>
                    <FileText className="h-3 w-3" />
                    Copy md
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={onDownload}>
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" variant="neon" className="text-xs">
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Body */}
            <Card className="xl:col-span-3 overflow-hidden">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Report</CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {report.pages} page{report.pages > 1 ? "s" : ""} · {report.wordCount} words
                </span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose-soc max-w-none">
                  <Markdown content={report.body} />
                </div>
              </CardContent>
            </Card>

            {/* Sidebar metadata */}
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2 text-xs">
                  <Row label="Authored by" value={
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-neon-purple" />
                      {report.author}
                    </span>
                  } />
                  <Row label="Generated"  value={`${formatDate(report.generatedAt)} · ${formatRelativeTime(report.generatedAt)}`} />
                  <Row label="Audience"   value={report.audience} />
                  <Row label="Severity"   value={<Badge variant={SEV_VARIANT[report.severity]}>{report.severity}</Badge>} />
                  <Row label="Status"     value={report.status} />
                  {report.approvedBy && <Row label="Approved by" value={
                    <span className="inline-flex items-center gap-1.5 text-neon-green">
                      <CheckCircle2 className="h-3 w-3" />
                      {report.approvedBy}
                    </span>
                  } />}
                  <Row label="Length"     value={`${report.wordCount} words · ${report.pages}p`} />
                </CardContent>
              </Card>

              {incident && (
                <Card>
                  <CardHeader>
                    <CardTitle>Source incident</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <Link href={`/incidents/${incident.id}`} className="block p-2 rounded-md border border-border/40 hover:bg-accent/30">
                      <div className="flex items-center gap-2">
                        <Badge variant={SEV_VARIANT[incident.severity]}>{incident.severity}</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{incident.id}</span>
                      </div>
                      <div className="mt-1 text-xs font-medium line-clamp-2">{incident.title}</div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{incident.eventIds.length} events · {incident.affectedAssets.length} assets</span>
                        <span className="text-neon-cyan inline-flex items-center gap-1">
                          Open <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}
