import type {
  Asset,
  AttackChainNode,
  Incident,
  MetricPoint,
  SecurityEvent,
  Severity,
  ThreatFeedItem,
} from "./types";

const now = () => Date.now();

// ─────────────────────────────────────────────────────────────────────────────
//   Synthetic assets
// ─────────────────────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  { id: "ast-001", hostname: "fin-db-prod-01",  ip: "10.20.4.11",  os: "linux",   criticality: "critical", owner: "finance",     riskScore: 92 },
  { id: "ast-002", hostname: "hr-app-prod-02",  ip: "10.20.5.42",  os: "linux",   criticality: "high",     owner: "people-ops",  riskScore: 71 },
  { id: "ast-003", hostname: "ceo-laptop",      ip: "10.30.7.18",  os: "macos",   criticality: "critical", owner: "exec",        riskScore: 64 },
  { id: "ast-004", hostname: "dev-build-runner",ip: "10.40.2.5",   os: "linux",   criticality: "high",     owner: "platform",    riskScore: 58 },
  { id: "ast-005", hostname: "edge-vpn-01",     ip: "198.51.100.7",os: "linux",   criticality: "high",     owner: "infra",       riskScore: 83 },
  { id: "ast-006", hostname: "win-jumpbox-01",  ip: "10.20.0.9",   os: "windows", criticality: "high",     owner: "secops",      riskScore: 49 },
  { id: "ast-007", hostname: "s3-customer-data",ip: "—",           os: "cloud",   criticality: "critical", owner: "data-eng",    riskScore: 88 },
  { id: "ast-008", hostname: "ci-github-runner",ip: "10.40.9.31",  os: "linux",   criticality: "medium",   owner: "platform",    riskScore: 34 },
];

