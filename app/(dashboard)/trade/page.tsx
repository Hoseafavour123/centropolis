'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RightTradePanel } from '@/components/Shared/RightTradePanel';
import { PriceChart } from '@/components/Token/PriceChart';
import { useTokenMeta } from '@/hooks/useTokenMeta';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

function symbolForMint(mint: string): string {
    if (mint === SOL_MINT) return 'SOL';
    if (mint === USDC_MINT) return 'USDC';
    return mint.slice(0, 6) + '…';
}

// ── Inner component (uses useSearchParams — must be in Suspense) ──────────────
function TradePageContent() {
    const params = useSearchParams();
    const chain = params.get('chain') || 'solana';
    const fromAddr = params.get('from') || 'SOL';
    const toAddr = params.get('to') || '';
    const amount = params.get('amount') || '0.1';

    // Resolve "to" symbol for display
    const toSymbol = toAddr === SOL_MINT
        ? 'SOL'
        : toAddr === USDC_MINT
            ? 'USDC'
            : toAddr
                ? ''   // fetched below from meta
                : 'USDC';

    const chartAddress = toAddr || USDC_MINT;

    const { data: tokenMeta, isLoading: metaLoading } = useTokenMeta(
        chain,
        chartAddress,
        { enabled: !!toAddr && toAddr !== SOL_MINT && toAddr !== USDC_MINT }
    );

    const displaySymbol = tokenMeta?.symbol || toSymbol || symbolForMint(toAddr || USDC_MINT);
    const displayName = tokenMeta?.name || displaySymbol;
    const price = tokenMeta?.priceUsd;
    const change = tokenMeta?.change24h;
    const safetyScore = tokenMeta?.safetyScore;
    const isPositive = (change ?? 0) >= 0;

    const [chartRange, setChartRange] = useState<'1d' | '7d' | '30d' | 'all'>('1d');

    return (
        <div className="space-y-4">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Advanced Trade</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Swap via Jupiter · Platform fee: 15%
                    </p>
                </div>
                {toAddr && toAddr !== SOL_MINT && toAddr !== USDC_MINT && (
                    <Link
                        href={`/token/${chain}/${toAddr}`}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View token page
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* Main Trading Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

                {/* ── Left: Token info + Chart ── */}
                <div className="xl:col-span-3 space-y-4">

                    {/* Token Stats Bar */}
                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border bg-card/60">
                        {metaLoading ? (
                            <>
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-16" />
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground">Token</div>
                                    <div className="font-bold text-lg leading-tight">{displaySymbol}</div>
                                    {displayName !== displaySymbol && (
                                        <div className="text-xs text-muted-foreground">{displayName}</div>
                                    )}
                                </div>

                                {price !== undefined && (
                                    <div className="border-l pl-3">
                                        <div className="text-xs text-muted-foreground">Price</div>
                                        <div className="font-mono font-bold">
                                            ${price < 0.001 ? price.toExponential(2) : price.toFixed(price < 1 ? 6 : 2)}
                                        </div>
                                    </div>
                                )}

                                {change !== undefined && (
                                    <div className="border-l pl-3">
                                        <div className="text-xs text-muted-foreground">24h</div>
                                        <div className={cn(
                                            'flex items-center gap-1 font-mono font-semibold text-sm',
                                            isPositive ? 'text-green-500' : 'text-red-400'
                                        )}>
                                            {isPositive
                                                ? <ArrowUpRight className="w-3.5 h-3.5" />
                                                : <ArrowDownRight className="w-3.5 h-3.5" />}
                                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                                        </div>
                                    </div>
                                )}

                                {tokenMeta?.marketCapUsd !== undefined && (
                                    <div className="border-l pl-3">
                                        <div className="text-xs text-muted-foreground">Market Cap</div>
                                        <div className="font-mono text-sm">
                                            ${(tokenMeta.marketCapUsd / 1e6).toFixed(1)}M
                                        </div>
                                    </div>
                                )}

                                {safetyScore !== undefined && (
                                    <div className="border-l pl-3 ml-auto">
                                        <div className="text-xs text-muted-foreground">Safety</div>
                                        <Badge
                                            className={cn(
                                                'flex items-center gap-1 text-xs',
                                                safetyScore > 80 ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : safetyScore > 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            )}
                                            variant="outline"
                                        >
                                            <Shield className="w-3 h-3" />
                                            {safetyScore}/100
                                        </Badge>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Price Chart */}
                    <PriceChart
                        chain={chain}
                        address={chartAddress}
                        range={chartRange}
                        onRangeChange={setChartRange}
                    />

                    {/* Contract address pill */}
                    {toAddr && toAddr !== SOL_MINT && toAddr !== USDC_MINT && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">Contract:</span>
                            <code className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[11px] break-all">
                                {toAddr}
                            </code>
                        </div>
                    )}
                </div>

                {/* ── Right: Trade Panel ── */}
                <div className="xl:col-span-2">
                    <div className="sticky top-24">
                        <RightTradePanel
                            chain={chain}
                            fromToken={fromAddr === SOL_MINT ? 'SOL' : fromAddr === USDC_MINT ? 'USDC' : fromAddr}
                            toToken={displaySymbol}
                            toAddress={toAddr || undefined}
                            amountUsd={amount && parseFloat(amount) > 0 ? amount : '0.1'}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

// ── Page export wraps in Suspense (required for useSearchParams) ───────────────
export default function TradePage() {
    return (
        <Suspense fallback={
            <div className="space-y-4 animate-pulse">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                    <div className="xl:col-span-3 space-y-4">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                    <div className="xl:col-span-2">
                        <Skeleton className="h-[480px] w-full rounded-xl" />
                    </div>
                </div>
            </div>
        }>
            <TradePageContent />
        </Suspense>
    );
}
