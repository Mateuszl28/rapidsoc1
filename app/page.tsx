"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import {
  CategoryBars,
  EventVolumeChart,
  SeverityDonut,
} from "@/components/dashboard/charts";
import { EventFeed } from "@/components/dashboard/event-feed";
import { IncidentCards } from "@/components/dashboard/incident-cards";
import { IncidentTimeline } from "@/components/dashboard/timeline";
import { AgentPanel } from "@/components/dashboard/agent-panel";
import { AgentStatusGrid } from "@/components/dashboard/agent-status";
import { ThreatMap } from "@/components/dashboard/threat-map";
import { ThreatFeed } from "@/components/dashboard/threat-feed";
import { SEED_INCIDENTS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [activeIncidentId, setActiveIncidentId] = useState(SEED_INCIDENTS[0].id);

  const activeIncident = useMemo(
    () => SEED_INCIDENTS.find((i) => i.id === activeIncidentId) ?? SEED_INCIDENTS[0],
    [activeIncidentId]
  );

  const incidentContext = useMemo(() => {
    const i = activeIncident;
    return [
      `INCIDENT: ${i.id} — ${i.title}`,
      `Severity: ${i.severity.toUpperCase()}  Score: ${i.score}/100  Status: ${i.status}`,
      `Affected assets: ${i.affectedAssets.join(", ")}`,
      `Summary: ${i.summary}`,
      `Correlated events: ${i.eventIds.join(", ")}`,
      i.attackChain
        ? `Attack chain:\n${i.attackChain
            .map((n) => `- [${n.stage}] ${n.description} (evidence: ${n.evidence.join("; ")})`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [activeIncident]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          {/* Hero / status banner */}
          <section data-tour="hero">
            <div className="relative overflow-hidden rounded-lg border border-severity-critical/40 bg-gradient-to-r from-severity-critical/10 via-card to-card p-4">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-severity-critical/20 blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-severity-critical font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-severity-critical animate-pulse-glow" />
                    Active critical incident
                  </div>
                  <h1 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">
                    INC-2041 · Suspected ransomware staging on{" "}
                    <span className="text-severity-critical">fin-db-prod-01</span>
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                    Credential spray → PowerShell stager on jumpbox → SMB pivot to
                    finance DB → 480&nbsp;MB PII egress to internal staging. Multi-agent
                    triage in progress.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Metric label="Risk score" value="96" tone="critical" />
                  <Metric label="MITRE techniques" value="7" tone="info" />
                  <Metric label="Time open" value="17m" tone="warn" />
                </div>
              </div>
            </div>
          </section>

          {/* KPI cards */}
          <section>
            <StatsCards />
          </section>

          {/* Charts row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <EventVolumeChart />
            </div>
            <SeverityDonut />
          </section>

          {/* Multi-agent + incidents */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <AgentPanel incidentContext={incidentContext} />
            </div>
            <div className="space-y-4">
              <AgentStatusGrid />
              <CategoryBars />
            </div>
          </section>

          {/* Feed + incidents */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2" data-tour="feed">
              <EventFeed />
            </div>
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>Open incidents</span>
                <span className="text-[10px] font-mono">{SEED_INCIDENTS.length} total</span>
              </h2>
              <IncidentCards
                incidents={SEED_INCIDENTS}
                activeId={activeIncidentId}
                onSelect={setActiveIncidentId}
              />
            </div>
          </section>

          {/* Kill chain + map */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IncidentTimeline />
            <ThreatMap />
          </section>

          {/* Threat intel */}
          <section>
            <ThreatFeed />
          </section>

          <footer className="pt-2 pb-4 text-center text-[10px] font-mono text-muted-foreground/70">
            Sentinel AI · v1.0 · all data synthetic · built with Next.js + Vercel AI SDK
          </footer>
        </main>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "critical" | "warn" | "info";
}) {
  const ring =
    tone === "critical"
      ? "border-severity-critical/40 text-severity-critical"
      : tone === "warn"
      ? "border-severity-high/40 text-severity-high"
      : "border-severity-info/40 text-severity-info";
  return (
    <div className={`rounded-md border ${ring} bg-background/40 px-3 py-2 text-center min-w-[88px]`}>
      <div className="text-xl font-bold font-mono leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
