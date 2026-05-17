"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";
import { AGENT_ORDER, AGENTS } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  FileText,
  Network,
  Play,
  Radar,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";

const ICONS: Record<AgentId, React.ComponentType<{ className?: string }>> = {
  "threat-detection": Radar,
  "root-cause": Network,
  "risk-assessment": ShieldAlert,
  remediation: Wrench,
  "incident-report": FileText,
};

const ACCENT: Record<AgentId, string> = {
  "threat-detection": "text-neon-cyan border-neon-cyan/40",
  "root-cause":       "text-neon-purple border-neon-purple/40",
  "risk-assessment":  "text-severity-high border-severity-high/40",
  remediation:        "text-neon-green border-neon-green/40",
  "incident-report":  "text-severity-info border-severity-info/40",
};

const ACCENT_GLOW: Record<AgentId, string> = {
  "threat-detection": "glow-cyan",
  "root-cause":       "glow-purple",
  "risk-assessment":  "",
  remediation:        "",
  "incident-report":  "",
};

type RunState = {
  status: "idle" | "running" | "done" | "error";
  output: string;
  mode?: "live" | "mock";
};

const EMPTY: RunState = { status: "idle", output: "" };

export function AgentPanel({ incidentContext }: { incidentContext: string }) {
  const [runs, setRuns] = useState<Record<AgentId, RunState>>(() =>
    AGENT_ORDER.reduce(
      (acc, id) => ({ ...acc, [id]: EMPTY }),
      {} as Record<AgentId, RunState>
    )
  );
  const [active, setActive] = useState<AgentId>("threat-detection");
  const abortRef = useRef<AbortController | null>(null);

  const runAgent = useCallback(
    async (id: AgentId) => {
      abortRef.current?.abort();
      const ctl = new AbortController();
      abortRef.current = ctl;

      setRuns((r) => ({ ...r, [id]: { status: "running", output: "" } }));
      setActive(id);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agentId: id, context: incidentContext }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const mode = (res.headers.get("x-sentinel-mode") as "live" | "mock") ?? "live";
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          setRuns((r) => ({
            ...r,
            [id]: { status: "running", output: buf, mode },
          }));
        }
        setRuns((r) => ({
          ...r,
          [id]: { status: "done", output: buf, mode },
        }));
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setRuns((r) => ({
          ...r,
          [id]: {
            status: "error",
            output: `**Error:** ${(e as Error).message}`,
          },
        }));
      }
    },
    [incidentContext]
  );

  const runAll = useCallback(async () => {
    for (const id of AGENT_ORDER) {
      // eslint-disable-next-line no-await-in-loop
      await runAgent(id);
    }
  }, [runAgent]);

  const current = runs[active];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
          AI Agent Console
          {current?.mode === "mock" && (
            <Badge variant="outline" className="ml-1">mock mode</Badge>
          )}
          {current?.mode === "live" && (
            <Badge variant="success" className="ml-1">live · claude</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => runAgent(active)}>
            <Play className="h-3 w-3" />
            Run agent
          </Button>
          <Button size="sm" variant="neon" className="h-7 px-2 text-xs" onClick={runAll}>
            <Sparkles className="h-3 w-3" />
            Run all
          </Button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-5 border-b border-border/40">
        {AGENT_ORDER.map((id) => {
          const Icon = ICONS[id];
          const run = runs[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] uppercase tracking-wider transition-colors border-r border-border/40 last:border-r-0",
                "hover:bg-accent/40",
                isActive && "bg-accent/30"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center border",
                  ACCENT[id],
                  isActive && ACCENT_GLOW[id]
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] text-foreground/80 leading-tight text-center">
                {AGENTS[id].name}
              </span>
              <AgentStatusDot status={run.status} />
              {isActive && (
                <motion.div
                  layoutId="agent-active-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-neon-cyan"
                />
              )}
            </button>
          );
        })}
      </div>

      <CardContent className="p-0">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            System prompt · {AGENTS[active].name}
          </div>
          <div className="text-xs text-muted-foreground/90 mt-0.5 line-clamp-2">
            {AGENTS[active].role}
          </div>
        </div>

        <div className="p-4 min-h-[260px] max-h-[420px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {current.status === "idle" && (
                <EmptyState onRun={() => runAgent(active)} />
              )}
              {current.output && (
                <>
                  <Markdown content={current.output} />
                  {current.status === "running" && (
                    <span className="inline-block w-2 h-3 bg-neon-cyan animate-blink align-baseline ml-1" />
                  )}
                </>
              )}
              {current.status === "running" && !current.output && <RunningSkeleton />}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentStatusDot({ status }: { status: RunState["status"] }) {
  const cls =
    status === "running" ? "bg-neon-cyan animate-pulse-glow"
    : status === "done"  ? "bg-neon-green"
    : status === "error" ? "bg-severity-critical"
    :                       "bg-muted-foreground/40";
  return <span className={cn("h-1.5 w-1.5 rounded-full", cls)} />;
}

function EmptyState({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <Sparkles className="h-6 w-6 text-neon-purple mb-2" />
      <div className="text-sm font-medium">Agent idle</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-xs">
        Click <span className="text-foreground font-semibold">Run agent</span> to stream Claude's analysis of the current incident, or
        <span className="text-foreground font-semibold"> Run all</span> to execute the full multi-agent workflow.
      </div>
      <Button size="sm" variant="neon" className="mt-3 text-xs" onClick={onRun}>
        <Play className="h-3 w-3" />
        Run agent
      </Button>
    </div>
  );
}

function RunningSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-1/2 rounded shimmer-bg" />
      <div className="h-3 w-3/4 rounded shimmer-bg" />
      <div className="h-3 w-2/3 rounded shimmer-bg" />
      <div className="h-3 w-5/6 rounded shimmer-bg" />
    </div>
  );
}
