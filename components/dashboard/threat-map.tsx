"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THREAT_FEED } from "@/lib/mock-data";
import type { Severity } from "@/lib/types";

const SEV_COLOR: Record<Severity, string> = {
  critical: "hsl(0 84% 60%)",
  high: "hsl(20 90% 55%)",
  medium: "hsl(40 95% 55%)",
  low: "hsl(190 90% 55%)",
  info: "hsl(220 80% 60%)",
};

// Project lat/lng onto a 720x320 viewBox (equirectangular).
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 720;
  const y = ((90 - lat) / 180) * 320;
  return { x, y };
}

const HOME = project(50, 12); // Frankfurt-ish anchor for our "SOC"

export function ThreatMap() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Active campaigns — geo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[720/320] bg-[hsl(222_30%_5%)]">
          <svg
            viewBox="0 0 720 320"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Dotted-grid "map" — stylized continents via blob clusters */}
            <defs>
              <pattern id="dot" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.7" fill="hsl(222 22% 22%)" />
              </pattern>
              <radialGradient id="ping" cx="50%" cy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* World silhouette blobs */}
            <g fill="hsl(222 22% 12%)" stroke="hsl(222 22% 22%)" strokeWidth="0.5">
              {/* North America */}
              <path d="M70,80 Q90,60 130,60 Q190,55 220,90 Q230,120 200,150 Q170,170 140,165 Q100,160 80,140 Q60,110 70,80Z" />
              {/* South America */}
              <path d="M200,180 Q220,170 235,200 Q240,240 225,275 Q205,295 190,275 Q180,240 195,205 Q198,190 200,180Z" />
              {/* Europe */}
              <path d="M340,75 Q370,65 395,80 Q400,100 380,115 Q355,120 340,105 Q330,90 340,75Z" />
              {/* Africa */}
              <path d="M355,130 Q390,125 410,160 Q420,210 395,240 Q370,250 355,225 Q340,190 350,160 Q352,140 355,130Z" />
              {/* Asia */}
              <path d="M430,75 Q500,60 570,80 Q600,110 590,150 Q540,170 480,160 Q440,140 430,110 Q425,90 430,75Z" />
              {/* Oceania */}
              <path d="M560,210 Q600,205 625,225 Q620,250 590,255 Q565,250 555,235 Q550,220 560,210Z" />
            </g>

            <rect width="720" height="320" fill="url(#dot)" opacity="0.5" />

            {/* SOC anchor */}
            <g>
              <circle cx={HOME.x} cy={HOME.y} r="3" fill="hsl(180 100% 55%)" />
              <circle cx={HOME.x} cy={HOME.y} r="8" fill="none" stroke="hsl(180 100% 55%)" strokeOpacity="0.5">
                <animate attributeName="r" from="3" to="20" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <text x={HOME.x + 8} y={HOME.y + 3} fontSize="9" fill="hsl(180 100% 55%)" fontFamily="monospace">SOC · acme.io</text>
            </g>

            {/* Threat origins + arcs */}
            {THREAT_FEED.map((t, i) => {
              const p = project(t.lat, t.lng);
              const color = SEV_COLOR[t.severity];
              const mid = {
                x: (p.x + HOME.x) / 2,
                y: Math.min(p.y, HOME.y) - 50 - i * 6,
              };
              const path = `M${p.x},${p.y} Q${mid.x},${mid.y} ${HOME.x},${HOME.y}`;
              return (
                <g key={t.id}>
                  <path d={path} fill="none" stroke={color} strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="3 3">
                    <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle cx={p.x} cy={p.y} r="2.5" fill={color}>
                    <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={color} strokeOpacity="0.4">
                    <animate attributeName="r" from="3" to="14" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" from="0.6" to="0" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Legend overlay */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[9px] font-mono">
            {(["critical", "high", "medium", "low", "info"] as Severity[]).map((s) => (
              <div key={s} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/60 backdrop-blur border border-border/60">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: SEV_COLOR[s] }} />
                <span className="uppercase tracking-wider text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
