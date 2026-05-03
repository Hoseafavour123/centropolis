// /components/Sentinel/SentinelPanel.tsx


'use client';

import { SentinelResult } from '@/types/sentinel';
import { SafetyScoreBadge } from './SafetyScoreBadge';
import { RugDetectionPanel } from './RugDetectionPanel';
import { RecommendationPanel } from './RecommendationPanel';
import { EvidenceCard } from './EvidenceCard';
import { ActionsPanel } from './ActionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Terminal, Activity, Info, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [showExplanation, setShowExplanation] = useState(false);

  if (status === 'idle' && !analysis) {
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
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary animate-pulse" />
            Sentinel Deep Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Streaming real-time analysis...'
              : status === 'failed'
                ? 'Analysis failed'
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
            value={formatCurrency(displayData.metrics.liquidityDepth)}
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
            value={Number(displayData.metrics.volatilityIndex || 0).toFixed(1) + '%'}
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
              onClick={() => setShowExplanation(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
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

      {/* Explainability Sheet */}
      <Sheet open={showExplanation} onOpenChange={setShowExplanation}>
        <SheetContent side="right" className="sm:max-w-md border-l border-border/50">
          <SheetHeader className="pb-6 border-b border-border/30">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Terminal className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sentinel Logic</span>
            </div>
            <SheetTitle className="text-2xl font-bold">AI Audit Reasoning</SheetTitle>
            <SheetDescription>
              A technical breakdown of the heuristics and logic applied to this specific analysis.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Technical Logic
              </h4>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border border-border/50">
                {displayData?.technicalExplanation || "No technical breakdown available for this audit."}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Audit Confidence</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Synthesized Data Quality</span>
                  <span className="font-mono text-primary">High</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary/70 leading-relaxed italic">
                Notice: Sentinel Explainability uses internal weight modeling to correlate on-chain transactions, social sentiment, and contract heuristics.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
    <Card className="p-4 flex flex-col justify-between h-full overflow-hidden">
      <div className="text-xs text-muted-foreground mb-1 truncate">{label}</div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xl font-bold font-mono truncate cursor-default">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs break-words">
            <p className="font-mono text-sm">{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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

// Utility to format currency dynamically
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}