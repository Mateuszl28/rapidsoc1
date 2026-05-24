"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  FileText,
  Sparkles,
  Terminal,
  Wrench,
  X,
} from "lucide-react";
import {
  SEED_NOTIFICATIONS,
  type NotificationItem,
  type NotificationKind,
} from "@/lib/notifications";
import type { Severity } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  alert: AlertTriangle,
  agent: Sparkles,
  system: Terminal,
  compliance: FileText,
  playbook: Wrench,
};

const KIND_ACCENT: Record<NotificationKind, string> = {
  alert: "text-severity-critical bg-severity-critical/10 border-severity-critical/40",
  agent: "text-neon-purple bg-neon-purple/10 border-neon-purple/40",
  system: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/40",
  compliance: "text-severity-medium bg-severity-medium/10 border-severity-medium/40",
  playbook: "text-neon-green bg-neon-green/10 border-neon-green/40",
};

const KIND_LABEL: Record<NotificationKind, string> = {
  alert: "Alert",
  agent: "Agent",
  system: "System",
  compliance: "Compliance",
  playbook: "Playbook",
};

const FILTERS: ("all" | NotificationKind)[] = ["all", "alert", "agent", "playbook", "compliance", "system"];

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | NotificationKind>("all");

  useEffect(() => {
    const onShow = () => setOpen((o) => !o);
    window.addEventListener("sentinel:notifications", onShow);
    return () => window.removeEventListener("sentinel:notifications", onShow);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const markAllRead = () =>
    setItems((arr) => arr.map((i) => ({ ...i, read: true })));

  const dismiss = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id));
  const toggleRead = (id: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, read: !i.read } : i)));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="notif-overlay"
          className="fixed inset-0 z-[110] bg-background/40 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute top-0 right-0 h-full w-[380px] max-w-[92vw] bg-card border-l border-border/60 shadow-2xl shadow-black/50 flex flex-col"
          >
            <div className="h-14 shrink-0 px-3 border-b border-border/40 flex items-center gap-2">
              <Bell className="h-4 w-4 text-neon-cyan" />
              <div className="text-sm font-semibold">Notifications</div>
              {unread > 0 && (
                <Badge variant="critical" className="ml-1">{unread} new</Badge>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={markAllRead}
                disabled={unread === 0}
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3" />
                Mark read
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-3 py-2 border-b border-border/40 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                    filter === f
                      ? "bg-accent border-border/60 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" ? `all (${items.length})`
                    : `${KIND_LABEL[f as NotificationKind]} (${items.filter((i) => i.kind === (f as NotificationKind)).length})`}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-12">
                  Nothing here. SOC is quiet for once.
                </div>
              )}
              <AnimatePresence initial={false}>
                {visible.map((n) => {
                  const Icon = KIND_ICON[n.kind];
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        "p-3 border-b border-border/40 group relative",
                        !n.read && "bg-neon-cyan/3"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn(
                          "h-7 w-7 rounded-md border flex items-center justify-center shrink-0",
                          KIND_ACCENT[n.kind]
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {n.severity && (
                              <Badge variant={SEV_VARIANT[n.severity]}>{n.severity}</Badge>
                            )}
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                              {KIND_LABEL[n.kind]} · {formatRelativeTime(n.timestamp)}
                            </span>
                            {!n.read && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
                            )}
                          </div>
                          <div className="mt-1 text-xs font-medium leading-snug">{n.title}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{n.body}</div>
                          {n.actor && (
                            <div className="mt-1 text-[10px] font-mono text-muted-foreground/70">
                              by {n.actor}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {n.href && (
                              <Link
                                href={n.href}
                                onClick={() => setOpen(false)}
                                className="text-[10px] uppercase tracking-wider text-neon-cyan hover:underline"
                              >
                                Open →
                              </Link>
                            )}
                            <button
                              onClick={() => toggleRead(n.id)}
                              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            >
                              Mark {n.read ? "unread" : "read"}
                            </button>
                            <button
                              onClick={() => dismiss(n.id)}
                              className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground hover:text-severity-critical"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="p-2 border-t border-border/40 text-center text-[10px] font-mono text-muted-foreground">
              press <kbd className="px-1 rounded bg-muted/40 border border-border/40">ESC</kbd> to close
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
