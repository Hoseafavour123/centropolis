'use client';

import { SentinelResult } from '@/types/sentinel';
import { SafetyScoreBadge } from './SafetyScoreBadge';
import { EvidenceCard } from './EvidenceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentinelPanelProps {
  analysis?: SentinelResult | null;
  streamingText?: string;
  status: 'idle' | 'streaming' | 'ready' | 'failed';
  onOpenTrade: (prefill: { chain: string; token?: string }) => void;
  onSaveReport: (id: string) => void;
  onExplain: () => void;
}

export function SentinelPanel({ 
  analysis, 
  streamingText, 
  status, 
  onOpenTrade, 
  onSaveReport, 
  onExplain 
}: SentinelPanelProps) {
  if (status === 'idle') {
    return (
      <div className="h-[600px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
        <div className="text-center space-y-2">
          <Terminal className="w-12 h-12 mx-auto opacity-20" />
          <p>Enter an address to begin AI analysis</p>
        </div>
      </div>
    );
  }

  const isLoading = status === 'streaming';
  const displayData = analysis;

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sentinel Deep Analysis</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Streaming analysis...' : `Analyzed ${displayData ? new Date(displayData.createdAt).toLocaleString() : ''}`}
          </p>
        </div>
        {displayData && (
          <SafetyScoreBadge score={displayData.finalScore} size="lg" />
        )}
      </div>

      {/* Streaming Output */}
      {(isLoading || streamingText) && (
        <Card className="bg-black/50 border-border/50 font-mono text-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="text-xs uppercase tracking-wider">AI Stream</span>
            </div>
            <div className="whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
              {streamingText}
              {isLoading && <span className="animate-pulse">▊</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Structured Findings */}
      {displayData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Liquidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(displayData.metrics.liquidityDepth / 1e6).toFixed(0)}M</div>
              <p className="text-xs text-green-400 mt-1">+127% 24h Volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Holder Concentration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.metrics.topHoldersPercent}%</div>
              <p className="text-xs text-amber-400 mt-1">Top 20 wallets (Moderate Risk)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence Grid */}
      {displayData?.evidence && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Evidence & Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayData.evidence.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}