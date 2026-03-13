'use client';

import { TokenMeta } from '@/types/token';
import { SafetyScoreBadge } from '../Sentinel/SafetyScoreBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  ExternalLink, 
  Shield, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TokenHeaderProps {
  meta: TokenMeta;
  safetyScore?: number;
  onAddToWatchlist: () => void;
  isWatchlisted?: boolean;
}

export function TokenHeader({ 
  meta, 
  safetyScore, 
  onAddToWatchlist,
  isWatchlisted = false 
}: TokenHeaderProps) {
  const isPositive = (meta.change24h || 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Chain */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Tokens</Link>
        <span>/</span>
        <span className="capitalize">{meta.chain}</span>
        <span>/</span>
        <span className="font-mono text-xs">{meta.address.slice(0, 6)}...{meta.address.slice(-4)}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
            {meta.symbol[0]}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{meta.name}</h1>
              <span className="text-xl text-muted-foreground">{meta.symbol}</span>
              {meta.verified ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Shield className="w-3 h-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <ShieldAlert className="w-3 h-3 mr-1" /> Unverified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="font-mono text-lg font-bold">${meta.priceUsd?.toFixed(2)}</span>
              <span className={cn(
                "flex items-center gap-1 font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{meta.change24h?.toFixed(2)}%
              </span>
              <span className="text-muted-foreground">24h</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2">
          {safetyScore !== undefined && (
            <div className="hidden md:block mr-4">
              <SafetyScoreBadge score={safetyScore} size="sm" />
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onAddToWatchlist}
            className={cn(isWatchlisted && "text-yellow-500 border-yellow-500/50")}
          >
            <Star className={cn("w-4 h-4 mr-2", isWatchlisted && "fill-current")} />
            {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/sentinel?token=${meta.address}&chain=${meta.chain}`}>
              <Activity className="w-4 h-4 mr-2" />
              Analyze
            </Link>
          </Button>
          
          <Button size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Trade
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
        <Stat label="Market Cap" value={`$${((meta.marketCapUsd || 0) / 1e9).toFixed(2)}B`} />
        <Stat label="Volume (24h)" value={`$${((meta.volume24h || 0) / 1e9).toFixed(2)}B`} />
        <Stat label="Total Supply" value={`${((parseInt(meta.totalSupply || '0')) / 1e9).toFixed(2)}B ${meta.symbol}`} />
        <Stat label="Safety Score" value={safetyScore ? `${safetyScore}/100` : '—'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold font-mono">{value}</div>
    </div>
  );
}