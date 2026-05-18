import { NextRequest } from "next/server";
import { buildQuery } from "@/lib/mock-query-builder";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { prompt?: string };
  const prompt = (body.prompt ?? "").slice(0, 800);

  // simulate "thinking" delay
  await new Promise((r) => setTimeout(r, 350));

  const result = buildQuery(prompt);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}
