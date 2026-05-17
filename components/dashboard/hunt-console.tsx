"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HUNT_EXAMPLES,
  HUNT_FIELDS,
  HUNT_OPERATORS,
} from "@/lib/hunt-engine";
import type { SecurityEvent, Severity } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import {
  BookOpen,
  Play,
  Save,
  Sparkles,
  Terminal,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface QueryResultDTO {
  ok: boolean;
  rows: SecurityEvent[];
  total: number;
  tookMs: number;
  parsed: { clauses: string[]; combinators: ("AND" | "OR")[]; limit?: number };
  error?: string;
}

const SEV_VARIANT: Record<Severity, "critical" | "high" | "medium" | "low" | "info"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export function HuntConsole() {
  const [query, setQuery] = useState("severity=critical OR severity=high");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [result, setResult] = useState<QueryResultDTO | null>(null);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState<{ label: string; query: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tokenSuggest, setTokenSuggest] = useState<string[]>([]);

  const run = async (q: string = query) => {
    setRunning(true);
    try {
      const res = await fetch("/api/hunt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = (await res.json()) as QueryResultDTO;
      setResult(json);
      if (json.ok) {
        setHistory((h) => [q, ...h.filter((x) => x !== q)].slice(0, 20));
        setHistoryIdx(-1);
      }
    } catch (e) {
      setResult({
        ok: false,
        rows: [],
        total: 0,
        tookMs: 0,
        parsed: { clauses: [], combinators: [] },
        error: (e as Error).message,
      });
    } finally {
      setRunning(false);
    }
  };

  // Run a default query on mount so the UI isn't empty
  useEffect(() => {
    run("severity=critical OR severity=high");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─ autocomplete tokens based on current input ────────────────────────────
  useEffect(() => {
    const last = query.split(/\s+/).pop() ?? "";
    if (!last) {
      setTokenSuggest([]);
      return;
    }
    const fields = HUNT_FIELDS.filter((f) => f.startsWith(last.toLowerCase()));
    const keywords = ["AND", "OR"].filter((k) =>
      k.startsWith(last.toUpperCase())
    );
    setTokenSuggest([...fields, ...keywords].slice(0, 6));
  }, [query]);

  const replaceLastToken = (tok: string) => {
    const tokens = query.split(/\s+/);
    tokens[tokens.length - 1] = tok;
    setQuery(tokens.join(" ") + " ");
    inputRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(query);
      return;
    }
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setQuery(history[next]);
      return;
    }
    if (e.key === "ArrowDown" && historyIdx >= 0) {
      e.preventDefault();
      const next = historyIdx - 1;
      setHistoryIdx(next);
      setQuery(next < 0 ? "" : history[next]);
      return;
    }
    if (e.key === "Tab" && tokenSuggest.length) {
      e.preventDefault();
      replaceLastToken(tokenSuggest[0]);
    }
  };

  const save = () => {
    const label = prompt("Save this query as…", query.slice(0, 40));
    if (!label) return;
    setSaved((s) => [{ label, query }, ...s].slice(0, 12));
  };

  const stats = useMemo(() => {
    if (!result?.rows.length) return null;
    const sev: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const r of result.rows) sev[r.severity]++;
    return sev;
  }, [result]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      <div className="xl:col-span-3 space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-neon-cyan" />
              Threat hunting console
              <Badge variant="outline">SOC-QL · alpha</Badge>
            </CardTitle>
            <div className="text-[10px] font-mono text-muted-foreground">
              ↑/↓ history · TAB autocomplete · ENTER run
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-mono text-neon-green text-xs select-none">
                hunt $
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="e.g. severity=critical AND host=win-jumpbox-01 | limit 50"
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder:text-muted-foreground/50"
                spellCheck={false}
                autoComplete="off"
              />
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={save}>
                <Save className="h-3 w-3" />
                Save
              </Button>
              <Button
                size="sm"
                variant="neon"
                className="h-7 px-2 text-xs"
                onClick={() => run(query)}
                disabled={running}
              >
                {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run
              </Button>
            </div>

            {tokenSuggest.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tokenSuggest.map((t) => (
                  <button
                    key={t}
                    onClick={() => replaceLastToken(t)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 font-mono text-neon-cyan hover:bg-accent/40"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border/40 pt-2">
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/70">fields:</span>
                {HUNT_FIELDS.slice(0, 8).map((f) => (
                  <code key={f} className="font-mono text-neon-cyan ml-1">{f}</code>
                ))}
                <span className="text-muted-foreground/40 ml-1">…</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/70">ops:</span>
                {HUNT_OPERATORS.map((o) => (
                  <code key={o} className="font-mono text-neon-purple ml-0.5">{o}</code>
                ))}
              </span>
            </div>

            {/* parsed view */}
            {result?.ok && result.parsed.clauses.length > 0 && (
              <div className="text-[10px] font-mono flex items-center flex-wrap gap-1.5 border-t border-border/40 pt-2">
                <span className="text-muted-foreground/70">plan:</span>
                {result.parsed.clauses.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <code className="px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-foreground/90">
                      {c.trim()}
                    </code>
                    {result.parsed.combinators[i] && (
                      <span className="text-neon-cyan">
                        {result.parsed.combinators[i]}
                      </span>
                    )}
                  </span>
                ))}
                {result.parsed.limit && (
                  <code className="px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-foreground/90">
                    | limit {result.parsed.limit}
                  </code>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Results
              {result?.ok && (
                <Badge variant="success">
                  {result.total} matches · {result.tookMs} ms
                </Badge>
              )}
              {result && !result.ok && (
                <Badge variant="critical">{result.error}</Badge>
              )}
            </CardTitle>
            {stats && (
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono">
                {(Object.keys(stats) as Severity[]).map((s) =>
                  stats[s] ? (
                    <Badge key={s} variant={SEV_VARIANT[s]}>
                      {s} {stats[s]}
                    </Badge>
                  ) : null
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                    <th className="text-left px-3 py-2 font-medium">Time</th>
                    <th className="text-left px-3 py-2 font-medium">Sev</th>
                    <th className="text-left px-3 py-2 font-medium">Category</th>
                    <th className="text-left px-3 py-2 font-medium">Source</th>
                    <th className="text-left px-3 py-2 font-medium">Host / Src</th>
                    <th className="text-left px-3 py-2 font-medium">User</th>
                    <th className="text-left px-3 py-2 font-medium">Description</th>
                    <th className="text-right px-3 py-2 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {result?.rows.map((e, i) => (
                    <motion.tr
                      key={e.id + i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.005, 0.4) }}
                      className="border-t border-border/40 hover:bg-accent/30"
                    >
                      <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{formatTime(e.timestamp)}</td>
                      <td className="px-3 py-1.5"><Badge variant={SEV_VARIANT[e.severity]}>{e.severity}</Badge></td>
                      <td className="px-3 py-1.5 text-muted-foreground">{e.category}</td>
                      <td className="px-3 py-1.5 text-neon-cyan">{e.source}</td>
                      <td className="px-3 py-1.5 text-foreground/80">{e.host ?? e.sourceIp ?? "—"}</td>
                      <td className="px-3 py-1.5 text-foreground/70">{e.user ?? "—"}</td>
                      <td className="px-3 py-1.5 text-foreground/90 max-w-[420px] truncate">{e.description}</td>
                      <td className="px-3 py-1.5 text-right">{e.score}</td>
                    </motion.tr>
                  ))}
                  {result?.ok && result.rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                        No events match. Try widening the query.
                      </td>
                    </tr>
                  )}
                  {!result && (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                        Run a query to see events.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar: examples + saved + history */}
      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-neon-purple" />
              Example queries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {HUNT_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setQuery(ex.query);
                  run(ex.query);
                }}
                className="block w-full text-left p-2 rounded-md hover:bg-accent/40"
              >
                <div className="text-xs font-medium">{ex.label}</div>
                <code className="text-[10px] font-mono text-muted-foreground line-clamp-1">
                  {ex.query}
                </code>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-3.5 w-3.5 text-neon-green" />
              Saved
              <Badge variant="outline">{saved.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {saved.length === 0 && (
              <div className="text-xs text-muted-foreground px-2 py-3 text-center">
                No saved queries yet.
              </div>
            )}
            {saved.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s.query);
                  run(s.query);
                }}
                className="block w-full text-left p-2 rounded-md hover:bg-accent/40"
              >
                <div className="text-xs font-medium truncate">{s.label}</div>
                <code className="text-[10px] font-mono text-muted-foreground line-clamp-1">
                  {s.query}
                </code>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-neon-cyan" />
              Recent runs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {history.length === 0 && (
              <div className="text-xs text-muted-foreground px-2 py-3 text-center">
                Run a query — it'll show up here.
              </div>
            )}
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(h);
                  run(h);
                }}
                className="block w-full text-left p-1.5 rounded-md hover:bg-accent/40"
              >
                <code className="text-[10px] font-mono text-foreground/80 line-clamp-1">
                  {h}
                </code>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-md border border-neon-purple/40 bg-neon-purple/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neon-purple">
            <Sparkles className="h-3 w-3" /> AI-assist
          </div>
          <div className="text-xs text-foreground/80 mt-1">
            Need help building a query? Open the agent chat and ask the Threat Detection
            agent to draft one.
          </div>
        </div>
      </div>
    </div>
  );
}
