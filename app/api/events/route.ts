import { EVENT_TEMPLATES } from "@/lib/mock-data";
import type { SecurityEvent } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// SSE stream of fabricated SIEM events. Used by the terminal feed.
export async function GET() {
  const encoder = new TextEncoder();
  let seq = 20000;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (ev: SecurityEvent) => {
        if (closed) return;
        const line = `data: ${JSON.stringify(ev)}\n\n`;
        try {
          controller.enqueue(encoder.encode(line));
        } catch {
          closed = true;
        }
      };

      // burst a few right away so the UI doesn't look empty
      for (let i = 0; i < 3; i++) {
        send(fabricate(seq++));
      }

      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        send(fabricate(seq++));
      }, 1100 + Math.random() * 900);

      // heartbeat to keep the connection alive on Vercel edge
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          closed = true;
        }
      }, 15000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

function fabricate(seq: number): SecurityEvent {
  const tpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const hosts = ["win-jumpbox-01", "fin-db-prod-01", "ceo-laptop", "ci-github-runner", "edge-vpn-01"];
  const users = ["m.chen@acme.io", "j.patel@acme.io", "ci-deploy-bot", "svc-backup", "root"];
  return {
    id: `evt-${seq}`,
    timestamp: Date.now(),
    status: "new",
    host: hosts[Math.floor(Math.random() * hosts.length)],
    user: users[Math.floor(Math.random() * users.length)],
    sourceIp: randIp(),
    ...tpl,
  };
}

function randIp(): string {
  const oct = () => Math.floor(Math.random() * 255);
  return `${oct()}.${oct()}.${oct()}.${oct()}`;
}
