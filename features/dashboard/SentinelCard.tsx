"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, Shield, Loader2, RefreshCcw } from "lucide-react";
import { useSentinelAnalyze } from "@/hooks/useSentinelAnalyze";
import { useEffect, useState, useCallback } from "react";
import { SentinelResult } from "@/types/sentinel";
import { Button } from "@/components/ui/button";

export function SentinelCard() {
  const { startAnalysis, subscribeToStream, status, streamingText } = useSentinelAnalyze();
  const [result, setResult] = useState<SentinelResult | null>(null);

  const runAnalysis = useCallback(async () => {
    try {
      const startData = await startAnalysis({
        entityType: 'token',
        address: 'So11111111111111111111111111111111111111112', // SOL
        timeframe: '24h',
        depth: 'normal',
        chain: 'solana'
      });

      subscribeToStream(startData.analysisId, (res) => {
        setResult(res);
      });
    } catch (err) {
      console.error("Sentinel Analysis failed:", err);
    }
  }, [startAnalysis, subscribeToStream]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const isStreaming = status === 'streaming';
  const isReady = status === 'ready' && result;

  return (
    <Card className="glass-panel border-l-4 border-l-primary h-full flex flex-col min-h-[300px]">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isStreaming ? 'bg-primary/20 animate-pulse' : 'bg-primary/10'}`}>
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-primary">
              Sentinel AI Insight
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isReady && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={runAnalysis}
                disabled={isStreaming}
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Badge variant="outline" className="text-[10px] font-mono opacity-50">
              v2.5.0
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grow flex flex-col">
        {status === 'idle' || (isStreaming && !streamingText) ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 grow">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            <p className="text-sm text-muted-foreground animate-pulse leading-relaxed text-center px-4">
              Initializing neural audit of Solana mainnet...
            </p>
          </div>
        ) : isStreaming ? (
          <div className="space-y-4 grow">
            <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
              <span className="font-bold text-lg">SOL</span>
              <Badge variant="outline" className="animate-pulse bg-primary/5 border-primary/20 text-primary">
                Analyzing Live Stream...
              </Badge>
            </div>
            <div className="relative">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                {streamingText}
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
              </p>
            </div>
          </div>
        ) : isReady ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Solana</span>
              <Badge
                className={`${result.finalScore >= 70 ? 'bg-green-500/20 text-green-400' :
                  result.finalScore >= 40 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  } border-none`}
              >
                <TrendingUp className="w-3 h-3 mr-1" /> {result.recommendation.action.replace('_', ' ')}
              </Badge>
              <span className="text-[10px] text-muted-foreground ml-auto uppercase tracking-tighter">
                Score: {result.finalScore}/100
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-3 italic">
              {result.summary}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="text-[10px] text-muted-foreground uppercase">Liquidity</div>
                <div className="text-sm font-semibold">${((result.metrics.liquidityDepth || 0) / 1e6).toFixed(1)}M</div>
              </div>
              <div className="bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="text-[10px] text-muted-foreground uppercase">Confidence</div>
                <div className="text-sm font-semibold">{result.recommendation.confidence}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground bg-primary/5 p-2 rounded-md border border-primary/10">
              <Shield className="w-3.5 h-3.5 text-primary/60" />
              <span>Full audit complete. {result.rugDetection.riskLevel.toUpperCase()} risk.</span>
            </div>
          </div>
        ) : status === 'failed' ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 grow">
            <div className="p-3 rounded-full bg-red-500/10">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-400 font-medium">Analysis failed to complete</p>
            <Button variant="outline" size="sm" onClick={runAnalysis}>
              Try Again
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}