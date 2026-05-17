# Sentinel AI — Autonomous SOC Dashboard

An enterprise-grade, AI-powered Security Operations Center (SOC) dashboard built with Next.js 15, the Vercel AI SDK, and Claude.

Sentinel AI fuses a real-time security event stream with five specialized Claude agents:

| Agent | Role |
|---|---|
| 🛰️ Threat Detection | Classifies inbound SIEM events as benign / suspicious / malicious |
| 🧠 Root Cause Analysis | Reconstructs the kill chain from correlated signals |
| ⚖️ Risk Assessment | Scores blast radius, exploitability and business impact |
| 🛠️ Remediation | Drafts immediate containment + long-term hardening actions |
| 📄 Incident Report | Produces an executive-ready incident write-up |

The dashboard streams responses from each agent live and pipes a synthetic SIEM feed through a terminal-style event console.

## Stack

- **Next.js 15** (App Router, RSC, streaming)
- **TypeScript** strict mode
- **Tailwind CSS** + **shadcn/ui** primitives
- **Vercel AI SDK** (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`)
- **Anthropic Claude** (Sonnet 4.6 by default)
- **Recharts** for charts, **Framer Motion** for animations
- Deployable to **Vercel** in one click

## Local dev

```bash
npm install
cp .env.example .env.local
# add your ANTHROPIC_API_KEY (optional — falls back to mock streams)
npm run dev
```

Open http://localhost:3000.

If `ANTHROPIC_API_KEY` is unset, the agents fall back to deterministic mock streams so the UI still works end-to-end (great for demos / hackathons).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at https://vercel.com/new.
3. Add the env var `ANTHROPIC_API_KEY` in **Project Settings → Environment Variables**.
4. Deploy. That's it.

## Project layout

```
app/
  api/                # streaming Claude routes (one per agent)
  page.tsx            # main dashboard
  globals.css         # dark-theme tokens
components/
  dashboard/          # cards, charts, feeds, agent panels
  ui/                 # shadcn primitives
lib/
  agents.ts           # system prompts + agent registry
  mock-data.ts        # synthetic SIEM events, hosts, IOCs
  types.ts            # shared domain types
  utils.ts            # cn() and helpers
```

## Notes

All data is **synthetic**. No real PII, no real IPs (RFC1918 / TEST-NET ranges where possible).
