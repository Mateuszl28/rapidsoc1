import type { Severity } from "./types";

export interface SavedReport {
  id: string;
  incidentId: string;
  title: string;
  author: "Incident Report Agent" | "Risk Assessment Agent" | "Root Cause Agent" | "Remediation Agent";
  generatedAt: number;
  severity: Severity;
  audience: "exec" | "technical" | "regulatory" | "internal";
  wordCount: number;
  pages: number;
  tags: string[];
  status: "draft" | "approved" | "shared";
  approvedBy?: string;
  body: string;             // markdown
  summary: string;          // one-liner
}

const REPORT_INC_2041 = `# Incident Report — INC-2041

## Executive Summary
On 2026-05-17 a finance-director identity was compromised via a password
spray that bypassed MFA through a legacy authentication carve-out. The
attacker pivoted to an internal jumpbox, moved laterally to the finance
database, and staged 480 MB of customer PII for exfiltration. The
activity was detected and contained before confirmed external egress.

## Timeline (UTC)
- **00:00** — External port scan against edge VPN (recon).
- **08:00** — Password spray succeeded against \`m.chen@acme.io\` via legacy IMAP.
- **20:00** — Phishing document opened on \`win-jumpbox-01\`; PowerShell stager executed.
- **23:00** — Persistence service installed on \`dev-build-runner\`.
- **24:30** — LSASS memory access detected by EDR.
- **25:20** — SMB lateral movement to \`fin-db-prod-01\`.
- **25:46** — 480 MB \`SELECT *\` against \`customer_pii\`.
- **26:00** — Detection: SOC paged, containment initiated.

## Technical Details
MITRE ATT&CK techniques observed:
- **T1110.003** (password spray)
- **T1566.001** (spear-phishing attachment)
- **T1059.001** (PowerShell)
- **T1543.003** (Windows service persistence)
- **T1003.001** (LSASS dump)
- **T1021.002** (SMB lateral)
- **T1041** (exfil over C2)

Attacker infrastructure: \`203.0.113.42\` (entry), \`185.220.101.34\` (C2 beacon).

## Impact
- 2.1M customer PII records accessed; external exfiltration **not
  confirmed** but assumed pending forensics.
- 3 production assets touched, 1 isolated.
- Estimated response cost: $420k. GDPR reportable under Article 33.

## Response Actions
- Jumpbox isolated, finance DB snapshotted and SMB-isolated.
- Compromised identity sessions revoked, legacy-auth carve-out eliminated.
- IAM keys rotated, EDR signatures deployed fleet-wide.

## Lessons Learned
- Legacy auth exceptions kill MFA. Eliminate them.
- Zero EDR coverage on the finance Linux fleet was the largest blind spot.
- Jumpbox → finance VLAN SMB reach should never have existed; segment.
- Add canary rows / read alarms to all PII tables.
- Quarterly attack-path review must include identity → host → data joins.
`;

const REPORT_INC_2040 = `# Incident Report — INC-2040

## Executive Summary
A service-account access key (\`ci-deploy-bot\`) was observed being used
from a previously-unseen ASN. Forensics confirm the key was leaked via a
public GitHub Actions artifact. No customer data accessed; the affected
permissions were limited to read access on a build-only S3 bucket.

## Timeline (UTC)
- **T-72h** — Public artifact published containing the key (developer error).
- **T-58h** — First anomalous \`AssumeRole\` from AS-RU-PRIVATE.
- **T-40m** — Sentinel raises high-confidence anomaly.
- **T-12m** — Key rotated; old key revoked; CloudTrail walked back to confirm scope.

## Technical Details
- MITRE: **T1078.004** (Valid Accounts: Cloud)
- Affected scope: \`ci-deploy-bot\` (read on \`s3-build-artifacts\`)
- Detected via: ASN-anomaly rule + first-seen ASN heuristic

## Impact
- Sensitive data: **none accessed**.
- Build secrets: rotated as a precaution.
- Customer impact: **none**.

## Response Actions
- Key revoked, rotated, audit trail captured.
- Repository contributor's permissions scoped down.
- New pre-commit hook blocks accidental key exposure org-wide.

## Lessons Learned
- Service-account keys should be ephemeral; migrate to OIDC federation.
- Public artifacts must be scanned with \`trufflehog\` in CI.
`;

const REPORT_INC_2039 = `# Incident Report — INC-2039 (Contained)

## Executive Summary
An unsigned Windows service named \`WinDefenderHelper\` was installed
with SYSTEM-level autorun on \`dev-build-runner\`. EDR isolated the host
within 4 minutes of the alert. Image is being rebuilt; no lateral
movement observed.

## Technical Details
- MITRE: **T1543.003** (Windows service persistence)
- Binary: \`C:\\Windows\\Temp\\wdh.exe\` (unsigned)
- Hash: \`8ee201bb…dc7a\` (now distributed to fleet block-list)

## Impact
- Build infra: 1 host quarantined.
- No CI jobs affected (failover to secondary runner).

## Response Actions
- Host isolated, forensically imaged, rebuilt from gold image.
- Sigma rule deployed for unsigned services with autorun.
`;

const SUMMARY_2041 = "Suspected ransomware staging via legacy-auth bypass → jumpbox pivot → finance DB. Contained before confirmed external exfil. GDPR considerations active.";
const SUMMARY_2040 = "Leaked CI key used from anomalous ASN. No data impact; rotated within 12 min of detection.";
const SUMMARY_2039 = "Rogue SYSTEM persistence on a build runner. Isolated and re-imaged; no lateral movement.";

