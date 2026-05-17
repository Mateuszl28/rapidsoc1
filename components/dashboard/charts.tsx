"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildMetricSeries,
  CATEGORY_BREAKDOWN,
  SEVERITY_BREAKDOWN,
} from "@/lib/mock-data";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "hsl(0 84% 60%)",
  high: "hsl(20 90% 55%)",
  medium: "hsl(40 95% 55%)",
  low: "hsl(190 90% 55%)",
  info: "hsl(220 80% 60%)",
};

function chartTooltipStyle() {
  return {
    background: "hsl(222 30% 7%)",
    border: "1px solid hsl(222 22% 18%)",
    borderRadius: 6,
    fontSize: 11,
    color: "hsl(210 25% 92%)",
  };
}

export function EventVolumeChart() {
  const data = useMemo(() => buildMetricSeries(24), []);
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Event volume — last 24h</span>
          <span className="text-[10px] font-mono text-muted-foreground">
            events · threats · blocked
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g-events" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(180 100% 55%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(180 100% 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-threats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-blocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(140 100% 55%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(140 100% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 22% 18%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={chartTooltipStyle()} />
              <Area type="monotone" dataKey="events"  stroke="hsl(180 100% 55%)" fill="url(#g-events)"  strokeWidth={1.6} />
              <Area type="monotone" dataKey="threats" stroke="hsl(0 84% 60%)"    fill="url(#g-threats)" strokeWidth={1.6} />
              <Area type="monotone" dataKey="blocked" stroke="hsl(140 100% 55%)" fill="url(#g-blocked)" strokeWidth={1.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SeverityDonut() {
  const total = SEVERITY_BREAKDOWN.reduce((a, b) => a + b.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity mix (24h)</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="h-[170px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SEVERITY_BREAKDOWN}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                stroke="hsl(222 30% 7%)"
              >
                {SEVERITY_BREAKDOWN.map((s) => (
                  <Cell key={s.name} fill={SEVERITY_COLORS[s.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold font-mono">{total}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              alerts
            </div>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {SEVERITY_BREAKDOWN.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SEVERITY_COLORS[s.name] }}
              />
              <span className="uppercase tracking-wider text-muted-foreground">
                {s.name}
              </span>
              <span className="font-mono">{s.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryBars() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detections by category</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CATEGORY_BREAKDOWN} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 22% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 60%)" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip cursor={{ fill: "hsl(222 25% 12% / 0.5)" }} contentStyle={chartTooltipStyle()} />
              <Bar dataKey="value" fill="hsl(180 100% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
