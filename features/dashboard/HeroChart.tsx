/**
 * ============================================================================
 * 
 * FEATURE COMPONENTS
 * ============================================================================
 * Description: Specific components for the Dashboard page.
 * ============================================================================
 */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/mocks/dashboard.mock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HeroChart() {
  const [mounted, setMounted] = useState(false);

  // Fetch chart data
  const { data, isLoading } = useQuery({
    queryKey: ["chartData", "SOL"],
    queryFn: () => api.getChartData("SOL"),
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <Card className="col-span-2 h-[400px] animate-pulse bg-muted">
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          Loading Market Data...
        </div>
      </Card>
    );
  }

  const latestPrice = data ? data[data.length - 1].close : 0;
  const startPrice = data ? data[0].open : 0;
  const change = ((latestPrice - startPrice) / startPrice) * 100;
  const isPositive = change >= 0;

  return (
    <Card className="col-span-2 glass-panel overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">SOL / USDC</h2>
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className="font-mono"
            >
              4h {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-3xl font-bold mt-1">${latestPrice.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          {["1H", "4H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${tf === "4H" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis dataKey="time" hide />
              <YAxis
                domain={["auto", "auto"]}
                orientation="right"
                tickFormatter={(val) => `$${val}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}





