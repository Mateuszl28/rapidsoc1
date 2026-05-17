import type { SecurityEvent } from "./types";
import { EVENT_TEMPLATES, SEED_EVENTS } from "./mock-data";

/**
 * Tiny KQL/SPL-flavored query parser for the hunting console.
 * Supports clauses joined with AND/OR:
 *   field=value
 *   field!=value
 *   field~"substring"
 *   field>=number
 *   has(field)
 * Plus a top-level | limit N tail.
 * It's a demo engine — not production safe.
 */

type Clause = (e: SecurityEvent) => boolean;
type Combinator = "AND" | "OR";

function fieldVal(e: SecurityEvent, f: string): string | number | undefined {
  const map: Record<string, string | number | undefined> = {
    id: e.id,
    ts: e.timestamp,
    severity: e.severity,
    category: e.category,
    source: e.source,
    src: e.sourceIp,
    sourceip: e.sourceIp,
    dst: e.destIp,
    destip: e.destIp,
    user: e.user,
    host: e.host,
    technique: e.technique,
    status: e.status,
    score: e.score,
    description: e.description,
    desc: e.description,
    raw: e.rawLog,
  };
  return map[f.toLowerCase()];
}

function compileClause(raw: string): Clause {
  const m =
    raw.match(/^\s*has\(([a-z_]+)\)\s*$/i) ||
    raw.match(/^\s*([a-z_]+)\s*(=|!=|~|>=|<=|>|<)\s*"([^"]*)"\s*$/i) ||
    raw.match(/^\s*([a-z_]+)\s*(=|!=|~|>=|<=|>|<)\s*([^\s]+)\s*$/i);

  if (!m) {
    return () => false;
  }
  if (m.length === 2) {
    const f = m[1];
    return (e) => fieldVal(e, f) !== undefined && fieldVal(e, f) !== "";
  }
  const field = m[1];
  const op = m[2];
  const rhsRaw = m[3];
  const num = Number(rhsRaw);
  const isNumber = !Number.isNaN(num);

  return (e) => {
    const v = fieldVal(e, field);
    if (v === undefined) return false;
    const vs = String(v).toLowerCase();
    const rhs = rhsRaw.toLowerCase();
    switch (op) {
      case "=":  return vs === rhs;
      case "!=": return vs !== rhs;
      case "~":  return vs.includes(rhs);
      case ">":  return isNumber ? Number(v) >  num : vs >  rhs;
      case "<":  return isNumber ? Number(v) <  num : vs <  rhs;
      case ">=": return isNumber ? Number(v) >= num : vs >= rhs;
      case "<=": return isNumber ? Number(v) <= num : vs <= rhs;
      default: return false;
    }
  };
}

export interface QueryResult {
  ok: boolean;
  rows: SecurityEvent[];
  total: number;
  tookMs: number;
  parsed: { clauses: string[]; combinators: Combinator[]; limit?: number };
  error?: string;
}

export function runQuery(input: string): QueryResult {
  const t0 = performance.now();
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false,
      rows: [],
      total: 0,
      tookMs: 0,
      parsed: { clauses: [], combinators: [] },
      error: "empty query",
    };
  }

  // Optional trailing  | limit N
  let limit: number | undefined;
  let body = trimmed;
  const limitMatch = trimmed.match(/\|\s*limit\s+(\d+)\s*$/i);
  if (limitMatch) {
    limit = Math.max(1, Math.min(500, Number(limitMatch[1])));
    body = trimmed.slice(0, limitMatch.index).trim();
  }

  // Split on AND/OR (top-level only — no parens for the demo)
  const parts = body.split(/\s+(AND|OR)\s+/i);
  const clauseStrs: string[] = [];
  const combinators: Combinator[] = [];
  parts.forEach((p, i) => {
    if (i % 2 === 0) clauseStrs.push(p);
    else combinators.push(p.toUpperCase() as Combinator);
  });
  const compiled = clauseStrs.map(compileClause);

  // The pool: seed events + fabricated history from templates
  const pool = buildPool();

  const matches = pool.filter((e) => {
    let acc = compiled[0]?.(e) ?? false;
    for (let i = 1; i < compiled.length; i++) {
      const next = compiled[i](e);
      acc = combinators[i - 1] === "AND" ? acc && next : acc || next;
    }
    return acc;
  });

  const total = matches.length;
  const rows = limit ? matches.slice(0, limit) : matches.slice(0, 200);
  const tookMs = Math.round((performance.now() - t0) * 100) / 100;

  return {
    ok: true,
    rows,
    total,
    tookMs,
    parsed: { clauses: clauseStrs, combinators, limit },
  };
}

function buildPool(): SecurityEvent[] {
  // Combine seeds with deterministic-ish fabricated events for hunting feel
  const out: SecurityEvent[] = [...SEED_EVENTS];
  const hosts = ["win-jumpbox-01", "fin-db-prod-01", "ceo-laptop", "ci-github-runner", "edge-vpn-01", "hr-app-prod-02", "dev-build-runner"];
  const users = ["m.chen@acme.io", "j.patel@acme.io", "ci-deploy-bot", "svc-backup", "root", "fin-svc-reader"];
  const now = Date.now();

  let seq = 50000;
  for (let i = 0; i < 140; i++) {
    const tpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
    out.push({
      id: `evt-${seq++}`,
      timestamp: now - i * 1000 * 60 * 1.3,
      status: "new",
      host: hosts[i % hosts.length],
      user: users[(i * 3) % users.length],
      sourceIp: `10.${20 + (i % 4)}.${(i * 7) % 256}.${(i * 13) % 256}`,
      ...tpl,
    });
  }
  return out;
}

export const HUNT_FIELDS = [
  "severity", "category", "source", "host", "user",
  "src", "dst", "technique", "status", "score", "description",
] as const;

export const HUNT_OPERATORS = ["=", "!=", "~", ">", "<", ">=", "<="] as const;

export const HUNT_EXAMPLES: { label: string; query: string }[] = [
  { label: "Critical events on the jumpbox",                query: "severity=critical AND host=win-jumpbox-01" },
  { label: "LSASS credential access",                        query: "technique=T1003.001 OR description~lsass" },
  { label: "Beaconing-like network noise",                   query: "category=network AND description~beacon" },
  { label: "Service-account anomalies",                      query: "user=ci-deploy-bot AND score>=60" },
  { label: "Anything PowerShell touched",                    query: "description~powershell | limit 50" },
  { label: "Cloud findings, high-or-critical, recent 50",    query: "category=cloud AND score>=70 | limit 50" },
];
