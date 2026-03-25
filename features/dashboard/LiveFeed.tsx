"use client"

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TradeActivity } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterType = "all" | "whales" | "smart";

export function LiveFeed() {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: activities, isLoading } = useQuery<TradeActivity[]>({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/activity");
      if (!res.ok) return [];
      const data = await res.json();
      // Ensure timestamps are Date objects (JSON deserialization returns strings)
      return data.map((item: TradeActivity & { timestamp: string | Date }) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    },
    refetchInterval: 5000, // Poll every 5s
  });

  const filteredActivities = activities?.filter((item) => {
    if (filter === "whales") return item.type === "whale_move";
    if (filter === "smart") return item.isSmartMoney;
    return true;
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
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                filter === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("whales")}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                filter === "whales"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Whales
            </button>
            <button
              onClick={() => setFilter("smart")}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                filter === "smart"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Smart Money
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading live feed...
          </div>
        ) : filteredActivities?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No activity found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      item.isSmartMoney
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-blue-500/10 text-blue-500"
                    )}
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
                        {item.type === "buy" ? "Buy" : item.type === "sell" ? "Sell" : "Whale Alert"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.type === "whale_move"
                          ? `${item.amount.toLocaleString()} ${item.tokenSymbol} moved`
                          : `$${item.value.toLocaleString()} ${item.tokenSymbol}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wallet className="w-3 h-3" />
                      <span>{item.wallet}</span>
                      {item.isSmartMoney && (
                        <span className="text-yellow-500 font-medium">
                          • Smart Money
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
        )}
      </CardContent>
    </Card>
  );
}
