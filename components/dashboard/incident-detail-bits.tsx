"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, formatTime } from "@/lib/utils";
import type { Asset, SecurityEvent, Severity } from "@/lib/types";
import type { EvidenceItem } from "@/lib/incident-helpers";
import { FileBox, FileImage, FileCode2, FileLock2, Network, FileText, Server } from "lucide-react";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const CRIT_VARIANT: Record<string, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export function EventTable({ events }: { events: SecurityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlated events ({events.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/20">
                <th className="text-left px-3 py-1.5 font-medium">Time</th>
                <th className="text-left px-3 py-1.5 font-medium">Sev</th>
                <th className="text-left px-3 py-1.5 font-medium">Category</th>
                <th className="text-left px-3 py-1.5 font-medium">Source</th>
                <th className="text-left px-3 py-1.5 font-medium">Description</th>
                <th className="text-left px-3 py-1.5 font-medium">Technique</th>
                <th className="text-right px-3 py-1.5 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border/40 hover:bg-accent/30">
                  <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                    {formatTime(e.timestamp)}
                  </td>
                  <td className="px-3 py-1.5">
                    <Badge variant={SEV_VARIANT[e.severity]}>{e.severity}</Badge>
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">{e.category}</td>
                  <td className="px-3 py-1.5 text-neon-cyan">{e.source}</td>
                  <td className="px-3 py-1.5 text-foreground/90">{e.description}</td>
                  <td className="px-3 py-1.5 text-severity-high">{e.technique ?? "—"}</td>
                  <td className="px-3 py-1.5 text-right">{e.score}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No correlated events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetList({ assets }: { assets: Asset[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affected assets ({assets.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2 space-y-1.5">
        {assets.length === 0 && (
          <div className="text-xs text-muted-foreground py-3 text-center">No assets matched.</div>
        )}
        {assets.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-2 rounded-md border border-border/40 hover:bg-accent/30">
            <div className="h-7 w-7 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center">
              <Server className="h-3.5 w-3.5 text-neon-cyan" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono truncate">{a.hostname}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {a.ip} · {a.os} · owner: {a.owner}
              </div>
            </div>
            <div className="text-right shrink-0">
              <Badge variant={CRIT_VARIANT[a.criticality]}>{a.criticality}</Badge>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                risk {a.riskScore}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const KIND_ICON: Record<EvidenceItem["kind"], React.ComponentType<{ className?: string }>> = {
  log: FileText,
  pcap: Network,
  image: FileBox,
  registry: FileLock2,
  binary: FileCode2,
  screenshot: FileImage,
};

export function EvidenceLocker({ items }: { items: EvidenceItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence locker</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1">
        {items.map((it) => {
          const Icon = KIND_ICON[it.kind];
          return (
            <div
              key={it.id}
              className="flex items-center gap-3 p-2 rounded-md border border-border/40 hover:bg-accent/30"
            >
              <div className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center border",
                it.kind === "binary"
                  ? "text-severity-critical border-severity-critical/40 bg-severity-critical/5"
                  : "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5"
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs truncate">{it.label}</div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">
                  {it.source} · {(it.sizeKB / 1024).toFixed(2)} MB · sha256:{it.sha256}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {it.kind}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(it.collectedAt)}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