// ─────────────────────────────────────────────────────────────────────────────
//   Synthetic events — these seed the feed; the live feed appends more
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_EVENTS: SecurityEvent[] = [
  {
    id: "evt-10001",
    timestamp: now() - 1000 * 60 * 2,
    severity: "critical",
    category: "auth",
    source: "okta-system-log",
    sourceIp: "203.0.113.42",
    user: "m.chen@acme.io",
    technique: "T1110.003",
    description: "Password spray: 412 failed logins across 38 accounts in 90s",
    rawLog: "okta.userAuthentication.failure user=multi src=203.0.113.42 count=412 window=90s",
    status: "investigating",
    score: 94,
    iocs: ["203.0.113.42"],
  },
  {
    id: "evt-10002",
    timestamp: now() - 1000 * 60 * 5,
    severity: "high",
    category: "endpoint",
    source: "edr-crowdstrike",
    host: "win-jumpbox-01",
    technique: "T1059.001",
    description: "Encoded PowerShell child of winword.exe spawned cmd.exe → curl",
    rawLog: "FalconHost.detect host=win-jumpbox-01 parent=winword.exe cmd=\"powershell -enc JABw...\"",
    status: "investigating",
    score: 88,
    iocs: ["powershell -enc", "winword.exe", "curl"],
  },
  {
    id: "evt-10003",
    timestamp: now() - 1000 * 60 * 7,
    severity: "high",
    category: "network",
    source: "zeek-sensor-edge",
    sourceIp: "10.20.0.9",
    destIp: "185.220.101.34",
    technique: "T1071.001",
    description: "Beaconing pattern: 64-byte HTTPS requests every 60.04s ± 0.8s to known C2",
    rawLog: "zeek.conn id.orig_h=10.20.0.9 id.resp_h=185.220.101.34 service=ssl bytes_orig=64 interval_jitter=0.8",
    status: "new",
    score: 86,
    iocs: ["185.220.101.34"],
  },
  {
    id: "evt-10004",
    timestamp: now() - 1000 * 60 * 11,
    severity: "medium",
    category: "cloud",
    source: "aws-cloudtrail",
    user: "ci-deploy-bot",
    technique: "T1078.004",
    description: "IAM access key used from new ASN (AS-RU-PRIVATE) — never seen before",
    rawLog: "cloudtrail.event=GetCallerIdentity user=ci-deploy-bot src_asn=AS-RU-PRIVATE first_seen=true",
    status: "investigating",
    score: 72,
    iocs: ["AS-RU-PRIVATE"],
  },
  {
    id: "evt-10005",
    timestamp: now() - 1000 * 60 * 14,
    severity: "medium",
    category: "data",
    source: "dlp-engine",
    user: "m.chen@acme.io",
    host: "fin-db-prod-01",
    technique: "T1041",
    description: "Anomalous SELECT * on customer_pii table (480 MB egress over 4 min)",
    rawLog: "dlp.query table=customer_pii rows=2.1M bytes=480MB user=m.chen dest=10.40.9.31",
    status: "new",
    score: 78,
  },
  {
    id: "evt-10006",
    timestamp: now() - 1000 * 60 * 18,
    severity: "low",
    category: "policy",
    source: "guardduty",
    description: "S3 bucket 's3-customer-data' policy changed: public-read added then removed within 12s",
    status: "resolved",
    score: 41,
  },
  {
    id: "evt-10007",
    timestamp: now() - 1000 * 60 * 22,
    severity: "info",
    category: "identity",
    source: "azure-ad",
    user: "j.patel@acme.io",
    description: "Conditional access policy 'Block-Legacy-Auth' triggered, blocked IMAP from 198.51.100.99",
    status: "resolved",
    score: 12,
  },
  {
    id: "evt-10008",
    timestamp: now() - 1000 * 60 * 31,
    severity: "high",
    category: "malware",
    source: "edr-crowdstrike",
    host: "dev-build-runner",
    technique: "T1543.003",
    description: "Service 'WinDefenderHelper' installed with SYSTEM persistence — not signed by Microsoft",
    status: "investigating",
    score: 81,
    iocs: ["C:\\Windows\\Temp\\wdh.exe"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//   Templates used by the streaming /api/events route to fabricate new events
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TEMPLATES: Omit<SecurityEvent, "id" | "timestamp" | "status">[] = [
  { severity: "info",     category: "auth",     source: "okta-system-log",  description: "MFA challenge accepted", score: 8 },
  { severity: "info",     category: "network",  source: "zeek-sensor-edge", description: "TLS handshake (TLS 1.3) — known-good destination", score: 4 },
  { severity: "low",      category: "endpoint", source: "edr-crowdstrike",  description: "Sysmon: process creation, signed binary", score: 18 },
  { severity: "low",      category: "cloud",    source: "aws-cloudtrail",   description: "AssumeRole by ci-deploy-bot from us-east-1", score: 22 },
  { severity: "medium",   category: "auth",     source: "okta-system-log",  description: "Impossible travel: login from PL then SG within 22 min", score: 64, technique: "T1078" },
  { severity: "medium",   category: "policy",   source: "guardduty",        description: "Security group opened :22 to 0.0.0.0/0", score: 58 },
  { severity: "high",     category: "endpoint", source: "edr-crowdstrike",  description: "lsass.exe memory access by non-system process",         score: 87, technique: "T1003.001", iocs: ["lsass.exe"] },
  { severity: "high",     category: "network",  source: "zeek-sensor-edge", description: "DNS tunneling: 1.2KB TXT queries to *.tunnel.bad.io",   score: 84, technique: "T1071.004" },
  { severity: "critical", category: "malware",  source: "edr-crowdstrike",  description: "Ransomware behavior: 1,400 files renamed *.lockd in 8s", score: 97, technique: "T1486", iocs: ["*.lockd"] },
  { severity: "critical", category: "identity", source: "azure-ad",         description: "Global admin role granted to newly created user",       score: 93, technique: "T1098" },
];

export const ATTACK_TIMELINE: AttackChainNode[] = [
  {
    stage: "reconnaissance",
    timestamp: now() - 1000 * 60 * 60 * 26,
    description: "External port scan against edge-vpn-01 from 203.0.113.0/24",
    evidence: ["zeek.conn 203.0.113.42 → 198.51.100.7 (3389,22,443)"],
  },
  {
    stage: "initial-access",
    timestamp: now() - 1000 * 60 * 60 * 18,
    description: "Password spray succeeded against m.chen@acme.io (no MFA on legacy IMAP)",
    evidence: ["evt-10001", "okta.user.login src=203.0.113.42 ok=true"],
  },
  {
    stage: "execution",
    timestamp: now() - 1000 * 60 * 60 * 6,
    description: "Phishing doc opened on win-jumpbox-01 → encoded PowerShell stager",
    evidence: ["evt-10002"],
  },
  {
    stage: "persistence",
    timestamp: now() - 1000 * 60 * 60 * 3,
    description: "Rogue service 'WinDefenderHelper' installed on dev-build-runner",
    evidence: ["evt-10008"],
  },
  {
    stage: "credential-access",
    timestamp: now() - 1000 * 60 * 90,
    description: "LSASS memory dumped via reflective DLL — attempt to harvest hashes",
    evidence: ["edr.alert technique=T1003.001"],
  },
  {
    stage: "lateral-movement",
    timestamp: now() - 1000 * 60 * 40,
    description: "SMB lateral movement from win-jumpbox-01 → fin-db-prod-01",
    evidence: ["zeek.smb 10.20.0.9 → 10.20.4.11"],
  },
  {
    stage: "exfiltration",
    timestamp: now() - 1000 * 60 * 14,
    description: "480 MB egress from customer_pii table to internal CI runner (staging area)",
    evidence: ["evt-10005"],
  },
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: "INC-2041",
    title: "Suspected ransomware staging on fin-db-prod-01",
    severity: "critical",
    status: "investigating",
    openedAt: now() - 1000 * 60 * 17,
    updatedAt: now() - 1000 * 60 * 2,
    score: 96,
    assignee: "oncall-tier2",
    eventIds: ["evt-10001", "evt-10002", "evt-10003", "evt-10005"],
    summary:
      "Credential spray → PowerShell stager on jumpbox → SMB pivot to finance DB → 480 MB PII egress to internal staging.",
    affectedAssets: ["fin-db-prod-01", "win-jumpbox-01", "ci-github-runner"],
    attackChain: ATTACK_TIMELINE,
  },
  {
    id: "INC-2040",
    title: "Anomalous IAM key usage — ci-deploy-bot",
    severity: "high",
    status: "investigating",
    openedAt: now() - 1000 * 60 * 40,
    updatedAt: now() - 1000 * 60 * 8,
    score: 78,
    assignee: "oncall-tier1",
    eventIds: ["evt-10004"],
    summary:
      "Service account access key used from previously-unseen ASN. Possible key compromise via leaked GitHub artifact.",
    affectedAssets: ["ci-github-runner", "s3-customer-data"],
  },
  {
    id: "INC-2039",
    title: "Rogue persistence on dev-build-runner",
    severity: "high",
    status: "contained",
    openedAt: now() - 1000 * 60 * 60 * 3,
    updatedAt: now() - 1000 * 60 * 60,
    score: 81,
    assignee: "secops-l3",
    eventIds: ["evt-10008"],
    summary:
      "Unsigned service installed with SYSTEM-level autorun. Host isolated, image being rebuilt.",
    affectedAssets: ["dev-build-runner"],
  },
  {
    id: "INC-2038",
    title: "S3 bucket misconfiguration auto-remediated",
    severity: "low",
    status: "resolved",
    openedAt: now() - 1000 * 60 * 60 * 5,
    updatedAt: now() - 1000 * 60 * 60 * 4,
    score: 32,
    eventIds: ["evt-10006"],
    summary: "Public-read ACL added then removed within 12s by Terraform reconcile job. No data accessed.",
    affectedAssets: ["s3-customer-data"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//   Charts
// ─────────────────────────────────────────────────────────────────────────────

export function buildMetricSeries(points = 24): MetricPoint[] {
  const out: MetricPoint[] = [];
  const start = now() - 1000 * 60 * 60 * 24;
  for (let i = 0; i < points; i++) {
    const t = start + i * 1000 * 60 * 60;
    const base = 80 + Math.sin(i / 3) * 40 + Math.random() * 30;
    const threats = Math.max(1, Math.floor(base * 0.18 + (i > 18 ? 22 : 0)));
    out.push({
      t,
      label: new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", hour12: false }),
      events: Math.floor(base),
      threats,
      blocked: Math.floor(threats * 0.78),
    });
  }
  return out;
}

export const SEVERITY_BREAKDOWN: { name: Severity; value: number }[] = [
  { name: "critical", value: 4 },
  { name: "high",     value: 12 },
  { name: "medium",   value: 27 },
  { name: "low",      value: 58 },
  { name: "info",     value: 142 },
];

export const CATEGORY_BREAKDOWN = [
  { name: "auth",     value: 38 },
  { name: "endpoint", value: 52 },
  { name: "network",  value: 71 },
  { name: "cloud",    value: 29 },
  { name: "data",     value: 14 },
  { name: "identity", value: 22 },
  { name: "malware",  value: 9  },
  { name: "policy",   value: 17 },
];

// ─────────────────────────────────────────────────────────────────────────────
//   Threat intel feed
// ─────────────────────────────────────────────────────────────────────────────

export const THREAT_FEED: ThreatFeedItem[] = [
  { id: "ti-1", actor: "Scattered Spider",  family: "OKTA-PHISH-22",   region: "US-East",  lat: 40.7,  lng: -74.0, firstSeen: now() - 1000 * 60 * 6,   severity: "critical", description: "Helpdesk-impersonation phishing targeting SSO admins" },
  { id: "ti-2", actor: "FIN7",              family: "Carbanak v6",     region: "EU-West",  lat: 52.5,  lng: 13.4,  firstSeen: now() - 1000 * 60 * 23,  severity: "high",     description: "POS-targeted backdoor, new SOCKS5 proxy variant" },
  { id: "ti-3", actor: "Lazarus",           family: "AppleJeus 2026",  region: "APAC",     lat: 35.7,  lng: 139.7, firstSeen: now() - 1000 * 60 * 41,  severity: "high",     description: "Crypto-wallet trojan signed with stolen cert (revoked 14h ago)" },
  { id: "ti-4", actor: "Volt Typhoon",      family: "LotL routers",    region: "US-West",  lat: 37.7,  lng: -122.4,firstSeen: now() - 1000 * 60 * 60,  severity: "critical", description: "Living-off-the-land in SOHO routers — telco-targeted" },
  { id: "ti-5", actor: "APT29",             family: "DUKE.2026.A",     region: "EU-North", lat: 59.3,  lng: 18.0,  firstSeen: now() - 1000 * 60 * 95,  severity: "medium",   description: "OAuth consent phishing against M365 tenants" },
  { id: "ti-6", actor: "TA505",             family: "Cl0p-derivative", region: "Global",   lat: 0,     lng: 0,     firstSeen: now() - 1000 * 60 * 140, severity: "high",     description: "MFT zero-day under mass exploitation" },
];
