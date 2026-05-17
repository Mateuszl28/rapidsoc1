"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { THREAT_FEED } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { Globe2, Crosshair } from "lucide-react";
import type { Severity } from "@/lib/types";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export function ThreatFeed() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-neon-purple" />
          Global threat intel
          <Badge variant="outline" className="ml-1">
            6 active campaigns
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {/* Ticker */}
          <div className="border-b border-border/40 bg-muted/20 overflow-hidden">
            <div className="flex whitespace-nowrap animate-ticker font-mono text-[10px] py-1.5">
              {[...THREAT_FEED, ...THREAT_FEED].map((t, i) => (
                <span key={i} className="px-4 flex items-center gap-2 shrink-0">
                  <Crosshair className="h-2.5 w-2.5 text-severity-critical" />
                  <span className="text-neon-cyan">{t.actor}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{t.family}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{t.region}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="max-h-[260px] overflow-y-auto">
            {THREAT_FEED.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-3 py-2 border-b border-border/40 last:border-b-0 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={SEV_VARIANT[t.severity]}>{t.severity}</Badge>
                      <span className="text-xs font-semibold">{t.actor}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {t.family}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-foreground/85 line-clamp-2">
                      {t.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {t.region}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(t.firstSeen)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
