"use client";

import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  Bot,
  Boxes,
  CheckCircle2,
  Globe2,
  Key,
  Plug,
  Save,
  ShieldCheck,
  Slack,
  Sliders,
  Webhook,
} from "lucide-react";

const MODELS = [
  { id: "claude-opus-4-7",     label: "Claude Opus 4.7",     speed: "med", quality: "best",   default: false },
  { id: "claude-sonnet-4-6",   label: "Claude Sonnet 4.6",   speed: "fast", quality: "high",   default: true  },
  { id: "claude-haiku-4-5",    label: "Claude Haiku 4.5",    speed: "fastest", quality: "good",   default: false },
];

const SEV_THRESHOLDS = [
  { id: "critical", label: "Critical", value: 90, color: "hsl(0 84% 60%)" },
  { id: "high",     label: "High",     value: 75, color: "hsl(20 90% 55%)" },
  { id: "medium",   label: "Medium",   value: 55, color: "hsl(40 95% 55%)" },
  { id: "low",      label: "Low",      value: 30, color: "hsl(190 90% 55%)" },
];

const INTEGRATIONS = [
  { id: "slack",      name: "Slack",        icon: Slack,    status: "connected",    notes: "#sec-incidents · #sec-oncall" },
  { id: "pagerduty",  name: "PagerDuty",    icon: Bell,     status: "connected",    notes: "Escalation policy: SOC-tier-2" },
  { id: "okta",       name: "Okta",         icon: Key,      status: "connected",    notes: "SSO + session-revoke webhook" },
  { id: "github",     name: "GitHub",       icon: Webhook,  status: "connected",    notes: "Secret-scanning webhook" },
  { id: "jira",       name: "Jira",         icon: Boxes,    status: "available",    notes: "Auto-create tickets for incidents" },
  { id: "splunk",     name: "Splunk",       icon: Plug,     status: "available",    notes: "Optional alternative log source" },
];

