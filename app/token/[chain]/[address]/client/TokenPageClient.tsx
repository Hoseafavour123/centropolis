'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenMeta } from '@/types/token';
import { useTokenMeta } from '@/hooks/useTokenMeta';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TokenHeader } from '@/components/Token/TokenHeader';
import { PriceChart } from '@/components/Token/PriceChart';
import { TokenTabs } from '@/components/Token/TokenTabs/TokenTabs';
import { RightTradePanel } from '@/components/Shared/RightTradePanel';
import { Navbar } from '@/components/Shared/Navbar';
import { Sidebar } from '@/components/Shared/Sidebar';
import { Toaster } from '@/components/ui/toast/toaster';
import { useToast } from '@/hooks/use-toast';

interface TokenPageClientProps {
  chain: string;
  address: string;
  initialMeta: TokenMeta | null;
}

export function TokenPageClient({ chain, address, initialMeta }: TokenPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { sendAnalytics } = useAnalytics();
  const [chartRange, setChartRange] = useState<'1d' | '7d' | '30d' | 'all'>('1d');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  // Fetch fresh data client-side
  const { data: meta, isLoading } = useTokenMeta(chain, address);

  // Use initial data while loading
  const displayMeta = meta || initialMeta;

  useEffect(() => {
    sendAnalytics('token_viewed', {
      chain,
      address,
      hasInitialData: !!initialMeta,
    });
  }, [chain, address, initialMeta, sendAnalytics]);

  const handleAddToWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    sendAnalytics('add_to_watchlist', {
      chain,
      address,
      action: isWatchlisted ? 'remove' : 'add',
    });
    
    toast({
      title: isWatchlisted ? 'Removed from Watchlist' : 'Added to Watchlist',
      description: `${displayMeta?.symbol || 'Token'} ${isWatchlisted ? 'removed from' : 'added to'} your watchlist`,
    });
  };

  const handleOpenTrade = () => {
    sendAnalytics('open_trade_from_token', {
      chain,
      address,
      routeId: 'direct',
      provider: 'Jupiter',
    });
    
    router.push(`/trade?chain=${chain}&to=${address}&prefillFrom=token`);
  };

  if (!displayMeta && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading token data...</div>
      </div>
    );
  }

  if (!displayMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Token Not Found</h1>
          <p className="text-muted-foreground">We couldn't find data for this token.</p>
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar />
      <Sidebar />
       */}
      <main className="">
        <div className="container p-4 ">
          <div className="grid grid-cols-1 xl:grid-cols-8 gap-5">
            {/* Left Sidebar - Quick Stats */}
            <div className="xl:col-span-2 space-y-4 hidden xl:block">
              <div className="p-4 rounded-xl bg-card border space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {chain}
                </div>
                <div className="space-y-3">
                  <QuickStat label="Price" value={`$${displayMeta.priceUsd?.toFixed(2)}`} change={displayMeta.change24h} />
                  <QuickStat label="Market Cap" value={`$${((displayMeta.marketCapUsd || 0) / 1e9).toFixed(2)}B`} />
                  <QuickStat label="Volume (24h)" value={`$${((displayMeta.volume24h || 0) / 1e9).toFixed(2)}B`} />
                  <QuickStat label="Safety Score" value={`${displayMeta.safetyScore}/100`} />
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Filters</div>
                  <FilterBadge label="Developer" checked />
                  <FilterBadge label="Whales" checked subtext="100%" />
                  <FilterBadge label="Locked" checked />
                </div>
                
                <button 
                  onClick={handleAddToWatchlist}
                  className="w-full p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isWatchlisted ? '★ Watchlisted' : '☆ Add to Watchlist'}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-6 space-y-6">
              <TokenHeader
                meta={displayMeta}
                safetyScore={displayMeta.safetyScore}
                onAddToWatchlist={handleAddToWatchlist}
                isWatchlisted={isWatchlisted}
              />
              
              <PriceChart
                chain={chain}
                address={address}
                range={chartRange}
                onRangeChange={setChartRange}
              />
              
              <TokenTabs chain={chain} address={address} />
            </div>

            {/* Right Trade Panel */}
            <div className="hidden xl:col-span-3">
              <div className="sticky top-24">
                <RightTradePanel
                  chain={chain}
                  fromToken="USDC"
                  toToken={displayMeta.symbol}
                  amountUsd="1000"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

function QuickStat({ label, value, change }: { label: string; value: string; change?: number }) {
  const isPositive = (change || 0) >= 0;
  
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-semibold font-mono">{value}</span>
        {change !== undefined && (
          <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

function FilterBadge({ label, checked, subtext }: { label: string; checked: boolean; subtext?: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded flex items-center justify-center ${checked ? 'bg-green-500' : 'bg-muted'}`}>
          {checked && '✓'}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
    </div>
  );
}