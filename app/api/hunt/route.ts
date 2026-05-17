import { NextRequest } from "next/server";
import { runQuery } from "@/lib/hunt-engine";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { query?: string };
  const query = body.query ?? "";
  const result = runQuery(query);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}
