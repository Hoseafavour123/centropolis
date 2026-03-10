// components/layout/RightPanel.tsx
"use client"

import { QuickTrade } from "@/features/dashboard/QuickTrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";

export function RightPanel() {
  return (
    <div className="space-y-6">
      <QuickTrade />

      {/* Market Overview Mini */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { symbol: "BTC", price: 52340, change: 1.2 },
            { symbol: "ETH", price: 2890, change: -0.5 },
            { symbol: "WIF", price: 0.248, change: 4.5 },
          ].map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                  {coin.symbol[0]}
                </div>
                <span className="font-medium">{coin.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  ${coin.price.toLocaleString()}
                </div>
                <div
                  className={`text-[10px] ${coin.change >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {coin.change > 0 ? "+" : ""}
                  {coin.change}%
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet Snapshot */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Wallet Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 w-full bg-muted/50 rounded-lg flex items-end justify-between px-2 pb-2 gap-1">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="w-full bg-primary/50 rounded-t-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Balance</span>
            <span className="font-bold font-mono">$12,450.00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
