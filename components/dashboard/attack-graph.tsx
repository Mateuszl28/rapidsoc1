"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttackGraph, GraphEdge, GraphNode, GraphNodeKind } from "@/lib/incident-helpers";
import { cn } from "@/lib/utils";
import {
  Globe,
  Laptop,
  Server,
  UserRound,
  Database,
  Crosshair,
} from "lucide-react";

interface Pos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const KIND_ICON: Record<GraphNodeKind, React.ComponentType<{ className?: string }>> = {
  attacker: Crosshair,
  host: Server,
  identity: UserRound,
  ioc: Globe,
  data: Database,
};

const KIND_COLOR: Record<GraphNodeKind, string> = {
  attacker: "hsl(0 84% 60%)",
  host: "hsl(180 100% 55%)",
  identity: "hsl(40 95% 55%)",
  ioc: "hsl(270 90% 65%)",
  data: "hsl(140 100% 55%)",
};

const W = 720;
const H = 420;

export function AttackGraphView({ graph }: { graph: AttackGraph }) {
  const positions = useForceLayout(graph);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const focus = pinned ?? hover;

  const nodeMap = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n] as const)), [graph]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Attack graph</CardTitle>
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          {(["attacker", "host", "identity", "ioc", "data"] as GraphNodeKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/30 border border-border/40">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
              <span className="uppercase tracking-wider text-muted-foreground">{k}</span>
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative aspect-[720/420] bg-[hsl(222_30%_5%)]">
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(215 16% 60%)" />
              </marker>
              <marker
                id="arrow-bad"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(0 84% 60%)" />
              </marker>
            </defs>

            {/* Edges */}
            {graph.edges.map((e, i) => {
              const a = positions[e.from];
              const b = positions[e.to];
              if (!a || !b) return null;
              const isFocused =
                focus && (focus === e.from || focus === e.to);
              const stroke = e.malicious ? "hsl(0 84% 60%)" : "hsl(215 16% 60%)";
              const opacity = focus && !isFocused ? 0.15 : e.malicious ? 0.9 : 0.55;
              return (
                <g key={i} opacity={opacity}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={stroke}
                    strokeWidth={e.malicious ? 1.6 : 1}
                    strokeDasharray={e.malicious ? "5 3" : "0"}
                    markerEnd={`url(#${e.malicious ? "arrow-bad" : "arrow"})`}
                  >
                    {e.malicious && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-16"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                    )}
                  </line>
                  <EdgeLabel a={a} b={b} text={e.label} muted={!isFocused && Boolean(focus)} />
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((n) => {
              const p = positions[n.id];
              if (!p) return null;
              const focused = focus === n.id;
              const dim = focus && !focused;
              const Icon = KIND_ICON[n.kind];
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  className="cursor-pointer"
                  opacity={dim ? 0.3 : 1}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned((c) => (c === n.id ? null : n.id))}
                >
                  {n.critical && (
                    <circle r={20} fill={KIND_COLOR[n.kind]} fillOpacity={0.0} stroke={KIND_COLOR[n.kind]} strokeOpacity={0.5}>
                      <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={focused ? 16 : 13}
                    fill="hsl(222 30% 7%)"
                    stroke={KIND_COLOR[n.kind]}
                    strokeWidth={focused ? 2 : 1.4}
                  />
                  {/* center icon */}
                  <foreignObject x={-8} y={-8} width={16} height={16}>
                    <div className="flex items-center justify-center w-full h-full" style={{ color: KIND_COLOR[n.kind] }}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </foreignObject>
                  <text
                    x={0}
                    y={28}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    fill="hsl(210 25% 92%)"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Side detail panel */}
          {focus && (
            <div className="absolute top-2 right-2 w-64 rounded-md border border-border/60 bg-background/85 backdrop-blur p-3">
              {(() => {
                const n = nodeMap.get(focus)!;
                const inc = graph.edges.filter((e) => e.to === focus);
                const outg = graph.edges.filter((e) => e.from === focus);
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: KIND_COLOR[n.kind] }}
                      />
                      <span className="text-xs font-semibold">{n.label}</span>
                      <Badge variant="outline" className="ml-auto">{n.kind}</Badge>
                    </div>
                    {n.meta && (
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {n.meta}
                      </div>
                    )}
                    <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Inbound
                    </div>
                    <ul className="space-y-0.5">
                      {inc.length === 0 && <li className="text-[10px] text-muted-foreground/60">—</li>}
                      {inc.map((e, i) => (
                        <li key={i} className="text-[10px] flex items-center gap-1">
                          <span className="text-muted-foreground">{nodeMap.get(e.from)?.label}</span>
                          <span className="text-muted-foreground/50">›</span>
                          <span className={e.malicious ? "text-severity-critical" : "text-foreground/80"}>
                            {e.label}
                          </span>
                          {e.technique && (
                            <span className="text-severity-high font-mono">[{e.technique}]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Outbound
                    </div>
                    <ul className="space-y-0.5">
                      {outg.length === 0 && <li className="text-[10px] text-muted-foreground/60">—</li>}
                      {outg.map((e, i) => (
                        <li key={i} className="text-[10px] flex items-center gap-1">
                          <span className={e.malicious ? "text-severity-critical" : "text-foreground/80"}>
                            {e.label}
                          </span>
                          <span className="text-muted-foreground/50">›</span>
                          <span className="text-muted-foreground">{nodeMap.get(e.to)?.label}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </div>
          )}

          {!focus && (
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-muted-foreground/70">
              hover a node · click to pin
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EdgeLabel({
  a,
  b,
  text,
  muted,
}: {
  a: Pos;
  b: Pos;
  text: string;
  muted: boolean;
}) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return (
    <text
      x={mx}
      y={my - 4}
      fontSize="8"
      textAnchor="middle"
      fill={muted ? "hsl(215 16% 60% / 0.4)" : "hsl(215 16% 70%)"}
      fontFamily="ui-monospace, monospace"
      style={{ pointerEvents: "none" }}
    >
      {text}
    </text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tiny force layout — runs purely on the client, no external deps.
// ─────────────────────────────────────────────────────────────────────────────

function useForceLayout(graph: AttackGraph): Record<string, Pos> {
  const [, force] = useState(0);
  const positions = useRef<Record<string, Pos>>({});
  const initialized = useRef<string>("");

  // (Re)init when graph changes
  useEffect(() => {
    const sig = graph.nodes.map((n) => n.id).join("|");
    if (sig === initialized.current) return;
    initialized.current = sig;
    const next: Record<string, Pos> = {};
    const N = graph.nodes.length;
    graph.nodes.forEach((n, i) => {
      const angle = (i / Math.max(1, N)) * Math.PI * 2;
      next[n.id] = {
        x: W / 2 + Math.cos(angle) * 140 + (Math.random() - 0.5) * 20,
        y: H / 2 + Math.sin(angle) * 110 + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
      };
    });
    positions.current = next;
    force((t) => t + 1);
  }, [graph]);

  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const tick = () => {
      step(graph, positions.current);
      frame++;
      // only re-render every few frames to save CPU
      if (frame % 2 === 0) force((t) => t + 1);
      if (frame < 480) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [graph]);

  return positions.current;
}

function step(graph: AttackGraph, pos: Record<string, Pos>) {
  const REPEL = 6500;
  const SPRING = 0.013;
  const DAMP = 0.86;
  const MIN_DIST = 50;
  const CENTER_PULL = 0.0025;

  const ids = graph.nodes.map((n) => n.id);

  // Repulsion
  for (let i = 0; i < ids.length; i++) {
    const a = pos[ids[i]];
    if (!a) continue;
    for (let j = i + 1; j < ids.length; j++) {
      const b = pos[ids[j]];
      if (!b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 0.001;
      const d = Math.sqrt(d2);
      const f = REPEL / d2;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
  }

  // Spring along edges
  for (const e of graph.edges) {
    const a = pos[e.from]; const b = pos[e.to];
    if (!a || !b) continue;
    const dx = b.x - a.x; const dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const stretch = d - 130;
    const fx = (dx / (d || 1)) * stretch * SPRING;
    const fy = (dy / (d || 1)) * stretch * SPRING;
    a.vx += fx; a.vy += fy;
    b.vx -= fx; b.vy -= fy;
  }

  // Center pull + integrate + damping + clamp
  for (const id of ids) {
    const p = pos[id]; if (!p) continue;
    p.vx += (W / 2 - p.x) * CENTER_PULL;
    p.vy += (H / 2 - p.y) * CENTER_PULL;
    p.vx *= DAMP; p.vy *= DAMP;
    p.x += p.vx; p.y += p.vy;
    p.x = Math.max(MIN_DIST, Math.min(W - MIN_DIST, p.x));
    p.y = Math.max(MIN_DIST, Math.min(H - MIN_DIST, p.y));
  }
}
