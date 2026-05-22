"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { EventVolumeChart, SeverityDonut } from "@/components/dashboard/charts";
import { EventFeed } from "@/components/dashboard/event-feed";
import { AgentStatusGrid } from "@/components/dashboard/agent-status";
import { ThreatMap } from "@/components/dashboard/threat-map";
import { ThreatFeed } from "@/components/dashboard/threat-feed";
import { IncidentTimeline } from "@/components/dashboard/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEED_INCIDENTS } from "@/lib/mock-data";
import { THREAT_ACTORS } from "@/lib/threat-intel";
import {
  Activity,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  Shield,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const SCENES: { id: string; label: string }[] = [
  { id: "command",  label: "Command center" },
  { id: "stream",   label: "Live stream"    },
  { id: "campaign", label: "Active campaigns" },
  { id: "killchain",label: "Kill chain"     },
];

const ROTATE_MS = 18000;

export default function WallPage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const id = setInterval(() => setSceneIdx((i) => (i + 1) % SCENES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [autoRotate]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const top = SEED_INCIDENTS[0];
  const liveActors = THREAT_ACTORS.slice(0, 4);

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen flex flex-col bg-background relative",
        fullscreen && "p-0"
      )}
    >
      {/* Top status bar */}
      <header className="h-14 shrink-0 border-b border-border/40 bg-card/40 backdrop-blur flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <Shield className="h-4 w-4 text-background" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold flex items-center gap-2">
              SENTINEL · WAR ROOM
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse-glow" />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              tenant: acme.io · prod · EU-Central
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-2 text-[10px] font-mono text-muted-foreground">
          <span className="px-2 py-1 rounded bg-severity-critical/15 text-severity-critical border border-severity-critical/40">
            DEFCON 3
          </span>
          <span className="text-foreground">posture: elevated</span>
        </div>

        <div className="flex-1" />

        {/* Scene tabs */}
        <div className="hidden md:flex items-center gap-1">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setSceneIdx(i); setAutoRotate(false); }}
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors",
                sceneIdx === i
                  ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoRotate((a) => !a)}
            className="h-8 px-2 rounded-md bg-muted/40 border border-border/40 text-xs flex items-center gap-1 hover:bg-accent"
            title="Auto-rotate"
          >
            {autoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden lg:inline">{autoRotate ? "Pause" : "Auto"}</span>
          </button>
          <button
            onClick={() => setSceneIdx((i) => (i + 1) % SCENES.length)}
            className="h-8 px-2 rounded-md bg-muted/40 border border-border/40 text-xs flex items-center gap-1 hover:bg-accent"
            title="Next scene"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="h-8 px-2 rounded-md bg-muted/40 border border-border/40 text-xs flex items-center gap-1 hover:bg-accent"
            title="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>

        <Link href="/" className="h-8 px-2 rounded-md bg-muted/40 border border-border/40 text-xs flex items-center gap-1 hover:bg-accent" title="Exit">
          <X className="h-3 w-3" />
          <span className="hidden lg:inline">Exit</span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 ml-1 text-[10px] font-mono text-muted-foreground">
          <span suppressHydrationWarning>{now}</span>
          <span className="text-border">UTC</span>
        </div>
      </header>

      {/* Auto-rotate progress */}
      {autoRotate && (
        <div className="h-0.5 bg-muted/40">
          <motion.div
            key={sceneIdx}
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
          />
        </div>
      )}

      {/* Scenes */}
      <div className="flex-1 p-4 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={SCENES[sceneIdx].id}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="h-full"
          >
            {SCENES[sceneIdx].id === "command"   && <SceneCommand   />}
            {SCENES[sceneIdx].id === "stream"    && <SceneStream    />}
            {SCENES[sceneIdx].id === "campaign"  && <SceneCampaigns liveActors={liveActors} />}
            {SCENES[sceneIdx].id === "killchain" && <SceneKillchain top={top} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ticker */}
      <footer className="border-t border-border/40 bg-card/40 backdrop-blur h-10 flex items-center overflow-hidden">
        <div className="px-3 text-[10px] font-mono uppercase tracking-widest text-neon-cyan shrink-0 border-r border-border/40 h-full flex items-center">
          live feed
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap font-mono text-[11px] py-2">
            {tickerItems().concat(tickerItems()).map((t, i) => (
              <span key={i} className="px-6 flex items-center gap-2 shrink-0">
                <Badge variant={SEV_VARIANT[t.sev]}>{t.sev}</Badge>
                <span className="text-foreground/90">{t.text}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{t.host}</span>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function tickerItems(): { sev: Severity; text: string; host: string }[] {
  return [
    { sev: "critical", text: "Ransomware staging — 480 MB egress to internal CI",      host: "fin-db-prod-01"   },
    { sev: "high",     text: "LSASS memory access blocked by EDR",                     host: "win-jumpbox-01"   },
    { sev: "high",     text: "Beaconing pattern: jittered HTTPS to known C2",          host: "win-jumpbox-01"   },
    { sev: "medium",   text: "IAM key used from new ASN (AS-RU-PRIVATE)",              host: "ci-deploy-bot"    },
    { sev: "low",      text: "Sigma rule 'beacon-jitter-60s' deployed fleet-wide",     host: "all"              },
    { sev: "info",     text: "Conditional access blocked legacy IMAP from public IP",  host: "azure-ad"         },
    { sev: "medium",   text: "Impossible travel: login PL → SG within 22 min",         host: "j.patel@acme.io"  },
    { sev: "high",     text: "Unsigned service install with SYSTEM autorun",            host: "dev-build-runner" },
  ];
}

// ─── SCENES ────────────────────────────────────────────────────────────────

function SceneCommand() {
  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
      <div className="col-span-8 row-span-3"><EventVolumeChart /></div>
      <div className="col-span-4 row-span-3"><SeverityDonut /></div>
      <div className="col-span-4 row-span-3"><AgentStatusGrid /></div>
      <div className="col-span-8 row-span-3"><ThreatMap /></div>
    </div>
  );
}

function SceneStream() {
  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
      <div className="col-span-8 row-span-6"><EventFeed /></div>
      <div className="col-span-4 row-span-3"><HotIncidentBanner /></div>
      <div className="col-span-4 row-span-3"><MetricsTile /></div>
    </div>
  );
}

function SceneCampaigns({ liveActors }: { liveActors: typeof THREAT_ACTORS }) {
  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
      <div className="col-span-7 row-span-6"><ThreatMap /></div>
      <div className="col-span-5 row-span-3"><ThreatFeed /></div>
      <div className="col-span-5 row-span-3">
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle>Top attributed actors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {liveActors.map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded-md border border-border/40">
                <div className="h-8 w-8 rounded-md bg-severity-critical/10 border border-severity-critical/40 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-severity-critical" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.name}</span>
                    <Badge variant={SEV_VARIANT[a.severity]}>{a.severity}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {a.origin} · {a.motivation}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SceneKillchain({ top }: { top: typeof SEED_INCIDENTS[number] }) {
  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
      <div className="col-span-8 row-span-6"><IncidentTimeline /></div>
      <div className="col-span-4 row-span-2"><HotIncidentBanner /></div>
      <div className="col-span-4 row-span-4">
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle>Active critical incident</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={SEV_VARIANT[top.severity]}>{top.severity}</Badge>
              <span className="text-[10px] font-mono text-muted-foreground">{top.id}</span>
              <span className="text-[10px] uppercase tracking-wider text-severity-high">
                {top.status}
              </span>
            </div>
            <div className="text-sm font-semibold leading-snug">{top.title}</div>
            <div className="text-xs text-muted-foreground">{top.summary}</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Mini label="Score"  value={`${top.score}`} accent="text-severity-critical" />
              <Mini label="Events" value={`${top.eventIds.length}`}  accent="text-neon-cyan" />
              <Mini label="Assets" value={`${top.affectedAssets.length}`} accent="text-neon-purple" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HotIncidentBanner() {
  const top = SEED_INCIDENTS[0];
  return (
    <Card className="h-full overflow-hidden border-severity-critical/40 relative">
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-severity-critical/15 blur-3xl" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-severity-critical" />
          Active critical
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={SEV_VARIANT[top.severity]}>{top.severity}</Badge>
          <span className="text-[10px] font-mono text-muted-foreground">{top.id}</span>
        </div>
        <div className="text-sm font-semibold leading-snug">{top.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-3">{top.summary}</div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Mini label="Score"  value={`${top.score}`} accent="text-severity-critical" />
          <Mini label="Events" value={`${top.eventIds.length}`}  accent="text-neon-cyan" />
          <Mini label="Assets" value={`${top.affectedAssets.length}`} accent="text-neon-purple" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsTile() {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-neon-cyan" />
          Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-2 gap-2 text-center">
        <Mini label="EPS"     value="1,247"   accent="text-neon-cyan" />
        <Mini label="p95 (ms)" value="38"      accent="text-foreground" />
        <Mini label="MTTR"    value="12m"     accent="text-neon-green" />
        <Mini label="Blocked" value="318"     accent="text-neon-purple" />
        <Mini label="Open"    value="4"       accent="text-severity-high" />
        <Mini label="Critical"value="1"       accent="text-severity-critical" />
      </CardContent>
    </Card>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-2">
      <div className={cn("text-xl font-mono font-bold leading-none", accent)}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
