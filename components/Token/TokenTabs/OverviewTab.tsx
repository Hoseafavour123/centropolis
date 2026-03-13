'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Activity, Shield, Users, Droplets } from 'lucide-react';
import { AISummary } from '@/types/token';

const fetchAISummary = async (chain: string, address: string): Promise<AISummary> => {
  const res = await fetch(`/api/sentinel/result?token=${address}&chain=${chain}`);
  if (!res.ok) throw new Error('Failed to fetch AI summary');
  return res.json();
};

interface OverviewTabProps {
  chain: string;
  address: string;
}

export function OverviewTab({ chain, address }: OverviewTabProps) {
  const { data: aiSummary, isLoading } = useQuery<AISummary>({
    queryKey: ['aiSummary', chain, address],
    queryFn: () => fetchAISummary(chain, address),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Sentinel AI Insight</CardTitle>
              <p className="text-xs text-muted-foreground">
                Last updated: {aiSummary?.lastUpdated ? new Date(aiSummary.lastUpdated).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-20 animate-pulse bg-muted rounded" />
          ) : aiSummary ? (
            <>
              <div className="flex items-center gap-2">
                <SentimentBadge sentiment={aiSummary.sentiment} />
                <span className="text-sm text-muted-foreground">Confidence: 87%</span>
              </div>
              <p className="text-sm leading-relaxed">{aiSummary.summary}</p>
              <div className="flex flex-wrap gap-2">
                {aiSummary.keyPoints.map((point, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No AI analysis available</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          icon={Shield} 
          label="Contract Security" 
          value="Immutable"
          subtext="No mint or freeze authority"
          status="good"
        />
        <MetricCard 
          icon={Users} 
          label="Holder Distribution" 
          value="23% Top 20"
          subtext="Moderate concentration"
          status="warning"
        />
        <MetricCard 
          icon={Droplets} 
          label="Liquidity Health" 
          value="$314M"
          subtext="Deep across 3 major DEXs"
          status="good"
        />
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const configs = {
    bullish: { icon: TrendingUp, color: 'text-green-500 bg-green-500/10', label: 'Bullish' },
    bearish: { icon: TrendingDown, color: 'text-red-500 bg-red-500/10', label: 'Bearish' },
    neutral: { icon: Minus, color: 'text-yellow-500 bg-yellow-500/10', label: 'Neutral' },
  };
  const config = configs[sentiment as keyof typeof configs] || configs.neutral;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  status 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  subtext: string;
  status: 'good' | 'warning' | 'bad';
}) {
  const statusColors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    bad: 'text-red-500',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-bold ${statusColors[status]}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}