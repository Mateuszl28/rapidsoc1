import type { Severity } from "./types";

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: "financial" | "espionage" | "hacktivism" | "destruction" | "unknown";
  firstObserved: number;
  lastObserved: number;
  severity: Severity;
  active: boolean;
  campaigns: string[];
  techniques: string[];        // MITRE T#### IDs
  summary: string;
  sectors: string[];
  ttpsSummary: string;
}

export interface IOC {
  id: string;
  value: string;
  kind: "ip" | "domain" | "hash" | "url" | "email" | "registry";
  firstSeen: number;
  lastSeen: number;
  confidence: number;          // 0-100
  source: string;              // feed name
  actor?: string;
  family?: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  actor: string;
  status: "active" | "watching" | "dormant";
  startedAt: number;
  victims: number;
  severity: Severity;
  industries: string[];
  summary: string;
}

export const THREAT_ACTORS: ThreatActor[] = [
  {
    id: "ta-001",
    name: "Scattered Spider",
    aliases: ["UNC3944", "Roasted 0ktapus", "Octo Tempest"],
    origin: "US / UK (English-speaking)",
    motivation: "financial",
    firstObserved: Date.parse("2022-05-01"),
    lastObserved: Date.now() - 1000 * 60 * 38,
    severity: "critical",
    active: true,
    campaigns: ["OKTA-PHISH-22", "HELPDESK-SOCIAL-26"],
    techniques: ["T1566.004", "T1078", "T1110.003", "T1556", "T1530", "T1486"],
    sectors: ["SaaS", "Telecom", "Hospitality", "Gaming"],
    summary:
      "Sophisticated social-engineering crew that compromises SSO admins via helpdesk impersonation, pivots to cloud, and deploys ransomware or exfils data.",
    ttpsSummary:
      "Helpdesk vishing → MFA-fatigue or SIM-swap → SSO takeover → cloud admin → backups disabled → encryption/exfil.",
  },
  {
    id: "ta-002",
    name: "FIN7",
    aliases: ["Carbon Spider", "Sangria Tempest"],
    origin: "RU-aligned (commercial)",
    motivation: "financial",
    firstObserved: Date.parse("2015-09-01"),
    lastObserved: Date.now() - 1000 * 60 * 60 * 4,
    severity: "high",
    active: true,
    campaigns: ["Carbanak v6", "POS-SOCKS-26"],
    techniques: ["T1566.001", "T1059.005", "T1071.001", "T1041", "T1486"],
    sectors: ["Retail", "Hospitality", "Banking"],
    summary:
      "Veteran financially-motivated group; long-standing POS-skimming + e-commerce skimmer operation that has evolved into a RaaS affiliate hub.",
    ttpsSummary:
      "Spear-phish with weaponized docs → Carbanak backdoor → POS-targeted memory scraping → bulk track-data exfil.",
  },
  {
    id: "ta-003",
    name: "Lazarus",
    aliases: ["APT38", "Hidden Cobra", "Diamond Sleet"],
    origin: "DPRK (state-sponsored)",
    motivation: "financial",
    firstObserved: Date.parse("2014-01-01"),
    lastObserved: Date.now() - 1000 * 60 * 60 * 9,
    severity: "high",
    active: true,
    campaigns: ["AppleJeus 2026", "WAGEMOLE"],
    techniques: ["T1195.002", "T1059.001", "T1027", "T1041", "T1071.001"],
    sectors: ["Crypto", "Defense", "Aerospace", "Pharma"],
    summary:
      "State-backed group merging financial crime with espionage. Currently fronting trojanized cryptocurrency apps signed with stolen developer certs.",
    ttpsSummary:
      "Trojanized OSS / wallets → signed loader → AppleJeus implants → wallet drain.",
  },
  {
    id: "ta-004",
    name: "Volt Typhoon",
    aliases: ["BRONZE SILHOUETTE"],
    origin: "PRC (state-sponsored)",
    motivation: "espionage",
    firstObserved: Date.parse("2021-06-01"),
    lastObserved: Date.now() - 1000 * 60 * 60 * 14,
    severity: "critical",
    active: true,
    campaigns: ["LotL-Routers", "TELCO-SQUAT"],
    techniques: ["T1078", "T1059", "T1110.001", "T1190", "T1098"],
    sectors: ["Telecom", "Utilities", "Maritime", "Defense"],
    summary:
      "Living-off-the-land intrusion set focused on US critical infrastructure pre-positioning. Targets SOHO/edge routers to proxy traffic.",
    ttpsSummary:
      "Edge router compromise → cobalt-free LotL via WMI/PowerShell → cred theft via volume-shadow → quiet persistence.",
  },
  {
    id: "ta-005",
    name: "APT29",
    aliases: ["Cozy Bear", "Midnight Blizzard", "NOBELIUM"],
    origin: "RU SVR (state-sponsored)",
    motivation: "espionage",
    firstObserved: Date.parse("2008-01-01"),
    lastObserved: Date.now() - 1000 * 60 * 60 * 28,
    severity: "high",
    active: true,
    campaigns: ["DUKE.2026.A", "OAUTH-CONSENT-25"],
    techniques: ["T1566.002", "T1098", "T1078.004", "T1606.002", "T1213"],
    sectors: ["Government", "Diplomatic", "Think tanks", "Tech"],
    summary:
      "Long-running Russian SVR intrusion set with consistent focus on M365 / Azure tenants of policy-adjacent organizations.",
    ttpsSummary:
      "OAuth consent phishing → app-of-apps abuse → mailbox enumeration → SharePoint data theft.",
  },
  {
    id: "ta-006",
    name: "TA505",
    aliases: ["Hive0065", "Indrik Spider"],
    origin: "RU-aligned (commercial)",
    motivation: "financial",
    firstObserved: Date.parse("2014-12-01"),
    lastObserved: Date.now() - 1000 * 60 * 60 * 31,
    severity: "high",
    active: true,
    campaigns: ["Cl0p-derivative-26", "MFT-Zero-Day"],
    techniques: ["T1190", "T1133", "T1059", "T1486", "T1041"],
    sectors: ["Manufacturing", "Healthcare", "Energy", "Finance"],
    summary:
      "Prolific affiliate of multiple ransomware brands. Currently exploiting an unpatched managed-file-transfer 0-day at scale.",
    ttpsSummary:
      "Internet-facing MFT 0-day → webshell → Cl0p stager → exfil before encryption (or pure exfil).",
  },
];

