import type { AgentId } from "./types";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/**
 * Deterministic mock responder. Looks at the last user message + the agent
 * persona and produces a sensible SOC-style answer. No external calls.
 */
function craft(agent: AgentId, last: string): string {
  const q = last.toLowerCase();

  // ─ topic-based answers ────────────────────────────────────────────────
  if (/pci|gdpr|compliance|regulatory/.test(q)) {
    return `## 📜 Compliance angle

For **INC-2041**, the relevant regulatory hooks are:

- **GDPR Art. 33** — 72-hour breach notification clock starts when we *confirm* personal data was accessed. Right now we have an active investigation but no confirmed external exfiltration. **Recommendation:** notify the DPO immediately and prepare the disclosure draft; do **not** trigger the clock prematurely.
- **PCI-DSS Req. 12.10** — incident response plan must be invoked. Pull in the QSA contact.
- **NIS2 (EU)** — if confirmed, significant-incident notification within 24h to the national CSIRT.

Document every step in the case file — regulators ask for the timeline first.`;
  }

  if (/mttr|sla|how long/.test(q)) {
    return `## ⏱️ Timing context

- Detection-to-triage on this incident: **2m 18s** (well inside 5-min SLA).
- Detection-to-containment is currently **17m** and counting — SLA target is 30m for critical, so we're on pace.
- Historical median MTTR for similar credential-spray-into-exfil patterns at this tenant: **24m**.

If the playbook is executed in full now, expected total time-to-closure: ~45 min.`;
  }

  if (/blast|radius|impact|how (bad|big)/.test(q)) {
    return `## 💥 Updated blast radius

Confirmed touchpoints:
- \`win-jumpbox-01\` — attacker code executed, isolated.
- \`fin-db-prod-01\` — bulk read of \`customer_pii\` (2.1M rows) confirmed.
- \`ci-github-runner\` — staging destination for the egress.

Plausibly compromised but unconfirmed:
- Service account \`fin-svc-reader\` — credentials may have been harvested via LSASS.
- Any host that shared an SSH session with the jumpbox in the last 24h.

**Open question:** did the staged data leave \`ci-github-runner\`? Pcap from the egress firewall will answer this.`;
  }

  if (/alternative|other (option|approach)|instead/.test(q)) {
    return `## 🔀 Alternative containment paths

1. **Aggressive isolation** — isolate \`fin-db-prod-01\` from *all* networks. Pros: zero exfil risk. Cons: finance ops down ~2-4h, executive escalation.
2. **Surgical revoke** — kill SMB on the DB host, leave HTTPS for the application tier. Pros: business continuity. Cons: assumes attacker only used SMB (verify via netflow first).
3. **Honeypot pivot** — let the attacker continue under deception while we trace infra. Pros: intel gold. Cons: requires CISO sign-off and stretches GDPR clock.

I'd recommend **#2** unless we see a second pivot point. Want me to draft the firewall changes?`;
  }

  if (/credential|password|spray/.test(q)) {
    return `## 🔑 Credential exposure summary

Confirmed compromised: \`m.chen@acme.io\` (sessions revoked at T+02:11).

At-risk (not confirmed compromised):
- \`fin-svc-reader\` — possibly harvested from LSASS on \`win-jumpbox-01\`. Rotate now.
- Any account that authenticated to \`win-jumpbox-01\` in the 4h window before isolation — pulling that list from the EDR session telemetry.

Action: trigger forced password reset + MFA re-enrollment for the at-risk list. ETA on the list: 5 min.`;
  }

  // ─ agent-flavored generic fallbacks ───────────────────────────────────
  const personaTouches: Record<AgentId, string> = {
    "threat-detection":
      `Looking at the current event correlation for **INC-2041**: 3 events form the malicious chain (\`evt-10001\` → \`evt-10002\` → \`evt-10003\`). Confidence on the malicious classification is 94%. Two adjacent events (\`evt-10004\`, \`evt-10005\`) are timeline-suspect and bumped to investigate.`,
    "root-cause":
      `Root cause remains the legacy-auth carve-out on Okta that allowed password spray to succeed without MFA. The kill chain pivots on \`win-jumpbox-01\` — that's where contain-first effort should focus. Reconstruction confidence: high (>80%) given the explicit Sigma matches.`,
    "risk-assessment":
      `Risk profile unchanged: **Critical / 96**. The big swing variable is whether the staged data on \`ci-github-runner\` left the perimeter. If yes → mandatory GDPR disclosure; if no → internal-handle.`,
    remediation:
      `If you want me to extend the playbook, I can add steps for: (a) forensic image transfer to the IR S3 bucket, (b) Sigma rule deploy across the rest of the fleet, (c) credential rotation list export. Which?`,
    "incident-report":
      `Happy to redraft a specific section. Most-requested by leadership: a one-paragraph summary suitable for the board, or a deeper "lessons learned" with concrete owners and due dates. Which do you need?`,
  };
  return personaTouches[agent];
}

export async function* mockChatStream(
  agent: AgentId,
  history: ChatMsg[]
): AsyncGenerator<string> {
  const last = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const text = craft(agent, last);
  // tokenize for streaming feel
  const chunks = text.match(/[\s\S]{1,5}/g) ?? [text];
  for (const c of chunks) {
    await new Promise((r) => setTimeout(r, 14 + Math.random() * 18));
    yield c;
  }
}
