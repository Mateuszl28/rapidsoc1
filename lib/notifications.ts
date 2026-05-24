import type { Severity } from "./types";

export type NotificationKind = "alert" | "agent" | "system" | "compliance" | "playbook";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  timestamp: number;
  severity?: Severity;
  read?: boolean;
  href?: string;
  actor?: string;
}

const now = Date.now();

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-001",
    kind: "alert",
    severity: "critical",
    title: "INC-2041 escalated to CRITICAL",
    body: "Multi-agent triage confirmed ransomware staging pattern. PII egress staged.",
    timestamp: now - 1000 * 60 * 1,
    href: "/incidents/INC-2041",
    actor: "auto-triage",
  },
  {
    id: "n-002",
    kind: "agent",
    title: "Remediation Agent finished",
    body: "Generated 15-step containment runbook for INC-2041 (contain / eradicate / harden).",
    timestamp: now - 1000 * 60 * 3,
    href: "/incidents/INC-2041",
    actor: "Remediation Agent",
  },
  {
    id: "n-003",
    kind: "playbook",
    title: "Playbook step completed",
    body: "Host win-jumpbox-01 isolated via EDR network containment.",
    timestamp: now - 1000 * 60 * 4,
    actor: "playbook-runner",
  },
  {
    id: "n-004",
    kind: "alert",
    severity: "high",
    title: "New beacon detected fleet-wide",
    body: "Sigma rule beacon-jitter-60s matched 2 additional hosts — added to triage queue.",
    timestamp: now - 1000 * 60 * 6,
    href: "/hunt",
    actor: "detection-engine",
  },
  {
    id: "n-005",
    kind: "agent",
    title: "Incident Report Agent drafted RPT-2041-A",
    body: "Executive summary ready for review (410 words, 3 pages).",
    timestamp: now - 1000 * 60 * 12,
    href: "/reports/RPT-2041-A",
    actor: "Incident Report Agent",
    read: true,
  },
  {
    id: "n-006",
    kind: "compliance",
    severity: "high",
    title: "GDPR Art. 33 clock — pre-notification draft",
    body: "Legal flagged the 72-hour window as starting upon exfil confirmation.",
    timestamp: now - 1000 * 60 * 17,
    href: "/compliance",
    actor: "compliance-monitor",
    read: true,
  },
  {
    id: "n-007",
    kind: "system",
    title: "Sigma rule deployed fleet-wide",
    body: "beacon-jitter-60s.yml is now live on 247 hosts (rollout took 38s).",
    timestamp: now - 1000 * 60 * 23,
    actor: "edr-orchestrator",
    read: true,
  },
  {
    id: "n-008",
    kind: "agent",
    title: "Threat Detection Agent — bulk triage",
    body: "Classified 38 events: 3 malicious, 6 suspicious, 29 benign. Top finding: jumpbox C2 beacon.",
    timestamp: now - 1000 * 60 * 26,
    actor: "Threat Detection Agent",
    read: true,
  },
  {
    id: "n-009",
    kind: "alert",
    severity: "medium",
    title: "Impossible travel for j.patel@acme.io",
    body: "Login from PL then SG within 22 minutes. Conditional access challenged.",
    timestamp: now - 1000 * 60 * 41,
    actor: "azure-ad",
    read: true,
  },
  {
    id: "n-010",
    kind: "system",
    title: "Sentinel agent build 2.18.4 rolled out",
    body: "0 failed hosts. 247/247 healthy. Mean check-in 12s.",
    timestamp: now - 1000 * 60 * 60 * 5,
    actor: "ops",
    read: true,
  },
];
