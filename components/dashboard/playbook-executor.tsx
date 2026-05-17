"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatTime } from "@/lib/utils";
import {
  Check,
  Loader2,
  Play,
  RotateCcw,
  Square,
  Terminal,
} from "lucide-react";

interface PlayStep {
  id: string;
  phase: "contain" | "eradicate" | "harden";
  text: string;
  command?: string;
  duration: number; // ms
}

const DEFAULT_STEPS: PlayStep[] = [
  // Contain
  { id: "c1", phase: "contain",   text: "Isolate win-jumpbox-01 via EDR network containment",
    command: "falconctl host-isolate --aid 4e1f...02 --reason INC-2041", duration: 2200 },
  { id: "c2", phase: "contain",   text: "Revoke all sessions for m.chen@acme.io",
    command: "az ad user revoke-sign-in-sessions --id m.chen@acme.io", duration: 1700 },
  { id: "c3", phase: "contain",   text: "Disable Okta legacy-auth carve-out (finance-ops-legacy)",
    command: "okta policies disable --policy finance-ops-legacy", duration: 1400 },
  { id: "c4", phase: "contain",   text: "Block egress to 185.220.101.34 at perimeter",
    command: "panos block-ip --addr 185.220.101.34 --zone untrust", duration: 1500 },
  { id: "c5", phase: "contain",   text: "Snapshot fin-db-prod-01 and sever SMB",
    command: "aws ec2 create-snapshot --vol-id vol-0aa3 + iptables -A INPUT --dport 445 -j DROP", duration: 2600 },
  { id: "c6", phase: "contain",   text: "Rotate fin-svc-reader credentials",
    command: "vault rotate --path db/creds/fin-svc-reader", duration: 1900 },

  // Eradicate
  { id: "e1", phase: "eradicate", text: "Forensic image win-jumpbox-01 + dev-build-runner",
    command: "edr-collect --hosts win-jumpbox-01,dev-build-runner --type ram,disk", duration: 3400 },
  { id: "e2", phase: "eradicate", text: "Hunt 60s-jitter HTTPS beacons fleet-wide",
    command: "sigma hunt --rule beacon-jitter-60s --scope fleet", duration: 2800 },
  { id: "e3", phase: "eradicate", text: "Revoke ci-deploy-bot IAM keys",
    command: "aws iam delete-access-key --user ci-deploy-bot --key AKIA...", duration: 1300 },
  { id: "e4", phase: "eradicate", text: "Reset m.chen AD password + force MFA",
    command: "Set-ADAccountPassword + Set-MsolUser -StrongAuthenticationRequirements", duration: 1700 },

  // Harden
  { id: "h1", phase: "harden",    text: "Eliminate legacy-auth carve-out org-wide",
    command: "okta policies enforce-zero-legacy --apply", duration: 1200 },
  { id: "h2", phase: "harden",    text: "Deploy EDR sensors to finance Linux fleet",
    command: "ansible-playbook -i finance-linux deploy-falcon.yml", duration: 4000 },
  { id: "h3", phase: "harden",    text: "Publish Sigma rule: jittered HTTPS beacons",
    command: "sigma publish --rule beacon-jitter-60s.yml --severity high", duration: 1100 },
  { id: "h4", phase: "harden",    text: "Segment jumpbox VLAN — deny SMB to finance",
    command: "network policy apply --from vlan-jumpbox --to vlan-finance --proto tcp/445 --action deny", duration: 1600 },
  { id: "h5", phase: "harden",    text: "Add canary row to customer_pii table",
    command: "psql -c \"INSERT INTO customer_pii (...) VALUES ('CANARY-...');\"", duration: 900 },
];

const PHASE_LABEL: Record<PlayStep["phase"], string> = {
  contain: "🛑 Contain",
  eradicate: "🧯 Eradicate",
  harden: "🛡️ Harden",
};
const PHASE_ACCENT: Record<PlayStep["phase"], string> = {
  contain:    "text-severity-critical border-severity-critical/40",
  eradicate:  "text-severity-high border-severity-high/40",
  harden:     "text-neon-green border-neon-green/40",
};

type Status = "pending" | "running" | "done";

