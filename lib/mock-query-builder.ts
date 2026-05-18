/**
 * Deterministic NL → SOC-QL translator for demos.
 * No external API; rule-based heuristics that read the user's intent.
 */

type Hit = { field: string; op: string; value: string };

const SEV_WORDS: Record<string, string> = {
  critical: "critical",
  crit: "critical",
  high: "high",
  med: "medium",
  medium: "medium",
  low: "low",
  info: "info",
  informational: "info",
};

const TECH_HINTS: Record<string, string> = {
  lsass: "T1003.001",
  "credential dump": "T1003.001",
  powershell: "T1059.001",
  "encoded ps": "T1059.001",
  rdp: "T1021.001",
  smb: "T1021.002",
  beacon: "T1071.001",
  beaconing: "T1071.001",
  "dns tunnel": "T1071.004",
  ransomware: "T1486",
  encryption: "T1486",
  persistence: "T1543.003",
  "valid account": "T1078",
  spray: "T1110.003",
  "password spray": "T1110.003",
};

const HOST_WORDS = [
  "win-jumpbox-01", "fin-db-prod-01", "ceo-laptop", "ci-github-runner",
  "edge-vpn-01", "hr-app-prod-02", "dev-build-runner",
];

const CATEGORIES = ["auth", "network", "endpoint", "cloud", "data", "identity", "malware", "policy"];

function extractScore(nl: string): Hit | null {
  const m = nl.match(/score\s*(>=|>|<=|<|=)\s*(\d{1,3})/i);
  if (m) return { field: "score", op: m[1], value: m[2] };
  if (/(high.value|critical|crown.jewel|severe)/i.test(nl)) return { field: "score", op: ">=", value: "80" };
  if (/noisy|low|info(rmational)?/i.test(nl)) return null;
  return null;
}

export function buildQuery(nl: string): { query: string; rationale: string[] } {
  const lower = nl.toLowerCase();
  const hits: Hit[] = [];
  const rationale: string[] = [];

  // Severity
  for (const [word, sev] of Object.entries(SEV_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, "i").test(lower)) {
      hits.push({ field: "severity", op: "=", value: sev });
      rationale.push(`Matched severity hint "${word}" → \`severity=${sev}\``);
      break;
    }
  }

  // Host
  for (const h of HOST_WORDS) {
    if (lower.includes(h)) {
      hits.push({ field: "host", op: "=", value: h });
      rationale.push(`Detected explicit host \`${h}\``);
      break;
    }
  }
  if (!hits.find((h) => h.field === "host") && /\bjumpbox\b/.test(lower)) {
    hits.push({ field: "host", op: "=", value: "win-jumpbox-01" });
    rationale.push(`Resolved "jumpbox" → \`host=win-jumpbox-01\``);
  }
  if (!hits.find((h) => h.field === "host") && /\bfinance db\b|fin db/.test(lower)) {
    hits.push({ field: "host", op: "=", value: "fin-db-prod-01" });
    rationale.push(`Resolved "finance db" → \`host=fin-db-prod-01\``);
  }

  // Category
  const cat = CATEGORIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(lower));
  if (cat) {
    hits.push({ field: "category", op: "=", value: cat });
    rationale.push(`Detected category "${cat}"`);
  }

  // Technique
  let techHit: string | null = null;
  for (const [k, t] of Object.entries(TECH_HINTS)) {
    if (lower.includes(k)) {
      techHit = t;
      hits.push({ field: "technique", op: "=", value: t });
      rationale.push(`Matched "${k}" → MITRE \`${t}\``);
      break;
    }
  }
  if (!techHit) {
    // free-text fallback on description
    const phrase = lower.match(/about\s+([a-z0-9 .-]+?)(?:$|\?|,|\.)/);
    if (phrase) {
      hits.push({ field: "description", op: "~", value: phrase[1].trim() });
      rationale.push(`No technique mapping; falling back to \`description~"${phrase[1].trim()}"\``);
    }
  }

  // Score
  const score = extractScore(lower);
  if (score) {
    hits.push(score);
    rationale.push(`Risk score constraint: \`${score.field}${score.op}${score.value}\``);
  }

  // Time hint
  if (/\b(last|past)\s+(hour|24|48|today)/.test(lower)) {
    rationale.push("Time scoping isn't in SOC-QL yet — engine returns the recent window by default.");
  }

  // Limit
  let limit: string | null = null;
  const lim = lower.match(/\b(top|limit)\s+(\d+)/);
  if (lim) {
    limit = lim[2];
    rationale.push(`Capping results to ${limit}`);
  }

  if (hits.length === 0) {
    return {
      query: "severity=critical OR severity=high",
      rationale: [
        "Couldn't extract specific intent. Defaulting to the noisiest signal: critical-or-high.",
        "Try mentioning a host, severity, technique, or category for a tighter query.",
      ],
    };
  }

  // Combine: chain with AND
  const body = hits
    .map((h) => {
      const needsQuote = /[\s]/.test(h.value);
      return `${h.field}${h.op}${needsQuote ? `"${h.value}"` : h.value}`;
    })
    .join(" AND ");

  const query = limit ? `${body} | limit ${limit}` : body;
  return { query, rationale };
}
