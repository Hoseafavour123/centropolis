// features/dashboard/QuickTrade.tsx
("use client");

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Wallet } from "lucide-react";
import { useState } from "react";

export function QuickTrade() {
  const [fromAmount, setFromAmount] = useState("3");

  return (
    <Card className="glass-panel h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Quick Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">From</label>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                S
              </div>
              <div>
                <div className="font-bold">SOL</div>
                <div className="text-xs text-muted-foreground">
                  Balance: 12.5
                </div>
              </div>
            </div>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-right font-mono text-lg outline-none w-24"
            />
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button className="p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">To</label>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                U
              </div>
              <div>
                <div className="font-bold">USDC</div>
                <div className="text-xs text-muted-foreground">
                  Balance: 1,383.50
                </div>
              </div>
            </div>
            <div className="font-mono text-lg text-muted-foreground">
              ~ {(parseFloat(fromAmount || "0") * 140.5).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90">
            Swap
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            1 SOL = 140.50 USDC • Fee: 0.05%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