export function PlaybookExecutor() {
  const steps = useMemo(() => DEFAULT_STEPS, []);
  const [status, setStatus] = useState<Record<string, Status>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, "pending"] as const))
  );
  const [logs, setLogs] = useState<{ ts: number; text: string; level: "info" | "ok" | "warn" }[]>([]);
  const [executing, setExecuting] = useState(false);
  const cancelRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  const reset = () => {
    cancelRef.current = true;
    setExecuting(false);
    setStatus(Object.fromEntries(steps.map((s) => [s.id, "pending"] as const)));
    setLogs([]);
  };

  const stop = () => {
    cancelRef.current = true;
    setExecuting(false);
  };

  const execute = async () => {
    cancelRef.current = false;
    setExecuting(true);
    setLogs((l) => [...l, mkLog("info", "▶ Sentinel: executing remediation playbook INC-2041-RB1")]);

    for (const step of steps) {
      if (cancelRef.current) break;
      setStatus((s) => ({ ...s, [step.id]: "running" }));
      setLogs((l) => [...l, mkLog("info", `→ ${step.command ?? step.text}`)]);

      // animated "ticks" while running
      const ticks = Math.max(1, Math.floor(step.duration / 600));
      for (let i = 0; i < ticks; i++) {
        if (cancelRef.current) break;
        // eslint-disable-next-line no-await-in-loop
        await sleep(step.duration / ticks);
      }

      if (cancelRef.current) break;
      setStatus((s) => ({ ...s, [step.id]: "done" }));
      setLogs((l) => [...l, mkLog("ok", `✓ ${step.text}`)]);
    }

    if (!cancelRef.current) {
      setLogs((l) => [...l, mkLog("ok", "✓ Playbook completed. Incident transitioning → CONTAINED.")]);
    } else {
      setLogs((l) => [...l, mkLog("warn", "■ Playbook stopped by analyst.")]);
    }
    setExecuting(false);
  };

  const done = steps.filter((s) => status[s.id] === "done").length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-neon-green" />
          Remediation playbook
          <Badge variant="outline">{steps.length} steps</Badge>
        </CardTitle>
        <div className="flex items-center gap-1">
          <div className="text-[10px] font-mono text-muted-foreground mr-1">
            {done}/{steps.length} · {pct}%
          </div>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          {executing ? (
            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={stop}>
              <Square className="h-3 w-3" />
              Stop
            </Button>
          ) : (
            <Button size="sm" variant="neon" className="h-7 px-2 text-xs" onClick={execute}>
              <Play className="h-3 w-3" />
              Execute
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="h-0.5 bg-muted/40">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-green"
            initial={false}
            animate={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Steps */}
          <div className="p-3 max-h-[460px] overflow-y-auto border-r border-border/40">
            {(["contain", "eradicate", "harden"] as const).map((phase) => (
              <div key={phase} className="mb-3 last:mb-0">
                <div className={cn(
                  "text-[10px] uppercase tracking-widest font-semibold border-l-2 pl-2 mb-1.5",
                  PHASE_ACCENT[phase]
                )}>
                  {PHASE_LABEL[phase]}
                </div>
                <ul className="space-y-1">
                  {steps.filter((s) => s.phase === phase).map((s) => {
                    const st = status[s.id];
                    return (
                      <li
                        key={s.id}
                        className={cn(
                          "flex items-start gap-2 px-2 py-1.5 rounded-md text-xs",
                          st === "running" && "bg-accent/40",
                          st === "done" && "opacity-80"
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          {st === "pending" && (
                            <span className="h-3.5 w-3.5 inline-flex items-center justify-center rounded-full border border-border/60" />
                          )}
                          {st === "running" && (
                            <Loader2 className="h-3.5 w-3.5 text-neon-cyan animate-spin" />
                          )}
                          {st === "done" && (
                            <Check className="h-3.5 w-3.5 text-neon-green" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={cn(st === "done" && "line-through decoration-muted-foreground/40")}>
                            {s.text}
                          </div>
                          {s.command && (
                            <div className="font-mono text-[10px] text-muted-foreground truncate">
                              $ {s.command}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Log output */}
          <div className="terminal p-3 max-h-[460px] overflow-y-auto" ref={logRef}>
            <AnimatePresence initial={false}>
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 py-0.5"
                >
                  <span className="text-muted-foreground/60 select-none">
                    {formatTime(l.ts)}
                  </span>
                  <span className={cn(
                    "shrink-0 w-12 uppercase tracking-wider text-[10px]",
                    l.level === "info" && "text-neon-cyan",
                    l.level === "ok"   && "text-neon-green",
                    l.level === "warn" && "text-severity-high",
                  )}>
                    {l.level}
                  </span>
                  <span className="text-foreground/90 break-all">{l.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!logs.length && (
              <div className="text-muted-foreground/60">
                idle · click <span className="text-neon-cyan">Execute</span> to run the runbook
              </div>
            )}
            <div className="text-muted-foreground/40 mt-1">
              sentinel@playbook:~$
              <span className="inline-block w-2 h-3 ml-1 bg-neon-green align-baseline animate-blink" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function mkLog(level: "info" | "ok" | "warn", text: string) {
  return { ts: Date.now(), text, level };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
