"use client"

import { RightTradePanel } from "@/components/Shared/RightTradePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useWalletData } from "@/hooks/useWalletData";
import { useQuery } from "@tanstack/react-query";
import { MarketCoin } from "@/services/coingeckoService";

// Solana mainnet USDT mint address
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

export function RightPanel() {
  const { balance, isLoading, isError } = useWalletData();

  const { data: marketCoins } = useQuery<MarketCoin[]>({
    queryKey: ["market"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/market");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      {/* Trade Panel: pre-filled with SOL → USDT */}
      <RightTradePanel
        chain="solana"
        fromToken="SOL"
        toToken="USDT"
        toAddress={USDT_MINT}
      />

      {/* Market Overview Mini */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(marketCoins ?? []).map((coin) => (
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
          {(!marketCoins || marketCoins.length === 0) && (
            <p className="text-xs text-muted-foreground">Loading market data…</p>
          )}
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
            <span className="font-bold font-mono">{isLoading ? "Loading..." : isError ? "Error" : balance}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}