export const IOC_CATALOG: IOC[] = [
  { id: "ioc-1", value: "185.220.101.34",                kind: "ip",     firstSeen: Date.now() - 1000 * 60 * 60 * 3,  lastSeen: Date.now() - 1000 * 60 * 12, confidence: 92, source: "Sentinel-TI", actor: "Scattered Spider", family: "OKTA-PHISH-22",   notes: "C2 beacon dest, Tor exit" },
  { id: "ioc-2", value: "203.0.113.42",                  kind: "ip",     firstSeen: Date.now() - 1000 * 60 * 60 * 30, lastSeen: Date.now() - 1000 * 60 * 90, confidence: 88, source: "AbuseIPDB",   actor: "Scattered Spider", family: "OKTA-PHISH-22",   notes: "Password spray origin" },
  { id: "ioc-3", value: "auth-okta.acme-tools.io",       kind: "domain", firstSeen: Date.now() - 1000 * 60 * 60 * 36, lastSeen: Date.now() - 1000 * 60 * 60, confidence: 96, source: "DomainTools", actor: "Scattered Spider", family: "OKTA-PHISH-22",   notes: "Look-alike Okta phish domain" },
  { id: "ioc-4", value: "8ee201bb…dc7a",                 kind: "hash",   firstSeen: Date.now() - 1000 * 60 * 60 * 6,  lastSeen: Date.now() - 1000 * 60 * 60 * 3, confidence: 99, source: "VirusTotal", actor: "Scattered Spider", family: "wdh.exe persistence", notes: "SHA-256 of unsigned svc binary" },
  { id: "ioc-5", value: "carbanak-c2.tunnel.bad.io",     kind: "domain", firstSeen: Date.now() - 1000 * 60 * 60 * 50, lastSeen: Date.now() - 1000 * 60 * 60 * 12,confidence: 87, source: "Mandiant",    actor: "FIN7",             family: "Carbanak v6",     notes: "Carbanak v6 C2 fronting" },
  { id: "ioc-6", value: "AS-RU-PRIVATE",                 kind: "registry", firstSeen: Date.now() - 1000 * 60 * 60 * 96, lastSeen: Date.now() - 1000 * 60 * 60 * 18, confidence: 70, source: "RIR-WHOIS", actor: "TA505", family: "Cl0p-derivative-26", notes: "Anomalous origin ASN for IAM key use" },
  { id: "ioc-7", value: "https://wallet-update.io/dl/m", kind: "url",    firstSeen: Date.now() - 1000 * 60 * 60 * 60, lastSeen: Date.now() - 1000 * 60 * 60 * 9, confidence: 91, source: "Sentinel-TI", actor: "Lazarus",          family: "AppleJeus 2026",  notes: "Trojanized installer URL" },
  { id: "ioc-8", value: "noreply@m365-sec.com",          kind: "email",  firstSeen: Date.now() - 1000 * 60 * 60 * 90, lastSeen: Date.now() - 1000 * 60 * 60 * 50,confidence: 82, source: "Phishtank",   actor: "APT29",            family: "OAUTH-CONSENT-25", notes: "OAuth consent phish sender" },
  { id: "ioc-9", value: "router.volt-c2.example",        kind: "domain", firstSeen: Date.now() - 1000 * 60 * 60 * 220,lastSeen: Date.now() - 1000 * 60 * 60 * 30,confidence: 78, source: "CISA-AAR",    actor: "Volt Typhoon",     family: "LotL-Routers",    notes: "SOHO router pivot anchor" },
  { id: "ioc-10", value: "1c0844ee…9931",                kind: "hash",   firstSeen: Date.now() - 1000 * 60 * 60 * 18, lastSeen: Date.now() - 1000 * 60 * 60 * 4, confidence: 89, source: "Sentinel-EDR",actor: "FIN7",             family: "Carbanak v6",     notes: "Carbanak loader v6" },
];

