("use client");

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Token } from "@/lib/types";
import Image from "next/image";

function TokenCard({ token }: { token: Token }) {
  const isPositive = token.change24h >= 0;

  return (
    <Card className="glass-panel hover:border-primary/50 transition-colors cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
              {token.symbol[0]}
            </div>
            <div>
              <h4 className="font-bold">{token.symbol}</h4>
              <p className="text-xs text-muted-foreground">
                ${token.price.toFixed(token.price < 0.01 ? 6 : 2)}
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
          >
            {isPositive ? "+" : ""}
            {token.change24h}%
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${token.safetyScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            Safety Score
          </span>
          <span className="text-[10px] font-mono">{token.safetyScore}/100</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendingGrid() {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: api.getTrending,
  });

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trending Tokens</h3>
        <button className="text-xs text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tokens?.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </div>
  );
}