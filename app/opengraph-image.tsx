import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sentinel AI — Autonomous SOC";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          color: "#e6edf7",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          backgroundColor: "#050a14",
          backgroundImage:
            "radial-gradient(800px 400px at 0% 0%, rgba(0, 230, 255, 0.18), transparent 60%), radial-gradient(700px 400px at 100% 0%, rgba(170, 100, 255, 0.18), transparent 60%), radial-gradient(800px 500px at 50% 110%, rgba(255, 60, 60, 0.14), transparent 60%)",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #00e5ff, #b660ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: "0 0 50px rgba(0, 229, 255, 0.5)",
            }}
          >
            🛡️
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5 }}>
              Sentinel AI
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#9aa8bd",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Autonomous SOC · v1.0
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255, 80, 80, 0.4)",
              color: "#ff5c5c",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#ff5c5c",
                boxShadow: "0 0 14px #ff5c5c",
              }}
            />
            INC-2041 · active critical
          </div>
        </div>

        {/* Hero text */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 1080,
            }}
          >
            Your enterprise SOC,
            <br />
            <span style={{ color: "#00e5ff" }}>on autopilot.</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9aa8bd",
              maxWidth: 1000,
              lineHeight: 1.3,
            }}
          >
            Real-time threat detection · kill-chain reconstruction ·
            AI-generated remediation — multi-agent workflow built on Claude.
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 30,
          }}
        >
          {[
            { v: "5",      l: "AI agents",       c: "#b660ff" },
            { v: "1,247",  l: "Events/sec",      c: "#00e5ff" },
            { v: "12m 4s", l: "Mean MTTR",       c: "#52e87a" },
            { v: "318",    l: "Threats blocked", c: "#ff5c5c" },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                flex: 1,
                padding: "18px 22px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div
                style={{
                  fontSize: 13,
                  color: "#9aa8bd",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 14,
            color: "#6f7c8f",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          sentinel.acme.io · built with Next.js + Vercel AI SDK
        </div>
      </div>
    ),
    { ...size }
  );
}