export const CAMPAIGNS: Campaign[] = [
  { id: "cmp-1", name: "OKTA-PHISH-22",     actor: "Scattered Spider", status: "active",   startedAt: Date.now() - 1000 * 60 * 60 * 38, victims: 14, severity: "critical", industries: ["SaaS", "Hospitality"],     summary: "Helpdesk-impersonation phishing targeting SSO admins across SaaS providers." },
  { id: "cmp-2", name: "AppleJeus 2026",    actor: "Lazarus",          status: "active",   startedAt: Date.now() - 1000 * 60 * 60 * 60, victims: 26, severity: "high",     industries: ["Crypto", "Wallets"],       summary: "Trojanized crypto-wallet apps signed with a stolen developer certificate (revoked 14h ago)." },
  { id: "cmp-3", name: "Carbanak v6",       actor: "FIN7",             status: "active",   startedAt: Date.now() - 1000 * 60 * 60 * 200,victims: 9,  severity: "high",     industries: ["Retail", "POS"],          summary: "POS-targeted backdoor with new SOCKS5 proxy variant; bulk track-data scraping." },
  { id: "cmp-4", name: "LotL-Routers",      actor: "Volt Typhoon",     status: "active",   startedAt: Date.now() - 1000 * 60 * 60 * 380,victims: 31, severity: "critical", industries: ["Telecom", "Utilities"],   summary: "Living-off-the-land in SOHO routers — strategic pre-positioning, no payloads observed." },
  { id: "cmp-5", name: "OAUTH-CONSENT-25",  actor: "APT29",            status: "watching", startedAt: Date.now() - 1000 * 60 * 60 * 95, victims: 7,  severity: "medium",   industries: ["Government", "NGO"],       summary: "OAuth consent phishing against M365 tenants in policy adjacent orgs." },
  { id: "cmp-6", name: "MFT-Zero-Day",      actor: "TA505",            status: "active",   startedAt: Date.now() - 1000 * 60 * 60 * 140,victims: 88, severity: "high",     industries: ["Manufacturing", "Energy"],summary: "Mass exploitation of an unpatched managed-file-transfer 0-day; exfil-then-extort." },
];

// ─ MITRE ATT&CK coverage matrix ───────────────────────────────────────────

export interface MitreCell {
  technique: string;
  name: string;
  detections: number;      // # of Sigma/EDR rules
  matchesLast24h: number;
  coverage: "high" | "med" | "low" | "none";
}

const TACTICS = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Exfiltration",
  "Impact",
] as const;
export type MitreTactic = (typeof TACTICS)[number];
export const MITRE_TACTICS: readonly MitreTactic[] = TACTICS;

