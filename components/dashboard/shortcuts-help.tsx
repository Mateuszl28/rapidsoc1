"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { startTour } from "./tour";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortcutGroup {
  title: string;
  items: { keys: string[]; label: string }[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: "Navigation",
    items: [
      { keys: ["g", "h"], label: "Go to Overview" },
      { keys: ["g", "i"], label: "Go to Incidents" },
      { keys: ["g", "u"], label: "Go to Hunt" },
      { keys: ["g", "a"], label: "Go to Assets" },
      { keys: ["g", "t"], label: "Go to Threat Intel" },
      { keys: ["g", "r"], label: "Go to Reports" },
      { keys: ["g", "c"], label: "Go to Compliance" },
      { keys: ["g", "w"], label: "Go to War Room" },
    ],
  },
  {
    title: "Search & navigation",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette (or Ctrl+K)" },
      { keys: ["?"],      label: "Show this help" },
      { keys: ["Esc"],    label: "Close any overlay" },
    ],
  },
  {
    title: "On the active incident",
    items: [
      { keys: ["r"], label: "Run active agent" },
      { keys: ["a"], label: "Run all agents" },
      { keys: ["n"], label: "Open notifications panel" },
      { keys: ["t"], label: "Re-take the product tour" },
    ],
  },
];

const NAV_MAP: Record<string, string> = {
  h: "/",
  i: "/incidents",
  u: "/hunt",
  a: "/assets",
  t: "/threat-intel",
  r: "/reports",
  c: "/compliance",
  w: "/wall",
};

export function ShortcutsHelp() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gMode = false;
    let gModeTimer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      // Help overlay
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") setOpen(false);

      // "n" for notifications
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !gMode) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sentinel:notifications"));
        return;
      }
      // "t" for tour
      if (e.key === "t" && !e.metaKey && !e.ctrlKey && !gMode) {
        e.preventDefault();
        startTour();
        return;
      }

      // "g" then nav key (gh, gi, gu, ga, gt, gr, gc, gw)
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gMode = true;
        if (gModeTimer) clearTimeout(gModeTimer);
        gModeTimer = setTimeout(() => { gMode = false; }, 1500);
        return;
      }
      if (gMode && NAV_MAP[e.key]) {
        e.preventDefault();
        router.push(NAV_MAP[e.key]);
        gMode = false;
        return;
      }
      if (gMode) {
        gMode = false;
      }
    };

    const onShow = () => setOpen(true);
    window.addEventListener("sentinel:help", onShow);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("sentinel:help", onShow);
      window.removeEventListener("keydown", onKey);
      if (gModeTimer) clearTimeout(gModeTimer);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[105] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-lg border border-border/60 bg-card/95 backdrop-blur shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-3 border-b border-border/40">
              <Keyboard className="h-4 w-4 text-neon-cyan" />
              <div className="text-sm font-semibold">Keyboard shortcuts</div>
              <div className="flex-1" />
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {GROUPS.map((g) => (
                <div key={g.title} className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {g.title}
                  </div>
                  <ul className="space-y-1.5">
                    {g.items.map((it) => (
                      <li key={it.label} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-foreground/85">{it.label}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          {it.keys.map((k, i) => (
                            <span
                              key={i}
                              className={cn(
                                "px-1.5 py-0.5 rounded bg-background border border-border/60 text-[10px] font-mono",
                                k === "Esc" && "px-2"
                              )}
                            >
                              {k}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Press <kbd className="px-1 rounded bg-muted/40 border border-border/40">?</kbd> anytime to open</span>
              <span>For two-key shortcuts: press <kbd className="px-1 rounded bg-muted/40 border border-border/40">g</kbd> then the next letter within 1.5s</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