const RETENTION = [
  { label: "Hot tier (queryable)",       days: 30 },
  { label: "Warm tier (frozen index)",   days: 180 },
  { label: "Cold tier (archive)",        days: 730 },
  { label: "Forensic evidence",          days: 2555 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"agents" | "thresholds" | "integrations" | "retention">("agents");

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
              <span className="text-foreground">settings</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Agent configuration, severity thresholds, integrations, and data retention.
            </p>
          </div>

          <div className="flex items-center gap-1 border-b border-border/40">
            {(
              [
                { id: "agents",       label: "AI agents",      icon: Bot },
                { id: "thresholds",   label: "Severity",       icon: Sliders },
                { id: "integrations", label: "Integrations",   icon: Plug },
                { id: "retention",    label: "Retention",      icon: ShieldCheck },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5",
                  activeTab === t.id
                    ? "border-neon-cyan text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Agents tab */}
          {activeTab === "agents" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5 text-neon-purple" />
                    Default model
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {MODELS.map((m) => (
                    <label key={m.id} className={cn(
                      "flex items-center gap-3 p-2 rounded-md border cursor-pointer hover:bg-accent/30",
                      m.default ? "border-neon-cyan/50 bg-neon-cyan/5" : "border-border/40"
                    )}>
                      <input type="radio" name="model" defaultChecked={m.default} className="accent-neon-cyan" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono">{m.label}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {m.speed} · {m.quality}
                        </div>
                      </div>
                      {m.default && (
                        <Badge variant="success">in use</Badge>
                      )}
                    </label>
                  ))}
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Override per-agent below. Mock mode also available when ANTHROPIC_API_KEY is unset.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-3.5 w-3.5 text-neon-purple" />
                    Generation tuning
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <Slider label="Temperature" value={0.3} hint="lower = more deterministic; investigations want 0.2-0.4" />
                  <Slider label="Top-p"       value={0.9} hint="nucleus sampling" />
                  <Slider label="Max tokens"  value={1400} max={4096} hint="hard cap per response" />
                  <Slider label="Stream chunking (ms)" value={20} max={120} hint="visual cadence of streaming output" />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Per-agent overrides</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                          <th className="text-left px-3 py-2 font-medium">Agent</th>
                          <th className="text-left px-3 py-2 font-medium">Role</th>
                          <th className="text-left px-3 py-2 font-medium">Model</th>
                          <th className="text-left px-3 py-2 font-medium">Temp</th>
                          <th className="text-left px-3 py-2 font-medium">Max tokens</th>
                          <th className="text-right px-3 py-2 font-medium">Enabled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {AGENT_ORDER.map((id) => {
                          const a = AGENTS[id];
                          return (
                            <tr key={id} className="border-t border-border/40">
                              <td className="px-3 py-2 font-medium">{a.name}</td>
                              <td className="px-3 py-2 text-muted-foreground line-clamp-1">{a.role}</td>
                              <td className="px-3 py-2 font-mono text-neon-cyan">claude-sonnet-4-6</td>
                              <td className="px-3 py-2 font-mono">0.30</td>
                              <td className="px-3 py-2 font-mono">1400</td>
                              <td className="px-3 py-2 text-right">
                                <span className="inline-flex items-center gap-1 text-neon-green">
                                  <CheckCircle2 className="h-3 w-3" />
                                  on
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Thresholds tab */}
          {activeTab === "thresholds" && (
            <Card>
              <CardHeader>
                <CardTitle>Severity score thresholds</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {SEV_THRESHOLDS.map((s) => (
                  <div key={s.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        <span className="font-semibold">{s.label}</span>
                      </div>
                      <span className="font-mono text-xs">{s.value}+</span>
                    </div>
                    <Progress value={s.value} className="h-1.5"
                      indicatorClassName={cn(
                        s.id === "critical" && "!bg-severity-critical",
                        s.id === "high" && "!bg-severity-high",
                        s.id === "medium" && "!bg-severity-medium",
                        s.id === "low" && "!bg-severity-low",
                      )} />
                  </div>
                ))}
                <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                  Events scoring at-or-above each threshold get the matching severity. Edit thresholds carefully; downstream playbooks reference these labels.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations tab */}
          {activeTab === "integrations" && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTEGRATIONS.map((i) => {
                const Icon = i.icon;
                return (
                  <Card key={i.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-md border flex items-center justify-center",
                        i.status === "connected"
                          ? "text-neon-green border-neon-green/40 bg-neon-green/5"
                          : "text-muted-foreground border-border/50 bg-muted/30"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{i.name}</div>
                          {i.status === "connected" ? (
                            <Badge variant="success">connected</Badge>
                          ) : (
                            <Badge variant="outline">available</Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{i.notes}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs mt-3 w-full">
                      {i.status === "connected" ? "Manage" : "Connect"}
                    </Button>
                  </Card>
                );
              })}
            </section>
          )}

          {/* Retention tab */}
          {activeTab === "retention" && (
            <Card>
              <CardHeader>
                <CardTitle>Data retention</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {RETENTION.map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-2 rounded-md border border-border/40">
                    <div>
                      <div className="text-sm font-medium">{r.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.label.includes("forensic") ? "preserved chain-of-custody · WORM" : "compressed + encrypted at rest"}
                      </div>
                    </div>
                    <div className="text-sm font-mono">{r.days} days</div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                  Retention longer than 90 days requires PCI-DSS / SOC2 approval on this tenant.
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm">Reset</Button>
            <Button variant="neon" size="sm">
              <Save className="h-3 w-3" />
              Save changes
            </Button>
          </div>

          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
            <Globe2 className="h-3 w-3" />
            Tenant region: EU-Central · Sentinel agent build 2.18.4 · 247 sensors healthy
          </div>
        </main>
      </div>
    </div>
  );
}

function Slider({
  label, value, max = 1, hint,
}: { label: string; value: number; max?: number; hint?: string }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">{label}</span>
        <span className="font-mono text-xs">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={max > 10 ? 1 : 0.05}
        defaultValue={value}
        className="w-full accent-neon-cyan"
      />
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
