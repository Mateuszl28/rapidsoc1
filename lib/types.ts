export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type EventCategory =
  | "auth"
  | "network"
  | "endpoint"
  | "cloud"
  | "data"
  | "identity"
  | "malware"
  | "policy";

export type EventStatus = "new" | "investigating" | "contained" | "resolved" | "false-positive";

export interface SecurityEvent {
  id: string;
  timestamp: number;
  severity: Severity;
  category: EventCategory;
  source: string;          // e.g. "edr-sensor-04"
  sourceIp?: string;
  destIp?: string;
  user?: string;
  host?: string;
  technique?: string;      // MITRE ATT&CK technique e.g. "T1059.001"
  description: string;
  rawLog?: string;
  status: EventStatus;
  score: number;           // 0..100 risk score
  iocs?: string[];         // indicators of compromise
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: EventStatus;
  openedAt: number;
  updatedAt: number;
  score: number;
  assignee?: string;
  eventIds: string[];
  summary: string;
  affectedAssets: string[];
  attackChain?: AttackChainNode[];
}

export interface AttackChainNode {
  stage:
    | "reconnaissance"
    | "initial-access"
    | "execution"
    | "persistence"
    | "privilege-escalation"
    | "defense-evasion"
    | "credential-access"
    | "lateral-movement"
    | "exfiltration"
    | "impact";
  timestamp: number;
  description: string;
  evidence: string[];
}

export interface Asset {
  id: string;
  hostname: string;
  ip: string;
  os: "windows" | "linux" | "macos" | "cloud";
  criticality: Severity;
  owner: string;
  riskScore: number;
}

export interface AgentRun {
  agentId: AgentId;
  status: "idle" | "running" | "done" | "error";
  startedAt?: number;
  finishedAt?: number;
  output?: string;
}

export type AgentId =
  | "threat-detection"
  | "root-cause"
  | "risk-assessment"
  | "remediation"
  | "incident-report";

export interface AgentDef {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  accent: string;
  systemPrompt: string;
}

export interface MetricPoint {
  t: number;            // unix ms
  label: string;        // formatted x-axis label
  events: number;
  threats: number;
  blocked: number;
}

export interface ThreatFeedItem {
  id: string;
  actor: string;        // threat actor
  family: string;       // malware family / campaign
  region: string;
  lat: number;
  lng: number;
  firstSeen: number;
  severity: Severity;
  description: string;
}
