"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CAMPAIGNS,
  IOC_CATALOG,
  MITRE_MATRIX,
  MITRE_TACTICS,
  THREAT_ACTORS,
  type MitreTactic,
  type ThreatActor,
} from "@/lib/threat-intel";
import type { Severity } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Crosshair,
  Globe2,
  Network,
  ShieldAlert,
  Skull,
  Target,
} from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const KIND_COLOR: Record<string, string> = {
  ip: "text-neon-cyan",
  domain: "text-neon-purple",
  hash: "text-severity-high",
  url: "text-severity-medium",
  email: "text-neon-pink",
  registry: "text-foreground/80",
};

export default function ThreatIntelPage() {
  const [activeActor, setActiveActor] = useState<ThreatActor>(THREAT_ACTORS[0]);
  const [iocFilter, setIocFilter] = useState<string>("");

  const filteredIocs = useMemo(() => {
    const q = iocFilter.trim().toLowerCase();
    if (!q) return IOC_CATALOG;
    return IOC_CATALOG.filter((i) =>
      [i.value, i.actor ?? "", i.family ?? "", i.kind, i.source]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [iocFilter]);

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
              <span className="text-foreground">threat intel</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Threat intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Active campaigns, threat actor profiles, IOC catalog, and MITRE ATT&amp;CK coverage.
            </p>
          </div>

          {/* Campaigns */}
          <section>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Target className="h-3 w-3" />
              Active campaigns
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CAMPAIGNS.map((c) => (
                <Card key={c.id} className={cn(
                  "p-3 overflow-hidden relative",
                  c.severity === "critical" && "border-severity-critical/40"
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEV_VARIANT[c.severity]}>{c.severity}</Badge>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                          {c.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        attribution: <span className="text-neon-cyan">{c.actor}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-foreground/80 line-clamp-3">{c.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[9px] uppercase tracking-wider">
                    {c.industries.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>victims: <span className="text-foreground">{c.victims}</span></span>
                    <span>started: {formatRelativeTime(c.startedAt)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Actor library + active panel */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skull className="h-3.5 w-3.5 text-severity-critical" />
                  Threat actors
                  <Badge variant="outline">{THREAT_ACTORS.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1 max-h-[480px] overflow-y-auto">
                {THREAT_ACTORS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveActor(a)}
                    className={cn(
                      "w-full text-left p-2 rounded-md border transition-colors",
                      activeActor.id === a.id
                        ? "border-neon-cyan/50 bg-neon-cyan/5"
                        : "border-border/40 hover:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={SEV_VARIANT[a.severity]}>{a.severity}</Badge>
                      <span className="text-xs font-semibold truncate">{a.name}</span>
                      {a.active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse-glow" />
                      )}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground font-mono truncate">
                      {a.origin} · {a.motivation}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-severity-critical" />
                  {activeActor.name}
                  <Badge variant={SEV_VARIANT[activeActor.severity]}>{activeActor.severity}</Badge>
                </CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground">
                  last seen {formatRelativeTime(activeActor.lastObserved)}
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Detail label="Origin">{activeActor.origin}</Detail>
                  <Detail label="Motivation">{activeActor.motivation}</Detail>
                  <Detail label="First observed">
                    {new Date(activeActor.firstObserved).toLocaleDateString()}
                  </Detail>
                  <Detail label="Active">
                    {activeActor.active ? (
                      <span className="text-neon-green">yes</span>
                    ) : (
                      <span className="text-muted-foreground">no</span>
                    )}
                  </Detail>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Summary</div>
                  <p className="text-xs text-foreground/85 mt-1">{activeActor.summary}</p>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">TTPs at a glance</div>
                  <p className="text-xs text-foreground/85 mt-1 font-mono">{activeActor.ttpsSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Aliases
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activeActor.aliases.map((a) => (
                        <span key={a} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 border border-border/40">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Target sectors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activeActor.sectors.map((s) => (
                        <span key={s} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    MITRE techniques
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeActor.techniques.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-severity-high/10 border border-severity-high/30 text-severity-high">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Linked campaigns
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeActor.campaigns.map((c) => (
                      <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* MITRE matrix */}
          <section>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5 text-neon-purple" />
                  MITRE ATT&amp;CK coverage matrix
                  <span className="text-[10px] font-mono text-muted-foreground ml-2">
                    detection rules per technique · last 24h matches
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2 overflow-x-auto">
                <div className="grid grid-cols-11 gap-2 min-w-[1200px]">
                  {MITRE_TACTICS.map((tactic) => (
                    <div key={tactic} className="space-y-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-1 truncate">
                        {tactic}
                      </div>
                      {MITRE_MATRIX[tactic as MitreTactic].map((c) => (
                        <div
                          key={c.technique}
                          className={cn(
                            "rounded-md border p-1.5 text-[10px] hover:scale-[1.02] transition-transform cursor-help",
                            c.coverage === "high" && "bg-neon-green/10 border-neon-green/30 text-foreground",
                            c.coverage === "med"  && "bg-severity-medium/10 border-severity-medium/30 text-foreground",
                            c.coverage === "low"  && "bg-severity-high/10 border-severity-high/30 text-foreground",
                            c.coverage === "none" && "bg-severity-critical/10 border-severity-critical/30 text-foreground"
                          )}
                          title={`${c.technique} — ${c.name} · ${c.detections} rules · ${c.matchesLast24h} hits 24h`}
                        >
                          <div className="font-mono text-foreground/90">{c.technique}</div>
                          <div className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                            {c.name}
                          </div>
                          <div className="text-[9px] flex justify-between mt-0.5">
                            <span className="font-mono">{c.detections} rules</span>
                            {c.matchesLast24h > 0 && (
                              <span className="font-mono text-severity-high">{c.matchesLast24h} hit{c.matchesLast24h > 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-mono">
                  <Legend color="hsl(140 100% 55%)" label="high coverage" />
                  <Legend color="hsl(40 95% 55%)"   label="medium" />
                  <Legend color="hsl(20 90% 55%)"   label="low" />
                  <Legend color="hsl(0 84% 60%)"    label="no detection rule" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* IOC catalog */}
          <section>
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="h-3.5 w-3.5 text-severity-critical" />
                  IOC catalog
                  <Badge variant="outline">{filteredIocs.length}/{IOC_CATALOG.length}</Badge>
                </CardTitle>
                <input
                  value={iocFilter}
                  onChange={(e) => setIocFilter(e.target.value)}
                  placeholder="Filter by value, actor, family…"
                  className="h-7 w-64 px-2 rounded-md bg-muted/40 border border-border/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                        <th className="text-left px-3 py-2 font-medium">Indicator</th>
                        <th className="text-left px-3 py-2 font-medium">Kind</th>
                        <th className="text-left px-3 py-2 font-medium">Actor</th>
                        <th className="text-left px-3 py-2 font-medium">Family</th>
                        <th className="text-left px-3 py-2 font-medium">Source</th>
                        <th className="text-left px-3 py-2 font-medium">First seen</th>
                        <th className="text-left px-3 py-2 font-medium">Last seen</th>
                        <th className="text-right px-3 py-2 font-medium">Conf.</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {filteredIocs.map((i) => (
                        <tr key={i.id} className="border-t border-border/40 hover:bg-accent/30">
                          <td className={cn("px-3 py-1.5 truncate max-w-[280px]", KIND_COLOR[i.kind])}>{i.value}</td>
                          <td className="px-3 py-1.5 text-muted-foreground uppercase tracking-wider text-[10px]">{i.kind}</td>
                          <td className="px-3 py-1.5">{i.actor ?? "—"}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{i.family ?? "—"}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{i.source}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{formatRelativeTime(i.firstSeen)}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{formatRelativeTime(i.lastSeen)}</td>
                          <td className={cn(
                            "px-3 py-1.5 text-right font-semibold",
                            i.confidence >= 90 ? "text-neon-green" : i.confidence >= 75 ? "text-severity-medium" : "text-severity-high"
                          )}>{i.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="pt-2 pb-4 text-center text-[10px] font-mono text-muted-foreground/70">
            <Globe2 className="h-3 w-3 inline mr-1" />
            feeds: Sentinel-TI · VirusTotal · DomainTools · Mandiant · AbuseIPDB · CISA-AAR
          </footer>
        </main>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xs mt-0.5">{children}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm border" style={{ background: `${color}33`, borderColor: `${color}66` }} />
      <span className="uppercase tracking-wider text-muted-foreground">{label}</span>
    </span>
  );
}
