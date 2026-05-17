"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "./markdown";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Sparkles, User, RefreshCw, Square } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentId?: AgentId;
}

const SUGGESTED = [
  "What's the updated blast radius?",
  "Walk me through alternative containment paths.",
  "Compliance implications for GDPR / PCI?",
  "How much of this could the playbook fix automatically?",
];

export function AgentChat({ incidentContext }: { incidentContext: string }) {
  const [agent, setAgent] = useState<AgentId>("threat-detection");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || busy) return;
      const userMsg: ChatMsg = {
        id: `m-${Date.now()}-u`,
        role: "user",
        content: text,
      };
      const assistantId = `m-${Date.now()}-a`;
      setMessages((m) => [
        ...m,
        userMsg,
        { id: assistantId, role: "assistant", content: "", agentId: agent },
      ]);
      setDraft("");
      setBusy(true);

      const ctl = new AbortController();
      abortRef.current = ctl;

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            agentId: agent,
            messages: history,
            incidentContext,
          }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          setMessages((m) =>
            m.map((msg) => (msg.id === assistantId ? { ...msg, content: buf } : msg))
          );
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: `**Error:** ${(e as Error).message}` }
                : msg
            )
          );
        }
      } finally {
        setBusy(false);
      }
    },
    [agent, busy, messages, incidentContext]
  );

  const stop = () => {
    abortRef.current?.abort();
    setBusy(false);
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-[640px]">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
          Agent chat
          <Badge variant="outline">{AGENTS[agent].name}</Badge>
        </CardTitle>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={reset}>
          <RefreshCw className="h-3 w-3" />
          New chat
        </Button>
      </CardHeader>

      {/* Agent picker */}
      <div className="px-3 py-2 border-b border-border/40 bg-muted/20 overflow-x-auto">
        <div className="flex gap-1.5">
          {AGENT_ORDER.map((id) => (
            <button
              key={id}
              onClick={() => setAgent(id)}
              className={cn(
                "shrink-0 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider border transition-colors",
                agent === id
                  ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              {AGENTS[id].name}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && <EmptyState onPick={send} agent={agent} />}
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} streaming={busy && m.role === "assistant" && m === messages[messages.length - 1]} />
          ))}
        </div>

        {/* Suggested + composer */}
        {messages.length > 0 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[10px] px-2 py-1 rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-border/40 p-2 flex items-end gap-2 bg-card">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder={`Ask ${AGENTS[agent].name}…`}
            className="flex-1 resize-none rounded-md bg-muted/40 border border-border/40 px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
          />
          {busy ? (
            <Button variant="destructive" size="sm" className="h-9" onClick={stop}>
              <Square className="h-3 w-3" />
              Stop
            </Button>
          ) : (
            <Button variant="neon" size="sm" className="h-9" onClick={() => send(draft)}>
              <Send className="h-3 w-3" />
              Send
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  onPick,
  agent,
}: {
  onPick: (text: string) => void;
  agent: AgentId;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-8">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-3">
        <Sparkles className="h-5 w-5 text-background" />
      </div>
      <div className="text-sm font-medium">Talk to {AGENTS[agent].name}</div>
      <div className="text-xs text-muted-foreground max-w-sm mt-1">
        Ask follow-up questions, request alternative containment paths, or dig into evidence.
      </div>
      <div className="mt-4 flex flex-col gap-1.5 w-full max-w-md">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left text-xs px-3 py-2 rounded-md border border-border/40 hover:bg-accent/40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageRow({
  message,
  streaming,
}: {
  message: ChatMsg;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "h-6 w-6 rounded-full shrink-0 flex items-center justify-center border",
          isUser
            ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/40"
            : "bg-neon-purple/10 text-neon-purple border-neon-purple/40"
        )}
      >
        {isUser ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[88%] rounded-md px-3 py-2 text-xs",
          isUser ? "bg-neon-cyan/10 text-foreground" : "bg-muted/40"
        )}
      >
        {message.role === "assistant" && message.content ? (
          <Markdown content={message.content} />
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
        {message.role === "assistant" && !message.content && streaming && (
          <div className="flex gap-1 py-1">
            <span className="h-1 w-1 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1 w-1 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1 w-1 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        {streaming && message.role === "assistant" && message.content && (
          <span className="inline-block w-2 h-3 bg-neon-cyan animate-blink align-baseline ml-1" />
        )}
      </div>
    </motion.div>
  );
}
