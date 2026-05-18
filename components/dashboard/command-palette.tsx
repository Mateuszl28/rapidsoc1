"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SEED_INCIDENTS, ASSETS } from "@/lib/mock-data";
import { HUNT_EXAMPLES } from "@/lib/hunt-engine";
import { THREAT_ACTORS } from "@/lib/threat-intel";
import {
  AlertTriangle,
  Crosshair,
  LayoutDashboard,
  Network,
  Radar,
  Search,
  Server,
  ShieldAlert,
  Skull,
  Sparkles,
  Terminal,
  Globe2,
} from "lucide-react";

type ResultKind = "nav" | "incident" | "asset" | "actor" | "hunt" | "action";

interface Result {
  id: string;
  kind: ResultKind;
  label: string;
  sub?: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
}

const KIND_ACCENT: Record<ResultKind, string> = {
  nav: "text-neon-cyan",
  incident: "text-severity-critical",
  asset: "text-neon-purple",
  actor: "text-severity-high",
  hunt: "text-neon-green",
  action: "text-neon-pink",
};

const KIND_LABEL: Record<ResultKind, string> = {
  nav: "Navigation",
  incident: "Incidents",
  asset: "Assets",
  actor: "Threat actors",
  hunt: "Hunt queries",
  action: "Actions",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // open/close on Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQ("");
      setIdx(0);
    }
  }, [open]);

  const all = useMemo<Result[]>(() => {
    const nav: Result[] = [
      { id: "nav-overview",  kind: "nav", label: "Overview",        sub: "/",              href: "/",              icon: LayoutDashboard, keywords: "overview home dashboard" },
      { id: "nav-incidents", kind: "nav", label: "Incidents",       sub: "/incidents",     href: "/incidents",     icon: ShieldAlert,     keywords: "incidents list" },
      { id: "nav-hunt",      kind: "nav", label: "Threat hunting",  sub: "/hunt",          href: "/hunt",          icon: Terminal,        keywords: "hunt search query soc-ql" },
      { id: "nav-assets",    kind: "nav", label: "Assets",          sub: "/assets",        href: "/assets",        icon: Server,          keywords: "assets hosts inventory" },
      { id: "nav-ti",        kind: "nav", label: "Threat intel",    sub: "/threat-intel",  href: "/threat-intel",  icon: Globe2,          keywords: "threat intel actors campaigns ioc mitre" },
    ];
    const incidents: Result[] = SEED_INCIDENTS.map((i) => ({
      id: `inc-${i.id}`,
      kind: "incident",
      label: `${i.id} · ${i.title}`,
      sub: `${i.severity} · score ${i.score} · ${i.status}`,
      href: `/incidents/${i.id}`,
      icon: AlertTriangle,
      keywords: `${i.id} ${i.title} ${i.summary} ${i.affectedAssets.join(" ")} ${i.severity}`,
    }));
    const assets: Result[] = ASSETS.map((a) => ({
      id: `ast-${a.id}`,
      kind: "asset",
      label: a.hostname,
      sub: `${a.ip} · ${a.os} · ${a.criticality} · risk ${a.riskScore}`,
      href: `/assets/${encodeURIComponent(a.hostname)}`,
      icon: Server,
      keywords: `${a.hostname} ${a.ip} ${a.owner} ${a.os}`,
    }));
    const actors: Result[] = THREAT_ACTORS.map((a) => ({
      id: `act-${a.id}`,
      kind: "actor",
      label: a.name,
      sub: `${a.origin} · ${a.motivation}`,
      href: `/threat-intel`,
      icon: Skull,
      keywords: `${a.name} ${a.aliases.join(" ")} ${a.origin}`,
    }));
    const hunts: Result[] = HUNT_EXAMPLES.map((h, i) => ({
      id: `hunt-${i}`,
      kind: "hunt",
      label: h.label,
      sub: h.query,
      href: `/hunt`,
      icon: Crosshair,
      keywords: h.label + " " + h.query,
    }));
    const actions: Result[] = [
      { id: "act-detect", kind: "action", label: "Run all agents on INC-2041", sub: "open active incident and trigger multi-agent workflow",
        href: "/incidents/INC-2041", icon: Sparkles, keywords: "run agents triage" },
      { id: "act-hunt-go", kind: "action", label: "New threat hunt", sub: "open the SOC-QL console", href: "/hunt", icon: Radar,
        keywords: "search query investigate" },
    ];
    return [...nav, ...incidents, ...assets, ...actors, ...hunts, ...actions];
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      // sensible default ranking when no query
      return all.filter((r) => r.kind === "nav" || r.kind === "incident").slice(0, 8);
    }
    const scored = all
      .map((r) => {
        const hay = `${r.label} ${r.keywords}`.toLowerCase();
        if (!hay.includes(query)) return { r, score: 0 };
        let score = 1;
        if (r.label.toLowerCase().startsWith(query)) score += 4;
        if (r.label.toLowerCase().includes(query)) score += 2;
        if (r.keywords.toLowerCase().includes(query)) score += 1;
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
    return scored.map((s) => s.r);
  }, [q, all]);

  useEffect(() => {
    setIdx(0);
  }, [q]);

  const choose = (r: Result | undefined) => {
    if (!r) return;
    if (r.href) router.push(r.href);
    r.action?.();
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(filtered[idx]);
    }
  };

  // group results for the display
  const groups = useMemo(() => {
    const m = new Map<ResultKind, Result[]>();
    for (const r of filtered) {
      if (!m.has(r.kind)) m.set(r.kind, []);
      m.get(r.kind)!.push(r);
    }
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.14 }}
            className="w-full max-w-2xl mx-4 rounded-lg border border-border/60 bg-card shadow-2xl shadow-black/50 overflow-hidden glow-cyan"
          >
            <div className="flex items-center gap-2 px-3 border-b border-border/40">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Find incidents, assets, threat actors, hunts…  (Cmd+K)"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <span className="text-[9px] font-mono text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                ESC
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {groups.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-12">
                  No matches.
                </div>
              )}
              {groups.map(([kind, items]) => (
                <div key={kind} className="px-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mt-2 mb-1">
                    {KIND_LABEL[kind]}
                  </div>
                  <ul>
                    {items.map((r) => {
                      const globalIndex = filtered.indexOf(r);
                      const Icon = r.icon;
                      const active = globalIndex === idx;
                      return (
                        <li key={r.id}>
                          <button
                            onMouseEnter={() => setIdx(globalIndex)}
                            onClick={() => choose(r)}
                            className={cn(
                              "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                              active && "bg-accent/60"
                            )}
                          >
                            <div className={cn(
                              "h-7 w-7 rounded-md bg-muted/30 border border-border/40 flex items-center justify-center shrink-0",
                              KIND_ACCENT[kind]
                            )}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate">{r.label}</div>
                              {r.sub && (
                                <div className="text-[10px] text-muted-foreground font-mono truncate">{r.sub}</div>
                              )}
                            </div>
                            {active && (
                              <span className="text-[9px] font-mono text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                                ↵
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
              <span>↑↓ navigate · ↵ open · ESC close</span>
              <span className="flex items-center gap-1">
                <Network className="h-3 w-3" /> {all.length} items indexed
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
