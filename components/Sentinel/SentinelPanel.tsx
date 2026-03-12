'use client';

import { SentinelResult } from '@/types/sentinel';
import { SafetyScoreBadge } from './SafetyScoreBadge';
import { RugDetectionPanel } from './RugDetectionPanel';
import { RecommendationPanel } from './RecommendationPanel';
import { EvidenceCard } from './EvidenceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Terminal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentinelPanelProps {
  analysis?: SentinelResult | null;
  streamingText?: string;
  status: 'idle' | 'streaming' | 'ready' | 'failed';
  onOpenTrade: () => void;
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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Activity className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <p className="text-lg font-medium">Ready to Analyze</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Enter a token, wallet, or transaction address to begin AI-powered security analysis
            </p>
          </div>
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
            {isLoading 
              ? 'Streaming real-time analysis...' 
              : displayData 
                ? `Completed ${new Date(displayData.createdAt).toLocaleString()}`
                : 'Processing...'
            }
          </p>
        </div>
        {displayData && (
          <SafetyScoreBadge score={displayData.finalScore} size="lg" />
        )}
      </div>

      {/* Streaming Output */}
      {(isLoading || streamingText) && (
        <Card className="bg-black/50 border-border/50 font-mono text-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 text-primary border-b border-border/30 pb-2">
              <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="text-xs uppercase tracking-wider font-semibold">AI Analysis Stream</span>
              {isLoading && (
                <span className="text-xs text-muted-foreground ml-auto animate-pulse">
                  Live
                </span>
              )}
            </div>
            <div className="whitespace-pre-wrap text-muted-foreground max-h-64 overflow-y-auto leading-relaxed">
              {streamingText}
              {isLoading && <span className="animate-pulse text-primary">▊</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rug Detection Panel */}
      {displayData?.rugDetection && (
        <RugDetectionPanel rugDetection={displayData.rugDetection} />
      )}

      {/* AI Recommendation */}
      {displayData?.recommendation && (
        <RecommendationPanel 
          recommendation={displayData.recommendation}
          onOpenTrade={onOpenTrade}
        />
      )}

      {/* Structured Metrics */}
      {displayData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Liquidity" 
            value={`$${(displayData.metrics.liquidityDepth / 1e6).toFixed(0)}M`}
            change="+127%"
            positive
          />
          <MetricCard 
            label="Top 20 Holders" 
            value={`${displayData.metrics.topHoldersPercent}%`}
            change="Moderate"
            warning
          />
          <MetricCard 
            label="Smart Buys" 
            value={displayData.metrics.recentSmartBuys.toString()}
            change="+12%"
            positive
          />
          <MetricCard 
            label="Volatility" 
            value={(displayData.metrics.volatilityIndex * 100).toFixed(1) + '%'}
            change="Normal"
            neutral
          />
        </div>
      )}

      {/* Evidence Grid */}
      {displayData?.evidence && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Evidence & Signals</h3>
            <button 
              onClick={onExplain}
              className="text-xs text-primary hover:underline"
            >
              View Explainability
            </button>
          </div>
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

// Helper component for metrics
function MetricCard({ 
  label, 
  value, 
  change, 
  positive, 
  warning, 
  neutral 
}: { 
  label: string; 
  value: string; 
  change: string;
  positive?: boolean;
  warning?: boolean;
  neutral?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold font-mono">{value}</div>
      <div className={cn(
        "text-xs mt-1",
        positive && "text-green-500",
        warning && "text-yellow-500",
        neutral && "text-muted-foreground"
      )}>
        {change}
      </div>
    </Card>
  );
}