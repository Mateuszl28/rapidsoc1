"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentTimeline } from "@/components/dashboard/timeline";
import { AgentPanel } from "@/components/dashboard/agent-panel";
import { AgentChat } from "@/components/dashboard/agent-chat";
import { PlaybookExecutor } from "@/components/dashboard/playbook-executor";
import { AttackGraphView } from "@/components/dashboard/attack-graph";
import {
  AssetList,
  EventTable,
  EvidenceLocker,
} from "@/components/dashboard/incident-detail-bits";
import {
  assetsFor,
  describeIncident,
  evidenceFor,
  eventsFor,
  findIncident,
  graphFor,
} from "@/lib/incident-helpers";
import { ArrowLeft, AlertTriangle, ShieldAlert, Timer, Users } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const incident = useMemo(() => (id ? findIncident(id) : undefined), [id]);
  if (!incident) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Incident not found.</div>
              <Link href="/" className="text-xs text-neon-cyan underline mt-2 inline-block">
                Back to overview
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const events = eventsFor(incident);
  const assets = assetsFor(incident);
  const evidence = evidenceFor(incident);
  const graph = graphFor(incident);
  const context = describeIncident(incident);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">

          {/* Hero */}
          <section>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> overview
              </Link>
              <span className="text-border">/</span>
              <span>incidents</span>
              <span className="text-border">/</span>
              <span className="text-foreground">{incident.id}</span>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-severity-critical/40 bg-gradient-to-r from-severity-critical/10 via-card to-card p-4">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-severity-critical/20 blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-severity-critical font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-severity-critical animate-pulse-glow" />
                    {incident.status} · {incident.severity}
                  </div>
                  <h1 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">
                    {incident.id} · {incident.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                    {incident.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> opened {formatRelativeTime(incident.openedAt)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {incident.assignee ?? "unassigned"}</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {events.length} events</span>
                    <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> {assets.length} assets</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Metric label="Risk" value={`${incident.score}`} tone="critical" />
                  <Metric label="Events" value={`${events.length}`} tone="info" />
                  <Metric label="Assets" value={`${assets.length}`} tone="warn" />
                </div>
              </div>
              <div className="relative mt-3 flex flex-wrap gap-2">
                <Button variant="neon" size="sm" className="text-xs">
                  Acknowledge
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Escalate → CISO
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Export report
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  Add note
                </Button>
              </div>
            </div>
          </section>

          {/* Agents + Chat */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AgentPanel incidentContext={context} />
            <AgentChat incidentContext={context} />
          </section>

          {/* Attack graph + Timeline */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AttackGraphView graph={graph} />
            <IncidentTimeline />
          </section>

          {/* Playbook */}
          <section>
            <PlaybookExecutor />
          </section>

          {/* Events + Assets/Evidence */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <EventTable events={events} />
            </div>
            <div className="space-y-4">
              <AssetList assets={assets} />
            </div>
          </section>

          <section>
            <EvidenceLocker items={evidence} />
          </section>

          <footer className="pt-2 pb-4 text-center text-[10px] font-mono text-muted-foreground/70">
            Sentinel AI · {incident.id} · synthetic data
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
    <div className={`rounded-md border ${ring} bg-background/40 px-3 py-2 text-center min-w-[78px]`}>
      <div className="text-xl font-bold font-mono leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
