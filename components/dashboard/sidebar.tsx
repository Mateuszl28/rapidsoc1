"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ScrollText,
  Tv2,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge: string | null;
  href: string;
  match?: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview",     badge: null,   href: "/" },
  { icon: ShieldAlert,     label: "Incidents",    badge: "4",    href: "/incidents",        match: (p) => p.startsWith("/incidents") },
  { icon: Radar,           label: "Detections",   badge: "live", href: "/" },
  { icon: Activity,        label: "Hunting",      badge: "ql",   href: "/hunt",             match: (p) => p.startsWith("/hunt") },
  { icon: Server,          label: "Assets",       badge: "247",  href: "/assets",           match: (p) => p.startsWith("/assets") },
  { icon: Globe2,          label: "Threat Intel", badge: null,   href: "/threat-intel",     match: (p) => p.startsWith("/threat-intel") },
  { icon: FileText,        label: "Reports",      badge: null,   href: "/reports",          match: (p) => p.startsWith("/reports") },
  { icon: ScrollText,      label: "Compliance",   badge: null,   href: "/compliance",       match: (p) => p.startsWith("/compliance") },
  { icon: Tv2,             label: "War Room",     badge: "tv",   href: "/wall",             match: (p) => p.startsWith("/wall") },
  { icon: Wrench,          label: "Playbooks",    badge: null,   href: "/incidents/INC-2041" },
];

export function Sidebar() {
  const pathname = usePathname() || "/";
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/40 backdrop-blur-sm">
      <Link href="/" className="flex h-14 items-center gap-2 px-4 border-b border-border/40 hover:bg-accent/40 transition-colors">
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
      </Link>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ icon: Icon, label, badge, href, match }) => {
          const active = match ? match(pathname) : pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                active && "bg-accent text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold",
                    badge === "live"
                      ? "bg-neon-green/15 text-neon-green animate-pulse-glow"
                      : badge === "ql"
                      ? "bg-neon-purple/15 text-neon-purple"
                      : badge === "tv"
                      ? "bg-severity-critical/15 text-severity-critical"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
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
