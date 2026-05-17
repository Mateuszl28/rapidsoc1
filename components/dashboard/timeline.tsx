"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import type { AttackChainNode } from "@/lib/types";
import { ATTACK_TIMELINE } from "@/lib/mock-data";
import { cn, formatRelativeTime } from "@/lib/utils";

const STAGE_COLOR: Record<AttackChainNode["stage"], string> = {
  reconnaissance: "text-severity-info",
  "initial-access": "text-severity-medium",
  execution: "text-severity-high",
  persistence: "text-severity-high",
  "privilege-escalation": "text-severity-critical",
  "defense-evasion": "text-neon-purple",
  "credential-access": "text-severity-critical",
  "lateral-movement": "text-severity-critical",
  exfiltration: "text-severity-critical",
  impact: "text-severity-critical",
};

export function IncidentTimeline() {
  const total = ATTACK_TIMELINE.length;
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(total);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= total) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setCursor((c) => c + 1), 1100);
    return () => clearTimeout(id);
  }, [playing, cursor, total]);

  const replay = () => {
    setCursor(0);
    setPlaying(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Kill-chain replay · INC-2041</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={replay}
          >
            <RotateCcw className="h-3 w-3" />
            Replay
          </Button>
          <Button
            size="sm"
            variant="neon"
            className="h-7 px-2 text-xs"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border/60" />
          <div className="space-y-3">
            {ATTACK_TIMELINE.map((node, i) => {
              const revealed = i < cursor;
              const active = i === cursor - 1;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    opacity: revealed ? 1 : 0.25,
                    x: revealed ? 0 : -4,
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative pl-9"
                >
                  <span
                    className={cn(
                      "absolute left-1 top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                      revealed
                        ? "bg-card border-neon-cyan"
                        : "bg-muted/40 border-border",
                      active && "animate-pulse-glow"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        revealed ? "bg-neon-cyan" : "bg-border"
                      )}
                    />
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-semibold",
                        STAGE_COLOR[node.stage]
                      )}
                    >
                      {node.stage.replace("-", " ")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatRelativeTime(node.timestamp)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground/90">
                    {node.description}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {node.evidence.map((ev, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
