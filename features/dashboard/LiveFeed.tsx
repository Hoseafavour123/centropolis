// features/dashboard/LiveFeed.tsx
"use client"

import { useQuery } from "@tanstack/react-query";
import { api } from "@/mocks/dashboard.mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function LiveFeed() {
  const { data: activities } = useQuery({
    queryKey: ["activity"],
    queryFn: api.getRecentActivity,
    refetchInterval: 5000, // Poll every 5s
  });

  return (
    <Card className="glass-panel col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Feed
          </CardTitle>
          <div className="flex gap-2">
            <button className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
              All
            </button>
            <button className="text-xs font-medium px-3 py-1 rounded-full text-muted-foreground hover:bg-muted">
              Whales
            </button>
            <button className="text-xs font-medium px-3 py-1 rounded-full text-muted-foreground hover:bg-muted">
              Smart Money
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${item.isSmartMoney ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"}`}
                >
                  {item.type === "whale_move" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {item.type === "buy" ? "Buy" : "Whale Alert"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.type === "buy"
                        ? `$${item.value.toLocaleString()} ${item.tokenSymbol}`
                        : `200K ${item.tokenSymbol} moved`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wallet className="w-3 h-3" />
                    <span>{item.wallet}</span>
                    {item.isSmartMoney && (
                      <span className="text-yellow-500 font-medium">
                        • Smart Buy
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
