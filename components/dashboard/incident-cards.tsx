"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Incident, Severity } from "@/lib/types";
import { ChevronRight, Users, AlertTriangle } from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const SCORE_BAR: Record<Severity, string> = {
  critical: "!bg-severity-critical",
  high: "!bg-severity-high",
  medium: "!bg-severity-medium",
  low: "!bg-severity-low",
  info: "!bg-severity-info",
};

export function IncidentCards({
  incidents,
  activeId,
  onSelect,
}: {
  incidents: Incident[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {incidents.map((inc, i) => (
        <motion.div
          key={inc.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={`/incidents/${inc.id}`}
            onMouseEnter={() => onSelect?.(inc.id)}
            className="block"
          >
            <Card
              className={cn(
                "p-3 transition-colors hover:bg-accent/40 cursor-pointer",
                activeId === inc.id && "border-neon-cyan/50 glow-cyan",
                inc.severity === "critical" && "border-severity-critical/40"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={SEV_VARIANT[inc.severity]}>
                      {inc.severity}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {inc.id}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      · {formatRelativeTime(inc.openedAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium leading-snug">
                    {inc.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {inc.summary}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>

              <div className="mt-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {inc.eventIds.length} events
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {inc.assignee ?? "unassigned"}
                </span>
                <span className="ml-auto font-mono">
                  status:{" "}
                  <span className={cn(
                    "uppercase tracking-wider",
                    inc.status === "investigating" && "text-severity-high",
                    inc.status === "resolved" && "text-neon-green",
                    inc.status === "contained" && "text-neon-cyan",
                  )}>
                    {inc.status}
                  </span>
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Progress
                  value={inc.score}
                  className="h-1.5"
                  indicatorClassName={SCORE_BAR[inc.severity]}
                />
                <span className="text-[10px] font-mono w-8 text-right">
                  {inc.score}
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
