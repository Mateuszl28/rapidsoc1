"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Terminal,
  ShieldAlert,
  Activity,
  Tv2,
  Wand2,
  X,
} from "lucide-react";

interface TourStep {
  id: string;
  selector: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  side?: "top" | "bottom" | "left" | "right";
  /** when set, the tour will route here before showing the step */
  route?: string;
}

const STEPS: TourStep[] = [
  {
    id: "welcome",
    selector: "[data-tour=hero]",
    title: "Welcome to Sentinel AI",
    body:
      "Your autonomous SOC. The hero banner always reflects the most urgent active incident — right now we have a confirmed critical: ransomware staging on the finance database.",
    icon: ShieldAlert,
    side: "bottom",
    route: "/",
  },
  {
    id: "agents",
    selector: "[data-tour=agents]",
    title: "Five Claude agents work the incident",
    body:
      "Threat Detection → Root Cause → Risk Assessment → Remediation → Incident Report. Each streams structured analysis. Click 'Run all' to fire the full workflow.",
    icon: Sparkles,
    side: "top",
    route: "/incidents/INC-2041",
  },
  {
    id: "chat",
    selector: "[data-tour=chat]",
    title: "Stay in the conversation",
    body:
      "After the agents finish, follow up with multi-turn questions. Ask for alternative containment paths, compliance angles, or deeper analysis — context is preserved.",
    icon: Sparkles,
    side: "top",
    route: "/incidents/INC-2041",
  },
  {
    id: "hunt",
    selector: "[data-tour=hunt]",
    title: "Hunt across the SIEM",
    body:
      "SOC-QL query syntax for ad-hoc investigations. Don't know the syntax? Click 'Ask AI' — describe in plain English and get a query auto-built and run.",
    icon: Wand2,
    side: "bottom",
    route: "/hunt",
  },
  {
    id: "wall",
    selector: "[data-tour=wall-link]",
    title: "TV-mode war room",
    body:
      "A full-screen rotating dashboard designed for SOC wall displays. Auto-cycles through scenes. Great for live operations and stakeholder demos.",
    icon: Tv2,
    side: "right",
    route: "/",
  },
  {
    id: "cmd",
    selector: "[data-tour=cmdk]",
    title: "Cmd+K finds anything",
    body:
      "Press ⌘K (or Ctrl+K) anywhere. Incidents, assets, threat actors, reports, hunt queries — all in one fuzzy index.",
    icon: Terminal,
    side: "bottom",
    route: "/",
  },
  {
    id: "live",
    selector: "[data-tour=feed]",
    title: "Live SIEM feed",
    body:
      "Synthetic events stream in from a server-sent endpoint. Severity filters, pause/play, terminal styling — the kind of view your tier-1 analyst keeps open all day.",
    icon: Activity,
    side: "top",
    route: "/",
  },
];

const STORAGE_KEY = "sentinel.tour.seen";

export function ProductTour() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);

  // Auto-open on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY) === "1";
    if (!seen) {
      // wait a beat so the layout settles
      setTimeout(() => setOpen(true), 900);
    }
    const onShow = () => {
      setIdx(0);
      setOpen(true);
    };
    window.addEventListener("sentinel:tour", onShow);
    return () => window.removeEventListener("sentinel:tour", onShow);
  }, []);

  const step = STEPS[idx];

  // Route + locate target whenever step changes
  useEffect(() => {
    if (!open) return;
    const desiredPath = step.route ?? "/";
    if (typeof window !== "undefined" && window.location.pathname !== desiredPath) {
      // simple route push
      const url = new URL(desiredPath, window.location.origin);
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    // give the DOM a moment to reflow
    const t = setTimeout(() => locateTarget(step.selector, setTarget), 500);
    return () => clearTimeout(t);
  }, [open, idx, step.route, step.selector]);

  // Reposition on window resize
  useLayoutEffect(() => {
    if (!open) return;
    const onResize = () => locateTarget(step.selector, setTarget);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, step.selector]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  const finish = (completed: boolean) => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    if (completed) {
      // optional: small celebration
    }
  };
  const next = () => (idx < STEPS.length - 1 ? setIdx((i) => i + 1) : finish(true));
  const prev = () => idx > 0 && setIdx((i) => i - 1);

  if (!open) return null;

  const Icon = step.icon;
  const pos = computeTooltipPosition(target, step.side ?? "bottom");

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] pointer-events-auto"
      >
        {/* SVG mask backdrop with cut-out around the target */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {target && (
                <rect
                  x={target.x - 6}
                  y={target.y - 6}
                  width={target.width + 12}
                  height={target.height + 12}
                  rx={10}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(5,10,20,0.78)" mask="url(#tour-mask)" />
          {target && (
            <rect
              x={target.x - 6}
              y={target.y - 6}
              width={target.width + 12}
              height={target.height + 12}
              rx={10}
              fill="none"
              stroke="hsl(180 100% 55%)"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 18px hsl(180 100% 55% / 0.7))" }}
            />
          )}
        </svg>

        {/* Tooltip card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute w-[360px] max-w-[88vw] rounded-lg border border-neon-cyan/50 bg-card/95 backdrop-blur shadow-2xl shadow-black/60 glow-cyan"
          style={pos}
        >
          <div className="p-3 border-b border-border/40 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-neon-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                Step {idx + 1} of {STEPS.length}
              </div>
              <div className="text-sm font-semibold truncate">{step.title}</div>
            </div>
            <button
              onClick={() => finish(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 text-xs text-foreground/85 leading-relaxed">{step.body}</div>

          {/* Progress dots */}
          <div className="px-3 pb-2 flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i === idx ? "bg-neon-cyan" : i < idx ? "bg-neon-cyan/40" : "bg-border/60"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/20">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => finish(false)}>
              Skip tour
            </Button>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={prev} disabled={idx === 0}>
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
              <Button variant="neon" size="sm" className="h-7 text-xs" onClick={next}>
                {idx === STEPS.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Trigger the tour from anywhere in the UI */
export function startTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sentinel:tour"));
  }
}

// ────────────────────────────────────────────────────────────────────────────

function locateTarget(selector: string, set: (r: DOMRect | null) => void) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) { set(null); return; }
  // ensure visible
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  // small delay so the smooth scroll has time
  setTimeout(() => {
    const r = el.getBoundingClientRect();
    set(r);
  }, 350);
}

function computeTooltipPosition(
  target: DOMRect | null,
  side: "top" | "bottom" | "left" | "right"
): React.CSSProperties {
  const margin = 14;
  if (!target) {
    // center if no target found
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tipW = 360;
  const tipH = 220;

  let left: number;
  let top: number;
  if (side === "bottom") {
    left = target.x + target.width / 2 - tipW / 2;
    top = target.bottom + margin;
  } else if (side === "top") {
    left = target.x + target.width / 2 - tipW / 2;
    top = target.y - tipH - margin;
  } else if (side === "right") {
    left = target.right + margin;
    top = target.y + target.height / 2 - tipH / 2;
  } else {
    left = target.x - tipW - margin;
    top = target.y + target.height / 2 - tipH / 2;
  }
  left = Math.max(12, Math.min(vw - tipW - 12, left));
  top  = Math.max(12, Math.min(vh - tipH - 12, top));
  return { left, top };
}