export const REPORTS: SavedReport[] = [
  {
    id: "RPT-2041-A",
    incidentId: "INC-2041",
    title: "INC-2041 — Suspected ransomware staging on fin-db-prod-01 (executive)",
    author: "Incident Report Agent",
    generatedAt: Date.now() - 1000 * 60 * 12,
    severity: "critical",
    audience: "exec",
    wordCount: 410,
    pages: 3,
    tags: ["ransomware", "credential-spray", "GDPR", "finance"],
    status: "draft",
    body: REPORT_INC_2041,
    summary: SUMMARY_2041,
  },
  {
    id: "RPT-2041-B",
    incidentId: "INC-2041",
    title: "INC-2041 — Root cause analysis (technical)",
    author: "Root Cause Agent",
    generatedAt: Date.now() - 1000 * 60 * 14,
    severity: "critical",
    audience: "technical",
    wordCount: 380,
    pages: 3,
    tags: ["root-cause", "kill-chain", "MITRE"],
    status: "approved",
    approvedBy: "secops-l3",
    body: REPORT_INC_2041.replace("Incident Report", "Root Cause Analysis"),
    summary: SUMMARY_2041,
  },
  {
    id: "RPT-2041-C",
    incidentId: "INC-2041",
    title: "INC-2041 — GDPR Article 33 brief (regulatory)",
    author: "Risk Assessment Agent",
    generatedAt: Date.now() - 1000 * 60 * 9,
    severity: "critical",
    audience: "regulatory",
    wordCount: 220,
    pages: 1,
    tags: ["GDPR", "compliance", "Article-33"],
    status: "draft",
    body: `# Article 33 brief — INC-2041

## Notification rationale
A potential personal-data breach has been identified. This brief
captures the facts required by GDPR Article 33 within the 72-hour
window. The breach is **not yet confirmed**; this is a precautionary
draft.

## Nature of the breach
Unauthorized access to a finance database containing customer PII;
staging of 480 MB of \`customer_pii\` records to an internal CI
runner. No confirmed external egress.

## Categories and approximate number of data subjects
- Approximately **2.1M** EU/EEA data subjects.
- Categories: name, email, hashed PAN tokens, billing address.

## Likely consequences
Low-to-medium individual risk pending exfil confirmation. No
authentication credentials were stored in the affected dataset.

## Measures taken
- Network containment of attacker pivot
- Snapshot + isolation of the database
- Identity sessions revoked, legacy-auth carve-out removed
- Forensic acquisition initiated
`,
    summary: SUMMARY_2041,
  },
  {
    id: "RPT-2041-D",
    incidentId: "INC-2041",
    title: "INC-2041 — Remediation runbook (internal)",
    author: "Remediation Agent",
    generatedAt: Date.now() - 1000 * 60 * 7,
    severity: "critical",
    audience: "internal",
    wordCount: 510,
    pages: 4,
    tags: ["playbook", "runbook"],
    status: "approved",
    approvedBy: "oncall-tier2",
    body: `# Remediation runbook — INC-2041

## 🛑 Contain (next 15 min)
- [x] Isolate \`win-jumpbox-01\` via EDR network containment.
- [x] Revoke all sessions for \`m.chen@acme.io\`.
- [x] Disable Okta legacy-auth carve-out \`finance-ops-legacy\`.
- [x] Block egress to \`185.220.101.34\` at edge.
- [x] Snapshot \`fin-db-prod-01\` and sever SMB.
- [x] Rotate \`fin-svc-reader\` credentials.

## 🧯 Eradicate (today)
- [ ] Forensic image \`win-jumpbox-01\` and \`dev-build-runner\`.
- [ ] Hunt 60s-jitter beacons fleet-wide.
- [ ] Revoke \`ci-deploy-bot\` IAM keys.
- [ ] Reset \`m.chen\` AD password + force MFA enrollment.

## 🛡️ Harden (this week)
- [ ] Eliminate legacy-auth carve-outs.
- [ ] Deploy EDR sensors to finance Linux fleet.
- [ ] Publish Sigma rule: jittered HTTPS beacon.
- [ ] Segment jumpbox VLAN — deny SMB to finance VLAN.
- [ ] Add canary row to \`customer_pii\`.
`,
    summary: SUMMARY_2041,
  },

  {
    id: "RPT-2040-A",
    incidentId: "INC-2040",
    title: "INC-2040 — Leaked IAM key from public artifact",
    author: "Incident Report Agent",
    generatedAt: Date.now() - 1000 * 60 * 35,
    severity: "high",
    audience: "exec",
    wordCount: 250,
    pages: 2,
    tags: ["IAM", "supply-chain", "DevSecOps"],
    status: "approved",
    approvedBy: "secops-l2",
    body: REPORT_INC_2040,
    summary: SUMMARY_2040,
  },
  {
    id: "RPT-2039-A",
    incidentId: "INC-2039",
    title: "INC-2039 — Rogue persistence on dev-build-runner",
    author: "Incident Report Agent",
    generatedAt: Date.now() - 1000 * 60 * 60 * 2,
    severity: "high",
    audience: "internal",
    wordCount: 180,
    pages: 1,
    tags: ["persistence", "endpoint"],
    status: "shared",
    body: REPORT_INC_2039,
    summary: SUMMARY_2039,
  },
];

export function findReport(id: string): SavedReport | undefined {
  return REPORTS.find((r) => r.id === id);
}
