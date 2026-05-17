"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { SEED_EVENTS } from "@/lib/mock-data";
import type { SecurityEvent, Severity } from "@/lib/types";
import { Pause, Play, Terminal, Filter } from "lucide-react";

const MAX_EVENTS = 80;

const SEV_DOT: Record<Severity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

const SEV_TEXT: Record<Severity, string> = {
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
  info: "text-severity-info",
};

export function EventFeed() {
  const [events, setEvents] = useState<SecurityEvent[]>(SEED_EVENTS);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (msg) => {
      if (pausedRef.current) return;
      try {
        const ev = JSON.parse(msg.data) as SecurityEvent;
        setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => e.severity === filter);

  return (
    <Card className="overflow-hidden relative">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-neon-cyan" />
          <span>Live SIEM feed</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              paused ? "bg-muted-foreground" : "bg-neon-green animate-pulse-glow"
            )} />
            {paused ? "paused" : "streaming"}
          </span>
        </CardTitle>
        <div className="flex items-center gap-1">
          <FilterSelect value={filter} onChange={setFilter} />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={scrollerRef}
          className="terminal relative max-h-[420px] overflow-y-auto px-3 py-2 scan-line"
        >
          <AnimatePresence initial={false}>
            {filtered.map((ev) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-2 py-1 group"
              >
                <span className="text-muted-foreground/70 shrink-0 select-none">
                  {formatTime(ev.timestamp)}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                    SEV_DOT[ev.severity],
                    ev.severity === "critical" && "animate-pulse-glow"
                  )}
                />
                <span
                  className={cn(
                    "uppercase tracking-wider shrink-0 w-[58px] text-[10px]",
                    SEV_TEXT[ev.severity]
                  )}
                >
                  {ev.severity}
                </span>
                <span className="text-muted-foreground shrink-0">{ev.source}</span>
                <span className="text-muted-foreground/60 shrink-0">›</span>
                <span className="text-foreground/90">
                  {ev.description}
                  {ev.host && (
                    <span className="ml-1 text-neon-cyan">host={ev.host}</span>
                  )}
                  {ev.sourceIp && (
                    <span className="ml-1 text-neon-purple">src={ev.sourceIp}</span>
                  )}
                  {ev.technique && (
                    <span className="ml-1 text-severity-high">
                      [{ev.technique}]
                    </span>
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="text-muted-foreground/40 mt-1 flex items-center gap-1">
            sentinel@soc:~$
            <span className="inline-block w-2 h-3 bg-neon-cyan animate-blink" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value,
  onChange,
}: {
  value: Severity | "all";
  onChange: (v: Severity | "all") => void;
}) {
  const opts: (Severity | "all")[] = ["all", "critical", "high", "medium", "low", "info"];
  return (
    <div className="hidden md:flex items-center gap-1">
      <Filter className="h-3 w-3 text-muted-foreground" />
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded",
            value === o
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