export const MITRE_MATRIX: Record<MitreTactic, MitreCell[]> = {
  "Initial Access": [
    { technique: "T1566.001", name: "Spear-phish attachment", detections: 14, matchesLast24h: 3, coverage: "high" },
    { technique: "T1566.002", name: "Spear-phish link",        detections: 9,  matchesLast24h: 1, coverage: "high" },
    { technique: "T1566.004", name: "Spear-phish voice",       detections: 2,  matchesLast24h: 0, coverage: "low"  },
    { technique: "T1190",     name: "Public-facing app exploit",detections: 7,  matchesLast24h: 2, coverage: "med"  },
    { technique: "T1078",     name: "Valid accounts",           detections: 11, matchesLast24h: 4, coverage: "high" },
  ],
  "Execution": [
    { technique: "T1059.001", name: "PowerShell",               detections: 22, matchesLast24h: 6, coverage: "high" },
    { technique: "T1059.003", name: "Windows cmd",              detections: 8,  matchesLast24h: 2, coverage: "med"  },
    { technique: "T1053.005", name: "Scheduled task",           detections: 6,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1204.002", name: "User exec malicious file", detections: 5,  matchesLast24h: 0, coverage: "med"  },
  ],
  "Persistence": [
    { technique: "T1543.003", name: "Windows service",          detections: 7,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1547.001", name: "Registry Run keys",        detections: 9,  matchesLast24h: 1, coverage: "high" },
    { technique: "T1098",     name: "Account manipulation",     detections: 4,  matchesLast24h: 1, coverage: "low"  },
    { technique: "T1505.003", name: "Web shell",                detections: 3,  matchesLast24h: 0, coverage: "low"  },
  ],
  "Privilege Escalation": [
    { technique: "T1068",     name: "Exploitation for priv esc",detections: 3,  matchesLast24h: 0, coverage: "low"  },
    { technique: "T1078.003", name: "Local accounts",           detections: 6,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1055",     name: "Process injection",        detections: 11, matchesLast24h: 2, coverage: "high" },
  ],
  "Defense Evasion": [
    { technique: "T1027",     name: "Obfuscated files/info",    detections: 14, matchesLast24h: 4, coverage: "high" },
    { technique: "T1562.001", name: "Disable security tools",   detections: 8,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1218.011", name: "Rundll32",                 detections: 5,  matchesLast24h: 0, coverage: "med"  },
  ],
  "Credential Access": [
    { technique: "T1003.001", name: "LSASS memory",             detections: 12, matchesLast24h: 2, coverage: "high" },
    { technique: "T1110.003", name: "Password spray",           detections: 9,  matchesLast24h: 1, coverage: "high" },
    { technique: "T1555",     name: "Cred from password store", detections: 3,  matchesLast24h: 0, coverage: "low"  },
    { technique: "T1556",     name: "Modify authn process",     detections: 0,  matchesLast24h: 0, coverage: "none" },
  ],
  "Discovery": [
    { technique: "T1018",     name: "Remote system discovery",  detections: 5,  matchesLast24h: 2, coverage: "med"  },
    { technique: "T1087.002", name: "Domain account discovery", detections: 6,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1057",     name: "Process discovery",        detections: 4,  matchesLast24h: 0, coverage: "low"  },
  ],
  "Lateral Movement": [
    { technique: "T1021.001", name: "RDP",                      detections: 9,  matchesLast24h: 2, coverage: "high" },
    { technique: "T1021.002", name: "SMB / admin shares",       detections: 8,  matchesLast24h: 1, coverage: "high" },
    { technique: "T1021.006", name: "WinRM",                    detections: 3,  matchesLast24h: 0, coverage: "low"  },
  ],
  "Collection": [
    { technique: "T1213",     name: "Data from repos",          detections: 2,  matchesLast24h: 0, coverage: "low"  },
    { technique: "T1530",     name: "Cloud data storage",       detections: 5,  matchesLast24h: 1, coverage: "med"  },
  ],
  "Exfiltration": [
    { technique: "T1041",     name: "Exfil over C2",            detections: 7,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1071.001", name: "Application-layer C2",     detections: 11, matchesLast24h: 2, coverage: "high" },
    { technique: "T1071.004", name: "DNS tunneling",            detections: 6,  matchesLast24h: 1, coverage: "med"  },
    { technique: "T1567.002", name: "Exfil to cloud storage",   detections: 4,  matchesLast24h: 0, coverage: "low"  },
  ],
  "Impact": [
    { technique: "T1486",     name: "Data encrypted for impact",detections: 9,  matchesLast24h: 0, coverage: "high" },
    { technique: "T1490",     name: "Inhibit system recovery",  detections: 5,  matchesLast24h: 0, coverage: "med"  },
    { technique: "T1485",     name: "Data destruction",         detections: 3,  matchesLast24h: 0, coverage: "low"  },
  ],
};
