import { ASSETS, SEED_EVENTS, SEED_INCIDENTS } from "./mock-data";
import type { Asset, Incident, SecurityEvent } from "./types";

export function findIncident(id: string): Incident | undefined {
  return SEED_INCIDENTS.find((i) => i.id === id);
}

export function eventsFor(incident: Incident): SecurityEvent[] {
  const byId = new Map(SEED_EVENTS.map((e) => [e.id, e] as const));
  return incident.eventIds
    .map((id) => byId.get(id))
    .filter((e): e is SecurityEvent => Boolean(e));
}

export function assetsFor(incident: Incident): Asset[] {
  return ASSETS.filter((a) => incident.affectedAssets.includes(a.hostname));
}

export function describeIncident(incident: Incident): string {
  return [
    `INCIDENT: ${incident.id} — ${incident.title}`,
    `Severity: ${incident.severity.toUpperCase()}  Score: ${incident.score}/100  Status: ${incident.status}`,
    `Affected assets: ${incident.affectedAssets.join(", ")}`,
    `Summary: ${incident.summary}`,
    `Correlated events: ${incident.eventIds.join(", ")}`,
    incident.attackChain
      ? `Attack chain:\n${incident.attackChain
          .map((n) => `- [${n.stage}] ${n.description} (evidence: ${n.evidence.join("; ")})`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export interface EvidenceItem {
  id: string;
  kind: "log" | "pcap" | "image" | "registry" | "binary" | "screenshot";
  source: string;
  sizeKB: number;
  collectedAt: number;
  sha256: string;
  label: string;
}

export function evidenceFor(incident: Incident): EvidenceItem[] {
  const base = incident.openedAt;
  // synthesize evidence — varies a little per incident
  return [
    { id: "EV-001", kind: "log",        source: "okta-system-log",         sizeKB: 18,    collectedAt: base + 1000 * 60 * 3,  sha256: "9f3a…b71d", label: "Auth log slice (last 60 min)" },
    { id: "EV-002", kind: "pcap",       source: "zeek-sensor-edge",        sizeKB: 4220,  collectedAt: base + 1000 * 60 * 5,  sha256: "1c08…44ee", label: "Edge pcap (15-min window)" },
    { id: "EV-003", kind: "image",      source: "edr-crowdstrike",         sizeKB: 16384, collectedAt: base + 1000 * 60 * 8,  sha256: "ab44…7732", label: `RAM image of ${incident.affectedAssets[0] ?? "host"}` },
    { id: "EV-004", kind: "registry",   source: "win-jumpbox-01",          sizeKB: 240,   collectedAt: base + 1000 * 60 * 9,  sha256: "00f1…993a", label: "HKLM Run + Services snapshot" },
    { id: "EV-005", kind: "binary",     source: "C:\\Windows\\Temp\\wdh.exe", sizeKB: 312, collectedAt: base + 1000 * 60 * 12, sha256: "8ee2…01bb", label: "Suspected persistence binary" },
    { id: "EV-006", kind: "screenshot", source: "ceo-laptop",              sizeKB: 86,    collectedAt: base + 1000 * 60 * 14, sha256: "5610…cc02", label: "Browser screenshot at alert time" },
  ];
}

// ─ Attack graph data (nodes & edges) ───────────────────────────────────────

export type GraphNodeKind =
  | "attacker"
  | "host"
  | "identity"
  | "ioc"
  | "data";

export interface GraphNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  meta?: string;
  critical?: boolean;
}
export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  technique?: string;
  malicious?: boolean;
}
export interface AttackGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function graphFor(incident: Incident): AttackGraph {
  if (incident.id === "INC-2041") {
    return {
      nodes: [
        { id: "atk",  label: "203.0.113.42",      kind: "attacker", meta: "Origin · Tor exit ASN" , critical: true },
        { id: "id1",  label: "m.chen@acme.io",    kind: "identity", meta: "Finance director · MFA bypassed" },
        { id: "h1",   label: "edge-vpn-01",       kind: "host",     meta: "VPN concentrator" },
        { id: "h2",   label: "win-jumpbox-01",    kind: "host",     meta: "Pivot · isolated", critical: true },
        { id: "id2",  label: "fin-svc-reader",    kind: "identity", meta: "Service account · LSASS-harvested" },
        { id: "h3",   label: "fin-db-prod-01",    kind: "host",     meta: "Finance DB · critical", critical: true },
        { id: "h4",   label: "ci-github-runner",  kind: "host",     meta: "Staging destination" },
        { id: "ioc1", label: "185.220.101.34",    kind: "ioc",      meta: "C2 beacon dest" },
        { id: "ioc2", label: "wdh.exe",           kind: "ioc",      meta: "Persistence binary" },
        { id: "d1",   label: "customer_pii",      kind: "data",     meta: "2.1M PII rows · GDPR", critical: true },
      ],
      edges: [
        { from: "atk", to: "id1",  label: "password spray", technique: "T1110.003", malicious: true },
        { from: "id1", to: "h1",   label: "VPN login",      technique: "T1078" },
        { from: "h1",  to: "h2",   label: "RDP into pivot", technique: "T1021.001" },
        { from: "h2",  to: "ioc1", label: "C2 beacon",      technique: "T1071.001", malicious: true },
        { from: "h2",  to: "ioc2", label: "persistence",    technique: "T1543.003", malicious: true },
        { from: "h2",  to: "id2",  label: "lsass dump",     technique: "T1003.001", malicious: true },
        { from: "id2", to: "h3",   label: "SMB pivot",      technique: "T1021.002", malicious: true },
        { from: "h3",  to: "d1",   label: "SELECT *",       technique: "T1041",     malicious: true },
        { from: "d1",  to: "h4",   label: "egress 480MB",   technique: "T1041",     malicious: true },
      ],
    };
  }
  // generic fallback graph
  return {
    nodes: incident.affectedAssets.map((a, i) => ({
      id: `n${i}`,
      label: a,
      kind: "host",
    })),
    edges: incident.affectedAssets.slice(1).map((_, i) => ({
      from: `n${i}`,
      to: `n${i + 1}`,
      label: "related",
    })),
  };
}
