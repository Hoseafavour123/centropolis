'use client';

import { useState } from 'react';
import { EntityType, Timeframe, AnalysisDepth, SentinelAnalyzeRequest } from '@/types/sentinel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Clock, Zap } from 'lucide-react';

interface SentinelQueryBarProps {
  defaultChain?: string;
  onAnalyze: (req: SentinelAnalyzeRequest) => void;
  recentQueries?: SentinelAnalyzeRequest[];
  isLoading?: boolean;
}

export function SentinelQueryBar({ defaultChain = 'solana', onAnalyze, isLoading }: SentinelQueryBarProps) {
  const [entityType, setEntityType] = useState<EntityType>('token');
  const [chain, setChain] = useState(defaultChain);
  const [address, setAddress] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [depth, setDepth] = useState<AnalysisDepth>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    onAnalyze({ entityType, chain, address, timeframe, depth });
  };

  return (
    <div className="space-y-6 p-5 rounded-xl bg-card border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">New Analysis</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-2">
            <Label htmlFor="entity-type">Entity Type</Label>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
              <SelectTrigger id="entity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="token">Token Contract</SelectItem>
                <SelectItem value="wallet">Wallet Address</SelectItem>
                <SelectItem value="tx">Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chain">Chain</Label>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger id="chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="base">Base</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter contract or wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeframe" className="flex items-center gap-2">
              <Clock className="w-3 h-3" /> Timeframe
            </Label>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
              <SelectTrigger id="timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth" className="flex items-center gap-2">
              <Zap className="w-3 h-3" /> Analysis Depth
            </Label>
            <Select value={depth} onValueChange={(v) => setDepth(v as AnalysisDepth)}>
              <SelectTrigger id="depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick Scan (30s)</SelectItem>
                <SelectItem value="normal">Standard (2m)</SelectItem>
                <SelectItem value="deep">Deep Audit (5m)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 bg-primary hover:bg-primary/90"
          disabled={isLoading || !address}
        >
          {isLoading ? 'Analyzing...' : 'Start Analysis'}
        </Button>
      </form>
    </div>
  );
}