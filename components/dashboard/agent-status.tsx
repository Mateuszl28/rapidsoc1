"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGENT_ORDER, AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { FileText, Network, Radar, ShieldAlert, Wrench } from "lucide-react";

const ICONS = {
  "threat-detection": Radar,
  "root-cause": Network,
  "risk-assessment": ShieldAlert,
  remediation: Wrench,
  "incident-report": FileText,
} as const;

export function AgentStatusGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-agent workflow</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2 space-y-2">
        {AGENT_ORDER.map((id, i) => {
          const a = AGENTS[id];
          const Icon = ICONS[id];
          // Synthetic health for the overview card
          const health = [98, 96, 99, 97, 95][i];
          const load   = [42, 31, 18, 24, 12][i];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/30 transition-colors"
            >
              <div className={cn(
                "h-8 w-8 rounded-md border flex items-center justify-center shrink-0",
                id === "threat-detection" && "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5",
                id === "root-cause"       && "text-neon-purple border-neon-purple/40 bg-neon-purple/5",
                id === "risk-assessment"  && "text-severity-high border-severity-high/40 bg-severity-high/5",
                id === "remediation"      && "text-neon-green border-neon-green/40 bg-neon-green/5",
                id === "incident-report"  && "text-severity-info border-severity-info/40 bg-severity-info/5",
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{a.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{a.role}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-neon-green">
                  {health}% ✓
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  load {load}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
