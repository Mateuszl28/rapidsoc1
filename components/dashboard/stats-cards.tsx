"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  Activity,
  Bug,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  delta: number;             // %
  trend: number[];           // sparkline
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const STATS: Stat[] = [
  {
    label: "Open incidents",
    value: "4",
    delta: +33,
    trend: [1, 2, 1, 3, 2, 4, 3, 4],
    icon: ShieldAlert,
    accent: "text-severity-critical",
  },
  {
    label: "Events / sec",
    value: "1,247",
    delta: +8,
    trend: [800, 920, 1010, 980, 1100, 1180, 1210, 1247],
    icon: Activity,
    accent: "text-neon-cyan",
  },
  {
    label: "Threats blocked (24h)",
    value: "318",
    delta: -12,
    trend: [340, 360, 350, 330, 320, 318, 318, 318],
    icon: Bug,
    accent: "text-neon-green",
  },
  {
    label: "MTTR (mean)",
    value: "12m 04s",
    delta: -22,
    trend: [22, 20, 18, 16, 15, 14, 13, 12],
    icon: Zap,
    accent: "text-neon-purple",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className="relative overflow-hidden p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 text-2xl font-bold font-mono tracking-tight">
                  {s.value}
                </div>
              </div>
              <div className={cn("rounded-md p-1.5 bg-muted/40", s.accent)}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2 flex items-end justify-between gap-2">
              <Sparkline points={s.trend} className={s.accent} />
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-semibold",
                  s.delta >= 0 ? "text-severity-high" : "text-neon-green"
                )}
              >
                {s.delta >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {s.delta > 0 ? "+" : ""}
                {s.delta}%
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function Sparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 96, h = 28;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className={cn("opacity-90", className)}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
