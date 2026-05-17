"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ShieldCheck, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Header() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 shrink-0 border-b border-border/40 bg-card/40 backdrop-blur-sm flex items-center gap-3 px-4">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
        <span className="text-foreground">DEFCON 3</span>
        <span className="text-border">·</span>
        <span>posture: elevated</span>
      </div>

      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="Search events, hosts, IOCs, MITRE…"
          className="w-full h-8 pl-8 pr-3 rounded-md bg-muted/40 border border-border/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-muted-foreground font-mono">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse-glow" />
          Agents online
        </Badge>

        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <Activity className="h-3 w-3 text-neon-cyan" />
          <span>1.2k EPS</span>
          <span className="text-border">·</span>
          <span>p95 38ms</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span suppressHydrationWarning>{time}</span>
          <span className="text-border">UTC</span>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-severity-critical animate-pulse-glow" />
        </Button>

        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-[10px] font-bold">
          MC
        </div>
      </div>
    </header>
  );
}
