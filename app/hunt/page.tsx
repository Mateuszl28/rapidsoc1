"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { HuntConsole } from "@/components/dashboard/hunt-console";

export default function HuntPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-1">
                <Link href="/" className="hover:text-foreground inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> overview
                </Link>
                <span className="text-border">/</span>
                <span className="text-foreground">hunt</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Threat hunting</h1>
              <p className="text-sm text-muted-foreground">
                Search across SIEM events, EDR telemetry, and identity logs with a SOC-QL query syntax.
              </p>
            </div>
          </div>

          <HuntConsole />
        </main>
      </div>
    </div>
  );
}
