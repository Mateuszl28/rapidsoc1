import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AGENTS } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
import { mockStream } from "@/lib/mock-stream";

export const runtime = "edge";
export const maxDuration = 60;

const VALID: AgentId[] = [
  "threat-detection",
  "root-cause",
  "risk-assessment",
  "remediation",
  "incident-report",
];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { agentId?: AgentId; context?: string };
  const agentId = body.agentId;
  if (!agentId || !VALID.includes(agentId)) {
    return new Response(JSON.stringify({ error: "invalid agentId" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const agent = AGENTS[agentId];
  const userContext =
    body.context?.slice(0, 8000) ??
    "No additional context. Operate on the current open incident INC-2041.";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey;

  // ── Mock streaming path (works without an API key) ───────────────────────
  if (useMock) {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of mockStream(agentId)) {
          controller.enqueue(enc.encode(chunk));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-sentinel-mode": "mock",
        "cache-control": "no-cache, no-transform",
      },
    });
  }

  // ── Live Claude streaming path ───────────────────────────────────────────
  const anthropic = createAnthropic({ apiKey });
  const model = anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6");

  const result = streamText({
    model,
    system: agent.systemPrompt,
    prompt: userContext,
    temperature: 0.3,
    maxTokens: 1400,
  });

  return result.toTextStreamResponse({
    headers: { "x-sentinel-mode": "live", "x-sentinel-agent": agentId },
  });
}
