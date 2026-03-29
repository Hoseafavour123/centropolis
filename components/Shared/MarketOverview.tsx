"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MarketCoin } from "@/services/coingeckoService";

export function MarketOverview() {
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
    );
}
