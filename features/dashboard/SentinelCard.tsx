"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, Shield } from "lucide-react";
import { MOCK_AI_INSIGHT } from "@/mocks/dashboard.mock";

export function SentinelCard() {
  const insight = MOCK_AI_INSIGHT;

  return (
    <Card className="glass-panel border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-primary">
              Sentinel AI Insight
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            v2.4.0
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{insight.tokenSymbol}</span>
            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">
              <TrendingUp className="w-3 h-3 mr-1" /> {insight.sentiment}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              Confidence: {insight.confidence}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.summary}
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Safety scan completed. No major risks detected.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}