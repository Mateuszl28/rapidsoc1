import type { AgentId } from "./types";

const MOCK_OUTPUTS: Record<AgentId, string> = {
  "threat-detection": `## 🎯 Triage Verdict

**3 events classified MALICIOUS — 1 active intrusion in progress.**

### Top findings
- **evt-10001** — \`MALICIOUS\` (confidence 96). Password spray from \`203.0.113.42\` succeeded against \`m.chen@acme.io\`. MITRE: **T1110.003**.
- **evt-10002** — \`MALICIOUS\` (confidence 92). Encoded PowerShell stager spawned from \`winword.exe\` on \`win-jumpbox-01\`. MITRE: **T1059.001**, **T1566.001**.
- **evt-10003** — \`MALICIOUS\` (confidence 89). Jittered HTTPS beaconing from \`win-jumpbox-01\` → \`185.220.101.34\` (known Tor exit). MITRE: **T1071.001**, **T1090.003**.

### Correlation
Events \`10001\` → \`10002\` → \`10003\` form a tight kill chain over 7 minutes on a single identity / host pair. This is one incident, not three.

### Suspicious (watchlist)
- \`evt-10004\` — IAM key from new ASN. Plausibly benign (vendor change) but timeline-adjacent.
- \`evt-10005\` — Large \`SELECT *\` from \`m.chen\` against \`customer_pii\`. **Highly suspect given evt-10001 credential compromise.**
`,

  "root-cause": `## 🧭 Root Cause Hypothesis

**Initial access vector: credential stuffing against a legacy IMAP endpoint that bypassed conditional access.**

### Kill chain reconstruction

1. **Recon** (T-26h) — External port scan against \`edge-vpn-01\` from \`203.0.113.0/24\`.
2. **Initial Access** (T-18h) — Password spray hit \`m.chen@acme.io\`. Legacy IMAP endpoint had no MFA enforcement (policy \`Block-Legacy-Auth\` carved out for "finance ops" 11 months ago).
3. **Execution** (T-6h) — Spear-phish doc opened on \`win-jumpbox-01\`. Macro launched \`powershell -enc\` stager.
4. **Persistence** (T-3h) — Service \`WinDefenderHelper\` installed on \`dev-build-runner\` (SYSTEM autorun).
5. **Credential Access** (T-90m) — LSASS memory dump attempted.
6. **Lateral Movement** (T-40m) — SMB hop \`win-jumpbox-01\` → \`fin-db-prod-01\` using harvested service-account creds.
7. **Exfiltration** (T-14m) — \`customer_pii\` SELECT staged 480 MB to \`ci-github-runner\` (internal staging — exfil not yet confirmed external).

### Pivot point
\`win-jumpbox-01\` is the lateral movement hinge. Compromise here gave SMB reach to the finance tier.

### Evidence gaps
- No EDR coverage on \`fin-db-prod-01\` (Linux, sensor never deployed). Need pcap from \`zeek-sensor-finance\`.
- Mail gateway logs needed to confirm phishing delivery vector for evt-10002.
`,

  "risk-assessment": `## ⚖️ Risk Assessment

**Severity: CRITICAL — Score 96 / 100.**

### Blast radius
- **Hosts:** \`fin-db-prod-01\` (finance prod DB), \`win-jumpbox-01\` (admin pivot), \`ci-github-runner\` (build infra, possible supply chain).
- **Identities:** \`m.chen@acme.io\` (finance director), service account \`fin-svc-reader\` (broad DB read).
- **Data:** \`customer_pii\` table — ~2.1M rows, includes PAN tokens. Subject to **PCI-DSS** and **GDPR Article 33** (72h breach notification).

### Exploitability
Attacker is **already inside** with confirmed lateral movement and likely data staging. Privilege level: domain user + service-account hash. **Not yet domain admin.**

### Business impact
- **Regulatory:** GDPR 72h clock starts on confirmation of exfil. Estimated reportable population: 2.1M EU residents.
- **Financial:** Worst-case GDPR fine exposure €20M / 4% revenue. Incident response + forensics ~$400-800k.
- **Brand:** High. Finance-sector breach disclosed publicly tends to drop NPS 8-12 points.

### Escalation path
🚨 **Page now:**
1. SOC manager → CISO
2. Legal & Privacy (GDPR clock)
3. Engineering VP (build-infra forensics)
4. Communications lead (hold-statement draft)
`,

  remediation: `## 🛠️ Containment Runbook

### 🛑 Contain (next 15 min)
- [ ] Isolate \`win-jumpbox-01\` via EDR network containment.
- [ ] Force-revoke all sessions for \`m.chen@acme.io\`: \`Revoke-MgUserSignInSession -UserId m.chen@acme.io\`.
- [ ] Disable Okta legacy-auth bypass policy \`finance-ops-legacy\`.
- [ ] Block egress to \`185.220.101.34\` at edge firewall + add to TI feed.
- [ ] Snapshot \`fin-db-prod-01\` for forensics, then sever its SMB exposure (\`iptables -A INPUT -p tcp --dport 445 -j DROP\` pending IR).
- [ ] Rotate service-account \`fin-svc-reader\` credentials.

### 🧯 Eradicate (today)
- [ ] Forensically image \`win-jumpbox-01\` and \`dev-build-runner\` before reset.
- [ ] Hunt for the same beacon pattern (\`60s ±0.8s, 64-byte HTTPS\`) across the fleet — broader compromise check.
- [ ] Revoke and re-issue all \`ci-deploy-bot\` IAM keys + audit recent \`AssumeRole\` events.
- [ ] Search GitHub artifacts for leaked credentials (\`trufflehog\` against last 30 days).
- [ ] Reset \`m.chen\` AD password + force MFA enrollment.

### 🛡️ Harden (this week)
- [ ] Kill the \`Block-Legacy-Auth\` carve-out — no exceptions.
- [ ] Roll out EDR sensors to all Linux finance hosts (currently 0% coverage).
- [ ] Author Sigma rule: jittered HTTPS beacon (interval 55-65s, body 50-100B, dest TLD .ru/.onion).
- [ ] Network segmentation: jumpbox VLAN must not reach finance DB VLAN over SMB.
- [ ] Add canary record to \`customer_pii\` to alert on next bulk read.
`,

  "incident-report": `# Incident Report — INC-2041

## Executive Summary
On 2026-05-17, a finance-director account was compromised via password spray that bypassed MFA through a legacy authentication carve-out. The attacker pivoted to an internal jumpbox, moved laterally to the finance database, and staged 480 MB of customer PII for exfiltration. The activity was detected and contained before confirmed external egress.

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
MITRE ATT&CK techniques observed: **T1110.003** (password spray), **T1566.001** (spear-phishing attachment), **T1059.001** (PowerShell), **T1543.003** (Windows service persistence), **T1003.001** (LSASS), **T1021.002** (SMB lateral), **T1041** (exfil over C2). Attacker infrastructure: \`203.0.113.42\` (entry), \`185.220.101.34\` (C2 beacon).

## Impact
- 2.1M customer PII records accessed; external exfil **not confirmed** but assumed pending forensics.
- 3 production assets touched, 1 isolated.
- Estimated response cost: $420k. GDPR reportable.

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
`,
};

export async function* mockStream(agent: AgentId): AsyncGenerator<string> {
  const text = MOCK_OUTPUTS[agent];
  // tokenize into reasonable chunks (words + punctuation) for realistic streaming feel
  const chunks = text.match(/[\s\S]{1,6}/g) ?? [text];
  for (const c of chunks) {
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
    yield c;
  }
}
