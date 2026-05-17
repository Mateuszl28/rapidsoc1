"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldAlert,
  Radar,
  Network,
  FileText,
  Wrench,
  Server,
  Globe2,
  Settings,
  Activity,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Overview",     badge: null,        active: true  },
  { icon: ShieldAlert,     label: "Incidents",    badge: "4",         active: false },
  { icon: Radar,           label: "Detections",   badge: "live",      active: false },
  { icon: Network,         label: "Kill Chain",   badge: null,        active: false },
  { icon: Activity,        label: "Hunting",      badge: null,        active: false },
  { icon: FileText,        label: "Reports",      badge: null,        active: false },
  { icon: Wrench,          label: "Playbooks",    badge: null,        active: false },
  { icon: Server,          label: "Assets",       badge: "247",       active: false },
  { icon: Globe2,          label: "Threat Intel", badge: null,        active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/40 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border/40">
        <div className="relative h-7 w-7 rounded-md bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_20px_-4px_hsl(180_100%_55%/0.7)]">
          <ShieldAlert className="h-4 w-4 text-background" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-neon-green animate-pulse-glow" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Sentinel AI</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            SOC · v1.0
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ icon: Icon, label, badge, active }) => (
          <button
            key={label}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              active && "bg-accent text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
              <span
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold",
                  badge === "live"
                    ? "bg-neon-green/15 text-neon-green animate-pulse-glow"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-border/40">
        <button className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground hover:bg-accent">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
        <div className="mt-2 mx-2 p-2 rounded-md bg-muted/40 border border-border/40">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Tenant
          </div>
          <div className="text-xs font-medium">acme.io · prod</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            EU-Central · SOC-Tier-2
          </div>
        </div>
      </div>
    </aside>
  );
}
