import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AGENTS } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
import { mockChatStream } from "@/lib/mock-chat";

export const runtime = "edge";
export const maxDuration = 60;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const VALID: AgentId[] = [
  "threat-detection",
  "root-cause",
  "risk-assessment",
  "remediation",
  "incident-report",
];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    agentId?: AgentId;
    messages?: ChatMsg[];
    incidentContext?: string;
  };

  const agentId = body.agentId;
  if (!agentId || !VALID.includes(agentId)) {
    return new Response(JSON.stringify({ error: "invalid agentId" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const messages = body.messages?.slice(-12) ?? [];
  const incident =
    body.incidentContext?.slice(0, 6000) ??
    "Operate on the currently active incident INC-2041.";
  const agent = AGENTS[agentId];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey;

  if (useMock) {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of mockChatStream(agentId, messages)) {
          controller.enqueue(enc.encode(chunk));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-sentinel-mode": "mock",
      },
    });
  }

  const anthropic = createAnthropic({ apiKey });
  const model = anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6");

  const systemPrompt =
    `${agent.systemPrompt}\n\n` +
    `You are mid-conversation with a human analyst about this incident:\n` +
    `${incident}\n\n` +
    `Keep responses focused, markdown-formatted, and SOC-grade. ` +
    `If the user asks a follow-up, reference your earlier reasoning consistently.`;

  const result = streamText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.4,
    maxTokens: 1000,
  });

  return result.toTextStreamResponse({
    headers: { "x-sentinel-mode": "live", "x-sentinel-agent": agentId },
  });
}
